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
import { random } from '../../runtime/py';
import * as text from '../../engine/textutil';

export let HIDEOUT_DIALOG: any = 1;
export let QUESTION_DIALOG: any = 2;
export let WRONGDOOR_DIALOG: any = 3;
export class Janitor {
  constructor(stage: any) {
    this.stage = stage;
    this.layer = new Layer();
    this.character_layer = new Layer();
    this.folder_layer = null;
    this.rollover_sound = assets.load_sound("GUI_roll_over.ogg");
    this.continue_sound = assets.load_sound("GUI_Click.ogg");
    this.janitor_sound = assets.load_sound("p0_janitor.ogg");
    this.wrong_door_open_sound = assets.load_sound("p0_wrong_door_open.ogg");
    this.wrong_door_man_sound = assets.load_sound("p0_wrong_door_no.ogg");
    this.wrong_door_female_sound = assets.load_sound("p0_wrong_door_no_female.ogg");
    return;
  }
  show_janitor(city: any, option_texts: any, right_option: any): any {
    this.option_texts = option_texts;
    this.right_choice = right_option;
    this.city = city;
    this.active_dialog = HIDEOUT_DIALOG;
    this.ignore_layers = [];
    this.stage.prepare_dialog(this.character_layer, false, true);
    this.stage.show_dialog(this.layer, py.bind(this, "handle_event"));
    this.stage.add_layer(this.character_layer);
    this.stage.blind_dialog(this.layer, animations.BlindDirection.SHOW_DOWN, true, py.add([this.character_layer], this.ignore_layers), py.bind(this, "blind_show_janitor_callback"));
    return null;
  }
  blind_show_janitor_callback(layer: any): any {
    this.load_option_results();
    this.set_up_hideout_dialogue(this.city);
    this.stage.blind_dialog(this.layer, animations.BlindDirection.SHOW_DOWN, false, py.add([this.character_layer, this.folder_layer], this.ignore_layers));
    return null;
  }
  set_up_hideout_dialogue(city: any): any {
    let city_text, font_14, font_14_bld, font_24, hideout_box, hideout_box_image, info_text, info_text_bld, message, message_bld, next, next_image, next_rollover_image: any;
    hideout_box_image = assets.load_image("p1_hideout_box.png");
    hideout_box = new ItemImage(108, 86, hideout_box_image, null);
    py.m(this.layer, "add", hideout_box);
    font_24 = assets.load_font("powdrft_.ttf", 24);
    city_text = new ItemText(163, 93, font_24, 0, text.to_upper(city.name), [157, 21, 21], null, 272, 30, 2, 2);
    py.m(this.layer, "add", city_text);
    font_14 = assets.load_font("evilgeniusbb_reg.ttf", 14);
    message = "Luego de indagar en la localidad,\nconcluyes que el ladr\xf3n se hospeda en un\ncondominio de la zona. Una vez all\xed\n.";
    info_text = new ItemText(119, 112, font_14, 18, message, [0, 0, 0], null, 360, 151, 2, 2);
    py.m(this.layer, "add", info_text);
    font_14_bld = assets.load_font("evilgeniusbb_bld.ttf", 14);
    message_bld = "interrogas al conserje.";
    info_text_bld = new ItemText(150, 205, font_14_bld, 18, message_bld, [0, 0, 0], null, 300, 25, 2);
    py.m(this.layer, "add", info_text_bld);
    next_image = assets.load_image("p0_button_next_active.png");
    next_rollover_image = assets.load_image("p0_button_next_rollover.png");
    next = new ItemImage(278, 238, next_image);
    next.set_rollover_image(next_rollover_image, this.rollover_sound);
    next.add_event_handler(ItemEvent.CLICK, py.bind(this, "hideout_next_click"));
    py.m(this.layer, "add", next);
    return null;
  }
  set_up_question_dialog(): any {
    this.active_dialog = QUESTION_DIALOG;
    this.layer.empty();
    this.set_up_janitor();
    this.set_up_avatar();
    this.set_up_options();
    this.set_up_folder();
    this.stage.blind_dialog(this.layer, animations.BlindDirection.SHOW_DOWN, false, py.add([this.character_layer, this.folder_layer], this.ignore_layers), py.bind(this, "blind_show_question_callback"));
    return null;
  }
  blind_show_question_callback(layer: any): any {
    this.stage.render();
    this.janitor_sound.play();
    return null;
  }
  set_up_wrongdoor_dialog(kid_number: any): any {
    this.active_dialog = WRONGDOOR_DIALOG;
    this.layer.empty();
    this.set_up_wrongdoor(kid_number);
    this.kid_number = kid_number;
    this.stage.blind_dialog(this.layer, animations.BlindDirection.SHOW_DOWN, false, py.add([this.character_layer, this.folder_layer], this.ignore_layers), py.bind(this, "blind_show_wrongdoor_callback"));
    animations.wait(this.stage, 50, py.bind(this, "play_wrong_door"));
    return null;
  }
  play_wrong_door(): any {
    this.wrong_door_open_sound.play();
    return null;
  }
  blind_show_wrongdoor_callback(layer: any): any {
    this.stage.render();
    if ((this.kid_number === 1)) {
      this.wrong_door_man_sound.play();
    } else if ((this.kid_number === 2)) {
      this.wrong_door_female_sound.play();
    }
    animations.wait_locked(this.stage, 400, py.bind(this, "update_wrong_door_time_left"));
    return null;
  }
  update_wrong_door_time_left(): any {
    this.stage.set_time_left(1);
    return null;
  }
  set_up_janitor(): any {
    let case_, janitor, janitor_box, janitor_box_image, janitor_image, question, question_image: any;
    janitor_image = assets.load_image("p1_janitor.png");
    janitor = new ItemImage(453, 87, janitor_image, null);
    py.m(this.layer, "add", janitor);
    janitor_box_image = assets.load_image("p1_janitor_box.png");
    janitor_box = new ItemImage(119, 74, janitor_box_image, null);
    py.m(this.layer, "add", janitor_box);
    case_ = this.stage.game.datastore.user_character_progress.case;
    question = py.getitem(case_.list_witness_statements, 0).janitor_statement.type;
    if ((question === 1)) {
      question_image = assets.load_image("p1_janitor_question_sport.gif");
    } else if ((question === 2)) {
      question_image = assets.load_image("p1_janitor_question_pet.gif");
    }
    question = new ItemImage(152, 140, question_image);
    py.m(this.layer, "add", question);
    return null;
  }
  load_option_results(): any {
    let kid_number, option_text: any;
    kid_number = random.randint(1, 2);
    this.option_results = [];
    for (option_text of py.iter(this.option_texts)) {
      if (py.eq(option_text, this.right_choice)) {
        py.m(this.option_results, "append", 0);
      } else {
        py.m(this.option_results, "append", kid_number);
        if ((kid_number === 1)) {
          kid_number = 2;
        } else {
          kid_number = 1;
        }
      }
    }
    return null;
  }
  set_up_options(): any {
    let font, i, option_hover_image, option_text, text, x, y: any;
    font = assets.load_font("evilgeniusbb_bld.ttf", 11);
    option_hover_image = assets.load_image("p1_avatar_option_hover.png");
    x = 141;
    y = 259;
    for (i of py.range(py.len(this.option_texts))) {
      option_text = py.getitem(this.option_texts, i);
      if (py.eq(py.getitem(this.option_results, i), (-1))) {
        text = new ItemText(x, y, font, 0, option_text, [153, 153, 153], null, option_hover_image.get_width(), option_hover_image.get_height(), 2, 2);
        py.m(this.layer, "add", text);
      } else {
        text = new ItemText(x, y, font, 0, option_text, [79, 79, 79], null, option_hover_image.get_width(), option_hover_image.get_height(), 2, 2);
        text.set_rollover(option_hover_image, this.rollover_sound, 0, 1);
        text.set_rollover_color([132, 15, 15], null);
        text.add_event_handler(ItemEvent.CLICK, py.bind(this, "option_click"));
        text.index = i;
        py.m(this.layer, "add", text);
      }
      y = y + 24;
    }
    return null;
  }
  set_up_folder(): any {
    let folder, folder_layer, folder_text_image, folder_text_item: any;
    if ((this.folder_layer == null)) {
      folder = this.stage.folder_icon;
      folder_layer = folder.get_layer();
      py.m(folder_layer, "remove", folder);
      this.folder_layer = folder_layer;
      folder.select_witnesses = true;
      py.m(this.character_layer, "add", folder);
      folder_text_image = assets.load_image("p0_bottomgui_case_tag.png");
      folder_text_item = new ItemImage(441, 376, folder_text_image);
      py.m(this.character_layer, "add", folder_text_item);
    }
    return null;
  }
  restore_folder(): any {
    let folder: any;
    if ((this.folder_layer != null)) {
      folder = this.stage.folder_icon;
      folder.select_witnesses = false;
      py.m(this.layer, "remove", folder);
      py.m(this.folder_layer, "add", folder);
    }
    return null;
  }
  set_up_avatar(): any {
    let avatar_box, avatar_box_image, left, top: any;
    avatar_box_image = assets.load_image("p1_avatar_box.png");
    left = 119;
    top = 244;
    avatar_box = new ItemImage(left, top, avatar_box_image);
    py.m(this.layer, "add", avatar_box);
    return null;
  }
  set_up_wrongdoor(kid_number: any): any {
    let box, box_image, kid, kid_image, next, next_image, next_rollover_image: any;
    box_image = assets.load_image("p1_wrongdoor_box.png");
    box = new ItemImage(81, 116, box_image);
    py.m(this.layer, "add", box);
    if ((kid_number === 1)) {
      kid_image = assets.load_image("p1_wrongdoor_kid_001.png");
      kid = new ItemImage(415, 104, kid_image);
    } else if ((kid_number === 2)) {
      kid_image = assets.load_image("p1_wrongdoor_kid_002.png");
      kid = new ItemImage(434, 84, kid_image);
    }
    py.m(this.layer, "add", kid);
    next_image = assets.load_image("p0_button_previous_active.png");
    next_rollover_image = assets.load_image("p0_button_previous_rollover.png");
    next = new ItemImage(262, 249, next_image);
    next.set_rollover_image(next_rollover_image, this.rollover_sound);
    next.add_event_handler(ItemEvent.CLICK, py.bind(this, "wrongdoor_next_click"));
    py.m(this.layer, "add", next);
    return null;
  }
  hideout_next_click(item: any, args: any): any {
    this.stage.render();
    this.continue_sound.play();
    this.show_next();
    return null;
  }
  show_next(): any {
    if (py.eq(this.active_dialog, HIDEOUT_DIALOG)) {
      this.set_up_question_dialog();
    } else if (py.eq(this.active_dialog, WRONGDOOR_DIALOG)) {
      this.set_up_question_dialog();
    }
    return null;
  }
  wrongdoor_next_click(item: any, args: any): any {
    this.stage.render();
    this.continue_sound.play();
    this.show_next();
    return null;
  }
  option_click(item: any, args: any): any {
    let result: any;
    this.stage.render();
    this.continue_sound.play();
    result = py.getitem(this.option_results, item.index);
    if ((result === 0)) {
      this.go_to_Phase2();
    } else {
      this.set_up_wrongdoor_dialog(result);
      py.setitem(this.option_results, item.index, (-1));
    }
    return null;
  }
  go_to_Phase2(): any {
    this.restore_folder();
    this.stage.game.datastore.user_character_progress.case.time_spend = this.stage.game.datastore.user_character_progress.case.time_spend + 1;
    this.stage.set_phase(2);
    return null;
  }
  handle_event(e: any): any {
    if ((py.eq(e.type, KEYDOWN) && py.eq(e.key, K_ESCAPE))) {
      this.stage.render();
      this.continue_sound.play();
      if (py.eq(this.active_dialog, QUESTION_DIALOG)) {
        this.stage.show_mainmenu();
      } else {
        this.show_next();
      }
      return true;
    }
    return null;
  }
}
