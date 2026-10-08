// framework/text.py: helpers for the latin-1 strings of the game.
const up = (c: string): string => { const u = c.toUpperCase(); return u.length === 1 && u.charCodeAt(0) < 256 ? u : c; };
const low = (c: string): string => { const u = c.toLowerCase(); return u.length === 1 && u.charCodeAt(0) < 256 ? u : c; };
export function to_upper(text: string): string { return Array.from(text, up).join(''); }
export function to_lower(text: string): string { return Array.from(text, low).join(''); }

/** 1234567 -> '1.234.567' (the decimal part, after ',' or '.', is left alone) */
export function format_number(number: number | string): string {
  let text = String(number);
  let decimal = text.indexOf(',');
  if (decimal === -1) decimal = text.indexOf('.');
  let len = decimal === -1 ? text.length : decimal;
  let k = 3;
  while (k < len) {
    const i = len - k;
    if (i === 0 && text[0] === '-') break;
    text = text.slice(0, i) + '.' + text.slice(i);
    len += 1;
    k += 4;
  }
  return text;
}
