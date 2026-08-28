import { useState } from 'react';
import { ArrowLeft, FileText, ShieldCheck, BookOpen } from 'lucide-react';
import { TermsPage } from './TermsPage';
import { PrivacyPage } from './PrivacyPage';
import { GradingPage } from './GradingPage';

interface LegalPageProps {
  initialSubTab?: 'terms' | 'privacy' | 'grading';
  onBack: () => void;
}

export const LegalPage = ({ initialSubTab = 'terms', onBack }: LegalPageProps) => {
  const [subTab, setSubTab] = useState<'terms' | 'privacy' | 'grading'>(initialSubTab);

  return (
    <div className="space-y-6">
      {/* Sub-nav switcher */}
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-3 bg-white p-2 rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_#000000]">
        <button
          onClick={onBack}
          className="p-2 bg-surfaceHighlight hover:bg-yellow-400 text-black rounded-xl border-2 border-black font-extrabold text-xs transition-all shrink-0"
        >
          <ArrowLeft size={16} />
        </button>

        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
          {[
            { id: 'terms', label: 'Terms of Service', icon: FileText },
            { id: 'privacy', label: 'Privacy Policy', icon: ShieldCheck },
            { id: 'grading', label: 'Grading Scale', icon: BookOpen },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = subTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSubTab(tab.id as 'terms' | 'privacy' | 'grading')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black whitespace-nowrap border-2 border-black transition-all ${
                  isActive
                    ? 'bg-yellow-400 text-black shadow-[2px_2px_0px_0px_#000000]'
                    : 'bg-white text-textMuted hover:text-textMain hover:bg-gray-100'
                }`}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Render selected modular sub-page */}
      {subTab === 'terms' && <TermsPage onBack={onBack} />}
      {subTab === 'privacy' && <PrivacyPage onBack={onBack} />}
      {subTab === 'grading' && <GradingPage onBack={onBack} />}
    </div>
  );
};
