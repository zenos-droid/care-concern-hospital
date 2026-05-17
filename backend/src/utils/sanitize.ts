import xss from "xss";

export const sanitizeString = (value: string) => xss(value.trim());

export const sanitizeDeep = <T>(value: T): T => {
  if (typeof value === "string") return sanitizeString(value) as T;
  if (Array.isArray(value)) return value.map((item) => sanitizeDeep(item)) as T;
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, val]) => [key, sanitizeDeep(val)])) as T;
  }
  return value;
};
