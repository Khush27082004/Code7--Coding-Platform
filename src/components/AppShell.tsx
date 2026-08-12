import type { ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

type AppShellProps = {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
  /** Wider layout for data-heavy pages */
  wide?: boolean;
};

export const AppShell = ({ title, subtitle, actions, children, wide }: AppShellProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-dvh bg-[var(--bg-base)] text-[var(--text-secondary)]">
      {/* Sticky page header */}
      <div className="sticky top-0 z-20 bg-[var(--bg-surface)] border-b border-[var(--border-subtle)]">
        <div className={`mx-auto px-5 sm:px-8 py-4 ${wide ? 'max-w-[1600px]' : 'max-w-5xl'}`}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)] capitalize">{title}</h1>
              {subtitle && (
                <p className="text-xs text-[var(--text-muted)] mt-0.5 font-medium">{subtitle}</p>
              )}
            </div>
            
            <div className="flex items-center gap-4 self-end sm:self-auto shrink-0">
              {actions && (
                <div className="flex flex-wrap items-center gap-2">{actions}</div>
              )}
              {user && (
                <>
                  <div className="h-5 w-px bg-[var(--border-subtle)] hidden sm:block" />
                  <div className="flex items-center gap-3">
                    <div className="hidden md:block text-right">
                      <p className="text-xs font-bold text-[var(--text-primary)] leading-none mb-0.5 capitalize">{user.fullName}</p>
                      <p className="text-[9px] text-[var(--text-muted)] font-bold uppercase tracking-wider">{user.role}</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="px-3 py-1.5 border border-black rounded-lg text-[10px] font-extrabold uppercase tracking-widest bg-black text-white hover:bg-neutral-800 transition-all active:scale-[0.97]"
                    >
                      Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Page content */}
      <div className={`mx-auto px-5 sm:px-8 py-8 ${wide ? 'max-w-[1600px]' : 'max-w-5xl'}`}>
        {children}
      </div>
    </div>
  );
};
