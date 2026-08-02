'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import TeacherCard from '@/components/TeacherCard';
import { SkeletonTeacherCard } from '@/components/SkeletonCard';

interface Teacher {
  id: string;
  name: string;
  bio?: string;
  avatar_url?: string;
  course_count?: number;
}

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/teachers')
      .then(r => r.json())
      .then(d => setTeachers(d.teachers || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Navbar />
      <div className="container" style={{ padding: '48px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h1 style={{ fontSize: 36, fontWeight: 900, marginBottom: 8 }}>المعلمون</h1>
          <p style={{ color: '#6B7280', fontSize: 16 }}>تعرّف على نخبة من أفضل المعلمين</p>
        </div>

        {loading ? (
          <div className="teachers-grid">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonTeacherCard key={i} />)}
          </div>
        ) : teachers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 80 }}>
            <div style={{ fontSize: 64 }}>👨🏫</div>
            <h2 style={{ marginTop: 16, color: '#6B7280' }}>لا يوجد معلمون حالياً</h2>
          </div>
        ) : (
          <div className="teachers-grid">
            {teachers.map(t => <TeacherCard key={t.id} {...t} />)}
          </div>
        )}
      </div>
    </>
  );
}
