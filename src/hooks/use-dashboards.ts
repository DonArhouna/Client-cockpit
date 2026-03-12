import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dashboardsApi } from '@/api';
import { Dashboard, Widget } from '@/types';

export function useMyDashboard() {
    return useQuery({
        queryKey: ['dashboards', 'me'],
        queryFn: async () => {
            const resp = await dashboardsApi.getMine();
            return resp.data;
        },
    });
}

export function useUpdateDashboard() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: Partial<Dashboard> }) => {
            const resp = await dashboardsApi.update(id, data);
            return resp.data;
        },
        onSuccess: (updatedDashboard) => {
            queryClient.setQueryData(['dashboards', 'me'], updatedDashboard);
            queryClient.invalidateQueries({ queryKey: ['dashboards'] });
        },
    });
}

export function useCreateDashboard() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: { name: string; isDefault?: boolean }) => {
            const resp = await dashboardsApi.create(data);
            return resp.data;
        },
        onSuccess: (newDashboard) => {
            queryClient.setQueryData(['dashboards', 'me'], newDashboard);
            queryClient.invalidateQueries({ queryKey: ['dashboards', 'me'] });
        },
    });
}

export function useAddWidget() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ dashboardId, data }: { dashboardId: string, data: any }) => {
            const resp = await dashboardsApi.addWidget(dashboardId, data);
            return { dashboardId, widget: resp.data };
        },
        onSuccess: ({ dashboardId, widget }) => {
            // Optimistically update the dashboard with the new widget
            queryClient.setQueryData(['dashboards', 'me'], (old: Dashboard | undefined) => {
                if (!old || old.id !== dashboardId) return old;
                return {
                    ...old,
                    widgets: [...(old.widgets || []), widget],
                };
            });
            queryClient.invalidateQueries({ queryKey: ['dashboards', 'me'] });
        },
    });
}

export function useUpdateWidget() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            dashboardId,
            widgetId,
            data
        }: {
            dashboardId: string;
            widgetId: string;
            data: Partial<Widget>;
        }) => {
            const resp = await dashboardsApi.updateWidget(dashboardId, widgetId, data as any);
            return { dashboardId, widget: resp.data };
        },
        onSuccess: ({ dashboardId, widget }) => {
            queryClient.setQueryData(['dashboards', 'me'], (old: Dashboard | undefined) => {
                if (!old || old.id !== dashboardId) return old;
                return {
                    ...old,
                    widgets: (old.widgets || []).map(w => w.id === widget.id ? widget : w),
                };
            });
            queryClient.invalidateQueries({ queryKey: ['dashboards', 'me'] });
        },
    });
}

export function useRemoveWidget() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ dashboardId, widgetId }: { dashboardId: string; widgetId: string }) => {
            await dashboardsApi.removeWidget(dashboardId, widgetId);
            return { dashboardId, widgetId };
        },
        onSuccess: ({ dashboardId, widgetId }) => {
            queryClient.setQueryData(['dashboards', 'me'], (old: Dashboard | undefined) => {
                if (!old || old.id !== dashboardId) return old;
                return {
                    ...old,
                    widgets: (old.widgets || []).filter(w => w.id !== widgetId),
                };
            });
            queryClient.invalidateQueries({ queryKey: ['dashboards', 'me'] });
        },
    });
}
