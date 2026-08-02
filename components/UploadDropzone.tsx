'use client';

import { useState, useRef, useCallback } from 'react';

interface UploadDropzoneProps {
  onUploadComplete: (uid: string) => void;
  courseId: string;
}

type UploadState = 'idle' | 'uploading' | 'done' | 'error';

export default function UploadDropzone({ onUploadComplete, courseId }: UploadDropzoneProps) {
  const [state, setState] = useState<UploadState>('idle');
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');
  const [filename, setFilename] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = useCallback(async (file: File) => {
    if (!file) return;
    if (!file.type.startsWith('video/')) {
      setError('يرجى اختيار ملف فيديو صالح');
      return;
    }

    setFilename(file.name);
    setState('uploading');
    setProgress(0);
    setError('');

    try {
      // Step 1: Get TUS upload URL from Cloudflare Stream
      const res = await fetch('/api/upload/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'فشل الحصول على رابط الرفع');
      }

      const { uid, uploadURL } = await res.json();

      // Step 2: Upload via TUS using tus-js-client
      const { Upload } = await import('tus-js-client');

      await new Promise<void>((resolve, reject) => {
        const upload = new Upload(file, {
          endpoint: uploadURL,
          retryDelays: [0, 3000, 5000, 10000],
          chunkSize: 50 * 1024 * 1024, // 50MB chunks
          metadata: {
            filename: file.name,
            filetype: file.type,
          },
          onError(error) {
            reject(error);
          },
          onProgress(bytesUploaded, bytesTotal) {
            const pct = Math.round((bytesUploaded / bytesTotal) * 100);
            setProgress(pct);
          },
          onSuccess() {
            resolve();
          },
        });

        // Check for previous uploads
        upload.findPreviousUploads().then(previous => {
          if (previous.length > 0) {
            upload.resumeFromPreviousUpload(previous[0]);
          }
          upload.start();
        });
      });

      setState('done');
      setProgress(100);
      onUploadComplete(uid);
    } catch (err) {
      console.error('Upload error:', err);
      setState('error');
      setError(err instanceof Error ? err.message : 'فشل الرفع، يرجى المحاولة مرة أخرى');
    }
  }, [courseId, onUploadComplete]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleUpload(file);
  }, [handleUpload]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
  };

  const reset = () => {
    setState('idle');
    setProgress(0);
    setError('');
    setFilename('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        style={{ display: 'none' }}
        onChange={handleFileChange}
        id="video-file-input"
      />

      {state === 'idle' || state === 'error' ? (
        <label
          htmlFor="video-file-input"
          className={`dropzone ${isDragging ? 'active' : ''}`}
          onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          style={{ display: 'block', cursor: 'pointer' }}
        >
          <div style={{ fontSize: 48, marginBottom: 12 }}>🎬</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#1A1D23', marginBottom: 8 }}>
            اسحب وأفلت ملف الفيديو هنا
          </div>
          <div style={{ fontSize: 14, color: '#6B7280', marginBottom: 16 }}>
            أو اضغط لاختيار ملف &bull; MP4, MOV, MKV &bull; حجم أقصى 15GB
          </div>
          {error && (
            <div style={{
              background: '#FEF2F2', color: '#EF4444',
              padding: '8px 16px', borderRadius: 8, fontSize: 14, marginTop: 8,
            }}>
              {error}
            </div>
          )}
        </label>
      ) : state === 'uploading' ? (
        <div style={{
          background: 'white', border: '1.5px solid #E5E7EB',
          borderRadius: 16, padding: 32, textAlign: 'center',
        }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>
            جاري رفع الفيديو...
          </div>
          <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 16 }}>{filename}</div>
          <div className="progress-bar" style={{ maxWidth: 400, margin: '0 auto 12px' }}>
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#2F6FED' }}>{progress}%</div>
          <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 4 }}>
            لا تغلق هذه النافذة حتى يكتمل الرفع
          </div>
        </div>
      ) : (
        <div style={{
          background: '#F0FDF4', border: '1.5px solid #86EFAC',
          borderRadius: 16, padding: 32, textAlign: 'center',
        }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#16A34A', marginBottom: 8 }}>
            تم رفع الفيديو بنجاح!
          </div>
          <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 16 }}>{filename}</div>
          <button className="btn-secondary" onClick={reset}>
            رفع فيديو آخر
          </button>
        </div>
      )}
    </div>
  );
}
