import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// Allow various educational domain formats
// Examples: .edu, .edu.in, .ac.in, etc.
export const ALLOWED_DOMAINS = ['edu', 'edu.in', 'ac.in', 'edu.pk', 'ac.uk', 'com'];

export const validateEmailDomain = (email: string): boolean => {
  // Basic email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return false;
  }

  const domain = email.split('@')[1]?.toLowerCase() || '';
  
  // Check if domain ends with any of the allowed educational domains
  return ALLOWED_DOMAINS.some(allowed => domain.endsWith(`.${allowed}`) || domain === allowed);
};

export const uploadFile = async (
  bucket: 'id-cards' | 'avatars' | 'post-images',
  file: File,
  userId: string
): Promise<string | null> => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}/${Date.now()}.${fileExt}`;

  const { error } = await supabase.storage.from(bucket).upload(fileName, file, {
    cacheControl: '3600',
    upsert: true,
  });

  if (error) {
    console.error('Upload error:', error);
    return null;
  }

  const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(fileName);
  return publicUrl;
};
