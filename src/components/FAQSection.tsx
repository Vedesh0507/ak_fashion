import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "What payment methods do you accept?",
    answer: "We accept UPI payments (PhonePe, Google Pay, etc.), Net Banking, and Cash on Delivery (COD). For online payments, please share the payment screenshot via WhatsApp."
  },
  {
    question: "What is your return/exchange policy?",
    answer: "We have a strict no returns/exchanges policy. Please check all product details, colors, and sizes carefully before placing your order. We share detailed product videos on WhatsApp to help you make the right choice."
  },
  {
    question: "How long does delivery take?",
    answer: "Orders within Hyderabad are delivered within 1-3 business days. For other cities, delivery takes 5-7 business days depending on the location."
  },
  {
    question: "Is Cash on Delivery available?",
    answer: "Yes, Cash on Delivery is available for all orders across India. COD orders require a confirmation call before dispatch."
  },
  {
    question: "How can I track my order?",
    answer: "Once your order is dispatched, we will share the tracking details via WhatsApp. You can also contact us anytime for order updates."
  },
  {
    question: "Are the product colors accurate?",
    answer: "We try our best to capture accurate colors, but slight variations may occur due to screen settings. Contact us on WhatsApp for live videos of products."
  },
];

const FAQSection = () => {
  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-muted-foreground">
            Got questions? We've got answers.
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left text-foreground hover:text-primary">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default FAQSection;
