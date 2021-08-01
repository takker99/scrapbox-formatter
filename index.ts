import { CodeBlock, OtherBlock } from "./parser.ts";
import type { Extensions } from "./utils.ts";
import type { FormatResult } from "./formatter.ts";

export type CodeFile = {
  fileName: string;
  lang: Extensions;
  blocks: Required<CodeBlock>[];
};

function formatSplittedCodeBlock(
  blocks: (CodeBlock | OtherBlock)[],
  format: (file: CodeFile) => FormatResult,
) {
  const codeBlocks = blocks.flatMap((block) =>
    block.type === "codeBlock" && block.lang !== undefined
      ? [block as Required<CodeBlock>]
      : []
  );
  // list file names
  const fileNames = [
    ...new Set(
      codeBlocks.flatMap((block) => !block.alone ? [block.fileName] : []),
    ),
  ];
  // join code blocks
  const codeFiles: CodeFile[] = fileNames.map((filename) => {
    const _codeBlocks = codeBlocks.filter((block) =>
      block.fileName === filename
    );
    return {
      fileName: filename,
      lang: _codeBlocks[0].lang,
      blocks: _codeBlocks,
    };
  });
  const codeFragments: CodeFile[] = codeBlocks.flatMap((block) =>
    block.alone
      ? [{ fileName: block.fileName, lang: block.lang, blocks: [block] }]
      : []
  );
  // TODO: return with error messages
  const formattedBlocks = [...codeFiles, ...codeFragments].flatMap((file) =>
    format(file).blocks
  );
  return blocks.map((block) =>
    formattedBlocks.find(({ index }) => block.index === index) ?? block
  );
}
