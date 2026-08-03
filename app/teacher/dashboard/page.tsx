'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { formatDate } from '@/lib/utils';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar_url?: string;
}

interface Course {
  id: string;
  title: string;
  subject: string;
  cover_image_url?: string;
  is_published: number;
  created_at: string;
  lesson_count?: number;
}

export default function TeacherDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(async data => {
        if (!data.user || (data.user.role !== 'teacher' && data.user.role !== 'admin')) {
          router.replace('/teacher/login');
          return;
        }
        setUser(data.user);
        const coursesRes = await fetch(`/api/courses?teacher_id=${data.user.id}&published=false`);
        const coursesData = await coursesRes.json();
        setCourses(coursesData.courses || []);
        setLoading(false);
      })
      .catch(() => {
        router.replace('/teacher/login');
      });
  }, [router]);

  const handleAvatarUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      showToast('يرجى اختيار صورة', 'error');
      return;
    }
    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'avatars');
      const res = await fetch('/api/upload/r2', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'فشل الرفع');

      // Update profile via API
      const updateRes = await fetch('/api/auth/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatar_url: data.url }),
      });
      if (updateRes.ok) {
        setUser(prev => prev ? { ...prev, avatar_url: data.url } : prev);
        showToast('تم تحديث الصورة الشخصية بنجاح');
      } else {
        throw new Error('فشل تحديث الملف الشخصي');
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'فشل رفع الصورة', 'error');
    } finally {
      setUploadingAvatar(false);
      if (avatarInputRef.current) avatarInputRef.current.value = '';
    }
  };

  const handleDeleteAvatar = async () => {
    if (!confirm('هل تريد حذف صورتك الشخصية؟')) return;
    setUploadingAvatar(true);
    try {
      const res = await fetch('/api/auth/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatar_url: null }),
      });
      if (res.ok) {
        setUser(prev => prev ? { ...prev, avatar_url: undefined } : prev);
        showToast('تم حذف الصورة الشخصية');
      }
    } catch {
      showToast('فشل حذف الصورة', 'error');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleTogglePublish = async (course: Course) => {
    setTogglingId(course.id);
    try {
      const res = await fetch(`/api/courses/${course.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...course,
          is_published: course.is_published ? 0 : 1,
        }),
      });
      if (res.ok) {
        setCourses(prev =>
          prev.map(c => c.id === course.id ? { ...c, is_published: c.is_published ? 0 : 1 } : c)
        );
        showToast(course.is_published ? 'تم إلغاء نشر الدورة' : 'تم نشر الدورة بنجاح');
      } else {
        const d = await res.json();
        showToast(d.error || 'فشل تحديث الحالة', 'error');
      }
    } catch {
      showToast('خطأ في الشبكة', 'error');
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (courseId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه الدورة؟ سيتم حذف جميع الدروس.')) return;
    setDeletingId(courseId);
    try {
      const res = await fetch(`/api/courses/${courseId}`, { method: 'DELETE' });
      if (res.ok) {
        setCourses(prev => prev.filter(c => c.id !== courseId));
        showToast('تم حذف الدورة بنجاح');
      } else {
        const d = await res.json();
        showToast(d.error || 'فشل الحذف', 'error');
      }
    } catch {
      showToast('خطأ في الشبكة', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return (
    <>
      <Navbar />
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div className="spinner spinner-primary" style={{ width: 40, height: 40, borderWidth: 3 }} />
      </div>
    </>
  );

  return (
    <>
      <Navbar />

      {/* Hidden avatar input */}
      <input
        ref={avatarInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={e => { const f = e.target.files?.[0]; if (f) handleAvatarUpload(f); }}
      />

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: 20, right: 20, zIndex: 9999,
          background: toast.type === 'success' ? '#10B981' : '#EF4444',
          color: 'white', padding: '12px 20px', borderRadius: 12,
          fontWeight: 600, fontSize: 14,
          boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
          animation: 'slideInRight 0.3s ease-out',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          {toast.type === 'success' ? '✅' : '❌'} {toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={{
        background: 'var(--hero-gradient)',
        padding: '32px 0 24px',
        borderBottom: '1px solid var(--border)',
      }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              {/* Avatar with upload */}
              <div className="photo-upload-area" style={{ position: 'relative' }}>
                <div
                  style={{
                    width: 72, height: 72, borderRadius: '50%',
                    background: user?.avatar_url ? 'transparent' : 'linear-gradient(135deg, #2F6FED, #0FB5AE)',
                    overflow: 'hidden',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '3px solid var(--border)',
                    cursor: 'pointer',
                    position: 'relative',
                  }}
                  onClick={() => !uploadingAvatar && avatarInputRef.current?.click()}
                  title="انقر لتغيير الصورة"
                >
                  {user?.avatar_url ? (
                    <img src={user.avatar_url} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ color: 'white', fontSize: 28, fontWeight: 700 }}>{user?.name.charAt(0)}</span>
                  )}
                  {/* Overlay */}
                  <div style={{
                    position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    borderRadius: '50%', opacity: uploadingAvatar ? 1 : 0,
                    transition: 'opacity 0.2s',
                  }} className="avatar-overlay">
                    {uploadingAvatar ? (
                      <div className="spinner" style={{ width: 20, height: 20 }} />
                    ) : (
                      <span style={{ fontSize: 20 }}>📷</span>
                    )}
                  </div>
                </div>
                {/* Avatar action buttons */}
                <div style={{ position: 'absolute', bottom: -4, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 4 }}>
                  <button
                    onClick={() => avatarInputRef.current?.click()}
                    disabled={uploadingAvatar}
                    title="تغيير الصورة"
                    style={{
                      width: 22, height: 22, borderRadius: '50%',
                      background: 'var(--primary)', color: 'white',
                      border: '2px solid var(--card-bg)', fontSize: 10,
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >✏️</button>
                  {user?.avatar_url && (
                    <button
                      onClick={handleDeleteAvatar}
                      disabled={uploadingAvatar}
                      title="حذف الصورة"
                      style={{
                        width: 22, height: 22, borderRadius: '50%',
                        background: '#EF4444', color: 'white',
                        border: '2px solid var(--card-bg)', fontSize: 10,
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >🗑</button>
                  )}
                </div>
              </div>
              <div>
                <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 2, color: 'var(--text)' }}>
                  مرحباً، {user?.name} 👋
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
                  {courses.length} دورة — منها {courses.filter(c => c.is_published).length} منشورة
                </p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                  انقر على الصورة لتغييرها
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {(user?.role === 'admin' || user?.email === 'superuser2@kilani.com') && (
                <Link href="/teacher/admin/allowed-emails">
                  <button className="btn-secondary" style={{ border: '1px solid var(--border)', background: 'var(--card-bg)', color: 'var(--text)' }}>
                    ⚙️ إدارة المعلمين
                  </button>
                </Link>
              )}
              <Link href="/teacher/courses/new">
                <button className="btn-primary">
                  + إضافة دورة جديدة
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 32, paddingBottom: 32 }}>
        {/* Stats */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: 14, marginBottom: 32,
        }}>
          {[
            { label: 'إجمالي الدورات', value: courses.length, icon: '📚' },
            { label: 'منشورة', value: courses.filter(c => c.is_published).length, icon: '✅' },
            { label: 'غير منشورة', value: courses.filter(c => !c.is_published).length, icon: '📂' },
            { label: 'إجمالي الدروس', value: courses.reduce((sum, c) => sum + (c.lesson_count || 0), 0), icon: '🎬' },
          ].map((stat, i) => (
            <div key={i} style={{
              background: 'var(--card-bg)', borderRadius: 14, padding: '18px 14px',
              border: '1px solid var(--border)', textAlign: 'center',
            }}>
              <div style={{ fontSize: 26, marginBottom: 6 }}>{stat.icon}</div>
              <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--primary)' }}>{stat.value}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Courses list */}
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16, color: 'var(--text)' }}>دوراتي</h2>

        {courses.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '60px 24px',
            background: 'var(--card-bg)', borderRadius: 16, border: '1px solid var(--border)',
          }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>📚</div>
            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8, color: 'var(--text)' }}>لم تنشئ أي دورة بعد</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>ابدأ بإنشاء دورتك الأولى ورفع محتواك</p>
            <Link href="/teacher/courses/new">
              <button className="btn-primary">+ إنشاء دورة</button>
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {courses.map(course => (
              <div key={course.id} style={{
                background: 'var(--card-bg)', borderRadius: 16, padding: '16px 20px',
                border: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap',
              }}>
                {/* Thumbnail */}
                <div style={{
                  width: 68, height: 50, borderRadius: 10, flexShrink: 0, overflow: 'hidden',
                  background: 'linear-gradient(135deg, rgba(47,111,237,0.15), rgba(15,181,174,0.15))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {course.cover_image_url ? (
                    <img src={course.cover_image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ fontSize: 22 }}>📚</span>
                  )}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4, color: 'var(--text)' }}>{course.title}</div>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <span style={{
                      fontSize: 11, padding: '2px 10px', borderRadius: 20,
                      background: course.is_published ? 'rgba(16,185,129,0.12)' : 'rgba(245,166,35,0.12)',
                      color: course.is_published ? '#10B981' : '#CA8A04',
                      fontWeight: 600,
                    }}>
                      {course.is_published ? '✅ منشورة' : '📝 مسودة'}
                    </span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>📹 {course.lesson_count || 0} درس</span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{formatDate(course.created_at)}</span>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 8, flexShrink: 0, flexWrap: 'wrap' }}>
                  <Link href={`/teacher/courses/${course.id}/edit`}>
                    <button className="btn-secondary" style={{ fontSize: 13, padding: '7px 12px' }}>
                      ✏️ تعديل
                    </button>
                  </Link>
                  <button
                    onClick={() => handleTogglePublish(course)}
                    disabled={togglingId === course.id}
                    style={{
                      padding: '7px 12px', borderRadius: 10, border: 'none', cursor: 'pointer',
                      fontFamily: 'Cairo, sans-serif', fontSize: 13, fontWeight: 600,
                      background: course.is_published ? 'rgba(245,166,35,0.12)' : 'rgba(16,185,129,0.12)',
                      color: course.is_published ? '#CA8A04' : '#10B981',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {togglingId === course.id ? '...' : course.is_published ? 'إلغاء النشر' : '🚀 نشر'}
                  </button>
                  <button
                    onClick={() => handleDelete(course.id)}
                    disabled={deletingId === course.id}
                    style={{
                      padding: '7px 12px', borderRadius: 10, border: 'none', cursor: 'pointer',
                      fontFamily: 'Cairo, sans-serif', fontSize: 13, fontWeight: 600,
                      background: 'rgba(239,68,68,0.1)', color: '#EF4444',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {deletingId === course.id ? '...' : '🗑'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .photo-upload-area:hover .avatar-overlay {
          opacity: 1 !important;
        }
      `}</style>
    </>
  );
}
