'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import CourseCard from '@/components/CourseCard';
import { SkeletonCourseCard } from '@/components/SkeletonCard';
import SubjectFilters from '@/components/SubjectFilters';

interface Course {
  id: string;
  title: string;
  description: string;
  subject: string;
  cover_image_url?: string;
  teacher_name?: string;
  teacher_avatar?: string;
  lesson_count?: number;
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState('');

  useEffect(() => {
    const url = selectedSubject
      ? `/api/courses?subject=${selectedSubject}`
      : '/api/courses';
    setLoading(true);
    fetch(url)
      .then(r => r.json())
      .then(d => setCourses(d.courses || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedSubject]);

  return (
    <>
      <Navbar />
      <div className="container" style={{ padding: '48px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h1 style={{ fontSize: 36, fontWeight: 900, marginBottom: 8 }}>جميع الدورات</h1>
          <p style={{ color: '#6B7280', fontSize: 16 }}>اختر الدورة المناسبة وابدأ التعلّم الآن</p>
        </div>

        <SubjectFilters selectedSubject={selectedSubject} setSelectedSubject={setSelectedSubject} />

        {loading ? (
          <div className="courses-grid">
            {Array.from({ length: 9 }).map((_, i) => <SkeletonCourseCard key={i} />)}
          </div>
        ) : courses.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 80 }}>
            <div style={{ fontSize: 64 }}>📚</div>
            <h2 style={{ marginTop: 16, color: '#6B7280' }}>لا توجد دورات حالياً</h2>
          </div>
        ) : (
          <div className="courses-grid">
            {courses.map(c => <CourseCard key={c.id} {...c} />)}
          </div>
        )}
      </div>
    </>
  );
}
