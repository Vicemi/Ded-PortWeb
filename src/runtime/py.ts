// Python 2 semantics for the game code (which is generated from the original Python): truthiness, ==, in, +, *, %, /, indexing, slicing,
// dictionaries, string methods, the standard modules the game used (random, math, os, time, uuid, bisect, collections, string, base64...).
// Values are plain JS values: ints and floats are numbers, str is string (latin-1 characters like the original byte strings), list and tuple are
// arrays, dict is PyDict, None is null.

export class PyException extends Error {
  constructor(public msg: any = '', public args: any[] = []) { super(typeof msg === 'string' ? msg : String(msg)); }
}
export class Exception extends PyException {}
export class IOError extends Exception {}
export class ValueError extends Exception {}
export class KeyError extends Exception {}
export class IndexError extends Exception {}
export class TypeError_ extends Exception {}
export class AttributeError extends Exception {}
export class ZeroDivisionError extends Exception {}
export class NameError extends Exception {}
export class SystemExit extends Exception {}
export class StopIteration extends Exception {}
export class OSError extends Exception {}
export class AssertionError extends Exception {}

/** `except X:` — native JS errors count as plain Exceptions */
export function isExc(e: any, classes: any[]): boolean {
  for (const c of classes) {
    if (e instanceof c) return true;
    if (c === Exception && e instanceof Error) return true;
  }
  return false;
}

// ----------------------------------------------------------------------------------------------------------------------------- truthiness & equality
export function truthy(x: any): boolean {
  if (x === null || x === undefined || x === false || x === 0 || x === '') return false;
  if (Array.isArray(x)) return x.length > 0;
  if (typeof x === 'number') return !Number.isNaN(x);
  if (x instanceof PyDict) return x.size > 0;
  if (x instanceof PySet) return x.size > 0;
  return true;
}

/** `a and b` / `a or b` returning the operands */
export function and(a: any, f: () => any): any { return truthy(a) ? f() : a; }
export function or(a: any, f: () => any): any { return truthy(a) ? a : f(); }

export function eq(a: any, b: any): boolean {
  if (a === b) return true;
  if (a === null || a === undefined) return b === null || b === undefined;
  if (b === null || b === undefined) return false;
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) if (!eq(a[i], b[i])) return false;
    return true;
  }
  if (typeof a === 'boolean' && typeof b === 'number') return (a ? 1 : 0) === b;
  if (typeof b === 'boolean' && typeof a === 'number') return (b ? 1 : 0) === a;
  if (a instanceof PyDict && b instanceof PyDict) {
    if (a.size !== b.size) return false;
    for (const [k, v] of a.items()) { if (!b.has(k) || !eq(v, b.get(k))) return false; }
    return true;
  }
  if (typeof a === 'object' && typeof a.__eq__ === 'function') return !!a.__eq__(b);
  return false;
}

export function cmp(a: any, b: any): number {
  if (Array.isArray(a) && Array.isArray(b)) {
    for (let i = 0; i < Math.min(a.length, b.length); i++) { const c = cmp(a[i], b[i]); if (c !== 0) return c; }
    return a.length - b.length < 0 ? -1 : a.length > b.length ? 1 : 0;
  }
  if (a === null || a === undefined) return b === null || b === undefined ? 0 : -1;
  if (b === null || b === undefined) return 1;
  return a < b ? -1 : a > b ? 1 : 0;
}

export function contains(container: any, x: any): boolean {
  if (typeof container === 'string') return container.includes(x);
  if (Array.isArray(container)) { for (const v of container) if (eq(v, x)) return true; return false; }
  if (container instanceof PyDict) return container.has(x);
  if (container instanceof PySet) return container.has(x);
  if (container && typeof container.__contains__ === 'function') return !!container.__contains__(x);
  throw new TypeError_("argument of type '" + typeof container + "' is not iterable");
}

// ----------------------------------------------------------------------------------------------------------------------------- numbers & strings
export function add(a: any, b: any): any {
  if (typeof a === 'number' && typeof b === 'number') return a + b;
  if (typeof a === 'string' && typeof b === 'string') return a + b;
  if (Array.isArray(a) && Array.isArray(b)) return a.concat(b);
  if (typeof a === 'number' && typeof b === 'boolean') return a + (b ? 1 : 0);
  if (typeof a === 'boolean' && typeof b === 'number') return (a ? 1 : 0) + b;
  if (typeof a === 'string' || typeof b === 'string') throw new TypeError_('cannot concatenate ' + typeof a + ' and ' + typeof b);
  return a + b;
}
export function mul(a: any, b: any): any {
  if (typeof a === 'number' && typeof b === 'number') return a * b;
  if (typeof a === 'string' && typeof b === 'number') return b > 0 ? a.repeat(b) : '';
  if (typeof b === 'string' && typeof a === 'number') return a > 0 ? b.repeat(a) : '';
  if (Array.isArray(a) && typeof b === 'number') { let r: any[] = []; for (let i = 0; i < b; i++) r = r.concat(a); return r; }
  if (Array.isArray(b) && typeof a === 'number') return mul(b, a);
  return a * b;
}
/** Python 2 `/`: integer operands floor-divide */
export function div(a: any, b: any): number {
  if (b === 0) throw new ZeroDivisionError('integer division or modulo by zero');
  if (Number.isInteger(a) && Number.isInteger(b)) return Math.floor(a / b);
  return a / b;
}
export function fdiv(a: number, b: number): number {
  if (b === 0) throw new ZeroDivisionError('float division');
  return a / b;
}
export function floordiv(a: number, b: number): number { if (b === 0) throw new ZeroDivisionError('integer division or modulo by zero'); return Math.floor(a / b); }
export function mod(a: any, b: any): any {
  if (typeof a === 'string') return fmt(a, b);
  if (b === 0) throw new ZeroDivisionError('integer division or modulo by zero');
  return ((a % b) + b) % b;
}
export function pow(a: number, b: number): number { return Math.pow(a, b); }

function fmtOne(spec: { flags: string; width: number | null; prec: number | null; type: string }, v: any): string {
  let s: string;
  const { flags, width, prec, type } = spec;
  switch (type) {
    case 's': s = str(v); if (prec !== null) s = s.slice(0, prec); break;
    case 'r': s = repr(v); break;
    case 'd': case 'i': case 'u': {
      const n = Math.trunc(Number(typeof v === 'boolean' ? (v ? 1 : 0) : v));
      s = String(Math.abs(n));
      if (n < 0) s = '-' + s; else if (flags.includes('+')) s = '+' + s; else if (flags.includes(' ')) s = ' ' + s;
      break;
    }
    case 'f': case 'F': {
      const n = Number(v); s = Math.abs(n).toFixed(prec ?? 6);
      if (n < 0 || Object.is(n, -0)) s = '-' + s; else if (flags.includes('+')) s = '+' + s;
      break;
    }
    case 'e': s = Number(v).toExponential(prec ?? 6).replace(/e([+-])(\d)$/, 'e$10$2'); break;
    case 'g': s = String(Number(v)); break;
    case 'x': s = Math.trunc(Number(v)).toString(16); break;
    case 'X': s = Math.trunc(Number(v)).toString(16).toUpperCase(); break;
    case 'o': s = Math.trunc(Number(v)).toString(8); break;
    case 'c': s = typeof v === 'number' ? String.fromCharCode(v) : String(v); break;
    default: s = String(v);
  }
  if (width !== null && s.length < width) {
    if (flags.includes('-')) s = s + ' '.repeat(width - s.length);
    else if (flags.includes('0') && 'dieEfFgGxXo'.includes(type)) {
      const neg = s[0] === '-' || s[0] === '+';
      s = (neg ? s[0] : '') + '0'.repeat(width - s.length) + (neg ? s.slice(1) : s);
    } else s = ' '.repeat(width - s.length) + s;
  }
  return s;
}
/** `'template' % args` */
export function fmt(t: string, args: any): string {
  const list = Array.isArray(args) ? args : [args];
  let i = 0;
  return t.replace(/%(?:\(([^)]*)\))?([-+ #0]*)(\*|\d+)?(?:\.(\d+))?[hlL]?([diouxXeEfFgGcrs%])/g, (_m, key, flags, width, prec, type) => {
    if (type === '%') return '%';
    let v: any;
    if (key !== undefined) v = args instanceof PyDict ? args.get(key) : args[key];
    else v = list[i++];
    return fmtOne({ flags, width: width === undefined ? null : width === '*' ? Number(list[i - 1]) : Number(width), prec: prec === undefined ? null : Number(prec), type }, v);
  });
}

export function str(x: any): string {
  if (typeof x === 'string') return x;
  if (x === null || x === undefined) return 'None';
  if (x === true) return 'True';
  if (x === false) return 'False';
  if (typeof x === 'number') return numStr(x);
  if (Array.isArray(x)) return '[' + x.map(repr).join(', ') + ']';
  if (x instanceof PyDict) return '{' + x.items().map(([k, v]) => repr(k) + ': ' + repr(v)).join(', ') + '}';
  if (typeof x.__str__ === 'function') return x.__str__();
  return String(x);
}
function numStr(x: number): string {
  if (Number.isInteger(x)) return String(x);
  let s = String(x);
  if (s.includes('e')) return s;
  // Python 2 str() of a float keeps 12 significant digits
  s = String(Number(x.toPrecision(12)));
  return s;
}
export function repr(x: any): string {
  if (typeof x === 'string') return "'" + x.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n') + "'";
  if (Array.isArray(x)) return '[' + x.map(repr).join(', ') + ']';
  return str(x);
}
export function int(x: any, base = 10): number {
  if (typeof x === 'number') return Math.trunc(x);
  if (typeof x === 'boolean') return x ? 1 : 0;
  if (typeof x === 'string') {
    const s = x.trim();
    if (!(base === 10 ? /^[+-]?\d+$/ : /^[+-]?[0-9a-zA-Z]+$/).test(s)) throw new ValueError("invalid literal for int() with base " + base + ": " + repr(x));
    return parseInt(s, base);
  }
  throw new TypeError_('int() argument must be a string or a number');
}
export function float(x: any): number {
  if (typeof x === 'number') return x;
  if (typeof x === 'boolean') return x ? 1 : 0;
  if (typeof x === 'string') {
    const s = x.trim();
    const v = Number(s);
    if (s === '' || Number.isNaN(v)) throw new ValueError('invalid literal for float(): ' + x);
    return v;
  }
  throw new TypeError_('float() argument must be a string or a number');
}
export function bool(x: any): boolean { return truthy(x); }
export function round(x: number, n = 0): number {
  const m = Math.pow(10, n);
  const v = Math.abs(x) * m;
  const r = Math.floor(v + 0.5) / m;
  return x < 0 ? -r : r;
}
export function abs(x: number): number { return Math.abs(x); }
export function min(...a: any[]): any { const l = a.length === 1 ? Array.from(iter(a[0])) : a; let m = l[0]; for (const v of l) if (cmp(v, m) < 0) m = v; return m; }
export function max(...a: any[]): any { const l = a.length === 1 ? Array.from(iter(a[0])) : a; let m = l[0]; for (const v of l) if (cmp(v, m) > 0) m = v; return m; }
export function sum(a: any, start = 0): any { let s = start; for (const v of iter(a)) s = add(s, v); return s; }
export function ord(c: string): number { return c.charCodeAt(0); }
export function chr(n: number): string { return String.fromCharCode(n); }
export function len(x: any): number {
  if (x === null || x === undefined) throw new TypeError_("object of type 'NoneType' has no len()");
  if (typeof x === 'string' || Array.isArray(x)) return x.length;
  if (x instanceof PyDict || x instanceof PySet) return x.size;
  if (typeof x.__len__ === 'function') return x.__len__();
  if (typeof x.length === 'number') return x.length;
  throw new TypeError_('object has no len()');
}

// ----------------------------------------------------------------------------------------------------------------------------- containers
export function* range(a: number, b?: number, step = 1): Generator<number> {
  let s = 0, e = a;
  if (b !== undefined) { s = a; e = b; }
  if (step > 0) for (let i = s; i < e; i += step) yield i; else for (let i = s; i > e; i += step) yield i;
}
/** xrange(): a lazy sequence */
export class PyRange {
  constructor(public start: number, public stop: number, public step = 1) {}
  __len__(): number { return Math.max(0, Math.ceil((this.stop - this.start) / this.step)); }
  __getitem__(i: number): number { const n = this.__len__(); const k = i < 0 ? n + i : i; if (k < 0 || k >= n) throw new IndexError('xrange object index out of range'); return this.start + k * this.step; }
  [Symbol.iterator](): Iterator<number> { return range(this.start, this.stop, this.step); }
}
export function xrange(a: number, b?: number, step = 1): PyRange { return b === undefined ? new PyRange(0, a, step) : new PyRange(a, b, step); }
/** range() as a list (Python 2) */
export function rangeList(a: number, b?: number, step = 1): number[] { return Array.from(range(a, b, step)); }

export function iter(x: any): Iterable<any> {
  if (Array.isArray(x) || typeof x === 'string') return x;
  if (x instanceof PyDict) return x.keys();
  if (x instanceof PySet) return Array.from(x.values());
  if (x && typeof x[Symbol.iterator] === 'function') return x;
  if (x && typeof x.__iter__ === 'function') return x.__iter__();
  throw new TypeError_('object is not iterable');
}
export function list(x?: any): any[] { return x === undefined ? [] : Array.from(iter(x)); }
export function enumerate(x: any): [number, any][] { return Array.from(iter(x)).map((v, i) => [i, v]); }
export function zip(...ls: any[]): any[][] {
  const arrs = ls.map((l) => Array.from(iter(l)));
  const n = Math.min(...arrs.map((a) => a.length));
  return Array.from({ length: n }, (_, i) => arrs.map((a) => a[i]));
}
export function reversed(x: any): any[] { return Array.from(iter(x)).reverse(); }
export function sorted(x: any, cmpf?: (a: any, b: any) => number): any[] { const l = Array.from(iter(x)); l.sort(cmpf ?? cmp); return l; }
export function filter(f: any, x: any): any[] { const l = Array.from(iter(x)); return f === null ? l.filter(truthy) : l.filter((v) => truthy(f(v))); }
export function map(f: any, ...ls: any[]): any[] { return ls.length === 1 ? Array.from(iter(ls[0])).map((v) => f(v)) : zip(...ls).map((t) => f(...t)); }

export function getitem(o: any, k: any): any {
  if (Array.isArray(o) || typeof o === 'string') {
    if (typeof k !== 'number') {
      if (k && k.__slice__) return slice(o, k.a, k.b);
      throw new TypeError_('indices must be integers');
    }
    const i = k < 0 ? o.length + k : k;
    if (i < 0 || i >= o.length) throw new IndexError('index out of range');
    return o[i];
  }
  if (o instanceof PyDict) return o.getitem(k);
  if (o === null || o === undefined) throw new TypeError_("'NoneType' object is not subscriptable");
  if (typeof o.__getitem__ === 'function') return o.__getitem__(k);
  return o[k];
}
export function setitem(o: any, k: any, v: any): void {
  if (Array.isArray(o)) {
    const i = k < 0 ? o.length + k : k;
    if (i < 0 || i >= o.length) throw new IndexError('list assignment index out of range');
    o[i] = v;
  } else if (o instanceof PyDict) o.set(k, v);
  else if (o && typeof o.__setitem__ === 'function') o.__setitem__(k, v);
  else o[k] = v;
}
export function delitem(o: any, k: any): void {
  if (Array.isArray(o)) {
    if (k && k.__slice__) { const [a, b] = sliceBounds(o.length, k.a, k.b); o.splice(a, Math.max(0, b - a)); return; }
    const i = k < 0 ? o.length + k : k;
    if (i < 0 || i >= o.length) throw new IndexError('list assignment index out of range');
    o.splice(i, 1);
  } else if (o instanceof PyDict) o.delete(k, true);
  else delete o[k];
}
function sliceBounds(n: number, a: any, b: any): [number, number] {
  let s = a === null || a === undefined ? 0 : a, e = b === null || b === undefined ? n : b;
  if (s < 0) s = Math.max(0, n + s);
  if (e < 0) e = Math.max(0, n + e);
  return [Math.min(s, n), Math.min(e, n)];
}
export function slice(o: any, a: any, b: any): any {
  const [s, e] = sliceBounds(o.length, a, b);
  return o.slice(s, Math.max(s, e));
}
export function setslice(o: any[], a: any, b: any, v: any): void {
  const [s, e] = sliceBounds(o.length, a, b);
  o.splice(s, Math.max(0, e - s), ...Array.from(iter(v)));
}
export function sl(a: any, b: any): any { return { __slice__: true, a, b }; }

// ----------------------------------------------------------------------------------------------------------------------------- dict & set
let objIds = new WeakMap<object, number>();
let nextObjId = 1;
function keyOf(k: any): string {
  switch (typeof k) {
    case 'string': return 's' + k;
    case 'number': return 'n' + k;
    case 'boolean': return 'n' + (k ? 1 : 0);
    default:
      if (k === null || k === undefined) return 'N';
      if (Array.isArray(k)) return 't(' + k.map(keyOf).join(',') + ')';
      if (typeof k.__hash__ === 'function') return 'h' + k.__hash__();
      if (!objIds.has(k)) objIds.set(k, nextObjId++);
      return 'o' + objIds.get(k);
  }
}
export class PyDict {
  m = new Map<string, [any, any]>();
  constructor(pairs?: Iterable<[any, any]>) { if (pairs) for (const [k, v] of pairs) this.set(k, v); }
  get size(): number { return this.m.size; }
  has(k: any): boolean { return this.m.has(keyOf(k)); }
  has_key(k: any): boolean { return this.has(k); }
  get(k: any, d: any = null): any { const e = this.m.get(keyOf(k)); return e ? e[1] : d; }
  getitem(k: any): any { const e = this.m.get(keyOf(k)); if (!e) throw new KeyError(repr(k)); return e[1]; }
  set(k: any, v: any): void { const key = keyOf(k); const e = this.m.get(key); if (e) e[1] = v; else this.m.set(key, [k, v]); }
  delete(k: any, strict = false): void { if (!this.m.delete(keyOf(k)) && strict) throw new KeyError(repr(k)); }
  keys(): any[] { return Array.from(this.m.values(), (e) => e[0]); }
  values(): any[] { return Array.from(this.m.values(), (e) => e[1]); }
  items(): [any, any][] { return Array.from(this.m.values(), (e) => [e[0], e[1]] as [any, any]); }
  setdefault(k: any, d: any = null): any { if (!this.has(k)) this.set(k, d); return this.get(k); }
  pop(k: any, ...d: any[]): any { const e = this.m.get(keyOf(k)); if (e) { this.m.delete(keyOf(k)); return e[1]; } if (d.length) return d[0]; throw new KeyError(repr(k)); }
  update(o: any): void { const src = o instanceof PyDict ? o.items() : o; for (const [k, v] of src) this.set(k, v); }
  copy(): PyDict { return new PyDict(this.items()); }
  clear(): void { this.m.clear(); }
}
export class DefaultDict extends PyDict {
  constructor(public factory: () => any) { super(); }
  getitem(k: any): any { if (!this.has(k)) this.set(k, this.factory()); return super.getitem(k); }
}
export function dict(pairs?: any): PyDict { return new PyDict(pairs ? (pairs instanceof PyDict ? pairs.items() : pairs) : undefined); }
export function mkdict(pairs: [any, any][]): PyDict { return new PyDict(pairs); }

export class PySet {
  private m = new Map<string, any>();
  constructor(it?: Iterable<any>) { if (it) for (const v of it) this.add(v); }
  get size(): number { return this.m.size; }
  add(v: any): void { this.m.set(keyOf(v), v); }
  has(v: any): boolean { return this.m.has(keyOf(v)); }
  remove(v: any): void { this.m.delete(keyOf(v)); }
  values(): any[] { return Array.from(this.m.values()); }
}
export function set(it?: any): PySet { return new PySet(it === undefined ? undefined : iter(it)); }

// ----------------------------------------------------------------------------------------------------------------------------- methods of builtin types
const STR_METHODS: Record<string, (s: string, ...a: any[]) => any> = {
  strip: (s, c) => (c === undefined ? s.replace(/^\s+|\s+$/g, '') : stripChars(s, c, true, true)),
  lstrip: (s, c) => (c === undefined ? s.replace(/^\s+/, '') : stripChars(s, c, true, false)),
  rstrip: (s, c) => (c === undefined ? s.replace(/\s+$/, '') : stripChars(s, c, false, true)),
  split: (s, sep, max) => {
    if (sep === undefined || sep === null) return s.split(/\s+/).filter((x) => x !== '');
    const parts = s.split(sep);
    if (max !== undefined && max >= 0 && parts.length > max + 1) return [...parts.slice(0, max), parts.slice(max).join(sep)];
    return parts;
  },
  rsplit: (s, sep, max) => { const p = s.split(sep); if (max !== undefined && p.length > max + 1) return [p.slice(0, p.length - max).join(sep), ...p.slice(p.length - max)]; return p; },
  splitlines: (s) => { if (s === '') return []; const p = s.split(/\r\n|\n|\r/); if (/(\r\n|\n|\r)$/.test(s)) p.pop(); return p; },
  join: (s, it) => Array.from(iter(it)).join(s),
  replace: (s, a, b, n) => (n === undefined ? s.split(a).join(b) : replaceN(s, a, b, n)),
  find: (s, x, a = 0) => s.indexOf(x, a),
  rfind: (s, x) => s.lastIndexOf(x),
  index: (s, x) => { const i = s.indexOf(x); if (i < 0) throw new ValueError('substring not found'); return i; },
  count: (s, x) => (x === '' ? s.length + 1 : s.split(x).length - 1),
  startswith: (s, p) => (Array.isArray(p) ? p.some((q: string) => s.startsWith(q)) : s.startsWith(p)),
  endswith: (s, p) => (Array.isArray(p) ? p.some((q: string) => s.endsWith(q)) : s.endsWith(p)),
  lower: (s) => s.toLowerCase(),
  upper: (s) => s.toUpperCase(),
  capitalize: (s) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase(),
  title: (s) => s.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()),
  isdigit: (s) => /^\d+$/.test(s),
  isalpha: (s) => /^[A-Za-z\xc0-\xff]+$/.test(s),
  isspace: (s) => /^\s+$/.test(s),
  encode: (s) => s,
  decode: (s) => s,
  zfill: (s, n) => (s.length >= n ? s : '0'.repeat(n - s.length) + s),
  ljust: (s, n, c = ' ') => s.padEnd(n, c),
  rjust: (s, n, c = ' ') => s.padStart(n, c),
  center: (s, n) => { const t = n - s.length; if (t <= 0) return s; const l = Math.floor(t / 2) + (t % 2 && n % 2 ? 1 : 0); return ' '.repeat(l) + s + ' '.repeat(t - l); },
  translate: (s, table: Map<string, string>) => Array.from(s, (ch) => table.get(ch) ?? ch).join(''),
  __contains__: (s, x) => s.includes(x),
  __len__: (s) => s.length,
};
function stripChars(s: string, chars: string, left: boolean, right: boolean): string {
  let a = 0, b = s.length;
  if (left) while (a < b && chars.includes(s[a])) a++;
  if (right) while (b > a && chars.includes(s[b - 1])) b--;
  return s.slice(a, b);
}
function replaceN(s: string, a: string, b: string, n: number): string { let out = s; let i = 0, from = 0, res = ''; for (; i < n; i++) { const p = out.indexOf(a, from); if (p < 0) break; res += out.slice(from, p) + b; from = p + a.length; } return res + out.slice(from); }

const LIST_METHODS: Record<string, (l: any[], ...a: any[]) => any> = {
  append: (l, x) => { l.push(x); },
  extend: (l, x) => { for (const v of Array.from(iter(x))) l.push(v); },
  index: (l, x) => { for (let i = 0; i < l.length; i++) if (eq(l[i], x)) return i; throw new ValueError(repr(x) + ' is not in list'); },
  count: (l, x) => l.filter((v) => eq(v, x)).length,
  remove: (l, x) => { for (let i = 0; i < l.length; i++) if (eq(l[i], x)) { l.splice(i, 1); return; } throw new ValueError('list.remove(x): x not in list'); },
  pop: (l, i) => { if (l.length === 0) throw new IndexError('pop from empty list'); if (i === undefined) return l.pop(); const k = i < 0 ? l.length + i : i; if (k < 0 || k >= l.length) throw new IndexError('pop index out of range'); return l.splice(k, 1)[0]; },
  insert: (l, i, x) => { const k = i < 0 ? Math.max(0, l.length + i) : Math.min(i, l.length); l.splice(k, 0, x); },
  sort: (l, f, key) => { if (key) l.sort((a, b) => cmp(key(a), key(b))); else l.sort(f ?? cmp); },
  reverse: (l) => { l.reverse(); },
  __contains__: (l, x) => contains(l, x),
  __len__: (l) => l.length,
};

/** `obj.name(args)` where obj may be a builtin type */
export function m(o: any, name: string, ...a: any[]): any {
  if (typeof o === 'string') { const f = STR_METHODS[name]; if (f) return f(o, ...a); }
  else if (Array.isArray(o)) { const f = LIST_METHODS[name]; if (f) return f(o, ...a); }
  else if (o instanceof PyDict) {
    switch (name) {
      case 'items': case 'iteritems': return o.items();
      case 'keys': case 'iterkeys': return o.keys();
      case 'values': case 'itervalues': return o.values();
      case 'has_key': return o.has(a[0]);
      case 'get': return o.get(a[0], a.length > 1 ? a[1] : null);
      case 'pop': return o.pop(a[0], ...a.slice(1));
      case '__contains__': return o.has(a[0]);
      case '__len__': return o.size;
      default: if (typeof (o as any)[name] === 'function') return (o as any)[name](...a);
    }
  } else if (o instanceof PySet) {
    if (name === 'add') return o.add(a[0]);
    if (name === 'remove' || name === 'discard') return o.remove(a[0]);
  }
  if (o === null || o === undefined) throw new AttributeError("'NoneType' object has no attribute '" + name + "'");
  const f = o[name];
  if (typeof f !== 'function') throw new AttributeError("object has no attribute '" + name + "'");
  return f.apply(o, a);
}

// ----------------------------------------------------------------------------------------------------------------------------- objects
const boundFns = new WeakMap<object, Map<string, Function>>();
/** `obj.method` used as a value: the same function every time (Python bound methods compare equal) */
export function bind(o: any, name: string): any {
  const v = o[name];
  if (typeof v !== 'function') return v;
  if (v.__pyclass) return v;
  let mp = boundFns.get(o);
  if (!mp) { mp = new Map(); boundFns.set(o, mp); }
  const cached = mp.get(name);
  if (cached && (cached as any).__src === v) return cached;
  const b: any = v.bind(o);
  b.__src = v;
  mp.set(name, b);
  return b;
}
export function hasattr(o: any, name: string): boolean { return o !== null && o !== undefined && (o as any)[name] !== undefined; }
export function getattr(o: any, name: string, d?: any): any {
  const v = o?.[name];
  if (v === undefined) { if (d !== undefined) return d; throw new AttributeError(name); }
  return v;
}
export function setattr(o: any, name: string, v: any): void { o[name] = v; }
export function isinstance(o: any, c: any): boolean {
  if (Array.isArray(c)) return c.some((x) => isinstance(o, x));
  if (c === str) return typeof o === 'string';
  if (c === int) return typeof o === 'number' && Number.isInteger(o);
  if (c === float) return typeof o === 'number';
  if (c === list) return Array.isArray(o);
  if (c === dict) return o instanceof PyDict;
  if (c === bool) return typeof o === 'boolean';
  return typeof c === 'function' && o instanceof c;
}
export function type(o: any): any { return o === null || o === undefined ? null : typeof o === 'object' ? o.constructor : typeof o; }
export function callable(o: any): boolean { return typeof o === 'function'; }
export function dir(o: any): string[] {
  const out = new Set<string>();
  for (let p = o; p && p !== Object.prototype; p = Object.getPrototypeOf(p)) for (const k of Object.getOwnPropertyNames(p)) out.add(k);
  return Array.from(out).sort();
}
export function id(o: any): number { if (!objIds.has(o)) objIds.set(o, nextObjId++); return objIds.get(o)!; }
export function print(...a: any[]): void { console.log(...a.map(str)); }

/** class base for the generated classes */
export class PyObject {}

// ----------------------------------------------------------------------------------------------------------------------------- stdlib
function mulberry(seed: number): () => number {
  let a = seed >>> 0;
  return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
let rng: () => number = Math.random;
export const random = {
  seed(s?: any): void { rng = s === undefined || s === null ? Math.random : mulberry(typeof s === 'number' ? Math.floor(s * 1000) : Array.from(String(s)).reduce((h, c) => (h * 31 + c.charCodeAt(0)) | 0, 7)); },
  random(): number { return rng(); },
  uniform(a: number, b: number): number { return a + (b - a) * rng(); },
  randint(a: number, b: number): number { return a + Math.floor(rng() * (b - a + 1)); },
  randrange(a: number, b?: number, step = 1): number {
    if (b === undefined) { b = a; a = 0; }
    const n = Math.ceil((b - a) / step);
    return a + step * Math.floor(rng() * n);
  },
  choice(seq: any): any { if (seq instanceof PyRange) return seq.__getitem__(Math.floor(rng() * seq.__len__())); const l = Array.isArray(seq) || typeof seq === 'string' ? seq : Array.from(iter(seq)); if (len(l) === 0) throw new IndexError('list index out of range'); return l[Math.floor(rng() * l.length)]; },
  shuffle(l: any[]): void { for (let i = l.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [l[i], l[j]] = [l[j], l[i]]; } },
  sample(seq: any, k: number): any[] { const l = Array.from(iter(seq)); random.shuffle(l); return l.slice(0, k); },
};
export const math = {
  pi: Math.PI, e: Math.E,
  floor: Math.floor, ceil: Math.ceil, sqrt: Math.sqrt, sin: Math.sin, cos: Math.cos, tan: Math.tan, atan: Math.atan, atan2: Math.atan2, acos: Math.acos, asin: Math.asin,
  pow: Math.pow, exp: Math.exp, log: (x: number, b?: number) => (b === undefined ? Math.log(x) : Math.log(x) / Math.log(b)), fabs: Math.abs,
  radians: (d: number) => (d * Math.PI) / 180, degrees: (r: number) => (r * 180) / Math.PI, hypot: Math.hypot, fmod: (a: number, b: number) => a % b,
};
export const time = { time: () => Date.now() / 1000, sleep: (_s: number) => undefined, clock: () => performance.now() / 1000 };
export const gc = { collect: () => 0 };
export const sys = {
  argv: ['main.py'] as string[], platform: 'linux2', maxint: 2147483647, version: '2.6',
  exc_info: (): any[] => [null, null, null],
  exit: (c?: number): never => { throw new SystemExit(c); },
  stdout: { write: (_s: string) => undefined },
};
export const platform = { system: () => 'Linux' };
export const bisect = {
  bisect: (a: any[], x: any): number => { let lo = 0, hi = a.length; while (lo < hi) { const mid = (lo + hi) >> 1; if (cmp(x, a[mid]) < 0) hi = mid; else lo = mid + 1; } return lo; },
  bisect_left: (a: any[], x: any): number => { let lo = 0, hi = a.length; while (lo < hi) { const mid = (lo + hi) >> 1; if (cmp(a[mid], x) < 0) lo = mid + 1; else hi = mid; } return lo; },
};
export const collections = { defaultdict: (f: () => any) => new DefaultDict(f) };
export const string = {
  maketrans: (a: string, b: string): Map<string, string> => { const t = new Map<string, string>(); for (let i = 0; i < a.length; i++) t.set(a[i], b[i]); return t; },
  letters: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', digits: '0123456789', lowercase: 'abcdefghijklmnopqrstuvwxyz', uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
};
export const base64 = {
  b64encode: (s: string): string => btoa(s),
  b64decode: (s: string): string => atob(s),
};

export class UUID {
  constructor(public hex: string) {}
  __str__(): string { return this.hex; }
  __eq__(o: any): boolean { return o instanceof UUID && o.hex === this.hex; }
  __hash__(): string { return this.hex; }
}
export const uuid = {
  UUID: (s: string) => new UUID(s.toLowerCase()),
  uuid4: (): UUID => {
    const b = Array.from({ length: 16 }, () => Math.floor(Math.random() * 256));
    b[6] = (b[6] & 0x0f) | 0x40; b[8] = (b[8] & 0x3f) | 0x80;
    const h = b.map((x) => x.toString(16).padStart(2, '0')).join('');
    return new UUID(`${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`);
  },
};

// ---- the files of the game (characters, scores, settings): a small virtual file system saved in localStorage
const FS_PREFIX = 'ded.fs:';
const memfs = new Map<string, string>();
function fsGet(p: string): string | null {
  if (memfs.has(p)) return memfs.get(p)!;
  try { return localStorage.getItem(FS_PREFIX + p); } catch { return null; }
}
function fsSet(p: string, v: string): void {
  memfs.set(p, v);
  try { localStorage.setItem(FS_PREFIX + p, v); } catch { /* storage unavailable: kept in memory */ }
}
export class PyFile {
  private pos = 0;
  private buf = '';
  constructor(private path: string, private mode: string) {
    if (mode.startsWith('r')) {
      const t = fsGet(path);
      if (t === null) throw new IOError("[Errno 2] No such file or directory: '" + path + "'");
      this.buf = t;
    } else if (mode.startsWith('a')) this.buf = fsGet(path) ?? '';
  }
  readline(): string {
    if (this.pos >= this.buf.length) return '';
    const i = this.buf.indexOf('\n', this.pos);
    const end = i < 0 ? this.buf.length : i + 1;
    const l = this.buf.slice(this.pos, end);
    this.pos = end;
    return l;
  }
  readlines(): string[] { const out: string[] = []; for (let l = this.readline(); l !== ''; l = this.readline()) out.push(l); return out; }
  read(): string { const r = this.buf.slice(this.pos); this.pos = this.buf.length; return r; }
  write(s: string): void { this.buf += s; }
  flush(): void { /* written on close */ }
  close(): void { if (!this.mode.startsWith('r')) fsSet(this.path, this.buf); }
}
export function open(path: string, mode = 'r'): PyFile { return new PyFile(path, mode.replace('b', '')); }
export const os = {
  sep: '/',
  path: {
    join: (...p: string[]): string => p.filter((x) => x !== '').join('/'),
    exists: (p: string): boolean => fsGet(p) !== null,
    isfile: (p: string): boolean => fsGet(p) !== null,
    isdir: (_p: string): boolean => true,
    dirname: (p: string): string => p.slice(0, Math.max(0, p.lastIndexOf('/'))),
    basename: (p: string): string => p.slice(p.lastIndexOf('/') + 1),
    expanduser: (p: string): string => p,
  },
  mkdir: (_p: string): void => undefined,
  makedirs: (_p: string): void => undefined,
  remove: (p: string): void => { memfs.delete(p); try { localStorage.removeItem(FS_PREFIX + p); } catch { /* none */ } },
  listdir: (p: string): string[] => {
    const out = new Set<string>();
    const pre = p === '' ? '' : p + '/';
    const names: string[] = [...memfs.keys()];
    try { for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i)!; if (k.startsWith(FS_PREFIX)) names.push(k.slice(FS_PREFIX.length)); } } catch { /* none */ }
    for (const n of names) if (n.startsWith(pre)) out.add(n.slice(pre.length).split('/')[0]);
    return Array.from(out);
  },
  getcwd: (): string => '',
};
export const builtins = { Exception, IOError, ValueError, KeyError, IndexError, AttributeError, ZeroDivisionError, SystemExit, StopIteration, OSError, AssertionError, NameError };

// ----------------------------------------------------------------------------------------------------------------------------- lazy module imports
// The Python code imported some modules inside functions to break import cycles; the generated modules register themselves here so those imports
// resolve when the function runs.
const registry = new Map<string, any>();
export function register(path: string, ns: any): void { registry.set(path, ns); }
export function lazy(path: string): any {
  return new Proxy({}, { get: (_t, k) => { const m = registry.get(path); if (!m) throw new Error('module not loaded: ' + path); return m[k as string]; } });
}
export function lazyName(path: string, name: string): any {
  const target = function () { /* proxy target */ };
  return new Proxy(target, {
    apply: (_t, _this, args) => { const m = registry.get(path); if (!m) throw new Error('module not loaded: ' + path); return m[name](...args); },
    construct: (_t, args) => { const m = registry.get(path); if (!m) throw new Error('module not loaded: ' + path); return new m[name](...args); },
    get: (_t, k) => { const m = registry.get(path); return m?.[name]?.[k as string]; },
  });
}
