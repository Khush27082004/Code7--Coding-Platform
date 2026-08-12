import type { ReactNode } from 'react';

type AppShellProps = {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
  /** Wider layout for data-heavy pages */
  wide?: boolean;
};

export const AppShell = ({ title, subtitle, actions, children, wide }: AppShellProps) => {
  return (
    <div className="min-h-dvh bg-[var(--bg-base)] text-[var(--text-secondary)]">
      {/* Sticky page header */}
      <div className="sticky top-0 z-20 bg-[var(--bg-surface)] border-b border-[var(--border-subtle)]">
        <div className={`mx-auto px-5 sm:px-8 py-4 ${wide ? 'max-w-[1600px]' : 'max-w-5xl'}`}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)] capitalize">{title}</h1>
              {subtitle && (
                <p className="text-xs text-[var(--text-muted)] mt-0.5 font-medium">{subtitle}</p>
              )}
            </div>
            {actions && (
              <div className="flex flex-wrap items-center gap-2 shrink-0">{actions}</div>
            )}
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
