import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Phone } from "lucide-react"
import { FaWhatsapp, FaFacebook, FaInstagram } from "react-icons/fa"
import { motion } from "framer-motion"

export default function ContactSection() {
  return (
    <div className="w-full mx-auto py-4 max-w-7xl">
      <motion.div
        whileHover={{ y: -8, transition: { duration: 0.3 } }}
        className="h-full"
      >
        <Card className="
          w-full h-full rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300
          bg-white
          dark:bg-slate-900/60 dark:backdrop-blur-lg dark:border dark:border-white/10
        ">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-xl font-bold">Contáctenos</CardTitle>
            <p className="text-muted-foreground text-sm mt-1">
              Cualquier consulta puedes contactarnos a nuestras redes sociales y números de teléfono.
            </p>
          </CardHeader>
          <CardContent className="pt-1 pb-4">
            <div className="grid lg:grid-cols-2 gap-6 p-2">
              {/* Contact Options */}
              <div className="space-y-2">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="social-media" className="border-white/10">
                    <AccordionTrigger className="text-left py-2 text-sm lg:text-md font-semibold hover:no-underline">
                      <span>Redes Sociales</span>
                    </AccordionTrigger>
                    <AccordionContent className="pt-2">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <Button asChild variant="outline" className="h-auto p-3 justify-center gap-3 bg-background hover:bg-muted/50">
                              <a href="https://www.facebook.com/CTJalapa" target="_blank" rel="noopener noreferrer">
                                  <FaFacebook className="h-5 w-5 text-blue-600" />
                                  <span>Centro Tecnológico</span>
                              </a>
                          </Button>
                          <Button asChild variant="outline" className="h-auto p-3 justify-center gap-3 bg-background hover:bg-muted/50">
                              <a href="https://www.instagram.com/centrotecjalapa" target="_blank" rel="noopener noreferrer">
                                  <FaInstagram className="h-5 w-5 text-pink-600" />
                                  <span>@centrotecjalapa</span>
                              </a>
                          </Button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="phone-numbers" className="border-white/10">
                    <AccordionTrigger className="text-left py-2 text-sm lg:text-md font-semibold hover:no-underline">
                      <span>Números de Teléfono</span>
                    </AccordionTrigger>
                    <AccordionContent className="pt-2">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Button asChild variant="outline" className="h-auto p-3 justify-center gap-3 bg-background hover:bg-muted/50">
                            <a href="tel:27320000">
                                <Phone className="h-5 w-5 text-green-600" />
                                <span>2732-0000</span>
                            </a>
                        </Button>
                        <Button asChild variant="outline" className="h-auto p-3 justify-center gap-3 bg-background hover:bg-muted/50">
                           <a href="tel:88880000">
                                <Phone className="h-5 w-5 text-green-600" />
                                <span>8888-0000</span>
                           </a>
                        </Button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="whatsapp" className="border-b-0 border-white/10">
                    <AccordionTrigger className="text-left py-2 text-sm lg:text-md font-semibold hover:no-underline">
                      <span>Chat por WhatsApp</span>
                    </AccordionTrigger>
                    <AccordionContent className="pt-2">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Button asChild variant="outline" className="h-auto p-3 justify-center gap-3 bg-background hover:bg-muted/50">
                           <a href="https://wa.me/50587043761" target="_blank" rel="noopener noreferrer">
                                <FaWhatsapp className="h-5 w-5 text-green-500" />
                                <span>8704-3761</span>
                           </a>
                        </Button>
                         <Button asChild variant="outline" className="h-auto p-3 justify-center gap-3 bg-background hover:bg-muted/50">
                           <a href="https://wa.me/50584433992" target="_blank" rel="noopener noreferrer">
                                <FaWhatsapp className="h-5 w-5 text-green-500" />
                                <span>8443-3992</span>
                           </a>
                        </Button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>

              {/* Google Maps */}
              <div className="space-y-2 flex flex-col">
                <h3 className="text-sm lg:text-md font-semibold">Nuestra Ubicación</h3>
                <div className="rounded-2xl overflow-hidden border border-white/10 flex-grow">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3872.249857409935!2d-86.10622022322721!3d13.943723092817807!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8f6ddccf90000001%3A0x655a089a46b62488!2sCentro%20Tecnol%C3%B3gico%20de%20Jalapa%2C%20Nueva%20Segovia.!5e0!3m2!1ses-419!2sni!4v1760913733880!5m2!1ses-419!2sni"
                    width="100%"
                    height="100%"
                    style={{ border: 0, minHeight: '200px' }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="w-full h-20"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}


