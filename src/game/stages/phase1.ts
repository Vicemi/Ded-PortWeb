// @ts-nocheck
// Generated from the original game code (see MODLOG.md). Do not edit by hand.
import * as py from '../../runtime/py';
import { ItemCell } from '../../runtime/prelude';
import { ItemEvent } from '../../runtime/prelude';
import { ItemImage } from '../../runtime/prelude';
import { ItemMask } from '../../runtime/prelude';
import { ItemText } from '../../runtime/prelude';
import { Layer } from '../../runtime/prelude';
import { Phase0Stage } from './phase0';
const Statement: any = py.lazyName("game/data/datamodel", "Statement");
import * as animations from '../../engine/animations';
import { assets } from '../../runtime/prelude';
import * as datastore from '../data/datastore';
const endgame: any = py.lazy("game/stages/endgame");
import * as janitor from './janitor';
import { math } from '../../runtime/py';
import * as minigamebricklayer from './minigamebricklayer';
import * as minigamegardener from './minigamegardener';
import * as minigamelibrarian from './minigamelibrarian';
import * as minigameshoptender from './minigameshoptender';
import * as phase0 from './phase0';
import * as phase2 from './phase2';
import { pygame } from '../../runtime/prelude';
import { random } from '../../runtime/py';
import * as text from '../../engine/textutil';
import * as web from '../../runtime/web';
import * as witness from './witness';
import * as $self from './phase1';

export class Phase1Content extends phase0.PhaseContent {
  constructor() {
    super();
    return;
  }
  initialize(game: any, stage: any): any {
    this.game = game;
    this.stage = stage;
    this.witness_dialog = new witness.Witness(this.stage);
    this.janitor_dialog = new janitor.Janitor(this.stage);
    this.minigames_resolved = 0;
    this.load_hideout_raccoon_images();
    this.witness_popup_sound = assets.load_sound("p1_witness_pop_up.ogg");
    this.raccoon_fade_sound = assets.load_sound("p1_racoon_fade.ogg");
    this.music_intro = assets.load_music("p1_music_intro.ogg");
    this.music_loop = assets.load_music("p1_music_loop.ogg");
    this.music_minigame_1 = assets.load_music("p1_bricklayer_gardener_music_loop.ogg");
    this.music_minigame_2 = assets.load_music("p1_shoptender_librarian_music_loop.ogg");
    return null;
  }
  get_music(): any {
    return [this.music_intro, this.music_loop];
  }
  final_stage_check(): any {
    let case_, last_dep: any;
    case_ = this.game.datastore.user_character_progress.case;
    last_dep = py.getitem(case_.list_departments, (py.len(case_.list_departments) - 1));
    if ((py.eq(case_.last_department_lair, last_dep) && py.eq(case_.last_department_visited, last_dep))) {
      if (py.truthy(case_.clues_identified)) {
        this.show_arrived_location_end_game();
      } else {
        this.stage.hide_clues(true, py.bind(this, "show_clues_found"));
      }
      return true;
    }
    return false;
  }
  show_clues_found(): any {
    let case_: any;
    if (py.truthy(this.stage.during_night)) {
      animations.wait(this.stage, 50, py.bind(this, "show_clues_found"));
    } else {
      this.clues_right_sound = assets.load_sound("p1_minigame_right.ogg");
      case_ = this.game.datastore.user_character_progress.case;
      case_.clues_identified = true;
      this.set_up_clues_found();
      this.stage.show_dialog(this.clues_found_layer, null);
      this.stage.blind_dialog(this.clues_found_layer, animations.BlindDirection.SHOW_DOWN);
      this.stage.render();
      animations.wait(this.stage, 50, py.bind(this, "play_show_clues_sound"));
    }
    return null;
  }
  play_show_clues_sound(): any {
    this.stage.render();
    this.clues_right_sound.play();
    return null;
  }
  set_up_clues_found(): any {
    let background_image, background_item, case_, close_image, close_item, close_rollover_image, clue_image, congratulations_item, font, font_bold, icon_item, item_found, item_mask, k, message, text_item, x, y: any;
    this.clues_found_layer = new Layer();
    background_image = assets.load_image("p0_cluesfound_backdrop_2.png");
    background_item = new ItemImage(76, 29, background_image);
    py.m(this.clues_found_layer, "add", background_item);
    font = assets.load_font("evilgeniusbb_reg.ttf", 14);
    font_bold = assets.load_font("evilgeniusbb_bld.ttf", 14);
    x = 158;
    k = 1;
    case_ = this.game.datastore.user_character_progress.case;
    for ([item_mask, item_found] of py.iter(this.stage.clue_items)) {
      if ((k === 1)) {
        y = 138;
      } else if ((k === 2)) {
        y = 222;
      } else if ((k === 3)) {
        y = 311;
      } else {
        break;
      }
      clue_image = item_found.get_image();
      icon_item = new ItemImage((x - py.div(clue_image.get_width(), 2)), (y - py.div(clue_image.get_height(), 2)), clue_image);
      py.m(this.clues_found_layer, "add", icon_item);
      message = item_found.stage_clue.build_right_department_message(case_.last_department_visited);
      text_item = new ItemText(204, (y - 30), font, 14, message, [0, 0, 0], null, 241, 60, 1, 2);
      py.m(this.clues_found_layer, "add", text_item);
      k = k + 1;
    }
    congratulations_item = new ItemText(221, 365, font_bold, 13, "\xa1BUEN TRABAJO!", [153, 0, 0], null, 160, 22, 2, 1);
    py.m(this.clues_found_layer, "add", congratulations_item);
    close_image = assets.load_image("p0_button_close.png");
    close_rollover_image = assets.load_image("p0_button_close_rollover.png");
    close_item = new ItemImage(281, 384, close_image);
    close_item.set_rollover_image(close_rollover_image, this.stage.rollover_sound);
    close_item.add_event_handler(ItemEvent.CLICK, py.bind(this, "close_cluesfound_click"));
    py.m(this.clues_found_layer, "add", close_item);
    return null;
  }
  close_cluesfound_click(item: any, args: any): any {
    this.stage.render();
    this.stage.click_sound.play();
    this.stage.blind_dialog(this.clues_found_layer, animations.BlindDirection.HIDE_DOWN, false, [], py.bind(this, "close_cluesfound_callback"));
    return null;
  }
  close_cluesfound_callback(layer: any): any {
    this.stage.close_dialog(this.clues_found_layer);
    this.show_arrived_location_end_game(false);
    return null;
  }
  show_arrived_location_end_game(blind_background: any = true): any {
    let ending: any;
    if (py.truthy(this.stage.during_night)) {
      animations.wait(this.stage, 50, py.bind(this, "show_arrived_location_end_game"));
    } else {
      ending = new endgame.EndGame(this.stage, endgame.EndReason.ARRIVED_LOCATION);
      ending.show_opening_dialog(blind_background);
      this.stage.save_progress(false);
    }
    return null;
  }
  add_content_layers(): any {
    let dep, dep_image: any;
    this.map_layer = new Layer();
    dep = this.game.datastore.user_character_progress.case.last_department_visited;
    dep_image = assets.load_image(py.add(py.add("p1_map_", dep.image), ".jpg"));
    this.dep_item = new ItemImage(py.getitem(dep.image_pos, 0), py.getitem(dep.image_pos, 1), dep_image);
    py.m(this.map_layer, "add", this.dep_item);
    this.stage.add_layer(this.map_layer);
    return null;
  }
  add_above_options_layers(): any {
    this.create_tags_layer();
    this.stage.add_layer(this.tags_layer);
    this.create_pins_layer();
    this.stage.add_layer(this.pins_layer);
    this.create_witness_layer();
    return null;
  }
  add_above_info_layers(): any {
    this.stage.add_layer(this.witness_layer);
    this.raccoon_layer = new Layer();
    this.stage.add_layer(this.raccoon_layer);
    this.update_notes();
    this.load_progress();
    return null;
  }
  load_progress(): any {
    let case_, clue_found, clues, clues_found, item, p, stage_clue: any;
    case_ = this.stage.game.datastore.user_character_progress.case;
    case_ = this.stage.game.datastore.user_character_progress.case;
    if (py.eq(case_.last_department_lair, py.getitem(case_.list_departments, 0))) {
      for (p of py.iter(py.slice(this.active_pins, null, null))) {
        if (py.contains(case_.list_visited_witnesses, p.witness)) {
          this.witness_pin = p;
          this.minigame_solved(true, true);
        }
      }
    }
    clues_found = py.slice(case_.clues_found, null, null);
    if ((py.len(clues_found) > 0)) {
      this.stage.prepare_items_set(this.stage, true);
      clues = py.slice(case_.list_stage_clues, null, 3);
      for (clue_found of py.iter(clues_found)) {
        stage_clue = this.stage.find_clue(clues, clue_found);
        if (!py.truthy(this.stage.has_item_found(stage_clue))) {
          item = new ItemCell(this.stage, clue_found, phase2.ItemState.NORMAL);
          item.is_clue = true;
          item.stage_clue = stage_clue;
          this.stage.add_item_found(item, false);
        }
      }
      if (py.truthy(case_.clues_identified)) {
        this.stage.hide_clues(false, null);
      }
    }
    return null;
  }
  check_show_arrived_wrong_location(): any {
    let case_, user_character_progress: any;
    user_character_progress = this.game.datastore.user_character_progress;
    case_ = user_character_progress.case;
    if (!py.contains(case_.list_departments, case_.last_department_visited)) {
      this.stage.set_time_left(0, py.bind(this, "show_arrived_wrong_location"));
    }
    return null;
  }
  show_arrived_wrong_location(): any {
    let ending, layer, wait: any;
    wait = false;
    for (layer of py.iter(this.stage.layers)) {
      if (py.truthy(animations.is_applying_blind(this.stage, layer))) {
        wait = true;
        break;
      }
    }
    if ((py.truthy(wait) && py.truthy(this.stage.during_night))) {
      animations.wait(this.stage, 50, py.bind(this, "show_arrived_wrong_location"));
    } else {
      ending = new endgame.EndGame(this.stage, endgame.EndReason.ARRIVED_WRONG_LOCATION);
      ending.wrong_location_callback = py.bind(this, "wrong_location_callback");
      ending.show_opening_dialog();
    }
    return null;
  }
  wrong_location_callback(): any {
    this.stage.show_clues_with_fade(py.bind(this, "wrong_location_clues_callback"));
    return null;
  }
  wrong_location_clues_callback(item: any = null): any {
    this.stage.start_map_help_animation();
    return null;
  }
  create_tags_layer(): any {
    this.tags_layer = new Layer();
    this.city_tag_images = [assets.load_image("p1_state_tag_size_1.png"), assets.load_image("p1_state_tag_size_2.png"), assets.load_image("p1_state_tag_size_3.png")];
    this.tag_font = assets.load_font("evilgeniusbb_reg.ttf", 12);
    return null;
  }
  create_pins_layer(): any {
    let c, case_, dep, i, index, k, pin, pin_glow_image, pin_image, w, witness: any;
    case_ = this.game.datastore.user_character_progress.case;
    dep = case_.last_department_visited;
    this.pins_layer = new Layer();
    pin_glow_image = assets.load_image("p1_map_pin_glow.png");
    this.pin_glow = new ItemImage(0, 0, pin_glow_image);
    this.pin_glow.set_visible(false);
    py.m(this.pins_layer, "add", this.pin_glow);
    this.pin_witnesses = [];
    for (i of py.range(py.len(dep.city_pins))) {
      py.m(this.pin_witnesses, "append", py.getitem(this.game.datastore.user_character_progress.case.list_witnesses, i));
    }
    index = 0;
    this.active_pins = [];
    if (py.eq(dep, py.getitem(case_.list_departments, 0))) {
      for (c of py.iter(dep.city_pins)) {
        pin_image = this.load_pin_image(index);
        if (py.truthy(c.flipped)) {
          pin_image.flip_h();
        }
        pin = new ItemImage(c.x, c.y, pin_image);
        pin.city = c;
        pin.department = dep;
        witness = null;
        for (w of py.iter(this.pin_witnesses)) {
          if (py.eq(w.city, c)) {
            witness = w;
            break;
          }
        }
        if ((witness == null)) {
          witness = py.getitem(this.pin_witnesses, index);
        }
        pin.witness = witness;
        this._pin_set_events(pin);
        pin.witness_image = assets.load_image(pin.witness.image);
        py.m(this.pins_layer, "add", pin);
        py.m(this.active_pins, "append", pin);
        index = index + 1;
      }
      for (k of py.range(py.len(case_.list_departments))) {
        if (py.eq(py.getitem(case_.list_departments, k), dep)) {
          this.target_pin = py.getitem(this.active_pins, py.getitem(case_.list_target_cities, k));
          break;
        }
      }
    }
    return null;
  }
  _pin_set_events(pin: any): any {
    if (py.truthy(py.hasattr(pin, "_has_events"))) {
      pin._has_events = pin._has_events + 1;
    } else {
      pin._has_events = 1;
    }
    if ((pin._has_events > 1)) {
      return null;
    }
    pin.add_event_handler(ItemEvent.MOUSE_ENTER, py.bind(this, "pin_enter"));
    pin.add_event_handler(ItemEvent.MOUSE_LEAVE, py.bind(this, "pin_leave"));
    pin.add_event_handler(ItemEvent.CLICK, py.bind(this, "pin_click"));
    return null;
  }
  _pin_clear_events(pin: any): any {
    if (!py.truthy(pin._has_events)) {
      return null;
    }
    pin._has_events = pin._has_events - 1;
    if (py.truthy(pin._has_events)) {
      return null;
    }
    pin.remove_event_handler(ItemEvent.MOUSE_ENTER, py.bind(this, "pin_enter"));
    pin.remove_event_handler(ItemEvent.MOUSE_LEAVE, py.bind(this, "pin_leave"));
    pin.remove_event_handler(ItemEvent.CLICK, py.bind(this, "pin_click"));
    return null;
  }
  create_witness_layer(): any {
    let font, witness_box_image, witness_picholder_image: any;
    this.witness_layer = new Layer();
    this.witness_layer.set_visible(false);
    witness_box_image = assets.load_image("p1_map_rollover_base.png");
    this.witness_box = new ItemImage(0, 0, witness_box_image);
    py.m(this.witness_layer, "add", this.witness_box);
    this.witness_arrow_image = assets.load_image("p1_map_rollover_arrow.png");
    this.witness_arrow_image_flipped = this.witness_arrow_image.flip_v_copy();
    this.witness_arrow = new ItemImage(0, 0, this.witness_arrow_image);
    py.m(this.witness_layer, "add", this.witness_arrow);
    witness_picholder_image = assets.load_image("pic_holder_testigo.png");
    this.witness_picholder = new ItemImage(0, 0, witness_picholder_image);
    py.m(this.witness_layer, "add", this.witness_picholder);
    font = assets.load_font("powdrft_.ttf", 24);
    this.witness_name = new ItemText(0, 0, font, 0, "", [157, 21, 21]);
    py.m(this.witness_layer, "add", this.witness_name);
    font = assets.load_font("powdrft_.ttf", 20);
    this.witness_city = new ItemText(0, 0, font, 13, "", [102, 102, 102], null, 169, 30, 1, 3);
    py.m(this.witness_layer, "add", this.witness_city);
    return null;
  }
  load_pin_image(index: any): any {
    if ((index === 0)) {
      return assets.load_image("p1_map_pin_blue.png");
    }
    if ((index === 1)) {
      return assets.load_image("p1_map_pin_green.png");
    }
    if ((index === 2)) {
      return assets.load_image("p1_map_pin_lightblue.png");
    }
    if ((index === 3)) {
      return assets.load_image("p1_map_pin_red.png");
    }
    if ((index === 4)) {
      return assets.load_image("p1_map_pin_violet.png");
    }
    if ((index === 5)) {
      py.print("There is no image for pin index", index);
      throw new py.SystemExit();
    }
    return null;
  }
  load_hideout_raccoon_images(): any {
    this.raccoon_images = [assets.load_image("p1_thief_hideout_raccoon_tail.png"), assets.load_image("p1_thief_hideout_raccoon_body.png"), assets.load_image("p1_thief_hideout_raccoon_lids_001.png"), assets.load_image("p1_thief_hideout_raccoon_lids_002.png"), assets.load_image("p1_thief_hideout_raccoon_hands.png")];
    this.raccoon_animation = [py.getitem(this.raccoon_images, 2), py.getitem(this.raccoon_images, 3), py.getitem(this.raccoon_images, 3), null, null, null, null, null, py.getitem(this.raccoon_images, 2), py.getitem(this.raccoon_images, 3), py.getitem(this.raccoon_images, 3), null];
    return null;
  }
  pin_enter(item: any, args: any): any {
    this.stage.render();
    this.witness_popup_sound.play();
    this.show_pin_glow(item);
    this.show_witness(item);
    return null;
  }
  pin_leave(item: any, args: any): any {
    this.pin_glow.set_visible(false);
    this.witness_layer.set_visible(false);
    return null;
  }
  check_thief_location_assignement(): any {
    if (((this.minigames_resolved === 2) && !py.truthy(this.witness_pin.witness.witness_statement.location_statement))) {
      this.witness_pin.witness.witness_statement.location_statement = new Statement(generate_thief_location_statement(this.target_pin.city));
    }
    return null;
  }
  pin_click(item: any, args: any): any {
    let case_, minigamebricklayer_dialog, minigamegardener_dialog, minigamelibrarian_dialog, minigameshoptender_dialog, witness: any;
    this.stage.render();
    this.stage.click_sound.play();
    this.witness_pin = item;
    this.set_witness_statement();
    if ((this.minigames_resolved < 3)) {
      this.check_thief_location_assignement();
      witness = item.witness;
      if (py.eq(item.department, this.game.datastore.user_character_progress.case.last_department_lair)) {
        this.start_minigame(item.witness.name, this.witness_pin);
      } else {
        case_ = this.game.datastore.user_character_progress.case;
        if ((item.witness.name === "Almacenera")) {
          minigameshoptender_dialog = new minigameshoptender.MinigameShoptender(this.stage, this, this.witness_pin.witness);
          minigameshoptender_dialog.show_wrong_place_dialog();
          case_.wrong_witness_visited = true;
        } else if ((item.witness.name === "Jardinero")) {
          minigamegardener_dialog = new minigamegardener.MinigameGardener(this.stage, this, this.witness_pin.witness);
          minigamegardener_dialog.show_wrong_place_dialog();
          case_.wrong_witness_visited = true;
        } else if ((item.witness.name === "Bibliotecario")) {
          minigamelibrarian_dialog = new minigamelibrarian.MinigameLibrarian(this.stage, this, this.witness_pin.witness);
          minigamelibrarian_dialog.show_wrong_place_dialog();
          case_.wrong_witness_visited = true;
        } else if ((item.witness.name === "Alba\xf1il")) {
          minigamebricklayer_dialog = new minigamebricklayer.MinigameBricklayer(this.stage, this, this.witness_pin.witness);
          minigamebricklayer_dialog.show_wrong_place_dialog();
          case_.wrong_witness_visited = true;
        }
      }
    } else {
      this.target_tag_click("", "");
    }
    return null;
  }
  start_minigame(name: any, witness_pin: any = null): any {
    let case_, minigamebricklayer_dialog, minigamegardener_dialog, minigamelibrarian_dialog, minigameshoptender_dialog: any;
    if ((witness_pin == null)) {
      witness_pin = py.getitem(this.active_pins, 0);
      case_ = this.game.datastore.user_character_progress.case;
      witness_pin.witness.witness_statement = py.getitem(case_.list_witness_statements, this.minigames_resolved);
      this.witness_pin = null;
    }
    if ((name === "Almacenera")) {
      minigameshoptender_dialog = new minigameshoptender.MinigameShoptender(this.stage, this, witness_pin.witness);
      minigameshoptender_dialog.show_opening_dialog();
    } else if ((name === "Jardinero")) {
      minigamegardener_dialog = new minigamegardener.MinigameGardener(this.stage, this, witness_pin.witness);
      minigamegardener_dialog.show_opening_dialog();
    } else if ((name === "Bibliotecario")) {
      minigamelibrarian_dialog = new minigamelibrarian.MinigameLibrarian(this.stage, this, witness_pin.witness);
      minigamelibrarian_dialog.show_opening_dialog();
    } else if ((name === "Alba\xf1il")) {
      minigamebricklayer_dialog = new minigamebricklayer.MinigameBricklayer(this.stage, this, witness_pin.witness);
      minigamebricklayer_dialog.show_opening_dialog();
    } else if ((name === "Vendedor")) {
      this.minigame_solved(true);
    } else if ((name === "Verdulera")) {
      this.minigame_solved(true);
    }
    return null;
  }
  set_witness_statement(): any {
    let case_: any;
    case_ = this.game.datastore.user_character_progress.case;
    if ((py.eq(py.getitem(case_.list_departments, 0), case_.last_department_lair) && py.eq(py.getitem(case_.list_departments, 0), case_.last_department_visited))) {
      this.witness_pin.witness.witness_statement = py.getitem(case_.list_witness_statements, this.minigames_resolved);
    }
    return null;
  }
  minigame_solved(solved: any, batch: any = false): any {
    this.minigame_solved_data = [solved, batch];
    if (!py.truthy(batch)) {
      web.send_data(datastore.STATS_URL, py.mkdict([["current", datastore.VERSION], ["stats", this.stage.game.stats.get_data()]]), {compressed: true});
      animations.wait_locked(this.stage, 80, py.bind(this, "minigame_update_time"));
    } else {
      this.minigame_update_time();
    }
    return null;
  }
  minigame_update_time(): any {
    let batch: any;
    batch = py.getitem(this.minigame_solved_data, 1);
    if (py.truthy(batch)) {
      this.minigame_set_time_callback();
    } else {
      this.stage.set_time_left(1, py.bind(this, "minigame_set_time_callback"));
    }
    return null;
  }
  minigame_set_time_callback(): any {
    let batch, case_, cp, show_help, solved: any;
    solved = py.getitem(this.minigame_solved_data, 0);
    batch = py.getitem(this.minigame_solved_data, 1);
    if ((py.truthy(solved) && (this.witness_pin != null))) {
      this.game.datastore.user_character_progress.case.update_visited_witnesses(this.witness_pin.witness);
      this.game.datastore.user_character_progress.show_folder = true;
      this.minigames_resolved = this.minigames_resolved + 1;
      this.disable_witnesses();
      if (py.truthy(batch)) {
        this.mark_city_solved(true);
      } else {
        show_help = false;
        cp = this.game.datastore.user_character_progress;
        case_ = cp.case;
        if (((case_.time_spend < case_.time_limit) && py.eq(case_.last_department_visited, py.getitem(case_.list_departments, 0)))) {
          if ((cp.last_help_step_seen <= 1)) {
            show_help = true;
            cp.last_help_step_seen = 2;
            animations.wait_locked(this.stage, 1500, py.bind(this, "show_help_dialog_after_minigame_solved"));
          } else if ((cp.last_help_step_seen <= 2)) {
            show_help = true;
            cp.last_help_step_seen = 3;
            animations.wait_locked(this.stage, 1500, py.bind(this, "show_help_dialog_after_minigame_solved"));
          }
        }
        if (py.truthy(show_help)) {
          animations.wait_locked(this.stage, 500, py.bind(this, "mark_city_solved_step1"));
        } else {
          animations.wait_locked(this.stage, 500, py.bind(this, "mark_city_solved"));
        }
        this.stage.save_progress(false);
      }
    }
    return null;
  }
  show_help_dialog_after_minigame_solved(): any {
    let cp: any;
    cp = this.game.datastore.user_character_progress;
    this.stage.show_help_dialog(cp.last_help_step_seen, 0, null, py.bind(this, "after_close_minigame_solved_help"));
    return null;
  }
  after_close_minigame_solved_help(): any {
    this.mark_city_solved_step2(false);
    return null;
  }
  target_tag_click(item: any, args: any): any {
    let option_texts, right_option: any;
    this.stage.render();
    this.stage.click_sound.play();
    [option_texts, right_option] = this.build_option_texts();
    this.janitor_dialog.show_janitor(this.target_pin.city, option_texts, right_option);
    return null;
  }
  update_notes(): any {
    let case_, dep, item, note, user_character_progress: any;
    user_character_progress = this.game.datastore.user_character_progress;
    case_ = user_character_progress.case;
    dep = case_.last_department_visited;
    if ((py.eq(dep, case_.last_department_lair) && (py.len(this.stage.items_found) > 0))) {
      for (item of py.iter(this.stage.items_found)) {
        note = item.note_item;
        if (!py.contains(user_character_progress.notes, note)) {
          py.m(user_character_progress.notes, "append", note);
          py.m(user_character_progress.new_notes, "append", note);
          user_character_progress.show_notes_animation = true;
        }
      }
      return true;
    }
    if ((py.eq(dep, py.getitem(case_.list_departments, 0)) && py.truthy(user_character_progress.show_notes_animation))) {
      this.stage.start_notes_help_animation(300);
      user_character_progress.show_notes_animation = false;
    } else {
      return false;
    }
    return null;
  }
  build_option_texts(): any {
    let animal, case_, correct_option, first_place, incorrect_option_1, incorrect_option_2, options, pet, possible_animals_list, possible_sports_list, second_place, selected_animal, selected_animals, selected_sport, selected_sports, sport, thief_sport, third_place, type, valid: any;
    case_ = this.game.datastore.user_character_progress.case;
    type = py.getitem(case_.list_witness_statements, 0).janitor_statement.type;
    if ((type === 1)) {
      thief_sport = case_.thief.sport;
      correct_option = thief_sport.name;
      possible_sports_list = [];
      for (sport of py.iter(this.game.datastore.list_sports)) {
        if (((py.eq(sport.category, thief_sport.category) && py.eq(sport.team, thief_sport.team) && !py.eq(sport.ball, thief_sport.ball)) || (py.eq(sport.category, thief_sport.category) && py.eq(sport.ball, thief_sport.ball) && !py.eq(sport.team, thief_sport.team)) || (py.eq(sport.team, thief_sport.team) && py.eq(sport.ball, thief_sport.ball) && !py.eq(sport.category, thief_sport.category)))) {
          py.m(possible_sports_list, "append", sport);
        }
      }
      selected_sports = [];
      while ((py.len(selected_sports) < 2)) {
        if ((py.len(possible_sports_list) > 0)) {
          sport = py.m(possible_sports_list, "pop", py.m(possible_sports_list, "index", random.choice(possible_sports_list)));
        } else {
          sport = random.choice(this.game.datastore.list_sports);
        }
        if (!py.eq(sport, thief_sport)) {
          valid = true;
          for (selected_sport of py.iter(selected_sports)) {
            if ((py.eq(sport.category, selected_sport.category) && py.eq(sport.ball, selected_sport.ball) && py.eq(sport.team, selected_sport.team))) {
              valid = false;
              break;
            }
          }
          if (py.truthy(valid)) {
            py.m(selected_sports, "append", sport);
          }
        }
      }
      incorrect_option_1 = py.getitem(selected_sports, 0).name;
      incorrect_option_2 = py.getitem(selected_sports, 1).name;
    } else {
      pet = case_.thief.animal;
      correct_option = pet.name;
      possible_animals_list = [];
      for (animal of py.iter(this.game.datastore.list_animals)) {
        if (((py.eq(animal.diet, pet.diet) && py.eq(animal.classification, pet.classification) && !py.eq(animal.movement, pet.movement)) || (py.eq(animal.diet, pet.diet) && py.eq(animal.movement, pet.movement) && !py.eq(animal.classification, pet.classification)) || (py.eq(animal.classification, pet.classification) && py.eq(animal.movement, pet.movement) && !py.eq(animal.diet, pet.diet)))) {
          py.m(possible_animals_list, "append", animal);
        }
      }
      selected_animals = [];
      while ((py.len(selected_animals) < 2)) {
        if ((py.len(possible_animals_list) > 0)) {
          animal = py.m(possible_animals_list, "pop", py.m(possible_animals_list, "index", random.choice(possible_animals_list)));
        } else {
          animal = random.choice(this.game.datastore.list_animals);
        }
        if (!py.eq(animal, pet)) {
          valid = true;
          for (selected_animal of py.iter(selected_animals)) {
            if ((py.eq(animal.diet, selected_animal.diet) && py.eq(animal.classification, selected_animal.classification) && py.eq(animal.movement, selected_animal.movement))) {
              valid = false;
              break;
            }
          }
          if (py.truthy(valid)) {
            py.m(selected_animals, "append", animal);
          }
        }
      }
      incorrect_option_1 = py.getitem(selected_animals, 0).name;
      incorrect_option_2 = py.getitem(selected_animals, 1).name;
    }
    options = [correct_option, incorrect_option_1, incorrect_option_2];
    first_place = py.m(options, "pop", py.m(options, "index", random.choice(options)));
    second_place = py.m(options, "pop", py.m(options, "index", random.choice(options)));
    third_place = py.m(options, "pop", py.m(options, "index", random.choice(options)));
    return [[first_place, second_place, third_place], correct_option];
  }
  target_tag_enter(item: any, args: any): any {
    let time_diff: any;
    if ((this.raccoon_lids.get_alpha() > 125)) {
      if (!py.truthy(this.raccoon_rollover.get_visible())) {
        this.raccoon_rollover.set_visible(true);
        time_diff = py.abs((this.raccoon_rollover_hide_timestamp - pygame.time.get_ticks()));
        if ((py.abs(time_diff) > 10)) {
          this.stage.render();
          this.stage.rollover_sound.stop();
          this.stage.rollover_sound.play();
        }
      }
    }
    return null;
  }
  target_tag_leave(item: any, args: any): any {
    this.raccoon_rollover.set_visible(false);
    this.raccoon_rollover_hide_timestamp = pygame.time.get_ticks();
    return null;
  }
  on_prepare_dialog(animate: any): any {
    if (py.truthy(animate)) {
      animations.blind_layer(this.raccoon_layer, animations.BlindDirection.HIDE_DOWN, null);
      animations.blind_layer(this.map_layer, animations.BlindDirection.HIDE_DOWN, null);
      animations.blind_layer(this.pins_layer, animations.BlindDirection.HIDE_DOWN, null);
      animations.blind_layer(this.tags_layer, animations.BlindDirection.HIDE_DOWN, null);
    } else {
      this.raccoon_layer.set_visible(false);
      this.map_layer.set_visible(false);
      this.pins_layer.set_visible(false);
      this.tags_layer.set_visible(false);
    }
    return null;
  }
  on_reset_dialog(animate: any): any {
    this.raccoon_layer.set_visible(true);
    this.map_layer.set_visible(true);
    this.pins_layer.set_visible(true);
    this.tags_layer.set_visible(true);
    if (py.truthy(animate)) {
      animations.blind_layer(this.raccoon_layer, animations.BlindDirection.SHOW_UP, null);
      animations.blind_layer(this.map_layer, animations.BlindDirection.SHOW_UP, null);
      animations.blind_layer(this.pins_layer, animations.BlindDirection.SHOW_UP, null);
      animations.blind_layer(this.tags_layer, animations.BlindDirection.SHOW_UP, null);
    }
    return null;
  }
  mark_city_solved(batch: any = false): any {
    this.mark_city_solved_step1(batch);
    this.mark_city_solved_step2(batch);
    return null;
  }
  mark_city_solved_step1(batch: any = false): any {
    py.m(this.active_pins, "remove", this.witness_pin);
    if (py.truthy(batch)) {
      py.m(this.witness_pin.get_layer(), "remove", this.witness_pin);
    } else {
      animations.fade_out_item(this.witness_pin, true);
    }
    if (py.truthy(this.pin_glow.get_visible())) {
      this.pin_glow.set_visible(false);
      this.witness_layer.set_visible(false);
    }
    this.add_city_tag(this.witness_pin, !py.truthy(batch));
    if ((this.minigames_resolved < 3)) {
      this.enable_witnesses();
    }
    if (!py.truthy(batch)) {
      this.stage.render();
      this.stage.fade_sound.play();
    }
    return null;
  }
  mark_city_solved_step2(batch: any = false): any {
    let layer, pin, wait: any;
    if (py.truthy(batch)) {
      wait = false;
    } else if (py.truthy(this.stage.during_night)) {
      wait = true;
    } else {
      wait = false;
      for (layer of py.iter(this.stage.layers)) {
        if (py.truthy(animations.is_applying_blind(this.stage, layer))) {
          wait = true;
          break;
        }
      }
    }
    if (py.truthy(wait)) {
      animations.wait(this.stage, 50, py.bind(this, "mark_city_solved_step2"));
    } else if ((this.minigames_resolved < 3)) {
      if (!py.truthy(batch)) {
        this.stage.start_folder_help_animation(0);
      }
    } else {
      for (pin of py.iter(this.active_pins)) {
        if (py.truthy(batch)) {
          py.m(pin.get_layer(), "remove", pin);
        } else {
          animations.fade_out_item(pin, true);
        }
        this.add_city_tag(pin, !py.truthy(batch));
      }
      if (py.truthy(batch)) {
        this.show_target_city(batch);
      } else {
        animations.wait_locked(this.stage, 1000, py.bind(this, "show_target_city"));
      }
      if (!py.truthy(batch)) {
        if (!py.truthy(this.stage.during_night)) {
          this.stage.set_music_volume(0.2, 200);
        }
        this.stage.render();
        this.stage.fade_sound.play();
      }
    }
    return null;
  }
  show_target_city(batch: any = false): any {
    let help_shown: any;
    if ((this.target_pin != null)) {
      help_shown = this.add_raccoon(this.target_pin, !py.truthy(batch));
      if ((!py.truthy(batch) && !py.truthy(help_shown))) {
        this.stage.start_folder_help_animation(2000);
      }
    } else {
      this.enable_witnesses();
    }
    return null;
  }
  add_raccoon(pin: any, fade: any = true): any {
    let case_, cp, help_delay, mask_image, milliseconds, raccoon_body, raccoon_hands, raccoon_mask, raccoon_tail, show_help, size, tag_item, tag_x, tag_y, x, y: any;
    [tag_x, tag_y] = pin.city.tag_pos;
    size = pin.city.tag_size;
    if ((size === 1)) {
      x = py.add(tag_x, 14);
      y = (tag_y - 34);
    } else if ((size === 2)) {
      x = py.add(tag_x, 27);
      y = (tag_y - 34);
    } else if ((size === 3)) {
      x = py.add(tag_x, 26);
      y = (tag_y - 34);
    }
    if ((size < 3)) {
      mask_image = assets.load_mask("p1_thief_hideout_raccoon_mask_1.gif");
      if ((size === 1)) {
        raccoon_mask = new ItemMask(py.add(tag_x, 17), (tag_y - 34), mask_image);
      } else {
        raccoon_mask = new ItemMask(py.add(tag_x, 30), (tag_y - 34), mask_image);
      }
    } else {
      mask_image = assets.load_mask("p1_thief_hideout_raccoon_mask_2.gif");
      raccoon_mask = new ItemMask(py.add(tag_x, 31), (tag_y - 34), mask_image);
    }
    this.raccoon_rollover = new ItemImage((x - 11), (y - 10), this.pin_glow);
    this.raccoon_rollover.set_visible(false);
    this.raccoon_rollover_hide_timestamp = 0;
    raccoon_tail = new ItemImage(x, y, py.getitem(this.raccoon_images, 0));
    raccoon_body = new ItemImage(x, y, py.getitem(this.raccoon_images, 1));
    this.raccoon_lids = new ItemImage(x, y, null);
    raccoon_hands = new ItemImage(x, y, py.getitem(this.raccoon_images, 4));
    py.m(this.tags_layer, "add", this.raccoon_rollover, 0);
    py.m(this.tags_layer, "add", raccoon_mask, 1);
    py.m(this.raccoon_layer, "add", raccoon_tail);
    py.m(this.raccoon_layer, "add", raccoon_body);
    py.m(this.raccoon_layer, "add", this.raccoon_lids);
    py.m(this.raccoon_layer, "add", raccoon_hands);
    if (py.truthy(fade)) {
      animations.fade_in_item(raccoon_tail, 500);
      animations.fade_in_item(raccoon_body, 500);
      animations.fade_in_item(this.raccoon_lids, 500);
      animations.fade_in_item(raccoon_hands, 500);
      animations.wait_locked(this.stage, 500, py.bind(this, "raccon_fade_in_callback"));
    }
    tag_item = py.getitem(pin.tag_items, 0);
    tag_item.add_event_handler(ItemEvent.CLICK, py.bind(this, "target_tag_click"));
    raccoon_mask.add_event_handler(ItemEvent.CLICK, py.bind(this, "target_tag_click"));
    tag_item.add_event_handler(ItemEvent.MOUSE_ENTER, py.bind(this, "target_tag_enter"));
    tag_item.add_event_handler(ItemEvent.MOUSE_LEAVE, py.bind(this, "target_tag_leave"));
    raccoon_mask.add_event_handler(ItemEvent.MOUSE_ENTER, py.bind(this, "target_tag_enter"));
    raccoon_mask.add_event_handler(ItemEvent.MOUSE_LEAVE, py.bind(this, "target_tag_leave"));
    this.enable_witnesses();
    if (py.truthy(fade)) {
      milliseconds = py.mul(random.randint(2, 4), 1000);
      animations.wait(this.stage, milliseconds, py.bind(this, "show_raccoon_animation"));
    }
    cp = this.stage.game.datastore.user_character_progress;
    case_ = cp.case;
    show_help = false;
    if (((case_.time_spend < case_.time_limit) && (cp.last_help_step_seen <= 3))) {
      if (py.truthy(fade)) {
        help_delay = 2000;
      } else {
        help_delay = 800;
      }
      animations.wait_locked(this.stage, help_delay, py.bind(this, "show_help_raccon"));
      cp.last_help_step_seen = 4;
      show_help = true;
    }
    if ((!py.truthy(this.stage.during_night) && py.truthy(fade))) {
      this.stage.render();
      this.raccoon_fade_sound.play();
      animations.wait(this.stage, py.mul(this.raccoon_fade_sound.get_length(), 1000), py.bind(this, "raccoon_fade_sound_callback"));
    }
    return show_help;
  }
  raccon_fade_in_callback(): any {
    return null;
  }
  raccoon_fade_sound_callback(): any {
    animations.wait(this.stage, 300, py.bind(this, "restore_music_after_raccoon"));
    return null;
  }
  restore_music_after_raccoon(): any {
    if (!py.truthy(this.stage.during_night)) {
      this.stage.set_music_volume(1, 500);
    }
    return null;
  }
  show_help_raccon(): any {
    this.stage.show_help_dialog(4, 0, null, py.bind(this.stage, "start_folder_help_animation"));
    return null;
  }
  show_raccoon_animation(): any {
    let milliseconds: any;
    animations.start_image_sequence(this.raccoon_lids, this.raccoon_animation, 25, 0);
    milliseconds = py.mul(random.randint(3, 7), 1000);
    animations.wait(this.stage, milliseconds, py.bind(this, "show_raccoon_animation"));
    return null;
  }
  add_city_tag(pin: any, fade: any = true): any {
    let break_index, callback, city_name, i, name1, name2, size, tag, tag_image, text1, text2, x, y: any;
    size = pin.city.tag_size;
    tag_image = py.getitem(this.city_tag_images, (size - 1));
    [x, y] = pin.city.tag_pos;
    tag = new ItemImage(x, y, tag_image);
    py.m(this.tags_layer, "add", tag);
    city_name = text.to_upper(pin.city.name);
    if ((size === 1)) {
      text1 = new ItemText(py.add(x, 5), py.add(y, 7), this.tag_font, 10, city_name, [0, 0, 0], null, 70, 10, 2, 2);
      text2 = null;
      py.m(this.tags_layer, "add", text1);
    } else if ((size === 2)) {
      text1 = new ItemText(py.add(x, 6), py.add(y, 7), this.tag_font, 10, city_name, [0, 0, 0], null, 96, 10, 2, 2);
      text2 = null;
      py.m(this.tags_layer, "add", text1);
    } else if ((size === 3)) {
      break_index = (-1);
      for (i of py.range(pin.city.tag_separation)) {
        break_index = py.m(city_name, "find", " ", py.add(break_index, 1));
      }
      if (py.eq(break_index, (-1))) {
        name1 = city_name;
        name2 = "";
      } else {
        name1 = py.slice(city_name, 0, break_index);
        name2 = py.slice(city_name, py.add(break_index, 1), null);
      }
      text1 = new ItemText(py.add(x, 6), py.add(y, 6), this.tag_font, 10, name1, [0, 0, 0], null, 96, 10, 2, 2);
      py.m(this.tags_layer, "add", text1);
      text2 = new ItemText(py.add(x, 6), py.add(y, 15), this.tag_font, 10, name2, [0, 0, 0], null, 96, 10, 2, 2);
      py.m(this.tags_layer, "add", text2);
    }
    pin.tag_items = [tag, text1, text2];
    if (py.truthy(fade)) {
      callback = null;
      animations.fade_in_item(tag, 1000);
      animations.fade_in_item(text1, 1000);
      if ((text2 != null)) {
        animations.fade_in_item(text2, 1000);
      }
    }
    return null;
  }
  remove_city_tag(pin: any): any {
    let tag_item: any;
    for (tag_item of py.iter(pin.tag_items)) {
      if ((tag_item != null)) {
        animations.fade_out_item(tag_item, true);
      }
    }
    return null;
  }
  show_pin_glow(item: any): any {
    let left, top: any;
    left = ((item.get_left() - py.div((this.pin_glow.get_width() - item.get_width()), 2)) + 5);
    top = ((item.get_top() - py.div((this.pin_glow.get_height() - item.get_height()), 2)) + 5);
    if (py.truthy(item.city.flipped)) {
      left = left - 10;
    }
    this.pin_glow.set_left(left);
    this.pin_glow.set_top(top);
    this.pin_glow.set_visible(true);
    return null;
  }
  show_witness(item: any): any {
    let arrow_left, arrow_top, box_height, box_left, box_top, box_width, flipv, window_width: any;
    box_height = this.witness_box.get_height();
    box_width = this.witness_box.get_width();
    box_top = ((item.get_top() - box_height) - 5);
    arrow_left = (py.add(item.get_left(), 9) - 20);
    if (py.truthy(item.city.flipped)) {
      arrow_left = arrow_left + 14;
    }
    box_left = (arrow_left - 105);
    window_width = py.getitem(this.game.get_window_size(), 0);
    if ((py.add(py.add(box_left, box_width), 5) > window_width)) {
      box_left = box_left - (py.add(py.add(box_left, box_width), 5) - window_width);
    }
    if ((box_left < 5)) {
      box_left = 5;
    }
    if ((box_top < 0)) {
      flipv = true;
      arrow_top = py.add(py.add(box_top, box_height), 47);
      if (py.truthy(item.city.flipped)) {
        arrow_left = arrow_left - 10;
      } else {
        arrow_left = arrow_left + 5;
      }
      box_top = (py.add(arrow_top, this.witness_arrow_image.get_height()) - 9);
    } else {
      flipv = false;
      arrow_top = (py.add(box_top, box_height) - 10);
    }
    if (!py.truthy(flipv)) {
      this.witness_arrow.set_image(this.witness_arrow_image);
    } else {
      this.witness_arrow.set_image(this.witness_arrow_image_flipped);
    }
    this.witness_box.set_top(box_top);
    this.witness_box.set_left(box_left);
    this.witness_arrow.set_top(arrow_top);
    this.witness_arrow.set_left(arrow_left);
    this.witness_picholder.set_left(py.add(box_left, 13));
    this.witness_picholder.set_top(py.add(box_top, 13));
    this.witness_name.set_left(py.add(box_left, 80));
    this.witness_name.set_top(py.add(box_top, 10));
    this.witness_city.set_left(py.add(box_left, 80));
    this.witness_city.set_top(py.add(box_top, 35));
    this.witness_picholder.set_image(item.witness_image);
    this.witness_name.set_text(item.witness.name);
    this.witness_city.set_text(item.city.name);
    this.witness_layer.set_visible(true);
    return null;
  }
  disable_witnesses(): any {
    let pin: any;
    for (pin of py.iter(this.active_pins)) {
      this._pin_clear_events(pin);
    }
    return null;
  }
  enable_witnesses(): any {
    let pin: any;
    for (pin of py.iter(this.active_pins)) {
      this._pin_set_events(pin);
    }
    return null;
  }
}
export function generate_thief_location_statement(city: any): any {
  let article, city_name: any;
  city_name = city.name;
  article = city.article;
  if ((article !== "")) {
    article = py.add(article, " ");
  }
  return py.add(py.add(py.add(py.add("Mencion\xf3 que se estaba hospedando en\n", article), "&#c144,22,22!&#f:bold!"), city_name), "&#f!&#c!.");
}
py.register("game/stages/phase1", $self);
