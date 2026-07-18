import { defineMiddleware } from 'astro:middleware';

import { getSession } from './lib/session';

// Route guard for the admin dashboard (#30). Every path under /admin/*
// requires a valid session EXCEPT the login route itself — that page
// handles both GET (render the form) and POST (verify credentials) at the
// same URL, and must stay reachable while logged out, or nobody could
// ever log in.
//
// This deliberately does NOT touch /api/* — those are the public,
// unauthenticated submission endpoints (#28); see
// backend/astro.config.mjs for why they keep security.checkOrigin: false.
const PUBLIC_ADMIN_PATHS = new Set(['/admin/login']);

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  if (!pathname.startsWith('/admin') || PUBLIC_ADMIN_PATHS.has(pathname)) {
    return next();
  }

  const user = await getSession(context.cookies);
  if (!user) {
    return context.redirect('/admin/login');
  }

  context.locals.user = user;
  return next();
});
