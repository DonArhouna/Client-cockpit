import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { subscriptionPlansApi } from '@/api';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

const formSchema = z.object({
  name: z.string().min(1, 'Identifiant requis').regex(/^[a-z0-9_]+$/, 'Minuscules, chiffres et _ seulement'),
  label: z.string().min(1, 'Nom affiché requis'),
  description: z.string().optional(),
  priceMonthly: z.coerce.number().positive().nullable().optional(),
  maxUsers: z.coerce.number().int().positive().nullable().optional(),
  maxKpis: z.coerce.number().int().positive().nullable().optional(),
  maxWidgets: z.coerce.number().int().positive().nullable().optional(),
  hasNlq: z.boolean().default(false),
  hasAdvancedReports: z.boolean().default(false),
  sortOrder: z.coerce.number().int().default(0),
});

type FormValues = z.infer<typeof formSchema>;

interface CreateSubscriptionPlanModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateSubscriptionPlanModal({ open, onOpenChange }: CreateSubscriptionPlanModalProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      label: '',
      description: '',
      priceMonthly: undefined,
      maxUsers: undefined,
      maxKpis: undefined,
      maxWidgets: undefined,
      hasNlq: false,
      hasAdvancedReports: false,
      sortOrder: 0,
    },
  });

  const mutation = useMutation({
    mutationFn: (values: FormValues) => subscriptionPlansApi.create(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription-plans'] });
      toast({
        title: t('common.success'),
        description: t('subscriptionPlans.createSuccess'),
      });
      form.reset();
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: t('common.error'),
        description: error.response?.data?.message || t('common.error'),
        variant: 'destructive',
      });
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[540px]">
        <DialogHeader>
          <DialogTitle>{t('subscriptionPlans.create')}</DialogTitle>
          <DialogDescription>
            {t('subscriptionPlans.title')}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit((v) => mutation.mutate(v))} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('subscriptionPlans.name')}</FormLabel>
                    <FormControl>
                      <Input placeholder="startup" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="label"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('subscriptionPlans.label')}</FormLabel>
                    <FormControl>
                      <Input placeholder="Startup" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('roles.description')}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="priceMonthly"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('subscriptionPlans.priceMonthly')}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder={t('subscriptionPlans.customPricing')}
                        {...field}
                        value={field.value ?? ''}
                        onChange={(e) => field.onChange(e.target.value === '' ? null : e.target.value)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="sortOrder"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ordre</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="maxUsers"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('subscriptionPlans.maxUsers')}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="∞"
                        {...field}
                        value={field.value ?? ''}
                        onChange={(e) => field.onChange(e.target.value === '' ? null : e.target.value)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="maxKpis"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('subscriptionPlans.maxKpis')}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="∞"
                        {...field}
                        value={field.value ?? ''}
                        onChange={(e) => field.onChange(e.target.value === '' ? null : e.target.value)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="maxWidgets"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max widgets</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="∞"
                        {...field}
                        value={field.value ?? ''}
                        onChange={(e) => field.onChange(e.target.value === '' ? null : e.target.value)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex gap-6">
              <FormField
                control={form.control}
                name="hasNlq"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2 space-y-0">
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel className="font-normal">{t('subscriptionPlans.hasNlq')}</FormLabel>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="hasAdvancedReports"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2 space-y-0">
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel className="font-normal">{t('subscriptionPlans.hasAdvancedReports')}</FormLabel>
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                {t('common.cancel')}
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t('common.create')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
