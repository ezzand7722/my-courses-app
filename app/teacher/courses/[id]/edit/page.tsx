'use client';

import { useState, useEffect, use, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import UploadDropzone from '@/components/UploadDropzone';
import { SUBJECTS, getSubjectLabel, formatDuration } from '@/lib/utils';

interface Course {
  id: string;
  title: string;
  description: string;
  subject: string;
  cover_image_url?: string;
  is_published: number;
  teacher_id: string;
}

interface Lesson {
  id: string;
  title: string;
  description?: string;
  order_index: number;
  video_url?: string;
  duration_seconds?: number;
  thumbnail_url?: string;
  is_published: number;
}

export default function CourseEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  // Edit course form state
  const [courseForm, setCourseForm] = useState({ title: '', description: '', subject: '', cover_image_url: '' });
  const [courseErrors, setCourseErrors] = useState<Record<string, string>>({});
  const [uploadingCover, setUploadingCover] = useState(false);

  // New lesson form state
  const [showLessonForm, setShowLessonForm] = useState(false);
  const [lessonForm, setLessonForm] = useState({ title: '', description: '' });
  const [lessonErrors, setLessonErrors] = useState<Record<string, string>>({});
  const [savingLesson, setSavingLesson] = useState(false);

  // Video upload state - per lesson
  const [uploadingForLesson, setUploadingForLesson] = useState<string | null>(null);
  const [deletingLesson, setDeletingLesson] = useState<string | null>(null);

  // Drag-to-reorder state
  const [dragOver, setDragOver] = useState<string | null>(null);
  const [dragging, setDragging] = useState<string | null>(null);

  const showToast = useCallback((msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  useEffect(() => {
    // Auth check + fetch data
    Promise.all([
      fetch('/api/auth/me').then(r => r.json()),
      fetch(`/api/courses/${id}`).then(r => r.json()),
    ]).then(([authData, courseData]) => {
      if (!authData.user || (authData.user.role !== 'teacher' && authData.user.role !== 'admin')) {
        router.replace('/teacher/login');
        return;
      }
      if (courseData.error) {
        showToast(courseData.error, 'error');
        router.replace('/teacher/dashboard');
        return;
      }
      if (courseData.course.teacher_id !== authData.user.id && authData.user.role !== 'admin') {
        showToast('غير مصرح لك بتعديل هذه الدورة', 'error');
        router.replace('/teacher/dashboard');
        return;
      }
      setCourse(courseData.course);
      setCourseForm({
        title: courseData.course.title,
        description: courseData.course.description || '',
        subject: courseData.course.subject,
        cover_image_url: courseData.course.cover_image_url || '',
      });
      setLessons(courseData.lessons || []);
      setLoading(false);
    }).catch(() => {
      router.replace('/teacher/login');
    });
  }, [id, router, showToast]);

  // Save course changes
  const saveCourse = async () => {
    const e: Record<string, string> = {};
    if (!courseForm.title.trim()) e.title = 'العنوان مطلوب';
    if (!courseForm.subject) e.subject = 'المادة مطلوبة';
    setCourseErrors(e);
    if (Object.keys(e).length > 0) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/courses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...courseForm, is_published: course?.is_published }),
      });
      const data = await res.json();
      if (res.ok) {
        setCourse(data.course);
        showToast('تم حفظ التغييرات بنجاح');
      } else {
        showToast(data.error || 'فشل الحفظ', 'error');
      }
    } catch {
      showToast('خطأ في الشبكة', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Add new lesson
  const addLesson = async () => {
    const e: Record<string, string> = {};
    if (!lessonForm.title.trim()) e.title = 'عنوان الدرس مطلوب';
    setLessonErrors(e);
    if (Object.keys(e).length > 0) return;

    setSavingLesson(true);
    try {
      const res = await fetch(`/api/courses/${id}/lessons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lessonForm),
      });
      const data = await res.json();
      if (res.ok) {
        setLessons(prev => [...prev, data.lesson]);
        setLessonForm({ title: '', description: '' });
        setShowLessonForm(false);
        showToast('تم إضافة الدرس بنجاح');
      } else {
        showToast(data.error || 'فشل إضافة الدرس', 'error');
      }
    } catch {
      showToast('خطأ في الشبكة', 'error');
    } finally {
      setSavingLesson(false);
    }
  };

  // Delete lesson
  const deleteLesson = async (lessonId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الدرس؟')) return;
    setDeletingLesson(lessonId);
    try {
      const res = await fetch(`/api/courses/${id}/lessons/${lessonId}`, { method: 'DELETE' });
      if (res.ok) {
        setLessons(prev => prev.filter(l => l.id !== lessonId));
        showToast('تم حذف الدرس');
      } else {
        const d = await res.json();
        showToast(d.error || 'فشل الحذف', 'error');
      }
    } catch {
      showToast('خطأ في الشبكة', 'error');
    } finally {
      setDeletingLesson(null);
    }
  };

  // Handle video upload completion for a lesson
  const handleVideoUpload = async (lessonId: string, url: string) => {
    try {
      const lesson = lessons.find(l => l.id === lessonId);
      if (!lesson) return;

      const res = await fetch(`/api/courses/${id}/lessons/${lessonId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...lesson,
          video_url: url,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setLessons(prev => prev.map(l => l.id === lessonId ? data.lesson : l));
        showToast('تم ربط الفيديو بالدرس بنجاح');
      }
    } catch (err) {
      console.error('Failed to update lesson with video url:', err);
    } finally {
      setUploadingForLesson(null);
    }
  };

  // Cover image upload
  const handleCoverUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) return;
    setUploadingCover(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'covers');
      const res = await fetch('/api/upload/r2', { method: 'POST', body: formData });
      const data = await res.json();
      if (res.ok) {
        setCourseForm(p => ({ ...p, cover_image_url: data.url }));
      } else {
        showToast(data.error || 'فشل رفع الصورة', 'error');
      }
    } catch {
      showToast('فشل رفع الصورة', 'error');
    } finally {
      setUploadingCover(false);
    }
  };

  // Drag-to-reorder lessons
  const handleDragStart = (lessonId: string) => setDragging(lessonId);
  const handleDragOver = (e: React.DragEvent, lessonId: string) => {
    e.preventDefault();
    setDragOver(lessonId);
  };
  const handleDrop = async (targetId: string) => {
    if (!dragging || dragging === targetId) {
      setDragging(null);
      setDragOver(null);
      return;
    }

    const newLessons = [...lessons];
    const fromIdx = newLessons.findIndex(l => l.id === dragging);
    const toIdx = newLessons.findIndex(l => l.id === targetId);
    const [moved] = newLessons.splice(fromIdx, 1);
    newLessons.splice(toIdx, 0, moved);

    // Re-assign order indices
    const updated = newLessons.map((l, i) => ({ ...l, order_index: i + 1 }));
    setLessons(updated);
    setDragging(null);
    setDragOver(null);

    // Persist reorder to DB
    try {
      await Promise.all(
        updated.map(l =>
          fetch(`/api/courses/${id}/lessons/${l.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(l),
          })
        )
      );
      showToast('تم إعادة ترتيب الدروس');
    } catch {
      showToast('فشل حفظ الترتيب', 'error');
    }
  };

  // Toggle course publish
  const togglePublish = async () => {
    if (!course) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/courses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...courseForm, is_published: course.is_published ? 0 : 1 }),
      });
      if (res.ok) {
        const data = await res.json();
        setCourse(data.course);
        showToast(course.is_published ? 'تم إلغاء نشر الدورة' : 'تم نشر الدورة بنجاح');
      }
    } catch {
      showToast('فشل تحديث الحالة', 'error');
    } finally {
      setSaving(false);
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
          display: 'flex', alignItems: 'center', gap: 8,
          maxWidth: 360,
        }}>
          {toast.type === 'success' ? '✅' : '❌'} {toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #EBF2FF, #F0FFFE)',
        padding: '24px 0',
        borderBottom: '1px solid #E5E7EB',
      }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <a href="/teacher/dashboard" style={{ fontSize: 13, color: '#6B7280', textDecoration: 'none' }}>
                ← العودة للوحة التحكم
              </a>
              <h1 style={{ fontSize: 22, fontWeight: 800, marginTop: 4 }}>
                تعديل: {course?.title}
              </h1>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={togglePublish}
                disabled={saving}
                style={{
                  padding: '9px 18px', borderRadius: 10, border: 'none', cursor: 'pointer',
                  fontFamily: 'Cairo, sans-serif', fontSize: 14, fontWeight: 600,
                  background: course?.is_published ? '#FEF9C3' : '#DCFCE7',
                  color: course?.is_published ? '#CA8A04' : '#16A34A',
                }}
              >
                {saving ? '...' : course?.is_published ? 'إلغاء النشر' : '🚀 نشر الدورة'}
              </button>
              <a href={`/courses/${id}`} target="_blank">
                <button style={{
                  padding: '9px 18px', borderRadius: 10, border: '1.5px solid #E5E7EB',
                  background: 'white', cursor: 'pointer',
                  fontFamily: 'Cairo, sans-serif', fontSize: 14, fontWeight: 600,
                }}>
                  👁 معاينة
                </button>
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: '32px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: 32 }}>

          {/* Left: Lessons management */}
          <div>
            {/* Lessons header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginBottom: 16,
            }}>
              <h2 style={{ fontSize: 20, fontWeight: 700 }}>
                الدروس ({lessons.length})
              </h2>
              <button
                onClick={() => setShowLessonForm(!showLessonForm)}
                className="btn-primary"
                style={{ fontSize: 14, padding: '8px 16px' }}
              >
                + إضافة درس
              </button>
            </div>

            {/* Add lesson form */}
            {showLessonForm && (
              <div style={{
                background: '#F0F9FF', border: '1.5px solid #BAE6FD',
                borderRadius: 14, padding: 20, marginBottom: 16,
              }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>درس جديد</h3>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: 13, marginBottom: 5 }}>
                    عنوان الدرس *
                  </label>
                  <input
                    className={`input-field ${lessonErrors.title ? 'error' : ''}`}
                    value={lessonForm.title}
                    onChange={e => setLessonForm(p => ({ ...p, title: e.target.value }))}
                    placeholder="مثال: الدرس الأول - المقدمة"
                    disabled={savingLesson}
                  />
                  {lessonErrors.title && (
                    <div style={{ color: '#EF4444', fontSize: 12, marginTop: 3 }}>{lessonErrors.title}</div>
                  )}
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: 13, marginBottom: 5 }}>
                    وصف الدرس (اختياري)
                  </label>
                  <textarea
                    className="input-field"
                    rows={2}
                    value={lessonForm.description}
                    onChange={e => setLessonForm(p => ({ ...p, description: e.target.value }))}
                    placeholder="وصف مختصر للدرس..."
                    disabled={savingLesson}
                    style={{ resize: 'vertical' }}
                  />
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    className="btn-primary"
                    onClick={addLesson}
                    disabled={savingLesson}
                    style={{ flex: 1, justifyContent: 'center', padding: '10px' }}
                  >
                    {savingLesson ? <span className="spinner" /> : 'حفظ الدرس'}
                  </button>
                  <button
                    className="btn-ghost"
                    onClick={() => { setShowLessonForm(false); setLessonForm({ title: '', description: '' }); setLessonErrors({}); }}
                    disabled={savingLesson}
                    style={{ padding: '10px 16px', border: '1.5px solid #E5E7EB', borderRadius: 10 }}
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            )}

            {/* Lessons list */}
            {lessons.length === 0 ? (
              <div style={{
                textAlign: 'center', padding: '48px 24px',
                background: 'white', borderRadius: 14, border: '1px solid #E5E7EB',
              }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🎬</div>
                <p style={{ color: '#6B7280' }}>أضف دروسك الأولى</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {lessons.map(lesson => (
                  <div
                    key={lesson.id}
                    draggable
                    onDragStart={() => handleDragStart(lesson.id)}
                    onDragOver={e => handleDragOver(e, lesson.id)}
                    onDrop={() => handleDrop(lesson.id)}
                    onDragEnd={() => { setDragging(null); setDragOver(null); }}
                    style={{
                      background: 'white', borderRadius: 14,
                      border: `1.5px solid ${dragOver === lesson.id ? '#2F6FED' : '#E5E7EB'}`,
                      overflow: 'hidden',
                      opacity: dragging === lesson.id ? 0.5 : 1,
                      transition: 'border-color 0.15s, opacity 0.15s',
                    }}
                  >
                    {/* Lesson header */}
                    <div style={{
                      padding: '14px 16px',
                      display: 'flex', alignItems: 'center', gap: 12,
                      background: '#F9FAFB',
                      borderBottom: uploadingForLesson === lesson.id ? '1px solid #E5E7EB' : 'none',
                      cursor: 'grab',
                    }}>
                      {/* Drag handle */}
                      <div style={{ color: '#9CA3AF', fontSize: 18, flexShrink: 0, cursor: 'grab' }}>⠿</div>

                      {/* Order + title */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, color: '#6B7280', fontWeight: 500 }}>الدرس {lesson.order_index}</div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: '#1A1D23' }}>{lesson.title}</div>
                        {lesson.video_url && (
                          <div style={{ fontSize: 12, color: '#10B981', marginTop: 2, fontWeight: 500 }}>
                            ✅ فيديو مضاف
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                        {!lesson.video_url && (
                          <button
                            onClick={() => setUploadingForLesson(uploadingForLesson === lesson.id ? null : lesson.id)}
                            style={{
                              padding: '6px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
                              fontFamily: 'Cairo, sans-serif', fontSize: 12, fontWeight: 600,
                              background: uploadingForLesson === lesson.id ? '#F3F4F6' : '#EEF2FF',
                              color: uploadingForLesson === lesson.id ? '#4B5563' : '#4F46E5',
                            }}
                          >
                            {uploadingForLesson === lesson.id ? 'إلغاء' : '📥 إضافة رابط فيديو'}
                          </button>
                        )}
                        {lesson.video_url && (
                          <button
                            onClick={() => setUploadingForLesson(uploadingForLesson === lesson.id ? null : lesson.id)}
                            style={{
                              padding: '6px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
                              fontFamily: 'Cairo, sans-serif', fontSize: 12, fontWeight: 600,
                              background: '#F3F4F6', color: '#4B5563',
                            }}
                          >
                            🔄 تغيير الرابط
                          </button>
                        )}
                        <button
                          onClick={() => deleteLesson(lesson.id)}
                          disabled={deletingLesson === lesson.id}
                          style={{
                            padding: '6px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
                            fontFamily: 'Cairo, sans-serif', fontSize: 12, fontWeight: 600,
                            background: '#FEF2F2', color: '#EF4444',
                          }}
                        >
                          {deletingLesson === lesson.id ? '...' : '🗑'}
                        </button>
                      </div>
                    </div>

                    {/* YouTube/Vimeo link input (expandable) */}
                    {uploadingForLesson === lesson.id && (
                      <div style={{ padding: 16, background: '#F9FAFB', borderTop: '1px solid #E5E7EB' }}>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
                          رابط الفيديو (YouTube أو Vimeo)
                        </label>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <input
                            type="url"
                            placeholder="https://www.youtube.com/watch?v=..."
                            defaultValue={lesson.video_url || ''}
                            style={{
                              flex: 1, padding: '10px 14px', borderRadius: 8, border: '1px solid #D1D5DB',
                              fontFamily: 'Cairo, sans-serif', fontSize: 14, outline: 'none',
                              boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)',
                              direction: 'ltr'
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleVideoUpload(lesson.id, e.currentTarget.value);
                                setUploadingForLesson(null);
                              }
                            }}
                          />
                          <button
                            onClick={(e) => {
                              const input = e.currentTarget.previousSibling as HTMLInputElement;
                              handleVideoUpload(lesson.id, input.value);
                              setUploadingForLesson(null);
                            }}
                            style={{
                              background: '#3B82F6', color: 'white', padding: '0 16px', borderRadius: 8,
                              border: 'none', fontWeight: 600, fontFamily: 'Cairo, sans-serif', cursor: 'pointer'
                            }}
                          >
                            حفظ الرابط
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right: Course settings */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div style={{
              background: 'white', borderRadius: 16,
              border: '1px solid #E5E7EB', padding: 24,
            }}>
              <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 18 }}>إعدادات الدورة</h3>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: 13, marginBottom: 5 }}>عنوان الدورة *</label>
                <input
                  className={`input-field ${courseErrors.title ? 'error' : ''}`}
                  value={courseForm.title}
                  onChange={e => setCourseForm(p => ({ ...p, title: e.target.value }))}
                  disabled={saving}
                />
                {courseErrors.title && <div style={{ color: '#EF4444', fontSize: 12, marginTop: 3 }}>{courseErrors.title}</div>}
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: 13, marginBottom: 5 }}>المادة *</label>
                <select
                  className={`input-field ${courseErrors.subject ? 'error' : ''}`}
                  value={courseForm.subject}
                  onChange={e => setCourseForm(p => ({ ...p, subject: e.target.value }))}
                  disabled={saving}
                >
                  {SUBJECTS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: 13, marginBottom: 5 }}>الوصف</label>
                <textarea
                  className="input-field"
                  rows={3}
                  value={courseForm.description}
                  onChange={e => setCourseForm(p => ({ ...p, description: e.target.value }))}
                  disabled={saving}
                  style={{ resize: 'vertical' }}
                />
              </div>

              {/* Cover image */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: 13, marginBottom: 5 }}>رابط صورة الغلاف (مثال: Imgur)</label>
                <input
                  className="input-field"
                  placeholder="https://i.imgur.com/example.jpg"
                  value={courseForm.cover_image_url}
                  onChange={e => setCourseForm(p => ({ ...p, cover_image_url: e.target.value }))}
                  disabled={saving}
                  style={{ direction: 'ltr' }}
                />
                {courseForm.cover_image_url && (
                  <div style={{ marginTop: 8 }}>
                    <img src={courseForm.cover_image_url} alt="غلاف"
                      style={{ width: '100%', maxHeight: 140, objectFit: 'cover', borderRadius: 10, border: '1px solid #E5E7EB', display: 'block' }} />
                  </div>
                )}
              </div>

              <button
                className="btn-primary"
                onClick={saveCourse}
                disabled={saving || uploadingCover}
                style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
              >
                {saving ? <span className="spinner" /> : '💾 حفظ التغييرات'}
              </button>
            </div>

            {/* Course status card */}
            <div style={{
              background: 'white', borderRadius: 16,
              border: '1px solid #E5E7EB', padding: 20,
            }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>حالة الدورة</h3>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px', borderRadius: 10,
                background: course?.is_published ? '#F0FDF4' : '#FFFBEB',
                border: `1px solid ${course?.is_published ? '#BBF7D0' : '#FDE68A'}`,
                marginBottom: 12,
              }}>
                <span style={{ fontSize: 20 }}>{course?.is_published ? '✅' : '📝'}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: course?.is_published ? '#16A34A' : '#D97706' }}>
                    {course?.is_published ? 'منشورة' : 'مسودة'}
                  </div>
                  <div style={{ fontSize: 12, color: '#6B7280' }}>
                    {course?.is_published ? 'الدورة مرئية للطلاب' : 'الدورة غير مرئية للطلاب بعد'}
                  </div>
                </div>
              </div>
              <div style={{ fontSize: 13, color: '#6B7280' }}>
                عدد الدروس: <strong>{lessons.length}</strong><br />
                دروس مع فيديو: <strong>{lessons.filter(l => l.video_url).length}</strong>
              </div>
            </div>

            {/* Subject info */}
            <div style={{
              background: 'rgba(47,111,237,0.05)', borderRadius: 12,
              border: '1px solid rgba(47,111,237,0.15)', padding: 16,
            }}>
              <div style={{ fontSize: 13, color: '#2F6FED', fontWeight: 600, marginBottom: 6 }}>
                💡 نصيحة
              </div>
              <div style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.6 }}>
                أضف الدروس أولاً ثم ارفع الفيديو لكل درس. يمكنك إعادة ترتيب الدروس بالسحب والإفلات.
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .container > div[style*='grid-template-columns: 1fr 400px'] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </>
  );
}
