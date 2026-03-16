import { ReactNode } from 'react';
import { StepIndicator } from './StepIndicator';
import { BiPreviewPanel } from './BiPreviewPanel';
import { useOnboarding } from '../OnboardingContext';
import { BarChart3 } from 'lucide-react';

interface OnboardingLayoutProps {
  children: ReactNode;
}

export function OnboardingLayout({ children }: OnboardingLayoutProps) {
  const { currentStep, onboardingStatus } = useOnboarding();
  // Sur la page de succès (step 7), tous les steps sont forcément complétés
  // indépendamment du webhook Flutterwave (qui peut arriver après la redirection)
  const completedSteps = currentStep === 7
    ? [1, 2, 3, 4, 5, 6]
    : (onboardingStatus?.completedSteps ?? []);

  return (
    <div className="min-h-screen flex bg-background">
      {/* ── Left: Wizard ─────────────────────────────────────────────────── */}
      <div className="w-full lg:w-[42%] flex flex-col min-h-screen">
        {/* Logo */}
        <header className="flex-shrink-0 px-8 py-6 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-md">
              <BarChart3 className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">Cockpit</span>
          </div>
        </header>

        {/* Step indicator */}
        <div className="flex-shrink-0 px-8 pt-6 pb-2">
          <StepIndicator currentStep={currentStep} completedSteps={completedSteps} />
        </div>

        {/* Step content */}
        <main className="flex-1 px-8 py-6 overflow-y-auto">
          <div className="max-w-lg mx-auto lg:max-w-none">
            {children}
          </div>
        </main>

        {/* Footer */}
        <footer className="flex-shrink-0 px-8 py-4 border-t border-border">
          <p className="text-[11px] text-muted-foreground text-center">
            © {new Date().getFullYear()} Nafaka Tech · Cockpit ·{' '}
            <a href="#" className="hover:underline">Confidentialité</a>{' '}
            ·{' '}
            <a href="#" className="hover:underline">CGU</a>
          </p>
        </footer>
      </div>

      {/* ── Right: BI Preview Panel ───────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[58%] bg-slate-950 relative overflow-hidden">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900" />

        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        {/* Top gradient fade */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-slate-950/80 to-transparent pointer-events-none z-10" />
        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-950/80 to-transparent pointer-events-none z-10" />

        {/* Content */}
        <div className="relative z-20 flex flex-col w-full p-10 pt-12">
          <BiPreviewPanel />
        </div>
      </div>
    </div>
  );
}
