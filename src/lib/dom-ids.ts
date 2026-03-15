function normalizeDomIdPart(value: string | number | boolean | null | undefined): string {
  const normalized = String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return normalized;
}

export function buildDomId(
  ...parts: Array<string | number | boolean | null | undefined>
): string {
  const normalizedParts = parts
    .map((part, index) => normalizeDomIdPart(part) || `part-${index + 1}`)
    .filter(Boolean);

  return normalizedParts.length > 0 ? normalizedParts.join('-') : 'section';
}
