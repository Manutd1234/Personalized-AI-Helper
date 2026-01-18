import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // Skip middleware if Supabase is not configured
    if (!supabaseUrl || !supabaseAnonKey) {
        return NextResponse.next();
    }

    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    });

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: {
            get(name: string) {
                return request.cookies.get(name)?.value;
            },
            set(name: string, value: string, options: CookieOptions) {
                request.cookies.set({
                    name,
                    value,
                    ...options,
                });
                response = NextResponse.next({
                    request: {
                        headers: request.headers,
                    },
                });
                response.cookies.set({
                    name,
                    value,
                    ...options,
                });
            },
            remove(name: string, options: CookieOptions) {
                request.cookies.set({
                    name,
                    value: '',
                    ...options,
                });
                response = NextResponse.next({
                    request: {
                        headers: request.headers,
                    },
                });
                response.cookies.set({
                    name,
                    value: '',
                    ...options,
                });
            },
        },
    });

    const { data: { session } } = await supabase.auth.getSession();

    const isAuthPage = request.nextUrl.pathname === '/login' ||
        request.nextUrl.pathname === '/signup' ||
        request.nextUrl.pathname.startsWith('/auth/');

    // If not authenticated and trying to access protected route
    if (!session && !isAuthPage) {
        const redirectUrl = new URL('/login', request.url);
        return NextResponse.redirect(redirectUrl);
    }

    // If authenticated and trying to access auth pages, redirect to home
    if (session && isAuthPage) {
        const redirectUrl = new URL('/', request.url);
        return NextResponse.redirect(redirectUrl);
    }

    return response;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
