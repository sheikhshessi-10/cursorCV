// TypeScript declarations for mammoth (temporarily disabled)
declare module 'mammoth' {
  interface ExtractResult {
    value: string;
    messages: any[];
  }

  interface Options {
    arrayBuffer: ArrayBuffer;
  }

  function extractRawText(options: Options): Promise<ExtractResult>;
  
  export default {
    extractRawText
  };
}
