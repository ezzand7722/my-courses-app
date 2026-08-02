'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function TeacherLoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.email) e.email = 'البريد الإلكتروني مطلوب';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'بريد إلكتروني غير صالح';
    if (!form.password) e.password = 'كلمة المرور مطلوبة';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setServerError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setServerError(data.error || 'فشل تسجيل الدخول');
        return;
      }
      router.push('/teacher/dashboard');
      router.refresh();
    } catch {
      setServerError('خطأ في الشبكة، يرجى المحاولة مرة أخرى');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #EBF2FF 0%, #F0FFFE 100%)',
      padding: 24,
    }}>
      <div style={{
        background: 'white', borderRadius: 20,
        padding: '40px 36px', width: '100%', maxWidth: 420,
        boxShadow: '0 8px 40px rgba(47,111,237,0.12)',
        border: '1px solid #E5E7EB',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 14,
            background: 'linear-gradient(135deg, #2F6FED, #0FB5AE)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px', fontSize: 28,
          }}>
            🎓
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>تسجيل دخول المعلم</h1>
          <p style={{ fontSize: 14, color: '#6B7280' }}>بريدك الإلكتروني وكلمة المرور للدخول</p>
        </div>

        <form onSubmit={handleSubmit}>
          {serverError && (
            <div style={{
              background: '#FEF2F2', color: '#EF4444', borderRadius: 10,
              padding: '12px 16px', fontSize: 14, marginBottom: 20,
              border: '1px solid #FECACA',
            }}>
              {serverError}
            </div>
          )}

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontWeight: 600, fontSize: 14, marginBottom: 6 }}>
              البريد الإلكتروني
            </label>
            <input
              className={`input-field ${errors.email ? 'error' : ''}`}
              type="email"
              placeholder="teacher@example.com"
              value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              disabled={loading}
            />
            {errors.email && (
              <div style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>{errors.email}</div>
            )}
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontWeight: 600, fontSize: 14, marginBottom: 6 }}>
              كلمة المرور
            </label>
            <input
              className={`input-field ${errors.password ? 'error' : ''}`}
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
              disabled={loading}
            />
            {errors.password && (
              <div style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>{errors.password}</div>
            )}
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '13px' }}
            disabled={loading}
          >
            {loading ? <span className="spinner" /> : 'تسجيل الدخول'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: '#6B7280' }}>
          ليس لديك حساب؟{' '}
          <Link href="/teacher/register" style={{ color: '#2F6FED', fontWeight: 600, textDecoration: 'none' }}>
            سجّل كمعلم جديد
          </Link>
        </div>

        <div style={{ textAlign: 'center', marginTop: 12 }}>
          <Link href="/" style={{ fontSize: 13, color: '#9CA3AF', textDecoration: 'none' }}>
            ← العودة للصفحة الرئيسية
          </Link>
        </div>
      </div>
    </div>
  );
}
