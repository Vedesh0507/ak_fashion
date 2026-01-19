import { Award, Truck, CreditCard, Gift, Clock, ShieldCheck } from "lucide-react";

const benefits = [
  {
    icon: Award,
    title: "100% Quality Assured",
    description: "Handpicked premium fabrics"
  },
  {
    icon: Truck,
    title: "Home Delivery",
    description: "Save time with doorstep delivery"
  },
  {
    icon: CreditCard,
    title: "All Payment Modes",
    description: "UPI, Cards & Net Banking"
  },
  {
    icon: Gift,
    title: "Free Delivery",
    description: "On orders above ₹3000"
  },
  {
    icon: Clock,
    title: "Cash on Delivery",
    description: "Pay when you receive"
  },
  {
    icon: ShieldCheck,
    title: "Trusted Since Years",
    description: "By Rehana Parveen"
  }
];

const BenefitsSection = () => {
  return (
    <section className="py-12 md:py-16 bg-primary">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="font-serif text-3xl md:text-4xl font-semibold text-primary-foreground mb-3">
            Why Choose Us
          </h2>
          <div className="w-20 h-1 bg-gold mx-auto rounded-full"></div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {benefits.map((benefit, index) => (
            <div 
              key={benefit.title}
              className="text-center group animate-fade-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gold/20 flex items-center justify-center group-hover:bg-gold/30 transition-colors">
                <benefit.icon className="w-8 h-8 text-gold" />
              </div>
              <h3 className="font-semibold text-primary-foreground mb-1 text-sm md:text-base">{benefit.title}</h3>
              <p className="text-primary-foreground/70 text-xs md:text-sm">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
