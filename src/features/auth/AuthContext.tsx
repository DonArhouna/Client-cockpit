import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { authApi, onboardingApi } from '@/api';
import type { AuthState, LoginCredentials, OnboardingStatus, User } from '@/types';

interface AuthContextValue extends AuthState {
  onboardingStatus: OnboardingStatus | null;
  onboardingLoading: boolean;
  refetchOnboarding: () => Promise<void>;
  login: (credentials: LoginCredentials) => Promise<void>;
  loginWithTokens: (accessToken: string, refreshToken: string, user: User) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: { firstName?: string; lastName?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    accessToken: localStorage.getItem('accessToken'),
    isAuthenticated: false,
    isLoading: true,
  });

  const [onboardingStatus, setOnboardingStatus] = useState<OnboardingStatus | null>(null);
  const [onboardingLoading, setOnboardingLoading] = useState(false);

  const fetchOnboardingStatus = useCallback(async () => {
    setOnboardingLoading(true);
    try {
      const res = await onboardingApi.getStatus();
      setOnboardingStatus(res.data.status);
    } catch {
      setOnboardingStatus(null);
    } finally {
      setOnboardingLoading(false);
    }
  }, []);

  // Check auth state on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('accessToken');

      if (!token) {
        setState(prev => ({ ...prev, isLoading: false }));
        return;
      }

      try {
        const response = await authApi.me();
        setState({
          user: response.data,
          accessToken: token,
          isAuthenticated: true,
          isLoading: false,
        });
        await fetchOnboardingStatus();
      } catch {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setState({
          user: null,
          accessToken: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    };

    checkAuth();
  }, [fetchOnboardingStatus]);

  const login = async (credentials: LoginCredentials) => {
    const response = await authApi.login(credentials);
    const { accessToken, refreshToken, user } = response.data;

    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);

    setState({ user, accessToken, isAuthenticated: true, isLoading: false });
    await fetchOnboardingStatus();
  };

  // Used after registration — tokens already in hand, no second API call needed
  const loginWithTokens = async (accessToken: string, refreshToken: string, user: User) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);

    setState({ user, accessToken, isAuthenticated: true, isLoading: false });
    await fetchOnboardingStatus();
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore logout errors
    }

    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');

    setState({ user: null, accessToken: null, isAuthenticated: false, isLoading: false });
    setOnboardingStatus(null);
  };

  const updateProfile = async (data: { firstName?: string; lastName?: string }) => {
    const response = await authApi.updateMe(data);
    setState(prev => ({ ...prev, user: response.data }));
  };

  return (
    <AuthContext.Provider value={{
      ...state,
      onboardingStatus,
      onboardingLoading,
      refetchOnboarding: fetchOnboardingStatus,
      login,
      loginWithTokens,
      logout,
      updateProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
