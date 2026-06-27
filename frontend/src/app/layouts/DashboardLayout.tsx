import { Outlet, Link, useLocation, useNavigate } from 'react-router';
import { LayoutDashboard, FolderKanban, Briefcase, BookOpen, CreditCard, Settings, Code2, Users, LogOut } from 'lucide-react';
import { useAuth } from '../../lib/auth';

export function DashboardLayout() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Panel', exact: true },
    { path: '/dashboard/projects', icon: FolderKanban, label: 'Mis Proyectos' },
    { path: '/dashboard/jobs', icon: Briefcase, label: 'Trabajos Big Tech' },
    { path: '/dashboard/learning', icon: BookOpen, label: 'Learning Hub' },
    { path: '/dashboard/billing', icon: CreditCard, label: 'Suscripción' },
    { path: '/dashboard/settings', icon: Settings, label: 'Configuración' },
  ];

  const isActive = (path: string, exact?: boolean) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const initials = user?.username?.slice(0, 2).toUpperCase() || 'KR';

  return (
    <div className="min-h-screen bg-background flex">
      <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
        <div className="p-6 border-b border-sidebar-border">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-sidebar-primary rounded-lg flex items-center justify-center">
              <Code2 className="w-5 h-5 text-sidebar-primary-foreground" />
            </div>
            <span className="text-xl font-semibold text-sidebar-foreground">Kryvant</span>
          </Link>
        </div>

        <nav className="flex-1 p-4">
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path, item.exact);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    active
                      ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="mt-8 pt-8 border-t border-sidebar-border">
            <Link
              to="/dashboard/b2b"
              className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sidebar-foreground hover:bg-sidebar-accent"
            >
              <Users className="w-5 h-5" />
              <span>Admin Equipos</span>
            </Link>
          </div>
        </nav>

        <div className="p-4 border-t border-sidebar-border">
          <div className="px-4 py-3 bg-sidebar-accent rounded-lg">
            <div className="flex items-center gap-3">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.username} className="w-8 h-8 rounded-full flex-shrink-0" />
              ) : (
                <div className="w-8 h-8 bg-sidebar-primary rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-xs text-sidebar-primary-foreground font-medium">{initials}</span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="text-sm text-sidebar-foreground truncate">{user?.username || 'Usuario'}</div>
                <div className="text-xs text-muted-foreground">Plan {user?.plan || 'FREE'}</div>
              </div>
              <button
                onClick={handleLogout}
                title="Cerrar sesión"
                className="text-muted-foreground hover:text-sidebar-foreground transition-colors flex-shrink-0"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
