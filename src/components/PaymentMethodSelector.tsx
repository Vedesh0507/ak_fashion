import { useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Smartphone, CreditCard, Building2, Truck, Shield, CheckCircle2 } from "lucide-react";
import phonepeQR from "@/assets/phonepe-qr.jpeg";

interface PaymentMethodSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const paymentMethods = [
  {
    id: "upi",
    name: "UPI Payment",
    description: "PhonePe, Google Pay, Paytm & more",
    icon: Smartphone,
    badge: "Instant",
  },
  {
    id: "netbanking",
    name: "Net Banking",
    description: "All major banks supported",
    icon: Building2,
    badge: "Secure",
  },
  {
    id: "cod",
    name: "Cash on Delivery",
    description: "Pay when you receive your order",
    icon: Truck,
    badge: "Popular",
  },
];

export const PaymentMethodSelector = ({ value, onChange }: PaymentMethodSelectorProps) => {
  const [showQR, setShowQR] = useState(false);

  const handleChange = (newValue: string) => {
    onChange(newValue);
    setShowQR(newValue === "upi");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Shield className="h-4 w-4 text-emerald-600" />
        <span className="text-xs text-muted-foreground">100% Secure Payments</span>
      </div>

      <RadioGroup value={value} onValueChange={handleChange} className="space-y-3">
        {paymentMethods.map((method) => {
          const Icon = method.icon;
          const isSelected = value === method.id;
          
          return (
            <div key={method.id}>
              <Label
                htmlFor={method.id}
                className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  isSelected
                    ? "border-gold bg-gold/5"
                    : "border-border hover:border-gold/50 hover:bg-secondary/30"
                }`}
              >
                <RadioGroupItem value={method.id} id={method.id} className="sr-only" />
                <div className={`p-2 rounded-full ${isSelected ? "bg-gold/20" : "bg-secondary"}`}>
                  <Icon className={`h-5 w-5 ${isSelected ? "text-gold" : "text-muted-foreground"}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{method.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      isSelected ? "bg-gold text-gold-foreground" : "bg-secondary text-muted-foreground"
                    }`}>
                      {method.badge}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{method.description}</p>
                </div>
                {isSelected && (
                  <CheckCircle2 className="h-5 w-5 text-gold" />
                )}
              </Label>

              {/* UPI QR Code Section */}
              {method.id === "upi" && isSelected && (
                <div className="mt-3 p-4 bg-card border border-border rounded-lg animate-fade-up">
                  <div className="text-center">
                    <p className="text-sm font-medium mb-3">Scan QR Code to Pay</p>
                    <div className="inline-block p-3 bg-white rounded-lg shadow-sm">
                      <img 
                        src={phonepeQR} 
                        alt="PhonePe QR Code for payment" 
                        className="w-48 h-48 object-contain mx-auto"
                      />
                    </div>
                    <div className="mt-3 space-y-1">
                      <p className="text-xs text-muted-foreground">
                        Scan with PhonePe, Google Pay, Paytm or any UPI app
                      </p>
                      <p className="text-xs font-medium text-gold">
                        UPI ID: MOHAMMAD REHANA PARVEEN
                      </p>
                    </div>
                    <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
                      <p className="text-xs text-amber-800 dark:text-amber-200">
                        <strong>Important:</strong> After payment, take a screenshot and share it on WhatsApp for order confirmation.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Net Banking Section */}
              {method.id === "netbanking" && isSelected && (
                <div className="mt-3 p-4 bg-card border border-border rounded-lg animate-fade-up">
                  <div className="space-y-3">
                    <p className="text-sm font-medium">Bank Transfer Details</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between p-2 bg-secondary/50 rounded">
                        <span className="text-muted-foreground">Account Name:</span>
                        <span className="font-medium">AK Fashion Hub</span>
                      </div>
                      <div className="flex justify-between p-2 bg-secondary/50 rounded">
                        <span className="text-muted-foreground">Account Type:</span>
                        <span className="font-medium">Current Account</span>
                      </div>
                    </div>
                    <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                      <p className="text-xs text-blue-800 dark:text-blue-200">
                        <strong>Note:</strong> Our team will contact you with bank details after order placement for secure transfer.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* COD Section */}
              {method.id === "cod" && isSelected && (
                <div className="mt-3 p-4 bg-card border border-border rounded-lg animate-fade-up">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
                      <Shield className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Pay when you receive</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Inspect your order before making payment. No advance required.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </RadioGroup>
    </div>
  );
};
