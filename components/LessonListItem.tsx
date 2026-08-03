import { formatDuration } from '@/lib/utils';

interface LessonListItemProps {
  id: string;
  title: string;
  description?: string;
  order_index: number;
  duration_seconds?: number;
  video_url?: string;
  isActive?: boolean;
  isWatched?: boolean;
  onClick?: () => void;
}

export default function LessonListItem({
  title,
  order_index,
  duration_seconds,
  video_url,
  isActive,
  isWatched,
  onClick,
}: LessonListItemProps) {
  return (
    <div
      className={`lesson-item ${isActive ? 'active' : ''} ${isWatched && !isActive ? 'watched' : ''}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onClick?.()}
      style={{ position: 'relative' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
        {/* Order badge */}
        <div style={{
          width: 32, height: 32, borderRadius: 8, flexShrink: 0,
          background: isActive ? 'var(--primary)' : isWatched ? '#10B981' : 'var(--feature-card-bg)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'background 0.2s ease',
        }}>
          {isWatched ? (
            <span style={{ fontSize: 14, color: 'white' }}>✓</span>
          ) : video_url ? (
            <span style={{ fontSize: 14, color: isActive ? 'white' : 'var(--text-muted)' }}>▶</span>
          ) : (
            <span style={{ fontSize: 12, fontWeight: 700, color: isActive ? 'white' : 'var(--text-muted)' }}>
              {order_index}
            </span>
          )}
        </div>

        {/* Info */}
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>الدرس {order_index}</div>
          <div style={{
            fontSize: 15, fontWeight: 600,
            color: isActive ? 'var(--primary)' : 'var(--text)',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {title}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        {duration_seconds && duration_seconds > 0 && (
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            {formatDuration(duration_seconds)}
          </span>
        )}
        {isWatched && !isActive && (
          <span style={{ fontSize: 11, color: '#10B981', fontWeight: 600, background: 'rgba(16,185,129,0.1)', padding: '2px 8px', borderRadius: 10 }}>شاهدت</span>
        )}
        {!isWatched && (
          <span style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 600, direction: 'ltr' }}>دخول ›</span>
        )}
      </div>
    </div>
  );
}
