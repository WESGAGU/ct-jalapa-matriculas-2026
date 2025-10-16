"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FieldErrors } from "react-hook-form";
import { z } from "zod";
import { useRouter } from "next/navigation";
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
import type { Register, User } from "@/lib/types"; // Importar User
import {
  addEnrollment,
  updateEnrollment as updateEnrollmentAction,
  getCareers,
} from "@/lib/actions";
import { savePendingEnrollment, updatePendingEnrollment } from "@/lib/storage";
import { useState, useRef, useEffect, useMemo } from "react";
import { CalendarIcon, Loader2, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, isBefore, subYears } from "date-fns";
import { es } from "date-fns/locale";
import type SignatureCanvas from "react-signature-canvas";
import { ImageDropzone } from "../ui/image-dropzone";
import Swal from 'sweetalert2';
import dynamic from "next/dynamic";
import { Career, Register as PrismaRegister } from "@prisma/client";
import { FaRegAddressCard, FaRegCreditCard, FaFileAlt } from "react-icons/fa";
import { FcDiploma1 } from "react-icons/fc";

const SignaturePad = dynamic(() => import("react-signature-canvas"), {
  ssr: false,
});

const fileToDataUri = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

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

const estadosCiviles = [
  "Soltero/a",
  "Casado/a",
  "Divorciado/a",
];

// Función para calcular si la persona tiene al menos 14 años
const isAtLeast14YearsOld = (birthDate: Date): boolean => {
  const today = new Date();
  const minDate = subYears(today, 14);
  return isBefore(birthDate, minDate);
};

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
    deptoDomiciliar: z.string().min(1, "El departamento es obligatorio."),
    municipioDomiciliar: z.string().min(1, "El municipio es obligatorio."),
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
    cedulaFileFrente: z.union([z.instanceof(File), z.string()]).optional().nullable(),
    cedulaFileReverso: z.union([z.instanceof(File), z.string()]).optional().nullable(),
    diplomaFile: z.union([z.instanceof(File), z.string()]).optional().nullable(),
    birthCertificateFile: z.union([z.instanceof(File), z.string()]).optional().nullable(),
    gradesCertificateFile: z.union([z.instanceof(File), z.string()]).optional().nullable(),


    // Signature
    firmaProtagonista: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const isEditMode = "id" in data && !!(data as { id?: string }).id;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const hasCedula = data.hasCedula === "si";
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const finished = data.finishedBachillerato === "si";

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

    /*
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
            message: "La partida de nacimiento es obligatoria cuando no hay cédula.",
          });
        }
      }

      
      if (finished) {
        if (!data.diplomaFile) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["diplomaFile"],
            message: "El diploma es obligatorio si culminó bachillerato.",
          });
        }
      } else {
        if (!data.gradesCertificateFile) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["gradesCertificateFile"],
            message: "El certificado de notas es obligatorio si no culminó bachillerato.",
          });
        }
      }
      
    }
    */
  });

type RegisterFormValues = z.infer<typeof formSchema>;

interface RegisterFormProps {
  enrollment?: Register | PrismaRegister;
  user?: User;
}

export default function RegisterForm({ enrollment, user }: RegisterFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [careers, setCareers] = useState<Career[]>([]);
  const [isUnderage, setIsUnderage] = useState(false);
  const [hasBirthDate, setHasBirthDate] = useState(false);

  useEffect(() => {
    async function fetchCareers() {
      const careerData = await getCareers();
      setCareers(careerData);
    }
    fetchCareers();
  }, []);

  const sigCanvas = useRef<SignatureCanvas>(null);
  const isEditMode = !!enrollment;
  const signatureColor = "black"; // <-- ❗ CAMBIO 1: Color de la firma siempre negro

  const emptyDefaults: Partial<RegisterFormValues> = useMemo(() => ({
    nombres: "",
    apellidos: "",
    birthDate: undefined,
    gender: "masculino",
    estadoCivil: "",
    cedula: "",
    municipioNacimiento: municipios[0] || "",
    deptoDomiciliar: "Nueva Segovia",
    municipioDomiciliar: municipios[0] || "",
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
  }), []);

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

    return {
      ...emptyDefaults,
      nombres: enrollment.nombres ?? "",
      apellidos: enrollment.apellidos ?? "",
      birthDate: date ?? undefined,
      gender: (enrollment.gender as "masculino" | "femenino") ?? "masculino",
      estadoCivil: enrollment.estadoCivil ?? "",
      cedula: enrollment.cedula ?? "",
      municipioNacimiento: enrollment.municipioNacimiento ?? municipios[0],
      deptoDomiciliar: enrollment.deptoDomiciliar ?? "Nueva Segovia",
      municipioDomiciliar: enrollment.municipioDomiciliar ?? municipios[0],
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
      birthCertificateFile: (enrollment as Register).birthCertificateFile ?? undefined,
      diplomaFile: enrollment.diplomaFile ?? undefined,
      gradesCertificateFile: (enrollment as Register).gradesCertificateFile ?? undefined,
      hasCedula:
        enrollment.cedulaFileFrente || enrollment.cedula ? "si" : "no",
      finishedBachillerato: enrollment.diplomaFile ? "si" : "no",
    };
  }, [enrollment, emptyDefaults]);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: computedDefaults,
  });

  useEffect(() => {
    form.reset(computedDefaults);
  }, [computedDefaults, form]);

  const { watch, setValue } = form;
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
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
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
          description: "Debe tener al menos 14 años para seleccionar una carrera.",
        });
      }
    } else {
      setIsUnderage(false);
      setHasBirthDate(false);
    }
  }, [birthDateValue, setValue, carreraValue, toast]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsOnline(navigator.onLine);
      const handleOnline = () => setIsOnline(true);
      const handleOffline = () => setIsOnline(false);
      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);
      return () => {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
      };
    }
  }, []);

  const clearSignature = () => {
    sigCanvas.current?.clear();
  };

  const onInvalid = (errors: FieldErrors<RegisterFormValues>) => {
    console.log(errors);
    toast({
      variant: "destructive",
      title: "Error de Validación",
      description: "Por favor, revise los campos obligatorios marcados en rojo.",
    });
  };

  async function onSubmit(data: RegisterFormValues) {
    setIsSubmitting(true);
    form.clearErrors(["cedula", "email", "carreraTecnica"]);

    const { hasCedula, finishedBachillerato, ...rest } = data;

    const [cedulaFrente, cedulaReverso, diploma, birthCertificate, gradesCertificate] = await Promise.all([
      rest.cedulaFileFrente instanceof File ? fileToDataUri(rest.cedulaFileFrente) : (enrollment as Register)?.cedulaFileFrente,
      rest.cedulaFileReverso instanceof File ? fileToDataUri(rest.cedulaFileReverso) : (enrollment as Register)?.cedulaFileReverso,
      rest.diplomaFile instanceof File ? fileToDataUri(rest.diplomaFile) : (enrollment as Register)?.diplomaFile,
      rest.birthCertificateFile instanceof File ? fileToDataUri(rest.birthCertificateFile) : (enrollment as Register)?.birthCertificateFile,
      rest.gradesCertificateFile instanceof File ? fileToDataUri(rest.gradesCertificateFile) : (enrollment as Register)?.gradesCertificateFile,
    ]);

    const enrollmentData: Register = {
      id: isEditMode && enrollment ? enrollment.id : crypto.randomUUID(),
      ...rest,
      birthDate: rest.birthDate as Date,
      cedula: typeof rest.cedula === "string" ? (rest.cedula.trim() || undefined) : undefined,
      email: typeof rest.email === "string" ? (rest.email.trim() || undefined) : undefined,
      numPersonasHogar: Number(rest.numPersonasHogar),
      createdAt: isEditMode && enrollment ? new Date(enrollment.createdAt) : new Date(),
      updatedAt: new Date(),
      cedulaFileFrente: hasCedula === "si" ? cedulaFrente : undefined,
      cedulaFileReverso: hasCedula === "si" ? cedulaReverso : undefined,
      birthCertificateFile: hasCedula === "no" ? birthCertificate : undefined,
      diplomaFile: finishedBachillerato === "si" ? diploma : undefined,
      gradesCertificateFile: finishedBachillerato === "no" ? gradesCertificate : undefined,
      firmaProtagonista: sigCanvas.current?.isEmpty() ? (enrollment as Register)?.firmaProtagonista : sigCanvas.current?.toDataURL("image/png"),
      userId: enrollment ? (enrollment as PrismaRegister).userId : user?.id || null,
      user: enrollment ? (enrollment as Register).user : { name: user?.name || null },
    };

    if (!isUnderage) {
      if (!enrollmentData.carreraTecnica || String(enrollmentData.carreraTecnica).trim() === "") {
        form.setError("carreraTecnica", { type: "manual", message: "Debe seleccionar una carrera técnica." });
        toast({ variant: "destructive", title: "Falta seleccionar carrera", description: "Por favor seleccione la carrera técnica que desea estudiar." });
        setIsSubmitting(false);
        return;
      }
    }

    try {
      if (isOnline) {
        if (isEditMode && enrollment) {
          await updateEnrollmentAction(enrollmentData.id, enrollmentData);
        } else {
          await addEnrollment(enrollmentData, user?.id);
        }
      } else {
        if (isEditMode && enrollment) {
          updatePendingEnrollment(enrollmentData);
        } else {
          savePendingEnrollment(enrollmentData);
        }
      }

      Swal.fire({
        title: isEditMode ? '¡Matrícula Actualizada!' : '¡Matrícula Exitosa!',
        text: isEditMode ? `El registro de ${enrollmentData.nombres} ha sido actualizado.` : `Tu registro para ${enrollmentData.carreraTecnica} ha sido enviado correctamente.`,
        icon: 'success',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'Entendido'
      }).then(() => {
        router.push('/');
        router.refresh();
      });

      if (!isEditMode) {
        form.reset(emptyDefaults);
        clearSignature();
      }

    } catch (error: unknown) {
      console.error("Form submission error:", error);
      const message = error instanceof Error ? error.message : String(error);

      Swal.fire({
        title: 'Error en el Envío',
        text: message || `No se pudo ${isEditMode ? "actualizar" : "guardar"} la matrícula.`,
        icon: 'error',
        confirmButtonColor: '#d33',
        confirmButtonText: 'Intentar de nuevo'
      });

      if (/c[eé]dula/i.test(message)) {
        form.setError("cedula", { type: "manual", message });
      } else if (/correo|email|correo electrónico|correo-electr[oó]nico/i.test(message)) {
        form.setError("email", { type: "manual", message });
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
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit, onInvalid)} className="space-y-4">
          <Accordion
            type="multiple"
            defaultValue={["item-1", "item-2", "item-3", "item-4"]}
            className="w-full"
          >
            <AccordionItem value="item-1">
              <AccordionTrigger className="font-bold text-lg">I. Datos Personales</AccordionTrigger>
              <AccordionContent className="space-y-6 pt-4">
                <div className={formGridClass}>
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
                            onChange={(e) => field.onChange(capitalizeWords(e.target.value))}
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
                            onChange={(e) => field.onChange(capitalizeWords(e.target.value))}
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
                        <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                              >
                                {field.value ? format(field.value, "PPP", { locale: es }) : <span>Seleccione una fecha</span>}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar date={field.value} setDate={field.onChange} setIsOpen={setIsCalendarOpen} />
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
                        <Select onValueChange={field.onChange} value={field.value}>
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
                        <Select onValueChange={field.onChange} value={field.value}>
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
                          Cédula <span className="text-muted-foreground text-xs">(Opcional)</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Número de cédula"
                            {...field}
                            onChange={(e) => field.onChange(formatCedula(e.target.value))}
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
                    name="municipioNacimiento"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Municipio de Nacimiento</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
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
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="deptoDomiciliar"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Departamento Domiciliar</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccione un departamento" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Nueva Segovia">Nueva Segovia</SelectItem>
                            <SelectItem value="Otro">Otro</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="municipioDomiciliar"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Municipio Domiciliar</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
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
                          <Input placeholder="Comunidad o barrio" {...field} autoCapitalize="words" />
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
                          <Input placeholder="Dirección exacta" {...field} autoCapitalize="words" />
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
                          <Input type="number" min="1" placeholder="Ej: 4" {...field} />
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
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Último nivel aprobado" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Noveno">Noveno Grado</SelectItem>
                            <SelectItem value="Decimo">Décimo Grado</SelectItem>
                            <SelectItem value="Undecimo">Undécimo Grado</SelectItem>
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
                          <Input type="tel" placeholder="Ej: 88887777" maxLength={8} {...field} />
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
                          Correo <span className="text-muted-foreground text-xs">(Opcional)</span>
                        </FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="ejemplo@correo.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger className="font-bold text-lg">
                <span className="text-left">
                  II. Carrera Técnica
                  <br className="md:hidden" /> que Desea Estudiar
                </span>
              </AccordionTrigger>
              <AccordionContent className="space-y-6 pt-4">
                <div className="grid grid-cols-1">
                  <FormField
                    control={form.control}
                    name="carreraTecnica"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Técnico <span className="text-red-500">*</span>
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          disabled={!hasBirthDate || isUnderage}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccione una carrera..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(groupedCareers).map(([shift, careerList]) => (
                              <SelectGroup key={shift}>
                                <SelectLabel>
                                  {shift.charAt(0).toUpperCase() + shift.slice(1).toLowerCase()}
                                </SelectLabel>
                                {careerList.map((career) => (
                                  <SelectItem key={career.id} value={career.name}>
                                    {career.name}
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                            ))}
                            {careers.length === 0 && (
                              <SelectItem value="loading" disabled>
                                Cargando carreras...
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>

                        {!hasBirthDate && (
                          <FormDescription className="text-amber-600">
                            Primero debe ingresar su fecha de nacimiento para seleccionar una carrera.
                          </FormDescription>
                        )}
                        {hasBirthDate && isUnderage && (
                          <FormDescription className="text-red-500">
                            Debe tener al menos 14 años para seleccionar una carrera.
                          </FormDescription>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3">
              <AccordionTrigger className="font-bold text-lg">
                <span className="text-left">
                  III. En Caso de Emergencia
                  <br className="md:hidden" /> Notificar A
                </span>
              </AccordionTrigger>
              <AccordionContent className="space-y-6 pt-4">
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
                            onChange={(e) => field.onChange(capitalizeWords(e.target.value))}
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
                            onChange={(e) => field.onChange(capitalizeWords(e.target.value))}
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
                          <Input type="tel" placeholder="Número de contacto" maxLength={8} {...field} />
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
                          Dirección <span className="text-muted-foreground text-xs">(Opcional)</span>
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Dirección del contacto" {...field} autoCapitalize="words" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4">
              <AccordionTrigger className="font-bold text-lg">IV. Documentos y Firma</AccordionTrigger>
              <AccordionContent className="space-y-6 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="hasCedula"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Documento de Identidad</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccione..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="si">Cédula</SelectItem>
                              <SelectItem value="no">Partida de Nacimiento</SelectItem>
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
                              <ImageDropzone field={field} icon={FaRegAddressCard} label="Anverso" />
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
                              <ImageDropzone field={field} icon={FaRegCreditCard} label="Reverso" />
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
                            <ImageDropzone field={field} icon={FaFileAlt} label="Partida de Nacimiento" />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    <FormDescription>Seleccione el tipo de documento que va a adjuntar. (fotografia)</FormDescription>
                  </div>

                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="finishedBachillerato"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>¿Culminó bachillerato?</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
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
                            <ImageDropzone field={field} icon={FcDiploma1} label="Diploma" />
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
                            <ImageDropzone field={field} icon={FaFileAlt} label="Certificado de Notas" />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    <FormDescription>
                      De no haber culminado los estudios de bachillerato, adjunte el certificado de notas del tercer año. En caso de haberlos finalizado, Adjunte su diploma de grado. (fotografia)
                    </FormDescription>
                  </div>
                </div>

                <FormItem>
                  <FormLabel>
                    Firma del Estudiante <span className="text-muted-foreground text-xs">(Opcional)</span>
                  </FormLabel>
                  <div className="relative w-full h-48 rounded-md border border-input">
                    <SignaturePad   // @ts-expect-error: 'ref' is not a valid prop for this component.
                      ref={sigCanvas}
                      penColor={signatureColor}
                      canvasProps={{ className: "w-full h-full rounded-md bg-white dark:bg-gray-900" }} // <-- ❗ CAMBIO 2: Fondo siempre blanco
                    />
                    <Button type="button" variant="ghost" size="icon" className="absolute top-1 right-1 dark:text-white" onClick={clearSignature}>
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                  <FormDescription>Dibuja tu firma en el recuadro.</FormDescription>
                </FormItem>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <p className="text-sm text-muted-foreground">La fecha de registro se guardará automáticamente.</p>

          <div className="flex flex-col sm:flex-row gap-2">
            <Button type="submit" className="w-full" disabled={isSubmitting || isUnderage}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditMode ? "Actualizar Matrícula" : "Guardar Matrícula"}
              {isUnderage && " (Debe tener al menos 14 años)"}
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
}