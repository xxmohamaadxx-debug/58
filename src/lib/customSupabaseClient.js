import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://atrdfmisnbqujdmfrhix.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF0cmRmbWlzbmJxdWpkbWZyaGl4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3NzM2NDYsImV4cCI6MjA3OTM0OTY0Nn0.lLX6EUi5GO06-0oOsnv2UA5W0xn6dgWiBflsaY_ZYh4';

const customSupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

export default customSupabaseClient;

export { 
    customSupabaseClient,
    customSupabaseClient as supabase,
};
