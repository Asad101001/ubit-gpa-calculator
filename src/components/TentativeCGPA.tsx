interface TentativeCGPAProps {
  cgpa: string;
  missingCount: number;
  size?: 'sm' | 'md' | 'lg';
}

export const TentativeCGPA = ({ cgpa, missingCount, size = 'md' }: TentativeCGPAProps) => {
  const sizeMap = {
    sm: { text: 'text-lg', stroke: '1px', label: 'text-[9px]', sub: 'text-[8px]' },
    md: { text: 'text-xl', stroke: '1.5px', label: 'text-[10px]', sub: 'text-[9px]' },
    lg: { text: 'text-3xl', stroke: '2px', label: 'text-[10px]', sub: 'text-[9px]' },
  };

  const s = sizeMap[size];

  return (
    <div className="flex flex-col items-center">
      <span className={`${s.label} font-bold text-textMuted/50 uppercase tracking-wider mb-1`}>
        Tentative CGPA
      </span>
      <div className="relative inline-flex items-center">
        <span
          className={`${s.text} font-black italic tracking-tight tentative-cgpa-text`}
          style={{
            color: 'transparent',
            WebkitTextStroke: `${s.stroke} rgba(0, 0, 0, 0.22)`,
            letterSpacing: '-0.02em',
          }}
        >
          {cgpa}
        </span>
        {/* Dotted underline */}
        <div
          className="absolute -bottom-0.5 left-0 right-0 h-[2px]"
          style={{
            backgroundImage: 'repeating-linear-gradient(90deg, rgba(0,0,0,0.15) 0, rgba(0,0,0,0.15) 3px, transparent 3px, transparent 7px)',
          }}
        />
      </div>
      <span className={`${s.sub} text-textMuted/40 mt-1.5 font-medium italic`}>
        {missingCount} subject{missingCount !== 1 ? 's' : ''} missing
      </span>
    </div>
  );
};
