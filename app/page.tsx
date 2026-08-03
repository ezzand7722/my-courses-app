'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import CourseCard from '@/components/CourseCard';
import TeacherCard from '@/components/TeacherCard';
import { SkeletonCourseCard, SkeletonTeacherCard } from '@/components/SkeletonCard';
import { SUBJECTS } from '@/lib/utils';

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
  course_count?: number;
}

export default function HomePage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingTeachers, setLoadingTeachers] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState<string>('');

  useEffect(() => {
    async function fetchData() {
      try {
        const [coursesRes, teachersRes] = await Promise.all([
          fetch('/api/courses?published=true'),
          fetch('/api/teachers'),
        ]);
        const coursesData = await coursesRes.json();
        const teachersData = await teachersRes.json();
        setCourses(coursesData.courses || []);
        setTeachers(teachersData.teachers || []);
      } catch (err) {
        console.error('Failed to load homepage data:', err);
      } finally {
        setLoadingCourses(false);
        setLoadingTeachers(false);
      }
    }
    fetchData();
  }, []);

  const filteredCourses = selectedSubject
    ? courses.filter(c => c.subject === selectedSubject)
    : courses;

  const features = [
    { icon: '📱', title: 'سهولة الوصول', desc: 'شاهد الدروس من أي جهاز، في أي مكان وزمان' },
    { icon: '🎬', title: 'فيديوهات احترافية', desc: 'محتوى تعليمي مصوّر بجودة عالية' },
    { icon: '✅', title: 'مجاني 100%', desc: 'جميع الدورات مجانية بلا أي رسوم' },
    { icon: '🏆', title: 'معلمون متميزون', desc: 'نخبة من أفضل المعلمين في مجالاتهم' },
  ];

  return (
    <>
      <Navbar />

      {/* Hero */}
      <section className="hero-gradient" style={{ padding: 'clamp(40px, 8vw, 80px) 0 clamp(32px, 6vw, 64px)' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <div className="animate-fade-in">
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(47,111,237,0.1)', color: 'var(--primary)',
              borderRadius: 20, padding: '6px 16px', fontSize: 13, fontWeight: 600,
              marginBottom: 24,
            }}>
              <span>🎓</span> منصة الدورات التعليمية المجانية
            </div>

            <h1 style={{
              fontSize: 'clamp(32px, 5vw, 56px)',
              fontWeight: 900, color: 'var(--text)',
              lineHeight: 1.2, marginBottom: 20,
            }}>
              تعلّم مع أفضل المعلمين
              <br />
              <span style={{
                background: 'linear-gradient(135deg, #2F6FED, #0FB5AE)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                مجاناً وبدون قيود
              </span>
            </h1>

            <p style={{
              fontSize: 18, color: 'var(--text-muted)', maxWidth: 520,
              margin: '0 auto 32px', lineHeight: 1.7,
            }}>
              اكتشف مئات الدورات في مختلف المواضيع، شاهد الفيديوهات مباشرة، وطوّر مهاراتك بلا أي تكلفة.
            </p>

            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href="#courses">
                <button className="btn-primary" style={{ fontSize: 16, padding: '14px 32px' }}>
                  🚀 ابدأ التعلّم الآن
                </button>
              </a>
              <a href="/teachers">
                <button className="btn-secondary" style={{ fontSize: 16, padding: '14px 32px' }}>
                  👨🏫 تصفح المعلمين
                </button>
              </a>
            </div>

            {/* Stats */}
            <div style={{
              display: 'flex', gap: 40, justifyContent: 'center',
              marginTop: 48, flexWrap: 'wrap',
            }}>
              {[
                { num: courses.length, label: 'دورة متاحة' },
                { num: teachers.length, label: 'معلم متخصص' },
                { num: '100%', label: 'مجاني' },
              ].map((stat, i) => (
                <div key={i} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 32, fontWeight: 900, color: 'var(--primary)' }}>{stat.num}</div>
                  <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section" style={{ background: 'var(--section-alt-bg)' }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 24,
          }}>
            {features.map((f, i) => (
              <div key={i} style={{
                textAlign: 'center', padding: 24,
                background: 'var(--feature-card-bg)', borderRadius: 16,
                border: '1px solid var(--border)',
              }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>{f.icon}</div>
                <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8, color: 'var(--text)' }}>{f.title}</h3>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Courses */}
      <section className="section" id="courses">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <h2 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8, color: 'var(--text)' }}>أهم دوراتنا</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 16 }}>اختر من دوراتنا المتنوعة في كل المواضيع</p>
          </div>

          {/* Subject filters */}
          <div style={{
            display: 'flex', gap: 8, flexWrap: 'wrap',
            justifyContent: 'center', marginBottom: 32,
          }}>
            <button
              onClick={() => setSelectedSubject('')}
              style={{
                padding: '8px 20px', borderRadius: 20, border: 'none', cursor: 'pointer',
                fontFamily: 'Cairo, sans-serif', fontSize: 14, fontWeight: 600,
                background: !selectedSubject ? 'var(--primary)' : 'var(--feature-card-bg)',
                color: !selectedSubject ? 'white' : 'var(--text)',
                transition: 'all 0.2s ease',
              }}
            >
              الكل
            </button>
            {SUBJECTS.map(s => (
              <button
                key={s.id}
                onClick={() => setSelectedSubject(s.id)}
                style={{
                  padding: '8px 20px', borderRadius: 20, border: 'none', cursor: 'pointer',
                  fontFamily: 'Cairo, sans-serif', fontSize: 14, fontWeight: 600,
                  background: selectedSubject === s.id ? 'var(--primary)' : 'var(--feature-card-bg)',
                  color: selectedSubject === s.id ? 'white' : 'var(--text)',
                  transition: 'all 0.2s ease',
                }}
              >
                {s.label}
              </button>
            ))}
          </div>

          {loadingCourses ? (
            <div className="courses-grid">
              {Array.from({ length: 6 }).map((_, i) => <SkeletonCourseCard key={i} />)}
            </div>
          ) : filteredCourses.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 60, color: '#6B7280' }}>
              <div style={{ fontSize: 48 }}>📚</div>
              <div style={{ fontSize: 16, marginTop: 12 }}>لا توجد دورات في هذه الفئة حالياً</div>
            </div>
          ) : (
            <div className="courses-grid">
              {filteredCourses.map(course => (
                <CourseCard key={course.id} {...course} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Teachers preview */}
      <section className="section" style={{ background: 'var(--section-alt-bg)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <h2 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8, color: 'var(--text)' }}>معلمونا المتميزون</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 16 }}>نخبة من أفضل المعلمين في مجالاتهم</p>
          </div>

          {loadingTeachers ? (
            <div className="teachers-grid">
              {Array.from({ length: 4 }).map((_, i) => <SkeletonTeacherCard key={i} />)}
            </div>
          ) : (
            <div className="teachers-grid">
              {teachers.slice(0, 4).map(teacher => (
                <TeacherCard key={teacher.id} {...teacher} />
              ))}
            </div>
          )}

          {teachers.length > 4 && (
            <div style={{ textAlign: 'center', marginTop: 32 }}>
              <a href="/teachers">
                <button className="btn-secondary">عرض جميع المعلمين</button>
              </a>
            </div>
          )}
        </div>
      </section>

      {/* CTA Banner */}
      <section style={{
        background: 'linear-gradient(135deg, #2F6FED, #0FB5AE)',
        padding: '64px 0',
      }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: 32, fontWeight: 800, color: 'white', marginBottom: 12 }}>
            سجّل الآن واحصل على المزيد من الدورات!
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 16, marginBottom: 24 }}>
            جميع الدورات مجانية — ابدأ رحلتك التعليمية اليوم
          </p>
          <a href="#courses">
            <button style={{
              background: 'white', color: '#2F6FED',
              padding: '14px 32px', borderRadius: 10,
              fontWeight: 700, fontSize: 16,
              border: 'none', cursor: 'pointer',
              fontFamily: 'Cairo, sans-serif',
              boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
              transition: 'transform 0.2s ease',
            }}>
              اكتشف بنفسك!
            </button>
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        background: 'var(--footer-bg)', color: 'white',
        padding: '48px 0 24px',
      }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 32, marginBottom: 40,
          }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 12 }}>🎓 منصة تعلّم</div>
              <p style={{ fontSize: 14, color: 'var(--footer-text)', lineHeight: 1.6 }}>
                منصة تعليمية مجانية تجمع بين المعلمين والطلاب.
              </p>
            </div>
            <div>
              <div style={{ fontWeight: 700, marginBottom: 12 }}>روابط سريعة</div>
              {[['/', 'الرئيسية'], ['/courses', 'الدورات'], ['/teachers', 'المعلمون'], ['/search', 'البحث']].map(([href, label]) => (
                <a key={href} href={href} style={{
                  display: 'block', fontSize: 14,
                  color: 'var(--footer-text)', textDecoration: 'none',
                  marginBottom: 8, transition: 'color 0.15s',
                }}>
                  {label}
                </a>
              ))}
            </div>
            <div>
              <div style={{ fontWeight: 700, marginBottom: 12 }}>للمعلمين</div>
              {[['/teacher/login', 'تسجيل الدخول'], ['/teacher/register', 'إنشاء حساب'], ['/teacher/dashboard', 'لوحة التحكم']].map(([href, label]) => (
                <a key={href} href={href} style={{
                  display: 'block', fontSize: 14,
                  color: 'var(--footer-text)', textDecoration: 'none',
                  marginBottom: 8,
                }}>
                  {label}
                </a>
              ))}
            </div>
          </div>
          <div style={{
            borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 20,
            textAlign: 'center', fontSize: 14, color: 'var(--footer-text)',
          }}>
            © {new Date().getFullYear()} منصة تعلّم — جميع الدورات مجانية 🎓
          </div>
        </div>
      </footer>
    </>
  );
}
