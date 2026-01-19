import { useState, useRef } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { 
  Truck, 
  Smartphone, 
  Upload, 
  X, 
  CheckCircle2, 
  ExternalLink,
  Image as ImageIcon,
  Shield
} from "lucide-react";
import phonepeQR from "@/assets/phonepe-qr.jpeg";

interface PaymentSectionProps {
  paymentMethod: "cod" | "upi";
  onPaymentMethodChange: (method: "cod" | "upi") => void;
  paymentScreenshot: File | null;
  onScreenshotChange: (file: File | null) => void;
  totalAmount: number;
}

const UPI_ID = "rehanaparveen9553@ybl";
const UPI_NAME = "MOHAMMAD REHANA PARVEEN";

export const PaymentSection = ({
  paymentMethod,
  onPaymentMethodChange,
  paymentScreenshot,
  onScreenshotChange,
  totalAmount,
}: PaymentSectionProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onScreenshotChange(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const removeScreenshot = () => {
    onScreenshotChange(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const openUPIApp = (app: string) => {
    const amount = totalAmount;
    const upiId = UPI_ID;
    const name = encodeURIComponent(UPI_NAME);
    const note = encodeURIComponent("AK Fashion Hub Order");
    
    let url = "";
    
    switch (app) {
      case "phonepe":
        url = `phonepe://pay?pa=${upiId}&pn=${name}&am=${amount}&tn=${note}`;
        break;
      case "gpay":
        url = `gpay://upi/pay?pa=${upiId}&pn=${name}&am=${amount}&tn=${note}`;
        break;
      case "paytm":
        url = `paytmmp://pay?pa=${upiId}&pn=${name}&am=${amount}&tn=${note}`;
        break;
      case "whatsapp":
        url = `https://wa.me/917680924488?text=${encodeURIComponent(`I want to pay ₹${amount} for my order via UPI`)}`;
        break;
      default:
        url = `upi://pay?pa=${upiId}&pn=${name}&am=${amount}&tn=${note}`;
    }
    
    window.open(url, "_blank");
  };

  return (
    <div className="bg-card rounded-2xl p-6 shadow-card">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="h-5 w-5 text-emerald-600" />
        <h2 className="font-serif text-xl font-semibold">Payment Method</h2>
      </div>

      <RadioGroup
        value={paymentMethod}
        onValueChange={(value) => onPaymentMethodChange(value as "cod" | "upi")}
        className="space-y-3"
      >
        {/* Cash on Delivery */}
        <Label
          htmlFor="cod"
          className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
            paymentMethod === "cod"
              ? "border-gold bg-gold/5"
              : "border-border hover:border-gold/50"
          }`}
        >
          <RadioGroupItem value="cod" id="cod" />
          <div className={`p-2 rounded-full ${paymentMethod === "cod" ? "bg-gold/20" : "bg-secondary"}`}>
            <Truck className={`h-5 w-5 ${paymentMethod === "cod" ? "text-gold" : "text-muted-foreground"}`} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-medium">Cash on Delivery</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                Popular
              </span>
            </div>
            <p className="text-sm text-muted-foreground">Pay when you receive your order</p>
          </div>
          {paymentMethod === "cod" && <CheckCircle2 className="h-5 w-5 text-gold" />}
        </Label>

        {/* Online Payment (UPI) */}
        <Label
          htmlFor="upi"
          className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
            paymentMethod === "upi"
              ? "border-gold bg-gold/5"
              : "border-border hover:border-gold/50"
          }`}
        >
          <RadioGroupItem value="upi" id="upi" />
          <div className={`p-2 rounded-full ${paymentMethod === "upi" ? "bg-gold/20" : "bg-secondary"}`}>
            <Smartphone className={`h-5 w-5 ${paymentMethod === "upi" ? "text-gold" : "text-muted-foreground"}`} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-medium">Online Payment (UPI)</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                Instant
              </span>
            </div>
            <p className="text-sm text-muted-foreground">PhonePe, GPay, Paytm & more</p>
          </div>
          {paymentMethod === "upi" && <CheckCircle2 className="h-5 w-5 text-gold" />}
        </Label>
      </RadioGroup>

      {/* UPI Payment Details */}
      {paymentMethod === "upi" && (
        <div className="mt-6 space-y-6 animate-in slide-in-from-top-4 duration-300">
          {/* Amount to Pay */}
          <div className="bg-gradient-to-r from-gold/10 to-gold/5 rounded-xl p-4 text-center border border-gold/20">
            <p className="text-sm text-muted-foreground mb-1">Amount to Pay</p>
            <p className="text-3xl font-bold text-gold">₹{totalAmount.toLocaleString()}</p>
          </div>

          {/* QR Code */}
          <div className="text-center">
            <p className="text-sm font-medium mb-3">Scan QR Code to Pay</p>
            <div className="inline-block p-3 bg-white rounded-xl shadow-md">
              <img 
                src={phonepeQR} 
                alt="PhonePe QR Code" 
                className="w-48 h-48 object-contain mx-auto"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Scan with any UPI app
            </p>
          </div>

          {/* UPI ID */}
          <div className="bg-secondary/50 rounded-xl p-4 text-center">
            <p className="text-sm text-muted-foreground mb-1">UPI ID</p>
            <p className="font-mono font-bold text-lg break-all">{UPI_ID}</p>
            <p className="text-sm text-muted-foreground mt-1">{UPI_NAME}</p>
          </div>

          {/* UPI App Buttons */}
          <div>
            <p className="text-sm font-medium mb-3 text-center">Or pay using</p>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="h-12 gap-2"
                onClick={() => openUPIApp("phonepe")}
              >
                <span className="text-[#5f259f] font-bold">₱</span>
                PhonePe
                <ExternalLink className="h-3 w-3 ml-auto" />
              </Button>
              <Button
                variant="outline"
                className="h-12 gap-2"
                onClick={() => openUPIApp("gpay")}
              >
                <span className="text-[#4285f4] font-bold">G</span>
                Google Pay
                <ExternalLink className="h-3 w-3 ml-auto" />
              </Button>
              <Button
                variant="outline"
                className="h-12 gap-2"
                onClick={() => openUPIApp("paytm")}
              >
                <span className="text-[#00baf2] font-bold">P</span>
                Paytm
                <ExternalLink className="h-3 w-3 ml-auto" />
              </Button>
              <Button
                variant="outline"
                className="h-12 gap-2"
                onClick={() => openUPIApp("generic")}
              >
                <Smartphone className="h-4 w-4" />
                Other UPI
                <ExternalLink className="h-3 w-3 ml-auto" />
              </Button>
            </div>
          </div>

          {/* Screenshot Upload */}
          <div className="border-t pt-6">
            <div className="flex items-center gap-2 mb-3">
              <Upload className="h-4 w-4 text-gold" />
              <p className="font-medium">Upload Payment Screenshot</p>
              <span className="text-xs text-destructive">*Required</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              After completing payment, upload the screenshot as proof
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              id="screenshot-upload"
            />

            {!paymentScreenshot ? (
              <label
                htmlFor="screenshot-upload"
                className="flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-gold/50 hover:bg-secondary/30 transition-all"
              >
                <div className="p-3 bg-secondary rounded-full">
                  <ImageIcon className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="text-center">
                  <p className="font-medium">Click to upload screenshot</p>
                  <p className="text-sm text-muted-foreground">PNG, JPG up to 5MB</p>
                </div>
              </label>
            ) : (
              <div className="relative">
                <div className="relative rounded-xl overflow-hidden border">
                  <img
                    src={previewUrl || ""}
                    alt="Payment screenshot"
                    className="w-full max-h-64 object-contain bg-secondary/30"
                  />
                  <button
                    onClick={removeScreenshot}
                    className="absolute top-2 right-2 p-1.5 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex items-center gap-2 mt-2 text-sm text-emerald-600">
                  <CheckCircle2 className="h-4 w-4" />
                  Screenshot uploaded successfully
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* COD Info */}
      {paymentMethod === "cod" && (
        <div className="mt-4 p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800 animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-emerald-800 dark:text-emerald-200">Pay when you receive</p>
              <p className="text-sm text-emerald-700 dark:text-emerald-300 mt-1">
                Inspect your order before paying. No advance payment required.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
