import { motion } from 'framer-motion';
import { TrendingUp, Star, CheckCircle2, Users } from 'lucide-react';

export interface BatchStatsCardsProps {
  className?: string;
  avgCgpa?: string;
  highestScore?: string;
  passingRatio?: string;
  passingSubtitle?: string;
  totalEnrollment?: string;
  enrollmentSubtitle?: string;
}

export const OFFICIAL_BATCH_BENCHMARK = {
  avgCgpa: '2.64',
  highestScore: '3.89',
  passingRatio: '81%',
  passingSubtitle: '70 of 86 students',
  totalEnrollment: '86',
  enrollmentSubtitle: 'Batch 2025 · Morning',
};

export const BatchStatsCards = ({
  className = '',
  avgCgpa = OFFICIAL_BATCH_BENCHMARK.avgCgpa,
  highestScore = OFFICIAL_BATCH_BENCHMARK.highestScore,
  passingRatio = OFFICIAL_BATCH_BENCHMARK.passingRatio,
  passingSubtitle = OFFICIAL_BATCH_BENCHMARK.passingSubtitle,
  totalEnrollment = OFFICIAL_BATCH_BENCHMARK.totalEnrollment,
  enrollmentSubtitle = OFFICIAL_BATCH_BENCHMARK.enrollmentSubtitle,
}: BatchStatsCardsProps) => {
  const cards = [
    {
      id: 'avg-cgpa',
      icon: TrendingUp,
      label: 'CLASS AVERAGE CGPA',
      value: avgCgpa,
      subtitle: 'Across all enrolled students',
    },
    {
      id: 'highest-score',
      icon: Star,
      label: 'HIGHEST SCORE',
      value: highestScore,
      subtitle: 'Top performer this batch',
    },
    {
      id: 'passing-ratio',
      icon: CheckCircle2,
      label: 'PASSING RATIO',
      value: passingRatio,
      subtitle: passingSubtitle,
    },
    {
      id: 'total-enrollment',
      icon: Users,
      label: 'TOTAL ENROLLMENT',
      value: totalEnrollment,
      subtitle: enrollmentSubtitle,
    },
  ];

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 ${className}`}>
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.05, duration: 0.35, ease: 'easeOut' }}
            className="relative bg-white rounded-2xl p-5 sm:p-6 border-2 border-black shadow-[3px_3px_0px_0px_#000] hover:shadow-[1.5px_1.5px_0px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 transition-all overflow-hidden flex flex-col justify-between group"
          >
            {/* Refined subtle corner watermark circle */}
            <div className="absolute -bottom-8 -right-8 w-28 h-28 rounded-full bg-rose-100/35 pointer-events-none group-hover:scale-105 transition-transform duration-500" />

            <div className="relative z-10 space-y-3.5">
              {/* Icon & Label */}
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-rose-50 border border-rose-200/60 flex items-center justify-center text-[#801618] shrink-0 shadow-[1px_1px_0px_0px_rgba(128,22,24,0.12)]">
                  <Icon size={16} strokeWidth={2.5} />
                </div>
                <span className="text-[10px] sm:text-[11px] font-black tracking-wider uppercase text-gray-500">
                  {card.label}
                </span>
              </div>

              {/* Big Metric Value & Subtitle */}
              <div>
                <div className="text-3xl sm:text-4xl font-black text-black tracking-tight font-mono">
                  {card.value}
                </div>
                <p className="text-[11px] sm:text-xs text-gray-500 font-medium mt-1">
                  {card.subtitle}
                </p>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
