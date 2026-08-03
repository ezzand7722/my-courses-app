'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface TeacherCardProps {
  id: string;
  name: string;
  bio?: string;
  avatar_url?: string;
  course_count?: number;
}

export default function TeacherCard({ id, name, bio, avatar_url, course_count }: TeacherCardProps) {
  const [avatarError, setAvatarError] = useState(false);

  useEffect(() => {
    setAvatarError(false);
  }, [avatar_url]);

  return (
    <Link href={`/teachers/${id}`} style={{ textDecoration: 'none', display: 'block' }}>
      <div className="teacher-card">
        {/* Avatar */}
        <div className="teacher-card-avatar-container" style={{
          background: avatar_url && !avatarError ? 'transparent' : 'linear-gradient(135deg, #2F6FED, #0FB5AE)'
        }}>
          {avatar_url && !avatarError ? (
              <img 
                src={avatar_url} 
                alt={name} 
                onError={() => setAvatarError(true)}
                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center' }} 
              />
          ) : (
            <span style={{ color: 'white', fontSize: 24, fontWeight: 700 }}>
              {name.charAt(0)}
            </span>
          )}
        </div>

        <h3 className="teacher-card-name">{name}</h3>

        {bio && (
          <p className="teacher-card-bio">
            {bio}
          </p>
        )}

        <div style={{
          background: 'rgba(47,111,237,0.12)', borderRadius: 8,
          padding: '6px 12px', display: 'inline-block',
        }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--primary)' }}>
            {course_count || 0} دورة
          </span>
        </div>
      </div>
    </Link>
  );
}
