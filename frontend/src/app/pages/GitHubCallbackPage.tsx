import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Loader2, Code2 } from 'lucide-react';
import { useAuth } from '../../lib/auth';

export function GitHubCallbackPage() {
  const { loginWithGitHub } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get('code');
    if (!code) { setError('No se recibió código de GitHub'); return; }

    loginWithGitHub(code)
      .then(({ githubToken }) => {
        if (githubToken) localStorage.setItem('kryvant_github_token', githubToken);
        navigate('/onboarding');
      })
      .catch((err: Error) => setError(err.message));
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4">{error}</p>
          <a href="/login" className="text-primary hover:underline">Volver al login</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
          <Code2 className="w-8 h-8 text-primary" />
        </div>
        <Loader2 className="w-6 h-6 text-primary animate-spin mx-auto mb-3" />
        <p className="text-muted-foreground">Autenticando con GitHub...</p>
      </div>
    </div>
  );
}
