import React, { useState, useEffect } from 'react';
import { X, PlusCircle, Save, Calendar, Tag, FileText, DollarSign, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { FinancialTransaction, TransactionType, CATEGORIAS_DESPESAS, CATEGORIAS_RECEITAS } from '../types/finance';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transaction: Omit<FinancialTransaction, 'id'>, id?: string) => Promise<void>;
  transactionToEdit?: FinancialTransaction | null;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  transactionToEdit,
}) => {
  const [type, setType] = useState<TransactionType>('despesa');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [transactionDate, setTransactionDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (transactionToEdit) {
      setType(transactionToEdit.type);
      setDescription(transactionToEdit.description);
      setAmount(transactionToEdit.amount.toString());
      setTransactionDate(transactionToEdit.transaction_date);

      const standardCategories: readonly string[] = transactionToEdit.type === 'receita' ? CATEGORIAS_RECEITAS : CATEGORIAS_DESPESAS;
      if (standardCategories.includes(transactionToEdit.category)) {
        setCategory(transactionToEdit.category);
        setIsCustomCategory(false);
        setCustomCategory('');
      } else {
        setCategory('__OUTRO__');
        setIsCustomCategory(true);
        setCustomCategory(transactionToEdit.category);
      }
    } else {
      // Padrão para novo registro
      setType('despesa');
      setDescription('');
      setAmount('');
      setCategory(CATEGORIAS_DESPESAS[0]);
      setIsCustomCategory(false);
      setCustomCategory('');
      setTransactionDate(new Date().toISOString().split('T')[0]);
    }
    setError(null);
  }, [transactionToEdit, isOpen]);

  // Ao alternar tipo, atualiza categoria padrão
  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    if (!isCustomCategory) {
      setCategory(newType === 'receita' ? CATEGORIAS_RECEITAS[0] : CATEGORIAS_DESPESAS[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validação e normalização do valor monetário
    const sanitizedAmountStr = amount.trim().replace(/\s/g, '').replace(',', '.');
    const valorNumerico = parseFloat(sanitizedAmountStr);

    if (isNaN(valorNumerico) || !isFinite(valorNumerico) || valorNumerico <= 0) {
      setError('Por favor, informe um valor monetário positivo válido (ex: 150,00).');
      return;
    }

    if (valorNumerico > 999999999.99) {
      setError('O valor não pode ultrapassar R$ 999.999.999,99.');
      return;
    }

    // Arredonda para 2 casas decimais
    const valorArredondado = Math.round(valorNumerico * 100) / 100;

    // Higienização da descrição
    const descTrimmed = description.trim().slice(0, 120);
    if (!descTrimmed) {
      setError('A descrição personalizada é obrigatória.');
      return;
    }

    // Validação da data
    if (!/^\d{4}-\d{2}-\d{2}$/.test(transactionDate)) {
      setError('Por favor, selecione uma data válida no formato correto.');
      return;
    }

    const finalCategory = isCustomCategory
      ? (customCategory.trim().slice(0, 60) || 'Personalizada')
      : category;

    setLoading(true);
    try {
      await onSave(
        {
          type,
          description: descTrimmed,
          amount: valorArredondado,
          category: finalCategory,
          transaction_date: transactionDate,
        },
        transactionToEdit?.id
      );
      onClose();
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar transação.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const currentCategories = type === 'receita' ? CATEGORIAS_RECEITAS : CATEGORIAS_DESPESAS;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border-t-2 sm:border-2 border-[#d4af37]/60 overflow-hidden text-gray-800 max-h-[92vh] flex flex-col">
        {/* Header Vinho e Dourado */}
        <div className="bg-gradient-to-r from-[#3e0817] via-[#590e22] to-[#3e0817] p-4 sm:p-5 text-white border-b-2 border-[#d4af37]/40 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#d4af37]/20 border border-[#d4af37] flex items-center justify-center text-[#d4af37] shrink-0">
              {transactionToEdit ? <Save className="w-4 h-4 sm:w-5 sm:h-5" /> : <PlusCircle className="w-4 h-4 sm:w-5 sm:h-5" />}
            </div>
            <div>
              <h3 className="font-luxury text-base sm:text-lg font-bold tracking-wide text-[#f5e6b3]">
                {transactionToEdit ? 'Editar Lançamento' : 'Nova Transação'}
              </h3>
              <p className="text-[11px] sm:text-xs text-rose-200">
                {transactionToEdit ? 'Atualize os dados da transação' : 'Cadastre uma receita ou despesa'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-300 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10 cursor-pointer touch-manipulation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulário com rolagem no mobile */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-3.5 sm:space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="p-3 bg-rose-50 border-l-4 border-rose-600 rounded-r-lg text-xs text-rose-800">
              {error}
            </div>
          )}

          {/* Seletor de Tipo (Receita vs Despesa) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#3e0817] mb-1.5">
              Tipo de Movimentação
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleTypeChange('receita')}
                className={`py-2.5 px-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer ${
                  type === 'receita'
                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-md'
                    : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-emerald-50'
                }`}
              >
                <ArrowUpRight className="w-4 h-4" />
                <span>Entrada (Receita)</span>
              </button>

              <button
                type="button"
                onClick={() => handleTypeChange('despesa')}
                className={`py-2.5 px-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer ${
                  type === 'despesa'
                    ? 'bg-[#881337] border-[#881337] text-white shadow-md'
                    : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-rose-50'
                }`}
              >
                <ArrowDownRight className="w-4 h-4" />
                <span>Saída (Despesa)</span>
              </button>
            </div>
          </div>

          {/* Descrição Personalizada */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#3e0817] mb-1">
              Descrição Personalizada
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <FileText className="w-4 h-4 text-[#721c2a]" />
              </div>
              <input
                type="text"
                required
                placeholder="Ex: Supermercado Mensal, Salário, Consultoria..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 bg-white rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/20"
              />
            </div>
          </div>

          {/* Grid de Valor e Data */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#3e0817] mb-1">
                Valor (R$)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <DollarSign className="w-4 h-4 text-[#721c2a]" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="0,00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-white rounded-xl border border-gray-300 text-sm font-semibold focus:outline-none focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#3e0817] mb-1">
                Data do Lançamento
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Calendar className="w-4 h-4 text-[#721c2a]" />
                </div>
                <input
                  type="date"
                  required
                  value={transactionDate}
                  onChange={(e) => setTransactionDate(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-white rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/20"
                />
              </div>
            </div>
          </div>

          {/* Categoria com Diversas Opções */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#3e0817]">
                Categoria
              </label>
              <button
                type="button"
                onClick={() => setIsCustomCategory(!isCustomCategory)}
                className="text-[11px] text-[#661329] hover:underline font-semibold cursor-pointer"
              >
                {isCustomCategory ? 'Escolher categoria predefinida' : '+ Criar categoria própria'}
              </button>
            </div>

            {isCustomCategory ? (
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Tag className="w-4 h-4 text-[#721c2a]" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="Digite sua categoria personalizada..."
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-white rounded-xl border border-[#d4af37] text-sm focus:outline-none focus:ring-2 focus:ring-[#d4af37]/20"
                />
              </div>
            ) : (
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Tag className="w-4 h-4 text-[#721c2a]" />
                </div>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-white rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/20 cursor-pointer"
                >
                  {currentCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Botões de Ação */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-[#4a0e1e] via-[#661329] to-[#4a0e1e] hover:from-[#5c1125] hover:to-[#7c1732] border border-[#d4af37]/60 rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Salvando...' : transactionToEdit ? 'Atualizar Transação' : 'Adicionar ao Fluxo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
