import CourseEditClient from './CourseEditClient';

export const dynamic = 'force-static';

export function generateStaticParams() {
  return [];
}

export default function CourseEditPage({ params }: { params: Promise<{ id: string }> }) {
  return <CourseEditClient params={params} />;
}
