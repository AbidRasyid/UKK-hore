export const MAJORS = ["rpl", "tkj", "dkv", "mp", "ak", "br", "bd", "lps"];
const MAJOR_ALIASES = { akl: "ak" };

export const normalizeMajor = (value) => {
  const normalized = String(value ?? "").trim().toLowerCase();
  const tokens = normalized.split(/[^a-z0-9]+/).filter(Boolean);

  for (const token of tokens) {
    if (MAJORS.includes(token)) return token;
    if (MAJOR_ALIASES[token]) return MAJOR_ALIASES[token];
  }

  return normalized;
};
