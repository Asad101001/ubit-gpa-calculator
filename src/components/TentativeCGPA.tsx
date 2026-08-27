import { AlertCircle } from 'lucide-react';

interface TentativeCGPAProps {
  cgpa: string;
  missingCount: number;
  size?: 'sm' | 'md' | 'lg';
  showBadge?: boolean;
}

export const TentativeCGPA = ({ cgpa, missingCount, size = 'md', showBadge = true }: TentativeCGPAProps) => {
  const sizeMap = {
    sm: { num: 'text-2xl', label: 'text-[9px]', badge: 'text-[8px]', gap: 'gap-1' },
    md: { num: 'text-3xl', label: 'text-[9px]', badge: 'text-[9px]', gap: 'gap-1.5' },
    lg: { num: 'text-4xl', label: 'text-[10px]', badge: 'text-[9px]', gap: 'gap-2' },
  };
  const s = sizeMap[size];

  return (
    <div className={`flex flex-col items-center ${s.gap}`}>
      {/* Tentative label */}
      <span className={`${s.label} font-bold uppercase tracking-[0.14em] text-textMuted/50 flex items-center gap-1`}>
        <AlertCircle size={9} className="opacity-60" />
        Tentative
      </span>

      {/* The ghosted number */}
      <div className="relative group">
        <span
          className={`${s.num} font-black italic leading-none select-none tentative-cgpa-pulse`}
          style={{
            color: 'transparent',
            WebkitTextStroke: '1.5px rgba(120,135,165,0.35)',
            letterSpacing: '-0.03em',
          }}
        >
          {cgpa}
        </span>
        {/* Dotted underline */}
        <div
          className="absolute -bottom-1 left-0 right-0 h-[1.5px]"
          style={{
            backgroundImage: 'repeating-linear-gradient(90deg, rgba(120,135,165,0.25) 0, rgba(120,135,165,0.25) 3px, transparent 3px, transparent 7px)',
          }}
        />
      </div>

      {/* Missing subjects badge */}
      {showBadge && (
        <span className={`${s.badge} text-textMuted/40 font-medium italic mt-0.5`}>
          {missingCount} result{missingCount !== 1 ? 's' : ''} pending
        </span>
      )}
    </div>
  );
};
