// The original encrypted the score it sent to its server with DES. The web version never sends it, so this keeps the call working without crypto.
export const ECB = 0, CBC = 1, PAD_NORMAL = 1, PAD_PKCS5 = 2;
export function des(_key: string, _mode: number, _iv: string, _pad: unknown, _padmode: number): { encrypt(s: string): string } {
  return { encrypt: (s: string) => s };
}
