import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { User, MapPin, Phone, Mail } from "lucide-react";

interface CustomerDetails {
  name: string;
  phone: string;
  email: string;
  address: string;
}

interface CustomerDetailsFormProps {
  details: CustomerDetails;
  onChange: (details: CustomerDetails) => void;
}

export const CustomerDetailsForm = ({ details, onChange }: CustomerDetailsFormProps) => {
  const updateField = (field: keyof CustomerDetails, value: string) => {
    onChange({ ...details, [field]: value });
  };

  return (
    <div className="bg-card rounded-2xl p-6 shadow-card">
      <div className="flex items-center gap-2 mb-4">
        <User className="h-5 w-5 text-gold" />
        <h2 className="font-serif text-xl font-semibold">Delivery Details</h2>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2">
              <User className="h-3.5 w-3.5" />
              Full Name *
            </Label>
            <Input
              id="name"
              placeholder="Your full name"
              value={details.name}
              onChange={(e) => updateField("name", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-2">
              <Phone className="h-3.5 w-3.5" />
              Phone Number *
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="10-digit mobile number"
              value={details.phone}
              onChange={(e) => updateField("phone", e.target.value)}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="flex items-center gap-2">
            <Mail className="h-3.5 w-3.5" />
            Email (Optional)
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="your.email@example.com"
            value={details.email}
            onChange={(e) => updateField("email", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="address" className="flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5" />
            Delivery Address *
          </Label>
          <Textarea
            id="address"
            placeholder="Full address including house no., street, city, state, pincode"
            value={details.address}
            onChange={(e) => updateField("address", e.target.value)}
            rows={3}
            required
          />
        </div>
      </div>
    </div>
  );
};
