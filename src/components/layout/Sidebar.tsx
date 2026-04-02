'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

const navItems = [
  {
    label: 'Chat',
    href: '/chat',
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" /></svg>,
  },
  {
    label: 'Productos',
    href: '/products',
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" /></svg>,
    statKey: 'products' as const,
  },
  {
    label: 'Fuentes',
    href: '/sources',
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" /></svg>,
    statKey: 'sources' as const,
  },
];

interface Stats {
  sources: number;
  products: number;
  chunks: number;
  suppliers: number;
}

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [stats, setStats] = useState<Stats>({ sources: 0, products: 0, chunks: 0, suppliers: 0 });
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    fetch('/api/stats').then(r => r.ok ? r.json() : null).then(d => { if (d) setStats(d); });
    const interval = setInterval(() => {
      fetch('/api/stats').then(r => r.ok ? r.json() : null).then(d => { if (d) setStats(d); });
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  }

  const sidebarContent = (
    <aside className="w-64 flex flex-col h-full" style={{backgroundColor: '#001F5F'}}>
      {/* Logo */}
      <div className="px-6 py-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
            </svg>
          </div>
          <div>
            <h1 className="text-white font-semibold text-sm">Iluminar</h1>
            <p className="text-white/50 text-xs">Asistente AI</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(item => {
          const isActive = pathname.startsWith(item.href);
          const count = item.statKey ? stats[item.statKey] : undefined;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive ? 'bg-white/15 text-white' : 'text-white/60 hover:bg-white/10 hover:text-white/90'
              }`}
            >
              <span className="flex items-center gap-3">
                {item.icon}
                {item.label}
              </span>
              {count !== undefined && count > 0 && (
                <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full">{count}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Stats summary */}
      <div className="px-4 py-3 mx-3 mb-3 bg-white/5 rounded-lg">
        <div className="grid grid-cols-2 gap-2 text-center">
          <div>
            <p className="text-white font-semibold text-sm">{stats.suppliers}</p>
            <p className="text-white/40 text-xs">Proveed.</p>
          </div>
          <div>
            <p className="text-white font-semibold text-sm">{stats.chunks}</p>
            <p className="text-white/40 text-xs">Fragmentos</p>
          </div>
        </div>
      </div>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/50 hover:text-white/80 hover:bg-white/10 transition-colors w-full"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3H15" />
          </svg>
          Cerrar sesión
        </button>
      </div>
    </aside>
  );

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg text-white"
        style={{backgroundColor: '#001F5F'}}
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          {mobileOpen
            ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            : <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          }
        </svg>
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 bg-black/40 z-40" onClick={() => setMobileOpen(false)} />
      )}

      {/* Desktop sidebar */}
      <div className="hidden md:block">{sidebarContent}</div>

      {/* Mobile sidebar */}
      <div className={`md:hidden fixed inset-y-0 left-0 z-40 transform transition-transform ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {sidebarContent}
      </div>
    </>
  );
}
