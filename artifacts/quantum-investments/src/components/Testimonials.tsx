import { useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight, Star, Quote } from 'lucide-react';
import { motion } from 'framer-motion';

const testimonials = [
  {
    quote: "I've been with Quantum for 2 years and my portfolio has grown 180%. The team is professional and the platform is incredibly intuitive.",
    name: "Sarah M.",
    location: "New York",
    plan: "Gold Plan",
    initials: "SM"
  },
  {
    quote: "Fast withdrawals and transparent fees. Quantum Investments is exactly what modern investing should look like.",
    name: "James K.",
    location: "London",
    plan: "Silver Plan",
    initials: "JK"
  },
  {
    quote: "The Platinum Plan gave me financial freedom I never thought possible. My ROI exceeded every expectation.",
    name: "Priya R.",
    location: "Singapore",
    plan: "Platinum Plan",
    initials: "PR"
  },
  {
    quote: "Starting with just $500 on the Starter Plan gave me the confidence to scale up. Best decision I ever made.",
    name: "Michael T.",
    location: "Toronto",
    plan: "Starter Plan",
    initials: "MT"
  },
  {
    quote: "I was skeptical at first, but Quantum's track record and transparent reporting convinced me. Three years in, I'm a believer.",
    name: "Amara O.",
    location: "Lagos",
    plan: "Gold Plan",
    initials: "AO"
  },
  {
    quote: "The customer support team is exceptional. Any questions I had were answered within the hour.",
    name: "David L.",
    location: "Sydney",
    plan: "Silver Plan",
    initials: "DL"
  }
];

export function Testimonials() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'start' });

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  return (
    <section className="py-20 md:py-28 bg-background relative z-10 overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">What Our Investors Say</h2>
            <p className="text-lg text-muted-foreground">
              Real results from disciplined investors around the world.
            </p>
          </motion.div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={scrollPrev}
              className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white/10 hover:border-white/40 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={scrollNext}
              className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="overflow-hidden -mx-4 px-4" ref={emblaRef}>
          <div className="flex gap-6">
            {testimonials.map((testimonial, idx) => (
              <div 
                key={idx} 
                className="flex-[0_0_100%] min-w-0 md:flex-[0_0_calc(50%-12px)] lg:flex-[0_0_calc(33.333%-16px)]"
              >
                <div className="bg-card border border-white/10 rounded-2xl p-8 h-full flex flex-col relative group hover:border-white/20 transition-colors">
                  <Quote className="absolute top-6 right-6 w-10 h-10 text-white/5 group-hover:text-primary/10 transition-colors" />
                  
                  <div className="flex items-center gap-1 mb-6">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-accent text-accent" />
                    ))}
                  </div>
                  
                  <p className="text-white/90 text-lg leading-relaxed flex-1 mb-8 italic">
                    "{testimonial.quote}"
                  </p>
                  
                  <div className="flex items-center gap-4 mt-auto">
                    <div className="w-12 h-12 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-lg border border-primary/30">
                      {testimonial.initials}
                    </div>
                    <div>
                      <div className="font-bold text-white text-base">{testimonial.name}</div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-muted-foreground">{testimonial.location}</span>
                        <span className="w-1 h-1 rounded-full bg-white/20" />
                        <span className="text-accent font-medium px-2 py-0.5 rounded-full bg-accent/10 border border-accent/20">
                          {testimonial.plan}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
