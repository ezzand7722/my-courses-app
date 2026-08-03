'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getSubjectLabel } from '@/lib/utils';

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
  const [avatarError, setAvatarError] = useState(false);
  const [coverError, setCoverError] = useState(false);

  useEffect(() => {
    setAvatarError(false);
  }, [teacher_avatar]);

  useEffect(() => {
    setCoverError(false);
  }, [cover_image_url]);

  return (
    <Link href={`/courses/${id}`} style={{ textDecoration: 'none', display: 'block' }}>
      <div className="course-card">
        {/* Cover image */}
        <div className="course-card-img-container">
          {cover_image_url && !coverError ? (
            <img
              src={cover_image_url}
              alt={title}
              onError={() => setCoverError(true)}
              style={{
                position: 'absolute', top: 0, left: 0,
                width: '100%', height: '100%',
                objectFit: 'cover',
              }}
            />
          ) : (
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
              background: 'linear-gradient(135deg, rgba(47,111,237,0.1), rgba(15,181,174,0.1))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontSize: 36 }}>📚</span>
            </div>
          )}
          {/* Free badge */}
          <div style={{ position: 'absolute', top: 8, right: 8 }}>
            <span className="badge-free">مجاني</span>
          </div>
          {/* Subject badge */}
          <div style={{ position: 'absolute', bottom: 8, right: 8 }}>
            <span className="badge-subject">{getSubjectLabel(subject)}</span>
          </div>
        </div>

        {/* Content */}
        <div className="course-card-content">
          <h3 className="course-card-title">
            {title}
          </h3>

          {/* Teacher info */}
          <div className="course-card-teacher">
            <div className="course-card-teacher-avatar" style={{
              background: teacher_avatar && !avatarError ? 'transparent' : 'linear-gradient(135deg, #2F6FED, #0FB5AE)'
            }}>
              {teacher_avatar && !avatarError ? (
                <img 
                  src={teacher_avatar} 
                  alt={teacher_name} 
                  onError={() => setAvatarError(true)}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
              ) : (
                <span style={{ color: 'white', fontSize: 11, fontWeight: 700 }}>
                  {teacher_name?.charAt(0) || '?'}
                </span>
              )}
            </div>
            <span className="course-card-teacher-name">
              {teacher_name || 'معلم'}
            </span>
          </div>

          {/* Stats */}
          <div className="course-card-footer">
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              📹 {lesson_count || 0} درس
            </span>
            <span style={{
              fontSize: 11, fontWeight: 600, color: 'var(--teal)',
              background: 'rgba(15,181,174,0.12)', padding: '2px 8px', borderRadius: 20,
            }}>
              مجاني تماماً
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
