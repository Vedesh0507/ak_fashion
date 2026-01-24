import { Phone, MapPin, Heart, Clock, Instagram, MessageCircle } from "lucide-react";
import akLogo from "@/assets/ak-fashion-hub-logo.png";

const Footer = () => {
  return (
    <footer className="bg-navy-dark py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {/* Brand Section */}
          <div className="text-center md:text-left">
            <img 
              src={akLogo} 
              alt="AK Fashion Hub logo" 
              className="h-12 w-auto object-contain mx-auto md:mx-0"
              loading="lazy"
            />
            <p className="text-primary-foreground/70 text-sm mt-3">
              Women's Wear by Rehana Parveen
            </p>
            <p className="text-primary-foreground/60 text-sm mt-4 max-w-xs mx-auto md:mx-0">
              Discover exquisite sarees, dress materials & ethnic wear handpicked for the modern Indian woman.
            </p>
          </div>

          {/* Contact Info */}
          <div className="text-center md:text-left">
            <h3 className="font-serif text-lg font-semibold text-primary-foreground mb-4">
              Contact Us
            </h3>
            <div className="space-y-3">
              <a 
                href="tel:7680924488" 
                className="flex items-center justify-center md:justify-start gap-2 text-primary-foreground/80 hover:text-gold transition-colors"
              >
                <Phone className="w-4 h-4 text-gold" />
                <span>7680924488</span>
              </a>
              <div className="flex items-start justify-center md:justify-start gap-2 text-primary-foreground/80">
                <MapPin className="w-4 h-4 text-gold mt-0.5 shrink-0" />
                <span className="text-sm">
                  Nizampet, Behind Belief Hospital,<br />
                  Khammam, Telangana
                </span>
              </div>
              <div className="flex items-center justify-center md:justify-start gap-2 text-primary-foreground/80">
                <Clock className="w-4 h-4 text-gold" />
                <span className="text-sm">10:00 AM - 9:00 PM</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="text-center md:text-left">
            <h3 className="font-serif text-lg font-semibold text-primary-foreground mb-4">
              Quick Links
            </h3>
            <div className="space-y-2">
              <a href="#categories" className="block text-primary-foreground/70 hover:text-gold transition-colors text-sm">
                Our Collection
              </a>
              <a href="#products" className="block text-primary-foreground/70 hover:text-gold transition-colors text-sm">
                New Arrivals
              </a>
              <a href="#contact" className="block text-primary-foreground/70 hover:text-gold transition-colors text-sm">
                Visit Store
              </a>
              <a 
                href="https://wa.me/917680924488?text=Hi! I'm interested in your collection" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center md:justify-start gap-2 text-green-400 hover:text-green-300 transition-colors text-sm"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp Order
              </a>
              <a 
                href="https://www.instagram.com/akfastionhub" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center md:justify-start gap-2 text-pink-400 hover:text-pink-300 transition-colors text-sm"
              >
                <Instagram className="w-4 h-4" />
                @akfastionhub
              </a>
            </div>
          </div>
        </div>

        {/* Divider & Copyright */}
        <div className="border-t border-primary-foreground/10 mt-10 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-primary-foreground/50 text-sm flex items-center gap-1">
              Made with <Heart className="w-4 h-4 text-gold fill-gold" /> for AK Fashion Hub
            </p>
            <p className="text-primary-foreground/40 text-xs">
              © {new Date().getFullYear()} AK Fashion Hub. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;