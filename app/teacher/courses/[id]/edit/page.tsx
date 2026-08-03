import CourseEditClient from './CourseEditClient';

export const runtime = 'edge';

export default function CourseEditPage({ params }: { params: Promise<{ id: string }> }) {
  return <CourseEditClient params={params} />;
}
