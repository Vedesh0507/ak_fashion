import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import ProductsSection from "@/components/ProductsSection";
import OurStorySection from "@/components/OurStorySection";
import BenefitsSection from "@/components/BenefitsSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import MobileStickyCTA from "@/components/MobileStickyCTA";
import TrustBadges from "@/components/TrustBadges";
import ReviewsCarousel from "@/components/ReviewsCarousel";
import FAQSection from "@/components/FAQSection";
import WhatsAppFloatingButton from "@/components/WhatsAppFloatingButton";
import { Helmet } from "react-helmet-async";

const Index = () => {
  return (
    <>
      <Helmet>
        <title>AK Fashion Hub | Elegant Women's Sarees & Ethnic Wear in Hyderabad</title>
        <meta name="description" content="Shop designer sarees, Banaras sarees, dress materials & ethnic wear at AK Fashion Hub, Hyderabad. 100% quality assured, home delivery available. Call 7680924488." />
        <meta name="keywords" content="sarees hyderabad, women ethnic wear, designer sarees, banaras sarees, dress materials, AK Fashion Hub" />
        <link rel="canonical" href="https://akfashionhub.com" />
      </Helmet>
      
      <div className="min-h-screen bg-background pb-20 md:pb-0">
        <Header />
        <main>
          <HeroSection />
          <TrustBadges />
          <ProductsSection />
          <ReviewsCarousel />
          <OurStorySection />
          <BenefitsSection />
          <FAQSection />
          <ContactSection />
        </main>
        <Footer />
        <MobileStickyCTA />
        <WhatsAppFloatingButton />
      </div>
    </>
  );
};

export default Index;
