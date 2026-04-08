import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTranslation } from 'react-i18next';
import { Bug as BugIcon, ChevronRight, Upload, X, Loader2, CheckCircle2, Crosshair } from 'lucide-react';
import { ScreenshotPicker } from './ScreenshotPicker';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogTitle,
  DialogTrigger 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useTechnicalContext } from '../hooks/useTechnicalContext';
import { supportApi } from '../api/supportApi';
import { cn } from '@/lib/utils';

const bugSchema = z.object({
  title: z.string().min(5, "Le titre est trop court"),
  bug_type: z.array(z.string()).min(1, "Sélectionnez au moins un type"),
  module: z.string().min(1, "Veuillez sélectionner un module"),
  description: z.string().min(20, "Veuillez donner plus de détails"),
  steps_to_reproduce: z.string().optional(),
  expected_behavior: z.string().optional(),
  actual_behavior: z.string().optional(),
  impact: z.string(),
  frequency: z.string(),
  console_errors: z.string().optional(),
});

type BugFormValues = z.infer<typeof bugSchema>;

const BUG_TYPES = [
  { id: 'affichage', label: 'Affichage / UI' },
  { id: 'calcul', label: 'Calcul / Données' },
  { id: 'bloquant', label: 'Bloquant / Crash' },
  { id: 'performance', label: 'Performance / Lenteur' },
  { id: 'autre', label: 'Autre' },
];

interface BugReportModalProps {
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function BugReportModal({ children, open, onOpenChange }: BugReportModalProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const techContext = useTechnicalContext();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [attachments, setAttachments] = React.useState<File[]>([]);
  const [isCapturing, setIsCapturing] = React.useState(false);

  const form = useForm<BugFormValues>({
    resolver: zodResolver(bugSchema),
    defaultValues: {
      title: '',
      bug_type: [],
      module: '',
      description: '',
      steps_to_reproduce: '',
      expected_behavior: '',
      actual_behavior: '',
      impact: 'gene_operationnelle',
      frequency: 'parfois',
      console_errors: '',
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setAttachments(prev => [...prev, ...newFiles]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleCaptureZone = () => {
    // Ferme le modal pour laisser la place au picker
    onOpenChange?.(false);
    // Petit délai pour laisser le modal se fermer avant de monter le picker
    setTimeout(() => setIsCapturing(true), 200);
  };

  const handleCaptureComplete = (file: File) => {
    setAttachments(prev => [...prev, file]);
    setIsCapturing(false);
    onOpenChange?.(true);
  };

  const handleCaptureCancel = () => {
    setIsCapturing(false);
    onOpenChange?.(true);
  };

  const onSubmit = async (values: BugFormValues) => {
    setIsSubmitting(true);

    try {
      const attachmentUrls: string[] = [];
      for (const file of attachments) {
        const { url } = await supportApi.uploadAttachment(file);
        attachmentUrls.push(url);
      }

      const bugData = {
        ...values,
        steps_to_reproduce: values.steps_to_reproduce ? values.steps_to_reproduce.split('\n') : [],
        attachments: attachmentUrls,
        ...techContext,
        priority: 'moyenne' as any,
      };

      const result = await supportApi.createBug(bugData as any);

      toast({
        title: t('support.successTitle'),
        description: t('support.successDescription', { id: result.bugId }),
      });

      form.reset();
      setAttachments([]);
      onOpenChange?.(false);
    } catch (error) {
      toast({
        title: t('support.errorTitle'),
        description: t('support.errorDescription'),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {isCapturing && (
        <ScreenshotPicker
          onCapture={handleCaptureComplete}
          onCancel={handleCaptureCancel}
        />
      )}
    <Dialog open={open} onOpenChange={onOpenChange}>

      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="sm:max-w-[700px] overflow-y-auto max-h-[95vh] p-0 border-none bg-transparent shadow-none">
        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-white/20 dark:border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col h-full">
          {/* Header custom */}
          <div className="p-6 pb-4 relative overflow-hidden border-b border-slate-100 dark:border-slate-800">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mt-16 blur-3xl" />
            <div className="relative z-10 flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                <BugIcon className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold tracking-tight">{t('support.title')}</DialogTitle>
                <DialogDescription className="text-slate-500 dark:text-slate-400 text-xs">
                  {t('support.subtitle')}
                </DialogDescription>
              </div>
            </div>
          </div>

          <div className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-2">
                        <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-500">Titre du problème</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Ex: Erreur lors de l'affichage du graphique de revenus" 
                            className="rounded-xl border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="bug_type"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-2">
                        <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-500">Type de bug</FormLabel>
                        <div className="flex flex-wrap gap-2">
                          {BUG_TYPES.map((type) => (
                            <button
                              key={type.id}
                              type="button"
                              onClick={() => {
                                const current = field.value || [];
                                const next = current.includes(type.id)
                                  ? current.filter((v) => v !== type.id)
                                  : [...current, type.id];
                                field.onChange(next);
                              }}
                              className={cn(
                                "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
                                field.value?.includes(type.id)
                                  ? "bg-primary/10 border-primary text-primary shadow-sm shadow-primary/10"
                                  : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300"
                              )}
                            >
                              {type.label}
                            </button>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="module"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-500">{t('support.fieldModule')}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="rounded-xl border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50">
                              <SelectValue placeholder={t('support.fieldModulePlaceholder')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="rounded-xl">
                            <SelectItem value="dashboard">Dashboard</SelectItem>
                            <SelectItem value="revenue">Ventes & Revenus</SelectItem>
                            <SelectItem value="inventory">Stocks</SelectItem>
                            <SelectItem value="finance">Finance</SelectItem>
                            <SelectItem value="settings">Paramètres</SelectItem>
                            <SelectItem value="nlq">Assistant IA (NLQ)</SelectItem>
                            <SelectItem value="other">Autre</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="impact"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-500">{t('support.fieldImpact')}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="rounded-xl border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="rounded-xl">
                            <SelectItem value="production_bloquee">{t('bugImpact.production_bloquee')}</SelectItem>
                            <SelectItem value="travail_degrade">{t('bugImpact.travail_degrade')}</SelectItem>
                            <SelectItem value="gene_operationnelle">{t('bugImpact.gene_operationnelle')}</SelectItem>
                            <SelectItem value="faible">{t('bugImpact.faible')}</SelectItem>
                          </SelectContent>
                        </Select>
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
                      <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-500">{t('support.fieldDescription')}</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Décrivez précisément ce qui ne fonctionne pas..."
                          className="min-h-[80px] rounded-xl border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="expected_behavior"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-500">Résultat attendu</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Ce qui aurait dû se passer..."
                            className="min-h-[60px] rounded-xl border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50"
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="actual_behavior"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-500">Résultat observé</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Ce qui s'est réellement passé..."
                            className="min-h-[60px] rounded-xl border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50"
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-500">{t('support.fieldAttachments')}</FormLabel>
                    <div className="grid grid-cols-3 gap-2">
                      {attachments.map((file, i) => (
                        <div key={i} className="group relative aspect-square rounded-xl border border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-center bg-slate-50 dark:bg-slate-900/50 overflow-hidden">
                          {file.type.startsWith('image/') ? (
                            <img
                              src={URL.createObjectURL(file)}
                              alt={file.name}
                              className="absolute inset-0 w-full h-full object-cover rounded-xl"
                            />
                          ) : (
                            <span className="text-[10px] text-slate-400 truncate px-1">{file.name}</span>
                          )}
                          <button
                            type="button"
                            onClick={() => removeAttachment(i)}
                            className="absolute top-0.5 right-0.5 h-4 w-4 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-2 w-2" />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={handleCaptureZone}
                        className="aspect-square rounded-xl border-2 border-dashed border-primary/40 flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-primary hover:bg-primary/5 transition-all text-primary/60 hover:text-primary"
                        title="Capturer une zone de l'écran"
                      >
                        <Crosshair className="h-4 w-4" />
                        <span className="text-[10px] font-bold">Zone</span>
                      </button>
                      <label className="aspect-square rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all text-slate-400 hover:text-primary">
                        <Upload className="h-4 w-4" />
                        <span className="text-[10px] font-bold">Ajouter</span>
                        <input type="file" className="hidden" multiple accept="image/*" onChange={handleFileChange} />
                      </label>
                    </div>
                  </div>

                  <FormField
                    control={form.control}
                    name="console_errors"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-500">Logs / Erreurs console</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Copiez les erreurs techniques ici..."
                            className="min-h-[60px] font-mono text-[10px] rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-red-600 dark:text-red-400"
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 uppercase font-bold tracking-widest">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    <span>Metadata technique incluse</span>
                  </div>
                  <div className="flex gap-3">
                    <Button 
                      type="button" 
                      variant="ghost" 
                      onClick={() => onOpenChange?.(false)}
                      className="rounded-xl text-xs"
                    >
                      Annuler
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="rounded-xl px-6 bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 transition-all active:scale-95 text-xs font-bold"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                          {t('support.submitting')}
                        </>
                      ) : (
                        <>
                          {t('support.submit')}
                          <ChevronRight className="ml-2 h-3.5 w-3.5" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}
