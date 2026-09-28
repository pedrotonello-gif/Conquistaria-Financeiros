import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, UserPlus, AlertCircle, CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../supabase.Client';

interface RegisterFormProps {
  onSwitchToLogin: () => void;
  onRegisterSuccess: (user: any) => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({
  onSwitchToLogin,
  onRegisterSuccess,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessInfo(null);

    // 1. Validação de preenchimento
    if (!email.trim() || !password || !confirmPassword) {
      setErrorMessage('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    // 2. Validação se as senhas são iguais antes de enviar (Requisito específico)
    if (password !== confirmPassword) {
      setErrorMessage('As senhas não coincidem. Por favor, confirme a mesma senha.');
      return;
    }

    // 3. Validação de comprimento mínimo da senha
    if (password.length < 6) {
      setErrorMessage('A senha deve ter no mínimo 6 caracteres.');
      return;
    }

    if (!isSupabaseConfigured) {
      setErrorMessage('Serviço de autenticação temporariamente indisponível.');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
      });

      if (error) {
        if (error.message.includes('User already registered')) {
          setErrorMessage('Este e-mail já está cadastrado. Faça login ou use outro endereço.');
        } else if (error.message.includes('Password should be at least')) {
          setErrorMessage('A senha precisa ter pelo menos 6 caracteres.');
        } else {
          setErrorMessage(error.message || 'Erro ao realizar o cadastro. Tente novamente.');
        }
        return;
      }

      if (data?.session && data?.user) {
        // Sessão criada instantaneamente (confirmação desativada ou auto-confirm)
        onRegisterSuccess(data.user);
      } else if (data?.user) {
        // Supabase exige confirmação por email
        setSuccessInfo(
          'Conta criada com sucesso! Um e-mail de confirmação foi enviado. Verifique sua caixa de entrada e depois faça login.'
        );
      }
    } catch (err: any) {
      console.error('Erro de cadastro:', err);
      setErrorMessage(err.message || 'Falha de comunicação com o serviço Supabase.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* Título do Card */}
      <div className="text-center mb-6">
        <h2 className="font-luxury text-2xl sm:text-3xl font-bold tracking-wide text-[#3e0817]">
          Criar Nova Conta
        </h2>
        <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent mx-auto mt-2 mb-2" />
        <p className="text-sm text-gray-600">
          Cadastre-se na <strong className="text-[#520d20] font-semibold">CONQUISTARIA</strong>
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

      {/* Alerta de Sucesso */}
      {successInfo && (
        <div className="mb-5 p-3.5 bg-[#f0fdf4] border-l-4 border-emerald-600 rounded-r-lg shadow-sm text-xs sm:text-sm text-emerald-900 flex items-start gap-2.5">
          <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-emerald-600" />
          <div className="flex-1">
            <span className="font-semibold block mb-0.5">Sucesso!</span>
            <p className="mb-2">{successInfo}</p>
            <button
              onClick={onSwitchToLogin}
              className="text-xs font-bold text-emerald-800 underline hover:text-emerald-950 cursor-pointer"
            >
              Ir para a tela de login
            </button>
          </div>
        </div>
      )}

      {/* Formulário */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Campo E-mail */}
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

        {/* Campo Senha */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#3e0817] mb-1.5">
            Senha
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <Lock className="w-4 h-4 text-[#721c2a]" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              autoComplete="new-password"
              placeholder="Mínimo 6 caracteres"
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

        {/* Campo Confirmar Senha */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#3e0817] mb-1.5">
            Confirmar Senha
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <Lock className="w-4 h-4 text-[#721c2a]" />
            </div>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              required
              autoComplete="new-password"
              placeholder="Digite a mesma senha"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`w-full pl-10 pr-11 py-2.5 bg-white rounded-xl border text-gray-800 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 transition-all shadow-xs ${
                confirmPassword && password !== confirmPassword
                  ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-200'
                  : 'border-gray-300 focus:border-[#d4af37] focus:ring-[#d4af37]/25'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-[#721c2a] transition-colors focus:outline-none cursor-pointer"
              title={showConfirmPassword ? 'Ocultar senha' : 'Exibir senha'}
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {confirmPassword && password !== confirmPassword && (
            <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1 font-medium">
              <AlertCircle className="w-3.5 h-3.5" /> As senhas ainda não são iguais
            </p>
          )}
          {confirmPassword && password === confirmPassword && (
            <p className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" /> Senhas coincidem perfeitamente
            </p>
          )}
        </div>

        {/* Botão Cadastrar */}
        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-[#4a0e1e] via-[#661329] to-[#4a0e1e] hover:from-[#5c1125] hover:via-[#7c1732] hover:to-[#5c1125] text-white font-medium text-sm rounded-xl border border-[#d4af37]/50 shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-[#d4af37]" />
              <span>Cadastrando...</span>
            </>
          ) : (
            <>
              <UserPlus className="w-4 h-4 text-[#d4af37] group-hover:scale-110 transition-transform" />
              <span className="font-semibold tracking-wide">Cadastrar</span>
            </>
          )}
        </button>
      </form>

      {/* Separador e Link para Acessar */}
      <div className="mt-6 pt-5 border-t border-gray-100 text-center">
        <p className="text-sm text-gray-600">
          Já possui uma conta?{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="font-bold text-[#661329] hover:text-[#881337] underline underline-offset-4 decoration-[#d4af37] hover:decoration-2 transition-all cursor-pointer"
          >
            Acessar agora
          </button>
        </p>
      </div>
    </div>
  );
};
