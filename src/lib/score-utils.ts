export function formatCurrencyValue(value: number): string {
  return `$${value.toLocaleString('en-US')}`;
}

export function formatScore(value: number): string {
  const prefix = value < 0 ? '-$' : '$';
  return `${prefix}${Math.abs(value).toLocaleString('en-US')}`;
}

export function getScoreDelta(
  clueValue: number,
  isCorrect: boolean,
  subtractOnIncorrect: boolean,
): number {
  if (isCorrect) {
    return clueValue;
  }

  return subtractOnIncorrect ? -clueValue : 0;
}
