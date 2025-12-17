
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

  const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
  
  // Check if current route is in publicRoutes array
  const isPublicRoute = publicRoutes.some(route => {
    if (route === "/") return nextUrl.pathname === "/";
    return nextUrl.pathname.startsWith(route);
  });
  
  const isAuthRoute = authRoutes.includes(nextUrl.pathname);

  // API auth routes - allow all
  if(isApiAuthRoute) return null;

  // If on auth routes (like /auth/login)
  if(isAuthRoute){
    // If already logged in, redirect to dashboard
    if(isLoggedIn){
      return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
    };
    return null;
  }

  // If NOT logged in AND trying to access non-public routes
  if (!isLoggedIn && !isPublicRoute) {
    return Response.redirect(new URL("/auth/login", nextUrl));
  }

  // If logged in and trying to access public routes, allow it
  // If NOT logged in and trying to access public routes, allow it
  return null;

})

// Optionally, don't invoke Middleware on some paths
export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
}