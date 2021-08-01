import {
  createFromBuffer,
  Formatter,
  GlobalConfiguration,
} from "https://deno.land/x/dprint@0.1.4/mod.ts";
import { Extensions, getLanguage, Languages } from "./utils.ts";
import type { CodeFile } from "./index.ts";
import type { CodeBlock } from "./parser.ts";

type Config = {
  global: GlobalConfiguration;
  plugin: Record<string, unknown>;
};
type FormatterInitOption = {
  input: BufferSource;
  config: Config;
};

export function getFormatter(props: Record<Languages, FormatterInitOption>) {
  const formatters = new Map<Languages, Formatter>();
  for (
    const [language, { input, config }] of Object.entries(props) as [
      Languages,
      FormatterInitOption,
    ][]
  ) {
    const formatter = createFromBuffer(input);
    formatter.setConfig(config.global, config.plugin);
    formatters.set(language, formatter);
  }
  return (file: CodeFile) =>
    format(file, formatters.get(getLanguage(file.lang)));
}

function createSeparator(extension: Extensions) {
  const text = `scrapbox-formatter-${Math.random()}`;
  switch (getLanguage(extension)) {
    case "typescript":
    case "json":
      return `\n// ${text}\n`;
    case "markdown":
      return `\n<!-- ${text} -->\n`;
    case "toml":
      return `\n# ${text}\n`;
  }
}

export type FormatResult = ({ success: true; blocks: CodeBlock[] } | {
  success: false;
  blocks: CodeBlock[];
  message: string;
});

function format(
  codeFile: CodeFile,
  formatter: Formatter | undefined,
): FormatResult {
  // formatterが存在しなければ何もしないで返す
  if (!formatter) return { success: true, blocks: codeFile.blocks };
  const separator = createSeparator(codeFile.lang);
  const code = codeFile.blocks.map((block) => block.content).join(separator);
  try {
    const formatted = formatter.formatText(codeFile.fileName, code).split(
      separator,
    );
    return {
      success: true,
      blocks: codeFile.blocks.map((block, index) => ({
        ...block,
        content: formatted[index] ?? "",
      })),
    };
  } catch (e) {
    return {
      success: false,
      message: (e as Error).message,
      blocks: codeFile.blocks,
    };
  }
}
