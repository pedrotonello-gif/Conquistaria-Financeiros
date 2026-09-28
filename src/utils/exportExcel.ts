import * as XLSX from 'xlsx';
import { FinancialTransaction, MESES_PTBR } from '../types/finance';

/**
 * Higieniza o texto contra injeção de fórmulas CSV/Excel (CWE-1236)
 */
function sanitizeCell(value: string): string {
  if (!value) return '';
  const trimmed = value.trim();
  // Se começar com caracteres de comando do Excel (=, +, -, @, tab, cr), neutraliza com aspa simples
  if (/^[=\+\-@\t\r]/.test(trimmed)) {
    return `'${trimmed}`;
  }
  return trimmed;
}

/**
 * Exporta as transações para uma planilha Excel (.xlsx) formatada em Português do Brasil.
 */
export function exportToExcel(
  transactions: FinancialTransaction[],
  mes: number,
  ano: number
) {
  const nomeMes = MESES_PTBR[mes] || 'Mes';

  // Ordena por data
  const sorted = [...transactions].sort((a, b) => 
    new Date(a.transaction_date).getTime() - new Date(b.transaction_date).getTime()
  );

  let saldoAcumulado = 0;

  // Formata os dados para o padrão de colunas em Português
  const rows = sorted.map((t, index) => {
    const valorNumerico = t.type === 'receita' ? t.amount : -t.amount;
    saldoAcumulado += valorNumerico;

    // Converte YYYY-MM-DD para DD/MM/YYYY
    const [anoStr, mesStr, diaStr] = (t.transaction_date || '').split('-');
    const dataFormatada = diaStr && mesStr && anoStr ? `${diaStr}/${mesStr}/${anoStr}` : t.transaction_date;

    return {
      'Item': index + 1,
      'Data': dataFormatada,
      'Tipo': t.type === 'receita' ? 'Entrada (Receita)' : 'Saída (Despesa)',
      'Descrição': sanitizeCell(t.description),
      'Categoria': sanitizeCell(t.category),
      'Valor (R$)': t.amount,
      'Impacto no Saldo (R$)': valorNumerico,
      'Saldo Acumulado (R$)': saldoAcumulado,
    };
  });

  // Criação da planilha
  const worksheet = XLSX.utils.json_to_sheet(rows);

  // Ajuste de largura das colunas
  worksheet['!cols'] = [
    { wch: 6 },  // Item
    { wch: 12 }, // Data
    { wch: 20 }, // Tipo
    { wch: 32 }, // Descrição
    { wch: 26 }, // Categoria
    { wch: 15 }, // Valor
    { wch: 22 }, // Impacto
    { wch: 22 }, // Saldo Acumulado
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, `Transações ${nomeMes}`);

  // Nome do arquivo
  const filename = `CONQUISTARIA_Financeiro_${nomeMes}_${ano}.xlsx`;
  XLSX.writeFile(workbook, filename);
}

/**
 * Exporta também formato CSV com delimitador ';' e BOM UTF-8 (compatibilidade direta com Excel no Brasil)
 */
export function exportToCsv(
  transactions: FinancialTransaction[],
  mes: number,
  ano: number
) {
  const nomeMes = MESES_PTBR[mes] || 'Mes';
  const sorted = [...transactions].sort((a, b) => 
    new Date(a.transaction_date).getTime() - new Date(b.transaction_date).getTime()
  );

  let saldoAcumulado = 0;
  const headers = ['Item', 'Data', 'Tipo', 'Descrição', 'Categoria', 'Valor (R$)', 'Saldo Acumulado (R$)'];
  
  const csvLines = [headers.join(';')];

  sorted.forEach((t, i) => {
    const valorNumerico = t.type === 'receita' ? t.amount : -t.amount;
    saldoAcumulado += valorNumerico;
    const [anoStr, mesStr, diaStr] = (t.transaction_date || '').split('-');
    const dataFormatada = diaStr && mesStr && anoStr ? `${diaStr}/${mesStr}/${anoStr}` : t.transaction_date;

    const line = [
      i + 1,
      `"${dataFormatada}"`,
      `"${t.type === 'receita' ? 'Entrada' : 'Saída'}"`,
      `"${sanitizeCell(t.description || '').replace(/"/g, '""')}"`,
      `"${sanitizeCell(t.category || '').replace(/"/g, '""')}"`,
      `"${t.amount.toFixed(2).replace('.', ',')}"`,
      `"${saldoAcumulado.toFixed(2).replace('.', ',')}"`,
    ];
    csvLines.push(line.join(';'));
  });

  const blob = new Blob(['\uFEFF' + csvLines.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `CONQUISTARIA_Financeiro_${nomeMes}_${ano}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
