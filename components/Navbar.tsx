'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import DarkModeToggle from './DarkModeToggle';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar_url?: string;
}

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const pathname = usePathname();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(data => setUser(data.user))
      .catch(() => setUser(null));
  }, [pathname]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setMenuOpen(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/me', { method: 'DELETE' }).catch(() => {});
    await fetch('/teacher/logout', { method: 'POST' }).catch(() => {});
    setUser(null);
    setProfileOpen(false);
    router.push('/');
    router.refresh();
  };

  const navLinks = [
    { href: '/', label: 'الرئيسية' },
    { href: '/courses', label: 'الدورات' },
    { href: '/teachers', label: 'المعلمون' },
  ];

  return (
    <nav style={{
      background: 'var(--nav-bg)',
      borderBottom: '1px solid var(--nav-border)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
      maxWidth: '100vw',
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', height: 60, gap: 8, overflow: 'hidden' }}>
        {/* Logo */}
        <Link href="/" style={{ textDecoration: 'none', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 38, height: 38,
              background: 'linear-gradient(135deg, #2F6FED, #0FB5AE)',
              borderRadius: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ color: 'white', fontSize: 20 }}>🎓</span>
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--text)', lineHeight: 1 }}>منصة تعلم</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', lineHeight: 1 }}>تعلم بلا حدود</div>
            </div>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <div className="desktop-nav" style={{ display: 'flex', gap: 4, marginRight: 8, flex: 1, justifyContent: 'center' }}>
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              style={{
                textDecoration: 'none',
                padding: '8px 16px',
                borderRadius: 8,
                fontWeight: 600,
                fontSize: 15,
                color: pathname === link.href ? 'var(--primary)' : 'var(--text)',
                background: pathname === link.href ? 'rgba(47,111,237,0.08)' : 'transparent',
                transition: 'all 0.15s ease',
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Search bar - desktop only */}
        <form className="desktop-search" onSubmit={handleSearch} style={{ display: 'flex', alignItems: 'center', gap: 0, flex: '0 0 auto' }}>
          <div style={{
            display: 'flex', alignItems: 'center',
            background: 'var(--feature-card-bg)',
            borderRadius: 10,
            padding: '0 12px',
            gap: 8,
            width: 200,
            border: '1px solid var(--border)',
          }}>
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="بحث..."
              style={{
                background: 'none', border: 'none', outline: 'none',
                padding: '9px 0', fontSize: 14,
                fontFamily: 'Cairo, sans-serif',
                width: '100%', textAlign: 'right',
                color: 'var(--text)',
              }}
            />
            <button type="submit" style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-muted)', padding: 0, fontSize: 16, flexShrink: 0,
            }}>
              🔍
            </button>
          </div>
        </form>

        {/* Dark mode toggle - desktop */}
        <div className="desktop-search" style={{ flexShrink: 0 }}>
          <DarkModeToggle />
        </div>

        {/* Auth area - desktop only */}
        <div className="desktop-auth" ref={dropdownRef} style={{ position: 'relative', flexShrink: 0 }}>
          {user ? (
            <>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  background: 'none', border: '1.5px solid var(--border)',
                  borderRadius: 10, padding: '6px 12px',
                  cursor: 'pointer', fontFamily: 'Cairo, sans-serif',
                }}
              >
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: user.avatar_url ? 'transparent' : 'linear-gradient(135deg, #2F6FED, #0FB5AE)',
                  overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ color: 'white', fontSize: 14, fontWeight: 700 }}>
                      {user.name.charAt(0)}
                    </span>
                  )}
                </div>
                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{user.name}</span>
                <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>▼</span>
              </button>

              {profileOpen && (
                <div className="animate-fade-in" style={{
                  position: 'absolute',
                  top: '100%', left: 0,
                  marginTop: 8,
                  background: 'var(--dropdown-bg)',
                  borderRadius: 12,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
                  border: '1px solid var(--dropdown-border)',
                  minWidth: 200,
                  overflow: 'hidden',
                  zIndex: 200,
                }}>
                  <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>{user.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{user.email}</div>
                  </div>
                  <Link href="/teacher/dashboard" style={{
                    display: 'block', padding: '10px 16px',
                    textDecoration: 'none', color: 'var(--text)',
                    fontSize: 14, fontWeight: 500,
                    transition: 'background 0.15s',
                  }}
                    onClick={() => setProfileOpen(false)}
                  >
                    📊 لوحة التحكم
                  </Link>
                  <button
                    onClick={handleLogout}
                    style={{
                      width: '100%', textAlign: 'right', padding: '10px 16px',
                      background: 'none', border: 'none', cursor: 'pointer',
                      fontSize: 14, fontWeight: 500, color: '#EF4444',
                      fontFamily: 'Cairo, sans-serif',
                    }}
                  >
                    🚪 تسجيل خروج
                  </button>
                </div>
              )}
            </>
          ) : (
            <Link href="/teacher/login">
              <button className="btn-primary" style={{ fontSize: 14, padding: '9px 18px' }}>
                تسجيل دخول كمعلم
              </button>
            </Link>
          )}
        </div>

        {/* Hamburger */}
        <button
          className="hamburger"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="القائمة"
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            padding: '6px 8px', fontSize: 22, display: 'none',
            flexShrink: 0, lineHeight: 1, color: 'var(--text)',
          }}
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="mobile-menu animate-fade-in" style={{
          background: 'var(--nav-bg)',
          borderTop: '1px solid var(--nav-border)',
          padding: '12px 16px 16px',
        }}>
          {/* Mobile search */}
          <form onSubmit={handleSearch} style={{ marginBottom: 12 }}>
            <div style={{
              display: 'flex', alignItems: 'center',
              background: 'var(--feature-card-bg)', borderRadius: 10,
              padding: '0 12px', gap: 8,
              border: '1px solid var(--border)',
            }}>
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="بحث عن دورة..."
                style={{
                  background: 'none', border: 'none', outline: 'none',
                  padding: '10px 0', fontSize: 14,
                  fontFamily: 'Cairo, sans-serif',
                  width: '100%', textAlign: 'right', color: 'var(--text)',
                }}
              />
              <button type="submit" style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--text-muted)', padding: 0, fontSize: 16, flexShrink: 0,
              }}>🔍</button>
            </div>
          </form>

          {/* Nav links */}
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              style={{
                display: 'block',
                padding: '11px 0',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: 15,
                color: pathname === link.href ? 'var(--primary)' : 'var(--text)',
                borderBottom: '1px solid var(--border)',
              }}
            >
              {link.label}
            </Link>
          ))}

          {/* Auth */}
          {user ? (
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>
                👋 {user.name}
              </div>
              <Link href="/teacher/dashboard" onClick={() => setMenuOpen(false)} style={{
                display: 'block', padding: '10px 0',
                textDecoration: 'none', color: 'var(--text)',
                fontSize: 14, fontWeight: 500,
                borderBottom: '1px solid var(--border)',
              }}>📊 لوحة التحكم</Link>
              <button
                onClick={handleLogout}
                style={{
                  width: '100%', textAlign: 'right', padding: '10px 0',
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: 14, fontWeight: 500, color: '#EF4444',
                  fontFamily: 'Cairo, sans-serif',
                }}
              >🚪 تسجيل خروج</button>
            </div>
          ) : (
            <Link href="/teacher/login" style={{ display: 'block', marginTop: 12 }} onClick={() => setMenuOpen(false)}>
              <button className="btn-primary" style={{ width: '100%' }}>
                تسجيل دخول كمعلم
              </button>
            </Link>
          )}

          {/* Dark mode in mobile menu */}
          <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 500 }}>الوضع الليلي</span>
            <DarkModeToggle />
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .desktop-search { display: none !important; }
          .desktop-auth { display: none !important; }
          .hamburger { display: block !important; }
        }
        @media (min-width: 769px) {
          .mobile-menu { display: none !important; }
        }
      `}</style>
    </nav>
  );
}
