export const runtime = "edge";\n'use client';

import { useState, useEffect, use } from 'react';
import Navbar from '@/components/Navbar';
import CourseCard from '@/components/CourseCard';
import { SkeletonCourseCard } from '@/components/SkeletonCard';
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

export default function TeacherProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
        <h1 style={{ marginTop: 16 }}>{error || 'المعلم غير موجود'}</h1>
        <a href="/teachers"><button className="btn-primary" style={{ marginTop: 24 }}>العودة للمعلمين</button></a>
      </div>
    </>
  );

  return (
    <>
      <Navbar />
      {/* Profile header */}
      <div style={{ background: 'linear-gradient(135deg, #EBF2FF, #F0FFFE)', padding: '48px 0' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
            <div style={{
              width: 100, height: 100, borderRadius: '50%',
              background: teacher.avatar_url ? 'transparent' : 'linear-gradient(135deg, #2F6FED, #0FB5AE)',
              overflow: 'hidden', flexShrink: 0,
              border: '4px solid white',
              boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {teacher.avatar_url ? (
                <img src={teacher.avatar_url} alt={teacher.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ fontSize: 36, color: 'white', fontWeight: 700 }}>{teacher.name.charAt(0)}</span>
              )}
            </div>
            <div>
              <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8 }}>{teacher.name}</h1>
              {teacher.bio && <p style={{ color: '#6B7280', fontSize: 16, maxWidth: 600, lineHeight: 1.6 }}>{teacher.bio}</p>}
              <div style={{ marginTop: 12, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 14, color: '#6B7280' }}>📅 انضم {formatDate(teacher.created_at)}</span>
                <span style={{ fontSize: 14, color: '#2F6FED', fontWeight: 600 }}>📚 {courses.length} دورة منشورة</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Courses */}
      <div className="container" style={{ padding: '48px 24px' }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>دورات المعلم</h2>
        {courses.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#6B7280' }}>
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
