import React, { useState, useEffect } from 'react';
import {
  LogOut,
  Sparkles,
  User,
  CheckCircle2,
  RefreshCw,
  PlusCircle,
} from 'lucide-react';
import { supabase } from '../supabase.Client';
import { FinancialTransaction } from '../types/finance';
import { FinancialSummary } from './FinancialSummary';
import { FinancialCharts } from './FinancialCharts';
import { TransactionList } from './TransactionList';
import { TransactionModal } from './TransactionModal';

interface WelcomeScreenProps {
  user: any;
  onSignOut: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ user, onSignOut }) => {
  const [loading, setLoading] = useState(false);
  // Inicializa zerado sem dados de exemplo: o cliente irá colocar suas próprias informações
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Mês padrão: Setembro (índice 8) de 2026
  const [mesSelecionado, setMesSelecionado] = useState<number>(8); // 8 = Setembro
  const [anoSelecionado, setAnoSelecionado] = useState<number>(2026);

  // Controle do Modal de Transações
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transactionToEdit, setTransactionToEdit] = useState<FinancialTransaction | null>(null);

  // Carregar transações reais do Supabase
  const carregarTransacoes = async () => {
    if (!user?.id) {
      setTransactions([]);
      return;
    }

    setIsRefreshing(true);
    try {
      // Defesa em profundidade: além do RLS do Supabase, filtramos explicitamente por user_id
      const { data, error } = await supabase
        .from('transacoes_financeiras')
        .select('*')
        .eq('user_id', user.id)
        .order('transaction_date', { ascending: false });

      if (error) {
        console.warn('Consulta ao Supabase:', error.message);
        // Se houver dados salvos pelo usuário localmente, carrega-os, senão permanece vazio []
        const local = localStorage.getItem(`conquistaria_transacoes_${user.id}`);
        if (local) {
          try {
            const parsed = JSON.parse(local);
            // Ignora dados antigos que eram de demonstração
            const limpos = parsed.filter((t: any) => !t.id?.startsWith('demo-'));
            setTransactions(limpos);
          } catch {
            setTransactions([]);
          }
        } else {
          setTransactions([]);
        }
      } else if (data) {
        setTransactions(data);
        salvarBackupLocal(data);
      } else {
        setTransactions([]);
      }
    } catch (err) {
      console.warn('Erro ao carregar transações:', err);
      const local = localStorage.getItem(`conquistaria_transacoes_${user.id}`);
      if (local) {
        try {
          const parsed = JSON.parse(local);
          const limpos = parsed.filter((t: any) => !t.id?.startsWith('demo-'));
          setTransactions(limpos);
        } catch {
          setTransactions([]);
        }
      } else {
        setTransactions([]);
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    // Limpeza preventiva de qualquer dado mock anterior
    if (typeof window !== 'undefined' && user?.id) {
      const key = `conquistaria_transacoes_${user.id}`;
      const local = localStorage.getItem(key);
      if (local && local.includes('demo-')) {
        try {
          const parsed = JSON.parse(local);
          const limpos = parsed.filter((t: any) => !t.id?.startsWith('demo-'));
          localStorage.setItem(key, JSON.stringify(limpos));
        } catch {
          localStorage.removeItem(key);
        }
      }
    }
    carregarTransacoes();
  }, [user]);

  // Salva no localStorage como backup persistente isolado por usuário
  const salvarBackupLocal = (novasTransacoes: FinancialTransaction[]) => {
    if (typeof window !== 'undefined' && user?.id) {
      localStorage.setItem(
        `conquistaria_transacoes_${user.id}`,
        JSON.stringify(novasTransacoes)
      );
    }
  };

  // Filtrar transações pelo mês e ano selecionados
  const transacoesDoMes = transactions.filter((t) => {
    if (!t.transaction_date) return false;
    const [anoStr, mesStr] = t.transaction_date.split('-');
    const ano = Number(anoStr);
    const mes = Number(mesStr) - 1; // 0-indexed
    return ano === anoSelecionado && mes === mesSelecionado;
  });

  // Cálculos financeiros do mês
  const receitasMes = transacoesDoMes.filter((t) => t.type === 'receita');
  const despesasMes = transacoesDoMes.filter((t) => t.type === 'despesa');

  const totalReceitas = receitasMes.reduce((acc, t) => acc + t.amount, 0);
  const totalDespesas = despesasMes.reduce((acc, t) => acc + t.amount, 0);
  const saldoLiquido = totalReceitas - totalDespesas;

  // Taxa de Economia: ((Receitas - Despesas) / Receitas) * 100
  const taxaEconomia =
    totalReceitas > 0 ? Math.max(((totalReceitas - totalDespesas) / totalReceitas) * 100, 0) : 0;

  // Salvar nova transação ou atualizar existente com proteção multi-inquilino (tenant isolation)
  const handleSaveTransaction = async (
    tData: Omit<FinancialTransaction, 'id'>,
    id?: string
  ) => {
    if (!user?.id) return;

    if (id) {
      // Edição: Garante que a atualização é restrita ao id E ao user_id do usuário logado
      const updated = transactions.map((t) => (t.id === id ? { ...t, ...tData, user_id: user.id } : t));
      setTransactions(updated);
      salvarBackupLocal(updated);

      try {
        await supabase
          .from('transacoes_financeiras')
          .update({
            description: tData.description,
            amount: tData.amount,
            type: tData.type,
            category: tData.category,
            transaction_date: tData.transaction_date,
          })
          .eq('id', id)
          .eq('user_id', user.id);
      } catch (err) {
        console.warn('Erro ao atualizar no Supabase:', err);
      }
    } else {
      // Criação de Nova Transação: injeta o user_id autenticado
      const newTransaction: FinancialTransaction = {
        id: `tx-${Date.now()}`,
        user_id: user.id,
        ...tData,
      };

      const updated = [newTransaction, ...transactions];
      setTransactions(updated);
      salvarBackupLocal(updated);

      try {
        const { data, error } = await supabase
          .from('transacoes_financeiras')
          .insert([
            {
              user_id: user.id,
              description: tData.description,
              amount: tData.amount,
              type: tData.type,
              category: tData.category,
              transaction_date: tData.transaction_date,
            },
          ])
          .select();

        if (data && data[0]) {
          setTransactions((prev) =>
            prev.map((t) => (t.id === newTransaction.id ? { ...t, id: data[0].id } : t))
          );
        }
      } catch (err) {
        console.warn('Erro ao inserir no Supabase:', err);
      }
    }
  };

  // Excluir transação: Garante que a exclusão é restrita ao id E ao user_id
  const handleDeleteTransaction = async (id: string) => {
    if (!user?.id) return;

    const updated = transactions.filter((t) => t.id !== id);
    setTransactions(updated);
    salvarBackupLocal(updated);

    try {
      await supabase
        .from('transacoes_financeiras')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
    } catch (err) {
      console.warn('Erro ao excluir no Supabase:', err);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
      setTransactions([]);
    } catch (err) {
      console.error('Erro ao sair:', err);
    } finally {
      setLoading(false);
      onSignOut();
    }
  };

  return (
    <div className="w-full space-y-4 sm:space-y-6">
      {/* Topbar do Usuário Autenticado */}
      <div className="flex items-center justify-between gap-2 pb-3 sm:pb-4 border-b border-[#d4af37]/30">
        {/* Saudação e Usuário */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[#520d20] border border-[#d4af37] text-[#d4af37] flex items-center justify-center font-bold text-sm sm:text-base shadow-sm shrink-0">
            {(user?.email?.[0] || 'U').toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-luxury text-sm sm:text-base font-bold text-[#3e0817] truncate">
                Bem-vindo(a)!
              </span>
              <span className="hidden sm:inline-block text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-[#f8f1de] text-[#785b14] border border-[#d4af37]/40">
                Conquistaria Pro
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-gray-500 font-medium truncate max-w-[130px] sm:max-w-md">
              {user?.email || 'usuario@exemplo.com'}
            </p>
          </div>
        </div>

        {/* Status "LOGADO" em verde e Botão de Sair */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Tag "LOGADO" em verde (indicando conexão ativa com o Supabase) */}
          <div className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-300 text-[10px] sm:text-xs font-bold tracking-wider shadow-2xs">
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>LOGADO</span>
          </div>

          {/* Botão para sincronizar dados */}
          <button
            type="button"
            onClick={carregarTransacoes}
            disabled={isRefreshing}
            className="p-1.5 sm:p-2 text-gray-500 hover:text-[#520d20] hover:bg-gray-100 rounded-lg sm:rounded-xl transition-colors cursor-pointer disabled:opacity-50 touch-manipulation"
            title="Atualizar dados do Supabase"
          >
            <RefreshCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isRefreshing ? 'animate-spin text-[#d4af37]' : ''}`} />
          </button>

          {/* Botão Sair */}
          <button
            type="button"
            onClick={handleSignOut}
            disabled={loading}
            className="py-1 sm:py-1.5 px-2.5 sm:px-3.5 bg-rose-50 hover:bg-rose-100 text-[#881337] border border-rose-200 hover:border-rose-300 font-semibold text-[11px] sm:text-xs rounded-lg sm:rounded-xl transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50 shadow-2xs touch-manipulation"
            title="Sair da Conta (Sign Out)"
          >
            <LogOut className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#881337]" />
            <span>Sair</span>
          </button>
        </div>
      </div>

      {/* 1. SEÇÃO DE CARDS DE RESUMO (Saldo Líquido, Período, Entradas, Saídas, Taxa de Economia) */}
      <FinancialSummary
        saldoLiquido={saldoLiquido}
        totalReceitas={totalReceitas}
        totalDespesas={totalDespesas}
        qtdReceitas={receitasMes.length}
        qtdDespesas={despesasMes.length}
        taxaEconomia={taxaEconomia}
        mesSelecionado={mesSelecionado}
        anoSelecionado={anoSelecionado}
        onMudarMes={(novoMes, novoAno) => {
          setMesSelecionado(novoMes);
          setAnoSelecionado(novoAno);
        }}
      />

      {/* 2. SEÇÃO DE ANÁLISE VISUAL COM GRÁFICOS */}
      <FinancialCharts
        transactions={transacoesDoMes}
        totalReceitas={totalReceitas}
        totalDespesas={totalDespesas}
        mesSelecionado={mesSelecionado}
        anoSelecionado={anoSelecionado}
      />

      {/* 3. SEÇÃO DE HISTÓRICO DE TRANSAÇÕES (Com Edição, Exclusão, Filtros e Exportação Excel) */}
      <TransactionList
        transactions={transacoesDoMes}
        mesSelecionado={mesSelecionado}
        anoSelecionado={anoSelecionado}
        onAddNew={() => {
          setTransactionToEdit(null);
          setIsModalOpen(true);
        }}
        onEdit={(transaction) => {
          setTransactionToEdit(transaction);
          setIsModalOpen(true);
        }}
        onDelete={handleDeleteTransaction}
      />

      {/* Modal de Criação / Edição de Transação */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setTransactionToEdit(null);
        }}
        onSave={handleSaveTransaction}
        transactionToEdit={transactionToEdit}
      />
    </div>
  );
};
