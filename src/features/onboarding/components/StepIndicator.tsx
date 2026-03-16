import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const STEPS = [
  { number: 1, label: 'Plan' },
  { number: 2, label: 'Organisation' },
  { number: 3, label: 'Connexion Sage' },
  { number: 4, label: 'Profils métiers' },
  { number: 5, label: 'Équipe' },
  { number: 6, label: 'Paiement' },
];

interface StepIndicatorProps {
  currentStep: number;
  completedSteps: number[];
}

export function StepIndicator({ currentStep, completedSteps }: StepIndicatorProps) {
  return (
    <nav aria-label="Progression de l'onboarding" className="w-full">
      <ol className="flex items-center gap-0">
        {STEPS.map((step, index) => {
          const isCompleted = completedSteps.includes(step.number);
          const isCurrent = currentStep === step.number;
          const isUpcoming = !isCompleted && !isCurrent;
          const isLast = index === STEPS.length - 1;

          return (
            <li key={step.number} className="flex items-center flex-1 min-w-0">
              {/* Step bubble + label */}
              <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300',
                    isCompleted && 'bg-primary text-primary-foreground shadow-md',
                    isCurrent && 'bg-primary text-primary-foreground ring-4 ring-primary/20 shadow-md scale-110',
                    isUpcoming && 'bg-muted text-muted-foreground border-2 border-border',
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4 stroke-[2.5]" />
                  ) : (
                    <span>{step.number}</span>
                  )}
                </div>
                <span
                  className={cn(
                    'text-[10px] font-medium text-center leading-tight max-w-[64px] hidden sm:block',
                    isCurrent && 'text-primary',
                    isCompleted && 'text-primary',
                    isUpcoming && 'text-muted-foreground',
                  )}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector line */}
              {!isLast && (
                <div className="flex-1 mx-1.5 mb-4">
                  <div className="h-[2px] w-full rounded-full overflow-hidden bg-border">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all duration-500',
                        isCompleted ? 'w-full bg-primary' : 'w-0',
                      )}
                    />
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
