import { NextResponse } from 'next/server';

export function middleware(request) {
  // Skip middleware for localhost
  if (request.nextUrl.hostname === 'localhost') {
    return NextResponse.next();
  }

  // Check if the request is HTTP (not HTTPS)
  // Vercel sets x-forwarded-proto header
  const protocol = request.headers.get('x-forwarded-proto');
  
  // If it's HTTP, redirect to HTTPS
  if (protocol === 'http') {
    const url = request.nextUrl.clone();
    url.protocol = 'https:';
    return NextResponse.redirect(url, 301);
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: '/:path*',
};

