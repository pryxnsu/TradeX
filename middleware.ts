import { NextResponse, type NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const token = request.cookies.get('auth.token.0')?.value;
    const { pathname } = request.nextUrl;

    if (token && pathname.startsWith('/login')) {
        return NextResponse.redirect(new URL('/webtrading', request.url));
    }

    const protectedRoutes = ['/webtrading'];

    if (!token && protectedRoutes.some(item => pathname.startsWith(item))) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/login', '/webtrading/:path*'],
};
