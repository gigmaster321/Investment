import { motion } from 'framer-motion';
// @ts-ignore
import elonImg from '@assets/image_1784832779388.png';
// @ts-ignore
import jaredImg from '@assets/image_1784832788817.png';

const LEADERS = [
  {
    photo: elonImg,
    name: 'Elon Musk',
    title: 'Chief Executive Officer',
    bio: 'A visionary entrepreneur and technologist with a track record of building world-changing companies across energy, aerospace, and finance. Under his leadership, Quantum Investments drives bold, data-driven strategies that consistently deliver superior returns for investors worldwide.',
    objectPosition: 'center top',
  },
  {
    photo: jaredImg,
    name: 'Jared Birchall',
    title: 'Manager',
    bio: 'A seasoned financial executive with deep expertise in wealth management, capital allocation, and portfolio strategy. Jared oversees day-to-day operations and investment execution, ensuring every client portfolio is managed with precision, discipline, and long-term growth in mind.',
    objectPosition: 'center top',
  },
] as const;

export function LeadershipSection() {
  return (
    <section className="py-20 md:py-28 bg-background relative z-10 overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_60%,rgba(21,101,232,0.05),transparent)] pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14 md:mb-16"
        >
          <span className="inline-block text-xs font-bold uppercase tracking-[0.2em] text-accent mb-4">
            Our Management
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            Meet Our Leadership
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Guided by industry leaders with decades of experience in global finance and investment strategy.
          </p>
        </motion.div>

        {/* Cards */}
        <div className="flex flex-col sm:flex-row justify-center gap-8 md:gap-10 max-w-3xl mx-auto">
          {LEADERS.map((leader, i) => (
            <motion.div
              key={leader.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              className="flex-1 min-w-0 bg-card border border-white/8 rounded-2xl overflow-hidden group hover:border-white/20 hover:shadow-[0_12px_48px_rgba(0,0,0,0.45)] transition-all duration-300"
            >
              {/* Photo */}
              <div className="relative w-full aspect-[4/4] overflow-hidden bg-muted">
                <img
                  src={leader.photo}
                  alt={leader.name}
                  className="w-full h-full object-cover object-top group-hover:scale-[1.03] transition-transform duration-500"
                  style={{ objectPosition: leader.objectPosition }}
                  loading="lazy"
                />
                {/* Gradient overlay at bottom of photo */}
                <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-card to-transparent" />
              </div>

              {/* Content */}
              <div className="px-7 py-6">
                {/* Name + title */}
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-white mb-1">{leader.name}</h3>
                  <span className="inline-flex items-center text-xs font-semibold uppercase tracking-[0.15em] px-3 py-1 rounded-full bg-primary/15 text-primary border border-primary/25">
                    {leader.title}
                  </span>
                </div>

                {/* Divider */}
                <div className="border-t border-white/6 mb-4" />

                {/* Bio */}
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {leader.bio}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
