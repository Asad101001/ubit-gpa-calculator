interface TentativeCGPAProps {
  cgpa: string;
  missingCount?: number;
  size?: 'sm' | 'md' | 'lg';
  showBadge?: boolean;
  isPartialSem3?: boolean;
}

export const TentativeCGPA = ({ 
  cgpa, 
  missingCount = 0, 
  size = 'md', 
  showBadge = true,
  isPartialSem3 = false 
}: TentativeCGPAProps) => {
  const sizeMap = {
    sm: { num: 'text-xl sm:text-2xl', label: 'text-[9px]', badge: 'text-[8px]', gap: 'gap-0.5' },
    md: { num: 'text-2xl sm:text-3xl', label: 'text-[10px]', badge: 'text-[9px]', gap: 'gap-0.5' },
    lg: { num: 'text-2xl sm:text-3xl', label: 'text-[10px]', badge: 'text-[9px]', gap: 'gap-0.5' },
  };
  const s = sizeMap[size];

  return (
    <div className={`flex flex-col items-center justify-center ${s.gap}`} title="Calculated from in-progress / partial course marks">
      {/* Pencilled / Sketched CGPA Label with Asterisk */}
      <span className={`${s.label} font-black text-gray-500 uppercase tracking-wider`}>
        CGPA*
      </span>

      {/* Sketched / Pencilled Number */}
      <div className="flex items-baseline gap-0.5">
        <span 
          className={`${s.num} font-bold font-mono tracking-tight text-gray-500 border-b-2 border-dashed border-gray-400`}
        >
          {cgpa}
        </span>
        <span className="text-yellow-600 font-black text-sm sm:text-base leading-none select-none">*</span>
      </div>

      {/* Subtle In-Progress / Pending Note */}
      {showBadge && (
        <span className={`${s.badge} text-gray-500 font-bold tracking-tight text-center mt-0.5 leading-tight`}>
          {isPartialSem3 
            ? '*Includes partial Sem 3' 
            : missingCount > 0 
            ? `*${missingCount} subject${missingCount !== 1 ? 's' : ''} pending` 
            : '*In-progress'}
        </span>
      )}
    </div>
  );
};

