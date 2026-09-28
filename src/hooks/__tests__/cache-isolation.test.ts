import { beforeEach, describe, expect, it } from 'vitest';
import { clearAllCache, getCache, setCache } from '@/lib/cache';

describe('cache KPI V1', () => {
  beforeEach(() => localStorage.clear());
  it('isole les clés par organisation et utilisateur et purge au logout', () => {
    setCache('org-1:user-1:kpi_ca', { current: 0 });
    expect(getCache('org-1:user-1:kpi_ca')).toEqual({ current: 0 });
    expect(getCache('org-2:user-1:kpi_ca')).toBeNull();
    expect(getCache('org-1:user-2:kpi_ca')).toBeNull();
    clearAllCache();
    expect(getCache('org-1:user-1:kpi_ca')).toBeNull();
  });
});
