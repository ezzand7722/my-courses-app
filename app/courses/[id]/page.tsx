'use client';
export const runtime = "edge";

import { useState, useEffect, use, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import VideoPlayer from '@/components/VideoPlayer';
import LessonListItem from '@/components/LessonListItem';
import { formatDate, getSubjectLabel } from '@/lib/utils';

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

interface Course {
  id: string;
  title: string;
  description: string;
  subject: string;
  cover_image_url?: string;
  teacher_name?: string;
  teacher_avatar?: string;
  teacher_bio?: string;
  teacher_id: string;
  teacher_id_ref?: string;
  is_published: number;
  created_at: string;
}

function getProgressKey(courseId: string) {
  return `progress_${courseId}`;
}

function loadWatched(courseId: string): Set<string> {
  try {
    const raw = localStorage.getItem(getProgressKey(courseId));
    if (raw) return new Set(JSON.parse(raw));
  } catch {}
  return new Set();
}

function saveWatched(courseId: string, ids: Set<string>) {
  try {
    localStorage.setItem(getProgressKey(courseId), JSON.stringify([...ids]));
  } catch {}
}

export default function CoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [watchedIds, setWatchedIds] = useState<Set<string>>(new Set());

  // Load progress from localStorage
  useEffect(() => {
    if (id) {
      const saved = loadWatched(id);
      setWatchedIds(saved);
    }
  }, [id]);

  useEffect(() => {
    fetch(`/api/courses/${id}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) { setError(data.error); return; }
        setCourse(data.course);
        const publishedLessons = (data.lessons || []).filter((l: Lesson) => l.is_published);
        setLessons(publishedLessons);
        if (publishedLessons.length > 0) {
          // Resume from where user left off
          const saved = loadWatched(data.course.id);
          const lastUnwatched = publishedLessons.find((l: Lesson) => !saved.has(l.id));
          setActiveLesson(lastUnwatched || publishedLessons[publishedLessons.length - 1]);
        }
      })
      .catch(() => setError('فشل تحميل الدورة'))
      .finally(() => setLoading(false));
  }, [id]);

  const markWatched = useCallback((lessonId: string) => {
    setWatchedIds(prev => {
      const next = new Set(prev);
      next.add(lessonId);
      saveWatched(id, next);
      return next;
    });
  }, [id]);

  const markUnwatched = useCallback((lessonId: string) => {
    setWatchedIds(prev => {
      const next = new Set(prev);
      next.delete(lessonId);
      saveWatched(id, next);
      return next;
    });
  }, [id]);

  const progressPct = lessons.length > 0 ? Math.round((watchedIds.size / lessons.length) * 100) : 0;

  if (loading) return (
    <>
      <Navbar />
      <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner spinner-primary" style={{ width: 40, height: 40, borderWidth: 3 }} />
          <div style={{ marginTop: 16, color: 'var(--text-muted)' }}>جاري تحميل الدورة...</div>
        </div>
      </div>
    </>
  );

  if (error || !course) return (
    <>
      <Navbar />
      <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: 64 }}>⚠️</div>
        <h1 style={{ marginTop: 16, color: 'var(--text)' }}>{error || 'الدورة غير موجودة'}</h1>
        <a href="/courses"><button className="btn-primary" style={{ marginTop: 24 }}>العودة للدورات</button></a>
      </div>
    </>
  );

  return (
    <>
      <Navbar />

      {/* Course banner */}
      <div style={{
        position: 'relative',
        height: 260,
        background: course.cover_image_url ? 'transparent' : 'linear-gradient(135deg, #2F6FED, #0FB5AE)',
        overflow: 'hidden',
      }}>
        {course.cover_image_url && (
          <img src={course.cover_image_url} alt={course.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        )}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.2) 100%)',
          display: 'flex', alignItems: 'flex-end',
          padding: '28px',
        }}>
          <div className="container" style={{ width: '100%' }}>
            <span className="badge-free" style={{ marginBottom: 8, display: 'inline-block' }}>مجاني</span>
            <h1 style={{ fontSize: 'clamp(18px, 3vw, 30px)', fontWeight: 800, color: 'white', marginBottom: 8 }}>
              {course.title}
            </h1>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13 }}>📅 {formatDate(course.created_at)}</span>
              <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13 }}>{getSubjectLabel(course.subject)}</span>
              <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13 }}>📹 {lessons.length} درس</span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      {lessons.length > 0 && (
        <div style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '12px 0' }}>
          <div className="container" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>تقدمك في الدورة</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)' }}>{progressPct}%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${progressPct}%` }} />
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                {watchedIds.size} من {lessons.length} درس مشاهَد
              </div>
            </div>
            {progressPct === 100 && (
              <div style={{ fontSize: 28 }}>🏆</div>
            )}
          </div>
        </div>
      )}

      <div className="container" style={{ paddingTop: 28, paddingBottom: 32 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 28 }}>
          {/* Left: Video player + lesson info */}
          <div>
            {activeLesson ? (
              <>
                {activeLesson.video_url ? (
                  <VideoPlayer
                    key={activeLesson.id}
                    videoUrl={activeLesson.video_url}
                    title={activeLesson.title}
                  />
                ) : (
                  <div style={{
                    background: '#1A1D23', borderRadius: 16,
                    padding: '80px 40px', textAlign: 'center',
                  }}>
                    <div style={{ fontSize: 48, marginBottom: 12 }}>📎</div>
                    <div style={{ color: '#9CA3AF', fontSize: 16 }}>هذا الدرس لا يحتوي على فيديو بعد</div>
                  </div>
                )}
                <div style={{ marginTop: 16, background: 'var(--card-bg)', borderRadius: 14, padding: 20, border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                    <div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>الدرس {activeLesson.order_index}</div>
                      <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>{activeLesson.title}</h2>
                      {activeLesson.description && (
                        <p style={{ color: 'var(--text-muted)', marginTop: 8, lineHeight: 1.7, fontSize: 14 }}>
                          {activeLesson.description}
                        </p>
                      )}
                    </div>
                    {/* Mark watched button */}
                    <button
                      onClick={() => watchedIds.has(activeLesson.id) ? markUnwatched(activeLesson.id) : markWatched(activeLesson.id)}
                      style={{
                        flexShrink: 0,
                        padding: '8px 14px', borderRadius: 10,
                        border: 'none', cursor: 'pointer',
                        fontFamily: 'Cairo, sans-serif', fontSize: 13, fontWeight: 600,
                        background: watchedIds.has(activeLesson.id) ? 'rgba(16,185,129,0.1)' : 'var(--feature-card-bg)',
                        color: watchedIds.has(activeLesson.id) ? '#10B981' : 'var(--text-muted)',
                        border: `1px solid ${watchedIds.has(activeLesson.id) ? 'rgba(16,185,129,0.3)' : 'var(--border)'}`,
                        transition: 'all 0.2s ease',
                        whiteSpace: 'nowrap',
                      } as React.CSSProperties}
                    >
                      {watchedIds.has(activeLesson.id) ? '✓ شاهدت' : '○ علّم كمشاهَد'}
                    </button>
                  </div>

                  {/* Next lesson button */}
                  {(() => {
                    const currentIdx = lessons.findIndex(l => l.id === activeLesson.id);
                    const nextLesson = lessons[currentIdx + 1];
                    if (!nextLesson) return null;
                    return (
                      <button
                        onClick={() => { markWatched(activeLesson.id); setActiveLesson(nextLesson); }}
                        className="btn-primary"
                        style={{ marginTop: 16, width: '100%', justifyContent: 'center' }}
                      >
                        الدرس التالي: {nextLesson.title} ›
                      </button>
                    );
                  })()}
                </div>
              </>
            ) : (
              <div style={{
                background: 'var(--feature-card-bg)', borderRadius: 16, padding: '60px 40px',
                textAlign: 'center', color: 'var(--text-muted)',
              }}>
                <div style={{ fontSize: 64 }}>📹</div>
                <div style={{ fontSize: 16, marginTop: 12 }}>لا توجد دروس في هذه الدورة حالياً</div>
              </div>
            )}

            {/* Course description */}
            {course.description && (
              <div style={{
                background: 'var(--card-bg)', borderRadius: 16, padding: 24,
                border: '1px solid var(--border)', marginTop: 20,
              }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12, color: 'var(--text)' }}>عن الدورة</h3>
                <p style={{ color: 'var(--text-muted)', lineHeight: 1.8 }}>{course.description}</p>
              </div>
            )}
          </div>

          {/* Right: Lesson list + Teacher info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Lesson list */}
            <div style={{
              background: 'var(--card-bg)', borderRadius: 16,
              border: '1px solid var(--border)', overflow: 'hidden',
            }}>
              <div style={{
                padding: '14px 18px', borderBottom: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>محتوى الدورة</span>
                <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>{lessons.length} درس</span>
              </div>
              <div style={{ padding: 10, display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 420, overflowY: 'auto' }}>
                {lessons.length === 0 ? (
                  <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
                    لا توجد دروس بعد
                  </div>
                ) : (
                  lessons.map(lesson => (
                    <LessonListItem
                      key={lesson.id}
                      {...lesson}
                      isActive={activeLesson?.id === lesson.id}
                      isWatched={watchedIds.has(lesson.id)}
                      onClick={() => setActiveLesson(lesson)}
                    />
                  ))
                )}
              </div>
              {lessons.length > 0 && watchedIds.size > 0 && (
                <div style={{ padding: '10px 16px', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
                  <button
                    onClick={() => { setWatchedIds(new Set()); saveWatched(id, new Set()); }}
                    style={{
                      fontSize: 12, color: 'var(--text-muted)', background: 'none',
                      border: 'none', cursor: 'pointer', fontFamily: 'Cairo, sans-serif',
                      textDecoration: 'underline',
                    }}
                  >
                    إعادة تعيين التقدم
                  </button>
                </div>
              )}
            </div>

            {/* Teacher card */}
            <div style={{
              background: 'var(--card-bg)', borderRadius: 16,
              border: '1px solid var(--border)', padding: 20,
            }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: 'var(--text)' }}>عن المعلم</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div style={{
                  width: 52, height: 52, borderRadius: '50%', flexShrink: 0,
                  background: course.teacher_avatar ? 'transparent' : 'linear-gradient(135deg, #2F6FED, #0FB5AE)',
                  overflow: 'hidden',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {course.teacher_avatar ? (
                    <img src={course.teacher_avatar} alt={course.teacher_name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ color: 'white', fontSize: 20, fontWeight: 700 }}>
                      {course.teacher_name?.charAt(0)}
                    </span>
                  )}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>{course.teacher_name}</div>
                  <a href={`/teachers/${course.teacher_id || course.teacher_id_ref}`}
                    style={{ fontSize: 13, color: 'var(--primary)', textDecoration: 'none' }}>
                    عرض الملف الشخصي
                  </a>
                </div>
              </div>
              {course.teacher_bio && (
                <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>{course.teacher_bio}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .container > div[style*='grid-template-columns'] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </>
  );
}
