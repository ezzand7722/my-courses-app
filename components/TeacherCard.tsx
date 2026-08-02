import Link from 'next/link';

interface TeacherCardProps {
  id: string;
  name: string;
  bio?: string;
  avatar_url?: string;
  course_count?: number;
}

export default function TeacherCard({ id, name, bio, avatar_url, course_count }: TeacherCardProps) {
  return (
    <Link href={`/teachers/${id}`} style={{ textDecoration: 'none', display: 'block' }}>
      <div className="card-hover" style={{
        background: 'white',
        borderRadius: 16,
        padding: 24,
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        border: '1px solid #E5E7EB',
        textAlign: 'center',
        cursor: 'pointer',
      }}>
        {/* Avatar */}
        <div style={{
          width: 80, height: 80, borderRadius: '50%',
          background: avatar_url ? 'transparent' : 'linear-gradient(135deg, #2F6FED, #0FB5AE)',
          overflow: 'hidden', margin: '0 auto 12px',
          border: '3px solid #EBF2FF',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {avatar_url ? (
            <img src={avatar_url} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span style={{ color: 'white', fontSize: 28, fontWeight: 700 }}>
              {name.charAt(0)}
            </span>
          )}
        </div>

        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1A1D23', marginBottom: 6 }}>{name}</h3>

        {bio && (
          <p style={{
            fontSize: 13, color: '#6B7280', lineHeight: 1.5, marginBottom: 12,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {bio}
          </p>
        )}

        <div style={{
          background: 'rgba(47,111,237,0.08)', borderRadius: 8,
          padding: '6px 12px', display: 'inline-block',
        }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#2F6FED' }}>
            {course_count || 0} دورة
          </span>
        </div>
      </div>
    </Link>
  );
}
