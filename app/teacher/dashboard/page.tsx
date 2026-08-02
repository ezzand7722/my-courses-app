'use client';

import { useState, useEffect } from 'react';
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

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    // Check auth
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(async data => {
        if (!data.user || (data.user.role !== 'teacher' && data.user.role !== 'admin')) {
          router.replace('/teacher/login');
          return;
        }
        setUser(data.user);
        // Fetch courses
        const coursesRes = await fetch(`/api/courses?teacher_id=${data.user.id}&published=false`);
        const coursesData = await coursesRes.json();
        setCourses(coursesData.courses || []);
        setLoading(false);
      })
      .catch(() => {
        router.replace('/teacher/login');
      });
  }, [router]);

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
        background: 'linear-gradient(135deg, #EBF2FF, #F0FFFE)',
        padding: '32px 0 24px',
      }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>
                مرحباً {user?.name} 👋
              </h1>
              <p style={{ color: '#6B7280', fontSize: 15 }}>
                لديك {courses.length} دورة — منها {courses.filter(c => c.is_published).length} منشورة
              </p>
            </div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {(user?.role === 'admin' || user?.email === 'superuser2@kilani.com') && (
                <Link href="/teacher/admin/allowed-emails">
                  <button className="btn-secondary" style={{ border: '1px solid #E5E7EB', background: 'white' }}>
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

      <div className="container" style={{ padding: '32px 24px' }}>
        {/* Stats */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: 16, marginBottom: 32,
        }}>
          {[
            { label: 'إجمالي الدورات', value: courses.length, icon: '📚' },
            { label: 'منشورة', value: courses.filter(c => c.is_published).length, icon: '✅' },
            { label: 'غير منشورة', value: courses.filter(c => !c.is_published).length, icon: '📂' },
            { label: 'إجمالي الدروس', value: courses.reduce((sum, c) => sum + (c.lesson_count || 0), 0), icon: '🎬' },
          ].map((stat, i) => (
            <div key={i} style={{
              background: 'white', borderRadius: 14, padding: '20px 16px',
              border: '1px solid #E5E7EB', textAlign: 'center',
            }}>
              <div style={{ fontSize: 28, marginBottom: 6 }}>{stat.icon}</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#2F6FED' }}>{stat.value}</div>
              <div style={{ fontSize: 13, color: '#6B7280' }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Courses list */}
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>دوراتي</h2>

        {courses.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '60px 24px',
            background: 'white', borderRadius: 16, border: '1px solid #E5E7EB',
          }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>📚</div>
            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>لم تنشئ أي دورة بعد</h3>
            <p style={{ color: '#6B7280', marginBottom: 24 }}>ابدأ بإنشاء دورتك الأولى ورفع محتواك</p>
            <Link href="/teacher/courses/new">
              <button className="btn-primary">+ إنشاء دورة</button>
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {courses.map(course => (
              <div key={course.id} style={{
                background: 'white', borderRadius: 16, padding: '20px 24px',
                border: '1px solid #E5E7EB',
                display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap',
              }}>
                {/* Thumbnail */}
                <div style={{
                  width: 72, height: 52, borderRadius: 10, flexShrink: 0, overflow: 'hidden',
                  background: 'linear-gradient(135deg, #2F6FED22, #0FB5AE22)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {course.cover_image_url ? (
                    <img src={course.cover_image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ fontSize: 24 }}>📚</span>
                  )}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{course.title}</div>
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    <span style={{
                      fontSize: 12, padding: '2px 10px', borderRadius: 20,
                      background: course.is_published ? '#DCFCE7' : '#FEF9C3',
                      color: course.is_published ? '#16A34A' : '#CA8A04',
                      fontWeight: 600,
                    }}>
                      {course.is_published ? 'منشورة' : 'غير منشورة'}
                    </span>
                    <span style={{ fontSize: 12, color: '#6B7280' }}>
                      📹 {course.lesson_count || 0} درس
                    </span>
                    <span style={{ fontSize: 12, color: '#9CA3AF' }}>
                      {formatDate(course.created_at)}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 8, flexShrink: 0, flexWrap: 'wrap' }}>
                  <Link href={`/teacher/courses/${course.id}/edit`}>
                    <button className="btn-secondary" style={{ fontSize: 13, padding: '7px 14px' }}>
                      ✏️ تعديل
                    </button>
                  </Link>
                  <button
                    onClick={() => handleTogglePublish(course)}
                    disabled={togglingId === course.id}
                    style={{
                      padding: '7px 14px', borderRadius: 10, border: 'none', cursor: 'pointer',
                      fontFamily: 'Cairo, sans-serif', fontSize: 13, fontWeight: 600,
                      background: course.is_published ? '#FEF9C3' : '#DCFCE7',
                      color: course.is_published ? '#CA8A04' : '#16A34A',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {togglingId === course.id ? '...' : course.is_published ? 'إلغاء النشر' : 'نشر'}
                  </button>
                  <button
                    onClick={() => handleDelete(course.id)}
                    disabled={deletingId === course.id}
                    style={{
                      padding: '7px 14px', borderRadius: 10, border: 'none', cursor: 'pointer',
                      fontFamily: 'Cairo, sans-serif', fontSize: 13, fontWeight: 600,
                      background: '#FEF2F2', color: '#EF4444',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {deletingId === course.id ? '...' : '🗑 حذف'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
