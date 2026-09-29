import { expect, it } from 'vitest';
import { widgetKpiKey } from './widget-kpi-key';

it('keeps three representative saved CA widgets on their historical product key', () => {
  const fixtures = Array.from({ length: 3 }, () => ({
    exposure: 'f01_ca_ht', config: { kpiKey: 'f01_ca_ht' },
  }));
  expect(fixtures.map(widgetKpiKey)).toEqual(['f01_ca_ht', 'f01_ca_ht', 'f01_ca_ht']);
  expect(widgetKpiKey({ exposure: 'f02_ca_ttc' })).toBe('f02_ca_ttc');
  expect(widgetKpiKey({ exposure: 'ca' })).toBe('ca');
});
