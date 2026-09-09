import { ReactNode, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  PanelLeft, Search, Bell, Settings, LayoutGrid,
  LifeBuoy, ArrowLeft, X, ChevronsUpDown,
} from 'lucide-react';
import BrandLogo from './BrandLogo';
import { useI18n, TKey } from '../i18n';
import { useScrollLock } from '../hooks/useReveal';
import { ROUTES } from '../routes';

export interface DashItem {
  id: string;
  label: TKey;
  icon: typeof LayoutGrid;
  badge?: number;
}

export interface DashGroup { title: TKey; items: DashItem[]; }

interface DashboardShellProps {
  /** Nom de l'espace affiché dans le sélecteur en haut de la barre latérale. */
  workspace: string;
  workspaceSub: string;
  groups: DashGroup[];
  active: string;
  onNavigate: (id: string) => void;
  /** Identité affichée en bas de la barre latérale. */
  user: { name: string; email: string };
  title: string;
  /** Bouton d'action principal, à droite du titre. */
  action?: ReactNode;
  children: ReactNode;
}

export default function DashboardShell({
  workspace, workspaceSub, groups, active, onNavigate,
  user, title, action, children,
}: DashboardShellProps) {
  const { t } = useI18n();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useScrollLock(open);
  useEffect(() => setOpen(false), [pathname]);

  const initials = user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  const sidebar = (
    <>
      <div className="dash-side-head">
        <span className="dash-ws">
          <span className="dash-ws-mark"><BrandLogo size={22} /></span>
          <span className="dash-ws-text">
            <span className="dash-ws-name">{workspace}</span>
            <span className="dash-ws-sub">{workspaceSub}</span>
          </span>
          <ChevronsUpDown size={15} strokeWidth={1.9} className="dash-ws-caret" />
        </span>
        <button type="button" className="btn btn-icon dash-side-close" onClick={() => setOpen(false)} aria-label={t('common.close')}>
          <X size={20} strokeWidth={1.8} />
        </button>
      </div>

      <nav className="dash-nav" aria-label={workspace}>
        {groups.map(group => (
          <div className="dash-nav-group" key={group.title}>
            <p className="dash-nav-title">{t(group.title)}</p>
            {group.items.map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`dash-nav-item${item.id === active ? ' is-active' : ''}`}
                  onClick={() => { onNavigate(item.id); setOpen(false); }}
                >
                  <Icon size={17} strokeWidth={1.9} />
                  <span className="dash-nav-label">{t(item.label)}</span>
                  {!!item.badge && <span className="dash-nav-badge">{item.badge}</span>}
                </button>
              );
            })}
          </div>
        ))}

        <div className="dash-nav-group">
          <p className="dash-nav-title">{t('dash.other')}</p>
          <Link to={ROUTES.contact} className="dash-nav-item">
            <LifeBuoy size={17} strokeWidth={1.9} />
            <span className="dash-nav-label">{t('dash.help')}</span>
          </Link>
          <Link to={ROUTES.home} className="dash-nav-item">
            <ArrowLeft size={17} strokeWidth={1.9} />
            <span className="dash-nav-label">{t('nav.backToShop')}</span>
          </Link>
        </div>
      </nav>

      <div className="dash-side-foot">
        <span className="avatar dash-user-avatar">{initials}</span>
        <span className="dash-user-text">
          <span className="dash-user-name">{user.name}</span>
          <span className="dash-user-mail">{user.email}</span>
        </span>
        <ChevronsUpDown size={15} strokeWidth={1.9} className="dash-ws-caret" />
      </div>
    </>
  );

  return (
    <div className={`dash-shell${collapsed ? ' is-collapsed' : ''}`}>
      <aside className="dash-side">{sidebar}</aside>

      <div
        className={`nav-scrim${open ? ' is-open' : ''}`}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />
      <aside className={`dash-side dash-side-mobile${open ? ' is-open' : ''}`} aria-hidden={!open}>
        {sidebar}
      </aside>

      <div className="dash-main">
        <header className="dash-topbar">
          <button
            type="button"
            className="btn btn-icon dash-burger"
            onClick={() => setOpen(true)}
            aria-label={t('nav.menu')}
          >
            <PanelLeft size={19} strokeWidth={1.9} />
          </button>
          <button
            type="button"
            className="btn btn-icon dash-collapse"
            onClick={() => setCollapsed(c => !c)}
            aria-label={t('dash.collapse')}
            aria-pressed={collapsed}
          >
            <PanelLeft size={19} strokeWidth={1.9} />
          </button>

          <span className="dash-topbar-sep" aria-hidden="true" />

          <nav className="dash-crumbs" aria-label={t('dash.sections')}>
            {groups[0]?.items.slice(0, 4).map(item => (
              <button
                key={item.id}
                type="button"
                className={`dash-crumb${item.id === active ? ' is-active' : ''}`}
                onClick={() => onNavigate(item.id)}
              >
                {t(item.label)}
              </button>
            ))}
          </nav>

          <div className="dash-topbar-right">
            <span className="dash-search">
              <Search size={16} strokeWidth={1.9} />
              <input className="dash-search-input" placeholder={t('common.search')} aria-label={t('common.search')} />
              <kbd className="dash-kbd">⌘K</kbd>
            </span>
            <button type="button" className="btn btn-icon" aria-label={t('dash.notifications')}>
              <span className="notif-anchor">
                <Bell size={18} strokeWidth={1.9} />
                <span className="notif-badge notif-badge-dot" />
              </span>
            </button>
            <button type="button" className="btn btn-icon" aria-label={t('dash.settings')}>
              <Settings size={18} strokeWidth={1.9} />
            </button>
            <span className="avatar dash-topbar-avatar">{initials}</span>
          </div>
        </header>

        <div className="dash-content">
          <div className="dash-content-head">
            <h1 className="dash-h1">{title}</h1>
            {action}
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
