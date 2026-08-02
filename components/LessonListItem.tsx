import { formatDuration } from '@/lib/utils';

interface LessonListItemProps {
  id: string;
  title: string;
  description?: string;
  order_index: number;
  duration_seconds?: number;
  video_url?: string;
  isActive?: boolean;
  onClick?: () => void;
}

export default function LessonListItem({
  title,
  order_index,
  duration_seconds,
  video_url,
  isActive,
  onClick,
}: LessonListItemProps) {
  return (
    <div
      className={`lesson-item ${isActive ? 'active' : ''}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onClick?.()}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
        {/* Order badge */}
        <div style={{
          width: 32, height: 32, borderRadius: 8, flexShrink: 0,
          background: isActive ? '#2F6FED' : '#F3F4F6',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {video_url ? (
            <span style={{ fontSize: 14, color: isActive ? 'white' : '#6B7280' }}>▶</span>
          ) : (
            <span style={{ fontSize: 12, fontWeight: 700, color: isActive ? 'white' : '#6B7280' }}>
              {order_index}
            </span>
          )}
        </div>

        {/* Info */}
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: 13, color: '#6B7280', fontWeight: 500 }}>الدرس {order_index}</div>
          <div style={{
            fontSize: 15, fontWeight: 600,
            color: isActive ? '#2F6FED' : '#1A1D23',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {title}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        {duration_seconds && duration_seconds > 0 && (
          <span style={{ fontSize: 12, color: '#6B7280' }}>
            {formatDuration(duration_seconds)}
          </span>
        )}
        <span style={{ fontSize: 13, color: '#2F6FED', fontWeight: 600, direction: 'ltr' }}>
          دخول الدرس ›
        </span>
      </div>
    </div>
  );
}
