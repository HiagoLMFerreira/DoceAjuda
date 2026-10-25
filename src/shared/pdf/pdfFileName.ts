/** Mantém nomes legíveis e remove caracteres inválidos em nomes de arquivos. */
export function normalizePdfFileName(value: string): string {
  const name = value.normalize('NFC')
    .replace(/\.pdf$/i, '')
    .replace(/[<>:"/\\|?*\u0000-\u001f\u007f]/g, '-')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^[. ]+|[. ]+$/g, '')
    .slice(0, 160)
    .trim();
  return `${name || 'Documento'}.pdf`;
}
