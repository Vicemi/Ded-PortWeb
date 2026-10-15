// the notes book with many notes of every type: nothing may overlap or get cut, every note of a letter is reachable by pages
import { toHub } from './lib.mjs';
export default async (dev) => {
  toHub(dev);
  const ds = dev.game.datastore, cp = ds.user_character_progress;
  const all = [];
  for (const byType of Object.values(ds.department_type_index.items ? Object.fromEntries(ds.department_type_index.items()) : ds.department_type_index)) {
    const entries = byType.items ? [...byType.items()] : Object.entries(byType);
    for (const [, list] of entries) for (const n of list) all.push(n);
  }
  // 60 notes that start with the same letter (the worst case) plus a spread of the others
  const byLetter = {};
  for (const n of all) (byLetter[String(n.name[0]).toUpperCase()] ??= []).push(n);
  const biggest = Object.entries(byLetter).sort((a, b) => b[1].length - a[1].length)[0];
  cp.notes.length = 0;
  for (const n of biggest[1].slice(0, 60)) cp.notes.push(n);
  for (const [l, list] of Object.entries(byLetter)) if (l !== biggest[0]) for (const n of list.slice(0, 2)) cp.notes.push(n);
  console.log('notes:', cp.notes.length, 'letter', biggest[0], 'x', Math.min(60, biggest[1].length));
  dev.click(535, 405, 60);
  dev.go(100);
  const st = dev.game.stage;
  const nb = st.notes;
  if (!nb) throw new Error('notes did not open');
  dev.save('notes_p1');
  // page through the first letter with the next arrow and report the items of each page
  const pages = [];
  for (let i = 0; i < 12; i++) {
    // the written lines (not the hover masks, that may touch)
    const items = nb.page_items.filter((x) => typeof x.get_text === 'function');
    const rects = items.map((m) => [m.get_text(), m.get_left(), m.get_top(), m.get_width(), Math.round((m.get_height() - 3) / 22) * 22]);   // the text box has 3 px of descender
    for (const r of rects) if (r[4] !== nb.note_lines(r[0]) * 22) throw new Error('line count differs from the real text: ' + r[0] + ' ' + r[4]);
    pages.push({ letter: nb.selected_letter[0], page: nb.current_page, rects });
    dev.save('notes_pg' + i);
    const before = nb.selected_letter[0];
    dev.click(318, 404, 40);
    if (nb.selected_letter[0] !== before && i > 8) break;
  }
  // overlap + bounds check of every page
  let bad = 0;
  for (const p of pages) {
    for (let i = 0; i < p.rects.length; i++) {
      const a = p.rects[i];
      if (a[2] + a[4] > 390 || a[1] + a[3] > 545) { bad++; console.log('OUT', p.letter, p.page, a.join(',')); }
      for (let j = i + 1; j < p.rects.length; j++) {
        const b = p.rects[j];
        if (a[1] < b[1] + b[3] && b[1] < a[1] + a[3] && a[2] < b[2] + b[4] && b[2] < a[2] + a[4]) { bad++; console.log('OVERLAP', p.letter, p.page, a.join(','), '|', b.join(',')); }
      }
    }
  }
  console.log('pages', pages.map((p) => `${p.letter}${p.page}:${p.rects.length}`).join(' '), 'problems', bad);
  if (bad) throw new Error('notes layout problems: ' + bad);
  // the arrow keys turn the pages too
  nb.select_letter(nb.letters_data.find((l) => l[0] === biggest[0])); dev.go(5);
  dev.key(dev.K.RIGHT, 10);
  if (nb.current_page !== 2) throw new Error('right arrow key did not turn the page: ' + nb.current_page);
  dev.key(dev.K.LEFT, 10);
  if (nb.current_page !== 1) throw new Error('left arrow key did not turn the page back');
  // hover over the entry of 3 lines (the highlight must cover it all) and open the longest text
  nb.select_letter(nb.letters_data.find((l) => l[0] === biggest[0])); dev.go(5);
  const three = nb.page_items.find((x) => x.note && nb.note_lines(x.note.get_full_name()) >= 3);
  if (three) { dev.move(three.get_left() + 60, three.get_top() + 30, 10); dev.save('notes_hover3'); }
  const desc = (n) => (n.description ?? '') + (n.description1 ?? '') + (n.description2 ?? '');
  const longest = all.reduce((a, b) => (desc(b).length > desc(a).length ? b : a));
  console.log('longest text:', longest.name, desc(longest).length);
  cp.notes.length = 0; cp.notes.push(longest);
  dev.key(dev.K.ESCAPE, 20);
  dev.click(535, 405, 60);
  dev.stage_notes = dev.game.stage.notes;
  dev.game.stage.notes.select_letter(dev.game.stage.notes.letters_data.find((l) => l[0] === String(longest.name[0]).toUpperCase())); dev.go(5);
  const only = dev.game.stage.notes.page_items.find((x) => x.note);
  dev.click(only.get_left() + 50, only.get_top() + 8, 40);
  dev.save('notes_popup_long');
};
