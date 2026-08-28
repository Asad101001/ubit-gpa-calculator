import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, LogIn, UserPlus, Mail, Lock, User, Hash, Loader2, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

export const AuthModal = () => {
  const { isAuthModalOpen, authModalMode, closeAuthModal, signIn, signUp, openAuthModal } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [seatNo, setSeatNo] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const isSignUp = authModalMode === 'signup';

  const showEmailHint = email.length > 0 && !email.includes('@');
  const showPasswordHint = password.length > 0 && password.length < 6;
  const showSeatNoHint = seatNo.length > 0 && !/^[a-zA-Z0-9-]{5,15}$/.test(seatNo) && seatNo.length > 3;

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setFullName('');
    setSeatNo('');
    setError('');
    setSuccess('');
    setShowPassword(false);
  };

  const handleClose = () => {
    if (!isSubmitting) {
      resetForm();
      closeAuthModal();
    }
  };

  const [failedAttempts, setFailedAttempts] = useState(0);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  const switchMode = () => {
    resetForm();
    openAuthModal(isSignUp ? 'signin' : 'signup');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cooldownSeconds > 0) return;

    setError('');
    setSuccess('');

    const cleanEmail = email.trim();
    const cleanPassword = password;
    const cleanFullName = fullName.trim();
    const cleanSeatNo = seatNo.trim().toUpperCase();

    // Basic format validations
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (isSignUp) {
      if (!cleanFullName || cleanFullName.length < 2) {
        setError('Please enter your full name (at least 2 characters).');
        return;
      }
      if (cleanPassword.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }
      if (cleanSeatNo && !/^[A-Za-z0-9-]{5,15}$/.test(cleanSeatNo)) {
        setError('Please enter a valid Seat Number format (e.g. B24110006087).');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      if (isSignUp) {
        const result = await signUp(cleanEmail, cleanPassword, cleanFullName, cleanSeatNo);
        if (result.error) {
          setError(result.error);
        } else {
          setSuccess('Account created! Please check your email to verify your address, then sign in.');
          setTimeout(() => {
            resetForm();
            openAuthModal('signin');
          }, 3000);
        }
      } else {
        const result = await signIn(cleanEmail, cleanPassword);
        if (result.error) {
          setError(result.error);
          setFailedAttempts(prev => {
            const next = prev + 1;
            if (next >= 4) {
              setCooldownSeconds(20);
              const timer = setInterval(() => {
                setCooldownSeconds(s => {
                  if (s <= 1) { clearInterval(timer); return 0; }
                  return s - 1;
                });
              }, 1000);
            }
            return next;
          });
        } else {
          resetForm();
          closeAuthModal();
        }
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <AnimatePresence>
      {isAuthModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.95, y: 10, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 10, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="bg-surface border-[2.5px] border-black rounded-sm p-6 sm:p-8 max-w-md w-full relative overflow-hidden"
            style={{ boxShadow: '5px 5px 0px 0px #000000, 9px 9px 0px 0px rgb(230, 180, 0)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 z-10 p-2 bg-surfaceHighlight hover:bg-red-500/10 rounded-sm text-textMuted hover:text-red-500 transition-colors border border-border"
            >
              <X size={18} />
            </button>

            <div className="relative z-10 flex flex-col items-center text-center">
              {/* Icon */}
              <div className="bg-black p-4 rounded-sm mb-4 border-2 border-black" style={{ boxShadow: '3px 3px 0px 0px rgb(230, 180, 0)' }}>
                {isSignUp ? (
                  <UserPlus size={28} className="text-white" />
                ) : (
                  <LogIn size={28} className="text-white" />
                )}
              </div>

              <h2 className="text-2xl font-black text-textMain mb-1 tracking-tight uppercase">
                {isSignUp ? 'Create Account' : 'Welcome Back'}
              </h2>
              <p className="text-textMuted font-medium mb-6 text-sm">
                {isSignUp ? 'Join the DCS UBIT community' : 'Sign in to access results & your profile'}
              </p>

              <form onSubmit={handleSubmit} className="w-full space-y-3">
                {error && (
                  <div className="bg-red-500/10 border-2 border-red-500 text-red-700 text-sm p-3 rounded-sm font-bold text-left">
                    {error}
                  </div>
                )}
                {success && (
                  <div className="bg-green-500/10 border-2 border-green-500 text-green-700 text-sm p-3 rounded-sm font-bold text-left">
                    {success}
                  </div>
                )}

                {isSignUp && (
                  <>
                    <div className="text-left">
                      <label className="block text-textMuted text-[10px] font-bold mb-1.5 uppercase tracking-wider">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted/50 w-4 h-4" />
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="e.g. Muhammad Asad"
                          className="w-full glass-input text-textMain py-3 pl-10 pr-4 text-sm font-bold placeholder:text-textMuted/40"
                        />
                      </div>
                    </div>
                    <div className="text-left">
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="block text-textMuted text-[10px] font-bold uppercase tracking-wider">
                          Seat Number <span className="text-textMuted/40">(Optional)</span>
                        </label>
                        {showSeatNoHint && <span className="text-[10px] text-red-500 font-bold">Invalid format</span>}
                      </div>
                      <div className="relative">
                        <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted/50 w-4 h-4" />
                        <input
                          type="text"
                          value={seatNo}
                          onChange={(e) => setSeatNo(e.target.value.trim())}
                          placeholder="e.g. EB24110001"
                          className={`w-full glass-input text-textMain py-3 pl-10 pr-4 text-sm font-bold font-mono placeholder:text-textMuted/40 uppercase ${showSeatNoHint ? 'border-red-500 focus:ring-red-500/20' : ''}`}
                        />
                      </div>
                      <p className="text-[10px] text-textMuted/50 mt-1 pl-1">Links your account to your results</p>
                    </div>
                  </>
                )}

                <div className="text-left">
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-textMuted text-[10px] font-bold uppercase tracking-wider">Email Address</label>
                    {showEmailHint && <span className="text-[10px] text-red-500 font-bold">Invalid email</span>}
                  </div>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted/50 w-4 h-4" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value.trim())}
                      placeholder="you@example.com"
                      className={`w-full glass-input text-textMain py-3 pl-10 pr-4 text-sm font-bold placeholder:text-textMuted/40 ${showEmailHint ? 'border-red-500 focus:ring-red-500/20' : ''}`}
                    />
                  </div>
                </div>

                <div className="text-left">
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-textMuted text-[10px] font-bold uppercase tracking-wider">Password</label>
                    {showPasswordHint && <span className="text-[10px] text-red-500 font-bold">Min 6 characters</span>}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted/50 w-4 h-4" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className={`w-full glass-input text-textMain py-3 pl-10 pr-11 text-sm font-bold placeholder:text-textMuted/40 ${showPasswordHint ? 'border-red-500 focus:ring-red-500/20' : ''}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-textMuted/50 hover:text-textMain transition-colors"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || cooldownSeconds > 0}
                  className="w-full py-4 bg-black hover:bg-zinc-800 disabled:opacity-50 text-white font-extrabold rounded-sm transition-all text-sm uppercase tracking-wider border-2 border-black mt-2"
                  style={{ boxShadow: '3px 3px 0px 0px rgb(230, 180, 0)' }}
                >
                  {cooldownSeconds > 0 ? (
                    `Too many attempts (${failedAttempts}). Please wait ${cooldownSeconds}s`
                  ) : isSubmitting ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="animate-spin" size={16} />
                      <span>Processing...</span>
                    </div>
                  ) : isSignUp ? (
                    'Create Account'
                  ) : (
                    'Sign In'
                  )}
                </button>

              </form>

              <div className="mt-5 pt-4 border-t border-border w-full">
                <p className="text-sm text-textMuted">
                  {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                  <button
                    onClick={switchMode}
                    className="text-black font-bold hover:underline underline-offset-4"
                  >
                    {isSignUp ? 'Sign In' : 'Sign Up'}
                  </button>
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
