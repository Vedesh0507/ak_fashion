/**
 * PaymentSection Component
 * ========================
 * Handles payment method selection and UPI payment flow
 * 
 * FEATURES:
 * - Cash on Delivery option
 * - UPI Payment with QR Code
 * - Deep links for PhonePe, GPay, Paytm
 * - Screenshot upload for payment verification
 * - Mobile-first responsive design
 * - Trust badges and secure payment indicators
 * 
 * IMPORTANT:
 * - Uses single UPI ID: 8897393151@ybl
 * - No payment gateway - manual verification via screenshot
 * - Payment marked as "Pending Verification" until admin confirms
 */

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
  Shield,
  Copy,
  Check,
  HelpCircle,
  QrCode,
  IndianRupee,
  Lock,
  MessageCircle
} from "lucide-react";
import { toast } from "sonner";
import phonepeQR from "@/assets/phonepe-qr.jpeg";

// ============================================
// UPI CONFIGURATION - SINGLE SOURCE OF TRUTH
// ============================================
const UPI_CONFIG = {
  UPI_ID: "8897393151@ybl",
  MERCHANT_NAME: "AK Fashion Hub",
  CURRENCY: "INR",
  SUPPORT_WHATSAPP: "917680924488",
};

interface PaymentSectionProps {
  paymentMethod: "cod" | "upi";
  onPaymentMethodChange: (method: "cod" | "upi") => void;
  paymentScreenshot: File | null;
  onScreenshotChange: (file: File | null) => void;
  totalAmount: number;
  orderId?: string;
}

type UPIAppType = "phonepe" | "gpay" | "paytm" | "generic";

export const PaymentSection = ({
  paymentMethod,
  onPaymentMethodChange,
  paymentScreenshot,
  onScreenshotChange,
  totalAmount,
  orderId,
}: PaymentSectionProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [copiedUPI, setCopiedUPI] = useState(false);
  const [openingApp, setOpeningApp] = useState<UPIAppType | null>(null);

  // ============================================
  // HELPER FUNCTIONS
  // ============================================
  
  const isMobileDevice = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  };

  const generateAppSpecificLink = (app: UPIAppType, amount: number) => {
    const txnNote = orderId 
      ? `Order-${orderId.slice(0, 8).toUpperCase()}`
      : "AK Fashion Hub Order";
    
    const encodedName = encodeURIComponent(UPI_CONFIG.MERCHANT_NAME);
    const encodedNote = encodeURIComponent(txnNote);
    
    switch (app) {
      case "phonepe":
        return `phonepe://pay?pa=${UPI_CONFIG.UPI_ID}&pn=${encodedName}&am=${amount.toFixed(2)}&cu=${UPI_CONFIG.CURRENCY}&tn=${encodedNote}`;
      case "gpay":
        return `gpay://upi/pay?pa=${UPI_CONFIG.UPI_ID}&pn=${encodedName}&am=${amount.toFixed(2)}&cu=${UPI_CONFIG.CURRENCY}&tn=${encodedNote}`;
      case "paytm":
        return `paytmmp://pay?pa=${UPI_CONFIG.UPI_ID}&pn=${encodedName}&am=${amount.toFixed(2)}&cu=${UPI_CONFIG.CURRENCY}&tn=${encodedNote}`;
      default:
        return `upi://pay?pa=${UPI_CONFIG.UPI_ID}&pn=${encodedName}&am=${amount.toFixed(2)}&cu=${UPI_CONFIG.CURRENCY}&tn=${encodedNote}`;
    }
  };

  const getPaymentSupportLink = (amount: number) => {
    const orderRef = orderId ? orderId.slice(0, 8).toUpperCase() : "NEW";
    const message = `Hi, I need help with my UPI payment of ₹${amount.toLocaleString()} for Order #${orderRef}`;
    return `https://wa.me/${UPI_CONFIG.SUPPORT_WHATSAPP}?text=${encodeURIComponent(message)}`;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File too large", {
          description: "Please upload an image smaller than 5MB"
        });
        return;
      }
      
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Invalid file type", {
          description: "Please upload an image file (PNG, JPG, etc.)"
        });
        return;
      }
      
      onScreenshotChange(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      
      toast.success("Screenshot uploaded!", {
        description: "Your payment proof has been attached"
      });
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

  // ============================================
  // UPI APP HANDLING
  // ============================================
  
  const handleOpenUPIApp = async (app: UPIAppType) => {
    setOpeningApp(app);
    
    const isMobile = isMobileDevice();
    
    if (!isMobile) {
      toast.info("Scan QR Code", {
        description: "Open your UPI app on mobile and scan the QR code to pay",
        duration: 5000,
      });
      setOpeningApp(null);
      return;
    }
    
    const link = generateAppSpecificLink(app, totalAmount);
    
    if (link) {
      window.location.href = link;
      
      setTimeout(() => {
        toast.info("After payment, upload screenshot", {
          description: "Come back here and upload your payment screenshot to confirm",
          duration: 8000,
        });
        setOpeningApp(null);
      }, 1500);
    } else {
      toast.error("Could not open app", {
        description: "Please scan the QR code instead"
      });
      setOpeningApp(null);
    }
  };

  // ============================================
  // COPY UPI ID
  // ============================================
  
  const handleCopyUPI = async () => {
    try {
      await navigator.clipboard.writeText(UPI_CONFIG.UPI_ID);
      setCopiedUPI(true);
      toast.success("UPI ID copied!", {
        description: "Paste it in your UPI app to pay"
      });
      setTimeout(() => setCopiedUPI(false), 3000);
    } catch {
      toast.error("Could not copy", {
        description: "Please manually copy: " + UPI_CONFIG.UPI_ID
      });
    }
  };

  return (
    <div className="bg-card rounded-2xl p-6 shadow-card">
      {/* Header with Trust Badge */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-emerald-600" />
          <h2 className="font-serif text-xl font-semibold">Payment Method</h2>
        </div>
        <div className="flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-1 rounded-full">
          <Lock className="h-3 w-3" />
          <span>Secure</span>
        </div>
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
          
          {/* Trust Badges */}
          <div className="flex items-center justify-center gap-4 py-3 border-y border-border">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Shield className="h-3.5 w-3.5 text-emerald-500" />
              <span>Secure UPI Payment</span>
            </div>
            <div className="w-px h-4 bg-border" />
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <QrCode className="h-3.5 w-3.5 text-blue-500" />
              <span>Powered by UPI</span>
            </div>
          </div>
          
          {/* Amount to Pay */}
          <div className="bg-gradient-to-r from-gold/10 via-gold/5 to-gold/10 rounded-xl p-5 text-center border border-gold/20">
            <p className="text-sm text-muted-foreground mb-1">Total Amount to Pay</p>
            <div className="flex items-center justify-center gap-1">
              <IndianRupee className="h-7 w-7 text-gold" />
              <span className="text-4xl font-bold text-gold">{totalAmount.toLocaleString()}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Pay to: <span className="font-medium text-foreground">{UPI_CONFIG.MERCHANT_NAME}</span>
            </p>
          </div>

          {/* QR Code */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <QrCode className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-medium">Scan QR Code to Pay</p>
            </div>
            <div className="inline-block p-4 bg-white rounded-2xl shadow-lg border">
              <img 
                src={phonepeQR} 
                alt="Scan to pay via UPI" 
                className="w-52 h-52 object-contain mx-auto"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Works with any UPI app • PhonePe, GPay, Paytm, BHIM & more
            </p>
          </div>

          {/* UPI ID with Copy */}
          <div className="bg-secondary/50 rounded-xl p-4">
            <p className="text-xs text-muted-foreground mb-2 text-center">Or pay using UPI ID</p>
            <div className="flex items-center justify-center gap-2">
              <code className="font-mono font-bold text-lg bg-background px-4 py-2 rounded-lg border">
                {UPI_CONFIG.UPI_ID}
              </code>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyUPI}
                className="h-10 w-10 p-0"
              >
                {copiedUPI ? (
                  <Check className="h-4 w-4 text-emerald-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-center text-muted-foreground mt-2">
              {UPI_CONFIG.MERCHANT_NAME}
            </p>
          </div>

          {/* UPI App Buttons */}
          <div>
            <p className="text-sm font-medium mb-3 text-center">Quick Pay with</p>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="h-14 gap-3 text-left justify-start px-4 hover:border-[#5f259f] hover:bg-[#5f259f]/5"
                onClick={() => handleOpenUPIApp("phonepe")}
                disabled={openingApp !== null}
              >
                <div className="w-8 h-8 rounded-full bg-[#5f259f] flex items-center justify-center text-white font-bold text-sm">
                  ₱
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">PhonePe</p>
                  <p className="text-xs text-muted-foreground">UPI Payment</p>
                </div>
                <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>
              <Button
                variant="outline"
                className="h-14 gap-3 text-left justify-start px-4 hover:border-[#4285f4] hover:bg-[#4285f4]/5"
                onClick={() => handleOpenUPIApp("gpay")}
                disabled={openingApp !== null}
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#4285f4] via-[#ea4335] to-[#34a853] flex items-center justify-center text-white font-bold text-sm">
                  G
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">Google Pay</p>
                  <p className="text-xs text-muted-foreground">UPI Payment</p>
                </div>
                <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>
              <Button
                variant="outline"
                className="h-14 gap-3 text-left justify-start px-4 hover:border-[#00baf2] hover:bg-[#00baf2]/5"
                onClick={() => handleOpenUPIApp("paytm")}
                disabled={openingApp !== null}
              >
                <div className="w-8 h-8 rounded-full bg-[#00baf2] flex items-center justify-center text-white font-bold text-sm">
                  P
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">Paytm</p>
                  <p className="text-xs text-muted-foreground">UPI Payment</p>
                </div>
                <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>
              <Button
                variant="outline"
                className="h-14 gap-3 text-left justify-start px-4"
                onClick={() => handleOpenUPIApp("generic")}
                disabled={openingApp !== null}
              >
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                  <Smartphone className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">Other UPI</p>
                  <p className="text-xs text-muted-foreground">Any UPI App</p>
                </div>
                <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>
            </div>
            
            {/* Desktop Hint */}
            {!isMobileDevice() && (
              <p className="text-xs text-center text-amber-600 mt-3 bg-amber-50 dark:bg-amber-950/30 p-2 rounded-lg">
                💡 Open this page on mobile to use app buttons, or scan QR code above
              </p>
            )}
          </div>

          {/* Screenshot Upload */}
          <div className="border-t pt-6">
            <div className="flex items-center gap-2 mb-3">
              <Upload className="h-4 w-4 text-gold" />
              <p className="font-medium">Upload Payment Screenshot</p>
              <span className="text-xs text-destructive font-medium">* Required</span>
            </div>
            
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3 mb-4">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                <strong>📸 After payment:</strong> Take a screenshot of the payment success screen and upload it below to confirm your order.
              </p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              className="hidden"
              id="screenshot-upload"
            />

            {!paymentScreenshot ? (
              <label
                htmlFor="screenshot-upload"
                className="flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-gold/50 hover:bg-secondary/30 transition-all active:scale-[0.98]"
              >
                <div className="p-4 bg-secondary rounded-full">
                  <ImageIcon className="h-8 w-8 text-muted-foreground" />
                </div>
                <div className="text-center">
                  <p className="font-medium">Tap to upload screenshot</p>
                  <p className="text-sm text-muted-foreground">PNG, JPG up to 5MB</p>
                </div>
              </label>
            ) : (
              <div className="relative">
                <div className="relative rounded-xl overflow-hidden border-2 border-emerald-500">
                  <img
                    src={previewUrl || ""}
                    alt="Payment screenshot"
                    className="w-full max-h-72 object-contain bg-secondary/30"
                  />
                  <button
                    onClick={removeScreenshot}
                    className="absolute top-2 right-2 p-2 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90 transition-colors shadow-lg"
                    type="button"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex items-center gap-2 mt-3 text-sm text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 p-2 rounded-lg">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="font-medium">Screenshot uploaded successfully!</span>
                </div>
              </div>
            )}
          </div>

          {/* Help Section */}
          <div className="flex items-center justify-center gap-4 pt-4 border-t">
            <a
              href={getPaymentSupportLink(totalAmount)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <MessageCircle className="h-4 w-4" />
              <span>Need help?</span>
            </a>
            <div className="w-px h-4 bg-border" />
            <button
              type="button"
              onClick={() => toast.info("Payment will be verified within 24 hours", {
                description: "Our team will confirm your payment and update order status"
              })}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <HelpCircle className="h-4 w-4" />
              <span>How it works</span>
            </button>
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
