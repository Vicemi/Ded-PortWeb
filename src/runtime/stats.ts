// framework/stats.py: anonymous play statistics sent to a server. Not kept in the web version (the game still calls them).
export class Stats {
  start_time_event(_code: string): void { /* nothing */ }
  end_time_event(_code: string, _accumulate?: string | null): void { /* nothing */ }
  increment_count_event(_code: string): void { /* nothing */ }
  get_data(): unknown[] { return []; }
  save_if_pending(): void { /* nothing */ }
}
export function report_error(..._a: unknown[]): void { /* nothing */ }
export function get_error_data(_size?: number): string | null { return null; }
export function delete_error_data(): void { /* nothing */ }
