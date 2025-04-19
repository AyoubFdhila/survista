import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const LOGIN  = '/auth/login';
const SIGNUP = '/auth/signup';
const DASH   = '/dashboard';

/** URL prefixes that require any valid access‑token cookie */
const PROTECTED_PREFIXES = ['/dashboard', '/surveys', '/settings', '/admin'];

/** Asset paths we never want to run through the middleware  */
const ASSET_RE = /^\/(_next\/(static|image)|favicon\.ico|images|assets)/;

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  /* 1 ▸ Skip assets immediately */
  if (ASSET_RE.test(pathname)) return NextResponse.next();

  /* 2 ▸ Read cookie (cheap) */
  const hasToken = !!req.cookies.get('access_token');

  /* 3 ▸ Un‑authed hitting protected path → /auth/login */
  if (!hasToken && PROTECTED_PREFIXES.some(p => pathname.startsWith(p))) {
    const login = new URL(LOGIN, req.url);
    login.searchParams.set('redirectedFrom', pathname);
    return NextResponse.redirect(login);
  }

  /* 4 ▸ Authed hitting unauth routes → /dashboard */
  if (
    hasToken &&
    (pathname.startsWith(LOGIN) || pathname.startsWith(SIGNUP))
  ) {
    return NextResponse.redirect(new URL(DASH, req.url));
  }

  /* 5 ▸ Everything else is fine */
  return NextResponse.next();
}

export const config = { matcher: '/((?!api).*)' };   // “api” routes stay server‑only
