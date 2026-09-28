import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, LogIn, AlertCircle, Loader2, Sparkles } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../supabase.Client';

interface LoginFormProps {
  onSwitchToRegister: () => void;
  onLoginSuccess: (user: any) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSwitchToRegister,
  onLoginSuccess,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validação básica
    if (!email.trim() || !password) {
      setErrorMessage('Por favor, preencha todos os campos.');
      return;
    }

    if (!isSupabaseConfigured) {
      setErrorMessage('Serviço de autenticação temporariamente indisponível.');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (error) {
        // Tratamento amigável de erros do Supabase
        if (error.message.includes('Invalid login credentials')) {
          setErrorMessage('Senha incorreta ou e-mail não cadastrado. Verifique suas credenciais.');
        } else if (error.message.includes('Email not confirmed')) {
          setErrorMessage('E-mail ainda não confirmado. Verifique a caixa de entrada do seu e-mail.');
        } else {
          setErrorMessage(error.message || 'Erro ao realizar login. Tente novamente.');
        }
        return;
      }

      if (data?.user) {
        onLoginSuccess(data.user);
      }
    } catch (err: any) {
      console.error('Erro de login:', err);
      setErrorMessage(err.message || 'Falha de conexão com o servidor de autenticação.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* Título do Card */}
      <div className="text-center mb-6">
        <h2 className="font-luxury text-2xl sm:text-3xl font-bold tracking-wide text-[#3e0817]">
          Acesse sua Conta
        </h2>
        <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent mx-auto mt-2 mb-2" />
        <p className="text-sm text-gray-600">
          Entre na <strong className="text-[#520d20] font-semibold">CONQUISTARIA</strong> com seu e-mail e senha
        </p>
      </div>

      {/* Alerta de Erro */}
      {errorMessage && (
        <div className="mb-5 p-3.5 bg-[#fff1f2] border-l-4 border-[#881337] rounded-r-lg shadow-sm text-xs sm:text-sm text-[#881337] flex items-start gap-2.5 animate-shake">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-[#881337]" />
          <div className="flex-1">
            <span className="font-semibold block mb-0.5">Atenção</span>
            <span>{errorMessage}</span>
          </div>
        </div>
      )}

      {/* Formulário */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Campo de E-mail */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#3e0817] mb-1.5">
            E-mail
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <Mail className="w-4 h-4 text-[#721c2a]" />
            </div>
            <input
              type="email"
              required
              autoComplete="email"
              placeholder="seuemail@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white rounded-xl border border-gray-300 text-gray-800 placeholder-gray-400 text-sm focus:outline-none focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/25 transition-all shadow-xs"
            />
          </div>
        </div>

        {/* Campo de Senha */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#3e0817]">
              Senha
            </label>
            <span className="text-[11px] text-gray-500">Mínimo 6 caracteres</span>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <Lock className="w-4 h-4 text-[#721c2a]" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-11 py-2.5 bg-white rounded-xl border border-gray-300 text-gray-800 placeholder-gray-400 text-sm focus:outline-none focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/25 transition-all shadow-xs"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-[#721c2a] transition-colors focus:outline-none cursor-pointer"
              title={showPassword ? 'Ocultar senha' : 'Exibir senha'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Botão Acessar */}
        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-[#4a0e1e] via-[#661329] to-[#4a0e1e] hover:from-[#5c1125] hover:via-[#7c1732] hover:to-[#5c1125] text-white font-medium text-sm rounded-xl border border-[#d4af37]/50 shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-[#d4af37]" />
              <span>Autenticando...</span>
            </>
          ) : (
            <>
              <LogIn className="w-4 h-4 text-[#d4af37] group-hover:translate-x-0.5 transition-transform" />
              <span className="font-semibold tracking-wide">Acessar</span>
            </>
          )}
        </button>
      </form>

      {/* Separador e Link para Cadastrar */}
      <div className="mt-6 pt-5 border-t border-gray-100 text-center">
        <p className="text-sm text-gray-600">
          Não tem uma conta?{' '}
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="font-bold text-[#661329] hover:text-[#881337] underline underline-offset-4 decoration-[#d4af37] hover:decoration-2 transition-all cursor-pointer"
          >
            Cadastrar-se agora
          </button>
        </p>
      </div>
    </div>
  );
};
