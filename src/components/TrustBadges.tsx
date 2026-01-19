import { Shield, CheckCircle, Lock, Star } from 'lucide-react';

const TrustBadges = () => {
  const badges = [
    { icon: Shield, label: 'SSL Secured' },
    { icon: CheckCircle, label: 'Verified Store' },
    { icon: Lock, label: 'Secure Checkout' },
    { icon: Star, label: '5-Star Rated' },
  ];

  return (
    <section className="py-8 bg-card border-y border-border">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap justify-center gap-6 md:gap-12">
          {badges.map((badge, index) => (
            <div key={index} className="flex items-center gap-2 text-muted-foreground">
              <badge.icon className="h-5 w-5 text-gold" />
              <span className="text-sm font-medium">{badge.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustBadges;
