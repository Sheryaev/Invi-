import { NextRequest, NextResponse } from 'next/server';

const ALLOWED_HOST = 'invest-brands.cdn-tinkoff.ru';

export async function GET(req: NextRequest) {
  const name = req.nextUrl.searchParams.get('n');
  if (!name || !/^[\w-]+$/.test(name)) {
    return new NextResponse(null, { status: 400 });
  }
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
