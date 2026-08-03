import TeacherPageClient from './TeacherPageClient';

export const runtime = 'edge';

export default function TeacherProfilePage({ params }: { params: Promise<{ id: string }> }) {
  return <TeacherPageClient params={params} />;
}
