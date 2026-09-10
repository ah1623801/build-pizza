// src/lib/supabaseServer.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables on server.');
}

// هذا العميل يعمل حصرياً على السيرفر ويمتلك صلاحية الإدارة الكاملة بأمان تام
export const supabaseServer = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false, // بدون تخزين كوكيز متصفح، لأن كل العمليات تتم من السيرفر مباشرة
  },
});