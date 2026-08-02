'use client';

interface VideoPlayerProps {
  streamUid?: string; // Kept for backwards compatibility
  videoUrl?: string;
  title?: string;
}

export default function VideoPlayer({ streamUid, videoUrl, title }: VideoPlayerProps) {
  const url = videoUrl || streamUid;
  
  if (!url) {
    return (
      <div style={{
        background: '#1A1D23', borderRadius: 16,
        padding: '60px 40px', textAlign: 'center',
        color: '#6B7280',
      }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>📹</div>
        <div style={{ fontSize: 16, color: '#9CA3AF' }}>اختر درساً لمشاهدة الفيديو</div>
      </div>
    );
  }

  // Parse YouTube or Vimeo URL
  let embedUrl = url;
  if (url.includes('youtube.com/watch?v=')) {
    const videoId = url.split('v=')[1]?.split('&')[0];
    embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
  } else if (url.includes('youtu.be/')) {
    const videoId = url.split('youtu.be/')[1]?.split('?')[0];
    embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
  } else if (url.includes('vimeo.com/')) {
    const videoId = url.split('vimeo.com/')[1]?.split('?')[0];
    embedUrl = `https://player.vimeo.com/video/${videoId}?autoplay=1`;
  }

  return (
    <div style={{ borderRadius: 16, overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.15)' }}>
      {title && (
        <div style={{
          background: '#1A1D23', padding: '12px 16px',
          color: 'white', fontSize: 15, fontWeight: 600,
        }}>
          {title}
        </div>
      )}
      <div className="video-container" style={{ borderRadius: title ? '0 0 16px 16px' : 16 }}>
        <iframe
          src={embedUrl}
          style={{ border: 'none', width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}
          allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
          allowFullScreen
          title={title || 'فيديو الدرس'}
        />
      </div>
    </div>
  );
}
