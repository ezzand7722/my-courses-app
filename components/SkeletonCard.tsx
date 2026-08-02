export function SkeletonCourseCard() {
  return (
    <div style={{
      background: 'white', borderRadius: 16,
      overflow: 'hidden', border: '1px solid #E5E7EB',
    }}>
      <div className="skeleton" style={{ height: 160, borderRadius: 0 }} />
      <div style={{ padding: '14px 16px' }}>
        <div className="skeleton" style={{ height: 18, width: '80%', marginBottom: 8 }} />
        <div className="skeleton" style={{ height: 14, width: '60%', marginBottom: 12 }} />
        <div style={{ display: 'flex', gap: 8 }}>
          <div className="skeleton" style={{ height: 12, width: 80 }} />
          <div className="skeleton" style={{ height: 12, width: 60 }} />
        </div>
      </div>
    </div>
  );
}

export function SkeletonTeacherCard() {
  return (
    <div style={{
      background: 'white', borderRadius: 16,
      padding: 24, textAlign: 'center',
      border: '1px solid #E5E7EB',
    }}>
      <div className="skeleton" style={{
        width: 80, height: 80, borderRadius: '50%', margin: '0 auto 12px',
      }} />
      <div className="skeleton" style={{ height: 18, width: '70%', margin: '0 auto 8px' }} />
      <div className="skeleton" style={{ height: 13, width: '90%', margin: '0 auto 4px' }} />
      <div className="skeleton" style={{ height: 13, width: '80%', margin: '0 auto' }} />
    </div>
  );
}

export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="skeleton"
          style={{ height: 14, width: i === lines - 1 ? '60%' : '100%' }}
        />
      ))}
    </div>
  );
}
