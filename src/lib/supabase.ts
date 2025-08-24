
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yotixyqirogrzhvngvbm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlvdGl4eXFpcm9ncnpodm5ndmJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU4MTY3NTMsImV4cCI6MjA1MTM5Mjc1M30.Qy6QVHhDjYNmKBqrh4tHQwPgGGAK0qPbR0cCJlQu4MI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    flowType: 'pkce',
    autoRefreshToken: true,
    persistSession: true
  }
});
