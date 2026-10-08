// @ts-nocheck
// Generated from the original game code (see MODLOG.md). Do not edit by hand.
import * as py from '../../runtime/py';
import { BlindDirection } from '../../engine/animations';
import { ItemEvent } from '../../runtime/prelude';
import { ItemImage } from '../../runtime/prelude';
import { ItemMask } from '../../runtime/prelude';
import { ItemRect } from '../../runtime/prelude';
import { ItemText } from '../../runtime/prelude';
import { KEYDOWN } from '../../runtime/prelude';
import { K_ESCAPE } from '../../runtime/prelude';
import { K_RETURN } from '../../runtime/prelude';
import { Layer } from '../../runtime/prelude';
import * as animations from '../../engine/animations';
import * as assets from '../../engine/assets';
import * as case_ from './case';
import * as characterid from './characterid';
import * as help from './help';
import * as merits from './merits';
import { open_browser } from '../../runtime/external';
import * as phase0 from './phase0';
import * as pygame from '../../runtime/prelude';
import * as serialization from '../data/serialization';
import { string } from '../../runtime/py';
import * as text from '../../engine/textutil';
import * as web from '../../runtime/web';

export let STATE_ROLLOVER_TIMER_KEY: any = "show_create_char_state_rollover";
export class MainMenu {
  constructor(stage: any) {
    this.stage = stage;
    this.main_layer = new Layer();
    this.create_layer = null;
    this.click_sound = stage.click_sound;
    this.rollover_sound = stage.rollover_sound;
    this.character_id = new characterid.CharacterId(this.rollover_sound);
    this.accents_translate_table = string.maketrans("\xe1\xe9\xed\xf3\xfa\xc1\xc9\xcd\xd3\xda", "aeiouAEIOU");
    return;
  }
  show_mainmenu(overlay: any, close_callback: any = null, apply_blind: any = true): any {
    this.overlay = overlay;
    this.close_callback = close_callback;
    this.update_added = false;
    this.deleted_characters = [];
    this.set_up_mainmenu();
    this.stage.show_dialog(this.main_layer, py.bind(this, "handle_event"), null);
    if ((this.current_character == null)) {
      this.show_create(null, false, null, true);
    }
    if (py.truthy(apply_blind)) {
      this.stage.blind_dialog(this.main_layer, animations.BlindDirection.SHOW_DOWN, false, [], py.bind(this, "show_mainmenu_callback"));
    } else {
      this.show_mainmenu_callback();
    }
    return null;
  }
  show_mainmenu_callback(layer: any = null): any {
    if ((this.create_layer != null)) {
      this.set_create_name_focus();
    }
    if (py.truthy(this.stage.game.update_manager.exists_update())) {
      this.notify_update_available(this.stage.game.update_manager.description);
    }
    return null;
  }
  close_mainmenu(): any {
    this.stage.blind_dialog(this.main_layer, BlindDirection.HIDE_UP, true, [], py.bind(this, "close_mainmenu_callback"));
    return null;
  }
  close_mainmenu_callback(layer: any): any {
    this.stage.close_dialog(this.main_layer);
    if ((this.close_callback != null)) {
      this.close_callback();
    }
    return null;
  }
  set_up_mainmenu(): any {
    let background_image, background_item, backtogame_normal_image, backtogame_rollover_image, credits_item, credits_normal_image, credits_rollover_image, exit_item, exit_normal_image, exit_rollover_image, help_item, help_normal_image, help_rollover_image, highscores_item, highscores_normal_image, highscores_rollover_image, play_normal_image, play_rollover_image, swapdetective_item, swapdetective_normal_image, swapdetective_rollover_image, welcome_image, welcome_item: any;
    background_image = assets.load_image("p0_mainmenu_mainback.jpg");
    background_item = new ItemImage(0, 0, background_image);
    py.m(this.main_layer, "add", background_item);
    this.current_character = this.get_active_character();
    this.character_id.set_up_id(this.main_layer, this.current_character, 120, 126, undefined, py.bind(this, "charid_click"));
    if (!py.truthy(this.overlay)) {
      welcome_image = assets.load_image("p0_mainmenu_title_welcome.png");
      welcome_item = new ItemImage(192, 113, welcome_image);
      py.m(this.main_layer, "add", welcome_item);
    }
    play_normal_image = assets.load_image("p0_mainmenu_btn_play_normal.png");
    play_rollover_image = assets.load_image("p0_mainmenu_btn_play_rollover.png");
    this.play_button = new ItemImage(237, 299, play_normal_image);
    this.play_button.set_rollover_image(play_rollover_image, this.rollover_sound);
    this.play_button.add_event_handler(ItemEvent.CLICK, py.bind(this, "play_click"));
    py.m(this.main_layer, "add", this.play_button);
    if (py.truthy(this.overlay)) {
      backtogame_normal_image = assets.load_image("p0_mainmenu_btn_backtogame_normal.png");
      backtogame_rollover_image = assets.load_image("p0_mainmenu_btn_backtogame_rollover.png");
      this.backtogame_button = new ItemImage(183, 302, backtogame_normal_image);
      this.backtogame_button.set_rollover_image(backtogame_rollover_image, this.rollover_sound);
      this.backtogame_button.add_event_handler(ItemEvent.CLICK, py.bind(this, "play_click"));
      py.m(this.main_layer, "add", this.backtogame_button);
      this.play_button.set_visible(false);
    }
    highscores_normal_image = assets.load_image("p0_mainmenu_btn_highscores_normal.png");
    highscores_rollover_image = assets.load_image("p0_mainmenu_btn_highscores_rollover.png");
    highscores_item = new ItemImage(11, 295, highscores_normal_image);
    highscores_item.set_rollover_image(highscores_rollover_image, this.rollover_sound);
    highscores_item.add_event_handler(ItemEvent.CLICK, py.bind(this, "highscores_click"));
    py.m(this.main_layer, "add", highscores_item);
    swapdetective_normal_image = assets.load_image("p0_mainmenu_btn_swapdetective_normal.png");
    swapdetective_rollover_image = assets.load_image("p0_mainmenu_btn_swapdetective_rollover.png");
    swapdetective_item = new ItemImage(465, 298, swapdetective_normal_image);
    swapdetective_item.set_rollover_image(swapdetective_rollover_image, this.rollover_sound);
    swapdetective_item.add_event_handler(ItemEvent.CLICK, py.bind(this, "swapdetective_click"));
    py.m(this.main_layer, "add", swapdetective_item);
    help_normal_image = assets.load_image("p0_mainmenu_btn_help_normal.png");
    help_rollover_image = assets.load_image("p0_mainmenu_btn_help_rollover.png");
    help_item = new ItemImage(135, 386, help_normal_image);
    help_item.set_rollover_image(help_rollover_image, this.rollover_sound);
    help_item.add_event_handler(ItemEvent.CLICK, py.bind(this, "help_click"));
    py.m(this.main_layer, "add", help_item);
    credits_normal_image = assets.load_image("p0_mainmenu_btn_credits_normal.png");
    credits_rollover_image = assets.load_image("p0_mainmenu_btn_credits_rollover.png");
    credits_item = new ItemImage(254, 385, credits_normal_image);
    credits_item.set_rollover_image(credits_rollover_image, this.rollover_sound);
    credits_item.add_event_handler(ItemEvent.CLICK, py.bind(this, "credits_click"));
    py.m(this.main_layer, "add", credits_item);
    exit_normal_image = assets.load_image("p0_mainmenu_btn_exit_normal.png");
    exit_rollover_image = assets.load_image("p0_mainmenu_btn_exit_rollover.png");
    exit_item = new ItemImage(375, 386, exit_normal_image);
    exit_item.set_rollover_image(exit_rollover_image, this.rollover_sound);
    exit_item.add_event_handler(ItemEvent.CLICK, py.bind(this, "exit_click"));
    py.m(this.main_layer, "add", exit_item);
    return null;
  }
  notify_update_available(description: any): any {
    let dismissed, update_normal_image, update_rollover_image: any;
    if (!py.truthy(this.update_added)) {
      update_normal_image = assets.load_image("p0_mainmenu_updater_btn_normal.png");
      update_rollover_image = assets.load_image("p0_mainmenu_updater_btn_rollover.png");
      this.updategame_item = new ItemImage(475, 15, update_normal_image);
      this.updategame_item.set_rollover_image(update_rollover_image, this.rollover_sound);
      this.updategame_item.add_event_handler(ItemEvent.CLICK, py.bind(this, "update_game_click"));
      this.update_description = description;
      this.update_added = true;
      dismissed = false;
      if (py.truthy(py.hasattr(this.stage.game, "updategame_dismissed"))) {
        dismissed = this.stage.game.updategame_dismissed;
      }
      if ((!py.truthy(this.overlay) && !py.truthy(dismissed))) {
        this.show_updategame();
      } else {
        py.m(this.main_layer, "add", this.updategame_item);
      }
    }
    return null;
  }
  set_up_swapdetective(): any {
    let back_item, back_normal_image, back_rollover_image, background_image, background_item, create_disabled_image, create_normal_image, create_rollover_image, delete_disabled_image, delete_normal_image, delete_rollover_image, font_13, select_disabled_image, select_normal_image, select_rollover_image, selector_rollover_image, selector_selected_image: any;
    this.swapdetective_layer = new Layer();
    background_image = assets.load_image("p0_mainmenu_swap_backdrop.png");
    background_item = new ItemImage(116, 26, background_image);
    py.m(this.swapdetective_layer, "add", background_item);
    this.swapdetective_font_14 = assets.load_font("evilgeniusbb_reg.ttf", 14);
    font_13 = assets.load_font("evilgeniusbb_bld.ttf", 13);
    selector_rollover_image = assets.load_image("p0_mainmenu_swap_selector_rollover.png");
    this.swapdetective_rollover_back_item = new ItemImage(0, 0, selector_rollover_image);
    this.swapdetective_rollover_back_item.set_visible(false);
    py.m(this.swapdetective_layer, "add", this.swapdetective_rollover_back_item);
    selector_selected_image = assets.load_image("p0_mainmenu_swap_selector_selected.png");
    this.swapdetective_selected_back_item = new ItemImage(0, 0, selector_selected_image);
    this.swapdetective_selected_back_item.set_visible(false);
    py.m(this.swapdetective_layer, "add", this.swapdetective_selected_back_item);
    this.swapdetective_selected_text_item = new ItemText(0, 0, font_13, 0, "", [117, 51, 12], null, 250, 20, 2, 1);
    this.swapdetective_selected_text_item.set_visible(false);
    py.m(this.swapdetective_layer, "add", this.swapdetective_selected_text_item);
    create_normal_image = assets.load_image("p0_mainmenu_btn_create_normal.png");
    create_rollover_image = assets.load_image("p0_mainmenu_btn_create_rollover.png");
    create_disabled_image = assets.load_image("p0_mainmenu_btn_create_inactive.png");
    this.create_button = new ItemImage(137, 355, create_normal_image);
    this.create_button.set_rollover_image(create_rollover_image, this.rollover_sound);
    this.create_button.add_event_handler(ItemEvent.CLICK, py.bind(this, "swapdetective_create_click"));
    py.m(this.swapdetective_layer, "add", this.create_button);
    this.create_button_disabled = new ItemImage(137, 355, create_disabled_image);
    this.create_button_disabled.set_visible(false);
    py.m(this.swapdetective_layer, "add", this.create_button_disabled);
    select_normal_image = assets.load_image("p0_mainmenu_btn_select_normal.png");
    select_rollover_image = assets.load_image("p0_mainmenu_btn_select_rollover.png");
    select_disabled_image = assets.load_image("p0_mainmenu_btn_select_inactive.png");
    this.select_button = new ItemImage(252, 355, select_normal_image);
    this.select_button.set_rollover_image(select_rollover_image, this.rollover_sound);
    this.select_button.add_event_handler(ItemEvent.CLICK, py.bind(this, "swapdetective_select_click"));
    py.m(this.swapdetective_layer, "add", this.select_button);
    this.select_button_disabled = new ItemImage(252, 355, select_disabled_image);
    this.select_button_disabled.set_visible(false);
    py.m(this.swapdetective_layer, "add", this.select_button_disabled);
    delete_normal_image = assets.load_image("p0_mainmenu_btn_delete_normal.png");
    delete_rollover_image = assets.load_image("p0_mainmenu_btn_delete_rollover.png");
    delete_disabled_image = assets.load_image("p0_mainmenu_btn_delete_inactive.png");
    this.delete_button = new ItemImage(374, 355, delete_normal_image);
    this.delete_button.set_rollover_image(delete_rollover_image, this.rollover_sound);
    this.delete_button.add_event_handler(ItemEvent.CLICK, py.bind(this, "swapdetective_delete_click"));
    py.m(this.swapdetective_layer, "add", this.delete_button);
    this.delete_button_disabled = new ItemImage(374, 355, delete_disabled_image);
    this.delete_button_disabled.set_visible(false);
    py.m(this.swapdetective_layer, "add", this.delete_button_disabled);
    back_normal_image = assets.load_image("p0_mainmenu_btn_back_normal.png");
    back_rollover_image = assets.load_image("p0_mainmenu_btn_back_rollover.png");
    back_item = new ItemImage(263, 401, back_normal_image);
    back_item.set_rollover_image(back_rollover_image, this.rollover_sound);
    back_item.add_event_handler(ItemEvent.CLICK, py.bind(this, "swapdetective_back_click"));
    py.m(this.swapdetective_layer, "add", back_item);
    this.swapdetective_selected = null;
    this.swapdetective_over_item = null;
    this.swapdetective_character_items = [];
    this.load_characters();
    return null;
  }
  load_characters(): any {
    let c, characters, default_selection, item, k, text_item, text_mask, y: any;
    for (item of py.iter(this.swapdetective_character_items)) {
      py.m(this.swapdetective_layer, "remove", item);
    }
    this.swapdetective_character_items = [];
    characters = py.slice(this.stage.game.datastore.characters, null, null);
    py.m(characters, "sort", undefined, py.bind(this, "get_character_name"));
    y = 113;
    default_selection = null;
    k = 0;
    for (c of py.iter(characters)) {
      text_item = new ItemText(175, y, this.swapdetective_font_14, 0, c.name, [73, 72, 54], null, 250, 20, 2, 1);
      py.m(this.swapdetective_layer, "add", text_item);
      py.m(this.swapdetective_character_items, "append", text_item);
      text_mask = new ItemMask(175, (y - 4), [250, 25]);
      text_mask.charinfo = c;
      text_mask.text_item = text_item;
      text_mask.add_event_handler(ItemEvent.MOUSE_ENTER, py.bind(this, "swapdetective_item_enter"));
      text_mask.add_event_handler(ItemEvent.MOUSE_LEAVE, py.bind(this, "swapdetective_item_leave"));
      text_mask.add_event_handler(ItemEvent.CLICK, py.bind(this, "swapdetective_item_click"));
      py.m(this.swapdetective_layer, "add", text_mask);
      py.m(this.swapdetective_character_items, "append", text_mask);
      if (((this.current_character != null) && py.eq(c.id, this.current_character.id))) {
        default_selection = text_mask;
      }
      y = y + 28;
      k = k + 1;
    }
    this.set_swapdetective_selected(default_selection);
    this.update_swapdetective_buttons();
    return null;
  }
  update_swapdetective_buttons(): any {
    let characters, k: any;
    characters = py.slice(this.stage.game.datastore.characters, null, null);
    k = py.len(characters);
    if ((k >= 8)) {
      this.create_button.set_visible(false);
      this.create_button_disabled.set_visible(true);
    } else {
      this.create_button.set_visible(true);
      this.create_button_disabled.set_visible(false);
    }
    if (((k === 0) || (this.swapdetective_selected == null))) {
      this.select_button.set_visible(false);
      this.select_button_disabled.set_visible(true);
      this.delete_button.set_visible(false);
      this.delete_button_disabled.set_visible(true);
    } else {
      this.select_button.set_visible(true);
      this.select_button_disabled.set_visible(false);
      this.delete_button.set_visible(true);
      this.delete_button_disabled.set_visible(false);
    }
    return null;
  }
  set_up_create(): any {
    let accept_disabled_image, accept_normal_image, accept_rollover_image, background_image, background_item, box_image, box_item, cancel_item, cancel_normal_image, cancel_rollover_image, character_name_mask, character_state_mask, female_mask, font_14, male_mask, sex_check_image, state_rollover_image: any;
    this.create_layer = new Layer();
    background_image = assets.load_image("p0_mainmenu_swap_new_backdrop.png");
    background_item = new ItemImage(116, 26, background_image);
    py.m(this.create_layer, "add", background_item);
    font_14 = assets.load_font("evilgeniusbb_reg.ttf", 14);
    this.create_flip_sound = assets.load_sound("GUI_Flip.ogg");
    this.create_name_item = new ItemText(232, 105, font_14, 0, "", [0, 0, 0], null, 200, 18, 2, 1);
    this.create_name_item.set_watermark_text("INGRESE AQU\xcd SU NOMBRE");
    this.create_name_item.set_editable(true, py.bind(this, "create_name_keypressed"));
    this.create_name_item.set_max_chars(30);
    py.m(this.create_layer, "add", this.create_name_item);
    character_name_mask = new ItemMask(224, 103, [216, 19]);
    py.m(this.create_layer, "add", character_name_mask);
    this.create_name_item.set_edit_on_click(character_name_mask);
    character_state_mask = new ItemMask(263, 128, [178, 19]);
    state_rollover_image = assets.load_image("p0_mainmenu_btn_state_rollover.png");
    character_state_mask.set_rollover(state_rollover_image, this.rollover_sound, 0, (-1));
    character_state_mask.add_event_handler(ItemEvent.CLICK, py.bind(this, "create_state_click"));
    py.m(this.create_layer, "add", character_state_mask);
    this.character_state_item = new ItemText(265, 130, font_14, 0, "", [0, 0, 0], null, 170, 18, 2, 1);
    py.m(this.create_layer, "add", this.character_state_item);
    male_mask = new ItemMask(311, 162, [17, 15]);
    male_mask.add_event_handler(ItemEvent.CLICK, py.bind(this, "create_male_click"));
    py.m(this.create_layer, "add", male_mask);
    female_mask = new ItemMask(397, 162, [17, 15]);
    female_mask.add_event_handler(ItemEvent.CLICK, py.bind(this, "create_female_click"));
    py.m(this.create_layer, "add", female_mask);
    sex_check_image = assets.load_image("p0_mainmenu_swap_new_check.png");
    this.create_sex_check_item = new ItemImage(313, 156, sex_check_image);
    py.m(this.create_layer, "add", this.create_sex_check_item);
    this.create_avatar_item = new ItemImage(242, 208, null);
    py.m(this.create_layer, "add", this.create_avatar_item);
    box_image = assets.load_image("p0_merits_main_id_box.png");
    box_item = new ItemImage(237, 203, box_image);
    py.m(this.create_layer, "add", box_item);
    this.right_arrow_normal_image = assets.load_image("p0_mainmenu_swap_new_arrow_normal.png");
    this.right_arrow_rollover_image = assets.load_image("p0_mainmenu_swap_new_arrow_rollover.png");
    this.right_arrow_clicked_image = assets.load_image("p0_mainmenu_swap_new_arrow_clicked.png");
    this.create_right_arrow_item = new ItemImage(360, 255, this.right_arrow_normal_image);
    this.create_right_arrow_state = 0;
    this.create_right_arrow_item.add_event_handler(ItemEvent.MOUSE_ENTER, py.bind(this, "create_next_avatar_enter"));
    this.create_right_arrow_item.add_event_handler(ItemEvent.MOUSE_LEAVE, py.bind(this, "create_next_avatar_leave"));
    this.create_right_arrow_item.add_event_handler(ItemEvent.CLICK, py.bind(this, "create_next_avatar_click"));
    py.m(this.create_layer, "add", this.create_right_arrow_item);
    this.left_arrow_normal_image = this.right_arrow_normal_image.flip_h_copy();
    this.left_arrow_rollover_image = this.right_arrow_rollover_image.flip_h_copy();
    this.left_arrow_clicked_image = this.right_arrow_clicked_image.flip_h_copy();
    this.create_left_arrow_item = new ItemImage(207, 255, this.left_arrow_normal_image);
    this.create_left_arrow_state = 0;
    this.create_left_arrow_item.add_event_handler(ItemEvent.MOUSE_ENTER, py.bind(this, "create_previous_avatar_enter"));
    this.create_left_arrow_item.add_event_handler(ItemEvent.MOUSE_LEAVE, py.bind(this, "create_previous_avatar_leave"));
    this.create_left_arrow_item.add_event_handler(ItemEvent.CLICK, py.bind(this, "create_previous_avatar_click"));
    py.m(this.create_layer, "add", this.create_left_arrow_item);
    accept_normal_image = assets.load_image("p0_mainmenu_btn_accept_normal.png");
    accept_rollover_image = assets.load_image("p0_mainmenu_btn_accept_rollover.png");
    accept_disabled_image = assets.load_image("p0_mainmenu_btn_accept_inactive.png");
    this.accept_button = new ItemImage(202, 369, accept_normal_image);
    this.accept_button.set_rollover_image(accept_rollover_image, this.rollover_sound);
    this.accept_button.add_event_handler(ItemEvent.CLICK, py.bind(this, "create_accept_click"));
    py.m(this.create_layer, "add", this.accept_button);
    this.accept_button_disabled = new ItemImage(202, 369, accept_disabled_image);
    this.accept_button_disabled.set_visible(false);
    py.m(this.create_layer, "add", this.accept_button_disabled);
    cancel_normal_image = assets.load_image("p0_mainmenu_btn_cancel_normal.png");
    cancel_rollover_image = assets.load_image("p0_mainmenu_btn_cancel_rollover.png");
    cancel_item = new ItemImage(306, 369, cancel_normal_image);
    cancel_item.set_rollover_image(cancel_rollover_image, this.rollover_sound);
    cancel_item.add_event_handler(ItemEvent.CLICK, py.bind(this, "create_cancel_click"));
    py.m(this.create_layer, "add", cancel_item);
    this.create_sex_male = true;
    this.create_character_location = "";
    this.create_avatar_count = 4;
    this.create_avatar = 1;
    this.update_create_sex_mark();
    this.update_create_avatar_image();
    this.update_create_accept();
    return null;
  }
  set_up_state_list(): any {
    let background_image, background_item, dep, dep_y, departments, i, mask, state_rollover_image, y: any;
    this.state_list_layer = new Layer();
    background_image = assets.load_image("p0_mainmenu_swap_new_stateselector_backdrop.png");
    background_item = new ItemImage(166, 17, background_image);
    py.m(this.state_list_layer, "add", background_item);
    departments = py.slice(this.stage.game.datastore.list_departments, null, null);
    py.m(departments, "sort", undefined, py.bind(this, "get_department_name"));
    state_rollover_image = assets.load_image("p0_mainmenu_swap_new_stateselector_rollover.png");
    this.create_state_rollover_item = new ItemImage(179, 0, state_rollover_image);
    this.create_state_rollover_item.set_visible(false);
    py.m(this.state_list_layer, "add", this.create_state_rollover_item);
    y = 59;
    dep_y = [58, 76, 94, 112, 130, 148, 166, 184, 202, 220, 238, 256, 273, 292, 310, 328, 346, 364, 382];
    for (i of py.range(py.len(departments))) {
      dep = py.getitem(departments, i);
      mask = new ItemMask(179, py.getitem(dep_y, i), state_rollover_image.get_size());
      mask.add_event_handler(ItemEvent.MOUSE_ENTER, py.bind(this, "create_department_enter"));
      mask.add_event_handler(ItemEvent.MOUSE_LEAVE, py.bind(this, "create_department_leave"));
      mask.add_event_handler(ItemEvent.CLICK, py.bind(this, "create_department_click"));
      mask.department = dep;
      py.m(this.state_list_layer, "add", mask);
      y = y + 17;
    }
    return null;
  }
  update_create_sex_mark(): any {
    if (py.truthy(this.create_sex_male)) {
      this.create_sex_check_item.set_left(313);
    } else {
      this.create_sex_check_item.set_left(399);
    }
    return null;
  }
  update_create_avatar_image(): any {
    let image: any;
    if (py.truthy(this.create_sex_male)) {
      image = assets.load_image(py.add(py.add("p0_detective_male_", py.fmt("%03d", this.create_avatar)), "_id.jpg"));
    } else {
      image = assets.load_image(py.add(py.add("p0_detective_female_", py.fmt("%03d", this.create_avatar)), "_id.jpg"));
    }
    this.create_avatar_item.set_image(image);
    this.create_left_arrow_item.set_visible((this.create_avatar > 1));
    this.create_right_arrow_item.set_visible((this.create_avatar < this.create_avatar_count));
    return null;
  }
  set_up_delete(charinfo: any): any {
    let background_image, background_item, charid, font_14, message, no_item, no_normal_image, no_rollover_image, question_item, yes_item, yes_normal_image, yes_rollover_image: any;
    this.delete_layer = new Layer();
    background_image = assets.load_image("p0_mainmenu_swap_del_backdrop.png");
    background_item = new ItemImage(150, 24, background_image);
    py.m(this.delete_layer, "add", background_item);
    font_14 = assets.load_font("evilgeniusbb_reg.ttf", 14);
    message = "\xbfEST\xc1 SEGURO QUE DESEA ELIMINAR ESTE DETECTIVE? TODO EL PROGRESO GUARDADO SE PERDER\xc1";
    question_item = new ItemText(168, 91, font_14, 13, message, [153, 0, 0], null, 268, 52, 2, 1);
    py.m(this.delete_layer, "add", question_item);
    charid = new characterid.CharacterId();
    charid.set_up_id(this.delete_layer, charinfo, 123, 147);
    yes_normal_image = assets.load_image("p0_mainmenu_btn_yes_normal.png");
    yes_rollover_image = assets.load_image("p0_mainmenu_btn_yes_rollover.png");
    yes_item = new ItemImage(222, 372, yes_normal_image);
    yes_item.set_rollover_image(yes_rollover_image, this.rollover_sound);
    yes_item.add_event_handler(ItemEvent.CLICK, py.bind(this, "delete_yes_click"));
    py.m(this.delete_layer, "add", yes_item);
    no_normal_image = assets.load_image("p0_mainmenu_btn_no_normal.png");
    no_rollover_image = assets.load_image("p0_mainmenu_btn_no_rollover.png");
    no_item = new ItemImage(304, 372, no_normal_image);
    no_item.set_rollover_image(no_rollover_image, this.rollover_sound);
    no_item.add_event_handler(ItemEvent.CLICK, py.bind(this, "delete_no_click"));
    py.m(this.delete_layer, "add", no_item);
    return null;
  }
  charid_click(item: any, args: any): any {
    let merits_dialog: any;
    this.stage.render();
    this.click_sound.play();
    this.load_character_progress();
    merits_dialog = new merits.Merits(this.stage);
    merits_dialog.show_merits(false);
    return null;
  }
  load_character_progress(): any {
    let datastore: any;
    datastore = this.stage.game.datastore;
    if (((datastore.user_character == null) || !py.eq(datastore.user_character.charinfo.id, this.current_character.id))) {
      datastore.load_character(this.current_character);
    }
    return null;
  }
  get_character_name(char_info: any): any {
    return this.remove_accents_and_upper(char_info.name);
  }
  get_department_name(dep: any): any {
    return this.remove_accents_and_upper(dep.name);
  }
  remove_accents_and_upper(text: any): any {
    return py.m(text.translate(this.accents_translate_table), "upper");
  }
  swapdetective_item_enter(item: any, args: any): any {
    this.set_swapdetective_rollover_over(item);
    return null;
  }
  swapdetective_item_leave(item: any, args: any): any {
    this.set_swapdetective_rollover_over(null);
    return null;
  }
  swapdetective_item_click(item: any, args: any): any {
    this.stage.render();
    this.click_sound.play();
    this.set_swapdetective_selected(item);
    return null;
  }
  set_swapdetective_rollover_over(item: any): any {
    if (!py.eq(this.swapdetective_over_item, item)) {
      if ((item == null)) {
        this.swapdetective_rollover_back_item.set_visible(false);
      } else {
        this.swapdetective_rollover_back_item.set_left(item.get_left());
        this.swapdetective_rollover_back_item.set_top(item.get_top());
        this.swapdetective_rollover_back_item.set_visible(true);
      }
      this.swapdetective_over_item = item;
    }
    return null;
  }
  set_swapdetective_selected(item: any): any {
    if (!py.eq(this.swapdetective_selected, item)) {
      if ((item == null)) {
        this.swapdetective_selected_back_item.set_visible(false);
        this.swapdetective_selected_text_item.set_visible(false);
      } else {
        this.swapdetective_selected_back_item.set_left((item.get_left() - 16));
        this.swapdetective_selected_back_item.set_top((item.get_top() - 5));
        this.swapdetective_selected_back_item.set_visible(true);
        this.swapdetective_selected_text_item.set_left(item.get_left());
        this.swapdetective_selected_text_item.set_top(py.add(item.get_top(), 3));
        this.swapdetective_selected_text_item.set_text(item.charinfo.name);
        this.swapdetective_selected_text_item.set_visible(true);
        item.text_item.set_visible(false);
      }
      if ((this.swapdetective_selected != null)) {
        this.swapdetective_selected.text_item.set_visible(true);
      }
      this.swapdetective_selected = item;
    }
    this.update_swapdetective_buttons();
    return null;
  }
  set_up_credits(): any {
    let background_image, background_item, close_item, close_normal_image, close_rollover_image, next_normal_image, next_rollover_image, prev_normal_image, prev_rollover_image: any;
    this.credits_layer = new Layer();
    background_image = assets.load_image("p0_credits_background.jpg");
    background_item = new ItemImage(0, 0, background_image);
    py.m(this.credits_layer, "add", background_item);
    close_normal_image = assets.load_image("p0_tutorial_remake_btn_close_normal.png");
    close_rollover_image = assets.load_image("p0_tutorial_remake_btn_close_rollover.png");
    close_item = new ItemImage(267, 393, close_normal_image);
    close_item.set_rollover_image(close_rollover_image, this.rollover_sound);
    close_item.add_event_handler(ItemEvent.CLICK, py.bind(this, "credits_close_click"));
    py.m(this.credits_layer, "add", close_item);
    prev_normal_image = assets.load_image("p0_tutorial_remake_btn_prev_normal.png");
    prev_rollover_image = assets.load_image("p0_tutorial_remake_btn_prev_rollover.png");
    this.credits_prev_item = new ItemImage(235, 398, prev_normal_image);
    this.credits_prev_item.set_rollover_image(prev_rollover_image, this.rollover_sound);
    this.credits_prev_item.add_event_handler(ItemEvent.CLICK, py.bind(this, "credits_prev_click"));
    py.m(this.credits_layer, "add", this.credits_prev_item);
    next_normal_image = assets.load_image("p0_tutorial_remake_btn_next_normal.png");
    next_rollover_image = assets.load_image("p0_tutorial_remake_btn_next_rollover.png");
    this.credits_next_item = new ItemImage(354, 399, next_normal_image);
    this.credits_next_item.set_rollover_image(next_rollover_image, this.rollover_sound);
    this.credits_next_item.add_event_handler(ItemEvent.CLICK, py.bind(this, "credits_next_click"));
    py.m(this.credits_layer, "add", this.credits_next_item);
    this.credits_font_30 = assets.load_font("turkey.ttf", 30);
    this.credits_font_24 = assets.load_font("turkey.ttf", 24);
    this.credits_font_20 = assets.load_font("turkey.ttf", 20);
    this.credits_font_18 = assets.load_font("turkey.ttf", 18);
    this.credits_font_16 = assets.load_font("turkey.ttf", 16);
    this.credits_font_12 = assets.load_font("turkey.ttf", 12);
    this.credits_people_layer = new Layer();
    this.credits_people_layer_old = null;
    this.credits_page = 1;
    this.credits_pagecount = 7;
    return null;
  }
  load_current_credits(apply_effect: any = true): any {
    let additional_fonts, area, column, column_width, footer, footer_height, footer_width, footer_x, footer_y, header, header_height, header_separation, header_width, header_x, header_y, height, item, line_separation, shadow, shadow_text, small_line_font, small_line_height, text, text_font, title_font, top_margin, x, y: any;
    header = null;
    footer = null;
    line_separation = 30;
    small_line_font = null;
    small_line_height = 0;
    if ((this.credits_page === 1)) {
      top_margin = 10;
      title_font = this.credits_font_30;
      text_font = this.credits_font_24;
      small_line_font = this.credits_font_16;
      small_line_height = 24;
      text = [py.add(py.add(py.add(py.add(py.add(py.add(py.add("&#c223,0,0!&#f:t!DISE\xd1O DE JUEGO:&#c!&#f!\n", "MART\xcdN DA SILVEIRA\n"), "&#f:s! \n&#f!"), "&#c223,0,0!&#f:t!ARTE:&#c!&#f!\n"), "FERNANDO PIC\xdaN\n"), "&#f:s! \n&#f!"), "&#c223,0,0!&#f:t!M\xdaSICA Y SONIDO:&#c!&#f!\n"), "MART\xcdN DA SILVEIRA\n"), py.add(py.add(py.add(py.add(py.add(py.add("&#c223,0,0!&#f:t!PROGRAMACI\xd3N:&#c!&#f!\n", "NICOL\xc1S CASTAGNET\n"), "JUAN PABLO AYALA\n"), "FELIPE OTAMENDI\n\n"), "&#c223,0,0!&#f:t!PRODUCCI\xd3N:&#c!&#f!\n"), "MARIANO DE LARROBLA\n"), "CARMEN FERNANDEZ\n")];
    } else if ((this.credits_page === 2)) {
      top_margin = 70;
      title_font = this.credits_font_24;
      text_font = this.credits_font_20;
      small_line_font = this.credits_font_16;
      small_line_height = 7;
      text = [py.add(py.add(py.add("&#c223,0,0!&#f:t!ASESORAMIENTO PEDAG\xd3GICO:&#c!&#f!\n", "&#f:s! \n&#f!"), "ANDR\xc9S COPES\n"), "WANDA SPINELLI\n"), py.add(py.add("&#c223,0,0!&#f:t!CORRECCI\xd3N DE TEXTOS:&#c!&#f!\n", "&#f:s! \n&#f!"), "LETICIA CHIFFLET\n"), py.add(py.add(py.add("&#c223,0,0!&#f:t!EQUIPO DE TESTING:&#c!&#f!\n", "&#f:s! \n&#f!"), "EUGENIA DE LARROBLA\n"), "GABRIELA CONZE\n")];
    } else if ((this.credits_page === 3)) {
      top_margin = 38;
      title_font = this.credits_font_24;
      text_font = this.credits_font_16;
      line_separation = 23;
      header_separation = 44;
      header = "&#c223,0,0!&#f:t!BETA TESTERS:&#c!&#f!\n";
      text = [py.add(py.add(py.add(py.add(py.add(py.add(py.add(py.add(py.add(py.add("ADRI\xc1N KIRCHNITZ\n", "AGUST\xcdN RAMASCO\n"), "AGUSTINA ALVAREZ\n"), "AGUSTINA CHALKLING\n"), "ALEJANDRO GONZ\xc1LEZ\n"), "ALEJO PIREZ\n"), "ALEXANDER ACEVEDO\n"), "ALVARO GARC\xcdA BARBIERI\n"), "ANDREA FERRERO PEREIRA\n"), "ANGEL MAT\xcdAS FERRARI SU\xc1REZ\n"), "ANTONELLA ECHEVESTE PALOMEQUE\n"), py.add(py.add(py.add(py.add(py.add(py.add(py.add(py.add(py.add(py.add("BIANCA MARCHESONI\n", "BIANCA LEGUIZAM\xd3N\n"), "BRAHIAN RAMIRO GHISOLFO RAMOS\n"), "BRUNO LEEMAN\n"), "CRISTIAN ALMADA\n"), "DANIEL FIGUEREDO\n"), "DIEGO FERNANDO NELCIS PIRIZ\n"), "DIEGO HERN\xc1NDEZ\n"), "DIEGO PIEGAS\n"), "EMILIANO PIC\xdaN\n"), "ENZO FAGUNDEZ\n")];
    } else if ((this.credits_page === 4)) {
      top_margin = 38;
      title_font = this.credits_font_24;
      text_font = this.credits_font_16;
      line_separation = 23;
      header_separation = 44;
      header = "&#c223,0,0!&#f:t!BETA TESTERS:&#c!&#f!\n";
      text = [py.add(py.add(py.add(py.add(py.add(py.add(py.add(py.add(py.add(py.add("ERIC MORDEZKI\n", "ESTEFANI CA\xd1ETE\n"), "EZEQUIEL CABRERA\n"), "FABRIZZIO OVIEDO\n"), "FEDERICO M\xc9NDEZ\n"), "FELIPE DA SILVEIRA\n"), "FIORELLA TORRES\n"), "GABRIEL CURTI\n"), "GABRIELA DENISE G\xd3MEZ MEDINA\n"), "GONZALO DE SOSA\n"), "GUIDA\xcd BLENGINI\n"), py.add(py.add(py.add(py.add(py.add(py.add(py.add(py.add(py.add(py.add("GUILLERMO GARC\xcdA BARBIERI\n", "GUILLERMO MORDEZKI\n"), "JAVIER SINTES\n"), "JOAQU\xcdN D\xcdAZ\n"), "JOS\xc9 IGNACIO GALATTI\n"), "JUAN I. CROSA\n"), "JUAN IGNACIO MEDINA CRUZ\n"), "JUAN IGNACIO VALLE\n"), "JUAN MANUEL VALLE\n"), "JUAN SEBASTI\xc1N MART\xcdNEZ APLANALP\n"), "JULIA DE LE\xd3N\n")];
    } else if ((this.credits_page === 5)) {
      top_margin = 38;
      title_font = this.credits_font_24;
      text_font = this.credits_font_16;
      line_separation = 23;
      header_separation = 44;
      header = "&#c223,0,0!&#f:t!BETA TESTERS:&#c!&#f!\n";
      text = [py.add(py.add(py.add(py.add(py.add(py.add(py.add(py.add(py.add(py.add("JULIA PISSANO\n", "LARA CONSANI\n"), "LAURA BEL\xc9N VEGA AYALA\n"), "LINET JOANA ALTAMIRANDA DA SILVA\n"), "LUANA PIREZ\n"), "LUCAS GENOLET\n"), "LUCAS MATTOS\n"), "LUC\xcdA CABRERA\n"), "MAIKEL PEREYRA\n"), "MAR\xcdA EUGENIA DE SOUZA\n"), "MAT\xcdAS IBARRA\n"), py.add(py.add(py.add(py.add(py.add(py.add(py.add(py.add(py.add(py.add("MAURICIO SILVA\n", "MAURO CAUTERUCCIO\n"), "MICAELA ALMADA Z\xc1RATE\n"), "MILENA Z\xc1RATE MELGAREJO\n"), "MILTON AYALA SANTOS\n"), "NAHUEL ROMERO\n"), "ORIANA MONTA\xd1A\n"), "PABLO SOSA\n"), "PAULA GARC\xcdA\n"), "PILAR M\xc9NDEZ\n"), "RENZO CAUTERUCCIO\n")];
    } else if ((this.credits_page === 6)) {
      top_margin = 38;
      title_font = this.credits_font_24;
      text_font = this.credits_font_16;
      line_separation = 23;
      header_separation = 44;
      footer_y = 301;
      header = "&#c223,0,0!&#f:t!BETA TESTERS:&#c!&#f!\n";
      footer = "&#c223,0,0!&#f:t!\xa1MUCHAS GRACIAS A TODOS!&#c!&#f!\n";
      text = [py.add(py.add(py.add(py.add("ROC\xcdO CAMILA CURTI MAWAD\n", "SANTIAGO NICOL\xc1S PR\xd3SPER VEINZ\n"), "SANTIAGO QUIJANO\n"), "SERGIO DANIEL GARC\xcdA SIERRA\n"), "SOF\xcdA GASPERI\n"), py.add(py.add(py.add(py.add("SOF\xcdA PIEDRA CUEVA\n", "TATIANA PIREZ\n"), "TOLENTINO G\xd3MEZ\n"), "VALENTINA GONZ\xc1LEZ\n"), "WINSTON SANTOS\n")];
    } else if ((this.credits_page === 7)) {
      top_margin = 36;
      title_font = this.credits_font_24;
      text_font = this.credits_font_18;
      line_separation = 24;
      header_separation = 42;
      header = "&#c223,0,0!&#f:t!AGRADECIMIENTOS:&#c!&#f!\n";
      text = [py.add(py.add(py.add(py.add(py.add(py.add(py.add(py.add(py.add("DCA\nINGENIO\n", "PROYECTO RAYUELA\n"), "FUNDACI\xd3N \"LOS PINOS\"\n"), "ANAIN\xc9S ZIGNAGO\n"), "JOHN MARTZ\n"), "MART\xcdN P\xc9REZ\n"), "RAFAEL GARC\xcdA\n"), "SHIRLEY SIRI\n"), "CARLOS DA SILVEIRA\n"), "DIEGO L\xd3PEZ D'ALESSANDRO\n"), py.add(py.add(py.add(py.add(py.add(py.add(py.add(py.add(py.add("JUAN PABLO PIS\xd3N\n", "LILIANA BARDALLO\n"), "MARIANA GIL SALABERRY\n"), "MART\xcdN CHAPARRO\n"), "MART\xcdN LOSK\xcdN\n"), "ZZ\n"), "CHAIM GINGOLD\n"), "ELI BARNETT\n"), "FERNANDO SANSBERRO\n"), "ROBIN HUNICKE")];
    }
    if ((this.credits_people_layer_old != null)) {
      this.stage.remove_layer(this.credits_people_layer_old);
    }
    this.credits_people_layer_old = this.credits_people_layer;
    this.credits_people_layer = new Layer();
    x = 7;
    y = py.add(81, top_margin);
    column_width = py.div(585, py.len(text));
    height = 295;
    additional_fonts = py.mkdict([["t", [title_font, 0]]]);
    if ((small_line_font != null)) {
      py.setitem(additional_fonts, "s", [small_line_font, small_line_height]);
    }
    if ((header != null)) {
      header_x = 7;
      header_y = (py.add(81, top_margin) - header_separation);
      header_width = 585;
      header_height = 30;
      shadow_text = py.m(header, "replace", "&#c223,", "&#c0,");
      shadow = new ItemText(py.add(header_x, 2), py.add(header_y, 3), text_font, 30, shadow_text, [0, 0, 0], null, header_width, header_height, 2, 1, additional_fonts);
      py.m(this.credits_people_layer, "add", shadow);
      item = new ItemText(header_x, header_y, text_font, 30, header, [255, 255, 255], null, header_width, header_height, 2, 1, additional_fonts);
      py.m(this.credits_people_layer, "add", item);
    }
    if ((footer != null)) {
      footer_x = 7;
      footer_width = 585;
      footer_height = 30;
      shadow_text = py.m(footer, "replace", "&#c223,", "&#c0,");
      shadow = new ItemText(py.add(footer_x, 2), py.add(footer_y, 3), text_font, 30, shadow_text, [0, 0, 0], null, footer_width, footer_height, 2, 1, additional_fonts);
      py.m(this.credits_people_layer, "add", shadow);
      item = new ItemText(footer_x, footer_y, text_font, 30, footer, [255, 255, 255], null, footer_width, footer_height, 2, 1, additional_fonts);
      py.m(this.credits_people_layer, "add", item);
    }
    for (column of py.iter(text)) {
      shadow_text = py.m(column, "replace", "&#c223,", "&#c0,");
      shadow = new ItemText(py.add(x, 2), py.add(y, 3), text_font, line_separation, shadow_text, [0, 0, 0], null, (column_width - 5), height, 2, 1, additional_fonts);
      py.m(this.credits_people_layer, "add", shadow);
      item = new ItemText(x, y, text_font, line_separation, column, [255, 255, 255], null, (column_width - 5), height, 2, 1, additional_fonts);
      py.m(this.credits_people_layer, "add", item);
      x = py.add(x, column_width);
    }
    this.stage.add_layer(this.credits_people_layer);
    if (py.truthy(apply_effect)) {
      area = new pygame.Rect(0, 40, 0, 362);
      animations.stop_blind_layer(this.credits_people_layer_old);
      animations.stop_blind_layer(this.credits_people_layer);
      this.credits_people_layer_old.set_clip(null);
      this.credits_people_layer.set_clip(null);
      animations.blind_layer(this.credits_people_layer_old, animations.BlindDirection.HIDE_DOWN, area, 400, null, false);
      animations.blind_layer(this.credits_people_layer, animations.BlindDirection.SHOW_DOWN, area, 400, null, false);
    } else {
      this.stage.remove_layer(this.credits_people_layer_old);
    }
    this.credits_prev_item.set_visible((this.credits_page > 1));
    this.credits_next_item.set_visible((this.credits_page < this.credits_pagecount));
    return null;
  }
  set_up_exit(): any {
    let background_image, background_item, font_13, font_14, no_item, no_normal_image, no_rollover_image, text1, text2, yes_item, yes_normal_image, yes_rollover_image: any;
    this.exit_layer = new Layer();
    background_image = assets.load_image("p0_mainmenu_exit_backdrop.png");
    background_item = new ItemImage(132, 77, background_image);
    py.m(this.exit_layer, "add", background_item);
    yes_normal_image = assets.load_image("p0_mainmenu_btn_yes_normal.png");
    yes_rollover_image = assets.load_image("p0_mainmenu_btn_yes_rollover.png");
    yes_item = new ItemImage(221, 228, yes_normal_image);
    yes_item.set_rollover_image(yes_rollover_image, this.rollover_sound);
    yes_item.add_event_handler(ItemEvent.CLICK, py.bind(this, "exit_yes_click"));
    py.m(this.exit_layer, "add", yes_item);
    no_normal_image = assets.load_image("p0_mainmenu_btn_no_normal.png");
    no_rollover_image = assets.load_image("p0_mainmenu_btn_no_rollover.png");
    no_item = new ItemImage(303, 228, no_normal_image);
    no_item.set_rollover_image(no_rollover_image, this.rollover_sound);
    no_item.add_event_handler(ItemEvent.CLICK, py.bind(this, "exit_no_click"));
    py.m(this.exit_layer, "add", no_item);
    font_14 = assets.load_font("evilgeniusbb_reg.ttf", 14);
    font_13 = assets.load_font("evilgeniusbb_bld.ttf", 13);
    text1 = new ItemText(167, 150, font_14, 13, "\xbfEST\xc1 SEGURO QUE DESEA\nSALIR DEL JUEGO?", [153, 0, 0], null, 268, 30, 2, 1);
    py.m(this.exit_layer, "add", text1);
    text2 = new ItemText(161, 193, font_13, 13, "- SU PROGRESO QUEDAR\xc1 GUARDADO -", [0, 0, 0], null, 278, 23, 2, 1);
    py.m(this.exit_layer, "add", text2);
    return null;
  }
  get_active_character(): any {
    let c, datastore: any;
    datastore = this.stage.game.datastore;
    for (c of py.iter(datastore.characters)) {
      if (py.truthy(c.active)) {
        return c;
      }
    }
    if ((py.len(datastore.characters) > 0)) {
      return py.getitem(datastore.characters, 0);
    } else {
      return null;
    }
  }
  update_game_click(item: any, args: any): any {
    this.stage.render();
    this.click_sound.play();
    this.show_updategame();
    return null;
  }
  set_up_updategame(): any {
    let background_image, background_item, font_14, install_text_text, no_item, no_normal_image, no_rollover_image, selector_rollover_image, update_available_text, update_description_text, yes_item, yes_normal_image, yes_rollover_image: any;
    this.updategame_layer = new Layer();
    background_image = assets.load_image("p0_mainmenu_updater_backdrop.png");
    background_item = new ItemImage(120, 47, background_image);
    py.m(this.updategame_layer, "add", background_item);
    font_14 = assets.load_font("evilgeniusbb_reg.ttf", 14);
    update_available_text = new ItemText(167, 117, font_14, 13, "Hay actualizaciones disponibles.", [153, 0, 0], null, 265, 30, 2, 1);
    py.m(this.updategame_layer, "add", update_available_text);
    update_description_text = new ItemText(155, 137, font_14, 13, this.update_description, [0, 0, 0], null, 289, 129, 2, 2);
    py.m(this.updategame_layer, "add", update_description_text);
    install_text_text = new ItemText(167, 279, font_14, 13, "Para instalarlas,\ndebe salir del juego.\n\nSu progreso quedar\xe1 guardado.", [153, 0, 0], null, 265, 55, 2, 1);
    py.m(this.updategame_layer, "add", install_text_text);
    selector_rollover_image = assets.load_image("p0_mainmenu_swap_selector_rollover.png");
    this.swapdetective_rollover_back_item = new ItemImage(0, 0, selector_rollover_image);
    this.swapdetective_rollover_back_item.set_visible(false);
    py.m(this.updategame_layer, "add", this.swapdetective_rollover_back_item);
    yes_normal_image = assets.load_image("p0_mainmenu_btn_yes_normal.png");
    yes_rollover_image = assets.load_image("p0_mainmenu_btn_yes_rollover.png");
    yes_item = new ItemImage(221, 361, yes_normal_image);
    yes_item.set_rollover_image(yes_rollover_image, this.rollover_sound);
    yes_item.add_event_handler(ItemEvent.CLICK, py.bind(this, "updategame_yes_click"));
    py.m(this.updategame_layer, "add", yes_item);
    no_normal_image = assets.load_image("p0_mainmenu_btn_no_normal.png");
    no_rollover_image = assets.load_image("p0_mainmenu_btn_no_rollover.png");
    no_item = new ItemImage(303, 361, no_normal_image);
    no_item.set_rollover_image(no_rollover_image, this.rollover_sound);
    no_item.add_event_handler(ItemEvent.CLICK, py.bind(this, "updategame_no_click"));
    py.m(this.updategame_layer, "add", no_item);
    return null;
  }
  updategame_yes_click(item: any, args: any): any {
    this.stage.render();
    this.click_sound.play();
    this.stage.game.update_manager.execute_update();
    this.stage.game.quit();
    return null;
  }
  updategame_no_click(item: any, args: any): any {
    this.stage.render();
    this.click_sound.play();
    this.stage.game.updategame_dismissed = true;
    this.close_updategame();
    return null;
  }
  show_updategame(): any {
    this.set_up_updategame();
    this.stage.show_dialog(this.updategame_layer, py.bind(this, "updategame_handle_event"));
    this.stage.blind_dialog(this.updategame_layer, animations.BlindDirection.SHOW_DOWN, true, []);
    return null;
  }
  close_updategame(): any {
    this.stage.blind_dialog(this.updategame_layer, animations.BlindDirection.HIDE_UP, true, [], py.bind(this, "blind_close_updategame_callback"));
    return null;
  }
  blind_close_updategame_callback(layer: any): any {
    this.stage.close_dialog(layer);
    if (!py.contains(this.main_layer.items, this.updategame_item)) {
      py.m(this.main_layer, "add", this.updategame_item);
      animations.fade_in_item(this.updategame_item, 200);
    }
    return null;
  }
  updategame_handle_event(e: any): any {
    if ((py.eq(e.type, KEYDOWN) && py.eq(e.key, K_ESCAPE))) {
      this.stage.render();
      this.click_sound.play();
      this.close_updategame();
    }
    return null;
  }
  swapdetective_click(item: any, args: any): any {
    this.stage.render();
    this.click_sound.play();
    this.set_up_swapdetective();
    this.stage.show_dialog(this.swapdetective_layer, py.bind(this, "swapdetective_handle_event"));
    this.stage.blind_dialog(this.swapdetective_layer, animations.BlindDirection.SHOW_DOWN, true, []);
    return null;
  }
  swapdetective_handle_event(e: any): any {
    if ((py.eq(e.type, KEYDOWN) && py.eq(e.key, K_ESCAPE))) {
      this.stage.render();
      this.click_sound.play();
      this.close_swapdetective();
    }
    return null;
  }
  swapdetective_create_click(item: any, args: any): any {
    this.stage.render();
    this.click_sound.play();
    this.show_create(this.swapdetective_layer, true);
    return null;
  }
  blind_show_create_callback(layer: any): any {
    this.set_create_name_focus();
    return null;
  }
  set_create_name_focus(): any {
    this.create_name_item.begin_edit();
    return null;
  }
  swapdetective_select_click(item: any, args: any): any {
    let selected_charinfo: any;
    this.stage.render();
    this.click_sound.play();
    if ((this.swapdetective_selected != null)) {
      selected_charinfo = this.swapdetective_selected.charinfo;
      this.select_character(selected_charinfo);
      this.stage.blind_dialog(this.swapdetective_layer, animations.BlindDirection.HIDE_UP, true, [], py.bind(this, "blind_close_swapdetective_callback"));
    }
    return null;
  }
  select_character(charinfo: any): any {
    this.current_character = charinfo;
    this.character_id.load_character(charinfo);
    this.update_play_button();
    return null;
  }
  update_play_button(): any {
    if (py.truthy(this.overlay)) {
      if (py.truthy(this.should_back_to_game())) {
        this.backtogame_button.set_visible(true);
        this.play_button.set_visible(false);
      } else {
        this.backtogame_button.set_visible(false);
        this.play_button.set_visible(true);
      }
    }
    return null;
  }
  swapdetective_delete_click(item: any, args: any): any {
    this.stage.render();
    this.click_sound.play();
    if ((this.swapdetective_selected != null)) {
      this.set_up_delete(this.swapdetective_selected.charinfo);
      this.stage.show_dialog(this.delete_layer, py.bind(this, "delete_handle_event"), null);
      this.stage.blind_dialog(this.swapdetective_layer, animations.BlindDirection.HIDE_DOWN, false, []);
      this.stage.blind_dialog(this.delete_layer, animations.BlindDirection.SHOW_DOWN, false, []);
    }
    return null;
  }
  swapdetective_back_click(item: any, args: any): any {
    this.stage.render();
    this.click_sound.play();
    this.close_swapdetective();
    return null;
  }
  close_swapdetective(): any {
    this.stage.blind_dialog(this.swapdetective_layer, animations.BlindDirection.HIDE_UP, true, [], py.bind(this, "blind_close_swapdetective_callback"));
    return null;
  }
  blind_close_swapdetective_callback(layer: any): any {
    this.stage.close_dialog(layer);
    return null;
  }
  create_name_keypressed(key: any): any {
    this.update_create_accept();
    if (py.eq(key, K_RETURN)) {
      this.stage.render();
      this.click_sound.play();
      this.accept_create();
    }
    return null;
  }
  update_create_accept(): any {
    let name: any;
    name = py.m(this.create_name_item.get_text(), "strip");
    if ((name === "")) {
      this.accept_button.set_visible(false);
      this.accept_button_disabled.set_visible(true);
    } else {
      this.accept_button.set_visible(true);
      this.accept_button_disabled.set_visible(false);
    }
    return null;
  }
  create_previous_avatar_enter(item: any, args: any): any {
    this.stage.render();
    this.rollover_sound.play();
    if ((this.create_left_arrow_state === 0)) {
      this.create_left_arrow_item.set_image(this.left_arrow_rollover_image);
    } else {
      this.create_left_arrow_item.set_image(this.left_arrow_clicked_image);
    }
    return null;
  }
  create_previous_avatar_leave(item: any, args: any): any {
    this.create_left_arrow_item.set_image(this.left_arrow_normal_image);
    return null;
  }
  create_previous_avatar_click(item: any, args: any): any {
    this.create_left_arrow_item.set_image(this.left_arrow_clicked_image);
    this.create_left_arrow_state = 1;
    this.stage.capture_leftmousedown(item, py.bind(this, "create_previous_avatar_mousecapture"));
    return null;
  }
  create_previous_avatar_mousecapture(args: any, released: any): any {
    if (py.truthy(released)) {
      this.create_left_arrow_state = 0;
      if (py.eq(this.stage.get_over_item(), this.create_left_arrow_item)) {
        this.stage.render();
        this.create_flip_sound.play();
        if ((this.create_avatar > 1)) {
          this.create_avatar = this.create_avatar - 1;
          this.update_create_avatar_image();
        }
        this.create_left_arrow_item.set_image(this.left_arrow_rollover_image);
      }
    }
    return null;
  }
  create_next_avatar_enter(item: any, args: any): any {
    this.stage.render();
    this.rollover_sound.play();
    if ((this.create_right_arrow_state === 0)) {
      this.create_right_arrow_item.set_image(this.right_arrow_rollover_image);
    } else {
      this.create_right_arrow_item.set_image(this.right_arrow_clicked_image);
    }
    return null;
  }
  create_next_avatar_leave(item: any, args: any): any {
    this.create_right_arrow_item.set_image(this.right_arrow_normal_image);
    return null;
  }
  create_next_avatar_click(item: any, args: any): any {
    this.create_right_arrow_item.set_image(this.right_arrow_clicked_image);
    this.create_right_arrow_state = 1;
    this.stage.capture_leftmousedown(item, py.bind(this, "create_next_avatar_mousecapture"));
    return null;
  }
  create_next_avatar_mousecapture(args: any, released: any): any {
    if (py.truthy(released)) {
      this.create_right_arrow_state = 0;
      if (py.eq(this.stage.get_over_item(), this.create_right_arrow_item)) {
        this.stage.render();
        this.create_flip_sound.play();
        if ((this.create_avatar < this.create_avatar_count)) {
          this.create_avatar = this.create_avatar + 1;
          this.update_create_avatar_image();
        }
        this.create_right_arrow_item.set_image(this.right_arrow_rollover_image);
      }
    }
    return null;
  }
  create_accept_click(item: any, args: any): any {
    this.stage.render();
    this.click_sound.play();
    this.accept_create();
    return null;
  }
  accept_create(): any {
    let name, newchar: any;
    name = py.m(this.create_name_item.get_text(), "strip");
    if ((name === "")) {
      this.create_name_item.set_text("");
      this.create_name_item.begin_edit();
    } else if ((this.create_character_location === "")) {
      this.show_state_list();
    } else {
      name = characterid.apply_name_text_casing(name);
      newchar = this.stage.game.datastore.create_character(name, this.create_sex_male, this.create_avatar, this.create_character_location, false);
      this.select_character(newchar);
      if ((this.create_callback != null)) {
        this.create_callback();
      } else if ((this.create_background_layer != null)) {
        this.stage.blind_dialog(this.create_background_layer, animations.BlindDirection.HIDE_UP, true, [], py.bind(this, "blind_accept_create_callback"));
      } else {
        this.stage.blind_dialog(this.create_layer, animations.BlindDirection.HIDE_UP, true, [], py.bind(this, "blind_accept_create_callback"));
      }
    }
    return null;
  }
  blind_accept_create_callback(layer: any): any {
    this.stage.close_dialog(this.create_layer);
    if ((this.create_background_layer != null)) {
      this.stage.close_dialog(this.create_background_layer);
    }
    this.create_layer = null;
    this.create_callback = null;
    this.stage.update_mouse();
    return null;
  }
  create_state_click(item: any, args: any): any {
    this.stage.render();
    this.click_sound.play();
    this.show_state_list();
    return null;
  }
  show_state_list(): any {
    this.set_up_state_list();
    this.stage.show_dialog(this.state_list_layer, py.bind(this, "state_list_handle_event"), null);
    this.stage.blind_dialog(this.state_list_layer, animations.BlindDirection.SHOW_DOWN, false, [], null);
    return null;
  }
  state_list_handle_event(e: any): any {
    return null;
  }
  create_department_enter(item: any, args: any): any {
    this.stage.stop_timer(STATE_ROLLOVER_TIMER_KEY);
    this.create_over_department = item;
    this.stage.start_timer(STATE_ROLLOVER_TIMER_KEY, 50, py.bind(this, "show_department_rollover"));
    return null;
  }
  create_department_leave(item: any, args: any): any {
    this.stage.stop_timer(STATE_ROLLOVER_TIMER_KEY);
    this.create_state_rollover_item.set_visible(false);
    return null;
  }
  show_department_rollover(key: any, data: any): any {
    this.stage.stop_timer(key);
    this.stage.render();
    this.rollover_sound.play();
    this.create_state_rollover_item.set_top(this.create_over_department.get_top());
    this.create_state_rollover_item.set_visible(true);
    return null;
  }
  create_department_click(item: any, args: any): any {
    this.stage.render();
    this.click_sound.play();
    this.create_character_location = item.department.name;
    this.character_state_item.set_text(item.department.name);
    animations.blind_layer(this.state_list_layer, animations.BlindDirection.HIDE_DOWN, null, 450, py.bind(this, "blind_close_state_list_callback"));
    return null;
  }
  blind_close_state_list_callback(layer: any): any {
    this.stage.close_dialog(this.state_list_layer);
    this.state_list_layer = null;
    this.stage.update_mouse();
    return null;
  }
  create_male_click(item: any, args: any): any {
    this.stage.render();
    this.click_sound.play();
    this.create_sex_male = true;
    this.create_avatar = 1;
    this.update_create_sex_mark();
    this.update_create_avatar_image();
    return null;
  }
  create_female_click(item: any, args: any): any {
    this.stage.render();
    this.click_sound.play();
    this.create_sex_male = false;
    this.create_avatar = 1;
    this.update_create_sex_mark();
    this.update_create_avatar_image();
    return null;
  }
  create_cancel_click(item: any, args: any): any {
    this.stage.render();
    this.click_sound.play();
    this.close_create();
    return null;
  }
  create_handle_event(e: any): any {
    if (py.eq(e.type, KEYDOWN)) {
      if (py.eq(e.key, K_RETURN)) {
        this.stage.render();
        this.click_sound.play();
        this.accept_create();
      } else if (py.eq(e.key, K_ESCAPE)) {
        this.stage.render();
        this.click_sound.play();
        this.close_create();
      }
    }
    return null;
  }
  show_create(background_layer: any, apply_blind: any, callback: any = null, dark_background: any = false): any {
    this.create_background_layer = background_layer;
    this.create_callback = callback;
    this.create_dark_background = dark_background;
    this.set_up_create();
    if (py.truthy(dark_background)) {
      this.stage.show_dialog(this.create_layer, py.bind(this, "create_handle_event"));
    } else {
      this.stage.show_dialog(this.create_layer, py.bind(this, "create_handle_event"), null);
    }
    if (py.truthy(apply_blind)) {
      if ((background_layer != null)) {
        this.stage.blind_dialog(background_layer, animations.BlindDirection.HIDE_DOWN, false, []);
      }
      this.stage.blind_dialog(this.create_layer, animations.BlindDirection.SHOW_DOWN, dark_background, [], py.bind(this, "blind_show_create_callback"));
    }
    return null;
  }
  close_create(): any {
    if ((this.create_background_layer != null)) {
      this.create_background_layer.set_clip(null);
      animations.blind_layer(this.create_background_layer, animations.BlindDirection.SHOW_DOWN, null, 450);
    }
    if (py.truthy(this.create_dark_background)) {
      this.stage.blind_dialog(this.create_layer, animations.BlindDirection.HIDE_UP, true, [], py.bind(this, "blind_close_create_callback"));
    } else {
      animations.blind_layer(this.create_layer, animations.BlindDirection.HIDE_DOWN, null, 450, py.bind(this, "blind_close_create_callback"));
    }
    return null;
  }
  blind_close_create_callback(layer: any): any {
    this.stage.close_dialog(this.create_layer);
    this.create_layer = null;
    this.create_callback = null;
    this.stage.update_mouse();
    return null;
  }
  delete_yes_click(item: any, args: any): any {
    let characters, datastore, new_selected_char, new_selection_index, selected_character, selection_index: any;
    this.stage.render();
    this.click_sound.play();
    characters = py.slice(this.stage.game.datastore.characters, null, null);
    py.m(characters, "sort", undefined, py.bind(this, "get_character_name"));
    selection_index = py.m(characters, "index", this.swapdetective_selected.charinfo);
    if ((selection_index === 0)) {
      new_selection_index = py.add(selection_index, 1);
    } else {
      new_selection_index = (selection_index - 1);
    }
    if (((new_selection_index >= 0) && (new_selection_index < py.len(characters)))) {
      new_selected_char = py.getitem(characters, new_selection_index);
    } else {
      new_selected_char = null;
    }
    selected_character = this.swapdetective_selected.charinfo;
    this.stage.game.datastore.delete_character(selected_character);
    if ((new_selected_char != null)) {
      this.select_character(new_selected_char);
    } else {
      this.select_character(null);
    }
    this.load_characters();
    this.stage.render();
    py.m(this.deleted_characters, "append", selected_character.id);
    if (py.eq(this.current_character, selected_character)) {
      if ((new_selected_char != null)) {
        this.select_character(new_selected_char);
        this.current_character.active = true;
        datastore = this.stage.game.datastore;
        datastore.save_characters();
      } else {
        this.select_character(null);
      }
    }
    this.swapdetective_layer.set_clip(null);
    animations.blind_layer(this.swapdetective_layer, animations.BlindDirection.SHOW_DOWN, null, 450);
    animations.blind_layer(this.delete_layer, animations.BlindDirection.HIDE_DOWN, null, 450, py.bind(this, "blind_close_delete_callback"));
    return null;
  }
  delete_no_click(item: any, args: any): any {
    this.stage.render();
    this.click_sound.play();
    this.close_delete();
    return null;
  }
  delete_handle_event(e: any): any {
    if ((py.eq(e.type, KEYDOWN) && py.eq(e.key, K_ESCAPE))) {
      this.stage.render();
      this.click_sound.play();
      this.close_delete();
    }
    return null;
  }
  close_delete(): any {
    this.swapdetective_layer.set_clip(null);
    animations.blind_layer(this.swapdetective_layer, animations.BlindDirection.SHOW_DOWN, null, 450);
    animations.blind_layer(this.delete_layer, animations.BlindDirection.HIDE_DOWN, null, 450, py.bind(this, "blind_close_delete_callback"));
    return null;
  }
  blind_close_delete_callback(layer: any): any {
    this.stage.close_dialog(this.delete_layer);
    this.delete_layer = null;
    this.stage.update_mouse();
    return null;
  }
  credits_click(item: any, args: any): any {
    this.stage.render();
    this.click_sound.play();
    this.set_up_credits();
    this.stage.show_dialog(this.credits_layer, py.bind(this, "credits_handle_event"));
    this.load_current_credits(false);
    this.stage.blind_dialog(this.credits_layer, animations.BlindDirection.SHOW_DOWN, true, []);
    return null;
  }
  credits_handle_event(e: any): any {
    if ((py.eq(e.type, KEYDOWN) && py.eq(e.key, K_ESCAPE))) {
      this.stage.render();
      this.click_sound.play();
      this.close_credits();
    }
    return null;
  }
  credits_close_click(item: any, args: any): any {
    this.stage.render();
    this.click_sound.play();
    this.close_credits();
    return null;
  }
  close_credits(): any {
    this.stage.blind_dialog(this.credits_layer, animations.BlindDirection.HIDE_UP, true, [], py.bind(this, "blind_close_credits_callback"));
    return null;
  }
  blind_close_credits_callback(layer: any): any {
    this.stage.close_dialog(this.credits_layer);
    return null;
  }
  credits_next_click(item: any, args: any): any {
    this.stage.render();
    this.click_sound.play();
    if ((this.credits_page < this.credits_pagecount)) {
      this.credits_page = this.credits_page + 1;
      this.load_current_credits();
    }
    return null;
  }
  credits_prev_click(item: any, args: any): any {
    this.stage.render();
    this.click_sound.play();
    if ((this.credits_page > 1)) {
      this.credits_page = this.credits_page - 1;
      this.load_current_credits();
    }
    return null;
  }
  play_click(item: any, args: any): any {
    this.stage.render();
    this.click_sound.play();
    if (py.truthy(this.should_back_to_game())) {
      this.close_mainmenu();
    } else if ((this.current_character == null)) {
      this.show_create(null, true, py.bind(this, "start_game"), true);
    } else {
      this.start_game();
    }
    this.deleted_characters = [];
    return null;
  }
  should_back_to_game(): any {
    let datastore: any;
    datastore = this.stage.game.datastore;
    return py.and(this.overlay, () => py.and((datastore.user_character != null), () => py.and((this.current_character != null), () => py.and(py.eq(datastore.user_character.charinfo.id, this.current_character.id), () => !py.contains(this.deleted_characters, this.current_character.id)))));
  }
  start_game(): any {
    let black_background, black_layer: any;
    if ((this.current_character != null)) {
      if (!py.truthy(this.overlay)) {
        this.stage.set_music_volume(0, 300);
      }
      black_layer = new Layer();
      black_background = new ItemRect(0, 0, 600, 450);
      py.m(black_layer, "add", black_background);
      this.stage.add_layer(black_layer);
      animations.blind_layer(black_layer, animations.BlindDirection.SHOW_DOWN, null, 450, py.bind(this, "blind_hide_main_callback"));
    }
    return null;
  }
  blind_hide_main_callback(layer: any): any {
    let c, case_generator, datastore, loading_image, stage, user_character_stage: any;
    datastore = this.stage.game.datastore;
    if (!py.truthy(this.current_character.active)) {
      for (c of py.iter(this.stage.game.datastore.characters)) {
        c.active = false;
      }
      this.current_character.active = true;
      datastore.save_characters();
    }
    this.load_character_progress();
    if (((datastore.user_character_stage == null) || (datastore.user_character_stage === "nc"))) {
      case_generator = new serialization.CaseGenerator(datastore);
      datastore.user_character_progress.set_case(case_generator.new_case());
      stage = new case_.CaseStage(this.stage.game);
      this.stage.game.set_stage(stage);
    } else {
      user_character_stage = this.stage.game.datastore.user_character_stage;
      if ((user_character_stage === "p1")) {
        loading_image = "p0_loading_slides_001.jpg";
      } else if ((user_character_stage === "p2")) {
        loading_image = "p0_loading_slides_002.jpg";
      } else if ((user_character_stage === "p3")) {
        loading_image = "p0_loading_slides_003.jpg";
      } else {
        loading_image = "p0_loading_slides_001.jpg";
      }
      this.stage.game.show_loading(py.bind(this, "show_loading_callback"), loading_image);
    }
    return null;
  }
  show_loading_callback(layer: any): any {
    let stage, user_character_stage: any;
    user_character_stage = this.stage.game.datastore.user_character_stage;
    if ((user_character_stage === "p1")) {
      stage = new phase0.Phase0Stage(this.stage.game, 1);
      stage.save_state_on_next_load_phase = false;
    } else if ((user_character_stage === "p2")) {
      stage = new phase0.Phase0Stage(this.stage.game, 2);
      stage.save_state_on_next_load_phase = false;
    } else if ((user_character_stage === "p3")) {
      stage = new phase0.Phase0Stage(this.stage.game, 3);
      stage.save_state_on_next_load_phase = false;
    } else {
      throw new py.Exception(py.add(py.add("Unknown character current stage (", user_character_stage), ")"));
    }
    this.stage.game.set_stage(stage);
    this.stage.game.hide_loading();
    return null;
  }
  highscores_click(item: any, args: any): any {
    let merits_dialog: any;
    this.stage.render();
    this.click_sound.play();
    merits_dialog = new merits.Merits(this.stage);
    merits_dialog.show_highscores();
    return null;
  }
  help_click(item: any, args: any): any {
    let help_dialog: any;
    this.stage.render();
    this.click_sound.play();
    help_dialog = new help.Help(this.stage, true, true);
    help_dialog.show_help(1, true, false);
    return null;
  }
  exit_click(item: any, args: any): any {
    this.stage.render();
    this.click_sound.play();
    this.set_up_exit();
    this.stage.show_dialog(this.exit_layer, py.bind(this, "exit_handle_event"));
    this.stage.blind_dialog(this.exit_layer, animations.BlindDirection.SHOW_DOWN, true, []);
    return null;
  }
  exit_yes_click(item: any, args: any): any {
    this.stage.render();
    this.click_sound.play();
    this.stage.game.quit();
    return null;
  }
  exit_no_click(item: any, args: any): any {
    this.stage.render();
    this.click_sound.play();
    this.close_exit();
    return null;
  }
  exit_handle_event(e: any): any {
    if ((py.eq(e.type, KEYDOWN) && py.eq(e.key, K_ESCAPE))) {
      this.stage.render();
      this.click_sound.play();
      this.close_exit();
    }
    return null;
  }
  close_exit(): any {
    this.stage.blind_dialog(this.exit_layer, animations.BlindDirection.HIDE_UP, true, [], py.bind(this, "blind_close_exit_callback"));
    return null;
  }
  blind_close_exit_callback(layer: any): any {
    this.stage.close_dialog(this.exit_layer);
    return null;
  }
  handle_event(e: any): any {
    if (py.eq(e.type, pygame.KEYDOWN)) {
      if ((py.eq(e.key, pygame.K_ESCAPE) && py.truthy(this.overlay))) {
        this.stage.render();
        this.click_sound.play();
        this.close_mainmenu();
        return true;
      }
    }
    return null;
  }
}
