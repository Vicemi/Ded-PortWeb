// framework/external.py: things that lived outside the activity (Sugar journal, browser).
export const data_path = '';
export const is_sugar = false;
export function open_browser(uri: string, _title = '', _description = ''): void { try { window.open(uri, '_blank', 'noopener'); } catch { /* blocked */ } }
export function other_activities_running(): boolean { return false; }
export const execute_package = null;
