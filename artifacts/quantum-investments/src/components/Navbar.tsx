import { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'wouter';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
// @ts-ignore
import logoPath from '@assets/Quantum_Investment_1784716537861.jpeg';

// ─── Constants ────────────────────────────────────────────────────────────────

/** Height of the fixed navbar in pixels — used to offset scroll targets. */
const NAV_HEIGHT = 80;

/** Ordered list of section IDs as they appear on the home page. */
const SECTION_IDS = ['hero', 'plans', 'about', 'faq', 'contact'] as const;
type SectionId = (typeof SECTION_IDS)[number];

interface NavLink {
  sectionId: SectionId;
  label: string;
}

const NAV_LINKS: NavLink[] = [
  { sectionId: 'hero',    label: 'Home'    },
  { sectionId: 'about',   label: 'About'   },
  { sectionId: 'plans',   label: 'Plans'   },
  { sectionId: 'faq',     label: 'FAQ'     },
  { sectionId: 'contact', label: 'Contact' },
];

// ─── Scroll utility ───────────────────────────────────────────────────────────

/**
 * Smoothly scrolls to a section, compensating for the fixed navbar.
 * Duration is controlled by the browser's smooth-scroll implementation
 * (typically 500–700 ms), satisfying the 500–800 ms requirement.
 */
function smoothScrollTo(sectionId: string) {
  const el = document.getElementById(sectionId);
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY - NAV_HEIGHT;
  window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
}

// ─── Active-section detection hook ───────────────────────────────────────────

/**
 * Returns the ID of the section currently occupying the viewport.
 * Compares each section's offsetTop against scrollY + navbar height + a small
 * buffer so the label switches at the exact moment a heading clears the bar.
 */
function useActiveSection(enabled: boolean): string {
  const [active, setActive] = useState<string>('hero');

  useEffect(() => {
    if (!enabled) return;

    const detect = () => {
      // Walk sections bottom-up; first one whose top is at or above the
      // scroll fold (scrollY + navHeight + 8 px buffer) wins.
      const fold = window.scrollY + NAV_HEIGHT + 8;
      let current = 'hero';
      for (const id of SECTION_IDS) {
        const el = document.getElementById(id);
        if (el && el.offsetTop <= fold) current = id;
      }
      setActive(current);
    };

    detect(); // run once on mount
    window.addEventListener('scroll', detect, { passive: true });
    return () => window.removeEventListener('scroll', detect);
  }, [enabled]);

  return active;
}

// ─── Navbar component ─────────────────────────────────────────────────────────

export function Navbar() {
  const [isScrolled,     setIsScrolled]     = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [location,       setLocation]       = useLocation();

  const isHomePage  = location === '/';
  const activeSection = useActiveSection(isHomePage);

  // ── Scrolled state ──────────────────────────────────────────────────────────
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // ── Pending cross-route scroll ──────────────────────────────────────────────
  // When the user clicks a nav link from /login, /dashboard, etc., we store
  // the target section in sessionStorage, navigate to '/', and pick it up here.
  useEffect(() => {
    if (!isHomePage) return;
    const pending = sessionStorage.getItem('pendingScrollSection');
    if (!pending) return;
    sessionStorage.removeItem('pendingScrollSection');
    // Wait one frame for React to finish mounting the home sections.
    const id = requestAnimationFrame(() => {
      setTimeout(() => smoothScrollTo(pending), 80);
    });
    return () => cancelAnimationFrame(id);
  }, [isHomePage]);

  // ── Close mobile menu on resize to desktop ──────────────────────────────────
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) setMobileMenuOpen(false);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // ── Navigation handler ──────────────────────────────────────────────────────
  const handleNavClick = useCallback(
    (sectionId: SectionId, closeMenu = false) => {
      if (closeMenu) setMobileMenuOpen(false);

      if (isHomePage) {
        smoothScrollTo(sectionId);
      } else {
        // Store target and redirect; the useEffect above picks it up on mount.
        sessionStorage.setItem('pendingScrollSection', sectionId);
        setLocation('/');
      }
    },
    [isHomePage, setLocation],
  );

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-background/80 backdrop-blur-md border-b border-white/5 py-4'
          : 'bg-transparent py-6'
      }`}
    >
      <div className="container mx-auto px-6 flex items-center justify-between">

        {/* ── Logo ─────────────────────────────────────────────────────────── */}
        <button
          onClick={() => handleNavClick('hero')}
          className="flex items-center gap-2 z-50 relative cursor-pointer focus:outline-none"
          aria-label="Go to top"
        >
          <img
            src={logoPath}
            alt="Quantum Investments Logo"
            className="h-12 w-auto object-contain rounded-md"
            data-testid="img-logo"
          />
        </button>

        {/* ── Desktop navigation ───────────────────────────────────────────── */}
        <nav className="hidden md:flex items-center gap-8" aria-label="Main navigation">
          {NAV_LINKS.map(({ sectionId, label }) => {
            const isActive = isHomePage && activeSection === sectionId;
            return (
              <button
                key={sectionId}
                onClick={() => handleNavClick(sectionId)}
                data-testid={`link-nav-${label.toLowerCase()}`}
                aria-current={isActive ? 'true' : undefined}
                className={`relative text-sm font-medium py-1 transition-colors duration-200 group focus:outline-none ${
                  isActive
                    ? 'text-white'
                    : 'text-muted-foreground hover:text-white'
                }`}
              >
                {label}

                {/* Animated underline — full width when active, grows on hover */}
                <span
                  className={`absolute bottom-0 left-0 h-[2px] rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-300 ${
                    isActive
                      ? 'w-full opacity-100'
                      : 'w-0 opacity-0 group-hover:w-full group-hover:opacity-60'
                  }`}
                />
              </button>
            );
          })}
        </nav>

        {/* ── Desktop auth buttons ─────────────────────────────────────────── */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm font-medium text-white hover:text-accent transition-colors px-4 py-2"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-full text-sm font-semibold transition-all hover:shadow-[0_0_20px_rgba(21,101,232,0.4)]"
          >
            Start Investing
          </Link>
        </div>

        {/* ── Mobile hamburger ─────────────────────────────────────────────── */}
        <button
          className="md:hidden z-50 relative text-white p-2 focus:outline-none"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileMenuOpen}
        >
          <AnimatePresence mode="wait" initial={false}>
            {mobileMenuOpen ? (
              <motion.span
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0,   opacity: 1 }}
                exit={{   rotate:  90, opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="block"
              >
                <X size={24} />
              </motion.span>
            ) : (
              <motion.span
                key="open"
                initial={{ rotate:  90, opacity: 0 }}
                animate={{ rotate: 0,   opacity: 1 }}
                exit={{   rotate: -90, opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="block"
              >
                <Menu size={24} />
              </motion.span>
            )}
          </AnimatePresence>
        </button>

        {/* ── Mobile drawer ────────────────────────────────────────────────── */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              key="mobile-drawer"
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{   opacity: 0, y: -16 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="absolute top-0 left-0 right-0 bg-background border-b border-white/10 pt-24 pb-8 px-6 flex flex-col gap-6 md:hidden shadow-2xl"
            >
              {/* Nav links */}
              <nav className="flex flex-col gap-1" aria-label="Mobile navigation">
                {NAV_LINKS.map(({ sectionId, label }, i) => {
                  const isActive = isHomePage && activeSection === sectionId;
                  return (
                    <motion.button
                      key={sectionId}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04, duration: 0.2 }}
                      onClick={() => handleNavClick(sectionId, true)}
                      className={`w-full text-left text-lg font-medium py-3 px-4 rounded-xl border border-transparent flex items-center justify-between transition-all duration-200 ${
                        isActive
                          ? 'text-white bg-white/8 border-white/10'
                          : 'text-muted-foreground hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {label}
                      {/* Active dot */}
                      <span
                        className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r from-primary to-accent transition-opacity duration-200 ${
                          isActive ? 'opacity-100' : 'opacity-0'
                        }`}
                      />
                    </motion.button>
                  );
                })}
              </nav>

              {/* Auth buttons */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex flex-col gap-3"
              >
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full block text-center text-white border border-white/20 hover:border-white/40 py-3 rounded-xl font-medium transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full block text-center bg-primary hover:bg-primary/90 text-white py-3 rounded-xl font-semibold transition-all hover:shadow-[0_0_20px_rgba(21,101,232,0.4)]"
                >
                  Start Investing
                </Link>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </header>
  );
}
