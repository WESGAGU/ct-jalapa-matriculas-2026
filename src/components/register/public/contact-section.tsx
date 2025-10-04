import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Phone } from "lucide-react"
import { FaWhatsapp, FaFacebook, FaInstagram } from "react-icons/fa"

export default function ContactSection() {
  return (
    <div className="w-full mx-auto py-4 max-w-6xl">
      <Card className="w-full">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-xl font-bold text-foreground">Contáctenos</CardTitle>
          <p className="text-muted-foreground text-sm mt-1">
            Cual quier consulta puedes contactarnos a nuestras redes sociales y números de teléfono.
          </p>
        </CardHeader>
        <CardContent className="pt-1 pb-4">
          <div className="grid lg:grid-cols-2 gap-4">
            {/* Contact Options */}
            <div className="space-y-2">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="social-media">
                  <AccordionTrigger className="text-left py-2 text-sm lg:text-md">
                    <span>Redes Sociales</span>
                  </AccordionTrigger>
                  <AccordionContent className="pt-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Button
                        variant="outline"
                        className="h-auto p-3 justify-center gap-3 bg-background hover:bg-muted/50"
                        asChild
                      >
                        <a href="https://www.facebook.com/CTJalapa" target="_blank" rel="noopener noreferrer">
                          <FaFacebook className="h-5 w-5 text-blue-600" />
                          <span className="text-foreground">Centro Tecnológico</span>
                        </a>
                      </Button>
                      <Button
                        variant="outline"
                        className="h-auto p-3 justify-center gap-3 bg-background hover:bg-muted/50"
                        asChild
                      >
                        <a href="https://www.instagram.com/centrotecjalapa?utm_source=ig_web_button_share_sheet&igsh=MTB0dnBubG5lcXlzbQ==" target="_blank" rel="noopener noreferrer">
                          <FaInstagram className="h-5 w-5 text-pink-600" />
                          <span className="text-foreground">@centrotecjalapa</span>
                        </a>
                      </Button>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="phone-numbers">
                  <AccordionTrigger className="text-left py-2 text-sm lg:text-md">
                    <span>Llamar a los Números de Teléfono</span>
                  </AccordionTrigger>
                  <AccordionContent className="pt-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Button
                        variant="outline"
                        className="h-auto p-3 justify-center gap-3 bg-background hover:bg-muted/50"
                        asChild
                      >
                        <a href="tel:82389200">
                          <Phone className="h-5 w-5 text-green-600" />
                          <span className="text-foreground">2732-0000</span>
                        </a>
                      </Button>
                      <Button
                        variant="outline"
                        className="h-auto p-3 justify-center gap-3 bg-background hover:bg-muted/50"
                        asChild
                      >
                        <a href="tel:86153807">
                          <Phone className="h-5 w-5 text-green-600" />
                          <span className="text-foreground">8888-0000</span>
                        </a>
                      </Button>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="whatsapp">
                  <AccordionTrigger className="text-left py-2 text-sm lg:text-md">
                    <span>Chat por WhatsApp</span>
                  </AccordionTrigger>
                  <AccordionContent className="pt-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Button
                        variant="outline"
                        className="h-auto p-3 justify-center gap-3 bg-background hover:bg-muted/50"
                        asChild
                      >
                        <a href="https://wa.me/50587043761" target="_blank" rel="noopener noreferrer">
                          <FaWhatsapp className="h-5 w-5 text-green-500" />
                          <span className="text-foreground">87043761</span>
                        </a>
                      </Button>
                      <Button
                        variant="outline"
                        className="h-auto p-3 justify-center gap-3 bg-background hover:bg-muted/50"
                        asChild
                      >
                        <a href="https://wa.me/50584433992" target="_blank" rel="noopener noreferrer">
                          <FaWhatsapp className="h-5 w-5 text-green-500" />
                          <span className="text-foreground">84433992</span>
                        </a>
                      </Button>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>

            {/* Google Maps */}
            <div className="space-y-2">
              <h3 className="text-sm lg:text-md font-semibold text-foreground">Nuestra Ubicación</h3>
              <div className="rounded-lg overflow-hidden border">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3872.249857409935!2d-86.10622022322727!3d13.943723092817807!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8f6ddccf90000001%3A0x655a089a46b62488!2sCentro%20Tecnol%C3%B3gico%20de%20Jalapa%2C%20Nueva%20Segovia.!5e0!3m2!1sen!2sni!4v1758936936748!5m2!1sen!2sni"
                  width="100%"
                  height="150"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
