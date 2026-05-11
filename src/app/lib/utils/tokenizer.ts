export function tokenizeCode(code: string): string[] {
  const tokens =
    code.match(
      /[a-zA-Z_$][\w$]*|`[^`]*`|\d+\.?\d*|=>|\.{2,3}|[\?\!]\.?|[\+\-\*\/%=,;:{}()[\]]+/g,
    ) || [];
  return tokens;
}
