import { NextRequest, NextResponse } from 'next/server';
import { getProducts, getProductFilters } from '@/lib/db/queries';
import { getSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const searchParams = req.nextUrl.searchParams;
  const filters = {
    brand: searchParams.get('brand') || undefined,
    category: searchParams.get('category') || undefined,
    supplier: searchParams.get('supplier') || undefined,
    search: searchParams.get('search') || undefined,
  };

  const products = getProducts(filters);
  const filterOptions = getProductFilters();

  return NextResponse.json({ products, filters: filterOptions });
}
