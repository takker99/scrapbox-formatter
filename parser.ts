import {
  convertToBlock,
  packRows,
  ParserOption,
  parseToRows,
} from "https://esm.sh/@progfay/scrapbox-parser@7.1.0";
import { Extensions, isAvailableExtension } from "./utils.ts";

export type CodeBlock = {
  type: "codeBlock";
  indent: number;
  lang?: Extensions;
  fileName: string;
  rawFileName: string;
  alone: boolean;
  content: string;
  index: number;
};
export type OtherBlock = {
  type: "other";
  text: string;
  index: number;
};

export function splitScrapboxText(
  text: string,
  option: ParserOption,
): (CodeBlock | OtherBlock)[] {
  const packs = packRows(parseToRows(text), option);
  // blockごとにナンバリングする
  return packs.map((pack, index) => {
    switch (pack.type) {
      case "codeBlock": {
        const block = convertToBlock(pack);
        switch (block.type) {
          case "codeBlock": {
            // try to detect language
            const fileName = block.fileName.replace(/\([^()]+\)$/, "");
            const lang: string = block.fileName.match(/\(([^()]+)\)$/)?.[1] ??
              fileName.split(".").pop() ?? fileName;

            return {
              type: "codeBlock",
              index,
              fileName,
              rawFileName: block.fileName,
              lang: isAvailableExtension(lang) ? lang : undefined,
              // 同名のコードブロックを違うファイルとして扱うかどうか
              alone: /\([^()]+\)$/.test(block.fileName) ||
                block.fileName.includes("."),
              content: block.content,
              indent: block.indent,
            };
          }
          default:
            // ここには到達しないはず
            throw Error("The program cannnot reach the line");
        }
      }
      default:
        return {
          type: "other",
          index,
          text: pack.rows.map((row) => row.text).join("\n"),
        };
    }
  });
}
