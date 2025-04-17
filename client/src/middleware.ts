
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 1. Specify protected and CORRECT auth routes
const protectedRoutes = ['/dashboard', '/surveys', '/settings', '/admin']; // Add any other routes that need auth
const authRoutes = ['/auth/login', '/auth/signup']; 

export function middleware(request: NextRequest) {
  // 2. Check for presence of the access token cookie
  const accessToken = request.cookies.get('access_token')?.value;
  const { pathname } = request.nextUrl;

  // 3. Redirect unauthenticated users trying to access protected routes
  if (!accessToken && protectedRoutes.some((route) => pathname.startsWith(route))) {
    console.log(`Middleware: No access token, redirecting from ${pathname} to /auth/login`);
    // Redirect to the CORRECT login page path
    const loginUrl = new URL('/auth/login', request.url); 
    loginUrl.searchParams.set('redirectedFrom', pathname); 
    return NextResponse.redirect(loginUrl);
  }

  // 4. Redirect authenticated users trying to access login/signup pages
  if (accessToken && authRoutes.some((route) => pathname.startsWith(route))) {
    console.log(`Middleware: User authenticated, redirecting from ${pathname} to /dashboard`);
    // Redirect to the main dashboard or desired authenticated route
    return NextResponse.redirect(new URL('/dashboard', request.url)); 
  }

  // 5. Allow request to proceed if none of the above conditions met
  return NextResponse.next();
}

// Configure the matcher 
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images (assuming you have a public /images folder)
     * - assets (assuming you have a public /assets folder)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|images|assets).*)',
  ],
}