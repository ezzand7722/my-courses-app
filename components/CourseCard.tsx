import Link from 'next/link';
import { formatDuration, getSubjectLabel } from '@/lib/utils';

interface CourseCardProps {
  id: string;
  title: string;
  description?: string;
  subject: string;
  cover_image_url?: string;
  teacher_name?: string;
  teacher_avatar?: string;
  lesson_count?: number;
  total_duration?: number;
}

export default function CourseCard({
  id,
  title,
  subject,
  cover_image_url,
  teacher_name,
  teacher_avatar,
  lesson_count,
}: CourseCardProps) {
  return (
    <Link href={`/courses/${id}`} style={{ textDecoration: 'none', display: 'block' }}>
      <div className="card-hover" style={{
        background: 'white',
        borderRadius: 16,
        overflow: 'hidden',
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        border: '1px solid #E5E7EB',
        cursor: 'pointer',
      }}>
        {/* Cover image */}
        <div style={{ position: 'relative', paddingTop: '56.25%', background: '#EBF2FF', overflow: 'hidden' }}>
          {cover_image_url ? (
            <img
              src={cover_image_url}
              alt={title}
              style={{
                position: 'absolute', top: 0, left: 0,
                width: '100%', height: '100%',
                objectFit: 'cover',
              }}
            />
          ) : (
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
              background: 'linear-gradient(135deg, #2F6FED22, #0FB5AE22)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontSize: 48 }}>📚</span>
            </div>
          )}
          {/* Free badge */}
          <div style={{
            position: 'absolute', top: 12, right: 12,
          }}>
            <span className="badge-free">مجاني</span>
          </div>
          {/* Subject badge */}
          <div style={{ position: 'absolute', bottom: 12, right: 12 }}>
            <span className="badge-subject">{getSubjectLabel(subject)}</span>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '14px 16px' }}>
          <h3 style={{
            fontSize: 'clamp(12px, 3.5vw, 15px)', fontWeight: 700, color: '#1A1D23',
            lineHeight: 1.4, marginBottom: 8,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {title}
          </h3>

          {/* Teacher info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              background: teacher_avatar ? 'transparent' : 'linear-gradient(135deg, #2F6FED, #0FB5AE)',
              overflow: 'hidden', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {teacher_avatar ? (
                <img src={teacher_avatar} alt={teacher_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ color: 'white', fontSize: 12, fontWeight: 700 }}>
                  {teacher_name?.charAt(0) || '?'}
                </span>
              )}
            </div>
            <span style={{ fontSize: 13, color: '#6B7280', fontWeight: 500 }}>
              {teacher_name || 'معلم'}
            </span>
          </div>

          {/* Stats */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            borderTop: '1px solid #F3F4F6', paddingTop: 10,
          }}>
            <span style={{ fontSize: 12, color: '#6B7280' }}>
              📹 {lesson_count || 0} درس
            </span>
            <span style={{
              fontSize: 12, fontWeight: 600, color: '#0FB5AE',
              background: 'rgba(15,181,174,0.1)', padding: '2px 10px', borderRadius: 20,
            }}>
              مجاني تماماً
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
