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
    <section id="faq" className="py-20 md:py-28 bg-background relative z-10 border-t border-white/5">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row gap-16 lg:gap-24">
          
          {/* Left Column */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="md:w-2/5"
          >
            <div className="inline-block px-3 py-1 mb-6 rounded-full bg-secondary/50 border border-white/10 text-accent text-sm font-semibold tracking-wide uppercase">
              Got Questions?
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-muted-foreground mb-12">
              Find answers to the most common questions about our platform, investment strategies, and security protocols.
            </p>

            {/* Decorative block (desktop only) */}
            <div className="hidden md:block bg-card border border-white/5 rounded-xl p-6 shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none" />
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <div className="font-mono text-sm space-y-3 relative z-10">
                <div className="flex"><span className="text-accent w-24">return:</span><span className="text-green-400">"1.5% daily"</span></div>
                <div className="flex"><span className="text-accent w-24">security:</span><span className="text-white">"256-bit SSL"</span></div>
                <div className="flex"><span className="text-accent w-24">support:</span><span className="text-primary-foreground">"24/7"</span></div>
              </div>
            </div>
          </motion.div>

          {/* Right Column */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="md:w-3/5"
          >
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem 
                  key={index} 
                  value={`item-${index}`} 
                  className="bg-card border border-white/10 rounded-xl px-6 mb-4 data-[state=open]:border-primary/50 data-[state=open]:shadow-[0_0_20px_rgba(21,101,216,0.15)] transition-all"
                >
                  <AccordionTrigger className="text-left text-white hover:text-accent font-semibold text-base py-5 hover:no-underline [&[data-state=open]]:text-primary">
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