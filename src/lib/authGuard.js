// src/lib/authGuard.js
import { createClient } from '@supabase/supabase-js';

export function getAuthClient() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const key = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';
  return createClient(url, key, {
    auth: { persistSession: false },
  });
}
export function isUserAdmin(user) {
  if (!user) return false;
  
  // حماية صارمة: منع أي حساب غير مفعل الإيميل من ادعاء صلاحيات الإدارة
  const isEmailConfirmed = Boolean(user.email_confirmed_at || user.confirmed_at);
  if (!isEmailConfirmed) return false;

  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  // Only app_metadata is trusted because user_metadata can be modified by the user directly in Supabase
  const isAdminRole = user.app_metadata?.role === 'admin';
  const isEmailMatch = Boolean(adminEmail && user.email?.trim().toLowerCase() === adminEmail);

  return Boolean(isAdminRole || isEmailMatch);
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
