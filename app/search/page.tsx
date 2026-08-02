'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import CourseCard from '@/components/CourseCard';
import TeacherCard from '@/components/TeacherCard';
import { SkeletonCourseCard } from '@/components/SkeletonCard';

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

interface Teacher {
  id: string;
  name: string;
  bio?: string;
  avatar_url?: string;
}

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQ = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQ);
  const [courses, setCourses] = useState<Course[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const doSearch = useCallback(async (q: string) => {
    if (!q || q.trim().length < 2) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setCourses(data.courses || []);
      setTeachers(data.teachers || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialQ) doSearch(initialQ);
  }, [initialQ, doSearch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/search?q=${encodeURIComponent(query)}`);
    doSearch(query);
  };

  const totalResults = courses.length + teachers.length;

  return (
    <>
      <Navbar />
      <div className="container" style={{ padding: '48px 24px' }}>
        <h1 style={{ fontSize: 36, fontWeight: 900, marginBottom: 24, textAlign: 'center' }}>
          البحث
        </h1>

        <form onSubmit={handleSubmit} style={{
          display: 'flex', gap: 12, maxWidth: 600, margin: '0 auto 48px',
        }}>
          <input
            className="input-field"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="ابحث عن دورة أو معلم..."
            style={{ flex: 1 }}
          />
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? <span className="spinner" /> : 'بحث'}
          </button>
        </form>

        {loading ? (
          <div className="courses-grid">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCourseCard key={i} />)}
          </div>
        ) : searched ? (
          totalResults === 0 ? (
            <div style={{ textAlign: 'center', padding: 60 }}>
              <div style={{ fontSize: 64 }}>🔍</div>
              <h2 style={{ marginTop: 16, color: '#6B7280' }}>لم يتم إيجاد نتائج لـ "{initialQ}"</h2>
              <p style={{ color: '#9CA3AF', marginTop: 8 }}>جرب كلمات بحث مختلفة</p>
            </div>
          ) : (
            <>
              <div style={{ marginBottom: 8, color: '#6B7280', fontSize: 14 }}>
                {totalResults} نتيجة لـ "{initialQ}"
              </div>
              {teachers.length > 0 && (
                <section style={{ marginBottom: 40 }}>
                  <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 16 }}>معلمون</h2>
                  <div className="teachers-grid">
                    {teachers.map(t => (
                      <TeacherCard key={t.id} id={t.id} name={t.name} bio={t.bio} avatar_url={t.avatar_url} />
                    ))}
                  </div>
                </section>
              )}
              {courses.length > 0 && (
                <section>
                  <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 16 }}>دورات</h2>
                  <div className="courses-grid">
                    {courses.map(c => <CourseCard key={c.id} {...c} />)}
                  </div>
                </section>
              )}
            </>
          )
        ) : (
          <div style={{ textAlign: 'center', padding: 60, color: '#9CA3AF' }}>
            <div style={{ fontSize: 64 }}>🔍</div>
            <div style={{ marginTop: 16, fontSize: 16 }}>اكتب للبحث عن دورة أو معلم</div>
          </div>
        )}
      </div>
    </>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<><Navbar /><div style={{ padding: 60, textAlign: 'center' }}><div className="spinner spinner-primary" /></div></>}>
      <SearchContent />
    </Suspense>
  );
}
