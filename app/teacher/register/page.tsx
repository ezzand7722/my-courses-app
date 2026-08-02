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

  const fields = [
    { key: 'name', label: 'الاسم الكامل', type: 'text', placeholder: 'مثلاً: أحمد محمد' },
    { key: 'email', label: 'البريد الإلكتروني', type: 'email', placeholder: 'teacher@example.com' },
    { key: 'password', label: 'كلمة المرور', type: 'password', placeholder: 'على الأقل 8 أحرف' },
    { key: 'confirm', label: 'تأكيد كلمة المرور', type: 'password', placeholder: 'أعد كتابة كلمة المرور' },
  ] as const;

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #EBF2FF 0%, #F0FFFE 100%)',
      padding: 24,
    }}>
      <div style={{
        background: 'white', borderRadius: 20,
        padding: '40px 36px', width: '100%', maxWidth: 440,
        boxShadow: '0 8px 40px rgba(47,111,237,0.12)',
        border: '1px solid #E5E7EB',
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
          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>تسجيل كمعلم جديد</h1>
          <p style={{ fontSize: 14, color: '#6B7280' }}>أنشئ حسابك وابدأ نشر دوراتك</p>
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

          {fields.map(field => (
            <div key={field.key} style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontWeight: 600, fontSize: 14, marginBottom: 6 }}>
                {field.label}
              </label>
              <input
                className={`input-field ${errors[field.key] ? 'error' : ''}`}
                type={field.type}
                placeholder={field.placeholder}
                value={form[field.key]}
                onChange={e => setForm(p => ({ ...p, [field.key]: e.target.value }))}
                disabled={loading}
              />
              {errors[field.key] && (
                <div style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>{errors[field.key]}</div>
              )}
            </div>
          ))}

          <div style={{
            background: '#F0FDF4', borderRadius: 10, padding: '10px 14px',
            fontSize: 13, color: '#16A34A', marginBottom: 20,
            border: '1px solid #BBF7D0',
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

        <div style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: '#6B7280' }}>
          لديك حساب بالفعل؟{' '}
          <Link href="/teacher/login" style={{ color: '#2F6FED', fontWeight: 600, textDecoration: 'none' }}>
            تسجيل الدخول
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
