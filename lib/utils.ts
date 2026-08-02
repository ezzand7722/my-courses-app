export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return '0:00';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('ar-SA', {
    year: 'numeric', month: 'long', day: 'numeric'
  });
}

export function slugify(text: string): string {
  return text
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .toLowerCase();
}

export const SUBJECTS = [
  { id: 'math', label: 'رياضيات' },
  { id: 'physics', label: 'فيزياء' },
  { id: 'chemistry', label: 'كيمياء' },
  { id: 'biology', label: 'أحياء' },
  { id: 'arabic', label: 'لغة عربية' },
  { id: 'english', label: 'لغة إنجليزية' },
  { id: 'history', label: 'تاريخ' },
  { id: 'geography', label: 'جغرافيا' },
  { id: 'religious', label: 'تربية إسلامية' },
  { id: 'it', label: 'تقنية معلومات' },
  { id: 'other', label: 'أخرى' },
];

export function getSubjectLabel(id: string): string {
  return SUBJECTS.find(s => s.id === id)?.label || id;
}
