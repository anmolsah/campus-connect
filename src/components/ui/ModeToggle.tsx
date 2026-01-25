import { BookOpen, Users, Rocket } from 'lucide-react';
import { useUserStore } from '../../stores/userStore';
import { supabase } from '../../lib/supabase';
import type { Mode } from '../../types';

interface ModeToggleProps {
  compact?: boolean;
  onChange?: (mode: Mode) => void;
}

const modes: { value: Mode; label: string; icon: typeof BookOpen; color: string; bg: string }[] = [
  { value: 'study', label: 'Study', icon: BookOpen, color: 'text-study', bg: 'bg-study-light' },
  { value: 'social', label: 'Social', icon: Users, color: 'text-social', bg: 'bg-social-light' },
  { value: 'project', label: 'Project', icon: Rocket, color: 'text-project', bg: 'bg-project-light' },
];

export const ModeToggle = ({ compact = false, onChange }: ModeToggleProps) => {
  const { currentMode, setMode, user } = useUserStore();

  const handleModeChange = async (mode: Mode) => {
    setMode(mode);
    onChange?.(mode);

    if (user) {
      await supabase
        .from('profiles')
        .update({ current_mode: mode })
        .eq('id', user.id);
    }
  };

  return (
    <div className={`flex ${compact ? 'gap-1' : 'gap-2'} p-1 bg-slate-100 rounded-xl`}>
      {modes.map((mode) => {
        const Icon = mode.icon;
        const isActive = currentMode === mode.value;

        return (
          <button
            key={mode.value}
            onClick={() => handleModeChange(mode.value)}
            className={`
              flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm
              transition-all duration-200 ease-out
              ${isActive
                ? `${mode.bg} ${mode.color} shadow-sm`
                : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
              }
              ${compact ? 'px-3 py-2' : ''}
            `}
          >
            <Icon size={compact ? 16 : 18} />
            {!compact && <span>{mode.label}</span>}
          </button>
        );
      })}
    </div>
  );
};

export const ModeBadge = ({ mode }: { mode: Mode }) => {
  const config = modes.find((m) => m.value === mode);
  if (!config) return null;

  const Icon = config.icon;

  return (
    <span className={`badge ${config.bg} ${config.color}`}>
      <Icon size={12} className="mr-1" />
      {config.label}
    </span>
  );
};
