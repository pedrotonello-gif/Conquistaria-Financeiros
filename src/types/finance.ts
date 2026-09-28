export type TransactionType = 'receita' | 'despesa';

export interface FinancialTransaction {
  id: string;
  user_id?: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: string;
  transaction_date: string; // YYYY-MM-DD
  created_at?: string;
}

export const CATEGORIAS_DESPESAS = [
  'Alimentação & Supermercado',
  'Moradia & Aluguel',
  'Contas & Utilidades',
  'Transporte & Combustível',
  'Saúde & Farmácia',
  'Lazer & Conquistas',
  'Educação & Cursos',
  'Roupas & Compras',
  'Assinaturas & Streaming',
  'Investimentos & Aportes',
  'Imprevistos & Manutenção',
  'Outras Despesas',
] as const;

export const CATEGORIAS_RECEITAS = [
  'Salário & Proventos',
  'Freelance & Consultoria',
  'Rendimentos & Dividendos',
  'Vendas & Comissões',
  'Reembolsos & Bonificações',
  'Outras Entradas',
] as const;

export const MESES_PTBR = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];
