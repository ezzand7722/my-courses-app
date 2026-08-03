'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

interface AllowedEmail {
  email: string;
  added_by: string;
  created_at: string;
}

export default function AllowedEmailsPage() {
  const router = useRouter();
  const [emails, setEmails] = useState<AllowedEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const [newEmail, setNewEmail] = useState('');
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(data => {
        if (!data.user || (data.user.role !== 'admin' && data.user.email !== 'superuser2@kilani.com')) {
          router.replace('/teacher/dashboard');
          return;
        }
        fetchEmails();
      })
      .catch(() => router.replace('/teacher/login'));
  }, [router]);

  const fetchEmails = async () => {
    try {
      const res = await fetch('/api/admin/allowed-emails');
      const data = await res.json();
      if (res.ok) {
        setEmails(data.emails || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) return;

    setAdding(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/admin/allowed-emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newEmail.trim() })
      });
      const data = await res.json();

      if (res.ok) {
        setSuccess('تمت إضافة البريد الإلكتروني بنجاح');
        setNewEmail('');
        fetchEmails();
      } else {
        setError(data.error || 'فشل إضافة البريد الإلكتروني');
      }
    } catch (err) {
      setError('حدث خطأ في الاتصال');
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (email: string) => {
    if (!confirm(`هل أنت متأكد من حذف ${email}؟ لن يتمكن من إنشاء حساب معلم بعد الآن.`)) return;
    
    try {
      const res = await fetch(`/api/admin/allowed-emails?email=${encodeURIComponent(email)}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setEmails(prev => prev.filter(e => e.email !== email));
      } else {
        alert('فشل الحذف');
      }
    } catch (err) {
      alert('خطأ في الاتصال');
    }
  };

  if (loading) return (
    <>
      <Navbar />
      <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
        <div className="spinner spinner-primary" style={{ width: 40, height: 40, borderWidth: 3 }} />
      </div>
    </>
  );

  return (
    <>
      <Navbar />
      <div className="container" style={{ padding: '48px 24px', maxWidth: 800 }}>
        <div style={{ marginBottom: 32 }}>
          <a href="/teacher/dashboard" style={{ fontSize: 14, color: 'var(--text-muted)', textDecoration: 'none' }}>
            ← العودة للوحة التحكم
          </a>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginTop: 8, color: 'var(--text)' }}>إدارة المعلمين المسموح لهم</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: 4 }}>
            أضف عناوين البريد الإلكتروني المسموح لها بالتسجيل في المنصة كمعلمين.
          </p>
        </div>

        <div style={{
          background: 'var(--card-bg)', borderRadius: 16,
          padding: '24px', border: '1px solid var(--border)',
          boxShadow: 'var(--shadow)',
          marginBottom: 32
        }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: 'var(--text)' }}>إضافة بريد إلكتروني جديد</h2>
          
          <form onSubmit={handleAdd} style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 250 }}>
              <input
                type="email"
                className="input-field"
                placeholder="teacher@example.com"
                value={newEmail}
                onChange={e => setNewEmail(e.target.value)}
                disabled={adding}
                required
              />
            </div>
            <button
              type="submit"
              className="btn-primary"
              disabled={adding}
              style={{ padding: '10px 24px' }}
            >
              {adding ? <span className="spinner" /> : 'إضافة'}
            </button>
          </form>

          {error && <div style={{ color: '#EF4444', fontSize: 14, marginTop: 12 }}>{error}</div>}
          {success && <div style={{ color: '#10B981', fontSize: 14, marginTop: 12 }}>{success}</div>}
        </div>

        <div style={{
          background: 'var(--card-bg)', borderRadius: 16,
          border: '1px solid var(--border)',
          overflow: 'hidden'
        }}>
          <div style={{ padding: '16px 20px', background: 'var(--feature-card-bg)', borderBottom: '1px solid var(--border)', fontWeight: 700, color: 'var(--text)' }}>
            قائمة الإيميلات المصرح لها ({emails.length})
          </div>
          
          {emails.length === 0 ? (
            <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
              لا يوجد إيميلات مصرح لها حالياً
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {emails.map((item, index) => (
                <div key={item.email} style={{
                  padding: '16px 20px',
                  borderBottom: index < emails.length - 1 ? '1px solid var(--border)' : 'none',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  flexWrap: 'wrap', gap: 12
                }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--text)' }}>{item.email}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                      أضيف في {new Date(item.created_at).toLocaleDateString('ar-SA')}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(item.email)}
                    style={{
                      background: 'rgba(239,68,68,0.1)', color: '#EF4444',
                      border: 'none', padding: '6px 12px', borderRadius: 8,
                      fontSize: 13, fontWeight: 600, cursor: 'pointer'
                    }}
                  >
                    حذف
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
