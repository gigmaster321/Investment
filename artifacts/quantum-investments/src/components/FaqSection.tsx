import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { motion } from "framer-motion";

const faqs = [
  {
    question: "Is Quantum Investments a legitimate investment platform?",
    answer: "Yes. Quantum Investments is a fully registered and regulated investment firm, compliant with SEC guidelines. We maintain complete transparency with our investors through real-time reporting and verified audit trails."
  },
  {
    question: "What is the minimum investment amount?",
    answer: "Our Starter Plan begins at just $100, making professional investment management accessible to everyone. Higher-tier plans offer increased daily returns for larger capital commitments."
  },
  {
    question: "How are my funds protected?",
    answer: "All client funds are held in segregated accounts, protected by 256-bit SSL encryption and fully insured. We operate under strict compliance protocols to ensure the security of every deposit."
  },
  {
    question: "When can I withdraw my profits?",
    answer: "Withdrawal requests are processed within 24 hours. You can request a withdrawal at any time through your account dashboard, with funds transferred directly to your registered payment method."
  },
  {
    question: "What returns can I expect?",
    answer: "Returns vary by plan, ranging from 1.5% daily on our Starter Plan to 6.0% daily on our Platinum Plan. All returns are based on historical performance and are not guaranteed."
  },
  {
    question: "How do I get started?",
    answer: "Simply create a free account, select an investment plan that matches your goals, fund your account using any of our supported payment methods, and start earning returns immediately."
  }
];

export function FaqSection() {
  return (
    <section id="faq" className="py-20 md:py-28 bg-secondary/20 relative z-10 border-t border-white/5">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Frequently Asked Questions</h2>
            <p className="text-lg text-muted-foreground">
              Everything you need to know about investing with Quantum.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Accordion type="single" collapsible className="w-full space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem 
                  key={index} 
                  value={`item-${index}`} 
                  className="bg-card border border-white/10 rounded-xl px-6 data-[state=open]:border-primary/50 data-[state=open]:shadow-[0_0_20px_rgba(21,101,232,0.1)] transition-all"
                >
                  <AccordionTrigger className="text-left text-white hover:text-accent font-semibold text-lg py-5 hover:no-underline [&[data-state=open]]:text-primary">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed text-base pb-6 pt-2">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
