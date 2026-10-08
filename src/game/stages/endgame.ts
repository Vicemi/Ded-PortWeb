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
import * as animations from '../../engine/animations';
import { assets } from '../../runtime/prelude';
import * as datamodel from '../data/datamodel';
import * as datastore from '../data/datastore';
import * as des from '../../runtime/des';
import * as merits from './merits';
import * as minigame from './minigame';
import { pygame } from '../../runtime/prelude';
import { random } from '../../runtime/py';
import * as serialization from '../data/serialization';
import * as statcodes from '../data/statcodes';
import * as text from '../../engine/textutil';
import * as web from '../../runtime/web';

export class EndReason {
  static TIME_UP: any = 0;
  static ARRIVED_LOCATION: any = 1;
  static ARRIVED_WRONG_LOCATION: any = 2;
}
(EndReason as any).prototype.TIME_UP = (EndReason as any).TIME_UP;
(EndReason as any).prototype.ARRIVED_LOCATION = (EndReason as any).ARRIVED_LOCATION;
(EndReason as any).prototype.ARRIVED_WRONG_LOCATION = (EndReason as any).ARRIVED_WRONG_LOCATION;
export class EndGame {
  constructor(stage: any, reason: any) {
    this.stage = stage;
    this.reason = reason;
    this.layer = new Layer();
    this.font_13 = assets.load_font("evilgeniusbb_reg.ttf", 13);
    this.font_13_bold = assets.load_font("evilgeniusbb_bld.ttf", 13);
    this.font_14 = assets.load_font("evilgeniusbb_reg.ttf", 14);
    this.font_14_bold = assets.load_font("evilgeniusbb_bld.ttf", 14);
    this.font_16 = assets.load_font("evilgeniusbb_reg.ttf", 16);
    this.font_18 = assets.load_font("evilgeniusbb_reg.ttf", 18);
    this.rollover_sound = assets.load_sound("GUI_roll_over.ogg");
    this.continue_sound = assets.load_sound("GUI_Click.ogg");
    if (py.eq(reason, EndReason.TIME_UP)) {
      this.bell_sound = assets.load_sound("P0_Clock_Ring.ogg");
    } else {
      this.right_sound = assets.load_sound("p1_minigame_right.ogg");
      this.medal_sound = assets.load_sound("p0_medal_bugle.ogg");
      this.promotion_sound = assets.load_sound("p0_promotion_bugle.ogg");
    }
    this.case_solved = this.case_is_solved();
    this.caught_thief = this.stage.game.datastore.user_character_progress.case.caught_thief;
    this.next_visible = false;
    this.continue_visible = false;
    this.score_continue_visible = false;
    return;
  }
  build_fast_click(): any {
    this.screen_mask = new ItemMask(0, 0, [600, 450]);
    this.screen_mask.add_event_handler(ItemEvent.CLICK, py.bind(this, "screen_click"));
    py.m(this.layer, "add", this.screen_mask);
    return null;
  }
  screen_click(item: any, args: any): any {
    this.screen_next(true);
    return null;
  }
  screen_next(fast: any = false): any {
    if ((this.effect_number !== 0)) {
      if (!py.truthy(this.continue_button_layer)) {
        this.stage.stop_timers();
        this.show_blinds_down_effect(fast);
      }
    }
    return null;
  }
  show_final_screen(blind_background: any): any {
    this.layer.empty();
    this.continue_button_layer = null;
    this.stage.show_dialog(this.layer, py.bind(this, "final_screen_handle_event"));
    this.set_up_final_screen();
    this.effect_number = 0;
    this.stage.blind_dialog(this.layer, animations.BlindDirection.SHOW_DOWN, blind_background, [], py.bind(this, "blind_show_final_callback"));
    this.build_fast_click();
    return null;
  }
  blind_show_final_callback(layer: any): any {
    this.build_left_box();
    return null;
  }
  final_screen_handle_event(e: any): any {
    if ((py.eq(e.type, KEYDOWN) && py.eq(e.key, K_ESCAPE))) {
      this.stage.render();
      this.continue_sound.play();
      if (py.truthy(this.continue_visible)) {
        this.continue_with_next();
      } else if (py.truthy(this.score_continue_visible)) {
        this.score_continue();
      } else {
        this.screen_next(true);
      }
    }
    return null;
  }
  set_up_final_screen(): any {
    let case_, header_image, header_item_image, jail_image, jail_item_image, newspaper_image, newspaper_item_image, thief_image, thief_image_side, thief_item_image, thief_item_image_side: any;
    case_ = this.stage.game.datastore.user_character_progress.case;
    newspaper_image = assets.load_image("p0_endings_newspaper.png");
    newspaper_item_image = new ItemImage(59, 27, newspaper_image, null);
    py.m(this.layer, "add", newspaper_item_image);
    thief_image = assets.load_image(case_.thief.identikit_large_image_front);
    thief_image_side = assets.load_image(case_.thief.identikit_large_image_side);
    thief_item_image = new ItemImage(85, 188, thief_image, null);
    thief_item_image_side = new ItemImage(217, 188, thief_image_side, null);
    py.m(this.layer, "add", thief_item_image);
    py.m(this.layer, "add", thief_item_image_side);
    if ((py.truthy(this.case_solved) && py.truthy(this.caught_thief))) {
      header_image = assets.load_image("p0_endings_newspaper_win_header.gif");
      jail_image = assets.load_image("p0_endings_win_jail.png");
      jail_item_image = new ItemImage(85, 188, jail_image, null);
      py.m(this.layer, "add", jail_item_image);
      case_ = this.stage.game.datastore.user_character_progress.case;
      this.calculate_score();
      this.add_resolved_case();
      this.add_medal();
    } else {
      header_image = assets.load_image("p0_endings_newspaper_loose_header.gif");
    }
    header_item_image = new ItemImage(81, 111, header_image, null);
    py.m(this.layer, "add", header_item_image);
    return null;
  }
  calculate_score(): any {
    let case_, character_progress, datastore, level, score: any;
    datastore = this.stage.game.datastore;
    character_progress = datastore.user_character_progress;
    case_ = character_progress.case;
    level = character_progress.range.level;
    this.clues_found = py.len(case_.clues_found);
    this.remaining_turns = (case_.time_limit - case_.time_spend);
    this.scores = [py.add(1000, py.mul(level, 1000)), py.mul(100, this.clues_found), py.mul(this.remaining_turns, py.add(100, py.mul(level, 100)))];
    this.total_score = 0;
    for (score of py.iter(this.scores)) {
      this.total_score = py.add(this.total_score, score);
    }
    character_progress.score = py.add(character_progress.score, this.total_score);
    datastore.add_score("total", datastore.user_character, character_progress.score);
    datastore.save_highscores();
    return null;
  }
  add_resolved_case(): any {
    let case_, character_progress, dep: any;
    character_progress = this.stage.game.datastore.user_character_progress;
    character_progress.resolved_cases = character_progress.resolved_cases + 1;
    this.promoted = py.m(character_progress.range, "update");
    case_ = character_progress.case;
    if (!py.contains(character_progress.captured_thieves, case_.thief)) {
      py.m(character_progress.captured_thieves, "append", case_.thief);
    }
    dep = character_progress.case.crime_location.department;
    if (!py.contains(character_progress.list_departments_solved, dep)) {
      py.m(character_progress.list_departments_solved, "append", dep);
    }
    return null;
  }
  add_tutorial_medal(): any {
    let case_, character_progress: any;
    character_progress = this.stage.game.datastore.user_character_progress;
    case_ = character_progress.case;
    this.medal_name = case_.crime_location.department.image;
    character_progress.add_medal("tut");
    return null;
  }
  add_medal(): any {
    let case_, character_progress, count, department, department_medals, medal, uy_medals, won_uy_medals: any;
    character_progress = this.stage.game.datastore.user_character_progress;
    case_ = character_progress.case;
    this.medal_name = case_.crime_location.department.image;
    character_progress.add_medal(case_.crime_location.department.image);
    department_medals = py.mkdict([]);
    uy_medals = 0;
    for (department of py.iter(this.stage.game.datastore.list_departments)) {
      py.setitem(department_medals, department.image, 0);
    }
    for (medal of py.iter(character_progress.medals)) {
      if (py.contains(department_medals, medal.name)) {
        py.setitem(department_medals, medal.name, medal.count);
      } else if ((medal.name === "uy")) {
        uy_medals = medal.count;
      }
    }
    won_uy_medals = 999;
    for ([medal, count] of py.iter(py.m(department_medals, "items"))) {
      if ((count < won_uy_medals)) {
        won_uy_medals = count;
      }
    }
    this.won_uy_medal = false;
    while ((uy_medals < won_uy_medals)) {
      character_progress.add_medal("uy");
      uy_medals = uy_medals + 1;
      this.won_uy_medal = true;
    }
    return null;
  }
  build_continue_button(fast: any = false): any {
    let continue_image, continue_rollover_image: any;
    this.continue_button_layer = new Layer();
    continue_image = assets.load_image("p0_endings_btn_continue_normal.png");
    continue_rollover_image = assets.load_image("p0_endings_btn_continue_rollover.png");
    this.continue_button = new ItemImage(421, 395, continue_image);
    this.continue_button.set_rollover_image(continue_rollover_image, this.rollover_sound);
    this.continue_button.add_event_handler(ItemEvent.CLICK, py.bind(this, "button_click"));
    py.m(this.continue_button_layer, "add", this.continue_button);
    if (py.truthy(fast)) {
      this.show_blinds_down_effect();
    } else {
      animations.wait(this.stage, 1000, py.bind(this, "show_blinds_down_effect"));
    }
    return null;
  }
  build_left_box(): any {
    let additional_fonts, agent_text, character_name, left_box, left_box_image, message, text, text1, text2, text3: any;
    this.left_box_layer = new Layer();
    left_box = assets.load_image("p0_endings_win+loose_d2_back.png");
    left_box_image = new ItemImage(7, 50, left_box);
    py.m(this.left_box_layer, "add", left_box_image);
    if ((py.truthy(this.case_solved) && py.truthy(this.caught_thief))) {
      character_name = this.stage.game.datastore.user_character.charinfo.name;
      message = py.add(py.add(py.add("\xa1Felicitaciones! &#f:f14!Agente&#f!\n\n", "&#c102,0,0!&#f:f16!"), character_name), "&#f!&#c!\n");
      additional_fonts = py.mkdict([["f14", [this.font_14, 13]], ["f16", [this.font_16, 15]]]);
      text = new ItemText(32, 60, this.font_14_bold, 13, message, [54, 45, 45], null, 264, 70, 2, 2, additional_fonts);
      py.m(this.left_box_layer, "add", text);
    } else {
      text1 = new ItemText(59, 68, this.font_14_bold, 13, "Mejor suerte", [54, 45, 45], null, 120, 20, 2, 2);
      text2 = new ItemText(174, 69, this.font_14, 13, "La pr\xf3xima", [54, 45, 45], null, 90, 20, 2, 2);
      text3 = new ItemText(117, 85, this.font_14, 13, "vez agente", [54, 45, 45], null, 90, 20, 2, 2);
      py.m(this.left_box_layer, "add", text3);
      agent_text = new ItemText(63, 105, this.font_16, 15, this.stage.game.datastore.user_character.charinfo.name, [102, 0, 0], null, 196, 20, 2, 2);
      py.m(this.left_box_layer, "add", agent_text);
      py.m(this.left_box_layer, "add", text1);
      py.m(this.left_box_layer, "add", text2);
    }
    this.effect_number = 1;
    animations.wait(this.stage, 2500, py.bind(this, "show_blinds_down_effect"));
    return null;
  }
  show_blinds_down_effect(fast: any = false): any {
    if ((this.effect_number !== 0)) {
      if ((this.effect_number === 1)) {
        this.stage.add_layer(this.left_box_layer);
        this.effect_number = 2;
        this.build_right_box();
      } else if ((this.effect_number === 2)) {
        this.stage.add_layer(this.right_box_layer);
        this.effect_number = 3;
        this.build_continue_button(fast);
      } else if ((this.effect_number === 3)) {
        this.continue_visible = true;
        this.stage.add_layer(this.continue_button_layer);
      }
    }
    return null;
  }
  build_right_box(): any {
    let right_box, right_box_image, text1, text2, text3, text4, text5, text6, text7, text8: any;
    this.right_box_layer = new Layer();
    if (py.eq(this.reason, EndReason.ARRIVED_LOCATION)) {
      if ((py.truthy(this.case_solved) && py.truthy(this.caught_thief))) {
        right_box = assets.load_image("p0_endings_win_d3_back.png");
        right_box_image = new ItemImage(413, 317, right_box);
        py.m(this.right_box_layer, "add", right_box_image);
        text1 = new ItemText(425, 321, this.font_14_bold, 16, "\xa1Has resuelto este caso!", [0, 0, 0], null, 140, 60, 2, 2);
        py.m(this.right_box_layer, "add", text1);
      } else if ((this.caught_thief == null)) {
        right_box = assets.load_image("p0_endings_loose_d3_back.png");
        right_box_image = new ItemImage(346, 304, right_box);
        text1 = new ItemText(362, 322, this.font_13, 16, "Debes prestar", [0, 0, 0], null, 100, 20, 2, 2);
        text2 = new ItemText(441, 320, this.font_13_bold, 16, "M\xe1s atenci\xf3n", [0, 0, 0], null, 150, 20, 2, 2);
        text3 = new ItemText(565, 322, this.font_13, 16, "a", [0, 0, 0], null, 20, 20, 2, 2);
        text4 = new ItemText(396, 338, this.font_13, 16, "los", [0, 0, 0], null, 30, 20, 2, 2);
        text5 = new ItemText(423, 336, this.font_13_bold, 16, "datos", [0, 0, 0], null, 50, 20, 2, 2);
        text6 = new ItemText(457, 338, this.font_13, 16, "que te den", [0, 0, 0], null, 100, 20, 2, 2);
        text7 = new ItemText(420, 354, this.font_13, 16, "los", [0, 0, 0], null, 30, 20, 2, 2);
        text8 = new ItemText(448, 352, this.font_13_bold, 16, "testigos.", [0, 0, 0], null, 75, 20, 2, 2);
        py.m(this.right_box_layer, "add", right_box_image);
        py.m(this.right_box_layer, "add", text1);
        py.m(this.right_box_layer, "add", text2);
        py.m(this.right_box_layer, "add", text3);
        py.m(this.right_box_layer, "add", text4);
        py.m(this.right_box_layer, "add", text5);
        py.m(this.right_box_layer, "add", text6);
        py.m(this.right_box_layer, "add", text7);
        py.m(this.right_box_layer, "add", text8);
      } else {
        right_box = assets.load_image("p0_endings_loose_d3_back.png");
        right_box_image = new ItemImage(346, 304, right_box);
        text1 = new ItemText(362, 322, this.font_13, 16, "Intenta ser m\xe1s r\xe1pido", [0, 0, 0], null, 220, 52, 2, 2);
        py.m(this.right_box_layer, "add", right_box_image);
        py.m(this.right_box_layer, "add", text1);
      }
    } else if (py.eq(this.reason, EndReason.TIME_UP)) {
      right_box = assets.load_image("p0_endings_loose_d3_back.png");
      right_box_image = new ItemImage(346, 304, right_box);
      py.m(this.right_box_layer, "add", right_box_image);
      text1 = new ItemText(348, 301, this.font_14, 16, "intenta estudiar &#f:bld!m\xe1s detalladamente&#f! las pistas.", [0, 0, 0], null, right_box_image.get_width(), right_box_image.get_height(), 2, 2, py.mkdict([["bld", [this.font_14_bold, 18, 0]]]));
      py.m(this.right_box_layer, "add", text1);
    }
    animations.wait(this.stage, 1000, py.bind(this, "show_blinds_down_effect"));
    return null;
  }
  show_opening_dialog(blind_background: any = true): any {
    if (((this.caught_thief != null) && !py.truthy(this.caught_thief))) {
      this.next_button = null;
      this.show_final_screen(blind_background);
    } else {
      this.stage.show_dialog(this.layer, py.bind(this, "openining_handle_event"));
      if (py.truthy(blind_background)) {
        this.stage.blind_dialog(this.layer, animations.BlindDirection.SHOW_DOWN, blind_background, [], py.bind(this, "blind_show_opening_callback"));
      } else {
        this.blind_show_opening_callback();
      }
    }
    return null;
  }
  blind_show_opening_callback(layer: any = null): any {
    this.set_up_opening_dialog();
    this.stage.blind_dialog(this.layer, animations.BlindDirection.SHOW_DOWN, false, []);
    if (py.eq(this.reason, EndReason.TIME_UP)) {
      animations.wait(this.stage, 40, py.bind(this, "play_bell"));
    }
    return null;
  }
  score_handle_event(e: any): any {
    if ((py.eq(e.type, KEYDOWN) && py.eq(e.key, K_ESCAPE))) {
      this.stage.render();
      this.continue_sound.play();
      if (py.truthy(this.continue_visible)) {
        this.continue_with_next();
      } else if (py.truthy(this.score_continue_visible)) {
        this.score_continue();
      } else if ((py.truthy(this.showing_scores) && !py.truthy(this.skip_scores_animation))) {
        this.skip_scores_animation = true;
      } else if (py.truthy(this.next_visible)) {
        this.go_next();
      }
    }
    return null;
  }
  openining_handle_event(e: any): any {
    if ((py.eq(e.type, KEYDOWN) && py.eq(e.key, K_ESCAPE))) {
      this.stage.render();
      this.continue_sound.play();
      if (py.truthy(this.next_visible)) {
        this.go_next();
      }
    }
    return null;
  }
  play_bell(): any {
    this.stage.render();
    this.bell_sound.play();
    return null;
  }
  set_up_opening_dialog(): any {
    let animate_clock, box_text_h, box_text_w, case_, clock, clock_images, clock_iterations, dep_text, department_name, dialog_box, dialog_box_image, final_department_name, gender, left, next_button_x, next_button_y, next_image, next_rollover_image, stolen_obj, stolen_obj_text, text, text1, text2, text3, thief, thief_name, thief_text, top: any;
    if (py.eq(this.reason, EndReason.ARRIVED_LOCATION)) {
      if (py.truthy(this.case_solved)) {
        dialog_box_image = assets.load_image("p0_endings_win_d1_back.png");
        left = 95;
        top = 15;
        box_text_w = 336;
        box_text_h = 212;
        next_button_x = 282;
        next_button_y = 303;
      } else {
        dialog_box_image = assets.load_image("p0_endings_loose_d1_back.png");
        left = 101;
        top = 19;
        box_text_w = 336;
        box_text_h = 212;
        next_button_x = 282;
        next_button_y = 330;
      }
    } else if (py.eq(this.reason, EndReason.ARRIVED_WRONG_LOCATION)) {
      dialog_box_image = assets.load_image("p0_endings_win_d1_back.png");
      left = 95;
      top = 15;
      box_text_w = 336;
      box_text_h = 212;
      next_button_x = 282;
      next_button_y = 303;
    } else if (py.eq(this.reason, EndReason.TIME_UP)) {
      dialog_box_image = assets.load_image("p0_endings_notime_box.png");
      left = 134;
      top = 92;
      next_button_x = 282;
      next_button_y = 292;
    }
    dialog_box = new ItemImage(left, top, dialog_box_image, null);
    py.m(this.layer, "add", dialog_box);
    case_ = this.stage.game.datastore.user_character_progress.case;
    thief = case_.thief;
    if (py.eq(this.reason, EndReason.ARRIVED_LOCATION)) {
      thief_name = case_.thief.name;
      final_department_name = py.getitem(case_.list_departments, (py.len(case_.list_departments) - 1)).name;
      stolen_obj = case_.stolen_object.description2;
      text1 = new ItemText(262, 92, this.font_14, 14, "Al llegar a", [0, 0, 0], null, box_text_w, box_text_h);
      dep_text = new ItemText(136, 22, this.font_18, 14, final_department_name, [102, 0, 0], null, box_text_w, box_text_h, 2, 2);
      thief_text = new ItemText(135, 117, this.font_18, 14, py.add(thief_name, ","), [102, 0, 0], null, box_text_w, box_text_h, 2, 2);
      py.m(this.layer, "add", dep_text);
      py.m(this.layer, "add", thief_text);
    } else if (py.eq(this.reason, EndReason.ARRIVED_WRONG_LOCATION)) {
      thief_name = case_.thief.name;
      department_name = case_.last_department_visited.name;
      stolen_obj = case_.stolen_object.description2;
      text1 = new ItemText(262, 92, this.font_14, 14, "Al llegar a", [0, 0, 0], null, box_text_w, box_text_h);
      dep_text = new ItemText(136, 26, this.font_18, 14, department_name, [102, 0, 0], null, box_text_w, box_text_h, 2, 2);
      py.m(this.layer, "add", dep_text);
    } else if (py.eq(this.reason, EndReason.TIME_UP)) {
      text = py.add("Lamentablemente el tiempo que ten\xedas para resolver el caso se &#f:bld!acab\xf3&#f!.\n\n", "Seguramente el ladr\xf3n se encuentra &#f:bld!demasiado lejos&#f! para poder rastrearlo.");
      text1 = new ItemText(182, 168, this.font_14, 14, text, [0, 0, 0], null, 243, 111, 2, 2, py.mkdict([["bld", [this.font_14_bold, 0, (-1)]]]));
      this.stage.game.stats.increment_count_event(statcodes.ENDGAME_TIME_UP);
    }
    py.m(this.layer, "add", text1);
    if (py.eq(this.reason, EndReason.ARRIVED_LOCATION)) {
      if (py.truthy(this.case_solved)) {
        if ((this.caught_thief == null)) {
          if (py.eq(thief.sex, datastore.MALE)) {
            gender = "o";
          } else {
            gender = "a";
          }
          case_.thief_car_color = random.choice(datastore.THIEF_CAR_COLORS.keys());
          text2 = new ItemText(137, 65, this.font_14, 14, "Te pones r\xe1pidamente en contacto con las autoridades locales y luego de algunas indagaciones descubren que", [0, 0, 0], null, box_text_w, box_text_h, 2, 2);
          text3 = new ItemText(134, 144, this.font_14, 14, py.add("se encuentra huyendo hacia la carretera en un auto color ", py.getitem(datastore.THIEF_CAR_COLORS, case_.thief_car_color)), [0, 0, 0], null, box_text_w, box_text_h, 2, 2);
          stolen_obj_text = new ItemText(136, 183, this.font_16, 14, py.add(py.add(py.add(py.add("\xa1Debes perseguirl", gender), " y atraparl"), gender), "!"), [102, 0, 0], null, box_text_w, box_text_h, 2, 2);
          thief_text.set_top(105);
          py.m(this.layer, "add", stolen_obj_text);
        } else if (py.truthy(this.caught_thief)) {
          text1.set_visible(false);
          dep_text.set_visible(false);
          if (py.eq(thief.sex, datastore.MALE)) {
            gender = "o";
          } else {
            gender = "a";
          }
          text2 = new ItemText(137, 34, this.font_14, 14, py.add("Una vez arrestad", gender), [0, 0, 0], null, box_text_w, box_text_h, 2, 2);
          text3 = new ItemText(134, 102, this.font_14, 14, "confiesa el crimen\n y te entrega", [0, 0, 0], null, box_text_w, box_text_h, 2, 2);
          stolen_obj_text = new ItemText(136, 137, this.font_18, 14, py.add(stolen_obj, "."), [102, 0, 0], null, box_text_w, box_text_h, 2, 2);
          thief_text.set_top(64);
          py.m(this.layer, "add", stolen_obj_text);
          this.stage.game.stats.increment_count_event(statcodes.ENDGAME_SOLVED);
        }
      } else {
        text2 = new ItemText(136, 70, this.font_14, 14, "Te pones r\xe1pidamente en contacto con las autoridades locales y luego de algunas indagaciones dan con el paradero del ladr\xf3n que resulta ser", [0, 0, 0], null, box_text_w, box_text_h, 2, 2);
        if (py.eq(thief.sex, datastore.MALE)) {
          gender = "o";
        } else {
          gender = "a";
        }
        text3 = new ItemText(136, 173, this.font_14, 14, py.add(py.add("Lamentablemente no tienes una orden de arresto en su contra.\n\nAs\xed que te ves obligado a dejarl", gender), " en\nlibertad."), [0, 0, 0], null, box_text_w, box_text_h, 2, 2);
        this.stage.game.stats.increment_count_event(statcodes.ENDGAME_BAD_ORDER);
      }
      py.m(this.layer, "add", text2);
      py.m(this.layer, "add", text3);
    } else if (py.eq(this.reason, EndReason.ARRIVED_WRONG_LOCATION)) {
      text2 = new ItemText(136, 85, this.font_14, 14, "Te pones r\xe1pidamente en contacto con las autoridades locales y luego de investigar exhaustivamente &#f:bld!no encuentran rastros de la persona que buscas&#f!.", [0, 0, 0], null, box_text_w, box_text_h, 2, 2, py.mkdict([["bld", [this.font_14_bold, 0, (-1)]]]));
      text3 = new ItemText(136, 156, this.font_14, 14, "Seguramente se encuentre en otro departamento, estudia m\xe1s detalladamente las pistas que encontraste en su escondite.", [0, 0, 0], null, box_text_w, box_text_h, 2, 2);
      py.m(this.layer, "add", text2);
      py.m(this.layer, "add", text3);
    }
    next_image = assets.load_image("p0_button_next_active.png");
    next_rollover_image = assets.load_image("p0_button_next_rollover.png");
    this.next_button = new ItemImage(next_button_x, next_button_y, next_image);
    this.next_button.set_rollover_image(next_rollover_image, this.rollover_sound);
    this.next_button.add_event_handler(ItemEvent.CLICK, py.bind(this, "button_click"));
    this.next_visible = true;
    py.m(this.layer, "add", this.next_button);
    if (py.eq(this.reason, EndReason.TIME_UP)) {
      clock_images = [assets.load_image("p0_endings_notime_reloj_stand.png"), assets.load_image("p0_endings_notime_reloj_ring1.png"), assets.load_image("p0_endings_notime_reloj_ring2.png")];
      clock_iterations = [0];
      clock = new ItemImage(245, 67, py.getitem(clock_images, 0));
      py.m(this.layer, "add", clock);
      animate_clock = (): any => {
        py.setitem(clock_iterations, 0, py.getitem(clock_iterations, 0) + 1);
        clock.set_image(py.getitem(clock_images, py.mod(py.getitem(clock_iterations, 0), 3)));
        if ((py.getitem(clock_iterations, 0) < 12)) {
          animations.wait(this.stage, 80, animate_clock);
        }
        return null;
      };
      animations.wait(this.stage, 80, animate_clock);
    }
    return null;
  }
  button_click(item: any, args: any): any {
    this.stage.render();
    this.continue_sound.play();
    if (py.eq(item, this.next_button)) {
      this.go_next();
    } else if (py.eq(item, this.continue_button)) {
      this.continue_with_next();
    }
    return null;
  }
  go_next(): any {
    let hide_background: any;
    this.next_visible = false;
    if (py.eq(this.reason, EndReason.ARRIVED_WRONG_LOCATION)) {
      hide_background = true;
    } else {
      hide_background = false;
    }
    if ((py.eq(this.reason, EndReason.ARRIVED_LOCATION) && py.truthy(this.case_solved) && (this.caught_thief == null))) {
      this.stage.set_phase(3);
    } else {
      this.stage.blind_dialog(this.layer, animations.BlindDirection.HIDE_DOWN, hide_background, [], py.bind(this, "blind_next_callback"));
    }
    return null;
  }
  continue_with_next(): any {
    let base64, k, score: any;
    this.continue_visible = false;
    this.hide_layers();
    k = des.des(datastore.SCORE_KEY, des.CBC, datastore.SCORE_IV, null, des.PAD_PKCS5);
    score = base64.b64encode(k.encrypt(py.str(this.stage.game.datastore.get_highscore_data())));
    web.send_data(datastore.STATS_URL, py.mkdict([["current", datastore.VERSION], ["stats", this.stage.game.stats.get_data()], ["score", score]]), {compressed: true});
    if ((!py.eq(this.reason, EndReason.ARRIVED_LOCATION) || !py.truthy(this.case_solved) || !py.truthy(this.caught_thief))) {
      animations.wait(this.stage, 500, py.bind(this, "restart_game"));
    } else {
      animations.wait(this.stage, 500, py.bind(this, "show_score"));
    }
    return null;
  }
  hide_layers(): any {
    let layer: any;
    for (layer of py.iter(this.stage.layers)) {
      animations.blind_layer(layer, animations.BlindDirection.HIDE_DOWN, null);
    }
    return null;
  }
  blind_next_callback(layer: any): any {
    this.stage.close_dialog(this.layer);
    if (py.eq(this.reason, EndReason.ARRIVED_WRONG_LOCATION)) {
      this.wrong_location_callback();
    } else {
      this.show_final_screen(false);
    }
    return null;
  }
  restart_game(): any {
    let datastore, initial_stage, startscreen: any;
    initial_stage = new startscreen.StartScreenStage(this.stage.game, true);
    this.stage.game.set_stage(initial_stage);
    datastore = this.stage.game.datastore;
    datastore.user_character_stage = null;
    datastore.save_character("nc", true);
    datastore.save_characters();
    return null;
  }
  show_score(): any {
    let background_image, title_image, title_white_image, x: any;
    this.showing_scores = true;
    this.skip_scores_animation = false;
    this.stage.render();
    this.score_back_layer = new Layer();
    this.score_layer = new Layer();
    this.score_font_20 = assets.load_font("turkey.ttf", 20);
    this.score_font_24 = assets.load_font("turkey.ttf", 24);
    this.score_font_29 = assets.load_font("turkey.ttf", 29);
    this.score_font_42 = assets.load_font("turkey.ttf", 42);
    this.handcuff_sound = assets.load_sound("p0_score_handcuffs.ogg");
    this.clock_sound = assets.load_sound("GUI_Clock.ogg");
    background_image = assets.load_image("p0_endgame_scores_background.jpg");
    this.background_item = new ItemImage(0, 0, background_image);
    py.m(this.score_layer, "add", this.background_item);
    title_image = assets.load_image("p0_endgame_scores_title.png");
    title_white_image = assets.load_image("p0_endgame_scores_title_white.png");
    x = 172;
    this.title = new ItemImage(x, 147, title_image);
    this.title_white = new ItemImage(x, 182, title_white_image);
    this.continue_normal = assets.load_image("p0_endings_btn_continue_normal.png");
    this.continue_rollover = assets.load_image("p0_endings_btn_continue_rollover.png");
    this.score_loop_sound = assets.load_sound("score_loop.ogg");
    this.score_end_sound = assets.load_sound("score_end.ogg");
    this.timer_big_hands = [assets.load_image("p0_timer_70_bighand_001.png"), assets.load_image("p0_timer_70_bighand_002.png"), assets.load_image("p0_timer_70_bighand_003.png"), assets.load_image("p0_timer_70_bighand_004.png"), assets.load_image("p0_timer_70_bighand_005.png"), assets.load_image("p0_timer_70_bighand_006.png"), assets.load_image("p0_timer_70_bighand_007.png"), assets.load_image("p0_timer_70_bighand_008.png")];
    this.timer_short_hands = [assets.load_image("p0_timer_70_shorthand_001.png"), assets.load_image("p0_timer_70_shorthand_002.png"), assets.load_image("p0_timer_70_shorthand_003.png"), assets.load_image("p0_timer_70_shorthand_004.png"), assets.load_image("p0_timer_70_shorthand_005.png"), assets.load_image("p0_timer_70_shorthand_006.png"), assets.load_image("p0_timer_70_shorthand_007.png"), assets.load_image("p0_timer_70_shorthand_008.png"), assets.load_image("p0_timer_70_shorthand_009.png"), assets.load_image("p0_timer_70_shorthand_010.png"), assets.load_image("p0_timer_70_shorthand_011.png"), assets.load_image("p0_timer_70_shorthand_012.png")];
    this.timer_handcenter = assets.load_image("p0_timer_70_handcenter.png");
    this.stage.show_dialog(this.score_back_layer, py.bind(this, "score_handle_event"), null);
    this.stage.add_layer(this.score_layer);
    this.stage.blind_dialog(this.score_back_layer, BlindDirection.SHOW_DOWN, false, [], py.bind(this, "blind_show_score_callback"));
    return null;
  }
  blind_show_score_callback(layer: any): any {
    let final_title_x, final_title_y: any;
    this.stage.render();
    this.right_sound.play();
    py.m(this.score_layer, "add", this.title_white);
    final_title_x = 147;
    final_title_y = 300;
    if (py.truthy(this.skip_scores_animation)) {
      this.title_white.set_left(final_title_x);
      this.title_white.set_top(final_title_y);
      this.move_score_title_callback(this.title_white);
    } else {
      animations.fade_in_item(this.title_white, 300);
      animations.start_move(this.title_white, this.title_white.get_left(), final_title_x, final_title_y, null, null, py.bind(this, "move_score_title_callback"));
    }
    return null;
  }
  move_score_title_callback(item: any): any {
    let case_, department_text, final_shadow_alpha, x, y: any;
    py.m(this.score_layer, "add", this.title);
    if (py.truthy(this.skip_scores_animation)) {
      py.m(this.score_layer, "remove", this.title_white);
    } else {
      animations.fade_in_item(this.title, 330);
      animations.fade_out_item(this.title_white, true, 330);
    }
    case_ = this.stage.game.datastore.user_character_progress.case;
    this.department_name = case_.crime_location.department.name;
    department_text = py.add(py.add("-", text.to_upper(this.department_name)), "-");
    x = 171;
    y = 195;
    this.department = new ItemText(x, y, this.score_font_20, 0, department_text, [255, 212, 12], null, 259, 30, 2, 1);
    this.department_shadow = new ItemText((x - 2), py.add(y, 3), this.score_font_20, 0, department_text, [0, 0, 0], null, 259, 30, 2, 1);
    py.m(this.score_layer, "add", this.department_shadow);
    py.m(this.score_layer, "add", this.department);
    final_shadow_alpha = 80;
    if (py.truthy(this.skip_scores_animation)) {
      this.department_shadow.set_alpha(final_shadow_alpha);
      this.show_title_callback(this.department_shadow);
    } else {
      animations.fade_in_item(this.department, 330, null);
      animations.fade_in_item(this.department_shadow, 330, py.bind(this, "show_title_callback"), final_shadow_alpha);
    }
    return null;
  }
  show_title_callback(item: any): any {
    if (py.truthy(this.skip_scores_animation)) {
      this.wait_show_title_callback();
    } else {
      animations.wait(this.stage, 1500, py.bind(this, "wait_show_title_callback"));
    }
    return null;
  }
  wait_show_title_callback(): any {
    let accel, department_final_x, department_final_y, department_shadow_final_x, department_shadow_final_y, title_final_y, x: any;
    accel = [0.5, 0.5, 1];
    x = this.title.get_left();
    this.score_item = 1;
    this.clues_found_icons = 0;
    this.score_scene = 1;
    title_final_y = 33;
    department_final_x = 171;
    department_final_y = 81;
    department_shadow_final_x = (department_final_x - 2);
    department_shadow_final_y = py.add(department_final_y, 3);
    if (py.truthy(this.skip_scores_animation)) {
      this.title.set_top(title_final_y);
      this.department.set_lefttop(department_final_x, department_final_y);
      this.department_shadow.set_lefttop(department_final_x, department_final_y);
      this.add_score_item(this.department_shadow);
    } else {
      animations.start_move(this.title, x, title_final_y, 400, accel, null);
      animations.start_move(this.department, department_final_x, department_final_y, 400, accel, null);
      animations.start_move(this.department_shadow, department_shadow_final_x, department_shadow_final_y, 400, accel, null, py.bind(this, "add_score_item"));
    }
    return null;
  }
  add_score_item(item: any = null): any {
    let item_image, x, y: any;
    if ((this.score_item === 1)) {
      item_image = assets.load_image("p0_endgame_scores_s1_optArrested.png");
      x = 73;
      y = 133;
    } else if ((this.score_item === 2)) {
      item_image = assets.load_image("p0_endgame_scores_s1_optClues.png");
      x = 73;
      y = 168;
    } else if ((this.score_item === 3)) {
      item_image = assets.load_image("p0_endgame_scores_s1_optTime.png");
      x = 75;
      y = 204;
    } else if ((this.score_item === 4)) {
      item_image = assets.load_image("p0_endgame_scores_s1_optTotal.png");
      x = 134;
      y = 255;
    }
    item = new ItemImage(x, y, item_image);
    py.m(this.score_layer, "add", item);
    if (py.truthy(this.skip_scores_animation)) {
      this.add_item_icon(item);
    } else {
      animations.fade_in_item(item, 270, py.bind(this, "add_item_icon"));
    }
    return null;
  }
  add_item_icon(item: any = null): any {
    let clue_item, dot_x, dot_y, dy, font, height, icon_image, short_hand_image, timer_handcenter, x: any;
    if ((this.score_item === 1)) {
      icon_image = assets.load_image("p0_endgame_scores_s1_iconArrested.png");
      item = new ItemImage(279, 126, icon_image);
      py.m(this.score_layer, "add", item);
      if (!py.truthy(this.skip_scores_animation)) {
        this.stage.render();
        this.handcuff_sound.play();
      }
      this.dots = 26;
      dot_y = 134;
    } else if ((this.score_item === 2)) {
      if ((this.clues_found_icons === 0)) {
        this.icon_image = assets.load_image("p0_endgame_scores_s1_iconClues.png");
        this.clue_sound = assets.load_sound("p0_score_clue.ogg");
      }
      x = py.add(269, py.mul(this.clues_found_icons, 23));
      clue_item = new ItemImage(x, 162, this.icon_image);
      py.m(this.score_layer, "add", clue_item);
      this.clues_found_icons = this.clues_found_icons + 1;
      if (!py.truthy(this.skip_scores_animation)) {
        this.stage.render();
        this.clue_sound.play();
      }
      if ((this.clues_found >= 3)) {
        this.dots = (20 - py.int(((this.clues_found - 3) * 4.5)));
      } else {
        this.dots = 26;
      }
      dot_y = 168;
    } else if ((this.score_item === 3)) {
      icon_image = assets.load_image("p0_timer_70_backclock.png");
      item = new ItemImage(283, 199, icon_image);
      py.m(this.score_layer, "add", item);
      if (!py.truthy(this.skip_scores_animation)) {
        this.stage.render();
        this.clock_sound.play();
      }
      this.timer_days = this.stage.timer_days;
      this.timer_hour = this.stage.timer_hour;
      this.timer_minute_pos = this.stage.timer_minute_pos;
      this.timer_big_hand = new ItemImage(289, 207, py.getitem(this.timer_big_hands, this.timer_minute_pos));
      py.m(this.score_layer, "add", this.timer_big_hand);
      short_hand_image = this.stage.get_short_hand_image(this.timer_hour, this.timer_minute_pos, this.timer_short_hands);
      this.timer_short_hand = new ItemImage(289, 208, short_hand_image);
      py.m(this.score_layer, "add", this.timer_short_hand);
      timer_handcenter = new ItemImage(297, 216, this.timer_handcenter);
      py.m(this.score_layer, "add", timer_handcenter);
      this.dots = 26;
      dot_y = 204;
    } else if ((this.score_item === 4)) {
      this.dots = 34;
      dot_y = 253;
    }
    if (((this.score_item === 2) && (this.clues_found_icons < this.clues_found))) {
      if (py.truthy(this.skip_scores_animation)) {
        this.add_item_icon();
      } else {
        animations.wait(this.stage, 200, py.bind(this, "add_item_icon"));
      }
    } else {
      if ((this.score_item <= 3)) {
        dot_x = (456 - py.getitem(this.score_font_24.size(py.mul(".", this.dots)), 0));
        font = this.score_font_24;
        height = 40;
      } else {
        dot_x = 203;
        font = this.score_font_29;
        height = 50;
      }
      this.dotted_line = new ItemText(dot_x, dot_y, font, 0, "", [244, 208, 11], null, 188, height, 1, 1);
      if ((this.score_item <= 3)) {
        dy = 2;
      } else {
        dy = 3;
      }
      this.dotted_line_shadow = new ItemText((dot_x - 1), py.add(dot_y, dy), font, 0, "", [0, 0, 0], null, 188, height, 1, 1);
      py.m(this.score_layer, "add", this.dotted_line_shadow);
      py.m(this.score_layer, "add", this.dotted_line);
      if ((this.score_item <= 3)) {
        this.dotted_line_shadow.set_alpha(140);
      }
      if (py.truthy(this.skip_scores_animation)) {
        this.add_next_dot();
      } else {
        animations.wait(this.stage, 200, py.bind(this, "add_next_dot"));
      }
    }
    return null;
  }
  add_next_dot(): any {
    let text: any;
    if ((this.dots === 1)) {
      text = py.add(this.dotted_line.get_text(), ".");
      this.dots = this.dots - 1;
    } else {
      text = py.add(this.dotted_line.get_text(), "..");
      this.dots = this.dots - 2;
    }
    this.dotted_line.set_text(text);
    this.dotted_line_shadow.set_text(text);
    if ((this.dots > 0)) {
      if (py.truthy(this.skip_scores_animation)) {
        this.add_next_dot();
      } else {
        animations.wait(this.stage, 15, py.bind(this, "add_next_dot"));
      }
    } else if (py.truthy(this.skip_scores_animation)) {
      this.add_item_score();
    } else {
      animations.wait(this.stage, 30, py.bind(this, "add_item_score"));
    }
    return null;
  }
  add_item_score(item: any = null): any {
    let character_progress, color, delay_between_update, final_value, font, height, increments, loop_length, score_item, score_item_shadow, score_time, sound_loops, time_limit, timer_delay, width, x, y: any;
    this.score_text_value = 0;
    if ((this.score_item === 1)) {
      x = 442;
      y = 132;
      final_value = py.getitem(this.scores, 0);
    } else if ((this.score_item === 2)) {
      x = 442;
      y = 166;
      final_value = py.getitem(this.scores, 1);
    } else if ((this.score_item === 3)) {
      x = 442;
      y = 202;
      final_value = py.getitem(this.scores, 2);
      character_progress = this.stage.game.datastore.user_character_progress;
      time_limit = character_progress.case.get_time_limit();
      this.timer_steps = ((py.add(py.mul(py.getitem(time_limit, 0), 12), py.getitem(time_limit, 1)) - py.add(py.mul(this.stage.timer_days, 12), this.stage.timer_hour)) * py.len(this.timer_big_hands));
    } else if ((this.score_item === 4)) {
      x = 380;
      y = 252;
      final_value = this.total_score;
    } else {
      x = 321;
      y = 322;
      character_progress = this.stage.game.datastore.user_character_progress;
      final_value = character_progress.score;
    }
    if ((this.score_item <= 3)) {
      font = this.score_font_24;
      color = [255, 144, 0];
      width = 80;
      height = 40;
    } else if ((this.score_item === 4)) {
      font = this.score_font_29;
      color = [255, 144, 0];
      width = 90;
      height = 40;
    } else {
      font = this.score_font_42;
      color = [255, 212, 12];
      width = 170;
      height = 60;
    }
    score_item = new ItemText(x, y, font, 0, "0", color, null, width, height, 3, 1);
    score_item_shadow = new ItemText((x - 2), py.add(y, 3), font, 0, "0", [0, 0, 0], null, width, height, 3, 1);
    py.m(this.score_layer, "add", score_item_shadow);
    py.m(this.score_layer, "add", score_item);
    if ((this.score_item === 5)) {
      this.total_score_item = score_item;
      this.total_score_item_shadow = score_item_shadow;
    }
    this.score_increment = minigame.calculate_score_increment(py.mul(minigame.SCORE_INCREMENT, 10), final_value, py.getitem(this.scores, 0));
    if ((this.score_item === 3)) {
      if ((this.timer_steps !== 0)) {
        this.score_increment = py.min(this.score_increment, py.int(py.fdiv(final_value, py.mul(this.timer_steps, 0.7))));
      }
    }
    if ((this.score_increment === 0)) {
      increments = 0;
    } else {
      increments = py.div(final_value, this.score_increment);
    }
    score_time = py.int(py.mul(increments, minigame.SCORE_DELAY));
    loop_length = py.mul(this.score_loop_sound.get_length(), 1000);
    sound_loops = py.int(py.div(py.add(score_time, minigame.SCORE_END_SOUND_DELAY), loop_length));
    if (((increments === 0) || py.truthy(this.skip_scores_animation))) {
      delay_between_update = 0;
    } else {
      delay_between_update = py.max(0, py.div((py.mul(sound_loops, loop_length) - minigame.SCORE_END_SOUND_DELAY), increments));
    }
    if (!py.truthy(this.skip_scores_animation)) {
      this.stage.render();
    }
    this.stage.start_timer("endgame_item_score", delay_between_update, py.bind(this, "update_score"), [score_item, score_item_shadow, final_value], false, false);
    if ((this.score_item === 3)) {
      if ((this.timer_steps !== 0)) {
        if (py.truthy(this.skip_scores_animation)) {
          timer_delay = 0;
        } else {
          timer_delay = py.fdiv(py.float(score_time), this.timer_steps);
        }
        this.stage.start_timer("engame_score_timer", timer_delay, py.bind(this, "update_timer"));
      }
    }
    this.score_channel = pygame.mixer.find_channel();
    this.score_channel.set_volume(assets.SOUND_VOLUME);
    if (!py.truthy(this.skip_scores_animation)) {
      if ((sound_loops > 0)) {
        this.score_channel.play(py.bind(this.score_loop_sound, "sound"), (-1));
      }
    }
    return null;
  }
  update_score(key: any, data: any): any {
    let delay, final_value: any;
    final_value = py.getitem(data, 2);
    if ((final_value >= 0)) {
      this.score_text_value = py.add(this.score_text_value, this.score_increment);
      if ((this.score_text_value > final_value)) {
        this.score_text_value = final_value;
      }
    } else {
      this.score_text_value = this.score_text_value - this.score_increment;
      if ((this.score_text_value < final_value)) {
        this.score_text_value = final_value;
      }
    }
    if (py.truthy(this.skip_scores_animation)) {
      this.score_text_value = final_value;
    }
    py.getitem(data, 0).set_text(text.format_number(this.score_text_value));
    py.getitem(data, 1).set_text(text.format_number(this.score_text_value));
    if (py.eq(this.score_text_value, final_value)) {
      this.stage.stop_timer(key);
      delay = 200;
      if (py.truthy(this.skip_scores_animation)) {
        delay = 0;
      }
      if ((this.score_item < 4)) {
        this.score_item = this.score_item + 1;
        animations.wait(this.stage, delay, py.bind(this, "add_score_item"));
      } else if ((this.score_item === 4)) {
        this.score_item = this.score_item + 1;
        animations.wait(this.stage, delay, py.bind(this, "add_total_item"));
      } else {
        animations.wait(this.stage, delay, py.bind(this, "add_score_continue"));
      }
      if ((this.score_channel != null)) {
        if (!py.truthy(this.skip_scores_animation)) {
          this.stage.render();
          this.score_channel.play(py.bind(this.score_end_sound, "sound"));
        } else {
          this.score_channel.stop();
        }
      }
    }
    return null;
  }
  update_timer(key: any, data: any): any {
    let timer_updated: any;
    timer_updated = false;
    while (!py.truthy(timer_updated)) {
      this.timer_minute_pos = this.timer_minute_pos + 1;
      if ((this.timer_minute_pos >= py.len(this.timer_big_hands))) {
        this.timer_minute_pos = 0;
        this.timer_hour = this.timer_hour + 1;
        if ((this.timer_hour >= 24)) {
          this.timer_hour = 0;
        }
      }
      this.timer_big_hand.set_image(py.getitem(this.timer_big_hands, this.timer_minute_pos));
      this.timer_short_hand.set_image(this.stage.get_short_hand_image(this.timer_hour, this.timer_minute_pos, this.timer_short_hands));
      this.timer_steps = this.timer_steps - 1;
      if ((this.timer_steps <= 0)) {
        this.timer_steps = 0;
      }
      if (py.truthy(this.skip_scores_animation)) {
        if ((this.timer_steps === 0)) {
          timer_updated = true;
        }
      } else {
        timer_updated = true;
      }
    }
    if ((this.timer_steps === 0)) {
      this.stage.stop_timer(key);
    }
    return null;
  }
  add_total_item(): any {
    let total_image, total_item: any;
    total_image = assets.load_image("p0_endgame_scores_totalscores.png");
    total_item = new ItemImage(101, 324, total_image);
    py.m(this.score_layer, "add", total_item);
    this.total_score_label = total_item;
    if (py.truthy(this.skip_scores_animation)) {
      this.add_item_score(total_item);
    } else {
      animations.fade_in_item(total_item, 340, py.bind(this, "add_item_score"));
    }
    return null;
  }
  add_score_continue(): any {
    this.next = new ItemImage(224, 399, this.continue_normal);
    this.next.set_rollover_image(this.continue_rollover, this.rollover_sound);
    this.next.add_event_handler(ItemEvent.CLICK, py.bind(this, "score_continue_click"));
    py.m(this.score_layer, "add", this.next);
    this.score_continue_visible = true;
    if (py.truthy(this.skip_scores_animation)) {
      this.stage.render();
      this.score_end_sound.play();
      this.skip_scores_animation = false;
    }
    return null;
  }
  score_continue_click(item: any, args: any): any {
    this.stage.render();
    this.continue_sound.play();
    this.score_continue();
    return null;
  }
  score_continue(): any {
    let item, next_scene, score_back_items: any;
    this.showing_scores = false;
    if ((this.score_scene === 1)) {
      next_scene = 2;
    } else if ((this.score_scene === 2)) {
      if (py.truthy(this.won_uy_medal)) {
        next_scene = 3;
      } else if (py.truthy(this.promoted)) {
        next_scene = 4;
      } else {
        next_scene = null;
      }
    } else if ((this.score_scene === 3)) {
      if (py.truthy(this.promoted)) {
        next_scene = 4;
      } else {
        next_scene = null;
      }
    } else {
      next_scene = null;
    }
    this.score_continue_visible = false;
    if ((next_scene == null)) {
      this.hide_layers();
      animations.wait(this.stage, 500, py.bind(this, "restart_game"));
    } else {
      if ((this.score_scene === 1)) {
        score_back_items = [this.background_item, this.title, this.department_shadow, this.department, this.total_score_item_shadow, this.total_score_item, this.total_score_label];
        for (item of py.iter(score_back_items)) {
          py.m(this.score_layer, "remove", item);
          py.m(this.score_back_layer, "add", item);
        }
      }
      this.next_scene = next_scene;
      animations.blind_layer(this.score_layer, animations.BlindDirection.HIDE_DOWN, null, 600, py.bind(this, "blind_next_scene_callback"));
    }
    return null;
  }
  blind_next_scene_callback(layer: any): any {
    let item: any;
    for (item of py.iter(this.score_back_layer.items)) {
      item.set_visible(true);
    }
    this.score_layer.empty();
    this.score_layer.set_clip(null);
    this.score_scene = this.next_scene;
    if ((this.score_scene === 2)) {
      animations.wait_locked(this.stage, 100, py.bind(this, "show_medal_won"));
    } else if ((this.score_scene === 3)) {
      animations.wait_locked(this.stage, 100, py.bind(this, "show_medal_uy_won"));
    } else if ((this.score_scene === 4)) {
      animations.wait_locked(this.stage, 100, py.bind(this, "show_promotion"));
    }
    return null;
  }
  show_medal_won(): any {
    let base_image, base_item, medal_data, ribbon, ribbon_image, ribbon_item, tab_image, tab_item, text: any;
    this.stage.render();
    medal_data = py.getitem(merits.MEDALS_DATA, this.medal_name);
    ribbon = py.getitem(medal_data, 3);
    if ((ribbon == null)) {
      ribbon_image = assets.load_image(py.add(py.add("p0_merits_medals_big_ribbon_", this.medal_name), ".png"));
    } else {
      ribbon_image = assets.load_image(py.add(py.add("p0_merits_medals_big_ribbon_", py.str(ribbon)), ".png"));
    }
    ribbon_item = new ItemImage(157, 109, ribbon_image);
    py.m(this.score_layer, "add", ribbon_item);
    base_image = assets.load_image("p0_merits_medals_big_genericbase.png");
    base_item = new ItemImage(154, 211, base_image);
    py.m(this.score_layer, "add", base_item);
    tab_image = assets.load_image(py.add(py.add("p0_merits_medals_tab_", this.medal_name), ".jpg"));
    tab_item = new ItemImage(176, 223, tab_image);
    py.m(this.score_layer, "add", tab_item);
    text = new ItemText(295, 142, this.font_13_bold, 15, "En reconocimiento a tu\ndesempe\xf1o en este caso,\nla intendencia de", [255, 255, 255], null, 215, 63, 1, 1);
    py.m(this.score_layer, "add", text);
    text = new ItemText(295, 199, this.font_16, 15, this.department_name, [255, 212, 12], null, 215, 24, 1, 1);
    py.m(this.score_layer, "add", text);
    text = new ItemText(295, 231, this.font_13_bold, 15, "\xa1ha decidido condecorarte\ncon una medalla!", [255, 255, 255], null, 225, 53, 1, 1);
    py.m(this.score_layer, "add", text);
    this.stage.set_music_volume(0.2, 300);
    animations.wait(this.stage, 200, py.bind(this, "play_medal_sound"));
    return null;
  }
  play_medal_sound(): any {
    this.stage.render();
    this.medal_sound.play();
    animations.wait(this.stage, py.mul(this.medal_sound.get_length(), 1000), py.bind(this, "play_achievement_sound_callback"));
    return null;
  }
  play_promotion_sound(): any {
    this.stage.render();
    this.promotion_sound.play();
    animations.wait(this.stage, py.mul(this.medal_sound.get_length(), 1000), py.bind(this, "play_achievement_sound_callback"));
    return null;
  }
  play_achievement_sound_callback(): any {
    this.stage.set_music_volume(1, 300);
    this.add_score_continue();
    return null;
  }
  show_medal_tut_won(item: any = null): any {
    let begin_highlight, end_highlight, medal_image, medal_item, message, text: any;
    this.stage.render();
    medal_image = assets.load_image("p0_merits_medals_big_tut.png");
    medal_item = new ItemImage(122, 95, medal_image);
    py.m(this.score_layer, "add", medal_item);
    begin_highlight = "&#c255,212,12!";
    end_highlight = "&#c!";
    message = py.add(py.add(py.add(py.add(py.add(py.add(py.add(py.add(py.add(py.add(py.add("Por haber completado\n", "satisfactoriamente tu\n"), "entrenamiento y haber\n"), "demostrado que eres\n"), "apto para combatir a la\n"), begin_highlight), "organizaci\xf3n criminal CULT"), end_highlight), ",\n"), "la Divisi\xf3n Especial de\n"), "Detectives te hace entrega\n"), "de esta medalla.");
    text = new ItemText(293, 127, this.font_13_bold, 15, message, [255, 255, 255], null, 291, 144, 1, 1);
    py.m(this.score_layer, "add", text);
    this.stage.set_music_volume(0.2, 300);
    animations.wait(this.stage, 200, py.bind(this, "play_medal_sound"));
    return null;
  }
  show_medal_uy_won(item: any = null): any {
    let additional_fonts, begin_bold, end_bold, medal_image, medal_item, message, text, title_uy, title_uy_image: any;
    this.stage.render();
    title_uy_image = assets.load_image("p0_endgame_scores_title_uy.png");
    title_uy = new ItemImage(155, 26, title_uy_image);
    py.m(this.score_layer, "add", title_uy);
    this.title.set_visible(false);
    this.department.set_visible(false);
    this.department_shadow.set_visible(false);
    this.total_score_item_shadow.set_visible(false);
    this.total_score_item.set_visible(false);
    this.total_score_label.set_visible(false);
    medal_image = assets.load_image("p0_merits_medals_big_uy.png");
    medal_item = new ItemImage(212, 158, medal_image);
    py.m(this.score_layer, "add", medal_item);
    begin_bold = "&#f:bold!";
    end_bold = "&#f!";
    message = py.add(py.add(py.add(py.add(py.add(py.add(py.add(py.add(py.add(py.add(py.add(py.add(py.add(py.add(py.add(py.add("En reconocimiento a tu ", begin_bold), "continuo esfuerzo"), end_bold), " a la hora de\n"), "combatir a la "), begin_bold), "organizaci\xf3n criminal CULT"), end_bold), ", y por haber\n"), "resuelto al menos un caso en "), begin_bold), "cada departamento"), end_bold), " del pa\xeds,\n"), "las autoridades de la naci\xf3n han decidido\n"), "condecorarte con esta medalla.");
    additional_fonts = py.mkdict([["bold", [this.font_13_bold, 15, (-2)]]]);
    text = new ItemText(85, 90, this.font_13, 15, message, [255, 255, 255], null, 430, 115, 2, 1, additional_fonts);
    py.m(this.score_layer, "add", text);
    this.stage.set_music_volume(0.2, 300);
    animations.wait(this.stage, 200, py.bind(this, "play_medal_sound"));
    return null;
  }
  show_promotion(): any {
    let additional_fonts, begin_highlight, begin_large, character, character_name, character_progress, congratulations, congratulations_image, end_highlight, end_large, last_digit, message, message_item, name, name_shadow, range, range_name, range_shadow, resolved_cases, suffix, turkey_30: any;
    this.stage.render();
    character = this.stage.game.datastore.user_character;
    character_progress = this.stage.game.datastore.user_character_progress;
    resolved_cases = character_progress.resolved_cases;
    if (((resolved_cases === 11) || (resolved_cases === 12))) {
      suffix = "mo";
    } else {
      last_digit = py.mod(resolved_cases, 10);
      if ((last_digit === 0)) {
        suffix = "mo";
      } else if ((last_digit === 1)) {
        suffix = "er";
      } else if ((last_digit === 2)) {
        suffix = "do";
      } else if ((last_digit === 3)) {
        suffix = "er";
      } else if ((last_digit <= 6)) {
        suffix = "to";
      } else if ((last_digit === 7)) {
        suffix = "mo";
      } else if ((last_digit === 8)) {
        suffix = "vo";
      } else if ((last_digit >= 9)) {
        suffix = "no";
      }
    }
    begin_highlight = "&#c255,212,12!";
    end_highlight = "&#c!";
    begin_large = "&#f:large!";
    end_large = "&#f!";
    message = py.add(py.add(py.add(py.add(py.add(py.add(py.add(py.add(py.add(py.add(py.add(py.add(py.add(py.add("Por haber resuelto con \xe9xito tu ", begin_highlight), begin_large), py.str(character_progress.resolved_cases)), suffix), end_large), end_highlight), " caso, y haber\n"), "demostrado grandes habilidades a la hora de combatir a\n"), "la malvada organizaci\xf3n "), begin_highlight), "CULT"), end_highlight), ", la Divisi\xf3n Especial de \n"), "Detectives ha decidido otorgarte un ascenso.");
    additional_fonts = py.mkdict([["large", [this.font_16, 15, (-1)]]]);
    message_item = new ItemText(44, 114, this.font_13_bold, 15, message, [255, 255, 255], null, 511, 73, 2, 1, additional_fonts);
    py.m(this.score_layer, "add", message_item);
    congratulations_image = assets.load_image("p0_endgame_scores_s3_congratulations.png");
    congratulations = new ItemImage(240, 196, congratulations_image);
    py.m(this.score_layer, "add", congratulations);
    turkey_30 = assets.load_font("turkey.ttf", 30);
    range_name = text.to_upper(datamodel.get_range_name(character_progress.range.level));
    range_shadow = new ItemText(41, 224, turkey_30, 0, range_name, [0, 0, 0], null, 514, 50, 2, 1);
    py.m(this.score_layer, "add", range_shadow);
    range = new ItemText(43, 221, turkey_30, 0, range_name, [255, 212, 12], null, 514, 50, 2, 1);
    py.m(this.score_layer, "add", range);
    character_name = text.to_upper(character.charinfo.name);
    name_shadow = new ItemText(21, 254, turkey_30, 29, character_name, [0, 0, 0], null, 554, 90, 2, 1);
    py.m(this.score_layer, "add", name_shadow);
    name = new ItemText(23, 251, turkey_30, 29, character_name, [255, 212, 12], null, 554, 90, 2, 1);
    py.m(this.score_layer, "add", name);
    this.stage.set_music_volume(0.2, 300);
    animations.wait(this.stage, 200, py.bind(this, "play_promotion_sound"));
    return null;
  }
  case_is_solved(): any {
    let case_: any;
    case_ = this.stage.game.datastore.user_character_progress.case;
    if (py.truthy(case_.arrest_order_thief)) {
      if (py.eq(case_.thief, case_.arrest_order_thief)) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
    return null;
  }
}
