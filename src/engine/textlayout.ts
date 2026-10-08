// framework/stage.py: render_text / wrap_text_in_lines / wrap_line / hittest_text / draw_cursor, the rich text engine of the game.
// Text can carry inline controls: `&#c255,0,0!` changes the colour, `&#c!` restores it, `&#f:name!` selects one of the additional fonts and `&#f!`
// restores the main one. Words are wrapped to the box width, long words are cut with a hyphen, and text that does not fit can flow to another item.
import type { Font } from './font';
import { Surface, type Color } from './pygame';

/** the font (and metrics) in use for a piece of a line: [font, line height, y adjust, name, (extra)] */
export type FontData = [Font, number, number, string | null, (null | undefined)?];
/** a piece of a wrapped line: [colour, font data, text] */
export type LinePart = [Color, FontData, string];
export type AdditionalFonts = Record<string, [Font, number] | [Font, number, number]>;

export interface BreakTarget { set_text(text: string): void }

const MAXINT = Number.MAX_SAFE_INTEGER;

/** Python str.splitlines() */
export function splitlines(text: string): string[] {
  if (text === '') return [];
  const parts = text.split(/\r\n|\n|\r/);
  if (/(\r\n|\n|\r)$/.test(text)) parts.pop();
  return parts;
}

export function wrap_text_in_lines(text: string, hit_test: boolean, color: Color, font: Font, line_height: number, additional_fonts: AdditionalFonts,
  max_line_width: number, max_height: number, break_text_into: BreakTarget | null | undefined): [LinePart[][], string[], Color, [Font, number, string | null]] {
  const lines: LinePart[][] = [];
  const remaining_lines: string[] = [];
  const current_height = [0];
  const current_color: Color[] = [color];
  const current_font: FontData = [font, line_height, 0, null];
  for (const line of splitlines(text)) {
    wrap_line(line, hit_test, font, line_height, additional_fonts, lines, current_height, max_line_width, max_height, remaining_lines, color, current_color, current_font, false, break_text_into);
  }
  // (the original returns only [font, line height] and then tries to concatenate the line height to a string: a latent bug when the text
  // ends with another font selected; the name of the font is returned here instead)
  return [lines, remaining_lines, current_color[0], [current_font[0], current_font[1], current_font[3] ?? null]];
}

function wrap_line(line: string, hit_test: boolean, font: Font, line_height: number, additional_fonts: AdditionalFonts, lines: LinePart[][],
  current_height: number[], max_width: number, max_height: number, remaining_lines: string[], default_color: Color, current_color: Color[],
  current_font: FontData, add_ellipsis: boolean, break_text_into: BreakTarget | null | undefined): void {
  if (max_height !== -1 && current_height[0] + line_height > max_height) {
    remaining_lines.push(line);
    return;
  }
  const line_width0 = current_font[0].size(line)[0];
  if (line_width0 <= max_width && line.indexOf('&#') === -1) {
    lines.push([[current_color[0], current_font.slice() as FontData, line]]);
    current_height[0] += current_font[1];
    return;
  }
  let start = 0;
  let new_line = '';
  let empty_line = true;
  let line_width = 0;
  const space_width = current_font[0].size(' ')[0];
  let line_parts: LinePart[] = [];
  let line_parts_height = 0;
  while (start < line.length) {
    const next_control = line.indexOf('&#', start);
    let line_part: string, next_word: string;
    let next_control_end = -1;
    if (next_control === -1) {
      line_part = line.slice(start);
      next_word = '';
    } else {
      line_part = line.slice(start, next_control);
      next_control_end = line.indexOf('!', next_control);
      if (next_control_end === -1) next_control_end = line.length;
      const k = line.indexOf(' ', next_control_end + 1);
      next_word = k === -1 ? line.slice(next_control_end + 1) : line.slice(next_control_end + 1, k);
    }
    while (next_word.startsWith('&#')) {
      const control_end = next_word.indexOf('!');
      if (control_end === -1) break;
      next_word = next_word.slice(control_end + 1);
    }
    if (line_part !== '') {
      const words = line_part.split(' ');
      new_line = '';
      for (let i = 0; i < words.length; i++) {
        let add_word: string | null = words[i];
        let add_space = true;
        while (add_word !== null) {
          let word: string = add_word;
          add_word = null;
          let word_width = current_font[0].size(word)[0];
          let extra_width: number;
          if (i === words.length - 1) {
            const kk = next_word.indexOf('&#');
            const next_word_text = kk === -1 ? next_word : next_word.slice(0, kk);
            extra_width = current_font[0].size(next_word_text)[0];
          } else extra_width = 0;
          if (word_width > max_width) {
            if (add_ellipsis) {
              const end_width = current_font[0].size('...')[0];
              if (end_width > max_width) { word = ''; word_width = 0; }
              else {
                let k = word.length;
                while (k >= 0 && word_width + end_width > max_width) { k--; word_width = current_font[0].size(word.slice(0, k))[0]; }
                word = hit_test ? word.slice(0, k) : word.slice(0, k) + '...';
                word_width += end_width;
              }
            } else {
              const is_last_line = current_height[0] + current_font[1] * 2 >= max_height;
              if (!is_last_line || break_text_into) {
                const end_width = current_font[0].size('-')[0];
                if (end_width > max_width) { word = ''; word_width = 0; }
                else {
                  let k = word.length;
                  while (k >= 0 && word_width + end_width > max_width) { k--; word_width = current_font[0].size(word.slice(0, k))[0]; }
                  add_word = word.slice(k);
                  word = hit_test ? word.slice(0, k) : word.slice(0, k) + '-';
                  word_width += end_width;
                }
              } else {
                let k = word.length;
                while (k >= 0 && word_width > max_width) { k--; word_width = current_font[0].size(word.slice(0, k))[0]; }
                word = word.slice(0, k);
              }
            }
          }
          if (empty_line && line_width + word_width + extra_width <= max_width) {
            new_line = word;
            line_width += word_width;
            empty_line = false;
          } else if (line_width + word_width + space_width + extra_width <= max_width) {
            new_line += ' ' + word;
            line_width += word_width + space_width;
          } else {
            if (new_line !== '') {
              if (word !== '' && add_space) new_line += ' ';
              line_parts.push([current_color[0], current_font.slice() as FontData, new_line]);
              line_parts_height = Math.max(line_parts_height, current_font[1]);
            }
            if (line_parts.length > 0) {
              lines.push(line_parts);
              current_height[0] += line_parts_height;
            }
            line_parts = [];
            line_parts_height = 0;
            if (word === '') { new_line = ''; line_width = 0; empty_line = true; }
            else { new_line = word; line_width = word_width; }
            if (max_height !== -1 && current_height[0] + line_height >= max_height) {
              let text = words.slice(i).join(' ');
              if (next_control !== -1) text += line.slice(next_control);
              remaining_lines.push(text);
              return;
            }
          }
          add_space = false;
        }
      }
    }
    if (next_control === -1) start = line.length;
    else {
      if (next_control_end >= next_control + 3) {
        const c = line[next_control + 2];
        if (c === 'c' || c === 'f') {
          if (new_line !== '') {
            line_parts.push([current_color[0], current_font.slice() as FontData, new_line]);
            line_parts_height = Math.max(line_parts_height, current_font[1]);
            new_line = '';
            empty_line = true;
          }
          if (next_control + 3 === next_control_end) {
            if (c === 'c') current_color[0] = default_color;
            else {
              current_font[0] = font; current_font[1] = line_height; current_font[2] = 0; current_font[3] = null;
            }
          } else if (c === 'c') {
            const rgb = line.slice(next_control + 3, next_control_end).split(',');
            current_color[0] = [parseInt(rgb[0], 10), parseInt(rgb[1], 10), parseInt(rgb[2], 10)];
          } else {
            const font_name = line.slice(next_control + 4, next_control_end);
            const sel = additional_fonts[font_name];
            if (sel.length >= 3) { current_font[0] = sel[0]; current_font[1] = sel[1]; current_font[2] = sel[2] as number; current_font[3] = font_name; current_font.length = 4; }
            else { current_font[0] = sel[0]; current_font[1] = sel[1]; current_font[2] = 0; current_font[3] = font_name; current_font[4] = null; }
            if (current_font[1] === 0) current_font[1] = current_font[0].get_linesize();
          }
        }
      }
      start = next_control_end + 1;
    }
  }
  if (new_line !== '') {
    line_parts.push([current_color[0], current_font.slice() as FontData, new_line]);
    line_parts_height = Math.max(line_parts_height, current_font[1]);
  }
  if (line_parts.length > 0) {
    lines.push(line_parts);
    current_height[0] += line_parts_height;
  }
}
