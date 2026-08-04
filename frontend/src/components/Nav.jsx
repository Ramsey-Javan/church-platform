import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useChurchSettings } from '../context/ChurchSettingsContext';

const links = [
  { to: '/plan-a-visit', label: 'Plan a Visit' },
  { to: '/watch', label: 'Watch' },
  { to: '/ministries', label: 'Ministries' },
  { to: '/events', label: 'Events' },
  { to: '/about', label: 'About' },
  { to: '/connect', label: 'Connect' },
];

export default function Nav() {
  const { settings } = useChurchSettings();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="border-b relative" style={{ borderColor: 'var(--color-rule)' }}>
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3" onClick={() => setMenuOpen(false)}>
          {settings?.logo && (
            <img
              src={settings.logo}
              alt={`${settings.name} logo`}
              className="h-9 w-9 object-contain rounded-full"
            />
          )}
          <span className="font-display text-xl" style={{ color: 'var(--color-ink)' }}>
            {settings?.name || 'Loading...'}
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className="text-sm font-medium"
              style={({ isActive }) => ({
                color: isActive ? 'var(--color-gold)' : 'var(--color-ink)',
              })}
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            to="/give"
            className="hidden sm:inline-block text-sm font-semibold px-4 py-2 rounded-full text-white"
            style={{ background: 'var(--color-gold)' }}
          >
            Give
          </Link>

          {/* Mobile menu toggle */}
          <button
            type="button"
            className="md:hidden p-2 rounded"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span className="block w-6 h-0.5 mb-1.5" style={{ background: 'var(--color-ink)' }} />
            <span className="block w-6 h-0.5 mb-1.5" style={{ background: 'var(--color-ink)' }} />
            <span className="block w-6 h-0.5" style={{ background: 'var(--color-ink)' }} />
          </button>
        </div>
      </div>

      {/* Mobile menu panel */}
      {menuOpen && (
        <nav
          className="md:hidden border-t px-6 py-4 flex flex-col gap-4"
          style={{ borderColor: 'var(--color-rule)', background: 'var(--color-paper)' }}
        >
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              onClick={() => setMenuOpen(false)}
              className="text-base font-medium"
              style={({ isActive }) => ({
                color: isActive ? 'var(--color-gold)' : 'var(--color-ink)',
              })}
            >
              {l.label}
            </NavLink>
          ))}
          <Link
            to="/give"
            onClick={() => setMenuOpen(false)}
            className="text-base font-semibold px-4 py-2 rounded-full text-white text-center"
            style={{ background: 'var(--color-gold)' }}
          >
            Give
          </Link>
        </nav>
      )}
    </header>
  );
}