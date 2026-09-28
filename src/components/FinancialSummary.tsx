import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  PiggyBank,
  ChevronLeft,
  ChevronRight,
  Calendar,
} from 'lucide-react';
import { MESES_PTBR } from '../types/finance';

interface FinancialSummaryProps {
  saldoLiquido: number;
  totalReceitas: number;
  totalDespesas: number;
  qtdReceitas: number;
  qtdDespesas: number;
  taxaEconomia: number;
  mesSelecionado: number; // 0 a 11
  anoSelecionado: number;
  onMudarMes: (novoMes: number, novoAno: number) => void;
}

export const FinancialSummary: React.FC<FinancialSummaryProps> = ({
  saldoLiquido,
  totalReceitas,
  totalDespesas,
  qtdReceitas,
  qtdDespesas,
  taxaEconomia,
  mesSelecionado,
  anoSelecionado,
  onMudarMes,
}) => {
  const isSuperavit = saldoLiquido >= 0;
  const nomeMes = MESES_PTBR[mesSelecionado] || 'Setembro';

  const handleMesAnterior = () => {
    if (mesSelecionado === 0) {
      onMudarMes(11, anoSelecionado - 1);
    } else {
      onMudarMes(mesSelecionado - 1, anoSelecionado);
    }
  };

  const handleProximoMes = () => {
    if (mesSelecionado === 11) {
      onMudarMes(0, anoSelecionado + 1);
    } else {
      onMudarMes(mesSelecionado + 1, anoSelecionado);
    }
  };

  // Anos disponíveis para seleção rápida
  const anosDisponiveis = [2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030];

  const formatarMoeda = (val: number) => {
    return val.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Barra de Seleção de Período: Otimizada para Mobile e Desktop */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 p-3 sm:p-3.5 bg-gradient-to-r from-[#2e0714] via-[#430a1c] to-[#2e0714] border border-[#d4af37]/40 rounded-xl sm:rounded-2xl shadow-sm text-white">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#d4af37]/20 border border-[#d4af37] flex items-center justify-center text-[#d4af37] shrink-0">
            <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
          <div>
            <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-widest text-[#f5e6b3] block">
              Período de Análise
            </span>
            <span className="text-xs sm:text-sm font-luxury font-bold text-white tracking-wide">
              {nomeMes} de {anoSelecionado}
            </span>
          </div>
        </div>

        {/* Controles de Navegação de Meses e Anos (Touch Friendly) */}
        <div className="flex items-center justify-between sm:justify-end gap-1 bg-black/30 p-1 rounded-xl border border-[#d4af37]/30">
          <button
            type="button"
            onClick={handleMesAnterior}
            className="p-2 sm:p-1.5 rounded-lg hover:bg-white/10 text-[#d4af37] active:scale-95 transition-all cursor-pointer touch-manipulation"
            title="Mês Anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Select de Mês */}
          <select
            value={mesSelecionado}
            onChange={(e) => onMudarMes(Number(e.target.value), anoSelecionado)}
            className="bg-transparent text-xs font-semibold text-[#f5e6b3] px-2 py-1.5 outline-none cursor-pointer focus:bg-[#430a1c] rounded"
          >
            {MESES_PTBR.map((mes, idx) => (
              <option key={mes} value={idx} className="bg-[#2e0714] text-white">
                {mes}
              </option>
            ))}
          </select>

          {/* Select de Ano */}
          <select
            value={anoSelecionado}
            onChange={(e) => onMudarMes(mesSelecionado, Number(e.target.value))}
            className="bg-transparent text-xs font-semibold text-[#f5e6b3] px-2 py-1.5 outline-none cursor-pointer focus:bg-[#430a1c] rounded"
          >
            {anosDisponiveis.map((ano) => (
              <option key={ano} value={ano} className="bg-[#2e0714] text-white">
                {ano}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={handleProximoMes}
            className="p-2 sm:p-1.5 rounded-lg hover:bg-white/10 text-[#d4af37] active:scale-95 transition-all cursor-pointer touch-manipulation"
            title="Próximo Mês"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Grid de 4 Cards de Resumo: 2 colunas em mobile e 4 no desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3.5">
        {/* Card 1: Saldo Líquido (+ Superávit ou - Déficit) */}
        <div className="relative p-3 sm:p-5 rounded-xl sm:rounded-2xl bg-white border sm:border-2 border-[#d4af37]/40 shadow-xs sm:shadow-md hover:shadow-lg transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1.5 sm:mb-2">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-gray-600 truncate">
                Saldo Líquido
              </span>
              <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl shrink-0 flex items-center justify-center ${
                isSuperavit ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-[#881337] border border-rose-200'
              }`}>
                <Wallet className="w-3 h-3 sm:w-4 sm:h-4" />
              </div>
            </div>

            <div className="text-base sm:text-2xl font-black text-[#2e0714] tracking-tight truncate">
              {formatarMoeda(saldoLiquido)}
            </div>
          </div>

          <div className="mt-2 flex items-center gap-1 flex-wrap">
            <span
              className={`inline-flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2.5 py-0.5 rounded-full text-[9px] sm:text-xs font-bold tracking-wide ${
                isSuperavit
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-rose-100 text-[#881337] border border-rose-300'
              }`}
            >
              {isSuperavit ? (
                <>
                  <TrendingUp className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />
                  + Superávit
                </>
              ) : (
                <>
                  <TrendingDown className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />
                  - Déficit
                </>
              )}
            </span>
          </div>
        </div>

        {/* Card 2: Entradas (Receitas) */}
        <div className="relative p-3 sm:p-5 rounded-xl sm:rounded-2xl bg-white border border-gray-200 hover:border-emerald-300 shadow-xs sm:shadow-sm transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1.5 sm:mb-2">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-gray-600 truncate">
                Entradas
              </span>
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 shrink-0 flex items-center justify-center">
                <ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4" />
              </div>
            </div>

            <div className="text-base sm:text-2xl font-black text-emerald-700 tracking-tight truncate">
              {formatarMoeda(totalReceitas)}
            </div>
          </div>

          <div className="mt-2 text-[10px] sm:text-xs text-gray-500 flex items-center gap-1 truncate">
            <span className="font-semibold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
              {qtdReceitas}
            </span>
            <span className="hidden sm:inline">registros recebidos</span>
            <span className="sm:hidden">recebidos</span>
          </div>
        </div>

        {/* Card 3: Saídas (Despesas) */}
        <div className="relative p-3 sm:p-5 rounded-xl sm:rounded-2xl bg-white border border-gray-200 hover:border-rose-300 shadow-xs sm:shadow-sm transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1.5 sm:mb-2">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-gray-600 truncate">
                Saídas
              </span>
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-rose-50 border border-rose-200 text-[#881337] shrink-0 flex items-center justify-center">
                <ArrowDownRight className="w-3 h-3 sm:w-4 sm:h-4" />
              </div>
            </div>

            <div className="text-base sm:text-2xl font-black text-[#881337] tracking-tight truncate">
              {formatarMoeda(totalDespesas)}
            </div>
          </div>

          <div className="mt-2 text-[10px] sm:text-xs text-gray-500 flex items-center gap-1 truncate">
            <span className="font-semibold text-[#881337] bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100">
              {qtdDespesas}
            </span>
            <span className="hidden sm:inline">registros desembolsados</span>
            <span className="sm:hidden">desembolsos</span>
          </div>
        </div>

        {/* Card 4: Taxa de Economia */}
        <div className="relative p-3 sm:p-5 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#3e0817] to-[#26050e] text-white border sm:border-2 border-[#d4af37]/50 shadow-xs sm:shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1.5 sm:mb-2">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#f5e6b3] truncate">
                Economia
              </span>
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-[#d4af37]/20 border border-[#d4af37] text-[#d4af37] shrink-0 flex items-center justify-center">
                <PiggyBank className="w-3 h-3 sm:w-4 sm:h-4" />
              </div>
            </div>

            <div className="text-base sm:text-2xl font-black text-white tracking-tight flex items-baseline gap-1">
              <span>{taxaEconomia > 0 ? taxaEconomia.toFixed(1) : '0,0'}</span>
              <span className="text-xs sm:text-sm font-semibold text-[#d4af37]">%</span>
            </div>
          </div>

          <div>
            {/* Barra de Progresso da Economia */}
            <div className="mt-2 w-full bg-black/40 rounded-full h-1.5 sm:h-2 overflow-hidden border border-white/10">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  taxaEconomia >= 20
                    ? 'bg-gradient-to-r from-[#d4af37] to-emerald-400'
                    : taxaEconomia > 0
                    ? 'bg-gradient-to-r from-[#d4af37] to-amber-400'
                    : 'bg-rose-500'
                }`}
                style={{ width: `${Math.min(Math.max(taxaEconomia, 0), 100)}%` }}
              />
            </div>

            <div className="mt-1 text-[9px] sm:text-[11px] text-rose-200/90 flex justify-between">
              <span className="truncate">Poupança</span>
              <span className="text-[#f5e6b3] font-semibold truncate">
                {taxaEconomia >= 20 ? 'Excelente' : taxaEconomia > 0 ? 'Positiva' : '0%'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
