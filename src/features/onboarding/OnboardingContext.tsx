import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type { SubscriptionPlan, OnboardingStatus, Organization } from '@/types';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface InvitationEntry {
  email: string;
  role: string;
}

export type AgentConnectionStatus = 'idle' | 'pending' | 'online' | 'offline' | 'error';

interface OnboardingContextValue {
  // Backend state
  onboardingStatus: OnboardingStatus | null;
  organization: Organization | null;
  setOnboardingStatus: (s: OnboardingStatus) => void;
  setOrganization: (o: Organization) => void;

  // Step-specific UI state (feeds BiPreviewPanel)
  selectedPlan: SubscriptionPlan | null;
  setSelectedPlan: (p: SubscriptionPlan | null) => void;

  liveOrgName: string;
  setLiveOrgName: (name: string) => void;

  liveCountry: string;
  setLiveCountry: (country: string) => void;

  selectedProfiles: string[];
  setSelectedProfiles: (profiles: string[]) => void;

  invitations: InvitationEntry[];
  setInvitations: (inv: InvitationEntry[]) => void;

  agentStatus: AgentConnectionStatus;
  setAgentStatus: (s: AgentConnectionStatus) => void;

  generatedToken: string | null;
  setGeneratedToken: (token: string | null) => void;

  // Navigation
  goToStep: (step: number) => void;
  currentStep: number;
}

// ─── Context ─────────────────────────────────────────────────────────────────

const OnboardingContext = createContext<OnboardingContextValue | undefined>(undefined);

export function OnboardingProvider({
  children,
  initialStatus,
  initialOrganization,
  initialStep,
}: {
  children: ReactNode;
  initialStatus: OnboardingStatus | null;
  initialOrganization: Organization | null;
  initialStep: number;
}) {
  const [onboardingStatus, setOnboardingStatus] = useState<OnboardingStatus | null>(initialStatus);
  const [organization, setOrganization] = useState<Organization | null>(initialOrganization);

  const [currentStep, setCurrentStep] = useState(initialStep);

  // BI preview state
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [liveOrgName, setLiveOrgName] = useState(initialOrganization?.name ?? '');
  const [liveCountry, setLiveCountry] = useState(initialOrganization?.country ?? '');
  const [selectedProfiles, setSelectedProfiles] = useState<string[]>(
    initialOrganization?.selectedProfiles ?? []
  );
  const [invitations, setInvitations] = useState<InvitationEntry[]>([]);
  const [agentStatus, setAgentStatus] = useState<AgentConnectionStatus>('idle');
  const [generatedToken, setGeneratedToken] = useState<string | null>(null);

  const goToStep = useCallback((step: number) => {
    setCurrentStep(step);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <OnboardingContext.Provider value={{
      onboardingStatus,
      organization,
      setOnboardingStatus,
      setOrganization,
      selectedPlan,
      setSelectedPlan,
      liveOrgName,
      setLiveOrgName,
      liveCountry,
      setLiveCountry,
      selectedProfiles,
      setSelectedProfiles,
      invitations,
      setInvitations,
      agentStatus,
      setAgentStatus,
      generatedToken,
      setGeneratedToken,
      goToStep,
      currentStep,
    }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error('useOnboarding must be used within OnboardingProvider');
  return ctx;
}
