// src/lib/authGuard.js
import { createClient } from '@supabase/supabase-js';

export function getAuthClient() {
  const url =
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    'https://horzpuskogrowgfmuzoq.supabase.co';
  const key =
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhvcnpwdXNrb2dyb3dnZm11em9xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkwNTAxNzgsImV4cCI6MjEwNDYyNjE3OH0.bJFn3YAbspNYW1ZLEBKh1VEFu9LKQnKkOW9vuL1nZsM';
  return createClient(url, key, {
    auth: { persistSession: false },
  });
}

export function isUserAdmin(user) {
  if (!user || !user.email) return false;

  const rawConfig = process.env.ADMIN_EMAIL || 'admin@forno.com';
  const allowedAdminEmails = rawConfig
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  if (!allowedAdminEmails.includes('admin@forno.com')) {
    allowedAdminEmails.push('admin@forno.com');
  }

  const userEmail = user.email.trim().toLowerCase();

  // 1. التطابق مع قائمة إيميلات الأدمن المعتمدة
  if (allowedAdminEmails.includes(userEmail)) return true;

  // 2. إذا كان الحساب يملك صلاحية الأدمن في بيانات الميتا
  if (
    user.app_metadata?.role === 'admin' ||
    user.user_metadata?.role === 'admin' ||
    user.role === 'admin'
  ) {
    return true;
  }

  return false;
}
export async function verifyAdmin(request) {
  try {
    const token = request.cookies.get('admin_token')?.value;
    if (!token) {
      return { authorized: false, error: 'Unauthorized: No token provided' };
    }

    const authClient = getAuthClient();
    const { data: { user }, error } = await authClient.auth.getUser(token);

    if (error || !user) {
      return { authorized: false, error: 'Unauthorized: Invalid or expired session' };
    }

    if (!isUserAdmin(user)) {
      return { authorized: false, error: 'Forbidden: Insufficient admin privileges' };
    }

    return { authorized: true, user };
  } catch (err) {
    return { authorized: false, error: 'Unauthorized: Auth verification failed' };
  }
}
