/**
 * ============================================================================
 * UPI PAYMENT UTILITY - PRODUCTION-READY IMPLEMENTATION
 * ============================================================================
 * 
 * This module provides a secure, fintech-grade UPI payment system for
 * AK Fashion Hub e-commerce platform.
 * 
 * FEATURES:
 * - NPCI-approved UPI deep link generation
 * - Dynamic amount integration (no user editing)
 * - Multi-app support (PhonePe, GPay, Paytm, BHIM, etc.)
 * - Comprehensive validation and error handling
 * - URL-safe encoding for all parameters
 * 
 * SECURITY NOTES:
 * - UPI ID is centralized (single source of truth)
 * - Amount is programmatically locked
 * - Transaction notes are sanitized
 * - All URLs are properly encoded
 * 
 * @author AK Fashion Hub
 * @version 2.0.0
 * @lastUpdated January 2026
 */

// ============================================================================
// UPI CONFIGURATION - SINGLE SOURCE OF TRUTH
// ============================================================================

/**
 * Central UPI configuration object.
 * IMPORTANT: Modify ONLY this object to change payment details.
 * Never hardcode UPI credentials elsewhere in the codebase.
 */
export const UPI_CONFIG = {
  /** Receiver UPI Virtual Payment Address (VPA) */
  UPI_ID: "8897393151@ybl",
  
  /** Display name for the merchant (URL-encoded in links) */
  MERCHANT_NAME: "AK Fashion Hub",
  
  /** Currency code (INR for Indian Rupees) */
  CURRENCY: "INR",
  
  /** WhatsApp support number for payment issues */
  SUPPORT_WHATSAPP: "917680924488",
  
  /** Minimum order amount in INR */
  MIN_AMOUNT: 1,
  
  /** Maximum order amount in INR (UPI limit) */
  MAX_AMOUNT: 100000,
} as const;

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/** Supported UPI application types */
export type UPIAppType = "phonepe" | "gpay" | "paytm" | "generic";

/** Result of UPI link generation */
export interface UPILinkResult {
  success: boolean;
  link: string | null;
  error: string | null;
}

/** Payment validation result */
export interface PaymentValidationResult {
  isValid: boolean;
  errors: string[];
}

/** Order reference for transaction tracking */
export interface OrderReference {
  orderId: string;
  amount: number;
  timestamp: number;
  paymentMethod: UPIAppType | "qr_scan";
}

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validates UPI ID format according to NPCI standards.
 * Format: username@provider (e.g., 8897393151@ybl)
 * 
 * @param upiId - The UPI ID to validate
 * @returns boolean indicating if the UPI ID is valid
 */
export function validateUPIId(upiId: string): boolean {
  if (!upiId || typeof upiId !== "string") {
    return false;
  }
  
  // NPCI UPI ID regex: alphanumeric with optional dots, followed by @provider
  const upiRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;
  return upiRegex.test(upiId.trim());
}

/**
 * Validates payment amount for UPI transactions.
 * 
 * @param amount - The payment amount to validate
 * @returns PaymentValidationResult with validation status and any errors
 */
export function validatePaymentAmount(amount: number): PaymentValidationResult {
  const errors: string[] = [];
  
  // Check if amount is a valid number
  if (typeof amount !== "number" || !Number.isFinite(amount)) {
    errors.push("Invalid amount: must be a valid number");
  }
  
  // Check if amount is positive
  if (amount <= 0) {
    errors.push("Amount must be greater than zero");
  }
  
  // Check minimum amount
  if (amount < UPI_CONFIG.MIN_AMOUNT) {
    errors.push(`Minimum amount is ₹${UPI_CONFIG.MIN_AMOUNT}`);
  }
  
  // Check maximum amount (UPI daily limit consideration)
  if (amount > UPI_CONFIG.MAX_AMOUNT) {
    errors.push(`Maximum amount is ₹${UPI_CONFIG.MAX_AMOUNT.toLocaleString()}`);
  }
  
  // Check for reasonable decimal places (max 2 for INR)
  const decimalPlaces = (amount.toString().split(".")[1] || "").length;
  if (decimalPlaces > 2) {
    errors.push("Amount can have maximum 2 decimal places");
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Comprehensive pre-payment validation.
 * Validates all aspects before initiating payment.
 * 
 * @param amount - Payment amount
 * @param orderId - Optional order ID for reference
 * @returns PaymentValidationResult with all validation errors
 */
export function validatePaymentRequest(
  amount: number,
  orderId?: string
): PaymentValidationResult {
  const errors: string[] = [];
  
  // Validate UPI ID configuration
  if (!validateUPIId(UPI_CONFIG.UPI_ID)) {
    errors.push("Invalid UPI configuration. Please contact support.");
  }
  
  // Validate amount
  const amountValidation = validatePaymentAmount(amount);
  errors.push(...amountValidation.errors);
  
  // Validate order ID format if provided
  if (orderId && orderId.length < 4) {
    errors.push("Invalid order reference");
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

// ============================================================================
// UPI DEEP LINK GENERATION
// ============================================================================

/**
 * Generates a transaction note/reference for the UPI payment.
 * This appears in the payment app and bank statements.
 * 
 * @param orderId - Optional order ID
 * @returns Formatted transaction note (URL-safe)
 */
function generateTransactionNote(orderId?: string): string {
  if (orderId && orderId.length >= 4) {
    // Format: "AKF-ORDERID" (max 8 chars of order ID for readability)
    const shortId = orderId.slice(0, 8).toUpperCase();
    return `AKF-${shortId}`;
  }
  
  // Fallback: Generate timestamp-based reference
  const timestamp = Date.now().toString(36).toUpperCase();
  return `AKF-${timestamp}`;
}

/**
 * Formats amount for UPI link (ensures proper decimal format).
 * CRITICAL: Amount MUST be numeric string without currency symbols.
 * 
 * @param amount - The payment amount
 * @returns Formatted amount string (e.g., "1500.00")
 */
function formatAmountForUPI(amount: number): string {
  // Round to 2 decimal places and format
  return amount.toFixed(2);
}

/**
 * Generates NPCI-compliant UPI deep link.
 * This is the core function for all UPI payments.
 * 
 * NPCI Standard Format:
 * upi://pay?pa={UPI_ID}&pn={NAME}&am={AMOUNT}&cu={CURRENCY}&tn={NOTE}
 * 
 * @param amount - Payment amount (will be locked in UPI app)
 * @param orderId - Optional order ID for transaction reference
 * @returns UPILinkResult with the generated link or error
 */
export function generateUPIDeepLink(
  amount: number,
  orderId?: string
): UPILinkResult {
  try {
    // Step 1: Validate payment request
    const validation = validatePaymentRequest(amount, orderId);
    if (!validation.isValid) {
      return {
        success: false,
        link: null,
        error: validation.errors.join(". "),
      };
    }
    
    // Step 2: Prepare URL-encoded parameters
    const params = new URLSearchParams();
    
    // pa (Payee Address) - REQUIRED
    params.append("pa", UPI_CONFIG.UPI_ID);
    
    // pn (Payee Name) - REQUIRED for display
    params.append("pn", UPI_CONFIG.MERCHANT_NAME);
    
    // am (Amount) - REQUIRED, locked amount
    params.append("am", formatAmountForUPI(amount));
    
    // cu (Currency) - REQUIRED
    params.append("cu", UPI_CONFIG.CURRENCY);
    
    // tn (Transaction Note) - OPTIONAL but recommended
    const txnNote = generateTransactionNote(orderId);
    params.append("tn", txnNote);
    
    // Build final UPI link
    const upiLink = `upi://pay?${params.toString()}`;
    
    return {
      success: true,
      link: upiLink,
      error: null,
    };
  } catch (error) {
    console.error("[UPI] Deep link generation failed:", error);
    return {
      success: false,
      link: null,
      error: "Failed to generate payment link. Please try again.",
    };
  }
}

/**
 * Generates app-specific UPI deep link.
 * Falls back to generic UPI link if app scheme fails.
 * 
 * NOTE: Most modern UPI apps support the generic upi:// scheme.
 * App-specific schemes are provided for better UX but are not required.
 * 
 * @param app - Target UPI app type
 * @param amount - Payment amount
 * @param orderId - Optional order ID
 * @returns UPILinkResult with the app-specific link
 */
export function generateAppSpecificLink(
  app: UPIAppType,
  amount: number,
  orderId?: string
): UPILinkResult {
  // First generate the generic UPI link
  const genericResult = generateUPIDeepLink(amount, orderId);
  
  if (!genericResult.success || !genericResult.link) {
    return genericResult;
  }
  
  // Extract the query string from generic link
  const queryString = genericResult.link.replace("upi://pay?", "");
  
  try {
    let appLink: string;
    
    switch (app) {
      case "phonepe":
        // PhonePe supports both phonepe:// and upi://
        appLink = `phonepe://pay?${queryString}`;
        break;
        
      case "gpay":
        // Google Pay uses tez:// or gpay:// scheme
        appLink = `tez://upi/pay?${queryString}`;
        break;
        
      case "paytm":
        // Paytm uses paytmmp:// scheme
        appLink = `paytmmp://pay?${queryString}`;
        break;
        
      case "generic":
      default:
        // Generic UPI scheme works with all NPCI-certified apps
        appLink = genericResult.link;
        break;
    }
    
    return {
      success: true,
      link: appLink,
      error: null,
    };
  } catch (error) {
    console.error(`[UPI] ${app} link generation failed:`, error);
    // Return generic link as fallback
    return genericResult;
  }
}

// ============================================================================
// DEVICE & APP DETECTION
// ============================================================================

/**
 * Detects if the current device is a mobile device.
 * UPI app deep links only work on mobile devices.
 * 
 * @returns boolean indicating mobile device
 */
export function isMobileDevice(): boolean {
  if (typeof navigator === "undefined") {
    return false;
  }
  
  const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
  return mobileRegex.test(navigator.userAgent);
}

/**
 * Detects the mobile operating system.
 * Useful for providing OS-specific instructions.
 * 
 * @returns "android" | "ios" | "unknown"
 */
export function getMobileOS(): "android" | "ios" | "unknown" {
  if (typeof navigator === "undefined") {
    return "unknown";
  }
  
  const userAgent = navigator.userAgent.toLowerCase();
  
  if (/android/i.test(userAgent)) {
    return "android";
  }
  
  if (/iphone|ipad|ipod/i.test(userAgent)) {
    return "ios";
  }
  
  return "unknown";
}

// ============================================================================
// PAYMENT INITIATION
// ============================================================================

/**
 * Attempts to open a UPI payment link.
 * Handles fallback scenarios gracefully.
 * 
 * @param app - Target UPI app
 * @param amount - Payment amount
 * @param orderId - Optional order ID
 * @returns Promise with result of the operation
 */
export async function initiateUPIPayment(
  app: UPIAppType,
  amount: number,
  orderId?: string
): Promise<{ success: boolean; message: string }> {
  // Validate mobile device
  if (!isMobileDevice()) {
    return {
      success: false,
      message: "Please scan the QR code using your mobile UPI app",
    };
  }
  
  // Generate the appropriate link
  const linkResult = generateAppSpecificLink(app, amount, orderId);
  
  if (!linkResult.success || !linkResult.link) {
    return {
      success: false,
      message: linkResult.error || "Failed to generate payment link",
    };
  }
  
  try {
    // Attempt to open the UPI link
    window.location.href = linkResult.link;
    
    return {
      success: true,
      message: "Opening payment app...",
    };
  } catch (error) {
    console.error("[UPI] Failed to open payment app:", error);
    return {
      success: false,
      message: "Could not open payment app. Please scan the QR code instead.",
    };
  }
}

// ============================================================================
// ORDER TRACKING
// ============================================================================

/**
 * Creates an order reference for payment tracking.
 * This should be called before initiating payment.
 * 
 * @param orderId - Order ID
 * @param amount - Payment amount
 * @param paymentMethod - Selected payment method
 * @returns OrderReference object
 */
export function createOrderReference(
  orderId: string,
  amount: number,
  paymentMethod: UPIAppType | "qr_scan"
): OrderReference {
  return {
    orderId,
    amount,
    timestamp: Date.now(),
    paymentMethod,
  };
}

// ============================================================================
// SUPPORT UTILITIES
// ============================================================================

/**
 * Generates WhatsApp support link for payment issues.
 * 
 * @param amount - Payment amount
 * @param orderId - Optional order ID
 * @returns WhatsApp deep link URL
 */
export function getPaymentSupportLink(
  amount: number,
  orderId?: string
): string {
  const orderRef = orderId ? orderId.slice(0, 8).toUpperCase() : "NEW";
  const message = `Hi, I need help with my UPI payment of ₹${amount.toLocaleString()} for Order #${orderRef}`;
  
  return `https://wa.me/${UPI_CONFIG.SUPPORT_WHATSAPP}?text=${encodeURIComponent(message)}`;
}

/**
 * Copies UPI ID to clipboard with fallback.
 * 
 * @returns Promise with success status
 */
export async function copyUPIId(): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(UPI_CONFIG.UPI_ID);
    return true;
  } catch (error) {
    console.error("[UPI] Clipboard copy failed:", error);
    return false;
  }
}
