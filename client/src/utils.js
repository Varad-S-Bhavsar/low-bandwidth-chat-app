import { compressToUTF16, decompressFromUTF16 } from 'lz-string';

export const compress = (obj) => compressToUTF16(JSON.stringify(obj));
export const decompress = (str) => JSON.parse(decompressFromUTF16(str));
