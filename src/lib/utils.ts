import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { UserProfileDataOutput } from '@/ai/schemas/user-profile-schemas';
import { supabase } from './supabase';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export interface UserProfileWithMeta extends UserProfileDataOutput {
  createdAt?: string;
  id: string;
  [key: string]: any;
}

/**
 * 获取用户所有画像（按创建时间倒序）
 */
export async function getUserProfiles(email: string): Promise<UserProfileWithMeta[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', email)
    .order('created_at', { ascending: false });
  if (error || !data) return [];
  return data as UserProfileWithMeta[];
}

/**
 * 获取用户最新画像（无则返回null）
 */
export async function getUserProfile(email: string): Promise<UserProfileWithMeta | null> {
  const profiles = await getUserProfiles(email);
  return profiles[0] || null;
}
