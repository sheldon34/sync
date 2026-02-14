import { createClient } from '@supabase/supabase-js';

const FALLBACK_URL = 'https://ogzhpmvojrflawvsvfpi.supabase.co';
const FALLBACK_KEY = 'sb_publishable_ri8jW9YofzaUn3PRjBOHDQ_L48FGZjV';

// Safely access Vite env vars, falling back to provided constants if running without build/env injection
const getEnv = (key: string, fallback: string) => {
  try {
    // @ts-ignore - Supresses TS error if import.meta is not defined in tsconfig
    return import.meta.env?.[key] || fallback;
  } catch {
    return fallback;
  }
};

const supabaseUrl = getEnv('VITE_SUPABASE_URL', FALLBACK_URL);
const supabaseKey = getEnv('VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY', FALLBACK_KEY);

export const supabase = createClient(supabaseUrl, supabaseKey);
