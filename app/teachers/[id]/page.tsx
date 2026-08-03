import TeacherPageClient from './TeacherPageClient';

export const dynamic = 'force-static';

export function generateStaticParams() {
  return [];
}

export default function TeacherProfilePage({ params }: { params: Promise<{ id: string }> }) {
  return <TeacherPageClient params={params} />;
}
