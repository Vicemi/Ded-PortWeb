// @ts-nocheck
// Generated from the original game code (see MODLOG.md). Do not edit by hand.
import * as py from '../../runtime/py';
import { ItemEvent } from '../../runtime/prelude';
import { ItemImage } from '../../runtime/prelude';
import { ItemText } from '../../runtime/prelude';
import { KEYDOWN } from '../../runtime/prelude';
import { K_ESCAPE } from '../../runtime/prelude';
import { Layer } from '../../runtime/prelude';
import * as animations from '../../engine/animations';
import * as assets from '../../engine/assets';
import * as characterid from './characterid';
import * as datamodel from '../data/datamodel';
import { random } from '../../runtime/py';
import * as text from '../../engine/textutil';
import * as $self from './merits';

export let MEDALS_DATA: any = py.mkdict([["artigas", [97, 123, "ARTIGAS", null]], ["canelones", [143, 123, "CANELONES", null]], ["cerrolargo", [190, 123, "CERRO LARGO", null]], ["colonia", [236, 123, "COLONIA", null]], ["durazno", [282, 123, "DURAZNO", null]], ["flores", [328, 123, "FLORES", null]], ["florida", [375, 123, "FLORIDA", null]], ["lavalleja", [421, 123, "LAVALLEJA", null]], ["maldonado", [467, 123, "MALDONADO", null]], ["montevideo", [76, 202, "MONTEVIDEO", null]], ["paysandu", [123, 202, "PAYSAND\xda", 2]], ["rionegro", [170, 202, "R\xcdO NEGRO", 2]], ["rivera", [218, 202, "RIVERA", null]], ["rocha", [265, 202, "ROCHA", null]], ["salto", [312, 202, "SALTO", null]], ["sanjose", [359, 202, "SAN JOS\xc9", 1]], ["soriano", [407, 202, "SORIANO", null]], ["tacuarembo", [454, 202, "TACUAREMB\xd3", 2]], ["treintaytres", [501, 202, "TREINTA Y TRES", null]]]);
export class Merits {
  constructor(stage: any) {
    this.stage = stage;
    this.main_layer = new Layer();
    this.medals_layer = null;
    this.highscores_layer = null;
    this.medal_popup_layer = null;
    this.rollover_sound = this.stage.rollover_sound;
    this.click_sound = this.stage.click_sound;
    this.common_loaded = false;
    return;
  }
  show_merits(show_empty_dialog: any = true): any {
    this.stage.show_dialog(this.main_layer, py.bind(this, "merits_handle_event"));
    if (!py.truthy(show_empty_dialog)) {
      this.blind_show_merits_callback(this.main_layer, true);
    } else {
      this.stage.blind_dialog(this.main_layer, animations.BlindDirection.SHOW_DOWN, true, [], py.bind(this, "blind_show_merits_callback"));
    }
    return null;
  }
  close_merits(): any {
    this.stage.blind_dialog(this.main_layer, animations.BlindDirection.HIDE_UP, true, [], py.bind(this, "blind_main_back_callback"));
    return null;
  }
  merits_handle_event(e: any): any {
    if ((py.eq(e.type, KEYDOWN) && py.eq(e.key, K_ESCAPE))) {
      this.stage.render();
      this.click_sound.play();
      this.close_merits();
    }
    return null;
  }
  blind_show_merits_callback(layer: any, blind_background: any = false): any {
    this.set_up_common();
    this.set_up_main();
    this.stage.blind_dialog(this.main_layer, animations.BlindDirection.SHOW_DOWN, blind_background, []);
    return null;
  }
  set_up_common(): any {
    if (!py.truthy(this.common_loaded)) {
      this.back_standby_image = assets.load_image("p0_merits_backbutton_standby.png");
      this.back_rollover_image = assets.load_image("p0_merits_backbutton_rollover.png");
      this.common_loaded = true;
    }
    return null;
  }
  set_up_main(): any {
    let back_item, background_image, background_item, character, character_progress, font_11, font_16, font_20, font_42, highscores_item, highscores_normal_image, highscores_rollover_image, medals_item, medals_normal_image, medals_rollover_image, next_promotion_cases, next_promotion_cases_text, resolved_cases, resolved_cases_text, score_text: any;
    character = this.stage.game.datastore.user_character;
    character_progress = this.stage.game.datastore.user_character_progress;
    font_11 = assets.load_font("evilgeniusbb_bld.ttf", 11);
    font_16 = assets.load_font("evilgeniusbb_reg.ttf", 16);
    font_20 = assets.load_font("turkey.ttf", 20);
    font_42 = assets.load_font("turkey.ttf", 42);
    background_image = assets.load_image("p0_merits_main_background.jpg");
    background_item = new ItemImage(0, 0, background_image);
    py.m(this.main_layer, "add", background_item);
    back_item = new ItemImage(258, 399, this.back_standby_image);
    back_item.set_rollover_image(this.back_rollover_image, this.rollover_sound);
    back_item.add_event_handler(ItemEvent.CLICK, py.bind(this, "main_back_click"));
    py.m(this.main_layer, "add", back_item);
    score_text = text.format_number(character_progress.score);
    this.add_text_with_shadow(this.main_layer, 341, 11, font_42, score_text, [255, 212, 12], 157, 65, 2, 1, (-2), 3);
    this.characterid = new characterid.CharacterId();
    this.characterid.set_up_id(this.main_layer, character.charinfo, 120, 87, false);
    resolved_cases = character_progress.resolved_cases;
    resolved_cases_text = text.format_number(resolved_cases);
    this.add_text_with_shadow(this.main_layer, 359, 335, font_20, resolved_cases_text, [255, 212, 12], 50, 30, 1, 1, (-2), 3);
    if ((character_progress.range.next_range_cases != null)) {
      next_promotion_cases = (character_progress.range.next_range_cases - resolved_cases);
      next_promotion_cases_text = text.format_number(next_promotion_cases);
      this.add_text_with_shadow(this.main_layer, 432, 363, font_20, next_promotion_cases_text, [255, 212, 12], 50, 30, 1, 1, (-2), 3);
    }
    medals_normal_image = assets.load_image("p0_merits_main_btn_medals_normal.png");
    medals_rollover_image = assets.load_image("p0_merits_main_btn_medals_rollover.png");
    medals_item = new ItemImage(13, 291, medals_normal_image, null, true);
    medals_item.set_rollover_image(medals_rollover_image, this.rollover_sound);
    medals_item.add_event_handler(ItemEvent.CLICK, py.bind(this, "medals_click"));
    py.m(this.main_layer, "add", medals_item);
    highscores_normal_image = assets.load_image("p0_merits_main_btn_highscore_normal.png");
    highscores_rollover_image = assets.load_image("p0_merits_main_btn_highscore_rollover.png");
    highscores_item = new ItemImage(458, 293, highscores_normal_image, null, true);
    highscores_item.set_rollover_image(highscores_rollover_image, this.rollover_sound);
    highscores_item.add_event_handler(ItemEvent.CLICK, py.bind(this, "highscores_click"));
    py.m(this.main_layer, "add", highscores_item);
    return null;
  }
  set_up_medals(): any {
    let back_item, background_image, background_item, character_progress, count, font_14, font_18, medal, medal_uy: any;
    font_14 = assets.load_font("turkey.ttf", 14);
    font_18 = assets.load_font("turkey.ttf", 18);
    this.medals_layer = new Layer();
    background_image = assets.load_image("p0_merits_medals_background.jpg");
    background_item = new ItemImage(0, 0, background_image);
    py.m(this.medals_layer, "add", background_item);
    back_item = new ItemImage(258, 399, this.back_standby_image);
    back_item.set_rollover_image(this.back_rollover_image, this.rollover_sound);
    back_item.add_event_handler(ItemEvent.CLICK, py.bind(this, "medals_back_click"));
    py.m(this.medals_layer, "add", back_item);
    this.generic_backglow_image = assets.load_image("p0_merits_medals_backglow_generic.png");
    this.medal_rollover_item = new ItemImage(0, 0, null);
    this.medal_rollover_item.set_visible(false);
    py.m(this.medals_layer, "add", this.medal_rollover_item);
    this.medal_text_items = this.add_text_with_shadow(this.medals_layer, 223, 85, font_14, "", [252, 193, 45], 155, 20, 2, 1, (-1), 2);
    py.getitem(this.medal_text_items, 0).set_visible(false);
    py.getitem(this.medal_text_items, 1).set_visible(false);
    character_progress = this.stage.game.datastore.user_character_progress;
    medal_uy = null;
    for (medal of py.iter(character_progress.medals)) {
      if ((medal.name === "uy")) {
        medal_uy = medal;
      } else {
        this.add_tiny_medal(medal.name, medal.count, font_18);
      }
    }
    if ((medal_uy != null)) {
      count = medal_uy.count;
    } else {
      count = 0;
    }
    this.add_bottom_medal("uy", "URUGUAY", count, 271, 287, (-26), (-21), 5, (-4), 211, 53, font_18);
    return null;
  }
  add_tiny_medal(name: any, count: any, font: any): any {
    let data, image, item: any;
    image = assets.load_image(py.add(py.add("p0_merits_medals_tiny_", name), ".png"));
    data = py.getitem(MEDALS_DATA, name);
    item = new ItemImage(py.getitem(data, 0), py.getitem(data, 1), image);
    item.add_event_handler(ItemEvent.MOUSE_ENTER, py.bind(this, "medal_enter"));
    item.add_event_handler(ItemEvent.MOUSE_LEAVE, py.bind(this, "medal_leave"));
    item.add_event_handler(ItemEvent.CLICK, py.bind(this, "medal_click"));
    py.m(this.medals_layer, "add", item);
    if ((count > 1)) {
      this.add_text_with_shadow(this.medals_layer, py.add(py.getitem(data, 0), 1), (py.getitem(data, 1) - 3), font, py.str(count), [254, 227, 0], 35, 28, 3, 1, (-1), 3, 255);
    }
    item.medal_department = true;
    item.medal_name = name;
    item.medal_text = py.getitem(data, 2);
    item.medal_backglow = [(-22), (-21)];
    item.medal_backglow_image = this.generic_backglow_image;
    item.ribbon = py.getitem(data, 3);
    return null;
  }
  add_bottom_medal(name: any, text: any, count: any, medal_x: any, medal_y: any, backglow_x: any, backglow_y: any, count_dx: any, count_dy: any, big_x: any, big_y: any, font: any): any {
    let backglow_image, item, medal_image: any;
    if ((count !== 0)) {
      medal_image = assets.load_image(py.add(py.add("p0_merits_medals_tiny_", name), ".png"));
      backglow_image = assets.load_image(py.add(py.add("p0_merits_medals_backglow_", name), ".png"));
      item = new ItemImage(medal_x, medal_y, medal_image);
      item.add_event_handler(ItemEvent.MOUSE_ENTER, py.bind(this, "medal_enter"));
      item.add_event_handler(ItemEvent.MOUSE_LEAVE, py.bind(this, "medal_leave"));
      item.add_event_handler(ItemEvent.CLICK, py.bind(this, "medal_click"));
      py.m(this.medals_layer, "add", item);
      if ((count > 1)) {
        this.add_text_with_shadow(this.medals_layer, py.add(medal_x, count_dx), py.add(medal_y, count_dy), font, py.str(count), [254, 227, 0], 45, 28, 3, 1, (-1), 3, 255);
      }
      item.medal_department = false;
      item.medal_name = name;
      item.medal_text = text;
      item.medal_backglow = [backglow_x, backglow_y];
      item.medal_backglow_image = backglow_image;
      item.medal_big_pos = [big_x, big_y];
    }
    return null;
  }
  medal_enter(item: any, args: any): any {
    this.stage.render();
    this.rollover_sound.stop();
    this.rollover_sound.play();
    this.medal_rollover_item.set_image(item.medal_backglow_image);
    this.medal_rollover_item.set_left(py.add(item.get_left(), py.getitem(item.medal_backglow, 0)));
    this.medal_rollover_item.set_top(py.add(item.get_top(), py.getitem(item.medal_backglow, 1)));
    this.medal_rollover_item.set_visible(true);
    py.getitem(this.medal_text_items, 0).set_text(item.medal_text);
    py.getitem(this.medal_text_items, 1).set_text(item.medal_text);
    py.getitem(this.medal_text_items, 0).set_visible(true);
    py.getitem(this.medal_text_items, 1).set_visible(true);
    return null;
  }
  medal_leave(item: any, args: any): any {
    this.medal_rollover_item.set_visible(false);
    py.getitem(this.medal_text_items, 0).set_visible(false);
    py.getitem(this.medal_text_items, 1).set_visible(false);
    return null;
  }
  medal_click(item: any, args: any): any {
    this.stage.render();
    this.click_sound.play();
    if ((this.medal_popup_layer == null)) {
      this.set_up_medal_popup();
    }
    this.set_big_medal(item);
    this.stage.show_dialog(this.medal_popup_layer, py.bind(this, "medal_popup_handle_event"), [0, 0, 0, 150]);
    this.stage.blind_dialog(this.medal_popup_layer, animations.BlindDirection.SHOW_DOWN, true, []);
    return null;
  }
  set_up_medal_popup(): any {
    let back_bottom_image, back_bottom_item, back_center_image, back_center_item, back_item, back_left_image, back_left_item, back_right_image, back_right_item, back_top_image, back_top_item, base_image, font_24: any;
    font_24 = assets.load_font("turkey.ttf", 24);
    this.medal_popup_layer = new Layer();
    back_center_image = assets.load_image("p0_merits_medals_popup_back_center.jpg");
    back_center_item = new ItemImage(153, 131, back_center_image);
    py.m(this.medal_popup_layer, "add", back_center_item);
    back_top_image = assets.load_image("p0_merits_medals_popup_back_top.png");
    back_top_item = new ItemImage(105, 69, back_top_image);
    py.m(this.medal_popup_layer, "add", back_top_item);
    back_bottom_image = assets.load_image("p0_merits_medals_popup_back_bottom.png");
    back_bottom_item = new ItemImage(73, 341, back_bottom_image);
    py.m(this.medal_popup_layer, "add", back_bottom_item);
    back_left_image = assets.load_image("p0_merits_medals_popup_back_left.png");
    back_left_item = new ItemImage(79, 131, back_left_image);
    py.m(this.medal_popup_layer, "add", back_left_item);
    back_right_image = assets.load_image("p0_merits_medals_popup_back_right.png");
    back_right_item = new ItemImage(451, 131, back_right_image);
    py.m(this.medal_popup_layer, "add", back_right_item);
    back_item = new ItemImage(258, 399, this.back_standby_image);
    back_item.set_rollover_image(this.back_rollover_image, this.rollover_sound);
    back_item.add_event_handler(ItemEvent.CLICK, py.bind(this, "medal_popup_back_click"));
    py.m(this.medal_popup_layer, "add", back_item);
    this.ribbon_item = new ItemImage(246, 66, null);
    py.m(this.medal_popup_layer, "add", this.ribbon_item);
    base_image = assets.load_image("p0_merits_medals_big_genericbase.png");
    this.base_item = new ItemImage(243, 168, base_image);
    py.m(this.medal_popup_layer, "add", this.base_item);
    this.tab_item = new ItemImage(265, 180, null);
    py.m(this.medal_popup_layer, "add", this.tab_item);
    this.big_medal_item = new ItemImage(0, 0, null);
    py.m(this.medal_popup_layer, "add", this.big_medal_item);
    this.flag_item = new ItemImage(133, 178, null);
    py.m(this.medal_popup_layer, "add", this.flag_item);
    this.big_name_items = this.add_text_with_shadow(this.medal_popup_layer, 204, 284, font_24, "", [252, 193, 45], 195, 35, 2, 1, (-2), 3, 255);
    return null;
  }
  set_big_medal(item: any): any {
    let big_medal_image, ribbon_image, tab_image: any;
    py.getitem(this.big_name_items, 0).set_text(item.medal_text);
    py.getitem(this.big_name_items, 1).set_text(item.medal_text);
    if (!py.truthy(item.medal_department)) {
      big_medal_image = assets.load_image(py.add(py.add("p0_merits_medals_big_", item.medal_name), ".png"));
      this.big_medal_item.set_left(py.getitem(item.medal_big_pos, 0));
      this.big_medal_item.set_top(py.getitem(item.medal_big_pos, 1));
      this.big_medal_item.set_image(big_medal_image);
      this.big_medal_item.set_visible(true);
      this.ribbon_item.set_visible(false);
      this.base_item.set_visible(false);
      this.tab_item.set_visible(false);
      this.flag_item.set_visible(false);
    } else {
      this.big_medal_item.set_visible(false);
      if ((item.ribbon == null)) {
        ribbon_image = assets.load_image(py.add(py.add("p0_merits_medals_big_ribbon_", item.medal_name), ".png"));
      } else {
        ribbon_image = assets.load_image(py.add(py.add("p0_merits_medals_big_ribbon_", py.str(item.ribbon)), ".png"));
      }
      this.ribbon_item.set_image(ribbon_image);
      this.ribbon_item.set_visible(true);
      this.base_item.set_visible(true);
      tab_image = assets.load_image(py.add(py.add("p0_merits_medals_tab_", item.medal_name), ".jpg"));
      this.tab_item.set_image(tab_image);
      this.tab_item.set_visible(true);
      this.flag_item.set_image(assets.load_image(py.add(py.add("p0_flag_", item.medal_name), ".png")));
      this.flag_item.set_visible(true);
    }
    return null;
  }
  set_up_highscores(): any {
    let back_item, background_image, background_item, gardener_image, librarian_image, puzzle_image, shoptender_image, total_image: any;
    this.highscores_layer = new Layer();
    this.highscore_font = assets.load_font("turkey.ttf", 17);
    background_image = assets.load_image("p0_merits_highscores_background.jpg");
    background_item = new ItemImage(0, 0, background_image);
    py.m(this.highscores_layer, "add", background_item);
    this.highscores_left_up_image = assets.load_image("p0_merits_highscores_button_up.png");
    this.highscores_left_rollover_image = assets.load_image("p0_merits_highscores_button_rollover.png");
    this.highscores_left_center_image = assets.load_image("p0_merits_highscores_button_center.png");
    this.highscores_left_down_image = assets.load_image("p0_merits_highscores_button_down.png");
    this.highscores_right_up_image = this.highscores_left_up_image.flip_h_copy();
    this.highscores_right_rollover_image = this.highscores_left_rollover_image.flip_h_copy();
    this.highscores_right_center_image = this.highscores_left_center_image.flip_h_copy();
    this.highscores_right_down_image = this.highscores_left_down_image.flip_h_copy();
    this.highscores_left_button = new ItemImage(398, 80, this.highscores_left_up_image);
    this.highscores_left_button.add_event_handler(ItemEvent.CLICK, py.bind(this, "highscores_left_click"));
    this.highscores_left_button.add_event_handler(ItemEvent.MOUSE_ENTER, py.bind(this, "highscores_left_enter"));
    this.highscores_left_button.add_event_handler(ItemEvent.MOUSE_LEAVE, py.bind(this, "highscores_left_leave"));
    this.highscores_left_state = 0;
    py.m(this.highscores_layer, "add", this.highscores_left_button);
    this.highscores_right_button = new ItemImage(502, 80, this.highscores_right_up_image);
    this.highscores_right_button.add_event_handler(ItemEvent.CLICK, py.bind(this, "highscores_right_click"));
    this.highscores_right_button.add_event_handler(ItemEvent.MOUSE_ENTER, py.bind(this, "highscores_right_enter"));
    this.highscores_right_button.add_event_handler(ItemEvent.MOUSE_LEAVE, py.bind(this, "highscores_right_leave"));
    this.highscores_right_state = 0;
    py.m(this.highscores_layer, "add", this.highscores_right_button);
    this.highscores_labels = [];
    this.highscores_label_index = 0;
    total_image = assets.load_image("p0_merits_highscores_label_total.png");
    py.m(this.highscores_labels, "append", [total_image, "total"]);
    gardener_image = assets.load_image("p0_merits_highscores_label_gardener.png");
    py.m(this.highscores_labels, "append", [gardener_image, "gardener"]);
    librarian_image = assets.load_image("p0_merits_highscores_label_librarian.png");
    py.m(this.highscores_labels, "append", [librarian_image, "librarian"]);
    puzzle_image = assets.load_image("p0_merits_highscores_label_puzzle.png");
    py.m(this.highscores_labels, "append", [puzzle_image, "bricklayer"]);
    shoptender_image = assets.load_image("p0_merits_highscores_label_shoptender.png");
    py.m(this.highscores_labels, "append", [shoptender_image, "shoptender"]);
    this.highscore_label_item = new ItemImage(433, 74, py.getitem(py.getitem(this.highscores_labels, 0), 0));
    py.m(this.highscores_layer, "add", this.highscore_label_item);
    this.highscores_items = [];
    this.load_highscores();
    back_item = new ItemImage(258, 399, this.back_standby_image);
    back_item.set_rollover_image(this.back_rollover_image, this.rollover_sound);
    back_item.add_event_handler(ItemEvent.CLICK, py.bind(this, "highscores_back_click"));
    py.m(this.highscores_layer, "add", back_item);
    return null;
  }
  load_highscores(): any {
    let c, category, characters, datastore, highscores, i, i1, i2, score_text, y: any;
    datastore = this.stage.game.datastore;
    highscores = datastore.get_highscores();
    characters = [];
    category = py.getitem(py.getitem(this.highscores_labels, this.highscores_label_index), 1);
    if (((highscores != null) && py.contains(highscores, category))) {
      characters = py.getitem(highscores, category);
    }
    for (i of py.iter(this.highscores_items)) {
      py.m(this.highscores_layer, "remove", i);
    }
    y = 120;
    if ((py.len(characters) > 10)) {
      characters = py.slice(characters, null, 10);
    }
    for (c of py.iter(characters)) {
      [i1, i2] = this.add_text_with_shadow(this.highscores_layer, 66, y, this.highscore_font, py.m(c.name, "upper"), [255, 212, 12], 350, 24, 1, 2, 1, 3);
      py.m(this.highscores_items, "append", i1);
      py.m(this.highscores_items, "append", i2);
      score_text = text.format_number(c.score);
      [i1, i2] = this.add_text_with_shadow(this.highscores_layer, 410, y, this.highscore_font, score_text, [255, 212, 12], 85, 24, 3, 2, 1, 3);
      py.m(this.highscores_items, "append", i1);
      py.m(this.highscores_items, "append", i2);
      y = y + 25;
    }
    return null;
  }
  highscores_left_click(item: any, args: any): any {
    this.start_left_down();
    this.stage.capture_leftmousedown(item, py.bind(this, "highscores_left_mousecapture"));
    return null;
  }
  start_left_down(): any {
    this.highscores_left_state = 2;
    this.highscores_left_button.set_image(this.highscores_left_center_image);
    this.stage.stop_timer("highscores_left_down");
    this.stage.start_timer("highscores_left_down", 50, py.bind(this, "show_left_down"));
    return null;
  }
  show_left_down(key: any, data: any): any {
    this.stage.stop_timer("highscores_left_down");
    if ((this.highscores_left_state === 2)) {
      this.highscores_left_button.set_image(this.highscores_left_down_image);
    }
    return null;
  }
  highscores_left_enter(item: any, args: any): any {
    this.stage.render();
    this.rollover_sound.play();
    if ((this.highscores_left_state === 0)) {
      this.highscores_left_button.set_image(this.highscores_left_rollover_image);
    } else {
      this.start_left_down();
    }
    return null;
  }
  highscores_left_leave(item: any, args: any): any {
    if ((this.highscores_left_state === 0)) {
      this.highscores_left_button.set_image(this.highscores_left_up_image);
    } else {
      this.highscores_left_state = 1;
      this.highscores_left_button.set_image(this.highscores_left_up_image);
    }
    return null;
  }
  highscores_left_mousecapture(args: any, released: any): any {
    if (py.truthy(released)) {
      this.highscores_left_state = 0;
      if (py.eq(this.stage.get_over_item(), this.highscores_left_button)) {
        this.stage.render();
        this.click_sound.play();
        if ((this.highscores_label_index === 0)) {
          this.highscores_label_index = (py.len(this.highscores_labels) - 1);
        } else {
          this.highscores_label_index = this.highscores_label_index - 1;
        }
        this.highscore_label_item.set_image(py.getitem(py.getitem(this.highscores_labels, this.highscores_label_index), 0));
        this.load_highscores();
        this.highscores_left_button.set_image(this.highscores_left_rollover_image);
      }
    }
    return null;
  }
  highscores_right_click(item: any, args: any): any {
    this.start_right_down();
    this.stage.capture_leftmousedown(item, py.bind(this, "highscores_right_mousecapture"));
    return null;
  }
  start_right_down(): any {
    this.highscores_right_state = 2;
    this.highscores_right_button.set_image(this.highscores_right_center_image);
    this.stage.stop_timer("highscores_right_down");
    this.stage.start_timer("highscores_right_down", 50, py.bind(this, "show_right_down"));
    return null;
  }
  show_right_down(key: any, data: any): any {
    this.stage.stop_timer("highscores_right_down");
    if ((this.highscores_right_state === 2)) {
      this.highscores_right_button.set_image(this.highscores_right_down_image);
    }
    return null;
  }
  highscores_right_enter(item: any, args: any): any {
    this.stage.render();
    this.rollover_sound.play();
    if ((this.highscores_right_state === 0)) {
      this.highscores_right_button.set_image(this.highscores_right_rollover_image);
    } else {
      this.start_right_down();
    }
    return null;
  }
  highscores_right_leave(item: any, args: any): any {
    if ((this.highscores_right_state === 0)) {
      this.highscores_right_button.set_image(this.highscores_right_up_image);
    } else {
      this.highscores_right_state = 1;
      this.highscores_right_button.set_image(this.highscores_right_up_image);
    }
    return null;
  }
  highscores_right_mousecapture(args: any, released: any): any {
    if (py.truthy(released)) {
      this.highscores_right_state = 0;
      if (py.eq(this.stage.get_over_item(), this.highscores_right_button)) {
        this.stage.render();
        this.click_sound.play();
        if (py.eq(this.highscores_label_index, (py.len(this.highscores_labels) - 1))) {
          this.highscores_label_index = 0;
        } else {
          this.highscores_label_index = this.highscores_label_index + 1;
        }
        this.highscore_label_item.set_image(py.getitem(py.getitem(this.highscores_labels, this.highscores_label_index), 0));
        this.load_highscores();
        this.highscores_right_button.set_image(this.highscores_right_rollover_image);
      }
    }
    return null;
  }
  add_text_with_shadow(layer: any, left: any, top: any, font: any, text: any, color: any, width: any, height: any, h_align: any, v_align: any, shadow_dx: any, shadow_dy: any, alpha: any = 153): any {
    let shadow_item, text_item: any;
    shadow_item = new ItemText(py.add(left, shadow_dx), py.add(top, shadow_dy), font, 0, text, [0, 0, 0], null, width, height, h_align, v_align);
    shadow_item.set_alpha(alpha);
    py.m(layer, "add", shadow_item);
    text_item = new ItemText(left, top, font, 0, text, color, null, width, height, h_align, v_align);
    py.m(layer, "add", text_item);
    return [text_item, shadow_item];
  }
  medals_click(item: any, args: any): any {
    this.stage.render();
    this.click_sound.play();
    if ((this.medals_layer == null)) {
      this.set_up_medals();
    }
    this.stage.show_dialog(this.medals_layer, py.bind(this, "medals_handle_event"), null);
    this.stage.blind_dialog(this.medals_layer, animations.BlindDirection.SHOW_DOWN, true, []);
    return null;
  }
  medals_handle_event(e: any): any {
    if ((py.eq(e.type, KEYDOWN) && py.eq(e.key, K_ESCAPE))) {
      this.stage.render();
      this.click_sound.play();
      this.close_medals();
    }
    return null;
  }
  close_medals(): any {
    this.stage.blind_dialog(this.medals_layer, animations.BlindDirection.HIDE_UP, true, [], py.bind(this, "blind_medals_back_callback"));
    return null;
  }
  highscores_click(item: any, args: any): any {
    this.stage.render();
    this.click_sound.play();
    this.show_highscores();
    return null;
  }
  show_highscores(): any {
    if ((this.highscores_layer == null)) {
      this.set_up_common();
      this.set_up_highscores();
    }
    this.load_highscores();
    this.stage.show_dialog(this.highscores_layer, py.bind(this, "highscores_handle_event"), null);
    this.stage.blind_dialog(this.highscores_layer, animations.BlindDirection.SHOW_DOWN, true, []);
    return null;
  }
  highscores_handle_event(e: any): any {
    if ((py.eq(e.type, KEYDOWN) && py.eq(e.key, K_ESCAPE))) {
      this.stage.render();
      this.click_sound.play();
      this.close_highscores();
    }
    return null;
  }
  close_highscores(): any {
    this.stage.blind_dialog(this.highscores_layer, animations.BlindDirection.HIDE_UP, true, [], py.bind(this, "blind_highscores_back_callback"));
    return null;
  }
  main_back_click(item: any, args: any): any {
    this.stage.render();
    this.click_sound.play();
    this.close_merits();
    return null;
  }
  blind_main_back_callback(layer: any): any {
    this.stage.close_dialog(this.main_layer);
    return null;
  }
  medals_back_click(item: any, args: any): any {
    this.stage.render();
    this.click_sound.play();
    this.close_medals();
    return null;
  }
  blind_medals_back_callback(layer: any): any {
    this.stage.close_dialog(this.medals_layer);
    return null;
  }
  medal_popup_handle_event(e: any): any {
    if ((py.eq(e.type, KEYDOWN) && py.eq(e.key, K_ESCAPE))) {
      this.stage.render();
      this.click_sound.play();
      this.close_medal_popup();
    }
    return null;
  }
  medal_popup_back_click(item: any, args: any): any {
    this.stage.render();
    this.click_sound.play();
    this.close_medal_popup();
    return null;
  }
  close_medal_popup(): any {
    this.stage.blind_dialog(this.medal_popup_layer, animations.BlindDirection.HIDE_UP, true, [], py.bind(this, "blind_medal_popup_back_callback"));
    return null;
  }
  blind_medal_popup_back_callback(layer: any): any {
    this.stage.close_dialog(this.medal_popup_layer);
    return null;
  }
  highscores_back_click(item: any, args: any): any {
    this.stage.render();
    this.click_sound.play();
    this.close_highscores();
    return null;
  }
  blind_highscores_back_callback(layer: any): any {
    this.stage.close_dialog(this.highscores_layer);
    return null;
  }
}
py.register("game/stages/merits", $self);
export function $set(name: string, v: any): void {
  switch (name) {
    case "MEDALS_DATA": MEDALS_DATA = v; break;
  }
}
