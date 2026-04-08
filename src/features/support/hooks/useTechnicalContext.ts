import { useLocation } from 'react-router-dom';

export function useTechnicalContext() {
  const location = useLocation();

  const getBrowser = () => {
    const ua = navigator.userAgent;
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Safari')) return 'Safari';
    if (ua.includes('Edge')) return 'Edge';
    return 'Unknown';
  };

  const getOS = () => {
    const platform = navigator.platform;
    if (platform.includes('Win')) return 'Windows';
    if (platform.includes('Mac')) return 'MacOS';
    if (platform.includes('Linux')) return 'Linux';
    return 'Unknown';
  };

  return {
    url: window.location.href,
    path: location.pathname,
    browser: getBrowser(),
    os: getOS(),
    screen: `${window.innerWidth}x${window.innerHeight}`,
    userAgent: navigator.userAgent,
  };
}
