import { INITIAL_ENTITIES } from '@/lib/data/mockData';
import EntityClient from './EntityClient';

export function generateStaticParams() {
  return INITIAL_ENTITIES.map((entity) => ({
    slug: entity.slug,
  }));
}

export default async function EntityPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <EntityClient initialSlug={slug} />;
}
