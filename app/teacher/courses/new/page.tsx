'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import UploadDropzone from '@/components/UploadDropzone';
import { SUBJECTS } from '@/lib/utils';

export default function NewCoursePage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [form, setForm] = useState({
    title: '',
    description: '',
    subject: '',
    cover_image_url: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [uploadingCover, setUploadingCover] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(data => {
        if (!data.user || (data.user.role !== 'teacher' && data.user.role !== 'admin')) {
          router.replace('/teacher/login');
        } else {
          setChecking(false);
        }
      })
      .catch(() => router.replace('/teacher/login'));
  }, [router]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = 'عنوان الدورة مطلوب';
    else if (form.title.length < 5) e.title = 'العنوان قصير جداً';
    if (!form.subject) e.subject = 'المادة مطلوبة';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleCoverUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrors(p => ({ ...p, cover: 'يرجى اختيار صورة' }));
      return;
    }
    setUploadingCover(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'covers');
      const res = await fetch('/api/upload/r2', { method: 'POST', body: formData });
      const data = await res.json();
      if (res.ok) {
        setForm(p => ({ ...p, cover_image_url: data.url }));
      } else {
        setErrors(p => ({ ...p, cover: data.error || 'فشل رفع الصورة' }));
      }
    } catch {
      setErrors(p => ({ ...p, cover: 'فشل رفع الصورة' }));
    } finally {
      setUploadingCover(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setServerError('');
    try {
      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setServerError(data.error || 'فشل إنشاء الدورة');
        return;
      }
      router.push(`/teacher/courses/${data.course.id}/edit`);
    } catch {
      setServerError('خطأ في الشبكة');
    } finally {
      setLoading(false);
    }
  };

  if (checking) return (
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
      <div className="container" style={{ maxWidth: 700, padding: '48px 24px' }}>
        <div style={{ marginBottom: 32 }}>
          <a href="/teacher/dashboard" style={{ fontSize: 14, color: '#6B7280', textDecoration: 'none' }}>
            ← العودة للوحة التحكم
          </a>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginTop: 8 }}>إنشاء دورة جديدة</h1>
        </div>

        <div style={{
          background: 'white', borderRadius: 20,
          padding: '36px', border: '1px solid #E5E7EB',
          boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
        }}>
          {serverError && (
            <div style={{
              background: '#FEF2F2', color: '#EF4444', borderRadius: 10,
              padding: '12px 16px', fontSize: 14, marginBottom: 24,
            }}>
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Title */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontWeight: 600, fontSize: 14, marginBottom: 6 }}>
                عنوان الدورة *
              </label>
              <input
                className={`input-field ${errors.title ? 'error' : ''}`}
                value={form.title}
                onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                placeholder="مثال: كيمياء الفصل الأول"
                disabled={loading}
              />
              {errors.title && <div style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>{errors.title}</div>}
            </div>

            {/* Subject */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontWeight: 600, fontSize: 14, marginBottom: 6 }}>
                المادة *
              </label>
              <select
                className={`input-field ${errors.subject ? 'error' : ''}`}
                value={form.subject}
                onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
                disabled={loading}
              >
                <option value="">— اختر المادة —</option>
                {SUBJECTS.map(s => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
              {errors.subject && <div style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>{errors.subject}</div>}
            </div>

            {/* Description */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontWeight: 600, fontSize: 14, marginBottom: 6 }}>
                وصف الدورة (اختياري)
              </label>
              <textarea
                className="input-field"
                rows={4}
                value={form.description}
                onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                placeholder="أضف وصفاً للدورة..."
                disabled={loading}
                style={{ resize: 'vertical' }}
              />
            </div>

            {/* Cover image */}
            <div style={{ marginBottom: 28 }}>
              <label style={{ display: 'block', fontWeight: 600, fontSize: 14, marginBottom: 8 }}>
                صورة غلاف الدورة
              </label>
              <UploadDropzone
                acceptType="image"
                onUploadComplete={(url) => setForm(p => ({ ...p, cover_image_url: url }))}
              />
              {form.cover_image_url && (
                <div style={{ marginTop: 12 }}>
                  <img src={form.cover_image_url} alt="غلاف"
                    style={{ width: 200, height: 120, objectFit: 'cover', borderRadius: 10, border: '1px solid #E5E7EB' }} />
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button
                type="submit"
                className="btn-primary"
                style={{ flex: 1, justifyContent: 'center', padding: 14 }}
                disabled={loading || uploadingCover}
              >
                {loading ? <span className="spinner" /> : 'إنشاء الدورة ← إضافة الدروس'}
              </button>
              <a href="/teacher/dashboard">
                <button type="button" className="btn-secondary" style={{ padding: '14px 20px' }}>
                  إلغاء
                </button>
              </a>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
