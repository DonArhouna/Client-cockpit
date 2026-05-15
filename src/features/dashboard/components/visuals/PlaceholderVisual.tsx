import { Brain, GitFork, ImageIcon, Clock } from 'lucide-react';

const ICONS = {
    brain: Brain,
    tree: GitFork,
    image: ImageIcon,
    default: Clock,
} as const;

interface PlaceholderVisualProps {
    icon?: keyof typeof ICONS;
    label: string;
    sublabel?: string;
}

export function PlaceholderVisual({ icon = 'default', label, sublabel }: PlaceholderVisualProps) {
    const Icon = ICONS[icon] ?? ICONS.default;
    return (
        <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-4">
            <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl">
                <Icon className="h-6 w-6 text-slate-400 dark:text-slate-500" />
            </div>
            <div className="space-y-1">
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">{label}</p>
                {sublabel && <p className="text-[11px] text-slate-400">{sublabel}</p>}
            </div>
        </div>
    );
}
