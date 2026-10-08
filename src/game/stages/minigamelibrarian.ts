// @ts-nocheck
// Generated from the original game code (see MODLOG.md). Do not edit by hand.
import * as py from '../../runtime/py';
import { ItemEvent } from '../../runtime/prelude';
import { ItemImage } from '../../runtime/prelude';
import { ItemRect } from '../../runtime/prelude';
import { ItemText } from '../../runtime/prelude';
import { KEYDOWN } from '../../runtime/prelude';
import { K_BACKSPACE } from '../../runtime/prelude';
import { K_RETURN } from '../../runtime/prelude';
import { Layer } from '../../runtime/prelude';
import { Minigame } from './minigame';
import * as animations from '../../engine/animations';
import * as assets from '../../engine/assets';
import { pygame as $pg } from '../../runtime/prelude'; const delay = (ms: number) => $pg.time.delay(ms);
const randint = py.random.randint;
import { random } from '../../runtime/py';
import * as statcodes from '../data/statcodes';

export class MinigameLibrarian extends Minigame {
  constructor(stage: any, phase1content: any, witness: any) {
    let librarian_image: any;
    super(stage, phase1content, witness, statcodes.MG_LIRARIAN, statcodes.MG_LIRARIAN_SOLVED, statcodes.MG_LIRARIAN_NOTSOLVED, "librarian");
    this.word_max_length = 6;
    this.correct_words_to_win = 5;
    this.letters = null;
    this.correct_words = 0;
    this.wrong_words = 0;
    this.letters_used = 0;
    this.animation_on = false;
    this.powdrf_18 = assets.load_font("powdrft_.ttf", 18);
    this.powdrf_23 = assets.load_font("powdrft_.ttf", 23);
    this.bell_sound = assets.load_sound("p1_minigame_bell.ogg");
    this.type_sound = assets.load_sound("p1_minigame_type.ogg");
    this.erase_sound = assets.load_sound("p1_minigame_erase.ogg");
    this.correct_choice = assets.load_sound("p1_minigame_right.ogg");
    this.incorrect_choice = assets.load_sound("p1_minigame_wrong.ogg");
    this.timer = assets.load_sound("p1_minigame_timer.ogg");
    librarian_image = assets.load_image("p1_minigame_librarian_librarian.png");
    this.witness_item = new ItemImage(447, 77, librarian_image, null);
    this.witness_minigame_box_image = assets.load_image("p1_minigame_flux_librarian_dialogue1.png");
    this.max_help_stages = 4;
    this.title = "BIBLIOTECARIO";
    this.question_intro = "El Bibliotecario se encuentra muy ocupado\nen este momento, quiz\xe1s si lo ayudas\npuedas interrogarlo luego.";
    this.question = "\xbfTe ofreces a ayudarlo?";
    this.request_text = "Estoy intentando restaurar unos libros antiguos y\nalgunas palabras no se ven bien. Tengo una\nlista de las letras que podr\xedan formarlas.";
    this.request_question_text = "\xbfPuedes ayudarme a formar\npalabras con ellas?";
    this.thanks_text = "\xa1Muchas gracias!\n\nYa puedo terminar de restaurar los libros.";
    this.dictionary_small = assets.load_data("words_small.tcd");
    this.dictionary_full = assets.load_data("words_full.tcd");
    return;
  }
  get_music(): any {
    return this.phase1content.music_minigame_2;
  }
  blind_show_minigame_callback(layer: any): any {
    if (!py.truthy(this.stage.game.datastore.user_character_progress.minigame_librarian_help_seen)) {
      this.stop_minigame(false);
      this.stage.game.datastore.user_character_progress.minigame_librarian_help_seen = true;
      this.show_help_dialog();
    } else {
      this.start_minigame();
    }
    return null;
  }
  set_up_minigame(): any {
    let character_progress, level, minigame_level: any;
    character_progress = this.stage.game.datastore.user_character_progress;
    minigame_level = character_progress.range.minigame_level;
    if ((minigame_level === 1)) {
      this.letters_count = 7;
    } else if ((minigame_level === 2)) {
      this.letters_count = 7;
    } else {
      this.letters_count = 6;
    }
    level = character_progress.range.level;
    if ((level === 0)) {
      this.average_time = 90;
      this.timer_complete_time = 135;
    } else if ((level === 1)) {
      this.average_time = 76;
      this.timer_complete_time = 114;
    } else if ((level === 2)) {
      this.average_time = 62;
      this.timer_complete_time = 93;
    } else if ((level === 3)) {
      this.average_time = 48;
      this.timer_complete_time = 72;
    } else if ((level === 4)) {
      this.average_time = 34;
      this.timer_complete_time = 51;
    } else {
      this.average_time = 20;
      this.timer_complete_time = 30;
    }
    this.set_up_game_background_items();
    this.set_up_timer();
    this.set_up_letters();
    this.set_up_game_buttons();
    this.set_up_typed_text();
    this.set_up_witness();
    this.good_color_image = assets.load_image("p1_minigame_librarian_popup_good.png");
    this.good_white_image = assets.load_image("p1_minigame_librarian_popup_good_white.png");
    this.bad_color_image = assets.load_image("p1_minigame_librarian_popup_bad.png");
    this.bad_white_image = assets.load_image("p1_minigame_librarian_popup_bad_white.png");
    this.rightmark_image = assets.load_image("p1_minigame_librarian_rightmark.png");
    this.result_layer = new Layer();
    this.stage.add_layer(this.result_layer);
    return null;
  }
  set_up_timer(): any {
    let timer_backbar_image, timer_backbar_item, timer_barshadow_image, timer_barshadow_item, timer_front_image, timer_front_item, timer_ringer_image, timer_topbar_image: any;
    timer_backbar_image = assets.load_image("p1_minigame_shoptender_timer_backbar.jpg");
    timer_topbar_image = assets.load_image("p1_minigame_shoptender_timer_topbar.png");
    timer_barshadow_image = assets.load_image("p1_minigame_shoptender_timer_barshadow.png");
    timer_front_image = assets.load_image("p1_minigame_shoptender_timer_front.png");
    timer_ringer_image = assets.load_image("p1_minigame_shoptender_timer_ringer_001.png");
    timer_backbar_item = new ItemImage(92, 111, timer_backbar_image, null);
    this.timer_line_item = new ItemRect(97, 118, 11, 128, null, 0, "", [0, 0, 0], [236, 14, 36]);
    this.adjustement_value = py.fdiv(py.float(this.timer_line_item.get_height()), this.timer_complete_time);
    this.timer_topbar_item = new ItemImage(94, 104, timer_topbar_image, null);
    timer_barshadow_item = new ItemImage(90, 110, timer_barshadow_image, null);
    timer_front_item = new ItemImage(83, 100, timer_front_image, null);
    this.timer_ringer_item = new ItemImage(52, 235, timer_ringer_image, null);
    py.m(this.layer, "add", timer_backbar_item);
    py.m(this.layer, "add", this.timer_line_item);
    py.m(this.layer, "add", this.timer_topbar_item);
    py.m(this.layer, "add", timer_barshadow_item);
    py.m(this.layer, "add", timer_front_item);
    py.m(this.layer, "add", this.timer_ringer_item);
    return null;
  }
  set_up_letters(): any {
    this.letter_items = [];
    if ((this.letters_count === 7)) {
      this.add_letter(158, 93, 167, 105);
      this.add_letter(199, 90, 208, 101);
      this.add_letter(238, 90, 248, 102);
      this.add_letter(278, 89, 288, 100);
      this.add_letter(318, 90, 328, 101);
      this.add_letter(358, 92, 369, 103);
      this.add_letter(398, 95, 410, 106);
    } else if ((this.letters_count === 6)) {
      this.add_letter(178, 93, 187, 105);
      this.add_letter(219, 91, 227, 102);
      this.add_letter(258, 90, 269, 102);
      this.add_letter(300, 90, 310, 102);
      this.add_letter(340, 92, 351, 103);
      this.add_letter(380, 95, 392, 106);
    }
    return null;
  }
  add_letter(button_x: any, button_y: any, letter_x: any, letter_y: any): any {
    let back_item, item, k, rollover_image, standby_image: any;
    k = py.str((py.len(this.letter_items) + 1));
    standby_image = assets.load_image(py.add(py.add("p1_minigame_librarian_btn_00", k), "_standby.png"));
    rollover_image = assets.load_image(py.add(py.add("p1_minigame_librarian_btn_00", k), "_rollover.png"));
    back_item = new ItemImage(button_x, button_y, standby_image);
    back_item.set_rollover_image(rollover_image, this.rollover_sound);
    back_item.add_event_handler(ItemEvent.CLICK, py.bind(this, "letter_click"));
    py.m(this.layer, "add", back_item);
    item = new ItemText(letter_x, letter_y, this.powdrf_23, 0, "", [80, 49, 19], null, 30, 30, 2);
    back_item.letter_item = item;
    py.m(this.layer, "add", item);
    py.m(this.letter_items, "append", [item, back_item]);
    return null;
  }
  set_up_game_buttons(): any {
    let accept_rollover_image, accept_standby_image, delete_rollover_image, delete_standby_image: any;
    accept_standby_image = assets.load_image("p1_minigame_librarian_btn_accept_standby.jpg");
    accept_rollover_image = assets.load_image("p1_minigame_librarian_btn_accept_rollover.jpg");
    this.accept_button = new ItemImage(204, 143, accept_standby_image);
    this.accept_button.set_rollover_image(accept_rollover_image, this.rollover_sound);
    this.accept_button.add_event_handler(ItemEvent.CLICK, py.bind(this, "button_click"));
    py.m(this.layer, "add", this.accept_button);
    delete_standby_image = assets.load_image("p1_minigame_librarian_btn_delete_standby.jpg");
    delete_rollover_image = assets.load_image("p1_minigame_librarian_btn_delete_rollover.jpg");
    this.delete_button = new ItemImage(303, 143, delete_standby_image);
    this.delete_button.set_rollover_image(delete_rollover_image, this.rollover_sound);
    this.delete_button.add_event_handler(ItemEvent.CLICK, py.bind(this, "button_click"));
    py.m(this.layer, "add", this.delete_button);
    return null;
  }
  set_up_typed_text(): any {
    this.typed_text = "";
    this.typed_letter_items = [];
    this.add_typed_letter(214, 204);
    this.add_typed_letter(244, 205);
    this.add_typed_letter(274, 204);
    this.add_typed_letter(304, 204);
    this.add_typed_letter(334, 204);
    this.add_typed_letter(364, 204);
    return null;
  }
  add_typed_letter(x: any, y: any): any {
    let item: any;
    item = new ItemText(x, y, this.font_24, 0, "", [150, 20, 15], null, 26, 30, 2);
    py.m(this.typed_letter_items, "append", item);
    py.m(this.layer, "add", item);
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
      this.correct_words = 0;
      this.wrong_words = 0;
      this.letters_used = 0;
      this.animation_on = true;
      animations.wait_locked(this.stage, 2000, py.bind(this, "loose_game"));
    }
    return null;
  }
  load_help_data(): any {
    let back_left, back_top, background_help_image_item, background_image, lower_help_text, lower_text_height, lower_text_left, lower_text_top, lower_text_width, upper_help_text, upper_text_height, upper_text_left, upper_text_top, upper_text_width: any;
    if ((this.help_stage === 1)) {
      background_image = assets.load_image("p1_minigame_librarian_help_d1.jpg");
      back_left = 125;
      back_top = 165;
      upper_help_text = "En la parte superior de la pantalla aparecer\xe1n las letras que debemos usar para formar palabras.";
      upper_text_left = 157;
      upper_text_top = 102;
      upper_text_width = 288;
      upper_text_height = 67;
      lower_help_text = null;
      this.help_previous_button.set_visible(false);
    } else if ((this.help_stage === 2)) {
      background_image = assets.load_image("p1_minigame_librarian_help_d2.jpg");
      back_left = 125;
      back_top = 139;
      upper_help_text = "Puedes seleccionarlas haciendo clic sobre ellas o escribiendolas en el teclado.";
      upper_text_left = 164;
      upper_text_top = 86;
      upper_text_width = 275;
      upper_text_height = 49;
      lower_help_text = "Lo mismo para el bot\xf3n de borrar.";
      lower_text_left = 217;
      lower_text_top = 326;
      lower_text_width = 163;
      lower_text_height = 34;
    } else if ((this.help_stage === 3)) {
      background_image = assets.load_image("p1_minigame_librarian_help_d3.jpg");
      back_left = 125;
      back_top = 157;
      upper_help_text = "Una vez que hayas escrito la palabra debes apretar el bot\xf3n de aceptar o la tecla \"enter\" del teclado.";
      upper_text_left = 156;
      upper_text_top = 92;
      upper_text_width = 288;
      upper_text_height = 56;
      lower_help_text = null;
    } else if ((this.help_stage === 4)) {
      background_image = assets.load_image("p1_minigame_librarian_help_d4.jpg");
      back_left = 125;
      back_top = 152;
      upper_help_text = "Debes completar 5 palabras de al menos 3 letras cada una antes de que se acabe el tiempo y suene la campana.";
      upper_text_left = 155;
      upper_text_top = 92;
      upper_text_width = 288;
      upper_text_height = 56;
      lower_help_text = null;
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
    this.stage.render();
    if ((this.letters == null)) {
      this.select_letters();
      this.reset_text();
    }
    if (!py.truthy(this.stage.is_timer_started("timer_librarian"))) {
      this.play_music();
      this.stage.start_timer("timer_librarian", py.int(py.div(1000, this.adjustement_value)), py.bind(this, "update_timer"));
      this.timer.play((-1));
    }
    this.start_play_stats_event();
    return null;
  }
  stop_minigame(solved: any): any {
    if (py.truthy(this.stage.is_timer_started("timer_librarian"))) {
      this.stage.stop_timer("timer_librarian");
      this.timer.stop();
      this.stop_minigame_music();
    }
    this.end_play_stats_event(solved);
    return null;
  }
  set_up_game_background_items(): any {
    let back_bottom_image, back_bottom_item, back_center_image, back_center_item, back_left_image, back_left_item, back_right_image, back_right_item, back_top_image, back_top_item, exit_image, exit_image_rollover, help_image, help_image_rollover: any;
    back_center_image = assets.load_image("p1_minigame_librarian_back_center.jpg");
    back_center_item = new ItemImage(111, 79, back_center_image);
    py.m(this.layer, "add", back_center_item);
    back_left_image = assets.load_image("p1_minigame_librarian_back_left.png");
    back_left_item = new ItemImage(91, 79, back_left_image);
    py.m(this.layer, "add", back_left_item);
    back_right_image = assets.load_image("p1_minigame_librarian_back_right.png");
    back_right_item = new ItemImage(501, 79, back_right_image);
    py.m(this.layer, "add", back_right_item);
    back_top_image = assets.load_image("p1_minigame_librarian_back_top.png");
    back_top_item = new ItemImage(98, 50, back_top_image);
    py.m(this.layer, "add", back_top_item);
    back_bottom_image = assets.load_image("p1_minigame_librarian_back_bottom.png");
    back_bottom_item = new ItemImage(91, 356, back_bottom_image);
    py.m(this.layer, "add", back_bottom_item);
    exit_image = assets.load_image("p1_minigames_btn_close_normal.png");
    exit_image_rollover = assets.load_image("p1_minigames_btn_close_active.png");
    this.exit_button = new ItemImage(264, 47, exit_image);
    this.exit_button.set_rollover_image(exit_image_rollover, this.rollover_sound);
    py.m(this.layer, "add", this.exit_button);
    this.exit_button.add_event_handler(ItemEvent.CLICK, py.bind(this, "button_click"));
    help_image = assets.load_image("p1_minigames_btn_help_normal.png");
    help_image_rollover = assets.load_image("p1_minigames_btn_help_active.png");
    this.help_button = new ItemImage(299, 47, help_image);
    this.help_button.set_rollover_image(help_image_rollover, this.rollover_sound);
    this.help_button.add_event_handler(ItemEvent.CLICK, py.bind(this, "help_click"));
    py.m(this.layer, "add", this.help_button);
    return null;
  }
  letter_click(item: any, args: any): any {
    this.type_letter(item.letter, [item.letter_item, item]);
    return null;
  }
  button_click(item: any, args: any): any {
    if (py.eq(item, this.delete_button)) {
      this.delete_letter();
    } else if (py.eq(item, this.accept_button)) {
      this.accept_text();
    } else if (py.eq(item, this.exit_button)) {
      this.correct_words = 0;
      this.wrong_words = 0;
      this.letters_used = 0;
      this.stop_minigame(false);
      this.phase1content.minigame_solved(false);
      this.close_minigame();
    }
    return null;
  }
  check_for_minigame_finished(): any {
    if (((this.timer_line_item.get_height() <= 1) || py.eq(this.correct_words, this.correct_words_to_win))) {
      this.stop_minigame(true);
      animations.wait_locked(this.stage, 1500, py.bind(this, "final_resolution"));
    }
    return null;
  }
  final_resolution(item: any = null): any {
    this.minigame_solved_callback();
    this.animation_on = false;
    return null;
  }
  select_letters(): any {
    let i, letter: any;
    this.correct_word_list = [];
    this.letters = this.generate_letters();
    i = 0;
    for (letter of py.iter(this.letters)) {
      py.getitem(py.getitem(this.letter_items, i), 0).set_text(this.to_upper(letter));
      py.getitem(py.getitem(this.letter_items, i), 1).letter = letter;
      i = i + 1;
    }
    return null;
  }
  get_matches(dictionary: any): any {
    let available_letters, letter, matches, missing_letters, word, words: any;
    matches = [];
    words = py.getitem(dictionary, 0);
    for (word of py.iter(words)) {
      missing_letters = 0;
      available_letters = py.slice(this.letters, null, null);
      for (letter of py.iter(word)) {
        if (py.contains(available_letters, letter)) {
          py.m(available_letters, "remove", letter);
        } else {
          missing_letters = missing_letters + 1;
        }
      }
      if ((missing_letters === 0)) {
        py.m(matches, "append", word);
      }
    }
    return matches;
  }
  generate_letters(): any {
    let available_letters, letter, letter_selected, letters, matches, max_letter, max_score, min_matches, missing_letter_score, missing_letters, score, top_letter_scores, top_letters, word, word_score, words: any;
    words = py.getitem(this.dictionary_small, 0);
    if ((this.letters_count >= 7)) {
      min_matches = py.mul(4, this.correct_words_to_win);
    } else {
      min_matches = py.mul(3, this.correct_words_to_win);
    }
    random.seed();
    while (true) {
      letters = [];
      while ((py.len(letters) < this.letters_count)) {
        missing_letter_score = py.mkdict([]);
        for (word of py.iter(words)) {
          missing_letters = 0;
          available_letters = py.slice(letters, null, null);
          for (letter of py.iter(word)) {
            if (py.contains(available_letters, letter)) {
              py.m(available_letters, "remove", letter);
            } else {
              missing_letters = missing_letters + 1;
            }
          }
          if (((missing_letters > 0) && (missing_letters <= (this.letters_count - py.len(letters))))) {
            if ((missing_letters === 1)) {
              word_score = 150;
            } else if ((missing_letters === 2)) {
              word_score = 20;
            } else if ((missing_letters === 3)) {
              word_score = 10;
            } else if ((missing_letters === 4)) {
              word_score = 5;
            } else if ((missing_letters === 5)) {
              word_score = 2;
            } else {
              word_score = 1;
            }
            available_letters = py.slice(letters, null, null);
            for (letter of py.iter(word)) {
              if (py.contains(available_letters, letter)) {
                py.m(available_letters, "remove", letter);
              } else {
                if (py.contains(missing_letter_score, letter)) {
                  score = py.getitem(missing_letter_score, letter);
                } else {
                  score = 0;
                }
                score = py.add(score, word_score);
                py.setitem(missing_letter_score, letter, score);
              }
            }
          }
        }
        top_letter_scores = [];
        top_letters = [];
        while ((py.len(top_letters) < 4)) {
          max_letter = "";
          max_score = 0;
          for ([letter, score] of py.iter(py.m(missing_letter_score, "items"))) {
            if (((score > max_score) && !py.contains(top_letters, letter))) {
              max_letter = letter;
              max_score = score;
            }
          }
          if ((max_score === 0)) {
            break;
          }
          py.m(top_letter_scores, "append", [max_score, max_letter]);
          py.m(top_letters, "append", max_letter);
        }
        if ((py.len(top_letters) > 0)) {
          py.m(letters, "append", random.choice(top_letters));
        } else {
          letter_selected = false;
          while (!py.truthy(letter_selected)) {
            word = random.choice(words);
            for (letter of py.iter(word)) {
              if (!py.contains(letters, letter)) {
                py.m(letters, "append", letter);
                letter_selected = true;
                break;
              }
            }
          }
        }
      }
      matches = 0;
      for (word of py.iter(words)) {
        missing_letters = 0;
        available_letters = py.slice(letters, null, null);
        for (letter of py.iter(word)) {
          if (py.contains(available_letters, letter)) {
            py.m(available_letters, "remove", letter);
          } else {
            missing_letters = missing_letters + 1;
          }
        }
        if ((missing_letters === 0)) {
          matches = matches + 1;
        }
      }
      if ((matches >= min_matches)) {
        return letters;
      }
    }
    return null;
  }
  type_letter(letter: any, letter_items: any = null): any {
    let back_item, item: any;
    if ((py.len(this.typed_text) < py.len(this.typed_letter_items))) {
      if ((letter_items == null)) {
        for ([item, back_item] of py.iter(this.letter_items)) {
          if ((py.eq(back_item.letter, letter) && py.truthy(back_item.get_visible()))) {
            letter_items = [item, back_item];
            break;
          }
        }
      }
      if ((letter_items != null)) {
        this.typed_text = py.add(this.typed_text, letter);
        py.getitem(this.typed_letter_items, (py.len(this.typed_text) - 1)).set_text(this.to_upper(letter));
        py.getitem(letter_items, 0).set_visible(false);
        py.getitem(letter_items, 1).set_visible(false);
        this.stage.render();
        this.type_sound.play();
      }
    }
    return null;
  }
  to_upper(letter: any): any {
    if ((letter === "\xe1")) {
      return "\xc1";
    } else {
      if ((letter === "\xe9")) {
        return "\xc9";
      }
      if ((letter === "\xed")) {
        return "\xcd";
      }
      if ((letter === "\xf3")) {
        return "\xd3";
      }
      if ((letter === "\xfa")) {
        return "\xda";
      }
      if ((letter === "\xf1")) {
        return "\xd1";
      }
      if ((letter === "\xfc")) {
        return "\xdc";
      }
      return py.m(letter, "upper");
    }
    return null;
  }
  delete_letter(): any {
    let back_item, item, letter, letter_item: any;
    if ((py.len(this.typed_text) > 0)) {
      letter = py.getitem(this.typed_text, (py.len(this.typed_text) - 1));
      letter_item = null;
      for ([item, back_item] of py.iter(this.letter_items)) {
        if ((py.eq(back_item.letter, letter) && !py.truthy(back_item.get_visible()))) {
          letter_item = [item, back_item];
          break;
        }
      }
      py.getitem(letter_item, 0).set_visible(true);
      py.getitem(letter_item, 1).set_visible(true);
      this.typed_text = py.slice(this.typed_text, null, (py.len(this.typed_text) - 1));
      py.getitem(this.typed_letter_items, py.len(this.typed_text)).set_text("");
      this.stage.render();
      this.erase_sound.play();
    }
    return null;
  }
  accept_text(): any {
    let index, word_to_add: any;
    if ((py.len(this.typed_text) > 0)) {
      if (py.contains(py.getitem(this.dictionary_full, 0), this.typed_text)) {
        index = py.m(py.getitem(this.dictionary_full, 0), "index", this.typed_text);
        word_to_add = py.getitem(py.getitem(this.dictionary_full, 1), index);
      } else {
        word_to_add = null;
      }
      if (((word_to_add != null) && !py.contains(this.correct_word_list, word_to_add))) {
        this.add_correct_word(word_to_add);
        this.start_result_animation(true);
        this.stage.render();
        this.correct_choice.play();
        this.check_for_minigame_finished();
      } else {
        if (!py.contains(this.correct_word_list, word_to_add)) {
          this.wrong_words = this.wrong_words + 1;
        }
        this.start_result_animation(false);
        this.stage.render();
        this.incorrect_choice.play();
      }
      this.reset_text();
    }
    return null;
  }
  reset_text(): any {
    let back_item, item: any;
    this.typed_text = "";
    for ([item, back_item] of py.iter(this.letter_items)) {
      item.set_visible(true);
      back_item.set_visible(true);
    }
    for (item of py.iter(this.typed_letter_items)) {
      item.set_text("");
    }
    return null;
  }
  add_correct_word(word: any): any {
    let c, number, number_image, number_item, number_x, number_y, rightmark_item, text, text_x, text_y, tick_x, tick_y, word_upper: any;
    if (!py.contains(this.correct_word_list, word)) {
      if ((this.correct_words === 0)) {
        number_x = 233;
        number_y = 295;
        tick_x = 344;
        tick_y = 279;
        text_x = 249;
        text_y = 289;
      } else if ((this.correct_words === 1)) {
        number_x = 233;
        number_y = 315;
        tick_x = 344;
        tick_y = 299;
        text_x = 249;
        text_y = 312;
      } else if ((this.correct_words === 2)) {
        number_x = 233;
        number_y = 337;
        tick_x = 344;
        tick_y = 321;
        text_x = 249;
        text_y = 332;
      } else if ((this.correct_words === 3)) {
        number_x = 233;
        number_y = 356;
        tick_x = 344;
        tick_y = 342;
        text_x = 249;
        text_y = 352;
      } else if ((this.correct_words === 4)) {
        number_x = 233;
        number_y = 379;
        tick_x = 344;
        tick_y = 364;
        text_x = 249;
        text_y = 375;
      }
      number = py.str(py.add(this.correct_words, 1));
      number_image = assets.load_image(py.add(py.add("p1_minigame_librarian_", number), "listed.jpg"));
      number_item = new ItemImage(number_x, number_y, number_image);
      py.m(this.layer, "add", number_item);
      rightmark_item = new ItemImage(tick_x, tick_y, this.rightmark_image);
      py.m(this.layer, "add", rightmark_item);
      word_upper = "";
      for (c of py.iter(word)) {
        word_upper = py.add(word_upper, this.to_upper(c));
      }
      text = new ItemText(text_x, text_y, this.powdrf_18, 0, word_upper, [150, 20, 15], null, 103, 25, 2);
      py.m(this.layer, "add", text);
      this.correct_words = this.correct_words + 1;
      py.m(this.correct_word_list, "append", word);
      this.letters_used = py.add(this.letters_used, py.len(word));
    }
    return null;
  }
  minigame_handle_event(e: any): any {
    let c, letter, valid: any;
    if (py.eq(e.type, KEYDOWN)) {
      if (py.truthy(this.stage.is_timer_started("timer_librarian"))) {
        if (py.eq(e.key, K_BACKSPACE)) {
          this.delete_letter();
        } else if (py.eq(e.key, K_RETURN)) {
          this.accept_text();
        } else {
          valid = true;
          for (c of py.iter(e.unicode)) {
            if (!py.contains(py.rangeList(256), py.ord(c))) {
              valid = false;
              break;
            }
          }
          if (py.truthy(valid)) {
            letter = py.m(py.m(e.unicode, "lower"), "encode", "latin-1");
            if (py.contains(this.letters, letter)) {
              this.type_letter(letter);
            }
          }
        }
      }
    }
    super.minigame_handle_event(e);
    return null;
  }
  start_result_animation(good: any): any {
    let animation: any;
    animation = new ResultAnimation(this.stage, this, this.result_layer, good);
    animation.start();
    return null;
  }
  calculate_solved_score(): any {
    let elapsed_time, remaining_time, time_score: any;
    remaining_time = py.min(this.timer_complete_time, py.div(this.timer_line_item.get_height(), this.adjustement_value));
    elapsed_time = (this.timer_complete_time - remaining_time);
    if ((elapsed_time <= this.average_time)) {
      time_score = py.div((128 * (this.average_time - elapsed_time)), this.average_time);
    } else {
      time_score = 0;
    }
    return [100, time_score, py.mul(this.letters_used, 1), py.mul((-10), this.wrong_words)];
  }
  create_character_happy_item(): any {
    let librarian_happy_image: any;
    librarian_happy_image = assets.load_image("p1_minigame_librarian_happy.png");
    return new ItemImage(447, 77, librarian_happy_image, null);
  }
}
export class ResultAnimation {
  constructor(stage: any, minigame: any, result_layer: any, good: any) {
    this.stage = stage;
    this.result_layer = result_layer;
    if (py.truthy(good)) {
      this.color_image = minigame.good_color_image;
      this.white_image = minigame.good_white_image;
    } else {
      this.color_image = minigame.bad_color_image;
      this.white_image = minigame.bad_white_image;
    }
    this.color_item = new ItemImage(240, 160, this.color_image);
    this.white_item = new ItemImage(240, 160, this.white_image);
    return;
  }
  start(): any {
    py.m(this.result_layer, "add", this.color_item);
    py.m(this.result_layer, "add", this.white_item);
    animations.fade_out_item(this.white_item, true, 167, this._ResultAnimation__fade_out_callback);
    return null;
  }
  _ResultAnimation__fade_out_callback(item: any): any {
    animations.wait(this.stage, 167, this._ResultAnimation__wait_callback);
    return null;
  }
  _ResultAnimation__wait_callback(): any {
    if ((this.result_layer.get_stage() != null)) {
      animations.start_move(this.color_item, this.color_item.get_left(), (this.color_item.get_top() - 95), 400);
      animations.fade_out_item(this.color_item, true, 400);
    }
    return null;
  }
}
