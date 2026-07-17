import { motion } from 'framer-motion';
import { Lock, UserPlus, LogIn, Eye } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

export const AuthGate = () => {
  const { openAuthModal } = useAuthStore();

  return (
    <section className="pt-8 sm:pt-16 pb-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl mx-auto text-center"
      >
        {/* Blurred preview bars */}
        <div className="relative mb-10 overflow-hidden rounded-sm border-[2.5px] border-black" style={{ boxShadow: '5px 5px 0px 0px #000000, 9px 9px 0px 0px rgb(230, 180, 0)' }}>
          <div className="bg-surface p-6 sm:p-8 relative">
            {/* Fake blurred table rows */}
            <div className="space-y-3 mb-6 select-none" style={{ filter: 'blur(6px)', pointerEvents: 'none' }}>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-3 bg-surfaceHighlight rounded-sm">
                  <div className="w-20 h-4 bg-textMuted/20 rounded-sm" />
                  <div className="flex-1 h-4 bg-textMuted/15 rounded-sm" />
                  <div className="w-12 h-4 bg-brand-500/20 rounded-sm" />
                  <div className="w-12 h-4 bg-textMuted/10 rounded-sm" />
                  <div className="w-12 h-4 bg-textMuted/10 rounded-sm" />
                </div>
              ))}
            </div>

            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-surface/40 via-surface/80 to-surface flex flex-col items-center justify-center p-6">
              <div className="bg-black p-4 rounded-sm mb-5 border-2 border-black" style={{ boxShadow: '3px 3px 0px 0px rgb(230, 180, 0)' }}>
                <Lock size={32} className="text-white" />
              </div>

              <h3 className="text-2xl sm:text-3xl font-black text-textMain uppercase tracking-tight mb-3">
                Results Locked
              </h3>
              <p className="text-textMuted font-medium text-sm sm:text-base max-w-md mb-8 leading-relaxed">
                Sign in or create an account to access the complete results portal. 
                <span className="block mt-1 text-textMuted/60 text-xs">View marks, download transcripts, and track your academic performance.</span>
              </p>

              <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
                <button
                  onClick={() => openAuthModal('signin')}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 px-5 bg-black text-white font-extrabold text-sm rounded-sm transition-all hover:bg-zinc-800 uppercase tracking-wider border-2 border-black"
                  style={{ boxShadow: '3px 3px 0px 0px rgb(230, 180, 0)' }}
                >
                  <LogIn size={16} />
                  Sign In
                </button>
                <button
                  onClick={() => openAuthModal('signup')}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 px-5 bg-surface text-textMain font-extrabold text-sm rounded-sm transition-all hover:bg-surfaceHighlight uppercase tracking-wider border-2 border-black"
                  style={{ boxShadow: '3px 3px 0px 0px rgba(0,0,0,0.15)' }}
                >
                  <UserPlus size={16} />
                  Sign Up
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
          {[
            { icon: Eye, title: 'View Results', desc: 'Access all semester marks & transcripts' },
            { icon: Lock, title: 'Privacy Controls', desc: 'Choose who sees your results' },
            { icon: UserPlus, title: 'Edit Marks', desc: 'Verified users can update their data' },
          ].map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="p-4 bg-surface border-2 border-black rounded-sm text-left"
              style={{ boxShadow: '3px 3px 0px 0px rgba(0,0,0,0.1)' }}
            >
              <item.icon size={20} className="text-textMuted mb-2" />
              <h4 className="font-bold text-textMain text-sm uppercase tracking-wider">{item.title}</h4>
              <p className="text-textMuted text-xs mt-1">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
};
