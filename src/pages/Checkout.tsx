import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  ShoppingBag, 
  MessageCircle, 
  Loader2,
  CheckCircle2
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { PaymentSection } from "@/components/checkout/PaymentSection";
import { CustomerDetailsForm } from "@/components/checkout/CustomerDetailsForm";

const Checkout = () => {
  const navigate = useNavigate();
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "upi">("cod");
  const [paymentScreenshot, setPaymentScreenshot] = useState<File | null>(null);
  const [customerDetails, setCustomerDetails] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load user profile and saved address
  useEffect(() => {
    const loadUserData = async () => {
      if (!user) return;

      try {
        // Load profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, phone, email')
          .eq('id', user.id)
          .single();

        // Load default saved address
        const { data: savedAddress } = await supabase
          .from('saved_addresses')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_default', true)
          .single();

        // Build full address string from saved address
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

        setCustomerDetails({
          name: savedAddress?.full_name || profile?.full_name || "",
          phone: savedAddress?.phone || profile?.phone || "",
          email: profile?.email || user.email || "",
          address: fullAddress,
        });
      } catch (error) {
        console.error("Error loading user data:", error);
      }
    };

    loadUserData();
  }, [user]);

  const isFormValid = () => {
    const hasRequiredFields = 
      customerDetails.name.trim() !== "" &&
      customerDetails.phone.trim() !== "" &&
      customerDetails.address.trim() !== "";
    
    if (paymentMethod === "upi") {
      return hasRequiredFields && paymentScreenshot !== null;
    }
    
    return hasRequiredFields;
  };

  const handlePlaceOrder = async () => {
    if (!isFormValid()) {
      toast({
        title: "Missing Information",
        description: paymentMethod === "upi" && !paymentScreenshot
          ? "Please upload payment screenshot"
          : "Please fill all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Create order in database
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          customer_name: customerDetails.name,
          customer_phone: customerDetails.phone,
          customer_email: customerDetails.email || null,
          customer_address: customerDetails.address,
          total_amount: totalPrice,
          payment_method: paymentMethod,
          user_id: user?.id || null,
          status: paymentMethod === "upi" ? "payment_received" : "pending",
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Add order items
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        product_name: item.product.name,
        product_price: Number(item.product.price),
        quantity: item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Send WhatsApp notification
      sendWhatsAppNotification(order.id);
      
      // Clear cart
      await clearCart();

      // Navigate to success page
      navigate(`/order-success?orderId=${order.id}`);
    } catch (error) {
      console.error("Order error:", error);
      toast({
        title: "Order Failed",
        description: "Something went wrong. Please try again or contact support.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const sendWhatsAppNotification = (orderId: string) => {
    let message = `🛍️ *New Order Received!*\n\n`;
    message += `*Order ID:* ${orderId.slice(0, 8).toUpperCase()}\n`;
    message += `*Customer:* ${customerDetails.name}\n`;
    message += `*Phone:* ${customerDetails.phone}\n`;
    message += `*Address:* ${customerDetails.address}\n\n`;
    message += `*Payment:* ${paymentMethod === "cod" ? "Cash on Delivery" : "UPI (Screenshot uploaded)"}\n\n`;
    message += `*Items:*\n`;
    
    items.forEach((item, index) => {
      message += `${index + 1}. ${item.product.name} x${item.quantity} - ₹${(Number(item.product.price) * item.quantity).toLocaleString()}\n`;
    });
    
    message += `\n*Total: ₹${totalPrice.toLocaleString()}*`;
    
    window.open(`https://wa.me/917680924488?text=${encodeURIComponent(message)}`, '_blank');
  };

  if (items.length === 0) {
    return (
      <>
        <Helmet>
          <title>Checkout | AK Fashion Hub</title>
        </Helmet>
        <div className="min-h-screen bg-background">
          <Header />
          <main className="container mx-auto px-4 py-12">
            <div className="max-w-md mx-auto text-center">
              <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h1 className="font-serif text-2xl font-semibold mb-2">Your cart is empty</h1>
              <p className="text-muted-foreground mb-6">Add some beautiful pieces to your cart first!</p>
              <Button onClick={() => navigate('/')} variant="gold">
                Continue Shopping
              </Button>
            </div>
          </main>
          <Footer />
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Checkout | AK Fashion Hub</title>
      </Helmet>
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Button 
            variant="ghost" 
            className="mb-6"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Cart
          </Button>

          <div className="max-w-4xl mx-auto">
            <h1 className="font-serif text-2xl md:text-3xl font-semibold mb-6">Checkout</h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Customer Details */}
                <CustomerDetailsForm 
                  details={customerDetails}
                  onChange={setCustomerDetails}
                />

                {/* Payment Method */}
                <PaymentSection
                  paymentMethod={paymentMethod}
                  onPaymentMethodChange={setPaymentMethod}
                  paymentScreenshot={paymentScreenshot}
                  onScreenshotChange={setPaymentScreenshot}
                  totalAmount={totalPrice}
                />
              </div>

              {/* Order Summary Sidebar */}
              <div className="lg:col-span-1">
                <div className="bg-card rounded-2xl p-6 shadow-card sticky top-24">
                  <h2 className="font-serif text-lg font-semibold mb-4 flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5" />
                    Order Summary
                  </h2>
                  
                  <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                    {items.map(item => (
                      <div key={item.id} className="flex gap-3">
                        <div className="w-12 h-14 rounded-lg overflow-hidden bg-cream flex-shrink-0">
                          {item.product.image_url ? (
                            <img 
                              src={item.product.image_url} 
                              alt={item.product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-muted">
                              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium line-clamp-1">{item.product.name}</h4>
                          <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                          <p className="text-gold font-bold text-sm">
                            ₹{(Number(item.product.price) * item.quantity).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>₹{totalPrice.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Delivery</span>
                      <span className="text-emerald-600">FREE</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg pt-2 border-t">
                      <span>Total</span>
                      <span className="text-gold">₹{totalPrice.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Place Order Button */}
                  <Button
                    variant="gold"
                    size="lg"
                    className="w-full mt-6"
                    onClick={handlePlaceOrder}
                    disabled={!isFormValid() || isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Placing Order...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Place Order
                      </>
                    )}
                  </Button>

                  {paymentMethod === "upi" && !paymentScreenshot && (
                    <p className="text-xs text-center text-destructive mt-2">
                      Upload payment screenshot to proceed
                    </p>
                  )}

                  <div className="flex items-center justify-center gap-2 mt-4 text-xs text-muted-foreground">
                    <MessageCircle className="h-3.5 w-3.5" />
                    Order details will be sent via WhatsApp
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Checkout;
