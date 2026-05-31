import { NextRequest, NextResponse } from 'next/server';

const ALLOWED_HOST = 'invest-brands.cdn-tinkoff.ru';

export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get('n');
  if (!raw || !/^[\w.\-]+$/.test(raw)) {
    return new NextResponse(null, { status: 400 });
  }
  // Strip any extension the API already appended, then add the right size suffix
  const name = raw.replace(/\.[a-z]+$/i, '');
  const url = `https://${ALLOWED_HOST}/${name}x160.png`;
  try {
    const res = await fetch(url, { next: { revalidate: 86400 } });
    if (!res.ok) return new NextResponse(null, { status: 404 });
    const body = await res.arrayBuffer();
    return new NextResponse(body, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch {
    return new NextResponse(null, { status: 502 });
  }
}
