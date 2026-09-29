/** Historical dashboards retain their product key regardless of storage shape. */
export function widgetKpiKey(widget: {
  kpiKey?: string | null;
  exposure?: string | null;
  config?: Record<string, unknown> | null;
}): string {
  return widget.kpiKey || (typeof widget.config?.kpiKey === 'string' ? widget.config.kpiKey : '') ||
    widget.exposure || '';
}
