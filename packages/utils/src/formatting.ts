export function formatNumber(value: number, decimals = 1) {
  if (Number.isNaN(value) || value === Infinity || value === -Infinity) return (0).toFixed(decimals);
  return value.toFixed(decimals);
}

export function formatPercent(value: number, decimals = 1) {
  if (Number.isNaN(value) || value === Infinity || value === -Infinity) return (0).toFixed(decimals) + '%';
  return `${value.toFixed(decimals)}%`;
}

export default { formatNumber, formatPercent };
