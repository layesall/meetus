
export function isValidEmail(value: string): boolean {
  const v = value.trim();
  if (!v) return false;
  // Regex volontairement stricte mais standard :
  // - une @, un domaine, un TLD >= 2 lettres, pas d'espaces
  return /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/.test(v);
}

export function isValidPhone(value: string): boolean {
  const cleaned = value.replace(/[\s\-().]/g, "");
  if (!cleaned) return false;
  // Optionnel +, puis 6 à 15 chiffres (E.164 max 15)
  return /^\+?\d{6,15}$/.test(cleaned);
}

export function normalizePhone(value: string): string {
  return value.replace(/[^\d+]/g, "");
}

export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}