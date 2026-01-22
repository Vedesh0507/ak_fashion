/**
 * ============================================================================
 * PAYMENT SECTION COMPONENT - PRODUCTION-READY UPI INTEGRATION
 * ============================================================================
 * 
 * Handles payment method selection and UPI payment flow for AK Fashion Hub.
 * 
 * FEATURES:
 * - Cash on Delivery option
 * - Dynamic UPI Payment with real-time QR Code generation
 * - Deep links for PhonePe, GPay, Paytm (amount locked)
 * - Screenshot upload for payment verification
 * - Mobile-first responsive design
 * - Trust badges and secure payment indicators
 * - Comprehensive error handling
 * 
 * PAYMENT FLOW:
 * 1. Customer selects payment method
 * 2. For UPI: QR code is generated with exact cart amount
 * 3. Customer scans QR or clicks app button (amount pre-filled)
 * 4. Customer uploads payment screenshot
 * 5. Order is placed with "Pending Verification" status
 * 
 * SECURITY:
 * - Amount is LOCKED (cannot be edited by customer)
 * - UPI ID is centralized (single source of truth)
 * - All links use NPCI-approved format
 * - No payment gateway - manual verification via screenshot
 * 
 * @author AK Fashion Hub
 * @version 3.0.0
 * @lastUpdated January 2026
 */

import { useState, useRef, useCallback } from "react";
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
  MessageCircle,
  AlertTriangle,
  Loader2
} from "lucide-react";
import { toast } from "sonner";

// Import UPI utilities and components
import { DynamicUPIQR } from "./DynamicUPIQR";
import {
  UPI_CONFIG,
  UPIAppType,
  initiateUPIPayment,
  copyUPIId,
  getPaymentSupportLink,
  isMobileDevice,
  validatePaymentAmount,
} from "@/lib/upi-payment";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface PaymentSectionProps {
  /** Selected payment method */
  paymentMethod: "cod" | "upi";
  
  /** Callback when payment method changes */
  onPaymentMethodChange: (method: "cod" | "upi") => void;
  
  /** Uploaded payment screenshot file */
  paymentScreenshot: File | null;
  
  /** Callback when screenshot is uploaded/removed */
  onScreenshotChange: (file: File | null) => void;
  
  /** Total cart amount (used to generate QR with locked amount) */
  totalAmount: number;
  
  /** Optional order ID for transaction reference */
  orderId?: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

/** Maximum file size for screenshot (5MB) */
const MAX_FILE_SIZE = 5 * 1024 * 1024;

/** Allowed file types for screenshot */
const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic"];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const PaymentSection = ({
  paymentMethod,
  onPaymentMethodChange,
  paymentScreenshot,
  onScreenshotChange,
  totalAmount,
  orderId,
}: PaymentSectionProps) => {
  // ============================================
  // STATE
  // ============================================
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [copiedUPI, setCopiedUPI] = useState(false);
  const [openingApp, setOpeningApp] = useState<UPIAppType | null>(null);
  const [paymentInitiated, setPaymentInitiated] = useState(false);
  
  // ============================================
  // VALIDATION
  // ============================================
  
  /**
   * Validate payment amount before showing payment options.
   * This ensures QR code can be generated successfully.
   */
  const amountValidation = validatePaymentAmount(totalAmount);
  const isAmountValid = amountValidation.isValid;
  
  // ============================================
  // FILE HANDLING
  // ============================================
  
  /**
   * Handles screenshot file selection.
   * Validates file size and type before accepting.
   */
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (!file) return;
    
    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
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
    
    // Accept the file
    onScreenshotChange(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    
    toast.success("Screenshot uploaded!", {
      description: "Your payment proof has been attached"
    });
  }, [onScreenshotChange]);
  
  /**
   * Removes the uploaded screenshot.
   */
  const removeScreenshot = useCallback(() => {
    onScreenshotChange(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [previewUrl, onScreenshotChange]);
  
  // ============================================
  // UPI APP HANDLING
  // ============================================
  
  /**
   * Handles opening UPI payment app with locked amount.
   * Uses the centralized UPI utility for link generation.
   */
  const handleOpenUPIApp = useCallback(async (app: UPIAppType) => {
    // Prevent double clicks
    if (openingApp) return;
    
    setOpeningApp(app);
    setPaymentInitiated(true);
    
    // Check if on mobile
    if (!isMobileDevice()) {
      toast.info("Scan QR Code", {
        description: "Open your UPI app on mobile and scan the QR code to pay",
        duration: 5000,
      });
      setOpeningApp(null);
      return;
    }
    
    // Initiate payment using centralized utility
    const result = await initiateUPIPayment(app, totalAmount, orderId);
    
    if (result.success) {
      // Give time for app to open, then show reminder
      setTimeout(() => {
        toast.info("After payment, upload screenshot", {
          description: "Come back here and upload your payment screenshot to confirm",
          duration: 8000,
        });
        setOpeningApp(null);
      }, 1500);
    } else {
      toast.error("Could not open app", {
        description: result.message
      });
      setOpeningApp(null);
    }
  }, [openingApp, totalAmount, orderId]);
  
  // ============================================
  // COPY UPI ID
  // ============================================
  
  /**
   * Copies UPI ID to clipboard.
   */
  const handleCopyUPI = useCallback(async () => {
    const success = await copyUPIId();
    
    if (success) {
      setCopiedUPI(true);
      toast.success("UPI ID copied!", {
        description: "Paste it in your UPI app to pay"
      });
      setTimeout(() => setCopiedUPI(false), 3000);
    } else {
      toast.error("Could not copy", {
        description: `Please manually copy: ${UPI_CONFIG.UPI_ID}`
      });
    }
  }, []);
  
  // ============================================
  // QR ERROR HANDLING
  // ============================================
  
  /**
   * Handles QR generation errors.
   */
  const handleQRError = useCallback((error: string) => {
    console.error("[Payment] QR generation error:", error);
    toast.error("QR Code Error", {
      description: "Could not generate payment QR. Please use UPI ID instead.",
    });
  }, []);

  // ============================================
  // RENDER
  // ============================================
  
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

      {/* Amount Validation Warning */}
      {!isAmountValid && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2">
          <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-700 dark:text-red-300">
              Invalid Amount
            </p>
            <p className="text-xs text-red-600 dark:text-red-400">
              {amountValidation.errors.join(". ")}
            </p>
          </div>
        </div>
      )}

      {/* Payment Method Selection */}
      <RadioGroup
        value={paymentMethod}
        onValueChange={(value) => onPaymentMethodChange(value as "cod" | "upi")}
        className="space-y-3"
      >
        {/* ============================================ */}
        {/* CASH ON DELIVERY OPTION */}
        {/* ============================================ */}
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

        {/* ============================================ */}
        {/* UPI PAYMENT OPTION */}
        {/* ============================================ */}
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

      {/* ============================================ */}
      {/* UPI PAYMENT DETAILS SECTION */}
      {/* ============================================ */}
      {paymentMethod === "upi" && isAmountValid && (
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
          
          {/* Amount to Pay - LOCKED */}
          <div className="bg-gradient-to-r from-gold/10 via-gold/5 to-gold/10 rounded-xl p-5 text-center border border-gold/20">
            <p className="text-sm text-muted-foreground mb-1">Total Amount to Pay</p>
            <div className="flex items-center justify-center gap-1">
              <IndianRupee className="h-7 w-7 text-gold" />
              <span className="text-4xl font-bold text-gold">{totalAmount.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-center gap-1 mt-2 text-xs text-muted-foreground">
              <Lock className="h-3 w-3" />
              <span>Amount is locked and cannot be changed</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Pay to: <span className="font-medium text-foreground">{UPI_CONFIG.MERCHANT_NAME}</span>
            </p>
          </div>

          {/* ============================================ */}
          {/* DYNAMIC QR CODE - Amount Embedded */}
          {/* ============================================ */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <QrCode className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-medium">Scan QR Code to Pay</p>
            </div>
            
            {/* Dynamic QR Component */}
            <div className="flex justify-center">
              <DynamicUPIQR
                amount={totalAmount}
                orderId={orderId}
                size={200}
                onError={handleQRError}
              />
            </div>
            
            <p className="text-xs text-muted-foreground mt-3">
              Works with any UPI app • PhonePe, GPay, Paytm, BHIM & more
            </p>
          </div>

          {/* ============================================ */}
          {/* UPI ID with Copy */}
          {/* ============================================ */}
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
                title="Copy UPI ID"
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

          {/* ============================================ */}
          {/* UPI App Buttons - Amount Pre-filled */}
          {/* ============================================ */}
          <div>
            <p className="text-sm font-medium mb-3 text-center">Quick Pay with</p>
            <div className="grid grid-cols-2 gap-3">
              {/* PhonePe */}
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
                {openingApp === "phonepe" ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                )}
              </Button>
              
              {/* Google Pay */}
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
                {openingApp === "gpay" ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                )}
              </Button>
              
              {/* Paytm */}
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
                {openingApp === "paytm" ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                )}
              </Button>
              
              {/* Other UPI Apps */}
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
                {openingApp === "generic" ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                )}
              </Button>
            </div>
            
            {/* Desktop Hint */}
            {!isMobileDevice() && (
              <p className="text-xs text-center text-amber-600 mt-3 bg-amber-50 dark:bg-amber-950/30 p-2 rounded-lg">
                💡 Open this page on mobile to use app buttons, or scan QR code above
              </p>
            )}
          </div>

          {/* ============================================ */}
          {/* SCREENSHOT UPLOAD SECTION */}
          {/* ============================================ */}
          <div className="border-t pt-6">
            <div className="flex items-center gap-2 mb-3">
              <Upload className="h-4 w-4 text-gold" />
              <p className="font-medium">Upload Payment Screenshot</p>
              <span className="text-xs text-destructive font-medium">* Required</span>
            </div>
            
            {/* Instructions */}
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3 mb-4">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                <strong>📸 After payment:</strong> Take a screenshot of the payment success screen and upload it below to confirm your order.
              </p>
            </div>

            {/* File Input (Hidden) */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              className="hidden"
              id="screenshot-upload"
            />

            {/* Upload Area or Preview */}
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
                    title="Remove screenshot"
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

          {/* ============================================ */}
          {/* HELP SECTION */}
          {/* ============================================ */}
          <div className="flex items-center justify-center gap-4 pt-4 border-t">
            <a
              href={getPaymentSupportLink(totalAmount, orderId)}
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

      {/* ============================================ */}
      {/* COD INFO SECTION */}
      {/* ============================================ */}
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

export default PaymentSection;
