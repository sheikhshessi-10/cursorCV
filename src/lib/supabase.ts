
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vmwlbtiwgggnoccgmoiq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtd2xidGl3Z2dnbm9jY2dtb2lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwODQ3NTAsImV4cCI6MjA3MTY2MDc1MH0.hTv5kM-dF_ipgXCqSXoz5tOJrh3X4w2XA7u64sn95Xc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    flowType: 'pkce',
    autoRefreshToken: true,
    persistSession: true
  }
});
