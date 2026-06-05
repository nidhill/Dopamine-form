import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseKey);

export type Registration = {
  id?: string;
  full_name: string;
  what_you_do: string[];
  current_role: string;
  experience_level: string;
  location: string;
  portfolio_link?: string;
  haca_connection: string;
  unique_id?: string;
  created_at?: string;
};
