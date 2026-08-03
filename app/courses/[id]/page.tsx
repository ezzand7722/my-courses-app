import CoursePageClient from './CoursePageClient';

export const dynamic = 'force-static';

export function generateStaticParams() {
  return [];
}

export default function CoursePage({ params }: { params: Promise<{ id: string }> }) {
  return <CoursePageClient params={params} />;
}
