import React, { useState } from 'react';
import {
  PieChart,
  BarChart3,
  TrendingUp,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
} from 'lucide-react';
import { FinancialTransaction, MESES_PTBR } from '../types/finance';

interface FinancialChartsProps {
  transactions: FinancialTransaction[];
  totalReceitas: number;
  totalDespesas: number;
  mesSelecionado: number;
  anoSelecionado: number;
}

const PALETA_CORES_CATEGORIAS = [
  '#881337', // Vinho profundo
  '#d4af37', // Dourado nobre
  '#059669', // Esmeralda
  '#0284c7', // Azul oceano
  '#d97706', // Âmbar
  '#7c3aed', // Púrpura real
  '#e11d48', // Carmesim
  '#0d9488', // Teal
  '#ca8a04', // Mostarda dourada
  '#4f46e5', // Índigo
  '#b45309', // Bronze
  '#64748b', // Ardósia
];

export const FinancialCharts: React.FC<FinancialChartsProps> = ({
  transactions,
  totalReceitas,
  totalDespesas,
  mesSelecionado,
  anoSelecionado,
}) => {
  const [activeTab, setActiveTab] = useState<'categorias' | 'fluxo' | 'evolucao'>('categorias');

  // Filtra apenas as despesas do mês atual
  const despesas = transactions.filter((t) => t.type === 'despesa');

  // Agrupa despesas por categoria
  const categoriasMap: { [cat: string]: number } = {};
  despesas.forEach((t) => {
    categoriasMap[t.category] = (categoriasMap[t.category] || 0) + t.amount;
  });

  const categoriasArray = Object.entries(categoriasMap)
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: totalDespesas > 0 ? (amount / totalDespesas) * 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  // Evolução diária do saldo ao longo do mês
  const transacoesOrdenadas = [...transactions].sort((a, b) =>
    new Date(a.transaction_date).getTime() - new Date(b.transaction_date).getTime()
  );

  let saldoAcumulado = 0;
  const pontosEvolucao: { dia: number; saldo: number }[] = [];
  
  transacoesOrdenadas.forEach((t) => {
    const dia = Number((t.transaction_date || '').split('-')[2]) || 1;
    saldoAcumulado += t.type === 'receita' ? t.amount : -t.amount;
    pontosEvolucao.push({ dia, saldo: saldoAcumulado });
  });

  const formatarMoeda = (val: number) => {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-white border border-[#d4af37]/30 shadow-sm sm:shadow-md space-y-3 sm:space-y-4">
      {/* Cabeçalho da Análise Visual e Seletor de Abas */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 sm:pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-[#4a0e1e] to-[#721c2a] flex items-center justify-center text-[#d4af37] shrink-0">
            <Activity className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
          <div>
            <h3 className="font-luxury text-sm sm:text-base font-bold text-[#3e0817]">
              Análise Visual Financeira
            </h3>
            <p className="text-[10px] sm:text-xs text-gray-500">
              {MESES_PTBR[mesSelecionado]} de {anoSelecionado}
            </p>
          </div>
        </div>

        {/* Abas responsivas com rolagem suave no mobile */}
        <div className="flex overflow-x-auto no-scrollbar rounded-xl p-1 bg-gray-100 text-[11px] sm:text-xs font-semibold gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('categorias')}
            className={`px-2.5 sm:px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 sm:gap-1.5 shrink-0 ${
              activeTab === 'categorias'
                ? 'bg-gradient-to-r from-[#4a0e1e] to-[#661329] text-white shadow-xs'
                : 'text-gray-600 hover:text-[#4a0e1e]'
            }`}
          >
            <PieChart className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span>Categorias</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('fluxo')}
            className={`px-2.5 sm:px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 sm:gap-1.5 shrink-0 ${
              activeTab === 'fluxo'
                ? 'bg-gradient-to-r from-[#4a0e1e] to-[#661329] text-white shadow-xs'
                : 'text-gray-600 hover:text-[#4a0e1e]'
            }`}
          >
            <BarChart3 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span>Fluxo Mensal</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('evolucao')}
            className={`px-2.5 sm:px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 sm:gap-1.5 shrink-0 ${
              activeTab === 'evolucao'
                ? 'bg-gradient-to-r from-[#4a0e1e] to-[#661329] text-white shadow-xs'
                : 'text-gray-600 hover:text-[#4a0e1e]'
            }`}
          >
            <TrendingUp className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span>Evolução</span>
          </button>
        </div>
      </div>

      {/* Conteúdo da Aba 1: Despesas por Categoria */}
      {activeTab === 'categorias' && (
        <div className="pt-2">
          {categoriasArray.length === 0 ? (
            <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              <PieChart className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-gray-600">Nenhuma despesa registrada neste mês</p>
              <p className="text-xs text-gray-400 mt-1">
                Adicione saídas para visualizar a distribuição dos seus gastos por categoria.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              {/* Gráfico Donut em SVG */}
              <div className="md:col-span-5 flex flex-col items-center justify-center">
                <div className="relative w-48 h-48">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    {/* Círculo base */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      stroke="#f1f5f9"
                      strokeWidth="18"
                    />
                    {/* Fatias */}
                    {(() => {
                      let accumulatedPercent = 0;
                      return categoriasArray.map((item, idx) => {
                        const strokeDasharray = `${item.percentage * 2.513} 251.3`;
                        const strokeDashoffset = `-${accumulatedPercent * 2.513}`;
                        accumulatedPercent += item.percentage;
                        const cor = PALETA_CORES_CATEGORIAS[idx % PALETA_CORES_CATEGORIAS.length];

                        return (
                          <circle
                            key={item.category}
                            cx="50"
                            cy="50"
                            r="40"
                            fill="transparent"
                            stroke={cor}
                            strokeWidth="18"
                            strokeDasharray={strokeDasharray}
                            strokeDashoffset={strokeDashoffset}
                            className="transition-all duration-500 hover:opacity-85"
                          />
                        );
                      });
                    })()}
                  </svg>
                  {/* Centro do Donut */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      Total Despesas
                    </span>
                    <span className="text-sm font-black text-[#3e0817]">
                      {formatarMoeda(totalDespesas)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Lista Detalhada de Barras de Categorias */}
              <div className="md:col-span-7 space-y-2.5 max-h-64 overflow-y-auto pr-1">
                {categoriasArray.map((item, idx) => {
                  const cor = PALETA_CORES_CATEGORIAS[idx % PALETA_CORES_CATEGORIAS.length];
                  return (
                    <div key={item.category} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-2 font-medium text-gray-700">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: cor }}
                          />
                          <span className="truncate max-w-[170px] sm:max-w-none">{item.category}</span>
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900">{formatarMoeda(item.amount)}</span>
                          <span className="text-[11px] text-gray-500 font-mono w-10 text-right">
                            {item.percentage.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${item.percentage}%`,
                            backgroundColor: cor,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Conteúdo da Aba 2: Fluxo Receitas x Despesas */}
      {activeTab === 'fluxo' && (
        <div className="pt-2 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Card Entrada */}
            <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200">
              <div className="flex items-center justify-between mb-1 text-xs font-bold uppercase text-emerald-800">
                <span className="flex items-center gap-1">
                  <ArrowUpRight className="w-4 h-4 text-emerald-600" />
                  Receitas do Mês
                </span>
                <span>{totalReceitas > 0 ? '100%' : '0%'}</span>
              </div>
              <div className="text-xl font-bold text-emerald-900">
                {formatarMoeda(totalReceitas)}
              </div>
              <div className="w-full bg-emerald-200/50 rounded-full h-2 mt-2 overflow-hidden">
                <div className="bg-emerald-600 h-full rounded-full w-full" />
              </div>
            </div>

            {/* Card Saída */}
            <div className="p-4 rounded-xl bg-rose-50/60 border border-rose-200">
              <div className="flex items-center justify-between mb-1 text-xs font-bold uppercase text-[#881337]">
                <span className="flex items-center gap-1">
                  <ArrowDownRight className="w-4 h-4 text-[#881337]" />
                  Despesas do Mês
                </span>
                <span>
                  {totalReceitas > 0 ? `${((totalDespesas / totalReceitas) * 100).toFixed(1)}% da renda` : '0%'}
                </span>
              </div>
              <div className="text-xl font-bold text-[#881337]">
                {formatarMoeda(totalDespesas)}
              </div>
              <div className="w-full bg-rose-200/50 rounded-full h-2 mt-2 overflow-hidden">
                <div
                  className="bg-[#881337] h-full rounded-full transition-all"
                  style={{
                    width: `${Math.min(totalReceitas > 0 ? (totalDespesas / totalReceitas) * 100 : 0, 100)}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Gráfico Comparativo em Barra Proporcional */}
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
            <div className="flex justify-between items-center text-xs font-semibold text-gray-700 mb-2">
              <span>Proporção do Fluxo Mensal</span>
              <span>
                Saldo: <strong className={totalReceitas >= totalDespesas ? 'text-emerald-700' : 'text-rose-700'}>
                  {formatarMoeda(totalReceitas - totalDespesas)}
                </strong>
              </span>
            </div>

            {totalReceitas + totalDespesas === 0 ? (
              <p className="text-xs text-gray-400 py-3 text-center">Nenhuma movimentação registrada.</p>
            ) : (
              <div className="w-full h-8 rounded-xl overflow-hidden flex bg-gray-200 shadow-inner">
                <div
                  style={{ width: `${(totalReceitas / (totalReceitas + totalDespesas)) * 100}%` }}
                  className="bg-emerald-600 flex items-center justify-center text-white text-[11px] font-bold transition-all"
                  title={`Receitas: ${formatarMoeda(totalReceitas)}`}
                >
                  {totalReceitas > 0 ? `${Math.round((totalReceitas / (totalReceitas + totalDespesas)) * 100)}% Entradas` : ''}
                </div>
                <div
                  style={{ width: `${(totalDespesas / (totalReceitas + totalDespesas)) * 100}%` }}
                  className="bg-[#881337] flex items-center justify-center text-white text-[11px] font-bold transition-all"
                  title={`Despesas: ${formatarMoeda(totalDespesas)}`}
                >
                  {totalDespesas > 0 ? `${Math.round((totalDespesas / (totalReceitas + totalDespesas)) * 100)}% Saídas` : ''}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Conteúdo da Aba 3: Evolução do Saldo */}
      {activeTab === 'evolucao' && (
        <div className="pt-2">
          {pontosEvolucao.length === 0 ? (
            <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              <TrendingUp className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-gray-600">Sem dados para curva de evolução</p>
              <p className="text-xs text-gray-400 mt-1">
                Cadastre receitas e despesas com datas para acompanhar a evolução diária do seu saldo.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-[#2e0714] to-[#430a1c] text-white rounded-xl border border-[#d4af37]/30">
                <div className="flex items-center justify-between text-xs text-[#f5e6b3] mb-1">
                  <span>Saldo Final do Período</span>
                  <span>{transacoesOrdenadas.length} lançamentos processados</span>
                </div>
                <div className="text-2xl font-black text-white">
                  {formatarMoeda(saldoAcumulado)}
                </div>
              </div>

              {/* Tabela de Progressão do Saldo */}
              <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-100 text-gray-700 sticky top-0">
                    <tr>
                      <th className="py-2 px-3">Data</th>
                      <th className="py-2 px-3">Lançamento</th>
                      <th className="py-2 px-3">Valor</th>
                      <th className="py-2 px-3 text-right">Saldo Resultante</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {transacoesOrdenadas.map((t, idx) => {
                      const [ano, mes, dia] = (t.transaction_date || '').split('-');
                      const dataFormatada = dia && mes && ano ? `${dia}/${mes}/${ano}` : t.transaction_date;
                      const parcial = transacoesOrdenadas
                        .slice(0, idx + 1)
                        .reduce((acc, curr) => acc + (curr.type === 'receita' ? curr.amount : -curr.amount), 0);

                      return (
                        <tr key={t.id} className="hover:bg-gray-50">
                          <td className="py-2 px-3 text-gray-600 font-mono">{dataFormatada}</td>
                          <td className="py-2 px-3 font-medium text-gray-900">{t.description}</td>
                          <td className={`py-2 px-3 font-semibold ${t.type === 'receita' ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {t.type === 'receita' ? '+' : '-'} {formatarMoeda(t.amount)}
                          </td>
                          <td className="py-2 px-3 text-right font-bold font-mono text-[#3e0817]">
                            {formatarMoeda(parcial)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
