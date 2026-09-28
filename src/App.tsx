/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthLayout } from './components/AuthLayout';
import { LoginForm } from './components/LoginForm';
import { RegisterForm } from './components/RegisterForm';
import { WelcomeScreen } from './components/WelcomeScreen';
import { supabase, isSupabaseConfigured } from './supabase.Client';
import { Sparkles } from 'lucide-react';

export default function App() {
  // 'login' | 'register'
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  // Usuário autenticado
  const [user, setUser] = useState<any>(null);
  // Estado de carregamento inicial
  const [initialLoading, setInitialLoading] = useState(true);

  // Hook useEffect para gerenciar o estado da sessão no Supabase
  useEffect(() => {
    // 1. Obter sessão ativa no carregamento da página
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setInitialLoading(false);
    }).catch((err) => {
      console.warn('Supabase getSession aviso:', err);
      setInitialLoading(false);
    });

    // 2. Ouvinte em tempo real para mudanças no estado de autenticação (Sign In, Sign Out, Token Refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    // Limpeza da subscrição ao desmontar o componente
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Login de simulação para permitir testar a interface imediatamente mesmo sem chaves ativas
  const handleSimulateDemoLogin = () => {
    setUser({
      id: 'demo-user-12345',
      email: 'demo@elegance.com',
      last_sign_in_at: new Date().toISOString(),
    });
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-[#240610] flex flex-col items-center justify-center text-white">
        <div className="w-12 h-12 rounded-full border-2 border-[#d4af37] border-t-transparent animate-spin mb-4" />
        <p className="font-luxury text-sm tracking-widest text-[#f5e6b3] uppercase">Carregando...</p>
      </div>
    );
  }

  return (
    <AuthLayout wide={Boolean(user)}>
      {/* Se o usuário estiver autenticado, exibe a tela de "Bem-vindo (a)!" */}
      {user ? (
        <WelcomeScreen
          user={user}
          onSignOut={() => setUser(null)}
        />
      ) : (
        <>
          {/* Seletor visual das abas de Login e Cadastro */}
          <div className="flex rounded-xl p-1 bg-gray-100 mb-6 border border-gray-200">
            <button
              type="button"
              onClick={() => setAuthMode('login')}
              className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                authMode === 'login'
                  ? 'bg-gradient-to-r from-[#4a0e1e] to-[#661329] text-white shadow-sm'
                  : 'text-gray-600 hover:text-[#4a0e1e]'
              }`}
            >
              Acessar
            </button>
            <button
              type="button"
              onClick={() => setAuthMode('register')}
              className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                authMode === 'register'
                  ? 'bg-gradient-to-r from-[#4a0e1e] to-[#661329] text-white shadow-sm'
                  : 'text-gray-600 hover:text-[#4a0e1e]'
              }`}
            >
              Cadastrar
            </button>
          </div>

          {/* Renderização condicional do formulário */}
          {authMode === 'login' ? (
            <LoginForm
              onSwitchToRegister={() => setAuthMode('register')}
              onLoginSuccess={(loggedUser) => setUser(loggedUser)}
            />
          ) : (
            <RegisterForm
              onSwitchToLogin={() => setAuthMode('login')}
              onRegisterSuccess={(registeredUser) => setUser(registeredUser)}
            />
          )}

          {/* Demonstração rápida caso as chaves não estejam configuradas */}
          {!isSupabaseConfigured && (
            <div className="mt-4 pt-3 border-t border-dashed border-gray-200 text-center">
              <button
                type="button"
                onClick={handleSimulateDemoLogin}
                className="text-[11px] font-semibold text-[#881337] hover:text-[#520d20] inline-flex items-center gap-1.5 transition-colors cursor-pointer py-1 px-2.5 rounded-lg hover:bg-rose-50"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#d4af37]" />
                Testar fluxo com Login de Demonstração
              </button>
            </div>
          )}
        </>
      )}
    </AuthLayout>
  );
}
