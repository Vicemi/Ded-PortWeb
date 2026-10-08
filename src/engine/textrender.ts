// framework/stage.py: render_text / hittest_text / draw_cursor (the drawing half of the rich text engine; the layout half is textlayout.ts).
import type { Font } from './font';
import { Surface, type Color } from './pygame';
import { wrap_text_in_lines, type AdditionalFonts, type BreakTarget, type FontData, type LinePart } from './textlayout';

const MAXINT = Number.MAX_SAFE_INTEGER;

type PartSurf = [Surface, FontData];
type LineSurf = [number, number, PartSurf[]];

/** Renders the (wrapped) text into a surface. Returns [surface, whether all the text fit in the box]. */
export function render_text(text: string, font: Font, additional_fonts: AdditionalFonts, line_height: number, max_width: number, max_height: number,
  antialias: boolean, color: Color, background: Color | null, h_align: number, break_text_into: BreakTarget | null | undefined,
  cursor_index = -1, editable = false): [Surface, boolean] {
  let max_line_width: number;
  if (max_width === -1) max_line_width = MAXINT;
  else { max_line_width = max_width; if (editable) max_line_width -= 2; }
  const [lines, remaining_lines0, break_color, break_font] = wrap_text_in_lines(text, false, color, font, line_height, additional_fonts, max_line_width, max_height, break_text_into);
  let remaining_lines = remaining_lines0;
  const line_surfs: LineSurf[] = [];
  let width = 0;
  const text_background = background === null || (background.length >= 4 && background[3] !== 255) ? null : background;
  let height = 0;
  const line_count = lines.length;
  for (let i = 0; i < line_count; i++) {
    const line = lines[i];
    const part_surfs: PartSurf[] = [];
    let line_surfs_width = 0, line_surfs_height = 0;
    for (const line_part of line) {
      const part_font_data = line_part[1];
      const part_surf = text_background === null ? part_font_data[0].render(line_part[2], antialias, line_part[0])
        : part_font_data[0].render(line_part[2], antialias, line_part[0], text_background);
      line_surfs_width += part_surf.get_width();
      part_surfs.push([part_surf, part_font_data]);
      const part_height = i < line_count - 1 ? part_font_data[1] : Math.max(font.get_linesize(), part_font_data[1]);
      if (part_height > line_surfs_height) line_surfs_height = part_height;
    }
    line_surfs.push([line_surfs_width, line_surfs_height, part_surfs]);
    if (line_surfs_width > width) width = line_surfs_width;
    height += line_surfs_height;
  }
  let extra_width: number;
  if (cursor_index !== -1) {
    if (height === 0) height = line_height;
    const cursor_text_data = wrap_text_in_lines(text, true, color, font, line_height, additional_fonts, max_line_width, max_height, break_text_into);
    draw_cursor(cursor_index, text, cursor_text_data[0], line_surfs, width, line_height, font);
    extra_width = 2;
  } else if (editable) extra_width = 2;
  else extra_width = 0;
  const surface = new Surface(width + extra_width, height, true);
  if (background !== null) surface.fill(background);
  let line_y = 0;
  for (let i = 0; i < line_surfs.length; i++) {
    let line_x = 0;
    if (h_align === 1) line_x = 0;
    else if (h_align === 2) line_x = Math.max(0, Math.floor((width - line_surfs[i][0]) / 2));
    else if (h_align === 3) line_x = Math.max(0, width - line_surfs[i][0]);
    const parts_height = line_surfs[i][1];
    const line_part_surfs = line_surfs[i][2];
    let max_ascent = -1;
    for (const part_surf_data of line_part_surfs) {
      const part_surf = part_surf_data[0];
      const part_height = part_surf_data[1][1];
      const y_adjust = part_surf_data[1][2];
      if (part_height >= parts_height) {
        surface.blit(part_surf, [line_x, line_y + y_adjust]);
      } else {
        // a part shorter than the line is aligned to the baseline of the tallest one
        if (max_ascent === -1) {
          for (const part_surf_data2 of line_part_surfs) {
            const ascent = part_surf_data2[1][0].get_ascent();
            if (ascent > max_ascent) max_ascent = ascent;
          }
        }
        const margin = max_ascent - part_surf_data[1][0].get_ascent();
        surface.blit(part_surf, [line_x, line_y + margin + y_adjust]);
      }
      line_x += part_surf.get_width();
    }
    line_y += parts_height;
  }
  if (break_text_into) {
    let k = 0;
    while (k < remaining_lines.length) {
      const line = remaining_lines[k];
      let only_spaces = true;
      for (const c of line) if (c !== ' ' && c !== '\r' && c !== '\t') { only_spaces = false; break; }
      if (only_spaces) k++; else break;
    }
    if (k > 0) remaining_lines = remaining_lines.slice(k);
    let remaining_text = remaining_lines.join('\n');
    if (break_font[0] !== font && break_font[2] !== null) remaining_text = '&#f:' + break_font[2] + '!' + remaining_text;
    if (break_color !== color) remaining_text = '&#c' + break_color.join(',') + '!' + remaining_text;
    break_text_into.set_text(remaining_text);
  }
  return [surface, remaining_lines.length === 0];
}

function draw_cursor(cursor_index: number, _text: string, lines: LinePart[][], line_surfs: LineSurf[], _width: number, line_height: number, font: Font): void {
  let line_index = 0, text_index = 0;
  while (line_index < lines.length) {
    const line = lines[line_index];
    let part_index = 0;
    while (part_index < line.length) {
      const part = line[part_index];
      const part_text = part[2];
      if (cursor_index >= text_index && cursor_index < text_index + part_text.length) {
        const part_surf = line_surfs[line_index][2][part_index][0];
        const char_index = cursor_index - text_index;
        const x = part[1][0].size(part_text.slice(0, char_index))[0];
        draw_cursor_in_surface(part_surf, x);
        return;
      }
      text_index += part_text.length;
      part_index++;
    }
    line_index++;
  }
  line_index = lines.length - 1;
  if (line_index < 0) {
    const new_surf = new Surface(2, line_height, true);
    draw_cursor_in_surface(new_surf, 0);
    line_surfs.push([2, line_height, [[new_surf, [font, line_height, 0, null]]]]);
  } else {
    const line = lines[line_index];
    const part_index = line.length - 1;
    if (part_index >= 0) {
      const line_part_surfs = line_surfs[line_index][2];
      const part_surf_data = line_part_surfs[part_index];
      const part_surf = part_surf_data[0];
      const [w, h] = part_surf.get_size();
      const new_surf = new Surface(w + 2, h, true);
      new_surf.blit(part_surf, [0, 0]);
      line_part_surfs[part_index] = [new_surf, part_surf_data[1]];
      draw_cursor_in_surface(new_surf, w);
    }
  }
}

function draw_cursor_in_surface(surf: Surface, x: number): void {
  surf.fill([0, 0, 0], [x, 1, 2, surf.get_height() - 2]);
}

/** Index of the character under the point (x, y) of a text box */
export function hittest_text(text: string, x: number, y: number, font: Font, additional_fonts: AdditionalFonts, line_height: number, width: number,
  height: number, _antialias: boolean, h_align: number, editable = false, break_text_into: BreakTarget | null = null): number {
  let max_line_width = width;
  if (editable) max_line_width -= 2;
  const result = wrap_text_in_lines(text, false, [0, 0, 0], font, line_height, additional_fonts, max_line_width, height, break_text_into);
  const lines = result[0];
  let line_y = 0, line_index = 0, index = 0;
  while (line_index < lines.length - 1 && line_y + line_height < y) {
    for (const line_part of lines[line_index]) index += line_part[2].length;
    if (index < text.length && text[index] === '\n') index++;
    line_y += line_height;
    line_index++;
  }
  if (line_index < lines.length) {
    let part_index = 0;
    const line = lines[line_index];
    let line_x = 0;
    if (h_align !== 1) {
      let line_width = 0;
      for (const part of line) line_width += part[1][0].size(part[2])[0];
      if (h_align === 2) line_x = Math.floor((width - line_width) / 2);
      else if (h_align === 3) line_x = width - line_width;
    }
    let found = false;
    while (part_index < line.length && !found) {
      const part = line[part_index];
      let char_index = 0;
      const part_font = part[1][0];
      const part_text = part[2];
      let char_width = 0;
      while (char_index < part_text.length) {
        char_index++;
        char_width = part_font.size(part_text.slice(0, char_index))[0];
        if (line_x + char_width < x) index++;
        else { found = true; break; }
      }
      line_x += char_width;
      part_index++;
    }
    if (!found && index > 0 && line_index + 1 < lines.length) index--;
  }
  return index;
}
