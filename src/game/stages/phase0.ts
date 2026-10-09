// @ts-nocheck
// Generated from the original game code (see MODLOG.md). Do not edit by hand.
import * as py from '../../runtime/py';
import { BlindDirection } from '../../engine/animations';
import { ItemEvent } from '../../runtime/prelude';
import { ItemImage } from '../../runtime/prelude';
import { ItemMask } from '../../runtime/prelude';
import { ItemText } from '../../runtime/prelude';
import { KEYDOWN } from '../../runtime/prelude';
import { K_ESCAPE } from '../../runtime/prelude';
import { Layer } from '../../runtime/prelude';
import { StageIso } from '../../runtime/prelude';
import * as animations from '../../engine/animations';
import { assets } from '../../runtime/prelude';
import * as endgame from './endgame';
import * as folder from './folder';
import { gc } from '../../runtime/prelude';
import * as help from './help';
const mainmenu: any = py.lazy("game/stages/mainmenu");
import * as map from './map';
import * as merits from './merits';
import * as notes from './notes';
const phase1: any = py.lazy("game/stages/phase1");
const phase2: any = py.lazy("game/stages/phase2");
const phase3: any = py.lazy("game/stages/phase3");
import { pygame } from '../../runtime/prelude';
import * as statcodes from '../data/statcodes';
import { sys } from '../../runtime/py';
import * as text from '../../engine/textutil';
import * as $self from './phase0';

export let GRID_ORIGIN: any = [300, 105];
export let GRID_CELL_WIDTH: any = 24;
export let GRID_CELL_HEIGHT: any = 12;
export let GRID_SIZE: any = [22, 22];
export class Phase0Stage extends StageIso {
  constructor(game: any, initial_phase: any, save_state: any = true) {
    let character_progress, department: any;
    super(game, null, null, null);
    this.seting_timer = false;
    this.checking_ending = false;
    this.phase_number = initial_phase;
    this.load_phase_number = initial_phase;
    this.phase = null;
    this.loading_phase = false;
    this.during_night = false;
    this.initialized = false;
    this.minigame = null;
    this.minigame_started = false;
    this.showing_help = false;
    this.showing_mainmenu = false;
    this.update_time_callbacks = [];
    this.arrest_order_warning_shown = false;
    this.save_state_on_next_load_phase = save_state;
    this.folder_animation_locks = 0;
    this.pending_folder_animation = false;
    if (py.truthy(this.game.get_development_mode())) {
      if (py.contains(sys.argv, "--medals")) {
        character_progress = this.game.datastore.user_character_progress;
        if ((py.len(character_progress.medals) === 0)) {
          character_progress.add_medal("uy");
          for (department of py.iter(this.game.datastore.list_departments)) {
            character_progress.add_medal(department.image);
          }
        }
      }
    }
    return;
  }
  initialize(): any {
    this._Phase0Stage__load_phase(this.load_phase_number);
    return null;
  }
  close(): any {
    this.game.stats.end_time_event(py.add(statcodes.PHASE_PREFIX, py.str(this.phase_number)));
    return null;
  }
  initialize_stage(): any {
    this.items_found = [];
    this.clue_items = [];
    this.bar_7_rounds = 72;
    this.options_layer = new Layer();
    this.info_layer = new Layer();
    this.night_layer = new Layer();
    this.background_layer = new Layer();
    py.m(this.background_layer, "add", new ItemImage(0, 0, assets.load_image("p0_stage_background.jpg")));
    this.click_sound = assets.load_sound("GUI_Click.ogg");
    this.rollover_sound = assets.load_sound("GUI_roll_over.ogg");
    this.popup_sound = assets.load_sound("GUI_Pop_Up.ogg");
    this.witness_popup_sound = assets.load_sound("GUI_Witness_Popup.ogg");
    this.open_map_sound = assets.load_sound("GUI_Map.ogg");
    this.case_open_sound = assets.load_sound("GUI_Turn_Page.ogg");
    this.notes_open_sound = assets.load_sound("GUI_Notes_Open.ogg");
    this.bounce_sound = assets.load_sound("GUI_bounce.ogg");
    this.night_sound = assets.load_sound("Night.ogg");
    this.clock_sound = assets.load_sound("GUI_Clock.ogg");
    this.fade_sound = assets.load_sound("fade.ogg");
    this.font = assets.load_font("freesansbold.ttf", 13);
    this.set_up_options();
    this.set_up_locator();
    this.set_up_timer();
    this.set_up_character();
    this.info_items = py.slice(this.info_layer.items, null, null);
    this.map = new map.Map(this, true, false);
    this.folder = new folder.Folder(this);
    this.folder_default_tab = folder.CASE;
    return null;
  }
  set_phase(phase: any, force_reload: any = false): any {
    let loading_image: any;
    if ((!py.eq(this.load_phase_number, phase) || py.truthy(force_reload))) {
      this.loading_phase = true;
      this.game.stats.end_time_event(py.add(statcodes.PHASE_PREFIX, py.str(this.phase_number)));
      this.load_phase_number = phase;
      this.save_state_on_next_load_phase = true;
      this.stop_music();
      this.set_music(null, null);
      this.stop_timer("load_phase");
      if (py.truthy(this.initialized)) {
        loading_image = py.add(py.add("p0_loading_slides_00", py.str(phase)), ".jpg");
        this.game.show_loading(py.bind(this, "_Phase0Stage__show_loading_callback"), loading_image);
      }
    }
    return null;
  }
  prepare_items_set(stage: any, large: any, item_definitions: any = null): any {
    let set_name: any;
    set_name = "p2s01";
    if (py.truthy(large)) {
      stage.set_grid_definition(GRID_ORIGIN, GRID_CELL_WIDTH, GRID_CELL_HEIGHT, 2);
      stage.set_items(set_name, "l", item_definitions);
    } else {
      stage.set_grid_definition(GRID_ORIGIN, GRID_CELL_WIDTH, GRID_CELL_HEIGHT, 1);
      stage.set_items(set_name);
    }
    return null;
  }
  start_minigame(name: any): any {
    this.minigame = name;
    return null;
  }
  set_up_locator(): any {
    let dep, dep_name, image, locator_pos: any;
    dep = this.game.datastore.user_character_progress.case.last_department_visited;
    image = assets.load_image("p0_locator_backbar.png");
    this.locator_bar = new ItemImage(10, 19, image);
    py.m(this.info_layer, "add", this.locator_bar);
    image = assets.load_image("p0_locator_backmap.png");
    this.locator_back = new ItemImage(18, 10, image);
    py.m(this.info_layer, "add", this.locator_back);
    image = assets.load_image(py.add(py.add("p0_locator_dept_", dep.image), ".png"));
    locator_pos = dep.locator_pos;
    this.locator_sel = new ItemImage(py.getitem(locator_pos, 0), py.getitem(locator_pos, 1), image);
    py.m(this.info_layer, "add", this.locator_sel);
    this.locator_font = assets.load_font("evilgeniusbb_reg.ttf", 14);
    dep_name = text.to_upper(dep.name);
    this.locator_text = new ItemText(75, 22, this.locator_font, 0, dep_name, [255, 255, 255]);
    py.m(this.info_layer, "add", this.locator_text);
    this.locator_flag = new ItemImage(160, 44, assets.load_image(py.add(py.add("p0_flagsmall_", dep.image), ".png")));
    py.m(this.info_layer, "add", this.locator_flag);
    return null;
  }
  set_up_timer(): any {
    let image, last_snore, timer_backclock, timer_handcenter: any;
    this.timer_items = [];
    image = assets.load_image("p0_timer_backbar.png");
    this.timer_backbar = new ItemImage(401, 19, image);
    py.m(this.info_layer, "add", this.timer_backbar);
    py.m(this.timer_items, "append", this.timer_backbar);
    image = assets.load_image("p0_timer_backclock.png");
    timer_backclock = new ItemImage(531, 5, image);
    py.m(this.info_layer, "add", timer_backclock);
    py.m(this.timer_items, "append", timer_backclock);
    this.timer_big_hands = [assets.load_image("p0_timer_bighand_001.png"), assets.load_image("p0_timer_bighand_002.png"), assets.load_image("p0_timer_bighand_003.png"), assets.load_image("p0_timer_bighand_004.png"), assets.load_image("p0_timer_bighand_005.png"), assets.load_image("p0_timer_bighand_006.png"), assets.load_image("p0_timer_bighand_007.png"), assets.load_image("p0_timer_bighand_008.png")];
    this.timer_short_hands = [assets.load_image("p0_timer_shorthand_001.png"), assets.load_image("p0_timer_shorthand_002.png"), assets.load_image("p0_timer_shorthand_003.png"), assets.load_image("p0_timer_shorthand_004.png"), assets.load_image("p0_timer_shorthand_005.png"), assets.load_image("p0_timer_shorthand_006.png"), assets.load_image("p0_timer_shorthand_007.png"), assets.load_image("p0_timer_shorthand_008.png"), assets.load_image("p0_timer_shorthand_009.png"), assets.load_image("p0_timer_shorthand_010.png"), assets.load_image("p0_timer_shorthand_011.png"), assets.load_image("p0_timer_shorthand_012.png")];
    last_snore = assets.load_image("p0_timer_snore_006.png");
    this.timer_snoore_animation = [assets.load_image("p0_timer_snore_001.png"), assets.load_image("p0_timer_snore_002.png"), assets.load_image("p0_timer_snore_003.png"), assets.load_image("p0_timer_snore_004.png"), assets.load_image("p0_timer_snore_005.png"), last_snore, last_snore, last_snore, last_snore];
    this.timer_snore = new ItemImage(52, 213, py.getitem(this.timer_snoore_animation, 0));
    this.timer_big_hand = new ItemImage(538, 16, py.getitem(this.timer_big_hands, 0));
    py.m(this.info_layer, "add", this.timer_big_hand);
    py.m(this.timer_items, "append", this.timer_big_hand);
    this.timer_short_hand = new ItemImage(538, 17, py.getitem(this.timer_short_hands, 0));
    py.m(this.info_layer, "add", this.timer_short_hand);
    py.m(this.timer_items, "append", this.timer_short_hand);
    image = assets.load_image("p0_timer_handcenter.png");
    timer_handcenter = new ItemImage(550, 29, image);
    py.m(this.info_layer, "add", timer_handcenter);
    py.m(this.timer_items, "append", timer_handcenter);
    this.timer_text = new ItemText(402, 22, this.locator_font, 0, "", [255, 255, 255], null, 128, 18, 3, 1);
    py.m(this.info_layer, "add", this.timer_text);
    py.m(this.timer_items, "append", this.timer_text);
    this.timer_days = 99999;
    this.timer_hour = 99999;
    this.timer_minute_pos = 0;
    return null;
  }
  fade_out_timer(callback: any = null): any {
    let item: any;
    for (item of py.iter(this.timer_items)) {
      animations.fade_out_item(item, false, 450, callback);
      callback = null;
    }
    return null;
  }
  fade_in_timer(callback: any = null): any {
    let item: any;
    for (item of py.iter(this.timer_items)) {
      animations.fade_in_item(item, 450, callback);
      callback = null;
    }
    return null;
  }
  _Phase0Stage__set_timer_position(pos: any): any {
    let item, x_base, x_rel, y_base, y_rel: any;
    [x_base, y_base] = [this.timer_backbar.get_left(), this.timer_backbar.get_top()];
    for (item of py.iter(this.timer_items)) {
      [x_rel, y_rel] = [(item.get_left() - x_base), (item.get_top() - y_base)];
      item.set_lefttop(py.add(py.getitem(pos, 0), x_rel), py.add(py.getitem(pos, 1), y_rel));
    }
    return null;
  }
  _Phase0Stage__animate_timer(end: any, time: any, callback: any): any {
    let animate_callback, dx, item, x_base, x_rel, y_base, y_rel: any;
    [x_base, y_base] = [this.timer_backbar.get_left(), this.timer_backbar.get_top()];
    dx = (py.getitem(end, 0) - x_base);
    animate_callback = (item: any): any => {
      if (py.truthy(callback)) {
        callback();
      }
      return null;
    };
    for (item of py.iter(this.timer_items)) {
      [x_rel, y_rel] = [(item.get_left() - x_base), (item.get_top() - y_base)];
      animations.start_move(item, py.add(py.getitem(end, 0), x_rel), py.add(py.getitem(end, 1), y_rel), time, [0.2, 0.2, 1], null, animate_callback);
      animate_callback = null;
    }
    return null;
  }
  update_timer_clock(item: any, data: any): any {
    let short_hand_image, text, turns, turns_left, update_text: any;
    this.stop_timer("timer_clock");
    if (((this.timer_days > this.timer_to_days) || (py.eq(this.timer_days, this.timer_to_days) && (this.timer_hour > this.timer_to_hour)))) {
      this.timer_days = this.timer_to_days;
      this.timer_hour = this.timer_to_hour;
      this.timer_minute_pos = 0;
      update_text = true;
    } else {
      this.timer_minute_pos = this.timer_minute_pos + 1;
      if ((this.timer_minute_pos < 8)) {
        update_text = false;
      } else {
        update_text = true;
        this.timer_minute_pos = 0;
        this.timer_hour = this.timer_hour + 1;
        if ((this.timer_hour >= 24)) {
          this.timer_hour = 0;
          this.timer_days = this.timer_days + 1;
        }
      }
    }
    if (((this.timer_hour >= 12) && (this.timer_hour < 20))) {
      turns = this.game.datastore.user_character_progress.case.get_turns(this.timer_days, this.timer_hour);
      turns_left = (this.time_limit - turns);
      if ((turns_left <= 4)) {
        this.timer_text.set_color([104, 0, 0]);
      } else if ((turns_left <= 8)) {
        this.timer_text.set_color([247, 207, 69]);
      } else {
        this.timer_text.set_color([255, 255, 255]);
      }
    }
    this.timer_big_hand.set_image(py.getitem(this.timer_big_hands, this.timer_minute_pos));
    short_hand_image = this.get_short_hand_image(this.timer_hour, this.timer_minute_pos, this.timer_short_hands);
    this.timer_short_hand.set_image(short_hand_image);
    if (py.truthy(update_text)) {
      text = py.add(py.add("D\xcdA ", py.str(this.timer_days)), " - ");
      if ((this.timer_hour < 10)) {
        text = py.add(text, py.add("0", py.str(this.timer_hour)));
      } else {
        text = py.add(text, py.str(this.timer_hour));
      }
      text = py.add(text, ":00 HS.");
      this.timer_text.set_text(text);
    }
    if ((this.timer_minute_pos === 0)) {
      if ((this.timer_hour === 20)) {
        if (!py.truthy(this.contains_layer(this.night_layer))) {
          this.render();
          this.start_night();
        }
      } else if ((this.timer_hour === 8)) {
        if (py.truthy(this.contains_layer(this.night_layer))) {
          this.render();
          this.end_night();
        }
      }
    }
    if ((py.eq(this.timer_hour, this.timer_to_hour) && py.eq(this.timer_days, this.timer_to_days))) {
      this.release_folder_help();
      this.unlock_ui();
      this.invoke_update_timer_callbacks();
      this.check_ending();
    } else {
      this.start_timer("timer_clock", 32, py.bind(this, "update_timer_clock"), null);
      if ((this.timer_minute_pos === 0)) {
        if (((this.timer_hour >= 12) && (this.timer_hour < 20))) {
          this.clock_sound.play();
        }
      }
    }
    return null;
  }
  get_short_hand_image(day_hour: any, minute_pos: any, timer_short_hands: any): any {
    let short_pos: any;
    if ((day_hour >= 12)) {
      day_hour = day_hour - 12;
    }
    short_pos = py.add(py.mul(day_hour, 4), py.div(minute_pos, 2));
    if ((short_pos < 12)) {
      return py.getitem(timer_short_hands, short_pos);
    } else {
      if ((short_pos < 24)) {
        return py.getitem(timer_short_hands, (11 - (short_pos - 12))).flip_v_copy();
      }
      if ((short_pos < 36)) {
        return py.getitem(timer_short_hands, (short_pos - 24)).flip_hv_copy();
      }
      return py.getitem(timer_short_hands, (11 - (short_pos - 36))).flip_h_copy();
    }
    return null;
  }
  start_night(): any {
    if (!py.truthy(this._Phase0Stage__ending_visible)) {
      this.during_night = true;
      this.render();
      this.night_sound.play();
      this.set_music_volume(0.2, 500);
      this.night_character_layer = this.character_icon.get_layer();
      if ((this.night_character_layer != null)) {
        py.m(this.night_character_layer, "remove", this.character_icon);
      }
      this.update_character_rollover();
      py.m(this.night_layer, "add", this.character_icon);
      py.m(this.night_layer, "add", this.character_asleep_icon);
      this.show_dialog(this.night_layer, null, [1, 35, 84, 178]);
      this.blind_dialog(this.night_layer, animations.BlindDirection.SHOW_DOWN, true, [this.night_layer], py.bind(this, "start_night_callback"));
      animations.fade_in_item(this.character_asleep_icon, 350);
      animations.wait(this, 50, py.bind(this, "night_hide_character"));
    }
    return null;
  }
  night_hide_character(): any {
    animations.fade_out_item(this.character_icon, 130);
    return null;
  }
  start_night_callback(layer: any): any {
    let x, y: any;
    this.timer_snore.set_image(py.getitem(this.timer_snoore_animation, 0));
    py.m(this.night_layer, "add", this.timer_snore);
    animations.fade_in_item(this.timer_snore, 235);
    animations.start_image_sequence(this.timer_snore, this.timer_snoore_animation, 7, (-1));
    [x, y] = this.game.datastore.user_character.avatar_asleep_pos;
    this.timer_snore.set_left((py.add(this.character_asleep_icon.get_left(), x) - py.div(this.timer_snore.get_width(), 2)));
    this.timer_snore.set_top(((py.add(this.character_asleep_icon.get_top(), y) - 2) - py.getitem(this.timer_snoore_animation, 0).get_height()));
    animations.start_move(this.timer_snore, this.timer_snore.get_left(), (this.timer_snore.get_top() - 15), 235);
    return null;
  }
  end_night(): any {
    animations.fade_out_item(this.timer_snore, true, 235, py.bind(this, "end_night_snoore_callback"));
    animations.start_move(this.timer_snore, this.timer_snore.get_left(), py.add(this.timer_snore.get_top(), 15), 235);
    return null;
  }
  end_night_snoore_callback(item: any): any {
    py.m(this.night_layer, "remove", this.character_icon);
    py.m(this.night_layer, "add", this.character_icon);
    animations.fade_in_item(this.character_icon, 350);
    animations.fade_out_item(this.character_asleep_icon, 175);
    this.blind_dialog(this.night_layer, animations.BlindDirection.HIDE_UP, true, [this.night_layer], py.bind(this, "end_night_callback"));
    return null;
  }
  end_night_callback(layer: any): any {
    py.m(this.night_layer, "remove", this.character_asleep_icon);
    if ((this.night_character_layer != null)) {
      py.m(this.night_character_layer, "add", this.character_icon);
    }
    this.close_dialog(this.night_layer);
    this.during_night = false;
    this.update_character_rollover();
    this.set_music_volume(1, 500);
    return null;
  }
  update_locator(): any {
    let dep, dep_name, image, locator_pos: any;
    dep = this.game.datastore.user_character_progress.case.last_department_visited;
    dep_name = text.to_upper(dep.name);
    this.locator_text.set_text(dep_name);
    image = assets.load_image(py.add(py.add("p0_locator_dept_", dep.image), ".png"));
    locator_pos = dep.locator_pos;
    this.locator_sel.set_lefttop(py.getitem(locator_pos, 0), py.getitem(locator_pos, 1));
    this.locator_sel.set_image(image);
    this.locator_flag.set_image(assets.load_image(py.add(py.add("p0_flagsmall_", dep.image), ".png")));
    return null;
  }
  set_time_left(time: any = 0, callback: any = null): any {
    let key: any;
    this.game.datastore.user_character_progress.case.time_spend = py.add(this.game.datastore.user_character_progress.case.time_spend, time);
    key = "update_time_left";
    this.stop_timer(key);
    if ((callback != null)) {
      py.m(this.update_time_callbacks, "append", callback);
    }
    this.start_timer("update_time_left", 10, py.bind(this, "update_time_left"), null, true, false);
    return null;
  }
  update_time_left(key: any, data: any): any {
    let appling_blind, days, hour, layer: any;
    this.stop_timer(key);
    appling_blind = false;
    for (layer of py.iter(this.layers)) {
      if (py.truthy(animations.is_applying_blind(this, layer))) {
        appling_blind = true;
        break;
      }
    }
    if (py.truthy(appling_blind)) {
      this.start_timer(key, 50, py.bind(this, "update_time_left"), null, true, false);
    } else {
      [days, hour] = this.game.datastore.user_character_progress.case.actual_days();
      if ((!py.eq(this.timer_hour, hour) || !py.eq(this.timer_days, days))) {
        this.timer_to_hour = hour;
        this.timer_to_days = days;
        if (!py.truthy(this.is_timer_started("timer_clock"))) {
          this.lock_folder_help();
          this.lock_ui();
          this.start_timer_clock();
        }
      } else {
        this.invoke_update_timer_callbacks();
      }
    }
    return null;
  }
  invoke_update_timer_callbacks(): any {
    let callback, callbacks: any;
    callbacks = py.slice(this.update_time_callbacks, null, null);
    this.update_time_callbacks = [];
    for (callback of py.iter(callbacks)) {
      callback();
    }
    return null;
  }
  start_timer_clock(): any {
    this.time_limit = this.game.datastore.user_character_progress.case.time_limit;
    this.start_timer("timer_clock", 32, py.bind(this, "update_timer_clock"), null);
    if ((this.timer_hour !== 99999)) {
      this.render();
      this.clock_sound.play();
    }
    return null;
  }
  set_up_options(): any {
    this.backbar_image = assets.load_image("p0_bottomgui_backbar.png");
    this.backbar_item = new ItemImage(0, 361, this.backbar_image);
    py.m(this.options_layer, "add", this.backbar_item);
    this.glow_image = assets.load_image("p0_bottomgui_icon_glow.png");
    this.map_image = assets.load_image("p0_bottomgui_map_icon.png");
    this.map_icon = new ItemImage(375, 397, this.map_image);
    py.m(this.options_layer, "add", this.map_icon);
    this.map_icon.add_event_handler(ItemEvent.CLICK, py.bind(this, "map_click"));
    this.map_icon.set_rollover(this.glow_image, this.rollover_sound, (-5), (-15));
    this.folder_image = assets.load_image("p0_bottomgui_case_icon.png");
    this.folder_icon = new ItemImage(445, 398, this.folder_image);
    py.m(this.options_layer, "add", this.folder_icon);
    this.folder_icon.select_witnesses = false;
    this.folder_icon.add_event_handler(ItemEvent.CLICK, py.bind(this, "folder_click"));
    this.folder_icon.set_rollover(this.glow_image, this.rollover_sound, (-10), (-15));
    this.notes_image = assets.load_image("p0_bottomgui_notes_icon.png");
    this.notes_icon = new ItemImage(520, 394, this.notes_image);
    py.m(this.options_layer, "add", this.notes_icon);
    this.notes_icon.add_event_handler(ItemEvent.CLICK, py.bind(this, "notes_click"));
    this.notes_icon.set_rollover(this.glow_image, this.rollover_sound, (-15), (-11));
    return null;
  }
  set_up_character(): any {
    this.character_icon = this.create_character_item();
    this.character_asleep_icon = this.create_character_asleep_item();
    py.m(this.info_layer, "add", this.character_icon);
    this.update_character_rollover();
    return null;
  }
  prepare_dialog(layer: any, only_character: any = false, animate: any = false): any {
    let item, item_layer: any;
    this.phase.on_prepare_dialog(animate);
    if (py.truthy(only_character)) {
      item = this.character_icon;
      item_layer = item.get_layer();
      if ((item_layer != null)) {
        py.m(item_layer, "remove", item);
      }
      py.m(layer, "add", item);
    } else {
      for (item of py.iter(this.info_items)) {
        item_layer = item.get_layer();
        if ((item_layer != null)) {
          py.m(item_layer, "remove", item);
        }
      }
      for (item of py.iter(this.info_items)) {
        py.m(layer, "add", item);
      }
    }
    this.update_character_rollover();
    return null;
  }
  reset_dialog(restore_info_items: any = true, animate: any = false): any {
    let item, item_layer: any;
    this.phase.on_reset_dialog(animate);
    if (py.truthy(restore_info_items)) {
      for (item of py.iter(this.info_items)) {
        item_layer = item.get_layer();
        if ((item_layer != null)) {
          py.m(item_layer, "remove", item);
        }
      }
      for (item of py.iter(this.info_items)) {
        py.m(this.info_layer, "add", item);
      }
    }
    this.update_character_rollover();
    return null;
  }
  create_character_item(): any {
    let avatar_image, height, item: any;
    avatar_image = this.game.datastore.user_character.avatar_image;
    height = avatar_image.get_height();
    item = new ItemImage(0, (450 - height), avatar_image);
    item.add_event_handler(ItemEvent.CLICK, py.bind(this, "character_click"));
    return item;
  }
  create_character_asleep_item(): any {
    let avatar_asleep_image, height: any;
    avatar_asleep_image = this.game.datastore.user_character.avatar_asleep_image;
    height = avatar_asleep_image.get_height();
    return new ItemImage(7, (450 - height), avatar_asleep_image);
  }
  update_character_rollover(): any {
    if ((py.eq(this.character_icon.get_layer(), this.info_layer) && !py.truthy(this.during_night))) {
      this.character_icon.set_rollover_image(this.game.datastore.user_character.avatar_rollover_image, this.rollover_sound);
    } else {
      this.character_icon.set_rollover_image(null, null);
    }
    return null;
  }
  add_content_layers(): any {
    return null;
  }
  add_above_options_layers(): any {
    return null;
  }
  add_above_info_layers(): any {
    return null;
  }
  character_click(item: any, args: any): any {
    let merits_dialog: any;
    if ((py.eq(this.character_icon.get_layer(), this.info_layer) && !py.truthy(this.during_night))) {
      this.render();
      this.click_sound.play();
      merits_dialog = new merits.Merits(this);
      merits_dialog.show_merits();
    }
    return null;
  }
  notes_click(item: any, args: any): any {
    this.notes = new notes.Notes(this);
    this.show_dialog(this.notes.layer, py.bind(this, "notes_handle_event"));
    this.notes.select_first_page();
    this.render();
    this.notes_open_sound.play();
    return null;
  }
  notes_handle_event(e: any): any {
    if ((py.eq(e.type, KEYDOWN) && py.eq(e.key, K_ESCAPE))) {
      this.render();
      this.click_sound.play();
      this.notes.close_notes();
    }
    return null;
  }
  folder_click(item: any, args: any): any {
    if (py.truthy(this.game.datastore.user_character_progress.show_folder)) {
      item.select_witnesses = true;
    }
    this.show_dialog(this.folder.base_layer, py.bind(this, "folder_handle_event"));
    if (py.truthy(py.bind(item, "select_witnesses"))) {
      this.folder.add_start_layer(folder.WITNESS);
      if (py.truthy(this.game.datastore.user_character_progress.show_folder)) {
        this.game.datastore.user_character_progress.show_folder = false;
      }
      this.folder_icon.select_witnesses = false;
    } else {
      this.folder.add_start_layer(this.folder_default_tab);
    }
    return null;
  }
  folder_handle_event(e: any): any {
    if ((py.eq(e.type, KEYDOWN) && py.eq(e.key, K_ESCAPE))) {
      this.render();
      this.click_sound.play();
      this.folder.close_folder();
    }
    return null;
  }
  map_click(item: any, args: any): any {
    let case_, last_dep: any;
    case_ = this.game.datastore.user_character_progress.case;
    last_dep = py.getitem(case_.list_departments, (py.len(case_.list_departments) - 1));
    if ((py.eq(case_.last_department_lair, last_dep) && (case_.arrest_order_thief == null) && (this.phase_number === 2) && !py.truthy(this.arrest_order_warning_shown))) {
      this.arrest_order_warning_shown = true;
      this.show_arrest_order_warning();
    } else {
      this.map.set_up(true, false);
      this.show_dialog(this.map.map_layer, py.bind(this, "map_handle_event"));
      this.map.add_other_layer();
      this.render();
      this.open_map_sound.play();
    }
    return null;
  }
  map_handle_event(e: any): any {
    if ((py.eq(e.type, KEYDOWN) && py.eq(e.key, K_ESCAPE))) {
      return null;
      this.render();
      this.click_sound.play();
      this.map.close_map();
    }
    return null;
  }
  disable_map(): any {
    this.map_icon.set_alpha(120);
    return null;
  }
  disable_folder(): any {
    this.folder_icon.set_alpha(120);
    return null;
  }
  disable_notes(): any {
    this.notes_icon.set_alpha(120);
    return null;
  }
  enable_map(): any {
    this.map_icon.set_alpha(255);
    return null;
  }
  enable_folder(): any {
    this.folder_icon.set_alpha(255);
    return null;
  }
  enable_notes(): any {
    this.notes_icon.set_alpha(255);
    return null;
  }
  hide_clues(fade: any, callback: any): any {
    let item_found, item_mask: any;
    for ([item_mask, item_found] of py.iter(this.clue_items)) {
      item_mask.set_visible(false);
      if (py.truthy(fade)) {
        animations.fade_out_item(item_found, false, 500);
      } else {
        item_found.set_visible(false);
      }
    }
    if (py.truthy(fade)) {
      this.render();
      this.fade_sound.play();
    }
    if ((callback != null)) {
      animations.wait(this, 500, callback);
    }
    return null;
  }
  show_clues_with_fade(callback: any): any {
    let item_found, item_mask, show: any;
    show = false;
    for ([item_mask, item_found] of py.iter(this.clue_items)) {
      if (!py.truthy(item_found.get_visible())) {
        item_mask.set_visible(true);
        item_found.set_visible(true);
        if (!py.truthy(show)) {
          animations.fade_in_item(item_found, 500, callback);
          show = true;
        } else {
          animations.fade_in_item(item_found, 500);
        }
      }
    }
    if (!py.truthy(show)) {
      callback(null);
    } else {
      this.render();
      this.fade_sound.play();
    }
    return null;
  }
  find_clue(stage_clues: any, item_type: any): any {
    let stage_clue: any;
    for (stage_clue of py.iter(stage_clues)) {
      if (py.eq(stage_clue.clue.id, item_type)) {
        return stage_clue;
      }
    }
    throw new py.Exception(py.add("There is no clue for item_type = ", item_type));
    return null;
  }
  has_item_found(clue: any): any {
    return py.contains(this.items_found, clue);
  }
  add_item_found(item: any, show_animation: any): any {
    let item_found, item_image, item_mask, x, y: any;
    x = 174;
    y = 422;
    item_image = item.get_image();
    item_found = new ItemImage((py.add(x, (py.len(this.items_found) * 60)) - py.div(item_image.get_width(), 2)), (y - py.div(item_image.get_height(), 2)), item_image);
    item_found.stage_clue = item.stage_clue;
    item_mask = new ItemMask((py.add(x, (py.len(this.items_found) * 60)) - 17), (y - 17), [34, 34]);
    item_mask.item = item_found;
    item_mask.add_event_handler(ItemEvent.CLICK, py.bind(this, "_clue_click"));
    item_mask.set_rollover(this.glow_image, this.rollover_sound, (py.div((-item_mask.get_width()), 2) - 2));
    py.m(this.options_layer, "add", item_mask);
    py.m(this.options_layer, "add", item_found);
    py.m(this.items_found, "append", item.stage_clue);
    py.m(this.clue_items, "append", [item_mask, item_found]);
    return item_found;
  }
  show_arrest_order_warning(): any {
    let additional_fonts, back_image, back_item, close_image, close_item, close_rollover_image, font, font_bold, layer, message, text_item: any;
    layer = new Layer();
    back_image = assets.load_image("p0_warning_noID_back.png");
    back_item = new ItemImage(43, 33, back_image);
    py.m(layer, "add", back_item);
    this.warning_sound = assets.load_sound("p0_warning.ogg");
    font = assets.load_font("evilgeniusbb_reg.ttf", 13);
    font_bold = assets.load_font("evilgeniusbb_bld.ttf", 13);
    message = py.add(py.add(py.add(py.add(py.add("Est\xe1s &#f:bold!muy cerca&#f! de encontrar al ladr\xf3n\n", "y a\xfan no tienes una &#c144,22,22!&#f:bold!orden de arresto&#f!&#c! en su contra.\n"), "\n"), "Para hacerla ve a la solapa de &#c144,22,22!&#f:bold!identikit&#f!&#c! dentro de la\n"), "&#c144,22,22!&#f:bold!carpeta&#f!&#c! y &#f:bold!completa la informaci\xf3n&#f! con los datos\n"), "que te dieron los &#f:bold!testigos&#f!.");
    additional_fonts = py.mkdict([["bold", [font_bold, 13, (-2)]]]);
    text_item = new ItemText(88, 75, font, 16, message, [0, 0, 0], null, 405, 160, 2, 2, additional_fonts);
    py.m(layer, "add", text_item);
    close_image = assets.load_image("p0_button_close.png");
    close_rollover_image = assets.load_image("p0_button_close_rollover.png");
    close_item = new ItemImage(276, 328, close_image);
    close_item.set_rollover_image(close_rollover_image, this.rollover_sound);
    close_item.add_event_handler(ItemEvent.CLICK, py.bind(this, "_close_arrest_order_warning_click"));
    py.m(layer, "add", close_item);
    this.warning_dialog = layer;
    this.show_dialog(layer, py.bind(this, "arrest_order_warning_dialog_handle_event"));
    this.blind_dialog(layer, animations.BlindDirection.SHOW_DOWN);
    this.set_music_volume(0.2, 200);
    animations.wait(this, 300, py.bind(this, "play_warning_sound"));
    return null;
  }
  play_warning_sound(): any {
    this.warning_sound.play();
    animations.wait(this, 300, py.bind(this, "play_music_after_warning"));
    return null;
  }
  play_music_after_warning(): any {
    this.set_music_volume(1, 500);
    return null;
  }
  arrest_order_warning_dialog_handle_event(e: any): any {
    if ((py.eq(e.type, KEYDOWN) && py.truthy(pygame.K_ESCAPE))) {
      this.render();
      this.click_sound.play();
      this.close_arrest_order_warning_dialog();
      return true;
    }
    return null;
  }
  show_help_dialog(page: any, delay: any = 0, call_before_show: any = null, call_after_close: any = null): any {
    let help_dialog: any;
    if (py.truthy(this.during_night_or_applying_blind())) {
      this.start_timer("show_help_dialog", 10, py.bind(this, "show_help_dialog_timer"), [page, delay, call_before_show, call_after_close], true, false);
    } else if ((delay > 0)) {
      animations.wait_locked(this, delay, py.bind(this, "show_help_dialog_wait_callback"), [page, 0, call_before_show, call_after_close]);
    } else if (!py.truthy(this.showing_help)) {
      this.showing_help = true;
      this.help_call_after_close = call_after_close;
      help_dialog = new help.Help(this);
      if ((call_before_show != null)) {
        call_before_show();
      }
      help_dialog.show_help(page, false, true, py.bind(this, "close_help_callback"));
    }
    return null;
  }
  close_help_callback(): any {
    this.showing_help = false;
    if ((this.help_call_after_close != null)) {
      this.help_call_after_close();
    }
    return null;
  }
  show_help_dialog_timer(key: any, data: any): any {
    this.stop_timer(key);
    this.show_help_dialog(py.getitem(data, 0), py.getitem(data, 1), py.getitem(data, 2), py.getitem(data, 3));
    return null;
  }
  show_help_dialog_wait_callback(data: any): any {
    this.show_help_dialog(py.getitem(data, 0), py.getitem(data, 1), py.getitem(data, 2), py.getitem(data, 3));
    return null;
  }
  _close_arrest_order_warning_click(item: any, args: any): any {
    this.close_arrest_order_warning_dialog();
    return null;
  }
  close_arrest_order_warning_dialog(): any {
    this.blind_dialog(this.warning_dialog, animations.BlindDirection.HIDE_DOWN, true, [], py.bind(this, "_blind_arrest_order_warning_callback"));
    return null;
  }
  _blind_arrest_order_warning_callback(layer: any): any {
    this.close_dialog(layer);
    return null;
  }
  _clue_click(item: any, args: any): any {
    this.clue_dialog = this.show_clue_message(item.item, false, true, py.bind(this, "_close_clue_dialog"));
    return null;
  }
  _close_clue_dialog(): any {
    this.close_dialog(this.clue_dialog);
    this.reset_dialog();
    return null;
  }
  show_clue_message(item: any, from_stage: any, play_sound: any, close_callback: any): any {
    let box, close_button, close_x, close_y, dialog, dialog_item, font, image, item_image, message, rollover_image, text_item: any;
    font = assets.load_font("evilgeniusbb_reg.ttf", 13);
    dialog = new Layer();
    image = assets.load_image("p2_avatar_dialog_aclue.png");
    box = new ItemImage(62, 135, image);
    py.m(dialog, "add", box);
    message = "";
    if (py.truthy(from_stage)) {
      message = "mmmm... ";
    }
    message = py.add(message, item.stage_clue.build_item_message());
    message = text.to_upper(message);
    if (!py.truthy(py.m(message, "endswith", "."))) {
      message = py.add(message, ".");
    }
    text_item = new ItemText(92, 214, font, 0, message, [0, 0, 0], null, 280, 70, 2, 2);
    py.m(dialog, "add", text_item);
    close_x = 356;
    close_y = 157;
    item_image = item.get_image();
    dialog_item = new ItemImage((229 - py.div(item_image.get_width(), 2)), (180 - py.div(item_image.get_height(), 2)), item.get_image());
    py.m(dialog, "add", dialog_item);
    image = assets.load_image("btn_testigo_x_normal.png");
    rollover_image = assets.load_image("btn_testigo_x_rollover.png");
    close_button = new ItemImage(close_x, close_y, image, null, true);
    close_button.set_rollover_image(rollover_image, this.rollover_sound);
    close_button.add_event_handler(ItemEvent.CLICK, py.bind(this, "clue_dialog_close_click"));
    py.m(dialog, "add", close_button);
    this.clue_dialog = dialog;
    this.clue_dialog_close_callback = close_callback;
    this.prepare_dialog(dialog);
    this.show_dialog(dialog, py.bind(this, "clue_dialog_handle_event"));
    if (py.truthy(play_sound)) {
      this.render();
      this.popup_sound.play();
    }
    return dialog;
  }
  clue_dialog_close_click(item: any = null, args: any = null): any {
    this.close_clue_dialog();
    return null;
  }
  clue_dialog_handle_event(e: any): any {
    if (py.eq(e.type, KEYDOWN)) {
      if (py.eq(e.key, pygame.K_ESCAPE)) {
        this.render();
        this.click_sound.play();
        this.close_clue_dialog();
        return true;
      }
    }
    return null;
  }
  close_clue_dialog(): any {
    this.clue_dialog_close_callback();
    return null;
  }
  blind_layers(direction: any, area: any, duration: any = 450, callback: any = null): any {
    let call, layer: any;
    call = callback;
    for (layer of py.iter(this.layers)) {
      animations.blind_layer(layer, direction, null, duration, call);
      call = null;
    }
    return null;
  }
  start_map_help_animation(): any {
    this.start_timer("start_map_animation", 30, py.bind(this, "_Phase0Stage__start_map_help_animation_preinvoke_timer"), true);
    return null;
  }
  _Phase0Stage__start_map_help_animation_preinvoke_timer(key: any, data: any): any {
    if (!py.truthy(this._Phase0Stage__check_timer_moving())) {
      this.stop_timer(key);
      this.map_animation_times = 0;
      this.map_animation_dy = 30;
      this._Phase0Stage__map_help_animation_up();
      this.render();
      this.bounce_sound.play();
    }
    return null;
  }
  _Phase0Stage__map_help_animation_up(item: any = null): any {
    let duration: any;
    if ((this.map_animation_times >= 4)) {
      this.map_animation_dy = py.mul(this.map_animation_dy, 0.5);
    } else {
      this.map_animation_dy = py.mul(this.map_animation_dy, 0.9);
    }
    this.map_animation_times = this.map_animation_times + 1;
    if ((this.map_animation_times <= 8)) {
      this.map_icon.set_lefttop(375, 397);
      duration = py.add(60, (py.fdiv(py.float(this.map_animation_dy), 30) * 250));
      animations.start_move(this.map_icon, 375, (397 - this.map_animation_dy), duration, [0.2, 0.5, 1], null, py.bind(this, "_Phase0Stage__map_help_animation_down"));
    }
    return null;
  }
  _Phase0Stage__map_help_animation_down(item: any = null): any {
    let delay: any;
    delay = py.add(40, (py.fdiv(py.float(this.map_animation_dy), 30) * 160));
    animations.start_move(this.map_icon, 375, 397, delay, [0.7, 0.5, 1], null, py.bind(this, "_Phase0Stage__map_help_animation_up"));
    return null;
  }
  start_notes_help_animation(delay: any = 0): any {
    this.start_timer("start_notes_animation", 30, py.bind(this, "_Phase0Stage__start_notes_help_animation_preinvoke_timer"), [delay], true);
    return null;
  }
  _Phase0Stage__start_notes_help_animation_preinvoke_timer(key: any, data: any): any {
    let delay: any;
    if (!py.truthy(this._Phase0Stage__check_timer_moving())) {
      this.stop_timer(key);
      delay = py.getitem(data, 0);
      if ((this.notes_icon.get_alpha() < 255)) {
        return null;
      }
      if ((delay !== 0)) {
        this.animation_times = 0;
        animations.wait_locked(this, delay, py.bind(this, "_Phase0Stage__start_notes_help_animation_wait"));
      } else {
        this.notes_animation_times = 0;
        this.notes_animation_dy = 30;
        this._Phase0Stage__notes_help_animation_up();
        this.render();
        this.bounce_sound.play();
      }
    }
    return null;
  }
  _Phase0Stage__start_notes_help_animation_wait(item: any = null): any {
    this.start_notes_help_animation();
    return null;
  }
  _Phase0Stage__notes_help_animation_up(item: any = null): any {
    let duration: any;
    if ((this.notes_animation_times >= 4)) {
      this.notes_animation_dy = py.mul(this.notes_animation_dy, 0.5);
    } else {
      this.notes_animation_dy = py.mul(this.notes_animation_dy, 0.9);
    }
    this.notes_animation_times = this.notes_animation_times + 1;
    if ((this.notes_animation_times <= 8)) {
      this.notes_icon.set_lefttop(520, 394);
      duration = py.add(60, (py.fdiv(py.float(this.notes_animation_dy), 30) * 250));
      animations.start_move(this.notes_icon, 520, (394 - this.notes_animation_dy), duration, [0.2, 0.5, 1], null, py.bind(this, "_Phase0Stage__notes_help_animation_down"));
    }
    return null;
  }
  _Phase0Stage__notes_help_animation_down(item: any = null): any {
    let delay: any;
    delay = py.add(40, (py.fdiv(py.float(this.notes_animation_dy), 30) * 160));
    animations.start_move(this.notes_icon, 520, 394, delay, [0.7, 0.5, 1], null, py.bind(this, "_Phase0Stage__notes_help_animation_up"));
    return null;
  }
  lock_folder_help(): any {
    this.folder_animation_locks = this.folder_animation_locks + 1;
    return null;
  }
  release_folder_help(): any {
    this.folder_animation_locks = this.folder_animation_locks - 1;
    if (py.truthy(this.pending_folder_animation)) {
      this.start_folder_help_animation();
    }
    return null;
  }
  start_folder_help_animation(delay: any = 0): any {
    this.start_timer("start_folder_animation", 30, py.bind(this, "_Phase0Stage__start_folder_help_animation_preinvoke_timer"), [delay], true);
    return null;
  }
  _Phase0Stage__start_folder_help_animation_preinvoke_timer(key: any, data: any): any {
    let delay: any;
    if (!py.truthy(this._Phase0Stage__check_timer_moving())) {
      this.stop_timer(key);
      delay = py.getitem(data, 0);
      if ((this.folder_animation_locks > 0)) {
        this.pending_folder_animation = true;
        return null;
      }
      this.pending_folder_animation = false;
      if ((this.folder_icon.get_alpha() < 255)) {
        return null;
      }
      if ((delay !== 0)) {
        this.animation_times = 0;
        animations.wait_locked(this, delay, py.bind(this, "_Phase0Stage__start_folder_help_animation_wait"));
      } else {
        this.folder_animation_times = 0;
        this.folder_animation_dy = 30;
        this._Phase0Stage__folder_help_animation_up();
        this.render();
        this.bounce_sound.play();
      }
    }
    return null;
  }
  _Phase0Stage__start_folder_help_animation_wait(item: any = null): any {
    this.start_folder_help_animation();
    return null;
  }
  _Phase0Stage__folder_help_animation_up(item: any = null): any {
    let duration: any;
    if ((this.folder_animation_times >= 4)) {
      this.folder_animation_dy = py.mul(this.folder_animation_dy, 0.5);
    } else {
      this.folder_animation_dy = py.mul(this.folder_animation_dy, 0.9);
    }
    this.folder_animation_times = this.folder_animation_times + 1;
    if ((this.folder_animation_times <= 8)) {
      this.folder_icon.set_lefttop(445, 398);
      duration = py.add(60, (py.fdiv(py.float(this.folder_animation_dy), 30) * 250));
      animations.start_move(this.folder_icon, 445, (398 - this.folder_animation_dy), duration, [0.2, 0.5, 1], null, py.bind(this, "_Phase0Stage__folder_help_animation_down"));
    }
    return null;
  }
  _Phase0Stage__folder_help_animation_down(item: any = null): any {
    let delay: any;
    delay = py.add(40, (py.fdiv(py.float(this.folder_animation_dy), 30) * 160));
    animations.start_move(this.folder_icon, 445, 398, delay, [0.7, 0.5, 1], null, py.bind(this, "_Phase0Stage__folder_help_animation_up"));
    return null;
  }
  _Phase0Stage__check_timer_moving(): any {
    let days, hour: any;
    [days, hour] = this.game.datastore.user_character_progress.case.actual_days();
    return py.or((this.timer_days < days), () => py.and(py.eq(this.timer_days, days), () => (this.timer_hour < hour)));
  }
  _Phase0Stage__show_loading_callback(layer: any): any {
    this.start_timer("load_phase", 0, py.bind(this, "_Phase0Stage__load_phase_callback"));
    return null;
  }
  _Phase0Stage__hide_loading_callback(layer: any = null, inital_phase: any = false): any {
    this.set_time_left(0, py.bind(this, "_Phase0Stage__loading_set_time_callback"));
    return null;
  }
  _Phase0Stage__loading_set_time_callback(): any {
    this.loading_phase = false;
    this.seting_timer = true;
    if ((!py.truthy(this.minigame_started) && (this.phase_number !== 3))) {
      animations.wait_locked(this, 50, py.bind(this, "_Phase0Stage__show_dialog_step_callback"));
    }
    return null;
  }
  _Phase0Stage__show_dialog_step_callback(): any {
    let case_, cp: any;
    if (py.truthy(this.during_night_or_applying_blind())) {
      animations.wait(this, 50, py.bind(this, "_Phase0Stage__show_dialog_step_callback"));
    } else {
      this.seting_timer = false;
      if ((this.phase_number === 1)) {
        this.check_ending();
      }
      if (!py.truthy(this._Phase0Stage__ending_visible)) {
        cp = this.game.datastore.user_character_progress;
        case_ = cp.case;
        if ((case_.time_spend < case_.time_limit)) {
          if ((this.phase_number === 1)) {
            if ((cp.last_help_step_seen <= 0)) {
              this.show_help_dialog(1, 1000);
              cp.last_help_step_seen = 1;
            }
            this.phase.check_show_arrived_wrong_location();
          } else if ((this.phase_number === 2)) {
            if ((cp.last_help_step_seen <= 4)) {
              this.show_help_dialog(5, 1000);
              cp.last_help_step_seen = 5;
            }
          }
        }
      }
    }
    return null;
  }
  _Phase0Stage__load_phase_callback(key: any, data: any): any {
    this.stop_timer(key);
    this._Phase0Stage__load_phase(this.load_phase_number);
    return null;
  }
  _Phase0Stage__load_phase(phase: any): any {
    let initial_phase: any;
    this.loading_phase = true;
    if (!py.truthy(this.initialized)) {
      this.initialize_stage();
      this.initialized = true;
      initial_phase = true;
    } else {
      initial_phase = false;
    }
    this.empty_layers();
    if ((this.phase != null)) {
      this.reset_dialog();
    }
    this.set_mouse_cursor(null);
    this.set_items("");
    this.stop_timers();
    this.phase = null;
    this.map_icon.set_lefttop(375, 397);
    this.folder_icon.set_lefttop(445, 398);
    this.notes_icon.set_lefttop(520, 394);
    gc.collect();
    if ((phase === 1)) {
      this.phase = new phase1.Phase1Content();
      this.update_locator();
    } else if ((phase === 2)) {
      this.phase = new phase2.Phase2Content();
      this.arrest_order_warning_shown = false;
    } else if ((phase === 3)) {
      this.phase = new phase3.Phase3Content();
    } else {
      throw new py.Exception(py.add(py.add("Phase '", py.str(phase)), "' not implemented."));
    }
    this.phase_number = phase;
    this.add_layer(this.background_layer);
    this.phase.initialize(this.game, this);
    this.phase.add_content_layers();
    this.add_layer(this.options_layer);
    this.phase.add_above_options_layers();
    this.add_layer(this.info_layer);
    this.phase.add_above_info_layers();
    if (py.truthy(this.save_state_on_next_load_phase)) {
      this.save_progress(true);
      this.save_state_on_next_load_phase = false;
    } else {
      this.save_state_on_next_load_phase = true;
    }
    this.play_phase_music();
    this._Phase0Stage__ending_visible = false;
    if (((phase === 1) && (this.minigame != null))) {
      this.phase.start_minigame(this.minigame);
      this.minigame_started = true;
    } else {
      this.minigame_started = false;
    }
    this.minigame = null;
    this.game.stats.start_time_event(py.add(statcodes.PHASE_PREFIX, py.str(this.phase_number)));
    if ((this.phase_number === 3)) {
      py.bind(this, "_Phase0Stage__hide_loading_callback");
    } else {
      this.game.hide_loading(py.bind(this, "_Phase0Stage__hide_loading_callback"));
    }
    return null;
  }
  save_progress(check_save_in_development: any, save_character_list: any = false): any {
    this.game.datastore.save_character(py.add("p", py.str(this.phase_number)), check_save_in_development);
    if (py.truthy(save_character_list)) {
      this.game.datastore.save_characters();
    }
    return null;
  }
  play_phase_music(): any {
    let music: any;
    music = this.phase.get_music();
    if ((music != null)) {
      this.play_music(py.getitem(music, 0), py.getitem(music, 1));
    }
    return null;
  }
  check_ending(): any {
    this.checking_ending = true;
    if (!py.truthy(this.loading_phase)) {
      if (py.truthy(this.during_night_or_applying_blind())) {
        animations.wait(this, 50, py.bind(this, "check_ending"));
      } else {
        this.checking_ending = false;
        if ((this.game.datastore.user_character_progress.case.time_spend >= this.game.datastore.user_character_progress.case.time_limit)) {
          if (!py.truthy(this._Phase0Stage__ending_visible)) {
            this._Phase0Stage__ending_visible = true;
            this.show_time_up_end_game();
          }
          return null;
        }
        if (py.truthy(py.isinstance(this.phase, phase1.Phase1Content))) {
          if ((!py.truthy(this._Phase0Stage__ending_visible) && py.truthy(this.phase.final_stage_check()))) {
            this._Phase0Stage__ending_visible = true;
          }
        }
      }
    }
    return null;
  }
  during_night_or_applying_blind(): any {
    let layer: any;
    if (py.truthy(this.during_night)) {
      return true;
    } else {
      for (layer of py.iter(this.layers)) {
        if (py.truthy(animations.is_applying_blind(this, layer))) {
          return true;
        }
      }
      return false;
    }
    return null;
  }
  show_time_up_end_game(): any {
    let ending: any;
    if (py.truthy(this.during_night_or_applying_blind())) {
      animations.wait(this, 50, py.bind(this, "show_time_up_end_game"));
    } else {
      ending = new endgame.EndGame(this, endgame.EndReason.TIME_UP);
      ending.show_opening_dialog();
      this.save_progress(false);
    }
    return null;
  }
  show_mainmenu(): any {
    let main: any;
    if (!py.truthy(this.showing_mainmenu)) {
      this.pause_music(450);
      main = new mainmenu.MainMenu(this);
      this.showing_mainmenu = true;
      main.show_mainmenu(true, py.bind(this, "close_mainmenu_callback"));
    }
    return null;
  }
  close_mainmenu_callback(): any {
    this.showing_mainmenu = false;
    this.unpause_music();
    return null;
  }
  handle_event(e: any): any {
    let active_pin, active_pins, case_, character_progress, clue, department, final_stage, i, index, k, lair_sets, last_dep, mod, new_notes, note, notes: any;
    if (py.eq(e.type, pygame.KEYDOWN)) {
      if ((py.eq(e.key, pygame.K_ESCAPE) && !py.truthy(this.checking_ending) && !py.truthy(this._Phase0Stage__ending_visible) && !py.truthy(this.seting_timer) && !py.truthy(this.loading_phase))) {
        this.render();
        this.click_sound.play();
        this.show_mainmenu();
      }
      if (py.truthy(this.game.get_development_mode())) {
        mod = this.get_common_modifiers(e.mod);
        if ((py.eq(mod, pygame.KMOD_LSHIFT) && py.eq(e.key, pygame.K_g))) {
          if ((this.phase_number === 2)) {
            case_ = this.game.datastore.user_character_progress.case;
            py.setitem(case_.thief_lair_set, 1, null);
            this.phase.build_stage();
          }
        } else if ((py.eq(mod, pygame.KMOD_LCTRL) && py.eq(e.key, pygame.K_c))) {
          if ((this.phase_number === 1)) {
            this.phase.show_clues_found();
          }
        } else if ((py.eq(mod, pygame.KMOD_LSHIFT) && py.eq(e.key, pygame.K_h))) {
          if ((this.phase_number === 2)) {
            case_ = this.game.datastore.user_character_progress.case;
            lair_sets = this.game.datastore.list_lair_sets;
            index = py.add(py.m(lair_sets, "index", py.getitem(case_.thief_lair_set, 0)), 1);
            py.setitem(case_.thief_lair_set, 0, py.getitem(lair_sets, py.mod(py.add(index, 1), py.len(lair_sets))));
            py.setitem(case_.thief_lair_set, 1, null);
            this.phase.build_stage();
          }
        }
        if ((py.eq(mod, pygame.KMOD_LSHIFT) && py.eq(e.key, pygame.K_j))) {
          if ((this.phase_number === 1)) {
            active_pins = py.slice(this.phase.active_pins, null, null);
            k = 0;
            while ((this.phase.minigames_resolved < 3)) {
              active_pin = py.getitem(active_pins, k);
              k = k + 1;
              this.phase.witness_pin = active_pin;
              this.phase.set_witness_statement();
              this.phase.minigame_solved(true, true);
            }
            case_ = this.game.datastore.user_character_progress.case;
          }
        } else if ((py.eq(mod, pygame.KMOD_LSHIFT) && py.eq(e.key, pygame.K_v))) {
          final_stage = new endgame.EndGame(this, 2);
          final_stage.wrong_location_callback = py.bind(this.phase, "wrong_location_callback");
          final_stage.show_opening_dialog();
        } else if ((py.eq(mod, pygame.KMOD_LSHIFT) && py.eq(e.key, pygame.K_x))) {
          final_stage = new endgame.EndGame(this, 0);
          final_stage.show_opening_dialog();
        } else if ((py.eq(mod, pygame.KMOD_LSHIFT) && py.eq(e.key, pygame.K_z))) {
          final_stage = new endgame.EndGame(this, 1);
          final_stage.show_opening_dialog();
        } else if ((py.eq(mod, pygame.KMOD_LSHIFT) && py.eq(e.key, pygame.K_a))) {
          case_ = this.game.datastore.user_character_progress.case;
          case_.arrest_order_thief = case_.thief;
          last_dep = py.getitem(case_.list_departments, (py.len(case_.list_departments) - 1));
          case_.last_department_lair = last_dep;
          case_.last_department_visited = last_dep;
          case_.clues_found = [];
          for (clue of py.iter(py.slice(case_.list_stage_clues, null, 3))) {
            py.m(case_.clues_found, "append", clue.clue.id);
          }
          this.game.datastore.user_character_progress.case.caught_thief = 1;
          this.timer_days = 2;
          this.timer_hour = 14;
          final_stage = new endgame.EndGame(this, 1);
          final_stage.show_opening_dialog();
        } else if ((py.eq(mod, pygame.KMOD_LSHIFT) && py.eq(e.key, pygame.K_s))) {
          case_ = this.game.datastore.user_character_progress.case;
          case_.arrest_order_thief = case_.thief;
          last_dep = py.getitem(case_.list_departments, (py.len(case_.list_departments) - 1));
          case_.last_department_lair = last_dep;
          case_.last_department_visited = last_dep;
          final_stage = new endgame.EndGame(this, 1);
          final_stage.show_opening_dialog();
        } else if ((py.eq(mod, pygame.KMOD_LSHIFT) && py.eq(e.key, pygame.K_d))) {
          character_progress = this.game.datastore.user_character_progress;
          case_ = character_progress.case;
          case_.arrest_order_thief = case_.thief;
          for (department of py.iter(this.game.datastore.list_departments)) {
            if (!py.eq(department, case_.crime_location.department)) {
              character_progress.add_medal(department.image);
            }
          }
          final_stage = new endgame.EndGame(this, 1);
          final_stage.show_opening_dialog();
        } else if ((py.eq(mod, pygame.KMOD_LSHIFT) && py.eq(e.key, pygame.K_f))) {
          case_ = this.game.datastore.user_character_progress.case;
          case_.arrest_order_thief = case_.thief;
          final_stage = new endgame.EndGame(this, 1);
          final_stage.show_opening_dialog();
        } else if ((py.eq(mod, pygame.KMOD_LSHIFT) && py.eq(e.key, pygame.K_2))) {
          this.set_phase(2, true);
        } else if ((py.eq(mod, pygame.KMOD_LSHIFT) && py.eq(e.key, pygame.K_t))) {
          this.set_time_left(1);
        } else if ((py.eq(mod, pygame.KMOD_LSHIFT) && py.eq(e.key, pygame.K_c))) {
          character_progress = this.game.datastore.user_character_progress;
          character_progress.resolved_cases = character_progress.resolved_cases + 3;
          py.m(character_progress.range, "update");
        } else if ((py.eq(mod, (pygame.KMOD_LSHIFT | pygame.KMOD_LCTRL)) && py.eq(e.key, pygame.K_n))) {
          notes = this.game.datastore.user_character_progress.notes;
          for (note of py.iter(this.game.datastore.list_history_facts)) {
            if (!py.contains(notes, note)) {
              py.m(notes, "append", note);
            }
          }
          for (note of py.iter(this.game.datastore.list_rivers)) {
            if (!py.contains(notes, note)) {
              py.m(notes, "append", note);
            }
          }
          for (note of py.iter(this.game.datastore.list_lagoons)) {
            if (!py.contains(notes, note)) {
              py.m(notes, "append", note);
            }
          }
          for (note of py.iter(this.game.datastore.list_hills)) {
            if (!py.contains(notes, note)) {
              py.m(notes, "append", note);
            }
          }
          for (note of py.iter(this.game.datastore.list_locations)) {
            if (!py.contains(notes, note)) {
              py.m(notes, "append", note);
            }
          }
          for (note of py.iter(this.game.datastore.list_writers)) {
            if (!py.contains(notes, note)) {
              py.m(notes, "append", note);
            }
          }
        } else if ((py.eq(mod, (pygame.KMOD_LSHIFT | pygame.KMOD_LCTRL)) && py.eq(e.key, pygame.K_m))) {
          notes = this.game.datastore.user_character_progress.notes;
          new_notes = this.game.datastore.user_character_progress.new_notes;
          for (note of py.iter(this.game.datastore.list_history_facts)) {
            if (!py.contains(new_notes, note)) {
              py.m(new_notes, "append", note);
            }
            if (!py.contains(notes, note)) {
              py.m(notes, "append", note);
            }
          }
          for (note of py.iter(this.game.datastore.list_rivers)) {
            if (!py.contains(new_notes, note)) {
              py.m(new_notes, "append", note);
            }
            if (!py.contains(notes, note)) {
              py.m(notes, "append", note);
            }
          }
          for (note of py.iter(this.game.datastore.list_lagoons)) {
            if (!py.contains(new_notes, note)) {
              py.m(new_notes, "append", note);
            }
            if (!py.contains(notes, note)) {
              py.m(notes, "append", note);
            }
          }
          for (note of py.iter(this.game.datastore.list_hills)) {
            if (!py.contains(new_notes, note)) {
              py.m(new_notes, "append", note);
            }
            if (!py.contains(notes, note)) {
              py.m(notes, "append", note);
            }
          }
          for (note of py.iter(this.game.datastore.list_locations)) {
            if (!py.contains(new_notes, note)) {
              py.m(new_notes, "append", note);
            }
            if (!py.contains(notes, note)) {
              py.m(notes, "append", note);
            }
          }
          for (note of py.iter(this.game.datastore.list_writers)) {
            if (!py.contains(new_notes, note)) {
              py.m(new_notes, "append", note);
            }
            if (!py.contains(notes, note)) {
              py.m(notes, "append", note);
            }
          }
        } else if ((py.eq(mod, pygame.KMOD_LSHIFT) && py.eq(e.key, pygame.K_m))) {
          character_progress = this.game.datastore.user_character_progress;
          character_progress.add_medal("uy");
          character_progress.add_medal("uy");
          k = 1;
          for (department of py.iter(this.game.datastore.list_departments)) {
            for (i of py.range(k)) {
              character_progress.add_medal(department.image);
            }
            k = k + 1;
          }
        }
      }
    }
    return null;
  }
  get_common_modifiers(mod: any): any {
    return (mod & (((((pygame.KMOD_LCTRL | pygame.KMOD_RCTRL) | pygame.KMOD_LALT) | pygame.KMOD_RALT) | pygame.KMOD_LSHIFT) | pygame.KMOD_RSHIFT));
  }
}
export class PhaseContent {
  constructor() {
    return;
  }
  initialize(game: any, stage: any): any {
    return null;
  }
  add_content_layers(): any {
    return null;
  }
  get_music(): any {
    return null;
  }
  add_above_options_layers(): any {
    return null;
  }
  add_above_info_layers(): any {
    return null;
  }
  on_prepare_dialog(animate: any): any {
    return null;
  }
  on_reset_dialog(animate: any): any {
    return null;
  }
}
py.register("game/stages/phase0", $self);
export function $set(name: string, v: any): void {
  switch (name) {
    case "GRID_CELL_HEIGHT": GRID_CELL_HEIGHT = v; break;
    case "GRID_CELL_WIDTH": GRID_CELL_WIDTH = v; break;
    case "GRID_ORIGIN": GRID_ORIGIN = v; break;
    case "GRID_SIZE": GRID_SIZE = v; break;
  }
}
