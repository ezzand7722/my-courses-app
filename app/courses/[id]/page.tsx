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

function getProgressKey(courseId: string) { return `progress_${courseId}`; }
function getResumePrefKey(courseId: string) { return `resume_pref_${courseId}`; }

function loadWatched(courseId: string): Set<string> {
  try {
    const raw = localStorage.getItem(getProgressKey(courseId));
    if (raw) return new Set(JSON.parse(raw));
  } catch {}
  return new Set();
}
function saveWatched(courseId: string, ids: Set<string>) {
  try { localStorage.setItem(getProgressKey(courseId), JSON.stringify([...ids])); } catch {}
}
function loadResumePref(courseId: string): 'resume' | 'restart' | null {
  try {
    const val = localStorage.getItem(getResumePrefKey(courseId));
    if (val === 'resume' || val === 'restart') return val;
  } catch {}
  return null;
}
function saveResumePref(courseId: string, pref: 'resume' | 'restart') {
  try { localStorage.setItem(getResumePrefKey(courseId), pref); } catch {}
}

export default function CoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [watchedIds, setWatchedIds] = useState<Set<string>>(new Set());

  // Resume prompt state
  const [showResumePrompt, setShowResumePrompt] = useState(false);
  const [resumeLesson, setResumeLesson] = useState<Lesson | null>(null);
  const [rememberChoice, setRememberChoice] = useState(false);

  useEffect(() => {
    fetch(`/api/courses/${id}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) { setError(data.error); return; }
        setCourse(data.course);
        const publishedLessons = (data.lessons || []).filter((l: Lesson) => l.is_published);
        setLessons(publishedLessons);

        if (publishedLessons.length > 0) {
          const saved = loadWatched(data.course.id);
          setWatchedIds(saved);

          const lastUnwatched = publishedLessons.find((l: Lesson) => !saved.has(l.id));
          const firstLesson = publishedLessons[0];
          const resumeTarget = lastUnwatched || publishedLessons[publishedLessons.length - 1];

          // If there's saved progress and resume target isn't lesson 1, ask what to do
          if (saved.size > 0 && resumeTarget.id !== firstLesson.id) {
            const savedPref = loadResumePref(data.course.id);
            if (savedPref === 'resume') {
              setActiveLesson(resumeTarget);
            } else if (savedPref === 'restart') {
              setActiveLesson(firstLesson);
            } else {
              // Show prompt
              setResumeLesson(resumeTarget);
              setActiveLesson(firstLesson); // show first lesson quietly in background
              setShowResumePrompt(true);
            }
          } else {
            setActiveLesson(firstLesson);
          }
        }
      })
      .catch(() => setError('فشل تحميل الدورة'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleResumeChoice = (choice: 'resume' | 'restart') => {
    if (rememberChoice) saveResumePref(id, choice);
    setShowResumePrompt(false);
    if (choice === 'resume' && resumeLesson) {
      setActiveLesson(resumeLesson);
    }
    // restart: already set to firstLesson
  };

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

      {/* Resume prompt toast */}
      {showResumePrompt && resumeLesson && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 999,
          background: 'var(--card-bg)', borderRadius: 16,
          border: '1px solid var(--border)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          padding: '18px 20px', maxWidth: 340,
          animation: 'slideInRight 0.3s ease-out',
        }}>
          <div style={{ fontSize: 20, marginBottom: 8 }}>📍</div>
          <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)', marginBottom: 4 }}>
            عندك تقدم محفوظ!
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 14, lineHeight: 1.5 }}>
            آخر درس وصلته: <strong style={{ color: 'var(--text)' }}>{resumeLesson.title}</strong>
            <br />تريد تكمل من هناك أم تبدأ من الأول؟
          </div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <button
              onClick={() => handleResumeChoice('resume')}
              className="btn-primary"
              style={{ flex: 1, justifyContent: 'center', padding: '9px', fontSize: 13 }}
            >
              ▶ استكمل
            </button>
            <button
              onClick={() => handleResumeChoice('restart')}
              style={{
                flex: 1, padding: '9px', borderRadius: 10, border: '1.5px solid var(--border)',
                background: 'var(--feature-card-bg)', color: 'var(--text)',
                fontFamily: 'Cairo, sans-serif', fontSize: 13, fontWeight: 600, cursor: 'pointer',
              }}
            >
              ↺ من الأول
            </button>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 12, color: 'var(--text-muted)' }}>
            <input
              type="checkbox"
              checked={rememberChoice}
              onChange={e => setRememberChoice(e.target.checked)}
              style={{ cursor: 'pointer' }}
            />
            تذكر اختياري دايماً لهذه الدورة
          </label>
        </div>
      )}

      {/* Course banner — fixed height, object-position top so face/subject shows not random crop */}
      <div style={{
        position: 'relative',
        height: 200,
        background: course.cover_image_url ? 'transparent' : 'linear-gradient(135deg, #2F6FED, #0FB5AE)',
        overflow: 'hidden',
      }}>
        {course.cover_image_url && (
          <img
            src={course.cover_image_url}
            alt={course.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 30%' }}
          />
        )}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.15) 60%, transparent 100%)',
          display: 'flex', alignItems: 'flex-end',
          padding: '20px',
        }}>
          <div className="container" style={{ width: '100%' }}>
            <span className="badge-free" style={{ marginBottom: 6, display: 'inline-block' }}>مجاني</span>
            <h1 style={{ fontSize: 'clamp(16px, 2.5vw, 26px)', fontWeight: 800, color: 'white', marginBottom: 6 }}>
              {course.title}
            </h1>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>📅 {formatDate(course.created_at)}</span>
              <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>{getSubjectLabel(course.subject)}</span>
              <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>📹 {lessons.length} درس</span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      {lessons.length > 0 && (
        <div style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '10px 0' }}>
          <div className="container" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>تقدمك في الدورة</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary)' }}>{progressPct}%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${progressPct}%` }} />
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>
                {watchedIds.size} من {lessons.length} درس مشاهَد
              </div>
            </div>
            {progressPct === 100 && <div style={{ fontSize: 24 }}>🏆</div>}
          </div>
        </div>
      )}

      <div className="container" style={{ paddingTop: 24, paddingBottom: 32 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24 }}>
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
                        border: `1px solid ${watchedIds.has(activeLesson.id) ? 'rgba(16,185,129,0.3)' : 'var(--border)'}`,
                        cursor: 'pointer',
                        fontFamily: 'Cairo, sans-serif', fontSize: 13, fontWeight: 600,
                        background: watchedIds.has(activeLesson.id) ? 'rgba(16,185,129,0.1)' : 'var(--feature-card-bg)',
                        color: watchedIds.has(activeLesson.id) ? '#10B981' : 'var(--text-muted)',
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
                        style={{ marginTop: 14, width: '100%', justifyContent: 'center' }}
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
                <div style={{ padding: '10px 16px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
                  <button
                    onClick={() => { localStorage.removeItem(getResumePrefKey(id)); }}
                    style={{
                      fontSize: 11, color: 'var(--text-muted)', background: 'none',
                      border: 'none', cursor: 'pointer', fontFamily: 'Cairo, sans-serif',
                    }}
                    title="سيُسألك مرة أخرى عند الدخول"
                  >
                    تغيير خيار الاستكمال
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
