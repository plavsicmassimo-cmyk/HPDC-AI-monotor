let counter = Math.floor(Math.random() * 900) + 100;

export function generateId(prefix = 'id'): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  counter += 1;
  return `${prefix}-${Date.now()}-${counter}`;
}

export function generateMdsId(): string {
  const year = new Date().getFullYear();
  const seq = (Math.floor(Math.random() * 900000) + 100000).toString();
  return `MDS-${year}-${seq}`;
}
