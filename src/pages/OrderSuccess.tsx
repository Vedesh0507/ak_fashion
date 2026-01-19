import { useLocation, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { CheckCircle, Home, Phone, MessageCircle, Smartphone, Building2, Truck } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const paymentMethodDetails: Record<string, { name: string; icon: typeof Smartphone; instruction: string }> = {
  upi: {
    name: "UPI Payment",
    icon: Smartphone,
    instruction: "Please complete the payment using the QR code and share the screenshot on WhatsApp"
  },
  netbanking: {
    name: "Net Banking",
    icon: Building2,
    instruction: "Our team will contact you with bank transfer details shortly"
  },
  cod: {
    name: "Cash on Delivery",
    icon: Truck,
    instruction: "Pay cash when you receive your beautiful outfit!"
  }
};

const OrderSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const orderId = location.state?.orderId;
  const paymentMethod = location.state?.paymentMethod || "cod";
  const paymentInfo = paymentMethodDetails[paymentMethod] || paymentMethodDetails.cod;
  const PaymentIcon = paymentInfo.icon;

  return (
    <>
      <Helmet>
        <title>Order Placed | AK Fashion Hub</title>
      </Helmet>
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-12">
          <div className="max-w-md mx-auto text-center">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-scale-in">
              <CheckCircle className="h-10 w-10 text-emerald-600" />
            </div>
            
            <h1 className="font-serif text-3xl font-semibold mb-2 animate-fade-up">
              Order Placed Successfully!
            </h1>
            
            <p className="text-muted-foreground mb-6 animate-fade-up" style={{ animationDelay: '100ms' }}>
              Thank you for shopping with AK Fashion Hub. We will contact you shortly to confirm your order.
            </p>

            {orderId && (
              <p className="text-sm bg-secondary/50 rounded-lg px-4 py-2 inline-block mb-6 animate-fade-up" style={{ animationDelay: '200ms' }}>
                Order ID: <span className="font-mono font-medium">{orderId.slice(0, 8).toUpperCase()}</span>
              </p>
            )}

            {/* Payment Method Info */}
            <div className="mb-6 p-4 bg-card rounded-xl border animate-fade-up" style={{ animationDelay: '250ms' }}>
              <div className="flex items-center justify-center gap-2 mb-2">
                <PaymentIcon className="h-5 w-5 text-gold" />
                <span className="font-medium">{paymentInfo.name}</span>
              </div>
              <p className="text-sm text-muted-foreground">{paymentInfo.instruction}</p>
            </div>

            <div className="space-y-3 animate-fade-up" style={{ animationDelay: '300ms' }}>
              <Button 
                onClick={() => navigate('/')} 
                variant="gold" 
                size="lg"
                className="w-full"
              >
                <Home className="h-4 w-4" />
                Continue Shopping
              </Button>
              
              <div className="flex gap-3">
                <a href="tel:7680924488" className="flex-1">
                  <Button variant="outline" size="lg" className="w-full">
                    <Phone className="h-4 w-4" />
                    Call Us
                  </Button>
                </a>
                <a 
                  href="https://wa.me/917680924488?text=Hi! I just placed an order and have a question."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1"
                >
                  <Button variant="whatsapp" size="lg" className="w-full">
                    <MessageCircle className="h-4 w-4" />
                    WhatsApp
                  </Button>
                </a>
              </div>
            </div>

            <div className="mt-8 p-4 bg-card rounded-xl shadow-card text-left animate-fade-up" style={{ animationDelay: '400ms' }}>
              <h3 className="font-semibold mb-2">What happens next?</h3>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-gold">1.</span>
                  We'll call you to confirm your order and delivery details
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gold">2.</span>
                  Your order will be dispatched within 1-2 business days
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gold">3.</span>
                  {paymentInfo.instruction}
                </li>
              </ul>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default OrderSuccess;
