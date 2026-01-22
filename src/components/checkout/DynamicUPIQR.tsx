/**
 * ============================================================================
 * DYNAMIC UPI QR CODE COMPONENT
 * ============================================================================
 * 
 * Generates real-time QR codes for UPI payments with embedded amount.
 * The QR code updates automatically when the payment amount changes.
 * 
 * FEATURES:
 * - Dynamic QR generation (no static images)
 * - Amount locked in QR code (cannot be edited by user)
 * - High-quality SVG rendering
 * - Error correction for reliable scanning
 * - Loading and error states
 * 
 * SECURITY:
 * - QR content is the UPI deep link with locked amount
 * - Customer cannot modify the payment amount
 * - Each order gets a unique transaction reference
 * 
 * @author AK Fashion Hub
 * @version 1.0.0
 */

import { useMemo, useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { generateUPIDeepLink, UPI_CONFIG } from "@/lib/upi-payment";
import { AlertCircle, RefreshCw, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface DynamicUPIQRProps {
  /** Payment amount in INR (locked, not editable) */
  amount: number;
  
  /** Optional order ID for transaction reference */
  orderId?: string;
  
  /** QR code size in pixels */
  size?: number;
  
  /** Additional CSS classes */
  className?: string;
  
  /** Callback when QR generation fails */
  onError?: (error: string) => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * DynamicUPIQR Component
 * 
 * Renders a QR code that encodes a UPI payment link with the exact amount.
 * When scanned, the UPI app will open with pre-filled amount that cannot
 * be modified by the customer.
 */
export const DynamicUPIQR = ({
  amount,
  orderId,
  size = 208, // Default size that works well on mobile
  className = "",
  onError,
}: DynamicUPIQRProps) => {
  // Track QR generation state
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  
  /**
   * Generate UPI link whenever amount or orderId changes.
   * This ensures QR code always reflects current cart total.
   */
  const upiLinkResult = useMemo(() => {
    setIsLoading(true);
    setHasError(false);
    setErrorMessage(null);
    
    // Small delay to show loading state for UX
    const result = generateUPIDeepLink(amount, orderId);
    
    if (!result.success) {
      setHasError(true);
      setErrorMessage(result.error);
      onError?.(result.error || "QR generation failed");
    }
    
    setIsLoading(false);
    return result;
  }, [amount, orderId, retryCount, onError]);
  
  /**
   * Handle retry when QR generation fails
   */
  const handleRetry = () => {
    setRetryCount((prev) => prev + 1);
  };
  
  // ============================================================================
  // RENDER: LOADING STATE
  // ============================================================================
  
  if (isLoading) {
    return (
      <div 
        className={`flex flex-col items-center justify-center bg-white rounded-2xl p-4 ${className}`}
        style={{ width: size + 32, height: size + 32 }}
      >
        <div className="animate-pulse flex flex-col items-center gap-3">
          <div 
            className="bg-gray-200 rounded-lg"
            style={{ width: size, height: size }}
          />
          <div className="h-3 w-24 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }
  
  // ============================================================================
  // RENDER: ERROR STATE
  // ============================================================================
  
  if (hasError || !upiLinkResult.success || !upiLinkResult.link) {
    return (
      <div 
        className={`flex flex-col items-center justify-center bg-red-50 border border-red-200 rounded-2xl p-6 ${className}`}
        style={{ width: size + 32 }}
      >
        <AlertCircle className="h-12 w-12 text-red-500 mb-3" />
        <p className="text-sm font-medium text-red-700 text-center mb-2">
          QR Generation Failed
        </p>
        <p className="text-xs text-red-600 text-center mb-4">
          {errorMessage || "Unable to generate payment QR code"}
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRetry}
          className="gap-2"
        >
          <RefreshCw className="h-3 w-3" />
          Try Again
        </Button>
      </div>
    );
  }
  
  // ============================================================================
  // RENDER: SUCCESS - DYNAMIC QR CODE
  // ============================================================================
  
  return (
    <div className={`flex flex-col items-center ${className}`}>
      {/* QR Code Container with styling */}
      <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100">
        <QRCodeSVG
          value={upiLinkResult.link}
          size={size}
          level="H" // High error correction for reliable scanning
          includeMargin={true}
          bgColor="#FFFFFF"
          fgColor="#000000"
        />
      </div>
      
      {/* Amount Badge */}
      <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground bg-secondary/50 px-3 py-1.5 rounded-full">
        <QrCode className="h-3 w-3" />
        <span>Scan to pay ₹{amount.toLocaleString()}</span>
      </div>
      
      {/* Merchant Info */}
      <p className="text-xs text-muted-foreground mt-2">
        Pay to: <span className="font-medium">{UPI_CONFIG.MERCHANT_NAME}</span>
      </p>
    </div>
  );
};

// ============================================================================
// COMPACT QR VARIANT
// ============================================================================

interface CompactUPIQRProps {
  amount: number;
  orderId?: string;
}

/**
 * Compact version of the QR code for smaller spaces.
 * Smaller size, minimal styling.
 */
export const CompactUPIQR = ({ amount, orderId }: CompactUPIQRProps) => {
  const upiLinkResult = useMemo(() => {
    return generateUPIDeepLink(amount, orderId);
  }, [amount, orderId]);
  
  if (!upiLinkResult.success || !upiLinkResult.link) {
    return (
      <div className="w-32 h-32 flex items-center justify-center bg-gray-100 rounded-lg">
        <AlertCircle className="h-6 w-6 text-gray-400" />
      </div>
    );
  }
  
  return (
    <div className="bg-white p-2 rounded-lg shadow-sm">
      <QRCodeSVG
        value={upiLinkResult.link}
        size={120}
        level="M"
        includeMargin={false}
      />
    </div>
  );
};

export default DynamicUPIQR;
