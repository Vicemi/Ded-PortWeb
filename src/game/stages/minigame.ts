// @ts-nocheck
// Generated from the original game code (see MODLOG.md). Do not edit by hand.
import * as py from '../../runtime/py';
import { ItemEvent } from '../../runtime/prelude';
import { ItemImage } from '../../runtime/prelude';
import { ItemText } from '../../runtime/prelude';
import { KEYDOWN } from '../../runtime/prelude';
import { K_ESCAPE } from '../../runtime/prelude';
import { K_z } from '../../runtime/prelude';
import { Layer } from '../../runtime/prelude';
import * as animations from '../../engine/animations';
import * as assets from '../../engine/assets';
import { pygame as $pg } from '../../runtime/prelude'; const delay = (ms: number) => $pg.time.delay(ms);
const minigamebricklayer: any = py.lazy("game/stages/minigamebricklayer");
import { pygame } from '../../runtime/prelude';
import { random } from '../../runtime/py';
import * as text from '../../engine/textutil';
import * as $self from './minigame';

export let WRONG_PLACE_DIALOG: any = 0;
export let OPENING_DIALOG: any = 1;
export let WITNESS_REQUEST: any = 2;
export let WITNESS_MINIGAME: any = 3;
export let WITNESS_GOODBYE: any = 4;
export let WITNESS_THANKS: any = 5;
export let WITNESS_AID: any = 6;
export let WITNESS_AID_2: any = 7;
export let WITNESS_HELP: any = 8;
export let SCORE_DIALOG: any = 9;
export let SCORE_INCREMENT: any = 6;
export let SCORE_DELAY: any = 35;
export let SCORE_END_SOUND_DELAY: any = 0;
export class Minigame {
  constructor(stage: any, phase1content: any, witness: any, play_statcode: any, solved_statcode: any, not_solved_statcode: any, score_category: any) {
    this.stage = stage;
    this.phase1content = phase1content;
    this.witness = witness;
    this.play_statcode = play_statcode;
    this.solved_statcode = solved_statcode;
    this.not_solved_statcode = not_solved_statcode;
    this.score_category = score_category;
    this.layer = new Layer();
    this.score_layer = new Layer();
    this.character_layer = new Layer();
    this.witness_layer = new Layer();
    this.help_layer = new Layer();
    this.help_previous_layer = new Layer();
    this.help_current_layer = new Layer();
    this.active_dialog = null;
    this.next = "";
    this.playing_minigame_music = false;
    this.start_stage_music = false;
    this.help_stage = 1;
    this.max_help_stages = 3;
    this.witness_opening_box_image = assets.load_image("p1_minigame_flux_dialogue1.png");
    this.witness_titler = assets.load_image("p1_minigame_flux_titler.png");
    this.font_24 = assets.load_font("powdrft_.ttf", 24);
    this.font_18 = assets.load_font("evilgeniusbb_bld.ttf", 18);
    this.font_13 = assets.load_font("evilgeniusbb_reg.ttf", 13);
    this.font_13_bld = assets.load_font("evilgeniusbb_bld.ttf", 13);
    this.font_12 = assets.load_font("evilgeniusbb_reg.ttf", 12);
    this.font_12_bld = assets.load_font("evilgeniusbb_bld.ttf", 12);
    this.font_14_bld = assets.load_font("evilgeniusbb_bld.ttf", 14);
    this.font_14 = assets.load_font("evilgeniusbb_reg.ttf", 14);
    this.option_hover_image = assets.load_image("p1_minigame_opening_flux_optionselector.gif");
    this.avatar_box_image = assets.load_image("p1_minigame_opening_flux_avatarboxdialogue.png");
    this.previous_image = assets.load_image("p0_button_previous_active.png");
    this.previous_rollover_image = assets.load_image("p0_button_previous_rollover.png");
    this.next_image = assets.load_image("p0_button_next_active.png");
    this.next_rollover_image = assets.load_image("p0_button_next_rollover.png");
    this.rollover_sound = this.stage.rollover_sound;
    this.continue_sound = this.stage.click_sound;
    this.help_sound = assets.load_sound("p0_help.ogg");
    return;
  }
  show_witness_minigame(): any {
    let ignore_layers: any;
    this.layer.empty();
    this.active_dialog = WITNESS_MINIGAME;
    this.stage.prepare_dialog(this.character_layer);
    this.set_up_witness();
    this.stage.show_dialog(this.layer, py.bind(this, "minigame_dialog_handle_event"));
    this.stage.add_layer(this.character_layer);
    this.stage.add_layer(this.witness_layer);
    this.set_up_minigame();
    ignore_layers = [this.character_layer, this.witness_layer];
    this.stage.set_music_volume(0, 600);
    this.stage.blind_dialog(this.layer, animations.BlindDirection.SHOW_DOWN, false, ignore_layers, py.bind(this, "blind_show_minigame_callback"));
    return null;
  }
  show_opening_dialog(): any {
    let ignore_layers: any;
    this.active_dialog = OPENING_DIALOG;
    this.playing_minigame_music = false;
    this.start_stage_music = false;
    this.stop_stage_music();
    this.stage.prepare_dialog(this.character_layer, false, true);
    this.stage.show_dialog(this.layer, py.bind(this, "handle_event"));
    this.stage.add_layer(this.character_layer);
    ignore_layers = [this.character_layer];
    this.stage.blind_dialog(this.layer, animations.BlindDirection.SHOW_DOWN, true, ignore_layers, py.bind(this, "blind_show_opening_callback"));
    return null;
  }
  escape_key_event(): any {
    return false;
  }
  handle_event(e: any): any {
    let mod: any;
    if (py.eq(e.type, KEYDOWN)) {
      if (py.eq(e.key, pygame.K_ESCAPE)) {
        this.stage.render();
        this.stage.click_sound.play();
        if (py.eq(this.active_dialog, OPENING_DIALOG)) {
          this.close_minigame();
          return true;
        }
        this.show_next();
        return true;
      }
      mod = this.get_common_modifiers(e.mod);
      if ((py.eq(mod, pygame.KMOD_LSHIFT) && py.eq(e.key, K_z) && py.truthy(this.stage.game.get_development_mode()))) {
        this.stage.remove_layer(this.witness_layer);
        this.show_happy_character();
        this.stage.close_dialog(this.layer);
        this.active_dialog = WITNESS_AID;
        this.show_witness_dialog(true);
      }
    }
    return null;
  }
  minigame_dialog_handle_event(e: any): any {
    if (py.eq(e.type, KEYDOWN)) {
      if ((py.eq(e.key, pygame.K_ESCAPE) && !py.truthy(this.escape_key_event()))) {
        this.stage.render();
        this.stage.click_sound.play();
        if (py.eq(this.active_dialog, WITNESS_MINIGAME)) {
          this.phase1content.minigame_solved(false);
          this.close_minigame();
        } else {
          this.show_next();
        }
        return true;
      }
    }
    return this.minigame_handle_event(e);
  }
  minigame_handle_event(e: any): any {
    return null;
  }
  blind_show_opening_callback(layer: any): any {
    let layers: any;
    this.set_up_question_dialog();
    this.stage.add_layer(this.witness_layer);
    layers = [this.character_layer];
    this.stage.blind_dialog(this.layer, animations.BlindDirection.SHOW_DOWN, false, layers);
    return null;
  }
  set_up_question_dialog(): any {
    this.set_up_witness_message_box(true);
    this.set_up_witness();
    this.set_up_avatar_box();
    return null;
  }
  set_up_score(): any {
    let bottombar_image, bottombar_item, character_progress, datastore, i, topbar_image, topbar_item: any;
    this.scores = this.calculate_solved_score();
    this.total = 0;
    for (i of py.range(py.len(this.scores))) {
      py.setitem(this.scores, i, py.min(9999, py.max((-9999), py.int(py.getitem(this.scores, i)))));
      this.total = py.add(this.total, py.getitem(this.scores, i));
    }
    if ((this.total < 0)) {
      this.total = 0;
    }
    datastore = this.stage.game.datastore;
    character_progress = datastore.user_character_progress;
    character_progress.score = py.add(character_progress.score, this.total);
    datastore.add_score(this.score_category, datastore.user_character, this.total);
    datastore.add_score("total", datastore.user_character, character_progress.score);
    datastore.save_highscores();
    topbar_image = assets.load_image("p1_minigame_scores_topbar.png");
    topbar_item = new ItemImage(0, 69, topbar_image);
    py.m(this.score_layer, "add", topbar_item);
    bottombar_image = assets.load_image("p1_minigame_scores_bottombar.png");
    bottombar_item = new ItemImage(0, 330, bottombar_image);
    py.m(this.score_layer, "add", bottombar_item);
    this.score_font_24 = assets.load_font("turkey.ttf", 24);
    this.score_font_29 = assets.load_font("turkey.ttf", 29);
    this.score_loop_sound = assets.load_sound("score_loop.ogg");
    this.score_end_sound = assets.load_sound("score_end.ogg");
    return null;
  }
  add_score_item(item: any = null): any {
    let item_image, score_count: any;
    score_count = py.len(this.scores);
    if ((this.score_item === 1)) {
      item_image = assets.load_image("p1_minigame_scores_game.png");
      if ((score_count === 3)) {
        this.score_text_top = 142;
        this.score_value_top = 139;
      } else {
        this.score_text_top = 132;
        this.score_value_top = 129;
      }
    } else if ((this.score_item === 2)) {
      item_image = assets.load_image("p1_minigame_scores_bonus.png");
      if ((score_count === 3)) {
        this.score_text_top = 170;
        this.score_value_top = 171;
      } else {
        this.score_text_top = 159;
        this.score_value_top = 160;
      }
    } else if (((this.score_item === 3) && (score_count === 4))) {
      item_image = assets.load_image("p1_minigame_scores_usedletters.png");
      this.score_text_top = 194;
      this.score_value_top = 191;
    } else if (((this.score_item === 4) || (score_count === 3))) {
      item_image = assets.load_image("p1_minigame_scores_mistakes.png");
      if ((score_count === 3)) {
        this.score_text_top = 204;
        this.score_value_top = 203;
      } else {
        this.score_text_top = 223;
        this.score_value_top = 222;
      }
    }
    item = new ItemImage(120, this.score_text_top, item_image);
    py.m(this.score_layer, "add", item);
    if (py.truthy(this.skip_scores_animation)) {
      this.score_item_callback(item);
    } else {
      animations.fade_in_item(item, 600, py.bind(this, "score_item_callback"));
    }
    return null;
  }
  add_total_item(): any {
    let score_count, total_image, total_item: any;
    score_count = py.len(this.scores);
    if ((score_count === 3)) {
      this.score_text_top = 258;
      this.score_value_top = 254;
    } else {
      this.score_text_top = 268;
      this.score_value_top = 264;
    }
    total_image = assets.load_image("p1_minigame_scores_total.png");
    total_item = new ItemImage(120, this.score_text_top, total_image);
    py.m(this.score_layer, "add", total_item);
    if (py.truthy(this.skip_scores_animation)) {
      this.score_item_callback(total_item);
    } else {
      animations.fade_in_item(total_item, 600, py.bind(this, "score_item_callback"));
    }
    return null;
  }
  add_score_continue(): any {
    let continue_normal, continue_rollover: any;
    continue_normal = assets.load_image("p0_endings_btn_continue_normal.png");
    continue_rollover = assets.load_image("p0_endings_btn_continue_rollover.png");
    this.next = new ItemImage(219, 322, continue_normal);
    this.next.set_rollover_image(continue_rollover, this.rollover_sound);
    this.next.add_event_handler(ItemEvent.CLICK, py.bind(this, "option_click"));
    py.m(this.score_layer, "add", this.next);
    this.score_continue_visible = true;
    if (py.truthy(this.skip_scores_animation)) {
      this.stage.render();
      this.score_end_sound.play();
      this.skip_scores_animation = false;
    }
    return null;
  }
  score_item_callback(item: any): any {
    let delay_between_update, final_value, increments, loop_length, score_texts, score_time, sound_loops: any;
    if ((this.score_item <= py.len(this.scores))) {
      final_value = py.getitem(this.scores, (this.score_item - 1));
    } else {
      final_value = this.total;
    }
    this.score_increment = calculate_score_increment(SCORE_INCREMENT, final_value, py.getitem(this.scores, 0));
    increments = py.div(final_value, this.score_increment);
    score_time = py.int(py.mul(increments, SCORE_DELAY));
    loop_length = py.mul(this.score_loop_sound.get_length(), 1000);
    sound_loops = py.int(py.div(py.add(score_time, SCORE_END_SOUND_DELAY), loop_length));
    if (!py.truthy(this.skip_scores_animation)) {
      this.score_loop_sound.play((-1));
    }
    this.score_text_value = 0;
    if ((this.score_item <= py.len(this.scores))) {
      score_texts = this.add_text_with_shadow(this.score_layer, 391, this.score_value_top, this.score_font_24, text.format_number(this.score_text_value), [255, 103, 28], 51, 35, 3, 1, (-3), 4);
    } else {
      score_texts = this.add_text_with_shadow(this.score_layer, 381, this.score_value_top, this.score_font_29, text.format_number(this.score_text_value), [255, 144, 0], 67, 55, 3, 1, (-3), 4);
    }
    if (((increments === 0) || py.truthy(this.skip_scores_animation))) {
      delay_between_update = 0;
    } else {
      delay_between_update = py.max(0, py.div((py.mul(sound_loops, loop_length) - SCORE_END_SOUND_DELAY), increments));
    }
    this.stage.start_timer("minigame_item_score", delay_between_update, py.bind(this, "update_score"), score_texts, false, false);
    return null;
  }
  update_score(key: any, score_texts: any): any {
    let delay, final_value, item: any;
    if ((this.score_item <= py.len(this.scores))) {
      final_value = py.getitem(this.scores, (this.score_item - 1));
    } else {
      final_value = this.total;
    }
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
    for (item of py.iter(score_texts)) {
      item.set_text(text.format_number(this.score_text_value));
    }
    if (py.eq(this.score_text_value, final_value)) {
      this.stage.stop_timer(key);
      delay = 200;
      if (py.truthy(this.skip_scores_animation)) {
        delay = 0;
      }
      if ((this.score_item < py.len(this.scores))) {
        this.score_item = this.score_item + 1;
        animations.wait(this.stage, delay, py.bind(this, "add_score_item"));
      } else if (py.eq(this.score_item, py.len(this.scores))) {
        this.score_item = this.score_item + 1;
        animations.wait(this.stage, delay, py.bind(this, "add_total_item"));
      } else {
        animations.wait(this.stage, delay, py.bind(this, "add_score_continue"));
      }
      this.stage.render();
      this.score_loop_sound.stop();
      if (!py.truthy(this.skip_scores_animation)) {
        this.score_end_sound.play();
      }
    }
    return null;
  }
  add_text_with_shadow(layer: any, left: any, top: any, font: any, text: any, color: any, width: any, height: any, h_align: any, v_align: any, shadow_dx: any = (-1), shadow_dy: any = 2): any {
    let shadow_item, text_item: any;
    shadow_item = new ItemText(py.add(left, shadow_dx), py.add(top, shadow_dy), font, 0, text, [0, 0, 0], null, width, height, h_align, v_align);
    py.m(layer, "add", shadow_item);
    text_item = new ItemText(left, top, font, 0, text, color, null, width, height, h_align, v_align);
    py.m(layer, "add", text_item);
    return [text_item, shadow_item];
  }
  set_up_witness_message_box(opening_dialog: any): any {
    let image, text, title_text, titler, witness_box: any;
    if (py.truthy(opening_dialog)) {
      image = this.witness_opening_box_image;
    } else {
      image = this.witness_minigame_box_image;
    }
    witness_box = new ItemImage(56, 96, image, null);
    py.m(this.layer, "add", witness_box);
    titler = new ItemImage(136, 80, this.witness_titler);
    title_text = new ItemText(142, 87, this.font_24, 0, this.title, [157, 21, 21], null, 272, 30, 2, 2);
    py.m(this.layer, "add", titler);
    py.m(this.layer, "add", title_text);
    if (py.truthy(opening_dialog)) {
      text = this.question_intro;
      this.box_text = new ItemText(111, 134, this.font_13, 16, text, [0, 0, 0], null, 328, 68, 2, 2);
      py.m(this.layer, "add", this.box_text);
      text = this.question;
      this.box_text = new ItemText(111, 212, this.font_14_bld, 16, text, [0, 0, 0], null, 328, 20, 2);
      py.m(this.layer, "add", this.box_text);
    }
    return null;
  }
  set_up_witness(): any {
    py.m(this.witness_layer, "remove", this.witness_item);
    py.m(this.witness_layer, "add", this.witness_item);
    return null;
  }
  set_up_avatar_box(): any {
    let avatar_box: any;
    avatar_box = new ItemImage(183, 280, this.avatar_box_image);
    py.m(this.layer, "add", avatar_box);
    this.option_text_yes = new ItemText(211, 294, this.font_13_bld, 0, "SI", [79, 79, 79], null, this.option_hover_image.get_width(), this.option_hover_image.get_height(), 2, 2);
    this.option_text_no = new ItemText(211, 319, this.font_13_bld, 0, "NO", [79, 79, 79], null, this.option_hover_image.get_width(), this.option_hover_image.get_height(), 2, 2);
    this.option_text_yes.set_rollover(this.option_hover_image, this.rollover_sound, 0, 1);
    this.option_text_no.set_rollover(this.option_hover_image, this.rollover_sound, 0, 1);
    this.option_text_yes.set_rollover_color([132, 15, 15], null);
    this.option_text_no.set_rollover_color([132, 15, 15], null);
    this.option_text_yes.add_event_handler(ItemEvent.CLICK, py.bind(this, "option_click"));
    this.option_text_no.add_event_handler(ItemEvent.CLICK, py.bind(this, "option_click"));
    py.m(this.layer, "add", this.option_text_yes);
    py.m(this.layer, "add", this.option_text_no);
    return null;
  }
  option_click(item: any, args: any): any {
    this.stage.render();
    this.continue_sound.play();
    if (py.eq(item, this.next)) {
      this.show_next();
    } else if (py.eq(item, this.option_text_yes)) {
      this.stage.close_dialog(this.layer);
      this.active_dialog = WITNESS_REQUEST;
      this.show_witness_dialog(true);
    } else if (py.eq(item, this.option_text_no)) {
      this.close_minigame();
    }
    return null;
  }
  show_next(): any {
    if (py.eq(this.active_dialog, WITNESS_REQUEST)) {
      this.stage.close_dialog(this.layer);
      this.show_witness_minigame();
    } else if (py.eq(this.active_dialog, WITNESS_GOODBYE)) {
      this.phase1content.minigame_solved(false);
      this.close_minigame();
    } else if (py.eq(this.active_dialog, SCORE_DIALOG)) {
      if (py.truthy(this.score_continue_visible)) {
        this.stage.close_dialog(this.layer);
        this.active_dialog = WITNESS_THANKS;
        this.show_witness_dialog(true);
      } else {
        this.skip_scores_animation = true;
      }
    } else if (py.eq(this.active_dialog, WITNESS_THANKS)) {
      this.stage.close_dialog(this.layer);
      this.active_dialog = WITNESS_AID;
      this.show_witness_dialog(true);
    } else if (py.eq(this.active_dialog, WITNESS_AID)) {
      this.stage.close_dialog(this.layer);
      this.active_dialog = WITNESS_AID_2;
      this.show_witness_dialog(true);
    } else if (py.eq(this.active_dialog, WITNESS_AID_2)) {
      this.close_minigame(1);
    } else if (py.eq(this.active_dialog, WRONG_PLACE_DIALOG)) {
      this.close_minigame(2);
    }
    return null;
  }
  show_witness_dialog(transition: any = false, blind_witness: any = false): any {
    let additional_fonts, box_text3, ignore_layers, image, request_line_count, rollover_image, text2, text3, x: any;
    this.layer.empty();
    this.stage.prepare_dialog(this.character_layer, false, true);
    this.stage.show_dialog(this.layer, py.bind(this, "handle_event"));
    if ((py.len(this.score_layer.items) > 0)) {
      this.stage.add_layer(this.score_layer);
      animations.blind_layer(this.score_layer, animations.BlindDirection.HIDE_DOWN, null, 450, py.bind(this, "hide_score_callback"));
    }
    this.set_up_witness_message_box(false);
    this.set_up_witness();
    this.stage.add_layer(this.character_layer);
    this.stage.add_layer(this.witness_layer);
    text2 = "";
    if (py.eq(this.active_dialog, WITNESS_REQUEST)) {
      text2 = this.request_text;
      text3 = this.request_question_text;
      request_line_count = py.len(py.m(text3, "splitlines"));
      if ((request_line_count <= 1)) {
        box_text3 = new ItemText(86, 195, this.font_14_bld, 16, text3, [0, 0, 0], null, 378, 34, 2, 3);
      } else {
        box_text3 = new ItemText(86, 195, this.font_12_bld, 16, text3, [0, 0, 0], null, 378, 36, 2, 3);
      }
      py.m(this.layer, "add", box_text3);
    } else if (py.eq(this.active_dialog, WITNESS_GOODBYE)) {
      text2 = "Gracias de todos modos.\nQuiz\xe1s puedas ayudarme en otro momento.";
    } else if (py.eq(this.active_dialog, WITNESS_THANKS)) {
      text2 = this.thanks_text;
    } else if (py.eq(this.active_dialog, WITNESS_AID)) {
      text2 = py.add(py.add(this.witness.witness_statement.intro_statement.text, "\n\n"), this.witness.witness_statement.janitor_statement.text);
    } else if (py.eq(this.active_dialog, WITNESS_AID_2)) {
      text2 = this.witness.witness_statement.identikit_statement.text;
      if (py.truthy(this.witness.witness_statement.location_statement)) {
        text2 = py.add(text2, py.add("\n\n", this.witness.witness_statement.location_statement.text));
      }
    } else if (py.eq(this.active_dialog, WRONG_PLACE_DIALOG)) {
      text2 = py.getitem(this.stage.game.datastore.list_statements, 0).text;
    }
    if (!py.eq(this.active_dialog, WITNESS_REQUEST)) {
      additional_fonts = py.mkdict([["bold", [this.font_14_bld, 15, (-1)]]]);
      x = 100;
      if (py.truthy(py.isinstance(this, minigamebricklayer.MinigameBricklayer))) {
        x = x - 4;
      }
      this.box_text2 = new ItemText(x, 116, this.font_14, 16, text2, [0, 0, 0], null, 340, 130, 2, 2, additional_fonts);
    } else if ((request_line_count <= 1)) {
      this.box_text2 = new ItemText(86, 129, this.font_13, 16, text2, [0, 0, 0], null, 378, 78, 2, 2);
    } else {
      this.box_text2 = new ItemText(86, 122, this.font_13, 16, text2, [0, 0, 0], null, 378, 78, 2, 2);
    }
    py.m(this.layer, "add", this.box_text2);
    if (py.eq(this.active_dialog, WRONG_PLACE_DIALOG)) {
      image = this.previous_image;
      rollover_image = this.previous_rollover_image;
    } else {
      image = this.next_image;
      rollover_image = this.next_rollover_image;
    }
    this.next = new ItemImage(252, 232, image);
    this.next.set_rollover_image(rollover_image, this.rollover_sound);
    this.next.add_event_handler(ItemEvent.CLICK, py.bind(this, "option_click"));
    py.m(this.layer, "add", this.next);
    ignore_layers = [this.character_layer, this.score_layer];
    if ((py.truthy(transition) && !py.truthy(blind_witness))) {
      py.m(ignore_layers, "append", this.witness_layer);
    }
    this.stage.blind_dialog(this.layer, animations.BlindDirection.SHOW_DOWN, !py.truthy(transition), ignore_layers);
    return null;
  }
  hide_score_callback(layer: any): any {
    this.score_layer.empty();
    return null;
  }
  show_dialog(active_dialog: any): any {
    let ignore_layers: any;
    this.active_dialog = active_dialog;
    this.stop_stage_music();
    this.stage.prepare_dialog(this.character_layer, false, true);
    this.stage.show_dialog(this.layer, py.bind(this, "handle_event"));
    this.stage.add_layer(this.character_layer);
    ignore_layers = [this.character_layer];
    this.stage.blind_dialog(this.layer, animations.BlindDirection.SHOW_DOWN, true, ignore_layers, py.bind(this, "blind_show_dialog_callback"));
    return null;
  }
  stop_stage_music(): any {
    if ((!py.truthy(this.start_stage_music) && !py.truthy(this.playing_minigame_music))) {
      this.stage.set_music_volume(0, 450);
      this.start_stage_music = true;
    }
    return null;
  }
  show_score(): any {
    let l: any;
    this.active_dialog = SCORE_DIALOG;
    this.score_continue_visible = false;
    this.skip_scores_animation = false;
    this.stage.prepare_dialog(this.character_layer, false, true);
    this.stage.show_dialog(this.layer, py.bind(this, "handle_event"));
    this.set_up_score();
    this.set_up_witness();
    for (l of py.iter(this.minigame_above_layers)) {
      this.stage.add_layer(l);
    }
    this.stage.add_layer(this.score_layer);
    this.stage.add_layer(this.character_layer);
    this.show_happy_character();
    if (py.truthy(this.playing_minigame_music)) {
      this.stage.set_music_volume(0.7, 400);
    }
    animations.blind_layer(this.score_layer, animations.BlindDirection.SHOW_DOWN, null, 450, py.bind(this, "show_score_callback"));
    animations.blind_layer(this.witness_layer, animations.BlindDirection.SHOW_DOWN, null, 450, null);
    animations.blind_layer(this.layer, animations.BlindDirection.HIDE_DOWN, null, 450, null);
    animations.blind_layer(this.witness_worried_layer, animations.BlindDirection.HIDE_DOWN, null, 450, null);
    for (l of py.iter(this.minigame_above_layers)) {
      animations.blind_layer(l, animations.BlindDirection.HIDE_DOWN, null, 450, null);
    }
    return null;
  }
  show_happy_character(): any {
    this.witness_worried_layer = this.witness_layer;
    this.stage.add_layer(this.witness_worried_layer);
    this.witness_layer = new Layer();
    this.witness_item = this.create_character_happy_item();
    py.m(this.witness_layer, "add", this.witness_item);
    this.stage.add_layer(this.witness_layer);
    return null;
  }
  show_score_callback(layer: any): any {
    this.layer.empty();
    this.score_item = 1;
    this.add_score_item();
    return null;
  }
  show_wrong_place_dialog(): any {
    this.show_dialog(WRONG_PLACE_DIALOG);
    return null;
  }
  blind_show_dialog_callback(layer: any): any {
    this.stage.close_dialog(this.layer);
    this.show_witness_dialog(true, true);
    return null;
  }
  close_minigame(result: any = 0): any {
    let ignore_layers: any;
    this.stop_minigame_music();
    this.stop_minigame((result !== 1));
    this.close_result = result;
    ignore_layers = [this.character_layer];
    this.stage.blind_dialog(this.layer, animations.BlindDirection.HIDE_UP, true, ignore_layers, py.bind(this, "blind_close_callback"));
    this.stage.reset_dialog(false, true);
    return null;
  }
  stop_minigame_music(fadems: any = 400): any {
    if (py.truthy(this.playing_minigame_music)) {
      this.playing_minigame_music = false;
      this.start_stage_music = true;
      this.stage.set_music_volume(0, fadems);
    }
    return null;
  }
  blind_close_callback(layer: any): any {
    this.stage.close_dialog(this.layer);
    this.stage.reset_dialog();
    if (py.truthy(this.start_stage_music)) {
      this.start_stage_music = false;
      this.stage.play_phase_music();
    }
    if ((this.close_result === 1)) {
      this.phase1content.minigame_solved(true);
    } else if ((this.close_result === 2)) {
      this.stage.show_clues_with_fade(py.bind(this, "start_map_help_animation"));
    }
    return null;
  }
  start_map_help_animation(item: any = null): any {
    this.stage.start_map_help_animation();
    return null;
  }
  minigame_solved_callback(): any {
    let l, layer_found: any;
    this.minigame_above_layers = [];
    layer_found = false;
    for (l of py.iter(this.stage.layers)) {
      if (py.truthy(layer_found)) {
        if ((!py.eq(l, this.character_layer) && !py.eq(l, this.witness_layer))) {
          py.m(this.minigame_above_layers, "append", l);
        }
      } else if (py.eq(l, this.layer)) {
        layer_found = true;
      }
    }
    this.stop_minigame_music();
    this.stage.close_dialog(this.layer);
    this.show_score();
    return null;
  }
  show_help_dialog(close_callback: any = null): any {
    this.stage.show_dialog(this.help_layer, py.bind(this, "help_handle_event"), undefined, undefined, close_callback);
    this.stage.blind_dialog(this.help_layer, animations.BlindDirection.SHOW_DOWN, true, [], py.bind(this, "blind_show_help_callback"));
    return null;
  }
  close_help_dialog(): any {
    this.active_dialog = WITNESS_MINIGAME;
    this.stage.blind_dialog(this.help_layer, animations.BlindDirection.HIDE_DOWN, true, [], py.bind(this, "blind_close_help_callback"));
    return null;
  }
  help_handle_event(e: any): any {
    if (py.eq(e.type, KEYDOWN)) {
      if (py.eq(e.key, K_ESCAPE)) {
        this.stage.render();
        this.stage.click_sound.play();
        this.close_help_dialog();
        return true;
      }
    }
    return null;
  }
  blind_show_help_callback(layer: any): any {
    this.set_up_help_dialog();
    this.set_up_help_data();
    this.stage.add_layer(this.help_previous_layer);
    this.stage.add_layer(this.help_current_layer);
    this.stage.blind_dialog(this.help_layer, animations.BlindDirection.SHOW_DOWN, false, [], null);
    this.stage.render();
    animations.wait(this.stage, 100, py.bind(this, "play_help_sound"));
    return null;
  }
  play_help_sound(): any {
    this.help_sound.play();
    return null;
  }
  set_up_help_dialog(): any {
    let background_image, background_image_item, close_button_image, close_button_rollover_image: any;
    this.font_14 = assets.load_font("evilgeniusbb_reg.ttf", 14);
    background_image = assets.load_image("p1_minigame_help_background.png");
    background_image_item = new ItemImage(112, 24, background_image, null);
    py.m(this.help_layer, "add", background_image_item);
    close_button_image = assets.load_image("p1_minigames_btn_play_normal.png");
    close_button_rollover_image = assets.load_image("p1_minigames_btn_play_rollover.png");
    this.next_button_image = assets.load_image("p1_minigames_btn_next_normal.png");
    this.next_button_rollover_image = assets.load_image("p1_minigames_btn_next_rollover.png");
    this.previous_button_image = assets.load_image("p1_minigames_btn_prev_normal.png");
    this.previous_button_rollover_image = assets.load_image("p1_minigames_btn_prev_rollover.png");
    this.help_close_button = new ItemImage(262, 371, close_button_image, null);
    this.help_close_button.set_rollover_image(close_button_rollover_image, this.rollover_sound);
    this.help_next_button = new ItemImage(356, 374, this.next_button_image, null);
    this.help_next_button.set_rollover_image(this.next_button_rollover_image, this.rollover_sound);
    this.help_previous_button = new ItemImage(220, 374, this.previous_button_image, null);
    this.help_previous_button.set_rollover_image(this.previous_button_rollover_image, this.rollover_sound);
    this.help_close_button.add_event_handler(ItemEvent.CLICK, py.bind(this, "help_button_click"));
    this.help_next_button.add_event_handler(ItemEvent.CLICK, py.bind(this, "help_button_click"));
    this.help_previous_button.add_event_handler(ItemEvent.CLICK, py.bind(this, "help_button_click"));
    py.m(this.help_layer, "add", this.help_close_button);
    py.m(this.help_layer, "add", this.help_next_button);
    py.m(this.help_layer, "add", this.help_previous_button);
    return null;
  }
  help_button_click(item: any, args: any): any {
    this.stage.render();
    this.continue_sound.play();
    if (py.eq(item, this.help_close_button)) {
      this.close_help_dialog();
    } else if (py.eq(this.active_dialog, WITNESS_HELP)) {
      if (py.eq(item, this.help_next_button)) {
        this.help_stage = this.help_stage + 1;
      } else {
        this.help_stage = this.help_stage - 1;
      }
      this.help_previous_button.set_visible((this.help_stage > 1));
      this.help_next_button.set_visible((this.help_stage < this.max_help_stages));
      this.set_up_help_data();
    } else if (py.eq(item, this.help_previous_button)) {
      this.help_stage = this.help_stage - 1;
      this.set_up_help_data();
      if (py.eq(this.help_stage, (this.max_help_stages - 1))) {
        this.help_next_button.set_visible(true);
      } else if ((this.help_stage === 2)) {
        this.help_previous_button.set_visible(false);
      }
    }
    return null;
  }
  clean_help_dialog(): any {
    if (py.eq(this.active_dialog, WITNESS_MINIGAME)) {
      this.active_dialog = WITNESS_HELP;
      this.help_stage = 1;
      this.help_previous_button.set_visible(false);
    }
    return null;
  }
  set_up_help_data(): any {
    let item, items: any;
    items = [];
    for (item of py.iter(this.help_current_layer.items)) {
      py.m(items, "append", item);
    }
    this.help_previous_layer.empty();
    this.help_current_layer.empty();
    for (item of py.iter(items)) {
      py.m(this.help_previous_layer, "add", item);
    }
    this.clean_help_dialog();
    this.load_help_data();
    if ((py.len(this.help_previous_layer.items) > 0)) {
      animations.stop_blind_layer(this.help_current_layer);
      animations.stop_blind_layer(this.help_previous_layer);
      this.help_previous_layer.set_clip(null);
      animations.blind_layer(this.help_current_layer, animations.BlindDirection.SHOW_DOWN, this.help_current_layer.get_bounds(), 350, null, false);
      animations.blind_layer(this.help_previous_layer, animations.BlindDirection.HIDE_DOWN, this.help_previous_layer.get_bounds(), 350, null, false);
    }
    return null;
  }
  blind_close_help_callback(layer: any): any {
    this.help_layer.empty();
    this.help_previous_layer.empty();
    this.help_current_layer.empty();
    this.stage.close_dialog(this.help_layer);
    this.start_minigame();
    return null;
  }
  help_click(item: any, args: any): any {
    this.stop_minigame(false);
    this.stage.set_music_volume(0, 600);
    this.show_help_dialog();
    return null;
  }
  loose_game(): any {
    this.active_dialog = WITNESS_GOODBYE;
    this.stage.close_dialog(this.layer);
    this.stage.reset_dialog();
    this.show_witness_dialog(true);
    return null;
  }
  stop_minigame(solved: any): any {
    return null;
  }
  start_minigame(): any {
    return null;
  }
  start_play_stats_event(): any {
    this.stage.game.stats.start_time_event(this.play_statcode);
    return null;
  }
  end_play_stats_event(solved: any): any {
    let accumulate: any;
    if (py.truthy(solved)) {
      accumulate = this.solved_statcode;
    } else {
      accumulate = this.not_solved_statcode;
    }
    this.stage.game.stats.end_time_event(this.play_statcode, accumulate);
    return null;
  }
  play_music(): any {
    let music_loop: any;
    music_loop = this.get_music();
    this.stage.play_music(null, music_loop);
    this.playing_minigame_music = true;
    return null;
  }
  set_up_minigame(): any {
    throw new py.Exception("minigame not implemented");
    return null;
  }
  get_common_modifiers(mod: any): any {
    return (mod & (((((pygame.KMOD_LCTRL | pygame.KMOD_RCTRL) | pygame.KMOD_LALT) | pygame.KMOD_RALT) | pygame.KMOD_LSHIFT) | pygame.KMOD_RSHIFT));
  }
}
export function calculate_score_increment(score_increment: any, final_value: any, base_score: any): any {
  let increment: any;
  increment = py.max(score_increment, py.max(py.div(final_value, 30), py.div(base_score, 30)));
  increment = increment - py.mod(increment, 10);
  increment = increment + 8;
  return increment;
}
py.register("game/stages/minigame", $self);
export function $set(name: string, v: any): void {
  switch (name) {
    case "OPENING_DIALOG": OPENING_DIALOG = v; break;
    case "SCORE_DELAY": SCORE_DELAY = v; break;
    case "SCORE_DIALOG": SCORE_DIALOG = v; break;
    case "SCORE_END_SOUND_DELAY": SCORE_END_SOUND_DELAY = v; break;
    case "SCORE_INCREMENT": SCORE_INCREMENT = v; break;
    case "WITNESS_AID": WITNESS_AID = v; break;
    case "WITNESS_AID_2": WITNESS_AID_2 = v; break;
    case "WITNESS_GOODBYE": WITNESS_GOODBYE = v; break;
    case "WITNESS_HELP": WITNESS_HELP = v; break;
    case "WITNESS_MINIGAME": WITNESS_MINIGAME = v; break;
    case "WITNESS_REQUEST": WITNESS_REQUEST = v; break;
    case "WITNESS_THANKS": WITNESS_THANKS = v; break;
    case "WRONG_PLACE_DIALOG": WRONG_PLACE_DIALOG = v; break;
  }
}
