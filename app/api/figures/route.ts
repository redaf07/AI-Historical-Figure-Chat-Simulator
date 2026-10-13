import { NextRequest, NextResponse } from 'next/server';
import { HISTORICAL_FIGURES } from '@/lib/figures-data';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q')?.toLowerCase() || '';
  const era = searchParams.get('era') || '';
  const region = searchParams.get('region') || '';
  const expertise = searchParams.get('expertise') || '';
  const featuredOnly = searchParams.get('featured') === 'true';

  let figures = [...HISTORICAL_FIGURES];

  if (featuredOnly) {
    figures = figures.filter((f) => f.featured);
  }

  if (query) {
    figures = figures.filter(
      (f) =>
        f.name.toLowerCase().includes(query) ||
        f.expertise.toLowerCase().includes(query) ||
        f.biography.toLowerCase().includes(query) ||
        f.era.toLowerCase().includes(query)
    );
  }

  if (era) {
    figures = figures.filter((f) => f.era.toLowerCase().includes(era.toLowerCase()));
  }

  if (region) {
    figures = figures.filter((f) => f.region.toLowerCase().includes(region.toLowerCase()));
  }

  if (expertise) {
    figures = figures.filter((f) => f.expertise.toLowerCase().includes(expertise.toLowerCase()));
  }

  return NextResponse.json({
    figures,
    total: figures.length,
  });
}
