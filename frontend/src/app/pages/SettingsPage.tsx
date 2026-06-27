import { useEffect, useState } from 'react';
import { User, Github, Save, Loader2 } from 'lucide-react';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth';

export function SettingsPage() {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [profile, setProfile] = useState({
    githubUsername: '',
    linkedinUrl: '',
    bio: '',
    yearsOfExp: 0,
    currentRole: '',
  });

  useEffect(() => {
    api.getProfile().then((u) => {
      if (u.profile) {
        setProfile({
          githubUsername: u.profile.githubUsername || '',
          linkedinUrl: u.profile.linkedinUrl || '',
          bio: u.profile.bio || '',
          yearsOfExp: u.profile.yearsOfExp || 0,
          currentRole: u.profile.currentRole || '',
        });
      }
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await api.updateProfile(profile);
      setMessage('Perfil guardado correctamente');
    } catch (err: any) {
      setMessage(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl mb-2">Configuración</h1>
        <p className="text-muted-foreground">Gestiona tu cuenta y preferencias</p>
      </div>

      {message && (
        <div className={`mb-6 px-4 py-3 rounded-lg text-sm border ${
          message.includes('correctamente')
            ? 'bg-primary/10 border-primary/20 text-primary'
            : 'bg-destructive/10 border-destructive/20 text-destructive'
        }`}>
          {message}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Cuenta */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-lg mb-4 flex items-center gap-2">
              <User className="w-5 h-5" />
              Cuenta
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-muted-foreground mb-1.5">Email</label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full px-3 py-2.5 bg-muted border border-border rounded-lg text-muted-foreground cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm text-muted-foreground mb-1.5">Usuario</label>
                <input
                  type="text"
                  value={user?.username || ''}
                  disabled
                  className="w-full px-3 py-2.5 bg-muted border border-border rounded-lg text-muted-foreground cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Perfil profesional */}
          <form onSubmit={handleSave} className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-lg mb-4 flex items-center gap-2">
              <Github className="w-5 h-5" />
              Perfil Profesional
            </h2>

            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-muted-foreground mb-1.5">Usuario de GitHub</label>
                  <input
                    type="text"
                    value={profile.githubUsername}
                    onChange={(e) => setProfile((p) => ({ ...p, githubUsername: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="tu-usuario"
                  />
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-1.5">Rol actual</label>
                  <input
                    type="text"
                    value={profile.currentRole}
                    onChange={(e) => setProfile((p) => ({ ...p, currentRole: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="Mid Software Engineer"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-muted-foreground mb-1.5">LinkedIn URL</label>
                  <input
                    type="url"
                    value={profile.linkedinUrl}
                    onChange={(e) => setProfile((p) => ({ ...p, linkedinUrl: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="https://linkedin.com/in/tu-perfil"
                  />
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-1.5">Años de experiencia</label>
                  <input
                    type="number"
                    min={0}
                    max={50}
                    value={profile.yearsOfExp}
                    onChange={(e) => setProfile((p) => ({ ...p, yearsOfExp: Number(e.target.value) }))}
                    className="w-full px-3 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-muted-foreground mb-1.5">Bio</label>
                <textarea
                  value={profile.bio}
                  onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                  placeholder="Cuéntanos sobre ti..."
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground mt-1 text-right">{profile.bio.length}/500</p>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Guardar cambios
              </button>
            </div>
          </form>
        </div>

        <div className="space-y-6">
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-lg mb-4">Tu cuenta</h2>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-medium text-lg">
                {user?.username?.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="font-medium">{user?.username}</div>
                <div className="text-sm text-muted-foreground">{user?.plan}</div>
              </div>
            </div>
            <button
              onClick={logout}
              className="w-full py-2.5 border border-border rounded-lg text-sm text-muted-foreground hover:text-destructive hover:border-destructive/30 transition-colors"
            >
              Cerrar sesión
            </button>
          </div>

          <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-6">
            <h2 className="text-lg mb-2 text-destructive">Zona peligrosa</h2>
            <p className="text-sm text-muted-foreground mb-4">Esta acción no se puede deshacer.</p>
            <button className="w-full py-2 border border-destructive/30 text-destructive rounded-lg text-sm hover:bg-destructive/10 transition-colors">
              Eliminar cuenta
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
