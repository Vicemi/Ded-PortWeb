// @ts-nocheck
// Generated from the original game code (see MODLOG.md). Do not edit by hand.
import * as py from '../../runtime/py';
import { ItemEvent } from '../../runtime/prelude';
import { ItemImage } from '../../runtime/prelude';
import { ItemRect } from '../../runtime/prelude';
import { ItemText } from '../../runtime/prelude';
import { KEYDOWN } from '../../runtime/prelude';
import { Minigame } from './minigame';
import * as animations from '../../engine/animations';
import * as assets from '../../engine/assets';
import { pygame as $pg } from '../../runtime/prelude'; const delay = (ms: number) => $pg.time.delay(ms);
const randint = py.random.randint;
import { random } from '../../runtime/py';
import * as statcodes from '../data/statcodes';

export class MinigameShoptender extends Minigame {
  constructor(stage: any, phase1content: any, witness: any) {
    let shoptender_image: any;
    super(stage, phase1content, witness, statcodes.MG_SHOPTENDER, statcodes.MG_SHOPTENDER_SOLVED, statcodes.MG_SHOPTENDER_NOTSOLVED, "shoptender");
    this.correct_answers = 0;
    this.wrong_answers = 0;
    this.animation_on = false;
    this.font_35 = assets.load_font("jstart.ttf", 35);
    this.bell_sound = assets.load_sound("p1_minigame_bell.ogg");
    this.correct_choice = assets.load_sound("p1_minigame_right.ogg");
    this.incorrect_choice = assets.load_sound("p1_minigame_wrong.ogg");
    this.timer = assets.load_sound("p1_minigame_timer.ogg");
    shoptender_image = assets.load_image("p1_minigame_shoptender.png");
    this.witness_item = new ItemImage(459, 44, shoptender_image, null);
    this.witness_minigame_box_image = assets.load_image("p1_minigame_flux_shoptender_dialogue1.png");
    this.title = "ALMACENERA";
    this.question_intro = "La Almacenera se encuentra muy ocupada\nen este momento, quiz\xe1s si la ayudas\npuedas interrogarla luego.";
    this.question = "\xbfTe ofreces a ayudarla?";
    this.request_text = "Estaba pasando las ventas de hoy al libro de\ncuentas, pero se me manch\xf3 la libreta\ndonde hago las operaciones y\nno puedo ver su signo.";
    this.request_question_text = "\xbfMe ayudas a completarlas?";
    this.thanks_text = "\xa1Muchas gracias!\n\nAhora puedo terminar de actualizar\n el libro de cuentas.";
    this.wait_wrong_symbol_key = null;
    this.fade_stain_key = null;
    return;
  }
  get_music(): any {
    return this.phase1content.music_minigame_2;
  }
  blind_show_minigame_callback(layer: any): any {
    if (!py.truthy(this.stage.game.datastore.user_character_progress.minigame_shoptender_help_seen)) {
      this.stop_minigame(false);
      this.stage.game.datastore.user_character_progress.minigame_shoptender_help_seen = true;
      this.show_help_dialog();
    } else {
      this.start_minigame();
    }
    return null;
  }
  set_up_minigame(): any {
    this.set_up_game_background_items();
    this.set_up_game_symbols();
    this.set_up_timer();
    this.set_up_witness();
    this.set_up_counters();
    return null;
  }
  set_up_counters(): any {
    let counter_back: any;
    this.actual_counter = 0;
    counter_back = assets.load_image("p1_minigame_shoptender_counter_bkg.png");
    this.counter1_on_image = assets.load_image("p1_minigame_shoptender_counter_s1_on.png");
    this.counter2_on_image = assets.load_image("p1_minigame_shoptender_counter_s2_on.png");
    this.counter3_on_image = assets.load_image("p1_minigame_shoptender_counter_s3_on.png");
    this.counter4_on_image = assets.load_image("p1_minigame_shoptender_counter_s4_on.png");
    this.counter5_on_image = assets.load_image("p1_minigame_shoptender_counter_s5_on.png");
    this.counter1_off_image = assets.load_image("p1_minigame_shoptender_counter_s1_off.png");
    this.counter2_off_image = assets.load_image("p1_minigame_shoptender_counter_s2_off.png");
    this.counter3_off_image = assets.load_image("p1_minigame_shoptender_counter_s3_off.png");
    this.counter4_off_image = assets.load_image("p1_minigame_shoptender_counter_s4_off.png");
    this.counter5_off_image = assets.load_image("p1_minigame_shoptender_counter_s5_off.png");
    counter_back = new ItemImage(217, 84, counter_back, null);
    this.counter1_item = new ItemImage(217, 85, this.counter1_off_image, null);
    this.counter2_item = new ItemImage(252, 85, this.counter2_off_image, null);
    this.counter3_item = new ItemImage(285, 85, this.counter3_off_image, null);
    this.counter4_item = new ItemImage(319, 85, this.counter4_off_image, null);
    this.counter5_item = new ItemImage(354, 84, this.counter5_off_image, null);
    py.m(this.layer, "add", counter_back);
    py.m(this.layer, "add", this.counter1_item);
    py.m(this.layer, "add", this.counter2_item);
    py.m(this.layer, "add", this.counter3_item);
    py.m(this.layer, "add", this.counter4_item);
    py.m(this.layer, "add", this.counter5_item);
    return null;
  }
  set_up_timer(): any {
    let character_progress, level, timer_backbar_image, timer_backbar_item, timer_barshadow_image, timer_barshadow_item, timer_front_image, timer_front_item, timer_ringer_image, timer_topbar_image: any;
    character_progress = this.stage.game.datastore.user_character_progress;
    level = character_progress.range.level;
    if ((level === 0)) {
      this.average_time = 50;
      this.timer_complete_time = 75;
    } else if ((level === 1)) {
      this.average_time = 43;
      this.timer_complete_time = 65;
    } else if ((level === 2)) {
      this.average_time = 36;
      this.timer_complete_time = 54;
    } else if ((level === 3)) {
      this.average_time = 29;
      this.timer_complete_time = 44;
    } else if ((level === 4)) {
      this.average_time = 22;
      this.timer_complete_time = 33;
    } else {
      this.average_time = 15;
      this.timer_complete_time = 23;
    }
    timer_backbar_image = assets.load_image("p1_minigame_shoptender_timer_backbar.jpg");
    timer_topbar_image = assets.load_image("p1_minigame_shoptender_timer_topbar.png");
    timer_barshadow_image = assets.load_image("p1_minigame_shoptender_timer_barshadow.png");
    timer_front_image = assets.load_image("p1_minigame_shoptender_timer_front.png");
    timer_ringer_image = assets.load_image("p1_minigame_shoptender_timer_ringer_001.png");
    timer_backbar_item = new ItemImage(144, 129, timer_backbar_image, null);
    this.timer_line_item = new ItemRect(149, 136, 11, 128, null, 0, "", [0, 0, 0], [236, 14, 36]);
    this.adjustement_value = py.fdiv(py.float(this.timer_line_item.get_height()), this.timer_complete_time);
    this.timer_topbar_item = new ItemImage(146, 122, timer_topbar_image, null);
    timer_barshadow_item = new ItemImage(142, 128, timer_barshadow_image, null);
    timer_front_item = new ItemImage(135, 118, timer_front_image, null);
    this.timer_ringer_item = new ItemImage(104, 253, timer_ringer_image, null);
    py.m(this.layer, "add", timer_backbar_item);
    py.m(this.layer, "add", this.timer_line_item);
    py.m(this.layer, "add", this.timer_topbar_item);
    py.m(this.layer, "add", timer_barshadow_item);
    py.m(this.layer, "add", timer_front_item);
    py.m(this.layer, "add", this.timer_ringer_item);
    return null;
  }
  start_bell_animation(): any {
    let timer_ringer_image, timer_ringer_image2, timer_ringer_image3, timer_ringer_image4: any;
    timer_ringer_image = this.timer_ringer_item.get_image();
    timer_ringer_image2 = assets.load_image("p1_minigame_shoptender_timer_ringer_002.png");
    timer_ringer_image3 = assets.load_image("p1_minigame_shoptender_timer_ringer_003.png");
    timer_ringer_image4 = assets.load_image("p1_minigame_shoptender_timer_ringer_004.png");
    animations.start_image_sequence(this.timer_ringer_item, [timer_ringer_image2, timer_ringer_image3, timer_ringer_image4, timer_ringer_image], 60, 10, null);
    return null;
  }
  update_timer(item: any, args: any): any {
    this.timer_topbar_item.set_top(py.add(this.timer_topbar_item.get_top(), 1));
    this.timer_line_item.set_top(py.add(this.timer_line_item.get_top(), 1));
    this.timer_line_item.set_height((this.timer_line_item.get_height() - 1));
    if ((this.timer_line_item.get_height() === 1)) {
      this.stop_minigame(false);
      this.stop_minigame_music(0);
      this.start_bell_animation();
      this.bell_sound.play();
      this.correct_answers = 0;
      this.wrong_answers = 0;
      this.animation_on = true;
      animations.wait_locked(this.stage, 2000, py.bind(this, "loose_game"));
    }
    return null;
  }
  load_help_data(): any {
    let back_left, back_top, background_help_image_item, background_image, lower_help_text, lower_text_height, lower_text_left, lower_text_top, lower_text_width, upper_help_text, upper_text_height, upper_text_left, upper_text_top, upper_text_width: any;
    back_left = 125;
    back_top = 154;
    if ((this.help_stage === 1)) {
      background_image = assets.load_image("p1_minigame_shoptender_help_d1.jpg");
      upper_help_text = "En la libreta aparece la cuenta con el signo tapado por la mancha.";
      upper_text_left = 203;
      upper_text_top = 96;
      upper_text_width = 193;
      upper_text_height = 52;
      lower_help_text = null;
      this.help_previous_button.set_visible(false);
    } else if ((this.help_stage === 2)) {
      background_image = assets.load_image("p1_minigame_shoptender_help_d2.jpg");
      upper_help_text = "Debajo de la libreta, debemos elegir el signo que corresponda a la cuenta.";
      upper_text_left = 157;
      upper_text_top = 104;
      upper_text_width = 288;
      upper_text_height = 43;
      lower_help_text = null;
    } else if ((this.help_stage === 3)) {
      background_image = assets.load_image("p1_minigame_shoptender_help_d3.jpg");
      upper_help_text = "Debemos completar correctamente 5 cuentas antes de que se acabe el tiempo y suene la campana.";
      upper_text_left = 157;
      upper_text_top = 96;
      upper_text_width = 288;
      upper_text_height = 52;
      lower_help_text = "Cada error resta un acierto.";
      lower_text_left = 159;
      lower_text_top = 341;
      lower_text_width = 289;
      lower_text_height = 18;
    }
    background_help_image_item = new ItemImage(0, 0, null, null);
    background_help_image_item.set_image(background_image);
    background_help_image_item.set_lefttop(back_left, back_top);
    py.m(this.help_current_layer, "add", background_help_image_item);
    this.upper_help_text_item = new ItemText(upper_text_left, upper_text_top, this.font_14, 16, upper_help_text, [183, 35, 35], null, upper_text_width, upper_text_height, 2);
    py.m(this.help_current_layer, "add", this.upper_help_text_item);
    if ((lower_help_text != null)) {
      this.lower_help_text_item = new ItemText(lower_text_left, lower_text_top, this.font_14, 16, lower_help_text, [183, 35, 35], null, lower_text_width, lower_text_height, 2);
      py.m(this.help_current_layer, "add", this.lower_help_text_item);
    }
    return null;
  }
  start_minigame(animation_item: any = null): any {
    if (!py.truthy(this.stage.is_timer_started("timer_shoptender"))) {
      this.play_music();
      this.stage.start_timer("timer_shoptender", py.int(py.div(1000, this.adjustement_value)), py.bind(this, "update_timer"));
      this.timer.play((-1));
    }
    this.build_operation();
    this.start_play_stats_event();
    return null;
  }
  stop_minigame(solved: any): any {
    if (py.truthy(this.stage.is_timer_started("timer_shoptender"))) {
      this.stage.stop_timer("timer_shoptender");
      this.timer.stop();
      this.stop_minigame_music();
    }
    this.end_play_stats_event(solved);
    return null;
  }
  set_up_game_background_items(): any {
    let exit_image, exit_image_rollover, help_image, help_image_rollover, line_text1, line_text2, line_text3, notepad_image, notepad_item_image, s, stain_image, symbol_image_add, symbol_image_div, symbol_image_mul, symbol_image_sub, symbol_item_add, symbol_item_div, symbol_item_mul, symbol_item_sub: any;
    notepad_image = assets.load_image("p1_minigame_shoptender_background.png");
    notepad_item_image = new ItemImage(26, 14, notepad_image);
    py.m(this.layer, "add", notepad_item_image);
    exit_image = assets.load_image("p1_minigames_btn_close_normal.png");
    exit_image_rollover = assets.load_image("p1_minigames_btn_close_active.png");
    this.exit_button = new ItemImage(261, 45, exit_image);
    this.exit_button.set_rollover_image(exit_image_rollover, this.rollover_sound);
    py.m(this.layer, "add", this.exit_button);
    this.exit_button.add_event_handler(ItemEvent.CLICK, py.bind(this, "button_click"));
    help_image = assets.load_image("p1_minigames_btn_help_normal.png");
    help_image_rollover = assets.load_image("p1_minigames_btn_help_active.png");
    this.help_button = new ItemImage(296, 45, help_image);
    this.help_button.set_rollover_image(help_image_rollover, this.rollover_sound);
    this.help_button.add_event_handler(ItemEvent.CLICK, py.bind(this, "help_click"));
    py.m(this.layer, "add", this.help_button);
    stain_image = assets.load_image("p1_minigame_shoptender_stain.png");
    this.stain_item_image = new ItemImage(194, 147, stain_image);
    py.m(this.layer, "add", this.stain_item_image);
    this.success_symbols_list = [];
    symbol_image_add = assets.load_image("p1_minigame_shoptender_add.png");
    symbol_item_add = new ItemImage(232, 179, symbol_image_add);
    py.m(this.success_symbols_list, "append", symbol_item_add);
    symbol_image_sub = assets.load_image("p1_minigame_shoptender_substract.png");
    symbol_item_sub = new ItemImage(232, 179, symbol_image_sub);
    py.m(this.success_symbols_list, "append", symbol_item_sub);
    symbol_image_mul = assets.load_image("p1_minigame_shoptender_multiply.png");
    symbol_item_mul = new ItemImage(232, 179, symbol_image_mul);
    py.m(this.success_symbols_list, "append", symbol_item_mul);
    symbol_image_div = assets.load_image("p1_minigame_shoptender_divide.png");
    symbol_item_div = new ItemImage(232, 179, symbol_image_div);
    py.m(this.success_symbols_list, "append", symbol_item_div);
    for (s of py.iter(this.success_symbols_list)) {
      s.set_visible(false);
      py.m(this.layer, "add", s);
    }
    this.number_lines_list = [];
    line_text1 = new ItemText(220, 154, this.font_35, 0, "", [71, 71, 130], null, 140, 36, 3);
    line_text2 = new ItemText(220, 198, this.font_35, 0, "", [71, 71, 130], null, 140, 36, 3);
    line_text3 = new ItemText(220, 258, this.font_35, 0, "", [71, 71, 130], null, 140, 36, 3);
    py.m(this.number_lines_list, "append", line_text1);
    py.m(this.number_lines_list, "append", line_text2);
    py.m(this.number_lines_list, "append", line_text3);
    py.m(this.layer, "add", line_text1);
    py.m(this.layer, "add", line_text2);
    py.m(this.layer, "add", line_text3);
    return null;
  }
  set_up_game_symbols(): any {
    let hover_image, i, standby_image, symbol_image, symbol_image_rollover, symbol_image_wrong, symbol_item, symbol_item_wrong, wrong_image: any;
    this.symbol_list = [];
    this.symbol_list_wrong = [];
    for (i of py.range(4)) {
      standby_image = py.add(py.add("p1_minigame_shoptender_btn_00", py.str(py.add(i, 1))), "_standby.png");
      symbol_image = assets.load_image(standby_image);
      hover_image = py.add(py.add("p1_minigame_shoptender_btn_00", py.str(py.add(i, 1))), "_hover.png");
      symbol_image_rollover = assets.load_image(hover_image);
      symbol_item = new ItemImage(py.add(207, py.mul(i, 50)), 312, symbol_image);
      symbol_item.set_rollover_image(symbol_image_rollover, this.rollover_sound);
      py.m(this.symbol_list, "append", symbol_item);
      wrong_image = py.add(py.add("p1_minigame_shoptender_btn_00", py.str(py.add(i, 1))), "_wrong.png");
      symbol_image_wrong = assets.load_image(wrong_image);
      symbol_item_wrong = new ItemImage(py.add(207, py.mul(i, 50)), 312, symbol_image_wrong);
      py.m(this.symbol_list_wrong, "append", symbol_item_wrong);
      py.m(this.layer, "add", symbol_item);
      symbol_item_wrong.set_visible(false);
      py.m(this.layer, "add", symbol_item_wrong);
      symbol_item.add_event_handler(ItemEvent.CLICK, py.bind(this, "button_click"));
    }
    return null;
  }
  update_counters(success: any): any {
    if (py.truthy(success)) {
      this.actual_counter = this.actual_counter + 1;
      if ((this.actual_counter === 1)) {
        this.counter1_item.set_image(this.counter1_on_image);
      } else if ((this.actual_counter === 2)) {
        this.counter2_item.set_image(this.counter2_on_image);
      } else if ((this.actual_counter === 3)) {
        this.counter3_item.set_image(this.counter3_on_image);
      } else if ((this.actual_counter === 4)) {
        this.counter4_item.set_image(this.counter4_on_image);
      } else if ((this.actual_counter === 5)) {
        this.counter5_item.set_image(this.counter5_on_image);
      }
    } else if ((this.actual_counter > 0)) {
      this.actual_counter = this.actual_counter - 1;
      if ((this.actual_counter === 0)) {
        this.counter1_item.set_image(this.counter1_off_image);
      } else if ((this.actual_counter === 1)) {
        this.counter2_item.set_image(this.counter2_off_image);
      } else if ((this.actual_counter === 2)) {
        this.counter3_item.set_image(this.counter3_off_image);
      } else if ((this.actual_counter === 3)) {
        this.counter4_item.set_image(this.counter4_off_image);
      } else if ((this.actual_counter === 4)) {
        this.counter5_item.set_image(this.counter5_off_image);
      }
    }
    return null;
  }
  button_click(item: any, args: any): any {
    if (py.eq(item, this.exit_button)) {
      this.correct_answers = 0;
      this.stop_minigame(false);
      this.phase1content.minigame_solved(false);
      this.close_minigame();
    } else if (py.contains(this.symbol_list, item)) {
      this.symbol_click(item);
    }
    return null;
  }
  minigame_handle_event(e: any): any {
    if (py.eq(e.type, KEYDOWN)) {
      if (py.truthy(this.stage.is_timer_started("timer_shoptender"))) {
        if ((e.unicode === "+")) {
          this.symbol_click(py.getitem(this.symbol_list, 0));
        } else if ((e.unicode === "-")) {
          this.symbol_click(py.getitem(this.symbol_list, 1));
        } else if ((e.unicode === "*")) {
          this.symbol_click(py.getitem(this.symbol_list, 2));
        } else if ((e.unicode === "/")) {
          this.symbol_click(py.getitem(this.symbol_list, 3));
        }
      }
    }
    return null;
  }
  symbol_click(item: any): any {
    if ((!py.truthy(this.animation_on) && (this.timer_line_item.get_height() > 1))) {
      this.animation_on = true;
      if (py.contains(this.operation_correct_answer, py.m(this.symbol_list, "index", item))) {
        this.correct_answers = this.correct_answers + 1;
        py.getitem(this.success_symbols_list, py.m(this.symbol_list, "index", item)).set_visible(true);
        this.update_counters(true);
        this.correct_choice.play();
        this.check_for_minigame_finished();
        this.stage.lock_ui();
        this.fade_stain_key = animations.fade_out_item(this.stain_item_image, false, 500, py.bind(this, "animations_resolution"));
      } else {
        this.wrong_answers = this.wrong_answers + 1;
        if ((this.correct_answers > 0)) {
          this.correct_answers = this.correct_answers - 1;
        }
        this.check_for_minigame_finished();
        this.set_wrong_symbol_list(true);
        this.update_counters(false);
        this.stage.render();
        this.incorrect_choice.play();
        this.wait_wrong_symbol_key = animations.wait_locked(this.stage, 500, py.bind(this, "set_wrong_symbol_list"));
      }
    }
    return null;
  }
  check_for_minigame_finished(): any {
    if (((this.timer_line_item.get_height() <= 1) || (this.correct_answers === 5))) {
      this.stop_minigame(true);
    }
    return null;
  }
  animations_resolution(item: any): any {
    if ((this.correct_answers < 5)) {
      this.check_for_minigame_finished();
      animations.fade_in_item(this.stain_item_image, 500, py.bind(this, "final_resolution"));
    } else {
      animations.wait_locked(this.stage, 500, py.bind(this, "final_resolution"));
    }
    return null;
  }
  final_resolution(item: any = null): any {
    let s: any;
    this.stage.unlock_ui();
    for (s of py.iter(this.success_symbols_list)) {
      if (py.truthy(s.get_visible())) {
        s.set_visible(false);
      }
    }
    if ((this.correct_answers < 5)) {
      this.check_for_minigame_finished();
      if ((this.timer_line_item.get_height() > 1)) {
        this.start_minigame();
      }
    } else {
      this.minigame_solved_callback();
    }
    this.animation_on = false;
    return null;
  }
  set_wrong_symbol_list(state: any = false): any {
    let i: any;
    for (i of py.range(py.len(this.symbol_list_wrong))) {
      py.getitem(this.symbol_list_wrong, i).set_visible(state);
      py.getitem(this.symbol_list, i).set_visible(!py.truthy(state));
    }
    if (!py.eq(state, true)) {
      this.animation_on = false;
      this.check_for_minigame_finished();
      if ((this.timer_line_item.get_height() > 1)) {
        this.start_minigame();
      }
    }
    return null;
  }
  build_operation(): any {
    let controled_range, max_number_accepted, n1, n2, n3, remaining, tries, type_operation: any;
    random.seed();
    type_operation = random.randint(0, 3);
    max_number_accepted = 100;
    if ((type_operation === 0)) {
      n1 = random.randint(1, max_number_accepted);
      n2 = random.randint(0, (max_number_accepted - n1));
      n3 = py.add(n1, n2);
    }
    if ((type_operation === 1)) {
      n1 = random.randint(1, max_number_accepted);
      n2 = random.randint(1, n1);
      n3 = (n1 - n2);
    }
    if ((type_operation === 2)) {
      controled_range = py.div(max_number_accepted, 2);
      n1 = random.randint(1, py.div(controled_range, 2));
      n2 = random.randint(0, py.div(max_number_accepted, n1));
      n3 = py.mul(n1, n2);
    } else if ((type_operation === 3)) {
      tries = 1;
      while ((tries < 5)) {
        n1 = random.randint(2, max_number_accepted);
        remaining = 1;
        while ((remaining !== 0)) {
          n2 = random.randint(2, n1);
          n3 = py.div(n1, n2);
          remaining = py.mod(n1, n2);
        }
        if (((n3 !== 1) && (n3 !== 2))) {
          break;
        } else {
          tries = tries + 1;
        }
      }
    }
    this.operation_correct_answer = [];
    if (py.eq(py.add(n1, n2), n3)) {
      py.m(this.operation_correct_answer, "append", 0);
    }
    if (py.eq((n1 - n2), n3)) {
      py.m(this.operation_correct_answer, "append", 1);
    }
    if (py.eq(py.mul(n1, n2), n3)) {
      py.m(this.operation_correct_answer, "append", 2);
    }
    if ((n2 !== 0)) {
      if (py.eq(py.div(n1, n2), n3)) {
        py.m(this.operation_correct_answer, "append", 3);
      }
    }
    py.getitem(this.number_lines_list, 0).set_text(py.str(n1));
    py.getitem(this.number_lines_list, 1).set_text(py.str(n2));
    py.getitem(this.number_lines_list, 2).set_text(py.str(n3));
    return null;
  }
  calculate_solved_score(): any {
    let elapsed_time, remaining_time, time_score: any;
    remaining_time = py.min(this.timer_complete_time, py.div(this.timer_line_item.get_height(), this.adjustement_value));
    elapsed_time = (this.timer_complete_time - remaining_time);
    if ((elapsed_time <= this.average_time)) {
      time_score = py.fdiv((142.85 * (this.average_time - elapsed_time)), this.average_time);
    } else {
      time_score = 0;
    }
    return [100, time_score, py.mul((-10), this.wrong_answers)];
  }
  create_character_happy_item(): any {
    let shoptender_happy_image: any;
    shoptender_happy_image = assets.load_image("p1_minigame_shoptender_happy.png");
    return new ItemImage(459, 44, shoptender_happy_image, null);
  }
}
