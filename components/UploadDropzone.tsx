'use client';

import { useState, useRef, useCallback } from 'react';

interface UploadDropzoneProps {
  onUploadComplete: (url: string) => void;
  cloudName?: string;
  acceptType?: 'video' | 'image' | 'any';
  presetName?: string;
}

type UploadState = 'idle' | 'uploading' | 'done' | 'error';

export default function UploadDropzone({
  onUploadComplete,
  cloudName: propCloudName,
  acceptType = 'video',
  presetName = 'coursething',
}: UploadDropzoneProps) {
  const [state, setState] = useState<UploadState>('idle');
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');
  const [filename, setFilename] = useState('');
  const [customCloudName, setCustomCloudName] = useState(
    typeof window !== 'undefined' ? localStorage.getItem('cloudinary_cloud_name') || '' : ''
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeCloudName = propCloudName || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || customCloudName || 'uyiqzoyc';

  const handleUpload = useCallback(async (file: File) => {
    if (!file) return;

    if (!activeCloudName) {
      setError('يرجى كتابة اسم الـ Cloud Name الخاص بك في كليوديناري أولاً');
      return;
    }

    setFilename(file.name);
    setState('uploading');
    setProgress(0);
    setError('');

    try {
      const isVideo = file.type.startsWith('video/');
      const resourceType = isVideo ? 'video' : 'image';
      const url = `https://api.cloudinary.com/v1_1/${activeCloudName}/${resourceType}/upload`;

      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', presetName);

      const xhr = new XMLHttpRequest();
      xhr.open('POST', url, true);

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const pct = Math.round((e.loaded / e.total) * 100);
          setProgress(pct);
        }
      };

      const resultUrl = await new Promise<string>((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const data = JSON.parse(xhr.responseText);
              resolve(data.secure_url || data.url);
            } catch {
              reject(new Error('خطأ في استجابة الخادم'));
            }
          } else {
            try {
              const data = JSON.parse(xhr.responseText);
              reject(new Error(data.error?.message || `فشل الرفع: ${xhr.status}`));
            } catch {
              reject(new Error(`فشل الرفع: ${xhr.status}`));
            }
          }
        };
        xhr.onerror = () => reject(new Error('خطأ في الاتصال بالشبكة'));
        xhr.send(formData);
      });

      setState('done');
      setProgress(100);
      onUploadComplete(resultUrl);
    } catch (err) {
      console.error('Cloudinary upload error:', err);
      setState('error');
      setError(err instanceof Error ? err.message : 'فشل الرفع، يرجى المحاولة مرة أخرى');
    }
  }, [activeCloudName, presetName, onUploadComplete]);

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

  const saveCloudName = (val: string) => {
    setCustomCloudName(val);
    if (typeof window !== 'undefined') {
      localStorage.setItem('cloudinary_cloud_name', val);
    }
  };

  return (
    <div style={{ width: '100%' }}>
      {!activeCloudName && (
        <div style={{
          background: '#EFF6FF', border: '1.5px dashed #3B82F6',
          borderRadius: 12, padding: 16, marginBottom: 16,
        }}>
          <label style={{ fontSize: 13, fontWeight: 700, color: '#1E40AF', display: 'block', marginBottom: 6 }}>
            ☁️ اكتب اسم الـ Cloud Name الخاص بك في Cloudinary (مرة واحدة فقط):
          </label>
          <input
            type="text"
            placeholder="مثال: dxy9ab12"
            value={customCloudName}
            onChange={e => saveCloudName(e.target.value)}
            style={{
              width: '100%', padding: '8px 12px', borderRadius: 8,
              border: '1px solid #93C5FD', fontSize: 14, outline: 'none'
            }}
          />
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={acceptType === 'video' ? 'video/*' : acceptType === 'image' ? 'image/*' : 'video/*,image/*'}
        style={{ display: 'none' }}
        onChange={handleFileChange}
        id={`file-input-${acceptType}`}
      />

      {state === 'idle' || state === 'error' ? (
        <label
          htmlFor={`file-input-${acceptType}`}
          className={`dropzone ${isDragging ? 'active' : ''}`}
          onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          style={{ display: 'block', cursor: 'pointer' }}
        >
          <div style={{ fontSize: 40, marginBottom: 8 }}>{acceptType === 'video' ? '🎬' : '🖼️'}</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#1A1D23', marginBottom: 4 }}>
            اسحب وأفلت ملف {acceptType === 'video' ? 'الفيديو' : 'الصورة'} هنا
          </div>
          <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 12 }}>
            أو اضغط لاختيار ملف من جهازك مباشرة &bull; Cloudinary Free 25GB
          </div>
          {error && (
            <div style={{
              background: '#FEF2F2', color: '#EF4444',
              padding: '8px 16px', borderRadius: 8, fontSize: 13, marginTop: 8,
            }}>
              {error}
            </div>
          )}
        </label>
      ) : state === 'uploading' ? (
        <div style={{
          background: 'white', border: '1.5px solid #E5E7EB',
          borderRadius: 16, padding: 24, textAlign: 'center',
        }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>⏳</div>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>
            جاري رفع الملف إلى Cloudinary...
          </div>
          <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 12 }}>{filename}</div>
          <div className="progress-bar" style={{ maxWidth: 400, margin: '0 auto 8px' }}>
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#2F6FED' }}>{progress}%</div>
        </div>
      ) : (
        <div style={{
          background: '#F0FDF4', border: '1.5px solid #86EFAC',
          borderRadius: 16, padding: 24, textAlign: 'center',
        }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>✅</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#16A34A', marginBottom: 4 }}>
            تم رفع الملف بنجاح!
          </div>
          <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 12 }}>{filename}</div>
          <button className="btn-secondary" onClick={reset} style={{ padding: '6px 16px', fontSize: 13 }}>
            رفع ملف آخر
          </button>
        </div>
      )}
    </div>
  );
}
