import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { authApi } from '@/api';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await authApi.forgotPassword(email);
      setIsSuccess(true);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Une erreur est survenue.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-background overflow-hidden">
      {/* Left side: branding (reusing style from Login) */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 bg-muted/30">
        <div 
          className="absolute inset-0 z-0 opacity-40 bg-cover bg-center mix-blend-overlay"
          style={{ backgroundImage: 'url("/login-bg.png")' }}
        />
        <div className="absolute inset-0 z-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-80" />
        
        <div className="relative z-10 flex items-center gap-3">
          <img 
            src="/Logo-cockpit.jpeg" 
            alt="Cockpit Logo" 
            className="h-12 w-auto object-contain rounded-md shadow-lg border border-white/10"
          />
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Cockpit</h2>
            <p className="text-[10px] font-bold text-primary uppercase tracking-widest leading-none">Administration</p>
          </div>
        </div>

        <div className="relative z-10 max-w-lg mb-12">
          <h1 className="text-5xl font-extrabold tracking-tight text-foreground leading-[1.1]">
            Sécurité <span className="text-primary italic">Cockpit</span>.
          </h1>
          <p className="text-xl text-muted-foreground mt-6">
            Récupérez l'accès à votre cockpit en quelques instants. Votre sécurité est notre priorité absolue.
          </p>
        </div>

        <div className="relative z-10 text-sm text-muted-foreground font-medium opacity-60">
          © {new Date().getFullYear()} Cockpit. Security First.
        </div>
      </div>

      {/* Right side: form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 bg-background relative">
        <div className="w-full max-w-[400px] space-y-8">
          <Link 
            to="/login" 
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors mb-4 group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Retour à la connexion
          </Link>

          {isSuccess ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20">
                <CheckCircle2 className="h-8 w-8 text-primary" />
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Vérifiez vos emails</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Si un compte existe pour <strong>{email}</strong>, vous recevrez un lien pour réinitialiser votre mot de passe d'ici quelques instants.
                </p>
              </div>
              <Button asChild className="w-full h-12 rounded-xl" variant="outline">
                <Link to="/login">Retour au login</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-8 animate-in fade-in duration-500">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Mot de passe oublié ?</h2>
                <p className="text-muted-foreground">Entrez votre email pour recevoir des instructions.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="flex items-center gap-3 p-4 text-sm text-destructive bg-destructive/5 rounded-xl border border-destructive/10">
                    <AlertCircle className="h-5 w-5 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold ml-1">Adresse email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-12 bg-muted/30 border-transparent focus:border-primary/30 focus:ring-primary/20 transition-all rounded-xl"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 font-bold text-base rounded-xl shadow-lg shadow-primary/20"
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : 'Envoyer le lien'}
                </Button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
