import { Button } from "@/components/ui/button";
import { Phone, MessageCircle, MapPin, Clock, Navigation } from "lucide-react";

const ContactSection = () => {
  return (
    <section className="py-12 md:py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="font-serif text-3xl md:text-4xl font-semibold text-primary mb-3">
            Visit Our Store
          </h2>
          <div className="w-20 h-1 bg-gradient-gold mx-auto rounded-full"></div>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <div className="bg-card rounded-3xl shadow-medium overflow-hidden">
            <div className="grid md:grid-cols-2">
              {/* Map placeholder */}
              <div className="h-64 md:h-auto bg-cream-dark relative overflow-hidden">
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1000!2d80.1478958!3d17.2470455!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTfCsDE0JzQ5LjQiTiA4MMKwMDgnNTIuNCJF!5e0!3m2!1sen!2sin!4v1"
                  width="100%"
                  height="100%"
                  style={{ border: 0, minHeight: '300px' }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Store Location"
                  className="grayscale hover:grayscale-0 transition-all duration-500"
                ></iframe>
                <div className="absolute bottom-4 left-4 right-4">
                  <a 
                    href="https://www.google.com/maps/place/17%C2%B014'49.4%22N+80%C2%B008'52.4%22E/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <Button variant="default" size="sm" className="w-full md:w-auto">
                      <Navigation className="w-4 h-4" />
                      Get Directions
                    </Button>
                  </a>
                </div>
              </div>
              
              {/* Contact info */}
              <div className="p-6 md:p-8 flex flex-col justify-center">
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-6 h-6 text-gold" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">Store Address</h3>
                      <p className="text-muted-foreground">
                        Nizampet, Behind Belief Hospital,<br />
                        Khammam, Telangana
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center flex-shrink-0">
                      <Clock className="w-6 h-6 text-gold" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">Store Hours</h3>
                      <p className="text-muted-foreground">
                        Mon - Sat: 10:00 AM - 9:00 PM<br />
                        Sunday: 11:00 AM - 7:00 PM
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center flex-shrink-0">
                      <Phone className="w-6 h-6 text-gold" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">Contact Us</h3>
                      <p className="text-muted-foreground">
                        Call: <a href="tel:7680924488" className="text-primary hover:text-gold transition-colors font-medium">7680924488</a>
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <a href="tel:7680924488" className="flex-1">
                      <Button variant="gold" size="lg" className="w-full">
                        <Phone className="w-5 h-5" />
                        Call Now
                      </Button>
                    </a>
                    <a 
                      href="https://wa.me/917680924488?text=Hi! I'm interested in visiting your store"
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex-1"
                    >
                      <Button variant="whatsapp" size="lg" className="w-full">
                        <MessageCircle className="w-5 h-5" />
                        WhatsApp
                      </Button>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
