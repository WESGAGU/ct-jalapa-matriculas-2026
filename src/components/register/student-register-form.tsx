"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FieldErrors } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";
import type { Register, User } from "@/lib/types";
import {
  addEnrollment,
  updateEnrollment as updateEnrollmentAction,
  getCareers,
} from "@/lib/actions";
import { useState, useRef, useEffect, useMemo } from "react";
import { 
  CalendarIcon, 
  Loader2, 
  RefreshCw, 
  X, 
  Check, 
  ArrowRight, 
  ArrowLeft,
  User as UserIcon,
  GraduationCap,  
  Phone,          
  FileText        
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, isBefore, subYears } from "date-fns";
import { es } from "date-fns/locale";
import type SignatureCanvas from "react-signature-canvas";
import { ImageDropzone } from "../ui/image-dropzone";
import dynamic from "next/dynamic";
import { Career, Register as PrismaRegister } from "@prisma/client";
import {
  FaRegAddressCard,
  FaRegCreditCard,
  FaFileAlt,
  FaWhatsapp,
} from "react-icons/fa";
import { FcDiploma1 } from "react-icons/fc";
import Swal from "sweetalert2";
import { useOnlineStatus } from "@/components/connection-status";

const SignaturePad = dynamic(() => import("react-signature-canvas"), {
  ssr: false,
});

// --- FUNCIÓN DE COMPRESIÓN INTELIGENTE ---
// Reemplaza a la antigua fileToDataUri
const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    // 1. Si pesa menos de 1MB, devolvemos la imagen original sin tocarla.
    if (file.size < 1024 * 1024) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      return;
    }

    // 2. Si es mayor a 1MB, procedemos a redimensionar y comprimir
    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        // Redimensionar a Full HD (1920px) máximo para reducir dimensiones físicas
        const MAX_DIMENSION = 1920; 

        if (width > height) {
          if (width > MAX_DIMENSION) {
            height *= MAX_DIMENSION / width;
            width = MAX_DIMENSION;
          }
        } else {
          if (height > MAX_DIMENSION) {
            width *= MAX_DIMENSION / height;
            height = MAX_DIMENSION;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);

        // 3. Compresión iterativa buscando llegar a ~500KB
        let quality = 0.7; // Calidad inicial 70%
        let dataUrl = canvas.toDataURL("image/jpeg", quality);
        const targetSize = 500 * 1024; // 500KB

        // Si sigue siendo muy pesado, bajamos calidad progresivamente
        while (dataUrl.length * 0.75 > targetSize && quality > 0.2) {
             quality -= 0.1;
             dataUrl = canvas.toDataURL("image/jpeg", quality);
        }

        resolve(dataUrl);
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
};

const municipios = [
  "Jalapa",
  "Murra",
  "El Jicaro",
  "Ocotal",
  "Quilalí",
  "Dipilto",
  "Ciudad Antigua",
  "Macuelizo",
  "Mozonte",
  "San Fernando",
  "Wiwilí NS",
  "Santa María",
  "Otro",
];

const estadosCiviles = ["Soltero/a", "Casado/a", "Divorciado/a"];

const isAtLeast14YearsOld = (birthDate: Date): boolean => {
  const today = new Date();
  const minDate = subYears(today, 14);
  return isBefore(birthDate, minDate);
};

// =================================================================
// 1. ESQUEMA ZOD
// =================================================================
const formSchema = z
  .object({
    // Section I
    nombres: z.string().min(1, "El nombre es obligatorio."),
    apellidos: z.string().min(1, "Los apellidos son obligatorios."),
    birthDate: z.date({
      required_error: "La fecha de nacimiento es obligatoria.",
    }),
    gender: z.enum(["masculino", "femenino"], {
      required_error: "Debe seleccionar el sexo.",
    }),
    estadoCivil: z.string().min(1, "El estado civil es obligatorio."),
    cedula: z.string().optional(),
    municipioNacimiento: z
      .string()
      .min(1, "El municipio de nacimiento es obligatorio."),
    otroMunicipioNacimiento: z.string().optional(),
    deptoDomiciliar: z.string().min(1, "El departamento es obligatorio."),
    otroDeptoDomiciliar: z.string().optional(),
    municipioDomiciliar: z.string().min(1, "El municipio es obligatorio."),
    otroMunicipioDomiciliar: z.string().optional(),
    comunidad: z.string().min(1, "La comunidad es obligatoria."),
    direccion: z.string().min(1, "La dirección es obligatoria."),
    numPersonasHogar: z.coerce
      .number()
      .min(1, "El número de personas debe ser al menos 1."),
    telefonoCelular: z.string().min(1, "El teléfono es obligatorio."),
    email: z
      .string()
      .email("El correo no es válido.")
      .optional()
      .or(z.literal("")),
    nivelAcademico: z.string().min(1, "El nivel académico es obligatorio."),

    // Section II
    carreraTecnica: z.string({
      required_error: "Debe seleccionar una carrera.",
    }),

    // Section III
    nombreEmergencia: z
      .string()
      .min(1, "El nombre de contacto de emergencia es obligatorio."),
    parentescoEmergencia: z.string().min(1, "El parentesco es obligatorio."),
    telefonoEmergencia: z
      .string()
      .min(1, "El teléfono de emergencia es obligatorio."),
    direccionParentesco: z.string().optional(),

    // Controles de flujo
    hasCedula: z.enum(["si", "no"]).default("si"),
    finishedBachillerato: z.enum(["si", "no"]).default("si"),

    // Documents
    cedulaFileFrente: z
      .union([z.instanceof(File), z.string(), z.null()])
      .optional(),
    cedulaFileReverso: z
      .union([z.instanceof(File), z.string(), z.null()])
      .optional(),
    diplomaFile: z.union([z.instanceof(File), z.string(), z.null()]).optional(),
    birthCertificateFile: z
      .union([z.instanceof(File), z.string(), z.null()])
      .optional(),
    gradesCertificateFile: z
      .union([z.instanceof(File), z.string(), z.null()])
      .optional(),

    // Signature
    firmaProtagonista: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    // --- LÓGICA "OTRO" ---
    if (data.municipioNacimiento === "Otro" && !data.otroMunicipioNacimiento) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["otroMunicipioNacimiento"],
        message: "Debe especificar el municipio de nacimiento.",
      });
    }
    if (data.deptoDomiciliar === "Otro" && !data.otroDeptoDomiciliar) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["otroDeptoDomiciliar"],
        message: "Debe especificar el departamento domiciliar.",
      });
    }
    if (data.municipioDomiciliar === "Otro" && !data.otroMunicipioDomiciliar) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["otroMunicipioDomiciliar"],
        message: "Debe especificar el municipio domiciliar.",
      });
    }

    // --- LÓGICA EXISTENTE ---
    const isEditMode = "id" in data && !!(data as { id?: string }).id;
    const hasCedula = data.hasCedula === "si";
    
    if (data.birthDate && !isAtLeast14YearsOld(data.birthDate)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["birthDate"],
        message: "Debe tener al menos 14 años para matricularse.",
      });
      if (data.carreraTecnica) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["carreraTecnica"],
          message: "Debe tener al menos 14 años para seleccionar una carrera.",
        });
      }
    }

    if (!isEditMode) {
      if (hasCedula) {
        if (!data.cedulaFileFrente) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["cedulaFileFrente"],
            message: "La imagen frontal de la cédula es obligatoria.",
          });
        }
        if (!data.cedulaFileReverso) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["cedulaFileReverso"],
            message: "La imagen trasera de la cédula es obligatoria.",
          });
        }
      } else {
        if (!data.birthCertificateFile) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["birthCertificateFile"],
            message:
              "La partida de nacimiento es obligatoria cuando no hay cédula.",
          });
        }
      }
    }
  });

type RegisterFormValues = z.infer<typeof formSchema>;

// --- CONFIGURACIÓN DE PASOS ---
const steps = [
  {
    id: "personal",
    title: "Datos Personales",
    icon: UserIcon, 
    fields: [
      "nombres", "apellidos", "birthDate", "gender", "estadoCivil", "cedula",
      "municipioNacimiento", "otroMunicipioNacimiento", "deptoDomiciliar", 
      "otroDeptoDomiciliar", "municipioDomiciliar", "otroMunicipioDomiciliar",
      "comunidad", "direccion", "numPersonasHogar", "telefonoCelular", 
      "email", "nivelAcademico"
    ] as const
  },
  {
    id: "career",
    title: "Carrera Técnica",
    icon: GraduationCap, 
    fields: ["carreraTecnica"] as const
  },
  {
    id: "emergency",
    title: "En caso de Emergencia",
    icon: Phone, 
    fields: ["nombreEmergencia", "parentescoEmergencia", "telefonoEmergencia", "direccionParentesco"] as const
  },
  {
    id: "documents",
    title: "Documentos",
    icon: FileText, 
    fields: ["hasCedula", "finishedBachillerato", "cedulaFileFrente", "cedulaFileReverso", "birthCertificateFile", "diplomaFile", "gradesCertificateFile", "firmaProtagonista"] as const
  }
];

interface RegisterFormProps {
  enrollment?: Register | PrismaRegister;
  user?: User;
}

function getErrorMessage(error: unknown): {
  userMessage: string;
  field?: keyof RegisterFormValues;
} {
  if (!(error instanceof Error)) {
    return {
      userMessage: "Error desconocido. Por favor, intente nuevamente.",
    };
  }
  const message = error.message.toLowerCase();
  if (
    message.includes("cédula") ||
    message.includes("cedula") ||
    message.includes("ya está registrada")
  ) {
    return {
      userMessage:
        "La cédula ingresada ya está registrada en el sistema. Verifique el número o contacte al administrador.",
      field: "cedula",
    };
  }
  if (
    message.includes("correo") ||
    message.includes("email") ||
    message.includes("ya está registrado")
  ) {
    return {
      userMessage:
        "El correo electrónico ya está registrado en el sistema. Utilice otro correo o contacte al administrador.",
      field: "email",
    };
  }
  if (
    message.includes("cloudinary") ||
    message.includes("upload") ||
    message.includes("imagen") ||
    message.includes("documentos")
  ) {
    return {
      userMessage:
        "Error al subir los documentos. Verifique que los archivos sean imágenes válidas y no muy pesadas.",
    };
  }
  if (
    message.includes("network") ||
    message.includes("conexión") ||
    message.includes("conexion") ||
    message.includes("fetch") ||
    message.includes("conexión")
  ) {
    return {
      userMessage:
        "Error de conexión. Verifique su conexión a internet e intente nuevamente.",
    };
  }
  if (
    message.includes("validación") ||
    message.includes("validacion") ||
    message.includes("validation") ||
    message.includes("inválidos")
  ) {
    return {
      userMessage:
        "Datos del formulario inválidos. Por favor, revise todos los campos obligatorios.",
    };
  }
  if (
    message.includes("carrera") ||
    message.includes("career") ||
    message.includes("referencia")
  ) {
    return {
      userMessage:
        "Error con la carrera seleccionada. Por favor, seleccione una carrera válida.",
      field: "carreraTecnica",
    };
  }
  return {
    userMessage:
      error.message ||
      "Ocurrió un error inesperado. Por favor, intente nuevamente o contacte al administrador.",
  };
}

export default function StudentRegisterForm({
  enrollment,
  user,
}: RegisterFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [careers, setCareers] = useState<Career[]>([]);
  const [isUnderage, setIsUnderage] = useState(false);
  const [hasBirthDate, setHasBirthDate] = useState(false);
  const [showWhatsAppButton, setShowWhatsAppButton] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  
  const [currentStep, setCurrentStep] = useState(0);
  const formTopRef = useRef<HTMLDivElement>(null);
  
  const isOnline = useOnlineStatus();

  useEffect(() => {
    async function fetchCareers() {
      const careerData = await getCareers();
      setCareers(careerData);
    }
    fetchCareers();
  }, []);

  const sigCanvas = useRef<SignatureCanvas>(null);
  const isEditMode = !!enrollment;
  const signatureColor = "black";

  const emptyDefaults: Partial<RegisterFormValues> = useMemo(
    () => ({
      nombres: "",
      apellidos: "",
      birthDate: undefined,
      gender: "masculino",
      estadoCivil: "",
      cedula: "",
      municipioNacimiento: municipios[0] || "",
      otroMunicipioNacimiento: "",
      deptoDomiciliar: "Nueva Segovia",
      otroDeptoDomiciliar: "",
      municipioDomiciliar: municipios[0] || "",
      otroMunicipioDomiciliar: "",
      comunidad: "",
      direccion: "",
      numPersonasHogar: 1,
      telefonoCelular: "",
      email: "",
      nivelAcademico: "Noveno",
      carreraTecnica: "",
      nombreEmergencia: "",
      parentescoEmergencia: "",
      telefonoEmergencia: "",
      direccionParentesco: "",
      hasCedula: "si",
      finishedBachillerato: "si",
      cedulaFileFrente: undefined,
      cedulaFileReverso: undefined,
      birthCertificateFile: undefined,
      diplomaFile: undefined,
      gradesCertificateFile: undefined,
      firmaProtagonista: undefined,
    }),
    []
  );

  const computedDefaults = useMemo<Partial<RegisterFormValues>>(() => {
    if (!enrollment) return emptyDefaults;

    const date =
      enrollment.birthDate && typeof enrollment.birthDate === "string"
        ? new Date(enrollment.birthDate)
        : (enrollment.birthDate as Date);

    if (date) {
      setIsUnderage(!isAtLeast14YearsOld(date));
      setHasBirthDate(true);
    }

    const deptoDomiciliarOptions = ["Nueva Segovia", "Otro"];

    const isOtroMunicipioNac =
      enrollment.municipioNacimiento &&
      !municipios.includes(enrollment.municipioNacimiento);

    const isOtroDeptoDom =
      enrollment.deptoDomiciliar &&
      !deptoDomiciliarOptions.includes(enrollment.deptoDomiciliar);

    const isOtroMunicipioDom =
      enrollment.municipioDomiciliar &&
      !municipios.includes(enrollment.municipioDomiciliar);

    return {
      ...emptyDefaults,
      nombres: enrollment.nombres ?? "",
      apellidos: enrollment.apellidos ?? "",
      birthDate: date ?? undefined,
      gender: (enrollment.gender as "masculino" | "femenino") ?? "masculino",
      estadoCivil: enrollment.estadoCivil ?? "",
      cedula: enrollment.cedula ?? "",
      municipioNacimiento: isOtroMunicipioNac
        ? "Otro"
        : enrollment.municipioNacimiento ?? municipios[0],
      otroMunicipioNacimiento: isOtroMunicipioNac
        ? enrollment.municipioNacimiento
        : "",
      deptoDomiciliar: isOtroDeptoDom
        ? "Otro"
        : enrollment.deptoDomiciliar ?? "Nueva Segovia",
      otroDeptoDomiciliar: isOtroDeptoDom ? enrollment.deptoDomiciliar : "",
      municipioDomiciliar: isOtroMunicipioDom
        ? "Otro"
        : enrollment.municipioDomiciliar ?? municipios[0],
      otroMunicipioDomiciliar: isOtroMunicipioDom
        ? enrollment.municipioDomiciliar
        : "",
      comunidad: enrollment.comunidad ?? "",
      direccion: enrollment.direccion ?? "",
      numPersonasHogar: enrollment.numPersonasHogar ?? 1,
      telefonoCelular: enrollment.telefonoCelular ?? "",
      email: enrollment.email ?? "",
      nivelAcademico: enrollment.nivelAcademico ?? "Noveno",
      carreraTecnica: enrollment.carreraTecnica ?? "",
      nombreEmergencia: enrollment.nombreEmergencia ?? "",
      parentescoEmergencia: enrollment.parentescoEmergencia ?? "",
      telefonoEmergencia: enrollment.telefonoEmergencia ?? "",
      direccionParentesco: (enrollment as Register).direccionParentesco ?? "",
      cedulaFileFrente: enrollment.cedulaFileFrente ?? undefined,
      cedulaFileReverso: enrollment.cedulaFileReverso ?? undefined,
      birthCertificateFile:
        (enrollment as Register).birthCertificateFile ?? undefined,
      diplomaFile: enrollment.diplomaFile ?? undefined,
      gradesCertificateFile:
        (enrollment as Register).gradesCertificateFile ?? undefined,
      hasCedula: enrollment.cedulaFileFrente || enrollment.cedula ? "si" : "no",
      finishedBachillerato: enrollment.diplomaFile ? "si" : "no",
    };
  }, [enrollment, emptyDefaults]);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: computedDefaults,
    mode: "onChange",
  });

  useEffect(() => {
    form.reset(computedDefaults);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [computedDefaults]);

  const { watch, setValue, trigger } = form;

  const hasCedulaSelected = watch("hasCedula") === "si";
  const finishedBachSelected = watch("finishedBachillerato") === "si";
  const birthDateValue = watch("birthDate");
  const carreraValue = watch("carreraTecnica");

  const formatCedula = (value: string) => {
    if (!value) return "";
    const cleaned = value.replace(/[^0-9A-Z]/gi, "").toUpperCase();
    const parts = [];
    if (cleaned.length > 0) {
      parts.push(cleaned.substring(0, 3));
    }
    if (cleaned.length > 3) {
      parts.push(cleaned.substring(3, 9));
    }
    if (cleaned.length > 9) {
      parts.push(cleaned.substring(9, 14));
    }
    return parts.join("-");
  };

  const capitalizeWords = (value: string) => {
    if (!value) return "";
    return value
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  useEffect(() => {
    if (birthDateValue) {
      const underage = !isAtLeast14YearsOld(birthDateValue);
      setIsUnderage(underage);
      setHasBirthDate(true);
      if (underage && carreraValue) {
        setValue("carreraTecnica", "");
        toast({
          variant: "destructive",
          title: "Edad insuficiente",
          description:
            "Debe tener al menos 14 años para seleccionar una carrera.",
        });
      }
    } else {
      setIsUnderage(false);
      setHasBirthDate(false);
    }
  }, [birthDateValue, setValue, carreraValue, toast]);

  const clearSignature = () => {
    sigCanvas.current?.clear();
  };

  const onInvalid = (errors: FieldErrors<RegisterFormValues>) => {
    console.log(errors);
    toast({
      variant: "destructive",
      title: "Error de Validación",
      description:
        "Por favor, revise los campos marcados en rojo antes de enviar.",
    });
  };

  const openWhatsAppContact = () => {
    const phoneNumber = "50584433992";
    const defaultMessage = `Hola, necesito ayuda con el formulario de matrícula.`;
    const errorDetails = lastError ? `\n\nError encontrado: ${lastError}` : "";
    const userInfo = form.getValues();
    const userDetails = `\n\nDatos del formulario:
    - Nombre: ${userInfo.nombres} ${userInfo.apellidos}
    - Teléfono: ${userInfo.telefonoCelular}
    ${userInfo.email ? `- Email: ${userInfo.email}` : ""}
    ${userInfo.cedula ? `- Cédula: ${userInfo.cedula}` : ""}`;
    const fullMessage = `${defaultMessage}${errorDetails}${userDetails}`;
    const encodedMessage = encodeURIComponent(fullMessage);
    window.open(
      `https://wa.me/${phoneNumber}?text=${encodedMessage}`,
      "_blank"
    );
  };

  // --- LÓGICA DE SCROLL MEJORADA (OFFSET MANUAL) ---
  const scrollToFormTop = () => {
    setTimeout(() => {
      if (formTopRef.current) {
        // Calculamos la posición del elemento
        const elementPosition = formTopRef.current.getBoundingClientRect().top;
        // Sumamos el scroll actual
        const offsetPosition = elementPosition + window.scrollY - 180; // 180px de margen superior para ver el botón cerrar

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth"
        });
      }
    }, 100);
  };

  const nextStep = async () => {
    const fields = steps[currentStep].fields;
   
    const isStepValid = await trigger(fields);

    if (isStepValid) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
      scrollToFormTop(); 
    } else {
        toast({
            variant: "destructive",
            title: "Faltan datos",
            description: "Por favor complete los campos requeridos para avanzar.",
        });
        scrollToFormTop();
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
    scrollToFormTop();
  };

  async function onSubmit(data: RegisterFormValues) {
    if (isSubmitting) {
      return;
    }
    
    if (!isOnline) {
      Swal.fire({
          title: "¡Sin Conexión a Internet!",
          text: "No puedes enviar el formulario mientras estés desconectado. Por favor, verifica tu conexión e intenta de nuevo.",
          icon: "warning",
          confirmButtonColor: "#f59e0b",
          confirmButtonText: "Entendido",
      });
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(true);
    setLastError(null);
    setShowWhatsAppButton(false);
    form.clearErrors();

    if (data.municipioNacimiento === "Otro") {
      data.municipioNacimiento = data.otroMunicipioNacimiento || "";
    }
    if (data.deptoDomiciliar === "Otro") {
      data.deptoDomiciliar = data.otroDeptoDomiciliar || "";
    }
    if (data.municipioDomiciliar === "Otro") {
      data.municipioDomiciliar = data.otroMunicipioDomiciliar || "";
    }

    const {
      hasCedula,
      finishedBachillerato,
      otroMunicipioNacimiento,
      otroDeptoDomiciliar,
      otroMunicipioDomiciliar,
      ...rest
    } = data;

    // =======================================================
    // AQUÍ SE APLICA LA COMPRESIÓN EN EL MOMENTO DEL ENVÍO
    // =======================================================
    const [
      cedulaFrente,
      cedulaReverso,
      diploma,
      birthCertificate,
      gradesCertificate,
    ] = await Promise.all([
      rest.cedulaFileFrente instanceof File
        ? compressImage(rest.cedulaFileFrente) // Usar compressImage
        : (enrollment as Register)?.cedulaFileFrente,
      rest.cedulaFileReverso instanceof File
        ? compressImage(rest.cedulaFileReverso) // Usar compressImage
        : (enrollment as Register)?.cedulaFileReverso,
      rest.diplomaFile instanceof File
        ? compressImage(rest.diplomaFile) // Usar compressImage
        : (enrollment as Register)?.diplomaFile,
      rest.birthCertificateFile instanceof File
        ? compressImage(rest.birthCertificateFile) // Usar compressImage
        : (enrollment as Register)?.birthCertificateFile,
      rest.gradesCertificateFile instanceof File
        ? compressImage(rest.gradesCertificateFile) // Usar compressImage
        : (enrollment as Register)?.gradesCertificateFile,
    ]);

    const enrollmentData: Register = {
      id: isEditMode && enrollment ? enrollment.id : crypto.randomUUID(),
      ...rest,
      birthDate: rest.birthDate as Date,
      cedula:
        typeof rest.cedula === "string"
          ? rest.cedula.trim() || undefined
          : undefined,
      email:
        typeof rest.email === "string"
          ? rest.email.trim() || undefined
          : undefined,
      numPersonasHogar: Number(rest.numPersonasHogar),
      createdAt:
        isEditMode && enrollment ? new Date(enrollment.createdAt) : new Date(),
      updatedAt: new Date(),
      cedulaFileFrente: hasCedula === "si" ? cedulaFrente : undefined,
      cedulaFileReverso: hasCedula === "si" ? cedulaReverso : undefined,
      birthCertificateFile: hasCedula === "no" ? birthCertificate : undefined,
      diplomaFile: finishedBachillerato === "si" ? diploma : undefined,
      gradesCertificateFile:
        finishedBachillerato === "no" ? gradesCertificate : undefined,
      firmaProtagonista: sigCanvas.current?.isEmpty()
        ? (enrollment as Register)?.firmaProtagonista
        : sigCanvas.current?.toDataURL("image/png"),
      userId: enrollment
        ? (enrollment as PrismaRegister).userId
        : user?.id || null,
      user: enrollment
        ? (enrollment as Register).user
        : { name: user?.name || null },
    };

    if (!isUnderage) {
      if (
        !enrollmentData.carreraTecnica ||
        String(enrollmentData.carreraTecnica).trim() === ""
      ) {
        form.setError("carreraTecnica", {
          type: "manual",
          message: "Debe seleccionar una carrera técnica.",
        });
        toast({
          variant: "destructive",
          title: "Falta seleccionar carrera",
          description:
            "Por favor seleccione la carrera técnica que desea estudiar.",
        });
        setIsSubmitting(false);
        return;
      }
    }

    try {
      let result;
      if (isEditMode && enrollment) {
        result = await updateEnrollmentAction(
          enrollmentData.id,
          enrollmentData
        );
      } else {
        result = await addEnrollment(enrollmentData, user?.id);
      }

      if (!result.success) {
        throw new Error(result.error || "Error desconocido del servidor");
      }

      Swal.fire({
        title: isEditMode ? "¡Matrícula Actualizada!" : "¡Matrícula Exitosa!",
        text: isEditMode
          ? `El registro de ${enrollmentData.nombres} ha sido actualizado.`
          : `Tu registro para ${enrollmentData.carreraTecnica} ha sido enviado correctamente.`,
        icon: "success",
        confirmButtonColor: "#3085d6",
        confirmButtonText: "Entendido",
      });

      if (!isEditMode) {
        form.reset(emptyDefaults);
        clearSignature();
        setCurrentStep(0); 
        scrollToFormTop();
      }
    } catch (error: unknown) {
      console.error("Form submission error:", error);
      const { userMessage, field } = getErrorMessage(error);
      setLastError(userMessage);
      setShowWhatsAppButton(true);

      Swal.fire({
        title: "Error en el Envío",
        html: `
          <div class="text-left">
            <p class="mb-3">${userMessage}</p>
            <p class="text-xs text-gray-500 mt-2">
              Si el problema persiste, contacte al administrador del sistema.
            </p>
          </div>
        `,
        icon: "error",
        confirmButtonColor: "#d33",
        confirmButtonText: "Entendido",
        customClass: {
          popup: "text-left",
        },
      });

      if (field) {
        form.setError(field, {
          type: "manual",
          message: userMessage,
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  const formGridClass = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4";

  const groupedCareers = careers.reduce((acc, career) => {
    const shift = career.shift;
    if (!acc[shift]) {
      acc[shift] = [];
    }
    acc[shift].push(career);
    return acc;
  }, {} as Record<string, Career[]>);

  return (
    <>
      {/* Referencia para el scroll */}
      <div ref={formTopRef} className="mb-8">
        <div className="flex justify-between items-center px-2">
            {steps.map((step, index) => {
                const isActive = index === currentStep;
                const isCompleted = index < currentStep;
                const Icon = step.icon;
                
                return (
                    <div key={step.id} className="flex flex-col items-center relative flex-1 group">
                         <div 
                            className={cn(
                                "w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 z-10 bg-background",
                                isActive 
                                    ? "border-primary bg-primary text-primary-foreground scale-110 shadow-md ring-4 ring-primary/20" 
                                    : isCompleted 
                                        ? "border-primary bg-primary/10 text-primary" 
                                        : "border-muted-foreground/30 text-muted-foreground"
                            )}
                        >
                            {isCompleted ? (
                                <Check className="h-6 w-6" strokeWidth={3} />
                            ) : (
                                <Icon className={cn("h-5 w-5 md:h-6 md:w-6", isActive && "animate-pulse-once")} />
                            )}
                        </div>
                        <span className={cn(
                            "text-[10px] md:text-xs mt-2 font-medium text-center uppercase tracking-wide transition-colors duration-300",
                            isActive ? "text-primary font-bold" : "text-muted-foreground",
                            "hidden md:block" 
                        )}>
                            {step.title}
                        </span>
                        
                        {/* Línea conectora */}
                        {index !== steps.length - 1 && (
                            <div className={cn(
                                "absolute top-5 md:top-6 left-[50%] w-full h-[2px] -z-10 transition-colors duration-500",
                                index < currentStep ? "bg-primary" : "bg-muted"
                            )} />
                        )}
                    </div>
                )
            })}
        </div>
        {/* Título Móvil del Paso Actual */}
        <div className="md:hidden text-center mt-4">
             <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-bold">
                {steps[currentStep].title}
             </span>
        </div>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit, onInvalid)}
          className="space-y-6"
        >
          {/* --- CUERPO DEL FORMULARIO POR PASOS --- */}
          
          {/* PASO 1: DATOS PERSONALES */}
          {currentStep === 0 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-6">
                 <div className={formGridClass}>
                    {/* Nombres */}
                    <FormField
                      control={form.control}
                      name="nombres"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombres</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Nombres del estudiante"
                              {...field}
                              onChange={(e) =>
                                field.onChange(capitalizeWords(e.target.value))
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="apellidos"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Apellidos</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Apellidos del estudiante"
                              {...field}
                              onChange={(e) =>
                                field.onChange(capitalizeWords(e.target.value))
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="birthDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Fecha de Nacimiento</FormLabel>
                          <Popover
                            open={isCalendarOpen}
                            onOpenChange={setIsCalendarOpen}
                          >
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP", { locale: es })
                                  ) : (
                                    <span>Seleccione una fecha</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                date={field.value}
                                setDate={field.onChange}
                                setIsOpen={setIsCalendarOpen}
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="gender"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sexo</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccione el sexo" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="masculino">Masculino</SelectItem>
                              <SelectItem value="femenino">Femenino</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="estadoCivil"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estado Civil</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccione estado civil" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {estadosCiviles.map((estado) => (
                                <SelectItem key={estado} value={estado}>
                                  {estado}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="cedula"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Cédula{" "}
                            <span className="text-muted-foreground text-xs">
                              (Opcional)
                            </span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder=" Número de cédula"
                              {...field}
                              value={field.value || ""}
                              onChange={(e) => {
                                const formatted = formatCedula(e.target.value);
                                field.onChange(formatted);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className={formGridClass}>
                    {/* Municipio Nacimiento */}
                    <FormField
                      control={form.control}
                      name="municipioNacimiento"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Municipio de Nacimiento</FormLabel>
                          {watch("municipioNacimiento") === "Otro" ? (
                            <FormField
                              control={form.control}
                              name="otroMunicipioNacimiento"
                              render={({ field: otroField }) => (
                                <>
                                  <div className="flex items-center space-x-2">
                                    <FormControl>
                                      <Input
                                        placeholder="Escriba el municipio"
                                        {...otroField}
                                        onChange={(e) =>
                                          otroField.onChange(
                                            capitalizeWords(e.target.value)
                                          )
                                        }
                                      />
                                    </FormControl>
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="icon"
                                      onClick={() => {
                                        setValue(
                                          "municipioNacimiento",
                                          municipios[0] || ""
                                        );
                                        setValue("otroMunicipioNacimiento", "");
                                      }}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                  <FormMessage />
                                </>
                              )}
                            />
                          ) : (
                            <>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Seleccione un municipio" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {municipios.map((m) => (
                                    <SelectItem key={m} value={m}>
                                      {m}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </>
                          )}
                        </FormItem>
                      )}
                    />

                    {/* Depto Domiciliar */}
                    <FormField
                      control={form.control}
                      name="deptoDomiciliar"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Departamento Domiciliar</FormLabel>
                          {watch("deptoDomiciliar") === "Otro" ? (
                            <FormField
                              control={form.control}
                              name="otroDeptoDomiciliar"
                              render={({ field: otroField }) => (
                                <>
                                  <div className="flex items-center space-x-2">
                                    <FormControl>
                                      <Input
                                        placeholder="Escriba el departamento"
                                        {...otroField}
                                        onChange={(e) =>
                                          otroField.onChange(
                                            capitalizeWords(e.target.value)
                                          )
                                        }
                                      />
                                    </FormControl>
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="icon"
                                      onClick={() => {
                                        setValue(
                                          "deptoDomiciliar",
                                          "Nueva Segovia"
                                        );
                                        setValue("otroDeptoDomiciliar", "");
                                      }}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                  <FormMessage />
                                </>
                              )}
                            />
                          ) : (
                            <>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Seleccione un departamento" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="Nueva Segovia">
                                    Nueva Segovia
                                  </SelectItem>
                                  <SelectItem value="Otro">Otro</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </>
                          )}
                        </FormItem>
                      )}
                    />

                    {/* Municipio Domiciliar */}
                    <FormField
                      control={form.control}
                      name="municipioDomiciliar"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Municipio Domiciliar</FormLabel>
                          {watch("municipioDomiciliar") === "Otro" ? (
                            <FormField
                              control={form.control}
                              name="otroMunicipioDomiciliar"
                              render={({ field: otroField }) => (
                                <>
                                  <div className="flex items-center space-x-2">
                                    <FormControl>
                                      <Input
                                        placeholder="Escriba el municipio"
                                        {...otroField}
                                        onChange={(e) =>
                                          otroField.onChange(
                                            capitalizeWords(e.target.value)
                                          )
                                        }
                                      />
                                    </FormControl>
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="icon"
                                      onClick={() => {
                                        setValue(
                                          "municipioDomiciliar",
                                          municipios[0] || ""
                                        );
                                        setValue("otroMunicipioDomiciliar", "");
                                      }}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                  <FormMessage />
                                </>
                              )}
                            />
                          ) : (
                            <>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Seleccione un municipio" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {municipios.map((m) => (
                                    <SelectItem key={m} value={m}>
                                      {m}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </>
                          )}
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="comunidad"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Comunidad</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Comunidad o barrio"
                              {...field}
                              autoCapitalize="words"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="direccion"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Dirección</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Dirección exacta"
                              {...field}
                              autoCapitalize="words"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="numPersonasHogar"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nº Personas en Hogar</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="1"
                              placeholder="Ej: 4"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className={formGridClass}>
                    <FormField
                      control={form.control}
                      name="nivelAcademico"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nivel Académico</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Último nivel aprobado" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Noveno">Noveno Grado</SelectItem>
                              <SelectItem value="Decimo">Décimo Grado</SelectItem>
                              <SelectItem value="Undecimo">
                                Undécimo Grado
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="telefonoCelular"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Teléfono Celular</FormLabel>
                          <FormControl>
                            <Input
                              type="tel"
                              placeholder="Ej: 88887777"
                              maxLength={8}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Correo{" "}
                            <span className="text-muted-foreground text-xs">
                              (Opcional)
                            </span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="ejemplo@correo.com"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
            </div>
          )}

          {/* PASO 2: CARRERA TÉCNICA */}
          {currentStep === 1 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                 <div className="grid grid-cols-1 max-w-md mx-auto">
                    <FormField
                      control={form.control}
                      name="carreraTecnica"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-lg">
                            Técnico que desea estudiar <span className="text-red-500">*</span>
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                            disabled={!hasBirthDate || isUnderage}
                          >
                            <FormControl>
                              <SelectTrigger className="h-12 text-lg">
                                <SelectValue placeholder="Seleccione una carrera..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Object.entries(groupedCareers).map(
                                ([shift, careerList]) => (
                                  <SelectGroup key={shift}>
                                    <SelectLabel className="text-base font-bold text-primary">
                                      {shift.charAt(0).toUpperCase() +
                                        shift.slice(1).toLowerCase()}
                                    </SelectLabel>
                                    {careerList.map((career) => (
                                      <SelectItem
                                        key={career.id}
                                        value={career.name}
                                        className="cursor-pointer"
                                      >
                                        {career.name}
                                      </SelectItem>
                                    ))}
                                  </SelectGroup>
                                )
                              )}
                              {careers.length === 0 && (
                                <SelectItem value="loading" disabled>
                                  Cargando carreras...
                                </SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                          {!hasBirthDate && (
                            <FormDescription className="text-amber-600">
                              Primero debe ingresar su fecha de nacimiento en el paso anterior.
                            </FormDescription>
                          )}
                          {hasBirthDate && isUnderage && (
                            <FormDescription className="text-red-500">
                              Debe tener al menos 14 años para seleccionar una
                              carrera.
                            </FormDescription>
                          )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
            </div>
          )}

          {/* PASO 3: EMERGENCIA */}
          {currentStep === 2 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="nombreEmergencia"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombres y Apellidos</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Nombre completo"
                              {...field}
                              onChange={(e) =>
                                field.onChange(capitalizeWords(e.target.value))
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="parentescoEmergencia"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Parentesco</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Ej: Madre, Padre, Tío"
                              {...field}
                              onChange={(e) =>
                                field.onChange(capitalizeWords(e.target.value))
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="telefonoEmergencia"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Teléfono</FormLabel>
                          <FormControl>
                            <Input
                              type="tel"
                              placeholder="Número de contacto"
                              maxLength={8}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="direccionParentesco"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Dirección{" "}
                            <span className="text-muted-foreground text-xs">
                              (Opcional)
                            </span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Dirección del contacto"
                              {...field}
                              autoCapitalize="words"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
            </div>
          )}

          {/* PASO 4: DOCUMENTOS */}
          {currentStep === 3 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="hasCedula"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Documento de Identidad</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleccione..." />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="si">Cédula</SelectItem>
                                <SelectItem value="no">
                                  Partida de Nacimiento
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      {hasCedulaSelected ? (
                        <div className="grid grid-cols-2 gap-2">
                          <FormField
                            control={form.control}
                            name="cedulaFileFrente"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Lado Frontal</FormLabel>
                                <ImageDropzone
                                  field={field}
                                  icon={FaRegAddressCard}
                                  label="Anverso"
                                />
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="cedulaFileReverso"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Lado trasero</FormLabel>
                                <ImageDropzone
                                  field={field}
                                  icon={FaRegCreditCard}
                                  label="Reverso"
                                />
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      ) : (
                        <FormField
                          control={form.control}
                          name="birthCertificateFile"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Partida de Nacimiento</FormLabel>
                              <ImageDropzone
                                field={field}
                                icon={FaFileAlt}
                                label="Partida de Nacimiento"
                              />
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                      <FormDescription>
                        Seleccione el tipo de documento que va a adjuntar.
                        (fotografía)
                      </FormDescription>
                    </div>
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="finishedBachillerato"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>¿Culminó bachillerato? <span className="text-muted-foreground text-xs">
                              (Opcional)
                            </span>
                            </FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleccione..." />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="si">Sí</SelectItem>
                                <SelectItem value="no">No</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      {finishedBachSelected ? (
                        <FormField
                          control={form.control}
                          name="diplomaFile"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Diploma</FormLabel>
                              <ImageDropzone
                                field={field}
                                icon={FcDiploma1}
                                label="Diploma"
                              />
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      ) : (
                        <FormField
                          control={form.control}
                          name="gradesCertificateFile"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Certificado de Notas</FormLabel>
                              <ImageDropzone
                                field={field}
                                icon={FaFileAlt}
                                label="Certificado de Notas"
                              />
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                      <FormDescription>
                        Adjunte su diploma de bachillerato. En caso de no haber
                        culminado la secundaria, adjunte el certificado de notas
                        de 7°, 8° y 9° grado (fotografía).
                      </FormDescription>
                      <FormDescription>
                        Si no cuenta actualmente con su diploma o notas y las recibe hasta finales del año o proximo, los puede entregar después.
                      </FormDescription>
                    </div>
                  </div>

                  <FormItem>
                    <FormLabel>
                      Firma del Estudiante{" "}
                      <span className="text-muted-foreground text-xs">
                        (Opcional)
                      </span>
                    </FormLabel>
                    <div className="relative w-full h-48 rounded-md border border-input">
                      <SignaturePad
                        // @ts-expect-error: 'ref' is not a valid prop for this component.
                        ref={sigCanvas}
                        penColor={signatureColor}
                        canvasProps={{
                          className:
                            "w-full h-full rounded-md bg-white dark:bg-gray-900",
                        }}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute top-1 right-1 dark:text-white"
                        onClick={clearSignature}
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </div>
                    <FormDescription>
                      Dibuja tu firma en el recuadro.
                    </FormDescription>
                  </FormItem>
            </div>
          )}

          {/* --- BOTONES DE NAVEGACIÓN Y ENVÍO (MEJORADO) --- */}
          <div className="flex flex-col-reverse sm:flex-row sm:justify-between gap-4 pt-8 mt-8 border-t">
             {/* Botón Anterior */}
             <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 0 || isSubmitting}
                className={cn("w-full sm:w-auto", currentStep === 0 ? "invisible" : "")}
             >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Anterior
             </Button>

             {/* Botón Siguiente o Enviar */}
             {currentStep < steps.length - 1 ? (
                 <Button type="button" onClick={nextStep} className="w-full sm:w-auto">
                    Siguiente
                    <ArrowRight className="ml-2 h-4 w-4" />
                 </Button>
             ) : (
                 <div className="w-full sm:w-auto">
                    <Button
                      type="submit"
                      className="w-full md:min-w-[150px]"
                      disabled={isSubmitting || isUnderage || !isOnline}
                    >
                      {isSubmitting && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      {!isOnline 
                        ? "Sin conexión" 
                        : isEditMode ? "Actualizar Matrícula" : "Guardar Matrícula"}
                    </Button>
                 </div>
             )}
          </div>
          
          {showWhatsAppButton && (
              <Button
                type="button"
                variant="secondary"
                className="w-full mt-4 bg-green-600 text-white hover:bg-green-700"
                onClick={openWhatsAppContact}
              >
                <FaWhatsapp className="mr-2 h-4 w-4" />
                Contactar soporte
              </Button>
            )}
            
        </form>
      </Form>
    </>
  );
}