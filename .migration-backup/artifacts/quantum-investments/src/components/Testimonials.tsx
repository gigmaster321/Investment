import { useCallback, useEffect, useRef, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight, Star, Quote, BadgeCheck } from 'lucide-react';
import { motion } from 'framer-motion';

// ─── Profile photos ───────────────────────────────────────────────────────────
// @ts-ignore
import sarahImg   from '@/assets/testimonials/sarah-mitchell.jpg';
// @ts-ignore
import jamesImg   from '@/assets/testimonials/james-kensington.jpg';
// @ts-ignore
import priyaImg   from '@/assets/testimonials/priya-rajan.jpg';
// @ts-ignore
import michaelImg from '@/assets/testimonials/michael-torres.jpg';
// @ts-ignore
import amaraImg   from '@/assets/testimonials/amara-okonkwo.jpg';
// @ts-ignore
import davidImg   from '@/assets/testimonials/david-liu.jpg';

// ─── Data ─────────────────────────────────────────────────────────────────────

const REVIEWS = [
  {
    photo:    sarahImg,
    name:     'Sarah Mitchell',
    flag:     '🇺🇸',
    country:  'United States',
    plan:     'Gold Plan',
    rating:   5,
    duration: '2 years with Quantum',
    roi:      '+187% portfolio growth',
    quote:
      "I've been with Quantum for two years and my portfolio has grown 187%. The platform is intuitive, reporting is fully transparent, and withdrawals always arrive on time. It's the most professionally run investment service I've used.",
  },
  {
    photo:    jamesImg,
    name:     'James Kensington',
    flag:     '🇬🇧',
    country:  'United Kingdom',
    plan:     'Silver Plan',
    rating:   5,
    duration: '18 months with Quantum',
    roi:      '+94% portfolio growth',
    quote:
      "Fast withdrawals, zero hidden fees, and a support team that actually responds. Quantum Investments is precisely what modern investing should look like. I moved my entire portfolio here after just three months.",
  },
  {
    photo:    priyaImg,
    name:     'Priya Rajan',
    flag:     '🇸🇬',
    country:  'Singapore',
    plan:     'Platinum Plan',
    rating:   5,
    duration: '3 years with Quantum',
    roi:      '+312% portfolio growth',
    quote:
      "The Platinum Plan delivered returns that genuinely changed my financial situation. I was able to retire from full-time consulting at 38. The team's market insight is exceptional and communication is always proactive.",
  },
  {
    photo:    michaelImg,
    name:     'Michael Torres',
    flag:     '🇨🇦',
    country:  'Canada',
    plan:     'Starter Plan',
    rating:   5,
    duration: '12 months with Quantum',
    roi:      '+61% portfolio growth',
    quote:
      "Starting with just $500 on the Starter Plan gave me the confidence to invest for the first time. The dashboard makes everything simple to follow. I've since upgraded to Gold and couldn't be happier with the decision.",
  },
  {
    photo:    amaraImg,
    name:     'Amara Okonkwo',
    flag:     '🇳🇬',
    country:  'Nigeria',
    plan:     'Gold Plan',
    rating:   5,
    duration: '2 years with Quantum',
    roi:      '+203% portfolio growth',
    quote:
      "I was skeptical at first, but Quantum's track record and detailed monthly reports convinced me completely. Three years in, the consistency of returns is remarkable. I've referred six colleagues and all of them thank me.",
  },
  {
    photo:    davidImg,
    name:     'David Liu',
    flag:     '🇦🇺',
    country:  'Australia',
    plan:     'Silver Plan',
    rating:   5,
    duration: '14 months with Quantum',
    roi:      '+112% portfolio growth',
    quote:
      "The customer support team is genuinely exceptional — any question answered within the hour, no chatbots. The real-time portfolio dashboard and automated compounding made this a no-brainer long-term decision.",
  },
] as const;

const AUTOPLAY_DELAY = 4500; // ms

// ─── Star rating ──────────────────────────────────────────────────────────────

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${count} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${i < count ? 'fill-accent text-accent' : 'text-white/20'}`}
        />
      ))}
    </div>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────

function TestimonialCard({ review }: { review: (typeof REVIEWS)[number] }) {
  return (
    <div className="bg-card border border-white/8 rounded-2xl p-6 md:p-7 h-full flex flex-col relative group hover:border-white/20 transition-all duration-300 hover:shadow-[0_8px_40px_rgba(0,0,0,0.4)]">
      {/* Decorative quote mark */}
      <Quote className="absolute top-5 right-5 w-9 h-9 text-white/4 group-hover:text-primary/10 transition-colors pointer-events-none" />

      {/* Stars */}
      <StarRating count={review.rating} />

      {/* Quote */}
      <p className="text-white/85 text-[15px] leading-relaxed mt-5 mb-6 flex-1">
        "{review.quote}"
      </p>

      {/* ROI tag */}
      <div className="mb-5 flex flex-wrap gap-2">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          {review.roi}
        </span>
        <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-accent/10 text-accent border border-accent/20">
          {review.plan}
        </span>
      </div>

      {/* Divider */}
      <div className="border-t border-white/5 pt-5">
        <div className="flex items-center gap-3.5">
          {/* Avatar */}
          <div className="relative shrink-0">
            <img
              src={review.photo}
              alt={review.name}
              className="w-12 h-12 rounded-full object-cover ring-2 ring-primary/30 ring-offset-2 ring-offset-card"
              loading="lazy"
            />
            {/* Flag bubble */}
            <span
              className="absolute -bottom-1 -right-1 text-sm leading-none bg-background rounded-full w-5 h-5 flex items-center justify-center border border-white/10"
              aria-hidden="true"
            >
              {review.flag}
            </span>
          </div>

          {/* Name + badge + meta */}
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-sm font-bold text-white truncate">{review.name}</span>
              {/* Verified badge */}
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-primary bg-primary/10 border border-primary/25 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                <BadgeCheck className="w-3 h-3" />
                Verified
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {review.country} · {review.duration}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Section ──────────────────────────────────────────────────────────────────

export function Testimonials() {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: 'start',
    slidesToScroll: 1,
  });

  const [selectedIndex,  setSelectedIndex]  = useState(0);
  const [scrollSnaps,    setScrollSnaps]    = useState<number[]>([]);
  const [isHovered,      setIsHovered]      = useState(false);
  const autoplayTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Embla event listeners ──────────────────────────────────────────────────
  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on('select', onSelect);
    onSelect();
    return () => { emblaApi.off('select', onSelect); };
  }, [emblaApi, onSelect]);

  // ── Autoplay ───────────────────────────────────────────────────────────────
  const startAutoplay = useCallback(() => {
    stopAutoplay();
    autoplayTimer.current = setInterval(() => {
      if (emblaApi) emblaApi.scrollNext();
    }, AUTOPLAY_DELAY);
  }, [emblaApi]);

  const stopAutoplay = () => {
    if (autoplayTimer.current) {
      clearInterval(autoplayTimer.current);
      autoplayTimer.current = null;
    }
  };

  useEffect(() => {
    if (!emblaApi) return;
    if (isHovered) {
      stopAutoplay();
    } else {
      startAutoplay();
    }
    return stopAutoplay;
  }, [emblaApi, isHovered, startAutoplay]);

  // ── Controls ───────────────────────────────────────────────────────────────
  const scrollPrev = useCallback(() => {
    if (!emblaApi) return;
    emblaApi.scrollPrev();
    startAutoplay(); // reset timer on manual nav
  }, [emblaApi, startAutoplay]);

  const scrollNext = useCallback(() => {
    if (!emblaApi) return;
    emblaApi.scrollNext();
    startAutoplay();
  }, [emblaApi, startAutoplay]);

  const scrollTo = useCallback((index: number) => {
    if (!emblaApi) return;
    emblaApi.scrollTo(index);
    startAutoplay();
  }, [emblaApi, startAutoplay]);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <section className="py-20 md:py-28 bg-background relative z-10 overflow-hidden">
      {/* Subtle radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_40%_at_50%_50%,rgba(21,101,232,0.04),transparent)] pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">

        {/* Header row */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              What Our Investors Say
            </h2>
            <p className="text-lg text-muted-foreground">
              Real results from verified investors across the globe.
            </p>
          </motion.div>

          {/* Desktop prev / next */}
          <div className="hidden md:flex items-center gap-3 shrink-0">
            <button
              onClick={scrollPrev}
              aria-label="Previous review"
              className="w-11 h-11 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white/10 hover:border-white/40 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={scrollNext}
              aria-label="Next review"
              className="w-11 h-11 rounded-full bg-primary flex items-center justify-center text-white hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Carousel */}
        <div
          className="overflow-hidden -mx-3 px-3"
          ref={emblaRef}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onTouchStart={() => setIsHovered(true)}
          onTouchEnd={() => setIsHovered(false)}
        >
          <div className="flex gap-5">
            {REVIEWS.map((review, idx) => (
              <div
                key={idx}
                className="flex-[0_0_100%] min-w-0 sm:flex-[0_0_calc(50%-10px)] lg:flex-[0_0_calc(33.333%-14px)]"
              >
                <TestimonialCard review={review} />
              </div>
            ))}
          </div>
        </div>

        {/* Dot indicators + mobile arrows */}
        <div className="flex items-center justify-center gap-4 mt-10">
          {/* Mobile prev */}
          <button
            onClick={scrollPrev}
            aria-label="Previous review"
            className="md:hidden w-9 h-9 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Dots */}
          <div className="flex items-center gap-2">
            {scrollSnaps.map((_, idx) => (
              <button
                key={idx}
                onClick={() => scrollTo(idx)}
                aria-label={`Go to review ${idx + 1}`}
                className={`rounded-full transition-all duration-300 ${
                  idx === selectedIndex
                    ? 'w-6 h-2 bg-primary'
                    : 'w-2 h-2 bg-white/20 hover:bg-white/40'
                }`}
              />
            ))}
          </div>

          {/* Mobile next */}
          <button
            onClick={scrollNext}
            aria-label="Next review"
            className="md:hidden w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white hover:bg-primary/90 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Trust footer */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-10 text-sm text-muted-foreground"
        >
          <span className="flex items-center gap-1.5">
            <BadgeCheck className="w-4 h-4 text-primary" />
            All reviews from verified investors
          </span>
          <span className="hidden sm:block w-px h-4 bg-white/10" />
          <span>18,500+ active investors worldwide</span>
          <span className="hidden sm:block w-px h-4 bg-white/10" />
          <span>4.9 / 5 average rating</span>
        </motion.div>
      </div>
    </section>
  );
}
