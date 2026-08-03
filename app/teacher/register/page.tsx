'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function TeacherRegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'الاسم مطلوب';
    else if (form.name.trim().length < 3) e.name = 'الاسم قصير جداً';
    if (!form.email) e.email = 'البريد الإلكتروني مطلوب';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'بريد إلكتروني غير صالح';
    if (!form.password) e.password = 'كلمة المرور مطلوبة';
    else if (form.password.length < 8) e.password = 'كلمة المرور 8 أحرف على الأقل';
    if (form.password !== form.confirm) e.confirm = 'كلمة المرور غير متطابقة';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setServerError('');
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setServerError(data.error || 'فشل إنشاء الحساب');
        return;
      }
      router.push('/teacher/dashboard');
      router.refresh();
    } catch {
      setServerError('خطأ في الشبكة');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--hero-gradient)',
      padding: 24,
    }}>
      <div style={{
        background: 'var(--card-bg)', borderRadius: 20,
        padding: '40px 36px', width: '100%', maxWidth: 440,
        boxShadow: '0 8px 40px rgba(47,111,237,0.12)',
        border: '1px solid var(--border)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 14,
            background: 'linear-gradient(135deg, #2F6FED, #0FB5AE)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px', fontSize: 28,
          }}>
            🎓
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4, color: 'var(--text)' }}>تسجيل كمعلم جديد</h1>
          <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>أنشئ حسابك وابدأ نشر دوراتك</p>
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

          {/* Name */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontWeight: 600, fontSize: 14, marginBottom: 6, color: 'var(--text)' }}>
              الاسم الكامل
            </label>
            <input
              className={`input-field ${errors.name ? 'error' : ''}`}
              type="text"
              placeholder="مثلاً: أحمد محمد"
              value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              disabled={loading}
            />
            {errors.name && <div style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>{errors.name}</div>}
          </div>

          {/* Email */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontWeight: 600, fontSize: 14, marginBottom: 6, color: 'var(--text)' }}>
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
            {errors.email && <div style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>{errors.email}</div>}
          </div>

          {/* Password */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontWeight: 600, fontSize: 14, marginBottom: 6, color: 'var(--text)' }}>
              كلمة المرور
            </label>
            <div className="password-wrapper">
              <input
                className={`input-field ${errors.password ? 'error' : ''}`}
                type={showPassword ? 'text' : 'password'}
                placeholder="على الأقل 8 أحرف"
                value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                disabled={loading}
                style={{ paddingLeft: 44 }}
              />
              <button type="button" className="password-toggle" onClick={() => setShowPassword(s => !s)} tabIndex={-1}>
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
            {errors.password && <div style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>{errors.password}</div>}
          </div>

          {/* Confirm */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontWeight: 600, fontSize: 14, marginBottom: 6, color: 'var(--text)' }}>
              تأكيد كلمة المرور
            </label>
            <div className="password-wrapper">
              <input
                className={`input-field ${errors.confirm ? 'error' : ''}`}
                type={showConfirm ? 'text' : 'password'}
                placeholder="أعد كتابة كلمة المرور"
                value={form.confirm}
                onChange={e => setForm(p => ({ ...p, confirm: e.target.value }))}
                disabled={loading}
                style={{ paddingLeft: 44 }}
              />
              <button type="button" className="password-toggle" onClick={() => setShowConfirm(s => !s)} tabIndex={-1}>
                {showConfirm ? '🙈' : '👁️'}
              </button>
            </div>
            {errors.confirm && <div style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>{errors.confirm}</div>}
          </div>

          <div style={{
            background: 'rgba(16,185,129,0.1)', borderRadius: 10, padding: '10px 14px',
            fontSize: 13, color: '#10B981', marginBottom: 20,
            border: '1px solid rgba(16,185,129,0.2)',
          }}>
            ✅ سيتم منحك صلاحية إنشاء الدورات ورفع الفيديوهات فور التسجيل
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '13px' }}
            disabled={loading}
          >
            {loading ? <span className="spinner" /> : 'إنشاء الحساب'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: 'var(--text-muted)' }}>
          لديك حساب بالفعل؟{' '}
          <Link href="/teacher/login" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
            تسجيل الدخول
          </Link>
        </div>
        <div style={{ textAlign: 'center', marginTop: 12 }}>
          <Link href="/" style={{ fontSize: 13, color: 'var(--text-muted)', textDecoration: 'none' }}>
            ← العودة للصفحة الرئيسية
          </Link>
        </div>
      </div>
    </div>
  );
}
