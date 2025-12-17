
import NextAuth from "next-auth"

import authConfig from "./auth.config"

import {
  publicRoutes,
  authRoutes,
  apiAuthPrefix,
  DEFAULT_LOGIN_REDIRECT,
} from "@/routes"




const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  const pathname = nextUrl.pathname;
  
  console.log('🔍 [Middleware] Path:', pathname, '| Logged In:', isLoggedIn);

  const isApiAuthRoute = pathname.startsWith(apiAuthPrefix);
  const isAuthRoute = authRoutes.includes(pathname);

  // Directly protect /dashboard and all admin routes
  const isAdminRoute = pathname.startsWith('/dashboard') || 
                       pathname.startsWith('/admin') ||
                       pathname.startsWith('/(admin)');

  // Check if it's a public route
  const isPublicRoute = publicRoutes.includes(pathname) || 
    publicRoutes.some(route => {
      if (route === "/") return pathname === "/";
      return pathname.startsWith(route + "/") || pathname === route;
    });

  console.log('  API:', isApiAuthRoute, '| Auth:', isAuthRoute, '| Admin:', isAdminRoute, '| Public:', isPublicRoute);

  // 1. Allow API auth routes
  if(isApiAuthRoute) {
    console.log('  ✅ API Auth - Allow');
    return null;
  }

  // 2. Auth routes (login page)
  if(isAuthRoute){
    if(isLoggedIn){
      console.log('  🔄 Logged in, redirect to dashboard');
      return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
    }
    console.log('  ✅ Login page - Allow');
    return null;
  }

  // 3. Admin routes - MUST be logged in
  if(isAdminRoute) {
    if(!isLoggedIn) {
      console.log('  🔴 Admin route NOT logged in - Redirect to login');
      return Response.redirect(new URL("/auth/login", nextUrl));
    }
    console.log('  ✅ Admin route logged in - Allow');
    return null;
  }

  // 4. Public routes - everyone allowed
  if(isPublicRoute) {
    console.log('  ✅ Public route - Allow');
    return null;
  }

  // 5. Default: deny if not logged in
  if(!isLoggedIn) {
    console.log('  🔴 Protected, not logged in - Redirect to login');
    return Response.redirect(new URL("/auth/login", nextUrl));
  }

  console.log('  ✅ Default - Allow');
  return null;

})

// Optionally, don't invoke Middleware on some paths
export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
}