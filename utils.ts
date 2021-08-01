const table = {
  javascript: "typescript" as const,
  js: "typescript" as const,
  jsx: "typescript" as const,
  mjs: "typescript" as const,
  typescript: "typescript" as const,
  ts: "typescript" as const,
  tsx: "typescript" as const,
  markdown: "markdown" as const,
  json: "json" as const,
  toml: "toml" as const,
};

export type Extensions = keyof typeof table;
export type Languages = (typeof table)[Extensions];

export function isAvailableExtension(
  extension: string,
): extension is Extensions {
  return Object.keys(table).includes(extension);
}
export function getLanguage(extension: Extensions) {
  return table[extension];
}
