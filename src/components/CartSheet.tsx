import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ShoppingCart, Plus, Minus, Trash2, ShoppingBag, ArrowLeft, Truck, Smartphone, Upload, X, CheckCircle2, LogIn, UserCircle, QrCode, Lock } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { DynamicUPIQR } from "@/components/checkout/DynamicUPIQR";
import { UPI_CONFIG } from "@/lib/upi-payment";

type ViewState = "cart" | "payment";

interface SavedAddress {
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string;
  pincode: string;
}

const CartSheet = () => {
  const { items, totalItems, totalPrice, updateQuantity, removeFromCart, isLoading, clearCart } = useCart();
  const { user, isProfileComplete, profile } = useAuth();
  const navigate = useNavigate();
  
  const [view, setView] = useState<ViewState>("cart");
  const [paymentMethod, setPaymentMethod] = useState<string>("cod");
  const [paymentScreenshot, setPaymentScreenshot] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [savedAddress, setSavedAddress] = useState<SavedAddress | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load saved address when user is logged in
  useEffect(() => {
    const loadSavedAddress = async () => {
      if (!user) {
        setSavedAddress(null);
        return;
      }

      try {
        const { data } = await supabase
          .from('saved_addresses')
          .select('full_name, phone, address_line1, address_line2, city, state, pincode')
          .eq('user_id', user.id)
          .eq('is_default', true)
          .single();

        if (data) {
          setSavedAddress(data);
        }
      } catch (error) {
        console.error("Error loading saved address:", error);
      }
    };

    loadSavedAddress();
  }, [user]);

  const handleProceedToPayment = () => {
    if (items.length === 0) return;
    
    // Check if user is logged in
    if (!user) {
      setIsOpen(false);
      navigate('/auth', { 
        state: { 
          returnTo: '/',
          message: 'Please login or create an account to continue' 
        }
      });
      return;
    }
    
    // Check if profile is complete
    if (!isProfileComplete) {
      setIsOpen(false);
      navigate('/profile');
      toast.info('Please complete your profile to place orders');
      return;
    }
    
    setView("payment");
  };

  const handleBackToCart = () => {
    setView("cart");
    setPaymentMethod("cod");
    setPaymentScreenshot(null);
    setScreenshotPreview(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error("Please upload an image file");
        return;
      }
      setPaymentScreenshot(file);
      const reader = new FileReader();
      reader.onload = () => setScreenshotPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const removeScreenshot = () => {
    setPaymentScreenshot(null);
    setScreenshotPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handlePlaceOrder = () => {
    if (items.length === 0) return;
    
    if (paymentMethod === "upi" && !paymentScreenshot) {
      toast.error("Please upload payment screenshot");
      return;
    }

    setIsSubmitting(true);

    // Build full address string
    let fullAddress = "";
    if (savedAddress) {
      const addressParts = [
        savedAddress.address_line1,
        savedAddress.address_line2,
        savedAddress.city,
        savedAddress.state,
        savedAddress.pincode
      ].filter(Boolean);
      fullAddress = addressParts.join(", ");
    }

    let message = `🛒 *New Order*\n\n`;
    message += `*Customer:* ${savedAddress?.full_name || profile?.full_name}\n`;
    message += `*Phone:* ${savedAddress?.phone || profile?.phone}\n`;
    message += `*Email:* ${profile?.email}\n`;
    message += `*Delivery Address:* ${fullAddress}\n\n`;
    message += `*Payment Method:* ${paymentMethod === "cod" ? "Cash on Delivery" : "Online Payment (UPI)"}\n\n`;
    message += `*Order Details:*\n`;
    
    items.forEach((item, index) => {
      message += `${index + 1}. *${item.product.name}*\n`;
      message += `   Price: ₹${Number(item.product.price).toLocaleString()}\n`;
      message += `   Quantity: ${item.quantity}\n\n`;
    });
    
    message += `*Total Amount: ₹${totalPrice.toLocaleString()}*\n\n`;
    
    if (paymentMethod === "upi") {
      message += `✅ Payment screenshot uploaded - will share separately\n\n`;
    }
    
    message += `Please confirm the order and share delivery details.`;
    
    window.open(`https://wa.me/917680924488?text=${encodeURIComponent(message)}`, '_blank');
    
    // Reset state
    setIsSubmitting(false);
    setView("cart");
    setPaymentMethod("cod");
    setPaymentScreenshot(null);
    setScreenshotPreview(null);
    clearCart();
    setIsOpen(false);
    toast.success("Order placed! Please complete the conversation on WhatsApp.");
  };

  const canPlaceOrder = paymentMethod === "cod" || (paymentMethod === "upi" && paymentScreenshot);

  const getCheckoutButton = () => {
    if (!user) {
      return (
        <Button 
          size="lg" 
          className="w-full"
          onClick={() => {
            setIsOpen(false);
            navigate('/auth', { 
              state: { 
                returnTo: '/',
                message: 'Please login or create an account to continue' 
              }
            });
          }}
        >
          <LogIn className="h-5 w-5 mr-2" />
          Login to Checkout
        </Button>
      );
    }
    
    if (!isProfileComplete) {
      return (
        <Button 
          size="lg" 
          className="w-full"
          onClick={() => {
            setIsOpen(false);
            navigate('/profile');
            toast.info('Please complete your profile to place orders');
          }}
        >
          <UserCircle className="h-5 w-5 mr-2" />
          Complete Your Profile
        </Button>
      );
    }
    
    return (
      <Button 
        size="lg" 
        className="w-full bg-gold hover:bg-gold/90 text-gold-foreground"
        onClick={handleProceedToPayment}
      >
        Proceed to Payment
      </Button>
    );
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => { 
      setIsOpen(open);
      if (!open) handleBackToCart(); 
    }}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <ShoppingCart className="h-5 w-5" />
          {totalItems > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-gold text-xs font-bold flex items-center justify-center text-slate-900">
              {totalItems}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md flex flex-col p-0">
        {view === "cart" ? (
          <>
            {/* Cart View */}
            <SheetHeader className="p-4 border-b">
              <SheetTitle className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5" />
                Your Cart ({totalItems} items)
              </SheetTitle>
            </SheetHeader>
            
            <div className="flex-1 overflow-y-auto p-4">
              {isLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-center">
                  <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Your cart is empty</p>
                  <p className="text-sm text-muted-foreground mt-1">Add items to get started</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3 p-3 bg-secondary/50 rounded-lg">
                      <div className="w-20 h-24 rounded-md overflow-hidden bg-cream flex-shrink-0">
                        {item.product.image_url ? (
                          <img 
                            src={item.product.image_url} 
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-muted">
                            <ShoppingBag className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm line-clamp-2">{item.product.name}</h4>
                        <p className="text-xs text-muted-foreground mt-0.5">{item.product.category}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-gold font-bold">₹{Number(item.product.price).toLocaleString()}</span>
                          {item.product.original_price && (
                            <span className="text-xs text-muted-foreground line-through">
                              ₹{Number(item.product.original_price).toLocaleString()}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2 mt-2">
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-7 w-7"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-7 w-7"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7 text-destructive hover:text-destructive ml-auto"
                            onClick={() => removeFromCart(item.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {items.length > 0 && (
              <div className="border-t p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-bold text-lg text-gold">₹{totalPrice.toLocaleString()}</span>
                </div>
                {getCheckoutButton()}
              </div>
            )}
          </>
        ) : (
          <>
            {/* Payment View */}
            <SheetHeader className="p-4 border-b">
              <SheetTitle className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5" />
                Payment
              </SheetTitle>
            </SheetHeader>

            <div className="flex-1 overflow-y-auto p-4">
              <button 
                onClick={handleBackToCart}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Cart
              </button>

              <h3 className="font-semibold mb-4">Select Payment Method</h3>

              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3">
                {/* Cash on Delivery */}
                <Label
                  htmlFor="cod"
                  className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
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
                    <span className="font-medium">Cash on Delivery</span>
                    <p className="text-sm text-muted-foreground">Pay when you receive your order</p>
                  </div>
                </Label>

                {/* Online Payment (UPI) */}
                <Label
                  htmlFor="upi"
                  className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
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
                    <span className="font-medium">Online Payment (UPI)</span>
                    <p className="text-sm text-muted-foreground">Pay via PhonePe, GPay, or any UPI app</p>
                  </div>
                </Label>
              </RadioGroup>

              {/* UPI Payment Section */}
              {paymentMethod === "upi" && (
                <div className="mt-4 p-4 bg-secondary/30 rounded-lg border animate-fade-up">
                  <div className="text-center space-y-3">
                    {/* Amount Display - LOCKED */}
                    <div className="bg-gold/10 p-3 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Amount to Pay</p>
                      <p className="text-2xl font-bold text-gold">₹{totalPrice.toLocaleString()}</p>
                      <div className="flex items-center justify-center gap-1 mt-1 text-xs text-muted-foreground">
                        <Lock className="h-3 w-3" />
                        <span>Amount is locked in QR</span>
                      </div>
                    </div>
                    
                    {/* Dynamic QR Code */}
                    <div className="flex justify-center py-2">
                      <DynamicUPIQR
                        amount={totalPrice}
                        size={180}
                      />
                    </div>
                    
                    <div className="bg-emerald-50 dark:bg-emerald-950/30 p-3 rounded-lg text-sm space-y-1 text-left">
                      <p className="font-semibold text-emerald-700 dark:text-emerald-400">How to Pay:</p>
                      <p className="text-emerald-600 dark:text-emerald-300">1. Open <strong>PhonePe / GPay / Paytm</strong> app</p>
                      <p className="text-emerald-600 dark:text-emerald-300">2. Tap on <strong>"Scan QR"</strong> option</p>
                      <p className="text-emerald-600 dark:text-emerald-300">3. Scan the QR code above</p>
                      <p className="text-emerald-600 dark:text-emerald-300">4. Amount <strong className="text-gold">₹{totalPrice.toLocaleString()}</strong> will be pre-filled</p>
                      <p className="text-emerald-600 dark:text-emerald-300">5. Complete payment & <strong>take screenshot</strong></p>
                    </div>
                    
                    <p className="text-xs text-muted-foreground pt-2">
                      Pay to: <strong>{UPI_CONFIG.MERCHANT_NAME}</strong> | UPI: <strong>{UPI_CONFIG.UPI_ID}</strong>
                    </p>
                  </div>

                  {/* Screenshot Upload */}
                  <div className="mt-6 pt-4 border-t">
                    <p className="text-sm font-medium mb-3 text-center">Upload Payment Screenshot *</p>
                    
                    {screenshotPreview ? (
                      <div className="relative">
                        <img 
                          src={screenshotPreview} 
                          alt="Payment screenshot" 
                          className="w-full max-h-48 object-contain rounded-lg border"
                        />
                        <button 
                          onClick={removeScreenshot}
                          className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full"
                        >
                          <X className="h-4 w-4" />
                        </button>
                        <div className="flex items-center justify-center gap-1 mt-2 text-sm text-emerald-600">
                          <CheckCircle2 className="h-4 w-4" />
                          Screenshot uploaded
                        </div>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-gold/50 transition-colors">
                        <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                        <span className="text-sm text-muted-foreground">Click to upload screenshot</span>
                        <input 
                          ref={fileInputRef}
                          type="file" 
                          accept="image/*" 
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Total Amount</span>
                <span className="font-bold text-lg text-gold">₹{totalPrice.toLocaleString()}</span>
              </div>
              <Button 
                size="lg" 
                className="w-full"
                onClick={handlePlaceOrder}
                disabled={!canPlaceOrder || isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                    Processing...
                  </span>
                ) : (
                  `Place Order (${paymentMethod === "cod" ? "COD" : "UPI"})`
                )}
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartSheet;
