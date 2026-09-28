import React, { useState } from 'react';
import {
  Search,
  PlusCircle,
  FileSpreadsheet,
  Edit2,
  Trash2,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Tag,
  Download,
  Calendar,
} from 'lucide-react';
import { FinancialTransaction, MESES_PTBR } from '../types/finance';
import { exportToExcel, exportToCsv } from '../utils/exportExcel';

interface TransactionListProps {
  transactions: FinancialTransaction[];
  onAddNew: () => void;
  onEdit: (transaction: FinancialTransaction) => void;
  onDelete: (id: string) => void;
  mesSelecionado: number;
  anoSelecionado: number;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  onAddNew,
  onEdit,
  onDelete,
  mesSelecionado,
  anoSelecionado,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'receita' | 'despesa'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Categorias únicas presentes nas transações do mês
  const availableCategories = Array.from(new Set(transactions.map((t) => t.category)));

  // Filtragem
  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch =
      t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filterType === 'all' || t.type === filterType;
    const matchesCategory = filterCategory === 'all' || t.category === filterCategory;

    return matchesSearch && matchesType && matchesCategory;
  });

  const handleDeleteClick = (id: string) => {
    if (window.confirm('Tem certeza de que deseja excluir este lançamento financeiro?')) {
      onDelete(id);
    }
  };

  const handleExportExcel = () => {
    exportToExcel(
      filteredTransactions.length > 0 ? filteredTransactions : transactions,
      mesSelecionado,
      anoSelecionado
    );
  };

  const handleExportCsv = () => {
    exportToCsv(
      filteredTransactions.length > 0 ? filteredTransactions : transactions,
      mesSelecionado,
      anoSelecionado
    );
  };

  const formatarMoeda = (val: number) => {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-white border border-[#d4af37]/30 shadow-sm sm:shadow-md space-y-3 sm:space-y-4">
      {/* Top Header com Título e Ações Principais */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
        <div>
          <h3 className="font-luxury text-base font-bold text-[#3e0817] flex items-center gap-2">
            Histórico de Transações
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#faf5f6] text-[#78142f] border border-[#d4af37]/30">
              {filteredTransactions.length} {filteredTransactions.length === 1 ? 'registro' : 'registros'}
            </span>
          </h3>
          <p className="text-[11px] sm:text-xs text-gray-500">
            {MESES_PTBR[mesSelecionado]} de {anoSelecionado}
          </p>
        </div>

        {/* Botões: Novo Lançamento e Exportar Excel (Touch Friendly no Mobile) */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Botão de Exportar para Excel */}
          <div className="relative inline-flex rounded-xl shadow-xs flex-1 sm:flex-initial">
            <button
              type="button"
              onClick={handleExportExcel}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-700 hover:bg-emerald-800 active:scale-98 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs border border-emerald-600 touch-manipulation"
              title="Exportar para Excel (.xlsx) formatado em português"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-200" />
              <span>Exportar Excel</span>
            </button>
            <button
              type="button"
              onClick={handleExportCsv}
              className="ml-1 px-2.5 py-2 bg-emerald-800 hover:bg-emerald-900 active:scale-98 text-white text-[11px] font-semibold rounded-xl transition-all cursor-pointer border border-emerald-700 touch-manipulation"
              title="Baixar como arquivo CSV compatível com Excel pt-BR"
            >
              CSV
            </button>
          </div>

          {/* Botão Nova Transação */}
          <button
            type="button"
            onClick={onAddNew}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-gradient-to-r from-[#4a0e1e] via-[#661329] to-[#4a0e1e] hover:from-[#5c1125] hover:via-[#7c1732] hover:to-[#5c1125] active:scale-98 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer border border-[#d4af37]/60 touch-manipulation"
          >
            <PlusCircle className="w-4 h-4 text-[#d4af37]" />
            <span>Novo Lançamento</span>
          </button>
        </div>
      </div>

      {/* Barra de Filtros e Busca */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-3 pt-1">
        {/* Campo de Busca */}
        <div className="sm:col-span-6 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Buscar por descrição ou categoria..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-gray-50 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#d4af37] focus:bg-white transition-all"
          />
        </div>

        {/* Filtro por Tipo */}
        <div className="sm:col-span-3">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="w-full px-3 py-2 bg-gray-50 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#d4af37] focus:bg-white cursor-pointer font-medium text-gray-700"
          >
            <option value="all">Todos os tipos (Entradas & Saídas)</option>
            <option value="receita">Somente Entradas (Receitas)</option>
            <option value="despesa">Somente Saídas (Despesas)</option>
          </select>
        </div>

        {/* Filtro por Categoria */}
        <div className="sm:col-span-3">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#d4af37] focus:bg-white cursor-pointer font-medium text-gray-700"
          >
            <option value="all">Todas as Categorias</option>
            {availableCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Lista de Transações */}
      {filteredTransactions.length === 0 ? (
        <div className="text-center py-10 sm:py-12 bg-gray-50 rounded-xl sm:rounded-2xl border border-dashed border-gray-200 space-y-2">
          <Calendar className="w-8 h-8 sm:w-10 sm:h-10 text-gray-300 mx-auto" />
          <p className="text-sm font-semibold text-gray-600">Nenhuma transação encontrada</p>
          <p className="text-xs text-gray-400 max-w-sm mx-auto px-4">
            {transactions.length === 0
              ? 'Clique em "+ Novo Lançamento" acima para cadastrar sua primeira receita ou despesa.'
              : 'Nenhum registro corresponde aos filtros selecionados.'}
          </p>
        </div>
      ) : (
        <>
          {/* VISUALIZAÇÃO MOBILE (CARDS): Perfeita para telas de celulares */}
          <div className="block sm:hidden space-y-2.5">
            {filteredTransactions.map((t) => {
              const [ano, mes, dia] = (t.transaction_date || '').split('-');
              const dataFormatada = dia && mes && ano ? `${dia}/${mes}/${ano}` : t.transaction_date;
              const isReceita = t.type === 'receita';

              return (
                <div
                  key={t.id}
                  className="p-3 bg-white rounded-xl border border-gray-200 hover:border-[#d4af37]/60 shadow-2xs space-y-2 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isReceita
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-rose-100 text-[#881337] border border-rose-300'
                      }`}
                    >
                      {isReceita ? (
                        <>
                          <ArrowUpRight className="w-3 h-3" />
                          Entrada
                        </>
                      ) : (
                        <>
                          <ArrowDownRight className="w-3 h-3" />
                          Saída
                        </>
                      )}
                    </span>

                    <span className="text-[11px] text-gray-500 font-mono">
                      {dataFormatada}
                    </span>

                    <div
                      className={`text-sm font-black ${
                        isReceita ? 'text-emerald-700' : 'text-[#881337]'
                      }`}
                    >
                      {isReceita ? '+' : '-'} {formatarMoeda(t.amount)}
                    </div>
                  </div>

                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-gray-900 leading-snug">
                        {t.description}
                      </p>
                      <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 border border-gray-200">
                        <Tag className="w-2.5 h-2.5 text-[#d4af37]" />
                        {t.category}
                      </span>
                    </div>

                    {/* Botões de Ação Mobile com bom target de toque */}
                    <div className="flex items-center gap-1 shrink-0 pt-0.5">
                      <button
                        type="button"
                        onClick={() => onEdit(t)}
                        className="p-2 text-gray-500 hover:text-[#520d20] hover:bg-gray-100 rounded-lg active:scale-95 transition-all cursor-pointer touch-manipulation"
                        title="Editar lançamento"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteClick(t.id)}
                        className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg active:scale-95 transition-all cursor-pointer touch-manipulation"
                        title="Excluir lançamento"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* VISUALIZAÇÃO DESKTOP / TABLET (TABELA COMPLETA) */}
          <div className="hidden sm:block overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#faf5f6] text-[#3e0817] font-bold border-b border-gray-200">
                <tr>
                  <th className="py-3 px-3.5">Tipo</th>
                  <th className="py-3 px-3.5">Data</th>
                  <th className="py-3 px-3.5">Descrição</th>
                  <th className="py-3 px-3.5">Categoria</th>
                  <th className="py-3 px-3.5 text-right">Valor</th>
                  <th className="py-3 px-3.5 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredTransactions.map((t) => {
                  const [ano, mes, dia] = (t.transaction_date || '').split('-');
                  const dataFormatada = dia && mes && ano ? `${dia}/${mes}/${ano}` : t.transaction_date;
                  const isReceita = t.type === 'receita';

                  return (
                    <tr key={t.id} className="hover:bg-amber-50/20 transition-colors">
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            isReceita
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-rose-100 text-[#881337] border border-rose-300'
                          }`}
                        >
                          {isReceita ? (
                            <>
                              <ArrowUpRight className="w-3.5 h-3.5" />
                              Entrada
                            </>
                          ) : (
                            <>
                              <ArrowDownRight className="w-3.5 h-3.5" />
                              Saída
                            </>
                          )}
                        </span>
                      </td>

                      <td className="py-3 px-3.5 whitespace-nowrap text-gray-600 font-mono text-xs">
                        {dataFormatada}
                      </td>

                      <td className="py-3 px-3.5 font-medium text-gray-900 max-w-xs truncate">
                        {t.description}
                      </td>

                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-lg bg-gray-100 text-gray-700 border border-gray-200">
                          <Tag className="w-3 h-3 text-[#d4af37]" />
                          {t.category}
                        </span>
                      </td>

                      <td
                        className={`py-3 px-3.5 text-right font-bold text-sm whitespace-nowrap ${
                          isReceita ? 'text-emerald-700' : 'text-[#881337]'
                        }`}
                      >
                        {isReceita ? '+' : '-'} {formatarMoeda(t.amount)}
                      </td>

                      <td className="py-3 px-3.5 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => onEdit(t)}
                            className="p-1.5 text-gray-500 hover:text-[#520d20] hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                            title="Editar lançamento"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteClick(t.id)}
                            className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Excluir lançamento"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};
