import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

// Datos de ejemplo para las preguntas frecuentes
const faqData = [
  {
    id: "item-1",
    question: (
      <div className="flex items-center">
        <span>¿Cuáles son los requisitos para poder estudiar una carrera técnica?</span>
      </div>
    ),
    answer: (
      <div className="space-y-2">
        <p>
          Para poder estudiar una carrera técnica en nuestro centro necesitas cumplir con los siguientes requisitos
          básicos:
        </p>
        <ul className="space-y-1">
          <li className="flex items-center">
            <span role="img" aria-label="emoji" className="mr-2">
              ✅
            </span>
            Edad mínima: 14 años cumplidos.
          </li>
          <li className="flex items-center">
            <span role="img" aria-label="emoji" className="mr-2">
              ✅
            </span>
            Noveno grado aprobado.
          </li>
        </ul>
      </div>
    ),
  },
  {
    id: "item-2",
    question: (
      <div className="flex items-center">
        <span>¿Carreras que Ofrece el centro Tecnológico de Jalapa?</span>
      </div>
    ),
    answer: (
      <div className="space-y-2">
        <p className="font-semibold">Turno Diurno</p>
        <ul className="space-y-1">
          <li className="flex items-center">
            <span role="img" aria-label="emoji" className="mr-2">
              💻
            </span>
            Técnico General en Computación.
          </li>
          <li className="flex items-center">
            <span role="img" aria-label="emoji" className="mr-2">
              🏢
            </span>
            Técnico General en Administración.
          </li>
          <li className="flex items-center">
            <span role="img" aria-label="emoji" className="mr-2">
              💰
            </span>
            Técnico General en Contabilidad.
          </li>
          <li className="flex items-center">
            <span role="img" aria-label="emoji" className="mr-2">
              💉
            </span>
            Técnico General en Veterinaria.
          </li>
          <li className="flex items-center">
            <span role="img" aria-label="emoji" className="mr-2">
              🌾
            </span>
            Técnico General en Agropecuaria.
          </li>
        </ul>
        <p className="font-semibold mt-4">Turno Sabatino</p>
        <ul className="space-y-1">
          <li className="flex items-center">
            <span role="img" aria-label="emoji" className="mr-2">
              👩‍🌾
            </span>
            Técnico General en Zootecnia.
          </li>
          <li className="flex items-center">
            <span role="img" aria-label="emoji" className="mr-2">
              🌱
            </span>
            Técnico General en Agronomía.
          </li>
          <li className="flex items-center">
            <span role="img" aria-label="emoji" className="mr-2">
              💧
            </span>
            Técnico General en Riego Agricola.
          </li>
        </ul>
        <p className="font-semibold mt-4">Turno Dominical</p>
        <ul className="space-y-1">
          <li className="flex items-center">
            <span role="img" aria-label="emoji" className="mr-2">
              💻
            </span>
            Técnico General en Computación.
          </li>
          <li className="flex items-center">
            <span role="img" aria-label="emoji" className="mr-2">
              💰
            </span>
            Técnico General en Contabilidad.
          </li>
          <li className="flex items-center">
            <span role="img" aria-label="emoji" className="mr-2">
              👩‍🌾
            </span>
            Técnico General en Zootecnia.
          </li>
          <li className="flex items-center">
            <span role="img" aria-label="emoji" className="mr-2">
              🌱
            </span>
            Técnico General en Agronomia.
          </li>
        </ul>
      </div>
    ),
  },
  {
    id: "item-3",
    question: (
      <div className="flex items-center">
        <span>¿Cuál es el tiempo de duración de las carreras técnicas?</span>
      </div>
    ),
    answer: (
      <div className="space-y-2">
        <p className="font-semibold">Turno Diurno</p>
        <ul className="space-y-1">
          <li className="flex items-center mb-2">
            <span role="img" aria-label="emoji" className="mr-2">
              💻
            </span>
            Los técnicos Generales en Computación, Administración y Contabilidad tienen una duración de 2 semestres la cual equivale a un año de etudio.  
          </li>
          <li className="flex items-center">
            <span role="img" aria-label="emoji" className="mr-2">
              💉
            </span>
            Técnico General en Veterinaria, tiene una duración de 3 semestres, equivalente a 1 año y medio.
          </li>
          <li className="flex items-center">
            <span role="img" aria-label="emoji" className="mr-2">
              🌾
            </span>
            Técnico General en Agropecuaria, tiene una duración de 4 semestres, equivalente a 2 años.
          </li>
        </ul>
        <p className="font-semibold mt-4">Turno Sabatino</p>
        <ul className="space-y-1">
          <li className="flex items-center">
            <span role="img" aria-label="emoji" className="mr-2">
              👩‍🌾
            </span>
            Técnico General en Zootecnia, tiene una duración de 3 semestres, equivalente a 1 año y medio.
          </li>
          <li className="flex items-center">
            <span role="img" aria-label="emoji" className="mr-2">
              🌱
            </span>
            Técnico General en Agronomía, tiene una duración de 4 semestres, equivalente a 2 años.
          </li>
          <li className="flex items-center">
            <span role="img" aria-label="emoji" className="mr-2">
              💧
            </span>
            Técnico General en Riego Agricola, tiene una duración de 2 semestres, equivalente a 1 año.
          </li>
        </ul>
        <p className="font-semibold mt-4">Turno Dominical</p>
        <ul className="space-y-1">
          <li className="flex items-center">
            <span role="img" aria-label="emoji" className="mr-2">
              💻
            </span>
            Técnico General en Computación, tiene una duración de 4 semestres, equivalente a 2 años.
          </li>
          <li className="flex items-center">
            <span role="img" aria-label="emoji" className="mr-2">
              💰
            </span>
            Técnico General en Contabilidad, tiene una duración de 4 semestres, equivalente a 2 años.
          </li>
          <li className="flex items-center">
            <span role="img" aria-label="emoji" className="mr-2">
              👩‍🌾
            </span>
            Técnico General en Zootecnia, tiene una duración de 3 semestres, equivalente a 1 año y medio.
          </li>
          <li className="flex items-center">
            <span role="img" aria-label="emoji" className="mr-2">
              🌱
            </span>
            Técnico General en Agronomia, tiene una duración de 4 semestres, equivalente a 2 años.
          </li>
        </ul>
      </div>
    ),
  },
  {
    id: "item-4",
    question: (
      <div className="flex items-center">
        <span>¿Cuando es el inicio de clases?</span>
      </div>
    ),
    answer: (
      <div className="space-y-2">
        <p>Nuestro calendario académico está estructurado de la siguiente manera:</p>
        <ul className="space-y-1">
          <li className="flex items-center">
            <span role="img" aria-label="emoji" className="mr-2">
              🗓️
            </span>
            Primer semestre: Inicia en febrero
          </li>
          <li className="flex items-center">
            <span role="img" aria-label="emoji" className="mr-2">
              🗓️
            </span>
            Segundo semestre: Inicia en Julio
          </li>
        </ul>
        <p className="text-sm text-muted-foreground mt-2">Las fechas exactas pueden variar ligeramente cada año.</p>
      </div>
    ),
  },
]

const StudentQuestions = () => {
  return (
    <div className="container mx-auto py-12 md:py-16"> 
      <div className="w-full bg-card border mx-auto max-w-6xl rounded-xl">
        <div className="p-4 md:p-6"> 
            <h2 className="text-lg md:text-2xl font-bold mb-4 text-center text-card-foreground">
              Preguntas que te pueden interesar
            </h2>
            <Accordion type="single" collapsible className="w-full text-left md:text-center">
              {faqData.map((item) => (
                <AccordionItem key={item.id} value={item.id} className="text-left md:text-center text-sm md:text-lg">
                  <AccordionTrigger 
                    className="text-left justify-between [&[data-state=open]>svg]:rotate-180"
                  >
                    <div className="flex items-center text-left md:text-center">
                      {item.question.props.children}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-left">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
        </div>
      </div>
    </div>
  )
}

export default StudentQuestions
