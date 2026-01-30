import { Button } from "@/components/ui/button";
import { Phone, MessageCircle } from "lucide-react";
import heroBanner from "@/assets/hero-banner.png";

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-hero">
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, hsl(var(--gold)) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}></div>
      </div>
      
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="relative rounded-2xl overflow-hidden shadow-medium">
          <img 
            src={heroBanner} 
            alt="AK Fashion Hub - Elegant Women's Wear for Every Occasion" 
            className="w-full h-auto object-cover"
          />
          
        </div>
        
        {/* CTA below image */}
        <div className="flex flex-col items-center mt-6 md:mt-8 gap-3 md:gap-4 px-2">
          <h1 className="font-serif text-3xl lg:text-4xl text-primary text-center font-semibold">
            Elegant Women's Wear for Every Occasion
          </h1>
          <p className="text-muted-foreground text-center max-w-2xl">
            Discover exquisite sarees, dress materials & ethnic wear handpicked for the modern Indian woman. 
            Quality assured, delivered to your doorstep.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            <a 
              href="tel:7680924488"
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 font-semibold text-base md:text-lg px-6 md:px-10 py-3 md:py-4 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
            >
              <Phone className="w-5 h-5" />
              Order Now: 7680924488
            </a>
            <a 
              href="https://wa.me/917680924488?text=Hi! I'm interested in your collection" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-emerald-600 text-white font-semibold text-base md:text-lg px-6 md:px-10 py-3 md:py-4 rounded-xl shadow-lg hover:bg-emerald-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
            >
              <MessageCircle className="w-5 h-5" />
              WhatsApp Order
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
