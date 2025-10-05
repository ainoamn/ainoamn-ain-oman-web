const MAP: Record<string, string[]> = {
  ADMIN: ["case:write","directory:manage","doc:write","message:write","expense:write"],
  LAW_FIRM_ADMIN: ["case:write","directory:manage","doc:write","message:write","expense:write"],
  LAWYER: ["case:write","directory:manage","doc:write","message:write","expense:write"],
  PARALEGAL: ["doc:write","message:write","expense:write"],
  CLIENT: [],
  STAFF: ["message:write"],
};

export function can(roles: string[], perm: string) {
  for (const r of roles) if ((MAP[r]||[]).includes(perm)) return true;
  return false;
}
