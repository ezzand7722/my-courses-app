import CoursePageClient from './CoursePageClient';

export const runtime = 'edge';

export default function CoursePage({ params }: { params: Promise<{ id: string }> }) {
  return <CoursePageClient params={params} />;
}
