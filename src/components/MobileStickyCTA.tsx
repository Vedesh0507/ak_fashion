import { Button } from "@/components/ui/button";
import { Phone, MessageCircle } from "lucide-react";

const MobileStickyCTA = () => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-t border-border p-3 md:hidden">
      <div className="flex gap-2">
        <a href="tel:7680924488" className="flex-1">
          <Button variant="gold" size="lg" className="w-full">
            <Phone className="w-5 h-5" />
            Call to Order
          </Button>
        </a>
        <a 
          href="https://wa.me/917680924488?text=Hi! I'm interested in your collection"
          target="_blank" 
          rel="noopener noreferrer"
        >
          <Button variant="whatsapp" size="lg">
            <MessageCircle className="w-5 h-5" />
          </Button>
        </a>
      </div>
    </div>
  );
};

export default MobileStickyCTA;
