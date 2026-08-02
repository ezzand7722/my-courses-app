export const runtime = "edge";\n'use client';

import { useState, useEffect, use } from 'react';
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

export default function CoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/courses/${id}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) { setError(data.error); return; }
        setCourse(data.course);
        const publishedLessons = (data.lessons || []).filter((l: Lesson) => l.is_published);
        setLessons(publishedLessons);
        if (publishedLessons.length > 0) {
          setActiveLesson(publishedLessons[0]);
        }
      })
      .catch(() => setError('فشل تحميل الدورة'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <>
      <Navbar />
      <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner spinner-primary" style={{ width: 40, height: 40, borderWidth: 3 }} />
          <div style={{ marginTop: 16, color: '#6B7280' }}>جاري تحميل الدورة...</div>
        </div>
      </div>
    </>
  );

  if (error || !course) return (
    <>
      <Navbar />
      <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: 64 }}>⚠️</div>
        <h1 style={{ marginTop: 16 }}>{error || 'الدورة غير موجودة'}</h1>
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
        height: 280,
        background: course.cover_image_url ? 'transparent' : 'linear-gradient(135deg, #2F6FED, #0FB5AE)',
        overflow: 'hidden',
      }}>
        {course.cover_image_url && (
          <img src={course.cover_image_url} alt={course.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        )}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.2) 100%)',
          display: 'flex', alignItems: 'flex-end',
          padding: '32px',
        }}>
          <div className="container" style={{ width: '100%' }}>
            <span className="badge-free" style={{ marginBottom: 8, display: 'inline-block' }}>مجاني</span>
            <h1 style={{ fontSize: 'clamp(20px, 3vw, 32px)', fontWeight: 800, color: 'white', marginBottom: 8 }}>
              {course.title}
            </h1>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>
                📅 {formatDate(course.created_at)}
              </span>
              <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>
                {getSubjectLabel(course.subject)}
              </span>
              <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>
                📹 {lessons.length} درس
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: '32px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 32 }}>
          {/* Left: Video player + lesson list */}
          <div>
            {/* Video player */}
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
                <div style={{ marginTop: 20 }}>
                  <h2 style={{ fontSize: 20, fontWeight: 700 }}>{activeLesson.title}</h2>
                  {activeLesson.description && (
                    <p style={{ color: '#6B7280', marginTop: 8, lineHeight: 1.7 }}>
                      {activeLesson.description}
                    </p>
                  )}
                </div>
              </>
            ) : (
              <div style={{
                background: '#F7F8FA', borderRadius: 16, padding: '60px 40px',
                textAlign: 'center', color: '#6B7280',
              }}>
                <div style={{ fontSize: 64 }}>📹</div>
                <div style={{ fontSize: 16, marginTop: 12 }}>لا توجد دروس في هذه الدورة حالياً</div>
              </div>
            )}

            {/* Course description */}
            {course.description && (
              <div style={{
                background: 'white', borderRadius: 16, padding: 24,
                border: '1px solid #E5E7EB', marginTop: 24,
              }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>عن الدورة</h3>
                <p style={{ color: '#6B7280', lineHeight: 1.8 }}>{course.description}</p>
              </div>
            )}
          </div>

          {/* Right: Lesson list + Teacher info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Lesson list */}
            <div style={{
              background: 'white', borderRadius: 16,
              border: '1px solid #E5E7EB', overflow: 'hidden',
            }}>
              <div style={{
                padding: '16px 20px', borderBottom: '1px solid #F3F4F6',
                fontWeight: 700, fontSize: 16,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <span>محتوي الدورة</span>
                <span style={{ fontSize: 13, color: '#6B7280', fontWeight: 500 }}>
                  {lessons.length} درس
                </span>
              </div>
              <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {lessons.length === 0 ? (
                  <div style={{ padding: '20px', textAlign: 'center', color: '#9CA3AF', fontSize: 14 }}>
                    لا توجد دروس بعد
                  </div>
                ) : (
                  lessons.map(lesson => (
                    <LessonListItem
                      key={lesson.id}
                      {...lesson}
                      isActive={activeLesson?.id === lesson.id}
                      onClick={() => setActiveLesson(lesson)}
                    />
                  ))
                )}
              </div>
            </div>

            {/* Teacher card */}
            <div style={{
              background: 'white', borderRadius: 16,
              border: '1px solid #E5E7EB', padding: 20,
            }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>عن المعلم</h3>
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
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{course.teacher_name}</div>
                  <a href={`/teachers/${course.teacher_id || course.teacher_id_ref}`}
                    style={{ fontSize: 13, color: '#2F6FED', textDecoration: 'none' }}>
                    عرض الملف الشخصي
                  </a>
                </div>
              </div>
              {course.teacher_bio && (
                <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.6 }}>{course.teacher_bio}</p>
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
