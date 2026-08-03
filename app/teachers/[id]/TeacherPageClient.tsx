'use client';

import { useState, useEffect, use } from 'react';
import Navbar from '@/components/Navbar';
import CourseCard from '@/components/CourseCard';
import { formatDate } from '@/lib/utils';

interface Teacher {
  id: string;
  name: string;
  bio?: string;
  avatar_url?: string;
  created_at: string;
}

interface Course {
  id: string;
  title: string;
  description: string;
  subject: string;
  cover_image_url?: string;
  lesson_count?: number;
}

export default function TeacherPageClient({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [avatarError, setAvatarError] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetch(`/api/teachers/${id}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) { setError(data.error); return; }
        setTeacher(data.teacher);
        setCourses(data.courses || []);
      })
      .catch(() => setError('فشل تحميل الصفحة'))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    setAvatarError(false);
  }, [teacher?.avatar_url]);

  if (loading) return (
    <>
      <Navbar />
      <div className="container" style={{ padding: '48px 24px' }}>
        <div style={{ textAlign: 'center', padding: 60 }}>
          <div className="spinner spinner-primary" />
        </div>
      </div>
    </>
  );

  if (error || !teacher) return (
    <>
      <Navbar />
      <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: 64 }}>⚠️</div>
        <h1 style={{ marginTop: 16, color: 'var(--text)' }}>{error || 'المعلم غير موجود'}</h1>
        <a href="/teachers"><button className="btn-primary" style={{ marginTop: 24 }}>العودة للمعلمين</button></a>
      </div>
    </>
  );

  return (
    <>
      <Navbar />
      {/* Profile header */}
      <div style={{ background: 'var(--hero-gradient)', padding: '48px 0', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
            <div 
              onClick={() => { if (teacher.avatar_url && !avatarError) setIsModalOpen(true); }}
              style={{
              width: 100, height: 100, borderRadius: '50%',
              background: teacher.avatar_url && !avatarError ? 'transparent' : 'linear-gradient(135deg, #2F6FED, #0FB5AE)',
              overflow: 'hidden', flexShrink: 0,
              border: '4px solid var(--border)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: teacher.avatar_url && !avatarError ? 'pointer' : 'default',
              transition: 'transform 0.2s ease'
            }}
            className={teacher.avatar_url && !avatarError ? 'card-hover' : ''}
            title={teacher.avatar_url && !avatarError ? "انقر لرؤية الصورة بحجم كامل" : ""}
            >
              {teacher.avatar_url && !avatarError ? (
                <img 
                  src={teacher.avatar_url} 
                  alt={teacher.name} 
                  onError={() => setAvatarError(true)}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center' }} 
                />
              ) : (
                <span style={{ fontSize: 36, color: 'white', fontWeight: 700 }}>{teacher.name.charAt(0)}</span>
              )}
            </div>
            <div>
              <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8, color: 'var(--text)' }}>{teacher.name}</h1>
              {teacher.bio && <p style={{ color: 'var(--text-muted)', fontSize: 16, maxWidth: 600, lineHeight: 1.6 }}>{teacher.bio}</p>}
              <div style={{ marginTop: 12, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>📅 انضم {formatDate(teacher.created_at)}</span>
                <span style={{ fontSize: 14, color: 'var(--primary)', fontWeight: 600 }}>📚 {courses.length} دورة منشورة</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Avatar Modal */}
      {isModalOpen && teacher?.avatar_url && !avatarError && (
        <div 
          onClick={() => setIsModalOpen(false)}
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            zIndex: 99999,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 24,
            cursor: 'zoom-out',
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          <img 
            src={teacher.avatar_url} 
            alt={teacher.name} 
            style={{ 
              maxWidth: '100%', 
              maxHeight: '100%', 
              objectFit: 'contain',
              borderRadius: 16,
              boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
              transform: 'scale(1)',
              transition: 'transform 0.3s ease'
            }} 
            onClick={(e) => e.stopPropagation()}
          />
          <button 
            onClick={() => setIsModalOpen(false)}
            style={{
              position: 'absolute', top: 24, right: 24,
              background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white',
              width: 44, height: 44, borderRadius: '50%', fontSize: 24,
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
          >
            ×
          </button>
        </div>
      )}

      {/* Courses */}
      <div className="container" style={{ padding: '48px 24px' }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24, color: 'var(--text)' }}>دورات المعلم</h2>
        {courses.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
            <div style={{ fontSize: 48 }}>📭</div>
            <div style={{ marginTop: 12 }}>لا توجد دورات منشورة بعد</div>
          </div>
        ) : (
          <div className="courses-grid">
            {courses.map(c => <CourseCard key={c.id} {...c} teacher_name={teacher.name} teacher_avatar={teacher.avatar_url} />)}
          </div>
        )}
      </div>
    </>
  );
}
