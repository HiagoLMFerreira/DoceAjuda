export function formatDecimal(
  value: number,
  maximumFractionDigits = 3
): string {
  return Number(value || 0).toLocaleString('pt-BR', {
    maximumFractionDigits,
  });
}

export function parseDecimalInput(value: string): number {
  const normalized = value.trim().replace(/\s/g, '').replace(/\./g, '').replace(',', '.');
  const number = Number(normalized);
  return Number.isFinite(number) ? number : 0;
}
