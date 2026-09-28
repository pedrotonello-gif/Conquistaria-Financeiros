import { createClient } from '@supabase/supabase-js';

// ============================================================================
// CONFIGURAÇÃO DO SUPABASE - CONQUISTARIA
// ============================================================================

/**
 * Normaliza a URL do Supabase para garantir que a baseURL funcione
 * corretamente para Auth (/auth/v1) e Banco de Dados (/rest/v1),
 * mesmo que tenha sido copiada com "/rest/v1/".
 */
export function normalizeSupabaseUrl(rawUrl: string): string {
  if (!rawUrl) return '';
  let cleanUrl = rawUrl.trim();
  // Remove /rest/v1 ou /rest/v1/ no final, se existir
  cleanUrl = cleanUrl.replace(/\/rest\/v1\/?$/, '');
  // Remove barras no final
  cleanUrl = cleanUrl.replace(/\/+$/, '');
  return cleanUrl;
}

const rawUrl =
  (typeof window !== 'undefined' && localStorage.getItem('custom_supabase_url')) ||
  import.meta.env.VITE_SUPABASE_URL ||
  'https://yqrrgvrduescqkpxexju.supabase.co';

export const supabaseUrl: string = normalizeSupabaseUrl(rawUrl);

export const supabaseAnonKey: string =
  (typeof window !== 'undefined' && localStorage.getItem('custom_supabase_anon_key')) ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'sb_publishable_M8-6or7kOA5fkxc261ow3w_DzpgHioI';

/**
 * Verifica se as credenciais foram preenchidas com valores reais
 */
export const isSupabaseConfigured: boolean = Boolean(
  supabaseUrl &&
  supabaseUrl.trim() !== '' &&
  !supabaseUrl.includes('SEU-PROJETO') &&
  supabaseAnonKey &&
  supabaseAnonKey.trim() !== '' &&
  !supabaseAnonKey.includes('SUA_CHAVE_ANON')
);

// Criação e exportação da instância oficial do cliente Supabase
export const supabase = createClient(
  supabaseUrl.startsWith('http') ? supabaseUrl : 'https://yqrrgvrduescqkpxexju.supabase.co',
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);

/**
 * Utilitário para atualizar credenciais pela interface caso necessário
 */
export function setDynamicSupabaseCredentials(url: string, key: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('custom_supabase_url', normalizeSupabaseUrl(url.trim()));
    localStorage.setItem('custom_supabase_anon_key', key.trim());
    window.location.reload();
  }
}

export function clearDynamicSupabaseCredentials() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('custom_supabase_url');
    localStorage.removeItem('custom_supabase_anon_key');
    window.location.reload();
  }
}
