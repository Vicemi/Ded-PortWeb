// @ts-nocheck
// Generated from the original game code (see MODLOG.md). Do not edit by hand.
import * as py from '../../runtime/py';
import { Item } from '../../runtime/prelude';
import { ItemEvent } from '../../runtime/prelude';
import { ItemImage } from '../../runtime/prelude';
import { ItemMask } from '../../runtime/prelude';
import { ItemText } from '../../runtime/prelude';
import { KEYDOWN } from '../../runtime/prelude';
import { K_ESCAPE } from '../../runtime/prelude';
import { Layer } from '../../runtime/prelude';
import * as animations from '../../engine/animations';
import * as assets from '../../engine/assets';
import { pygame } from '../../runtime/prelude';
import { random } from '../../runtime/py';
import * as $self from './notes';

export let LETTER_ROLLOVER_TIMER_KEY: any = "show_note_letter_rollover";
export class Notes extends Item {
  constructor(stage: any) {
    super();
    this.stage = stage;
    this.layer = new Layer();
    this.popup_layer = null;
    this.selected_letter = null;
    this.page_items = [];
    this.pending_changes_to_save = false;
    this.last_hover_show = null;
    this.line_font = assets.load_font("gapstown.ttf", 22);
    this.click_sound = stage.click_sound;
    this.rollover_sound = stage.rollover_sound;
    this.popup_sound = stage.witness_popup_sound;
    this.notes_close_sound = assets.load_sound("GUI_Notes_Close.ogg");
    this.turn_page_sound = assets.load_sound("GUI_Turn_Page.ogg");
    this.note_fade_in_sound = assets.load_sound("fade.ogg");
    this.set_up();
    return;
  }
  close_notes(): any {
    this.stage.close_dialog(this.layer);
    return null;
  }
  select_first_page(): any {
    this.select_letter(py.getitem(this.letters_data, 0));
    return null;
  }
  set_letters_data(): any {
    this.letters_data = [["A", 150, 5, null, 143, 2, true, 152, 13], ["B", 174, 5, null, 167, 2, true, 176, 13], ["C", 200, 5, null, 193, 2, true, 203, 13], ["D", 225, 5, null, 218, 2, true, 227, 13], ["E", 249, 5, null, 242, 2, true, 251, 13], ["F", 271, 5, null, 265, 2, true, 273, 13], ["G", 294, 5, null, 286, 2, true, 295, 13], ["H", 317, 5, null, 310, 2, true, 319, 13], ["I", 338, 5, null, 332, 2, true, 340, 13], ["J", 359, 5, null, 353, 2, true, 363, 13], ["K", 381, 5, null, 374, 2, true, 383, 13], ["L", 402, 5, null, 395, 2, true, 404, 13], ["M", 119, 31, null, 110, 26, true, 120, 37], ["N", 143, 31, null, 135, 26, true, 144, 37], ["\xd1", 165, 31, null, 156, 26, true, 165, 37], ["O", 187, 31, null, 179, 26, true, 188, 37], ["P", 210, 31, null, 202, 26, true, 210, 37], ["Q", 233, 31, null, 225, 26, true, 233, 37], ["R", 257, 31, null, 249, 26, true, 258, 37], ["S", 282, 31, null, 274, 26, true, 283, 37], ["T", 305, 31, null, 297, 26, true, 306, 37], ["U", 328, 31, null, 320, 26, true, 329, 37], ["V", 351, 31, null, 343, 26, true, 351, 37], ["W", 373, 31, null, 365, 26, true, 373, 37], ["X", 398, 31, null, 391, 26, true, 399, 37], ["Y", 418, 31, null, 410, 26, true, 419, 37], ["Z", 441, 31, null, 432, 26, true, 442, 37]];
    return null;
  }
  set_up(): any {
    this.set_letters_data();
    this.set_background();
    this.set_up_menu_buttons();
    this.set_up_letters();
    this.set_up_new_notes();
    this.set_up_page();
    return null;
  }
  set_background(): any {
    let background_bottom, background_bottom_image, background_center, background_center_image, background_left, background_left_image, background_right, background_right_image, background_top, background_top_image: any;
    background_center_image = assets.load_image("p0_notes_center.jpg");
    background_center = new ItemImage(43, 61, background_center_image, null);
    py.m(this.layer, "add", background_center);
    background_top_image = assets.load_image("p0_notes_top.png");
    background_top = new ItemImage(15, 31, background_top_image, null);
    py.m(this.layer, "add", background_top);
    background_bottom_image = assets.load_image("p0_notes_bottom.png");
    background_bottom = new ItemImage(22, 421, background_bottom_image, null);
    py.m(this.layer, "add", background_bottom);
    background_left_image = assets.load_image("p0_notes_left.png");
    background_left = new ItemImage(2, 61, background_left_image, null);
    py.m(this.layer, "add", background_left);
    background_right_image = assets.load_image("p0_notes_right.png");
    background_right = new ItemImage(545, 61, background_right_image, null);
    py.m(this.layer, "add", background_right);
    return null;
  }
  set_up_menu_buttons(): any {
    this.close_button_image = assets.load_image("p0_button_close.png");
    this.close_button_image_rollover = assets.load_image("p0_button_close_rollover.png");
    this.next_button_image = assets.load_image("p0_button_next_active.png");
    this.next_button_image_rollover = assets.load_image("p0_button_next_rollover.png");
    this.previous_button_image = assets.load_image("p0_button_previous_active.png");
    this.previous_button_image_rollover = assets.load_image("p0_button_previous_rollover.png");
    this.close_button = new ItemImage(275, 392, this.close_button_image, null);
    this.close_button.set_rollover_image(this.close_button_image_rollover, this.rollover_sound);
    this.next_button = new ItemImage(305, 392, this.next_button_image, null);
    this.next_button.set_rollover_image(this.next_button_image_rollover, this.rollover_sound);
    this.previous_button = new ItemImage(245, 392, this.previous_button_image, null);
    this.previous_button.set_rollover_image(this.previous_button_image_rollover, this.rollover_sound);
    this.close_button.add_event_handler(ItemEvent.CLICK, py.bind(this, "button_click"));
    this.next_button.add_event_handler(ItemEvent.CLICK, py.bind(this, "button_click"));
    this.previous_button.add_event_handler(ItemEvent.CLICK, py.bind(this, "button_click"));
    py.m(this.layer, "add", this.close_button);
    py.m(this.layer, "add", this.next_button);
    py.m(this.layer, "add", this.previous_button);
    return null;
  }
  set_up_letters(): any {
    let color, image_name, item, letter, letter_char, letter_data, letter_hover_image, letter_image, letter_selected_bottom_image, letter_selected_top_image, letters, menu_back_image, note, notes: any;
    menu_back_image = assets.load_image("p0_notes_menuback.png");
    this.menu_back = new ItemImage(101, 5, menu_back_image, null);
    this.menu_back.add_event_handler(ItemEvent.CLICK, py.bind(this, "letters_click"));
    this.menu_back.add_event_handler(ItemEvent.MOUSE_MOVE, py.bind(this, "letters_mousemove"));
    this.menu_back.add_event_handler(ItemEvent.MOUSE_LEAVE, py.bind(this, "letters_leave"));
    py.m(this.layer, "add", this.menu_back);
    letter_hover_image = assets.load_image("p0_notes_menuhover.png");
    this.letter_hover = new ItemImage(101, 5, letter_hover_image, null);
    this.letter_hover.set_visible(false);
    py.m(this.layer, "add", this.letter_hover);
    letter_selected_top_image = assets.load_image("p0_notes_menuselected_top.png");
    this.letter_selected_top = new ItemImage(101, 5, letter_selected_top_image, null);
    this.letter_selected_top.set_visible(false);
    py.m(this.layer, "add", this.letter_selected_top);
    letter_selected_bottom_image = assets.load_image("p0_notes_menuselected_bottom.png");
    this.letter_selected_bottom = new ItemImage(101, 5, letter_selected_bottom_image, null);
    this.letter_selected_bottom.set_visible(false);
    py.m(this.layer, "add", this.letter_selected_bottom);
    letters = [];
    notes = this.stage.game.datastore.user_character_progress.notes;
    for (note of py.iter(notes)) {
      letter = this.get_note_letter(note);
      if (!py.contains(letters, letter)) {
        py.m(letters, "append", letter);
      }
    }
    for (letter_data of py.iter(this.letters_data)) {
      if (py.contains(letters, py.getitem(letter_data, 0))) {
        color = "red";
      } else {
        color = "grey";
      }
      letter_char = this.get_letter_image_char(py.getitem(letter_data, 0));
      image_name = py.add(py.add(py.add(py.add("p0_notes_menuwords_", color), "_"), letter_char), ".png");
      letter_image = assets.load_image(image_name);
      item = new ItemImage(py.getitem(letter_data, 7), py.getitem(letter_data, 8), letter_image);
      py.m(this.layer, "add", item);
    }
    return null;
  }
  set_up_new_notes(): any {
    let index, item, l, letter, letter_data, letter_selected_image, new_letters, new_notes, note: any;
    new_letters = [];
    index = py.add(this.layer.index_of(this.letter_hover), 1);
    new_notes = this.stage.game.datastore.user_character_progress.new_notes;
    for (note of py.iter(new_notes)) {
      letter = this.get_note_letter(note);
      if (!py.contains(new_letters, letter)) {
        py.m(new_letters, "append", letter);
      }
    }
    this.new_notes_letters = py.mkdict([]);
    if ((py.len(new_letters) > 0)) {
      letter_selected_image = assets.load_image("p0_notes_menuselected.png");
      py.m(new_letters, "sort");
      for (letter of py.iter(new_letters)) {
        letter_data = null;
        for (l of py.iter(this.letters_data)) {
          if (py.eq(py.getitem(l, 0), letter)) {
            letter_data = l;
            break;
          }
        }
        item = new ItemImage((py.getitem(letter_data, 1) - 5), py.add(py.getitem(letter_data, 2), 3), letter_selected_image);
        py.m(this.layer, "add", item, py.add(index, 1));
        index = index + 1;
        py.setitem(this.new_notes_letters, letter, item);
      }
    }
    return null;
  }
  set_up_page(): any {
    let headerline_image: any;
    headerline_image = assets.load_image("p0_notes_headerline.jpg");
    this.headerline = new ItemImage(66, 69, headerline_image);
    py.m(this.layer, "add", this.headerline);
    this.dot_image = assets.load_image("p0_notes_dot.png");
    this.item_hoversmall_image = assets.load_image("p0_notes_hoversmall.png");
    this.item_hoverbig_image = assets.load_image("p0_notes_hoverbig.png");
    return null;
  }
  set_up_popup_layer(): any {
    let background, background_image, close_button, close_button_image, close_button_image_rollover, font20, font24: any;
    this.popup_layer = new Layer();
    background_image = assets.load_image("p0_notes_popupbkg.png");
    background = new ItemImage(69, 21, background_image);
    py.m(this.popup_layer, "add", background);
    font24 = assets.load_font("powdrft_.ttf", 24);
    font20 = assets.load_font("powdrft_.ttf", 20);
    this.popup_title = new ItemText(106, 50, font24, 18, "", [157, 21, 21], null, 320, 37);
    py.m(this.popup_layer, "add", this.popup_title);
    this.popup_subtitle1 = new ItemText(106, 91, font20, 14, "", [51, 51, 51], null, 320, 18);
    py.m(this.popup_layer, "add", this.popup_subtitle1);
    this.popup_subtitle2 = new ItemText(106, 108, font20, 14, "", [102, 102, 102], null, 320, 18);
    py.m(this.popup_layer, "add", this.popup_subtitle2);
    this.popup_description = new ItemText(106, 158, font20, 16, "", [0, 0, 0], null, 380, 220);
    py.m(this.popup_layer, "add", this.popup_description);
    close_button_image = assets.load_image("btn_testigo_x_normal.png");
    close_button_image_rollover = assets.load_image("btn_testigo_x_rollover.png");
    close_button = new ItemImage(483, 40, close_button_image, null, true);
    close_button.set_rollover(close_button_image_rollover, this.rollover_sound);
    close_button.add_event_handler(ItemEvent.CLICK, py.bind(this, "popup_close_click"));
    py.m(this.popup_layer, "add", close_button);
    return null;
  }
  button_click(item: any, args: any): any {
    let has_items, index: any;
    if (py.eq(item, this.close_button)) {
      this.stage.render();
      this.notes_close_sound.play();
      if (py.truthy(this.pending_changes_to_save)) {
        this.stage.save_progress(false);
        this.pending_changes_to_save = false;
      }
      this.close_notes();
    }
    if (py.eq(item, this.next_button)) {
      has_items = py.getitem(this.load_letter_page(py.add(this.current_page, 1)), 0);
      if (!py.truthy(has_items)) {
        index = py.m(this.letters_data, "index", this.selected_letter);
        if ((py.add(index, 1) < py.len(this.letters_data))) {
          this.select_letter(py.getitem(this.letters_data, py.add(index, 1)));
        } else {
          this.load_letter_page((this.current_page - 1));
        }
      }
    } else if (py.eq(item, this.previous_button)) {
      if ((this.current_page > 1)) {
        this.load_letter_page((this.current_page - 1));
      } else {
        index = py.m(this.letters_data, "index", this.selected_letter);
        if ((index > 0)) {
          this.select_letter(py.getitem(this.letters_data, (index - 1)), true);
        }
      }
    }
    if (py.contains([this.previous_button, this.next_button], item)) {
      this.stage.render();
      this.turn_page_sound.play();
    }
    return null;
  }
  popup_close_click(item: any, args: any): any {
    this.stage.render();
    this.click_sound.play();
    this.close_popup();
    return null;
  }
  popup_handle_event(e: any): any {
    if ((py.eq(e.type, KEYDOWN) && py.eq(e.key, K_ESCAPE))) {
      this.stage.render();
      this.click_sound.play();
      this.close_popup();
    }
    return null;
  }
  close_popup(): any {
    this.stage.close_dialog(this.popup_layer);
    return null;
  }
  letters_click(item: any, args: any): any {
    let letter: any;
    letter = this.get_letter_at(args.x, args.y);
    if ((letter != null)) {
      if (((!py.eq(this.selected_letter, letter) || (this.current_page !== 1)) && py.truthy(py.getitem(letter, 5)))) {
        this.letter_hover.set_visible(false);
        this.select_letter(letter);
        this.stage.render();
        this.turn_page_sound.play();
      }
    }
    return null;
  }
  letters_mousemove(item: any, args: any): any {
    let letter, letter_left, letter_top: any;
    letter = this.get_letter_at(args.x, args.y);
    if (((letter == null) || py.eq(letter, this.selected_letter))) {
      this.stage.stop_timer(LETTER_ROLLOVER_TIMER_KEY);
      this.letter_hover.set_visible(false);
      this.letter_hover.set_left(0);
      this.letter_hover.set_top(0);
    } else if (py.truthy(py.getitem(letter, 5))) {
      letter_left = py.getitem(letter, 4);
      letter_top = py.getitem(letter, 5);
      if ((!py.eq(this.letter_hover.get_left(), letter_left) || !py.eq(this.letter_hover.get_top(), letter_top))) {
        this.letter_hover.set_left(letter_left);
        this.letter_hover.set_top(letter_top);
        this.letter_hover.set_visible(false);
        this.stage.stop_timer(LETTER_ROLLOVER_TIMER_KEY);
        this.stage.start_timer(LETTER_ROLLOVER_TIMER_KEY, 50, py.bind(this, "show_letter_rollover"));
        this.last_hover_show = pygame.time.get_ticks();
      }
    }
    return null;
  }
  show_letter_rollover(key: any, data: any): any {
    this.stage.stop_timer(key);
    this.letter_hover.set_visible(true);
    this.rollover_sound.stop();
    this.stage.render();
    this.rollover_sound.play();
    this.last_hover_show = pygame.time.get_ticks();
    return null;
  }
  letters_leave(item: any, args: any): any {
    this.stage.stop_timer(LETTER_ROLLOVER_TIMER_KEY);
    this.letter_hover.set_visible(false);
    return null;
  }
  note_click(item: any, args: any): any {
    if ((this.popup_layer == null)) {
      this.set_up_popup_layer();
    }
    this.load_note_data(item.note);
    this.stage.show_dialog(this.popup_layer, py.bind(this, "popup_handle_event"));
    this.stage.render();
    this.popup_sound.play();
    return null;
  }
  load_note_data(note: any): any {
    this.popup_title.set_text(note.get_full_name());
    if ((note.type === "HISTORY_FACT")) {
      this.popup_subtitle1.set_text(py.add(py.add("(", note.date), ")"));
      this.popup_subtitle2.set_text("");
      this.popup_description.set_text(this.get_joint_description(note));
    } else if ((note.type === "RIVER")) {
      this.popup_subtitle1.set_text(py.add("Longitud: ", note.length));
      this.popup_subtitle2.set_text(py.add("Cuenca: ", note.basin));
      this.popup_description.set_text(this.get_joint_description(note));
    } else if ((note.type === "LAGOON")) {
      this.popup_subtitle1.set_text(py.add("Superficie: ", note.surface));
      this.popup_subtitle2.set_text("");
      this.popup_description.set_text(this.get_joint_description(note));
    } else if ((note.type === "HILL")) {
      this.popup_subtitle1.set_text(py.add("Altura: ", note.height));
      this.popup_subtitle2.set_text("");
      this.popup_description.set_text(this.get_joint_description(note));
    } else if ((note.type === "LOCATION")) {
      this.popup_subtitle1.set_text(note.location_type);
      this.popup_subtitle2.set_text(py.add("Poblaci\xf3n: ", note.population));
      this.popup_description.set_text(note.description);
    } else if ((note.type === "WRITER")) {
      this.popup_subtitle1.set_text(note.dates);
      this.popup_subtitle2.set_text("");
      this.popup_description.set_text(note.description);
    }
    return null;
  }
  get_joint_description(note: any): any {
    let s: any;
    s = note.description1;
    if ((note.description2 != null)) {
      s = py.add(s, py.add("\n\n", note.description2));
    }
    return s;
  }
  get_letter_at(x: any, y: any): any {
    let letter_data: any;
    for (letter_data of py.iter(this.letters_data)) {
      if (((py.add(py.getitem(letter_data, 2), 2) <= y) && (y < py.add(py.getitem(letter_data, 2), 28)) && (py.getitem(letter_data, 1) <= x) && (x < py.add(py.getitem(letter_data, 1), 26)))) {
        return letter_data;
      }
    }
    return null;
  }
  select_letter(letter: any, load_last_page: any = false): any {
    let last_page, letter_char, letter_image, letter_item: any;
    if (py.contains(this.new_notes_letters, py.getitem(letter, 0))) {
      py.m(this.layer, "remove", py.getitem(this.new_notes_letters, py.getitem(letter, 0)));
      py.delitem(this.new_notes_letters, py.getitem(letter, 0));
    }
    if ((py.getitem(letter, 2) < 20)) {
      this.letter_selected_top.set_left(py.getitem(letter, 1));
      this.letter_selected_top.set_top(py.getitem(letter, 2));
      this.letter_selected_top.set_visible(true);
      this.letter_selected_bottom.set_visible(false);
    } else {
      this.letter_selected_bottom.set_left(py.getitem(letter, 1));
      this.letter_selected_bottom.set_top(py.getitem(letter, 2));
      this.letter_selected_bottom.set_visible(true);
      this.letter_selected_top.set_visible(false);
    }
    letter_item = py.getitem(letter, 3);
    if ((letter_item == null)) {
      letter_char = this.get_letter_image_char(py.getitem(letter, 0));
      letter_image = assets.load_image(py.add(py.add("p0_notes_", letter_char), ".jpg"));
      letter_item = new ItemImage(66, 69, letter_image);
      py.setitem(letter, 3, letter_item);
    }
    if (((this.selected_letter != null) && (py.getitem(this.selected_letter, 3) != null))) {
      py.m(this.layer, "remove", py.getitem(this.selected_letter, 3));
    }
    py.m(this.layer, "add", letter_item);
    this.selected_letter = letter;
    this.load_letter_notes(py.getitem(letter, 0));
    if (!py.truthy(load_last_page)) {
      this.load_letter_page(1);
    } else {
      last_page = py.getitem(this.load_letter_page(99999), 1);
      this.load_letter_page(last_page);
    }
    return null;
  }
  get_letter_image_char(letter: any): any {
    let letter_char: any;
    letter_char = py.m(py.getitem(letter, 0), "lower");
    if (((letter_char === "\xf1") || (letter_char === "\xd1"))) {
      letter_char = "nn";
    }
    return letter_char;
  }
  load_letter_notes(letter: any): any {
    let note, note_letter, notes: any;
    notes = this.stage.game.datastore.user_character_progress.notes;
    this.letter_notes = [];
    for (note of py.iter(notes)) {
      note_letter = this.get_note_letter(note);
      if (py.eq(note_letter, letter)) {
        py.m(this.letter_notes, "append", note);
      }
    }
    py.m(this.letter_notes, "sort", py.bind(this, "note_compare"));
    return null;
  }
  get_note_letter(note: any): any {
    let letter: any;
    letter = py.m(py.getitem(note.name, 0), "upper");
    if (((letter === "\xc1") || (letter === "\xe1"))) {
      letter = "A";
    } else if (((letter === "\xc9") || (letter === "\xe9"))) {
      letter = "E";
    } else if (((letter === "\xcd") || (letter === "\xed"))) {
      letter = "I";
    } else if (((letter === "\xd3") || (letter === "\xf3"))) {
      letter = "O";
    } else if (((letter === "\xda") || (letter === "\xfa"))) {
      letter = "U";
    }
    return letter;
  }
  note_compare(note1: any, note2: any): any {
    if ((note1.get_full_name() > note2.get_full_name())) {
      return 1;
    } else {
      if (py.eq(note1.get_full_name(), note2.get_full_name())) {
        return 0;
      }
      return (-1);
    }
    return null;
  }
  load_letter_page(page_number: any): any {
    let current_page, dot_item, has_items, hover_image, index, item, last_page, mask, new_notes, note, play_new_notes, text, text_height, text_width, text_x, text_y: any;
    for (item of py.iter(this.page_items)) {
      py.m(this.layer, "remove", item);
    }
    index = this.layer.index_of(this.menu_back);
    if ((page_number === 1)) {
      this.headerline.set_visible(true);
      py.getitem(this.selected_letter, 3).set_visible(true);
    } else {
      this.headerline.set_visible(false);
      py.getitem(this.selected_letter, 3).set_visible(false);
    }
    current_page = 1;
    text_x = 86;
    text_y = 175;
    this.current_page = page_number;
    has_items = false;
    this.page_items = [];
    last_page = true;
    play_new_notes = false;
    for (note of py.iter(this.letter_notes)) {
      [text_width, text_height] = this.line_font.size(note.get_full_name());
      if ((text_width > 188)) {
        text_height = 44;
      } else {
        text_height = 22;
      }
      if ((py.add(text_y, text_height) > 380)) {
        if ((text_x < 100)) {
          text_x = 335;
        } else {
          text_x = 83;
          current_page = current_page + 1;
        }
        text_y = 65;
      }
      if (py.eq(current_page, page_number)) {
        if ((text_height <= 30)) {
          hover_image = this.item_hoversmall_image;
        } else {
          hover_image = this.item_hoverbig_image;
        }
        mask = new ItemMask((text_x - 20), text_y, hover_image.get_size());
        mask.set_rollover(hover_image, this.rollover_sound);
        mask.note = note;
        mask.add_event_handler(ItemEvent.CLICK, py.bind(this, "note_click"));
        py.m(this.layer, "add", mask, index);
        index = index + 1;
        py.m(this.page_items, "append", mask);
        text = new ItemText(text_x, text_y, this.line_font, 22, note.get_full_name(), [55, 62, 92], null, 188);
        py.m(this.layer, "add", text, index);
        index = index + 1;
        py.m(this.page_items, "append", text);
        dot_item = new ItemImage((text_x - 12), py.add(text_y, 8), this.dot_image);
        py.m(this.layer, "add", dot_item, index);
        index = index + 1;
        py.m(this.page_items, "append", dot_item);
        new_notes = this.stage.game.datastore.user_character_progress.new_notes;
        if (py.contains(new_notes, note)) {
          py.m(new_notes, "remove", note);
          this.pending_changes_to_save = true;
          animations.fade_in_item(text);
          animations.fade_in_item(dot_item);
          play_new_notes = true;
        }
        has_items = true;
      } else if ((current_page > page_number)) {
        last_page = false;
        break;
      }
      text_y = py.add(text_y, text_height);
    }
    this.update_buttons_enabled(page_number, last_page);
    if (py.truthy(play_new_notes)) {
      this.stage.render();
      this.note_fade_in_sound.play();
    }
    return [has_items, current_page];
  }
  update_buttons_enabled(page_number: any, last_page: any): any {
    if ((!py.eq(this.selected_letter, py.getitem(this.letters_data, 0)) || (page_number > 1))) {
      this.previous_button.set_visible(true);
    } else {
      this.previous_button.set_visible(false);
    }
    if ((!py.eq(this.selected_letter, py.getitem(this.letters_data, (py.len(this.letters_data) - 1))) || !py.truthy(last_page))) {
      this.next_button.set_visible(true);
    } else {
      this.next_button.set_visible(false);
    }
    return null;
  }
  set_letters_state(letters: any, enabled: any): any {
    let data, letter: any;
    if (py.truthy(letters)) {
      for (letter of py.iter(letters)) {
        for (data of py.iter(this.letters_data)) {
          if (py.eq(py.getitem(data, 0), letter)) {
            py.setitem(data, 5, enabled);
            break;
          }
        }
      }
    } else {
      for (letter of py.iter(this.letters_data)) {
        py.setitem(letter, 5, enabled);
      }
    }
    return null;
  }
  disable_letters(letters: any = null): any {
    this.set_letters_state(letters, false);
    return null;
  }
  enable_letters(letters: any = null): any {
    this.set_letters_state(letters, true);
    return null;
  }
  disable_next_button(): any {
    this.next_button.set_rollover_image(null, null);
    this.next_button.remove_event_handler(ItemEvent.CLICK, py.bind(this, "button_click"));
    return null;
  }
  disable_previous_button(): any {
    this.previous_button.set_rollover_image(null, null);
    this.previous_button.remove_event_handler(ItemEvent.CLICK, py.bind(this, "button_click"));
    return null;
  }
  disable_close_button(): any {
    this.close_button.set_rollover_image(null, null);
    this.close_button.remove_event_handler(ItemEvent.CLICK, py.bind(this, "button_click"));
    return null;
  }
  enable_next_button(): any {
    this.next_button.set_rollover_image(this.next_button_image_rollover, this.rollover_sound);
    this.next_button.add_event_handler(ItemEvent.CLICK, py.bind(this, "button_click"));
    return null;
  }
  enable_previous_button(): any {
    this.previous_button.set_rollover_image(this.previous_button_image_rollover, this.rollover_sound);
    this.previous_button.add_event_handler(ItemEvent.CLICK, py.bind(this, "button_click"));
    return null;
  }
  enable_close_button(): any {
    this.close_button.set_rollover_image(this.close_button_image_rollover, this.rollover_sound);
    this.close_button.add_event_handler(ItemEvent.CLICK, py.bind(this, "button_click"));
    return null;
  }
  disable_notes(): any {
    return null;
  }
}
py.register("game/stages/notes", $self);
export function $set(name: string, v: any): void {
  switch (name) {
    case "LETTER_ROLLOVER_TIMER_KEY": LETTER_ROLLOVER_TIMER_KEY = v; break;
  }
}
