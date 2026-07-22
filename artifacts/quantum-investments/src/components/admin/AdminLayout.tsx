import { useState } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { AdminGuard } from './AdminGuard';
import { Menu, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <AdminGuard>
      <div className="min-h-[100dvh] bg-background flex text-foreground">
        {/* Desktop Sidebar */}
        <div className="hidden md:block fixed inset-y-0 left-0 z-40">
          <AdminSidebar />
        </div>

        {/* Mobile Header */}
        <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-[hsl(221,70%,10%)]/90 backdrop-blur-md border-b border-white/5 flex items-center px-4 z-40 justify-between">
          <div className="flex items-center gap-2">
            <Shield size={16} className="text-accent" />
            <span className="text-sm font-bold text-white">QUANTUM <span className="text-accent">ADMIN</span></span>
          </div>
          <button onClick={() => setMobileOpen(true)} className="text-white p-2">
            <Menu size={20} />
          </button>
        </div>

        {/* Mobile Drawer */}
        <AnimatePresence>
          {mobileOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
                onClick={() => setMobileOpen(false)}
              />
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', bounce: 0, duration: 0.35 }}
                className="fixed inset-y-0 left-0 z-50 md:hidden"
              >
                <AdminSidebar onClose={() => setMobileOpen(false)} />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 md:ml-72 pt-14 md:pt-0 min-h-screen relative overflow-x-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/15 rounded-full blur-[130px] -z-10 pointer-events-none opacity-40" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-accent/8 rounded-full blur-[100px] -z-10 pointer-events-none opacity-25" />
          <div className="p-5 md:p-8 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </AdminGuard>
  );
}
