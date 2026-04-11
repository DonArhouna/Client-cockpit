import { useEffect, useState } from 'react';
import { useSearchParams, Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { onboardingApi } from '@/api';
import { useAuth } from '../auth/AuthContext';
import { OnboardingProvider, useOnboarding } from './OnboardingContext';
import { OnboardingLayout } from './components/OnboardingLayout';
import { Step1Plan } from './components/Step1Plan';
import { Step2OrgProfile } from './components/Step2OrgProfile';
import { Step3SageConfig } from './components/Step3SageConfig';
import { Step4Profiles } from './components/Step4Profiles';
import { Step5Invitations } from './components/Step5Invitations';
import { Step6Payment } from './components/Step6Payment';
import { StepSuccess } from './components/StepSuccess';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import type { OnboardingStatus, Organization } from '@/types';

// ─── Step renderer ────────────────────────────────────────────────────────────

function StepContent({ step }: { step: number }) {
  switch (step) {
    case 1: return <Step1Plan />;
    case 2: return <Step2OrgProfile />;
    case 3: return <Step3SageConfig />;
    case 4: return <Step4Profiles />;
    case 5: return <Step5Invitations />;
    case 6: return <Step6Payment />;
    case 7: return <StepSuccess />;
    default: return <Step1Plan />;
  }
}

// ─── Inner page (has access to OnboardingProvider) ───────────────────────────

function StepsRenderer() {
  const { currentStep } = useOnboarding();
  return (
    <div className="animate-in fade-in duration-300" key={currentStep}>
      <StepContent step={currentStep} />
    </div>
  );
}

function OnboardingInner({
  initialStatus,
  initialOrganization,
  initialStep,
}: {
  initialStatus: OnboardingStatus | null;
  initialOrganization: Organization | null;
  initialStep: number;
}) {
  return (
    <OnboardingProvider
      initialStatus={initialStatus}
      initialOrganization={initialOrganization}
      initialStep={initialStep}
    >
      <OnboardingLayout>
        <StepsRenderer />
      </OnboardingLayout>
    </OnboardingProvider>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export function OnboardingPage() {
  const { onboardingStatus: authOnboardingStatus } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // Flutterwave redirige avec status=successful|cancelled&tx_ref=...&transaction_id=...
  const flwStatus = searchParams.get('status');       // 'successful' | 'cancelled' | null
  const paymentSuccess = flwStatus === 'successful';

  // Fetch fresh status on mount (handles payment return redirect)
  const { data, isLoading } = useQuery({
    queryKey: ['onboarding-status-page'],
    queryFn: () => onboardingApi.getStatus().then(r => r.data),
    refetchOnWindowFocus: false,
  });

  // Nettoyer les paramètres Flutterwave de l'URL après lecture
  useEffect(() => {
    if (flwStatus) {
      const params = new URLSearchParams(searchParams);
      params.delete('status');
      params.delete('tx_ref');
      params.delete('transaction_id');
      setSearchParams(params, { replace: true });
    }
  }, [flwStatus, searchParams, setSearchParams]);

  if (isLoading) return <LoadingSpinner fullScreen />;

  const status = data?.status ?? authOnboardingStatus;
  const organization = data?.organization ?? null;

  // Onboarding complet sans retour de paiement → dashboard
  if (status?.isComplete && !paymentSuccess) {
    return <Navigate to="/dashboard" replace />;
  }

  // Determine which step to show
  let initialStep = status?.currentStep ?? 1;

  // Retour Flutterwave avec status=successful → afficher le succès
  if (paymentSuccess) {
    initialStep = 7; // StepSuccess
  }

  return (
    <OnboardingInner
      initialStatus={status}
      initialOrganization={organization as Organization | null}
      initialStep={initialStep}
    />
  );
}
