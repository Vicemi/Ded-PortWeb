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
import * as datastore from '../data/datastore';
import { random } from '../../runtime/py';
import * as witness from './witness';
import * as $self from './folder';

export let CASE: any = 1;
export let CASE_EXTENDED: any = 2;
export let IDENTIKIT: any = 3;
export let WITNESS: any = 4;
export class Folder extends Item {
  constructor(stage: any) {
    super();
    this.stage = stage;
    this.base_layer = new Layer();
    this.folder_back_layer = new Layer();
    this.case_layer = new Layer();
    this.case_data_layer = new Layer();
    this.case_extended_layer = new Layer();
    this.identikit_layer = new Layer();
    this.identikit_thief_layer = new Layer();
    this.witness_layer = new Layer();
    this.witness_data_layer = new Layer();
    this.arrest_order_layer = new Layer();
    this.active_layer = "";
    this.arrest_order_is_working = false;
    this.arrest_order_sent = false;
    this.pending_changes_to_save = false;
    this.font_15 = assets.load_font("powdrft_.ttf", 15);
    this.font_16 = assets.load_font("powdrft_.ttf", 16);
    this.font_17 = assets.load_font("powdrft_.ttf", 17);
    this.font_18 = assets.load_font("powdrft_.ttf", 18);
    this.font_20 = assets.load_font("powdrft_.ttf", 20);
    this.font_21 = assets.load_font("powdrft_.ttf", 21);
    this.font_23 = assets.load_font("powdrft_.ttf", 23);
    this.font_22 = assets.load_font("powdrft_.ttf", 22);
    this.font_24 = assets.load_font("powdrft_.ttf", 24);
    this.font_25 = assets.load_font("powdrft_.ttf", 24);
    this.click_sound = stage.click_sound;
    this.rollover_sound = stage.rollover_sound;
    this.popup_sound = stage.witness_popup_sound;
    this.turn_page_sound = assets.load_sound("GUI_Turn_Page.ogg");
    this.flip_option_sound = assets.load_sound("GUI_Flip.ogg");
    this.witness_fade_in_sound = assets.load_sound("fade.ogg");
    this.set_up_identikit();
    this.set_up_witness();
    this.set_up();
    return;
  }
  set_up(): any {
    this.set_up_background();
    this.set_up_buttons();
    this.set_up_case_texts();
    this.set_up_case_extended_texts();
    return null;
  }
  set_up_background(): any {
    let folder_bottom, folder_bottom_image, folder_center, folder_center_image, folder_left, folder_left_image, folder_right, folder_right_image, folder_top, folder_top_image: any;
    folder_center_image = assets.load_image("p0_folder_center.jpg");
    folder_center = new ItemImage(34, 39, folder_center_image, null);
    py.m(this.folder_back_layer, "add", folder_center);
    folder_top_image = assets.load_image("p0_folder_top.png");
    folder_top = new ItemImage(23, 16, folder_top_image, null);
    py.m(this.folder_back_layer, "add", folder_top);
    folder_bottom_image = assets.load_image("p0_folder_bottom.png");
    folder_bottom = new ItemImage(18, 387, folder_bottom_image, null);
    py.m(this.folder_back_layer, "add", folder_bottom);
    folder_left_image = assets.load_image("p0_folder_left.png");
    folder_left = new ItemImage(21, 39, folder_left_image, null);
    py.m(this.folder_back_layer, "add", folder_left);
    folder_right_image = assets.load_image("p0_folder_right.png");
    folder_right = new ItemImage(550, 39, folder_right_image, null);
    py.m(this.folder_back_layer, "add", folder_right);
    this.case_image = assets.load_image("p0_folder_case1_back.png");
    this.case_data_image = assets.load_image("p0_folder_case2_back.png");
    this.case_background = new ItemImage(44, 72, this.case_image, null);
    this.case_data_background = new ItemImage(44, 116, this.case_data_image, null);
    py.m(this.case_layer, "add", this.case_background);
    py.m(this.case_data_layer, "add", this.case_data_background);
    return null;
  }
  set_up_buttons(): any {
    this.set_up_menu_buttons();
    this.set_up_case_page_button();
    this.set_up_identikit_page_button();
    this.set_up_witness_page_button();
    return null;
  }
  set_up_menu_buttons(): any {
    let close_button_image, next_button_rollover_image: any;
    close_button_image = assets.load_image("p0_button_close.png");
    this.close_button_rollover_image = assets.load_image("p0_button_close_rollover.png");
    this.next_button_image = assets.load_image("p0_button_next_active.png");
    next_button_rollover_image = assets.load_image("p0_button_next_rollover.png");
    this.previous_button_image = assets.load_image("p0_button_previous_active.png");
    this.previous_button_rollover_image = assets.load_image("p0_button_previous_rollover.png");
    this.close_button = new ItemImage(275, 392, close_button_image, null);
    this.close_button.set_rollover_image(this.close_button_rollover_image, this.rollover_sound);
    this.next_button = new ItemImage(305, 392, this.next_button_image, null);
    this.previous_button = new ItemImage(245, 392, this.previous_button_image, null);
    this.next_button.set_rollover_image(next_button_rollover_image, this.rollover_sound);
    this.previous_button.set_rollover_image(this.previous_button_rollover_image, this.rollover_sound);
    this.close_button.add_event_handler(ItemEvent.CLICK, py.bind(this, "button_click"));
    this.next_button.add_event_handler(ItemEvent.CLICK, py.bind(this, "button_click"));
    this.previous_button.add_event_handler(ItemEvent.CLICK, py.bind(this, "button_click"));
    py.m(this.base_layer, "add", this.close_button);
    py.m(this.base_layer, "add", this.next_button);
    py.m(this.base_layer, "add", this.previous_button);
    return null;
  }
  set_up_case_page_button(): any {
    this.case_button_active_image = assets.load_image("p0_folder_btn_case_active.png");
    this.case_button_inactive_image = assets.load_image("p0_folder_btn_case_inactive.png");
    this.case_button_rollover_image = assets.load_image("p0_folder_btn_case_hovered.png");
    this.case_button = new ItemImage(538, 67, this.case_button_inactive_image, null);
    this.case_button.add_event_handler(ItemEvent.CLICK, py.bind(this, "button_click"));
    py.m(this.base_layer, "add", this.case_button);
    return null;
  }
  set_up_witness_page_button(): any {
    this.witness_button_active_image = assets.load_image("p0_folder_btn_witnesses_active.png");
    this.witness_button_inactive_image = assets.load_image("p0_folder_btn_witnesses_inactive.png");
    this.witness_button_rollover_image = assets.load_image("p0_folder_btn_witnesses_hovered.png");
    this.witness_button = new ItemImage(538, 249, this.witness_button_inactive_image, null);
    this.witness_button.add_event_handler(ItemEvent.CLICK, py.bind(this, "button_click"));
    py.m(this.base_layer, "add", this.witness_button);
    return null;
  }
  set_up_witness_texts(): any {
    this.witness_case_text = new ItemText(90, 154, this.font_16, 0, "", [157, 21, 21], null, 100, 20);
    this.witness_case_text.set_text(this.stage.game.datastore.user_character_progress.case.number);
    py.m(this.witness_layer, "add", this.witness_case_text);
    return null;
  }
  set_up_witness_buttons(): any {
    let size, witness1_mask, witness2_mask, witness3_mask, witness_mask: any;
    this.witness_set_rollover_image = assets.load_image("p0_folder_witness_whiteback.png");
    this.witness_underline = assets.load_image("p0_folder_witness_underline.png");
    size = this.witness_set_rollover_image.get_size();
    this.witness_sets = [];
    witness1_mask = new ItemMask(46, 204, size);
    py.m(this.witness_sets, "append", witness1_mask);
    witness2_mask = new ItemMask(318, 107, size);
    py.m(this.witness_sets, "append", witness2_mask);
    witness3_mask = new ItemMask(318, 234, size);
    py.m(this.witness_sets, "append", witness3_mask);
    for (witness_mask of py.iter(this.witness_sets)) {
      witness_mask.add_event_handler(ItemEvent.CLICK, py.bind(this, "witness_button_click"));
    }
    for (witness_mask of py.iter(this.witness_sets)) {
      py.m(this.witness_data_layer, "add", witness_mask);
    }
    return null;
  }
  set_up_identikit_page_button(): any {
    this.identikit_button_active_image = assets.load_image("p0_folder_btn_identikit_active.png");
    this.identikit_button_inactive_image = assets.load_image("p0_folder_btn_identikit_inactive.png");
    this.identikit_button_rollover_image = assets.load_image("p0_folder_btn_identikit_hovered.png");
    this.identikit_button = new ItemImage(538, 152, this.identikit_button_inactive_image, null);
    this.identikit_button.add_event_handler(ItemEvent.CLICK, py.bind(this, "button_click"));
    py.m(this.base_layer, "add", this.identikit_button);
    return null;
  }
  set_up_identikit_buttons(): any {
    let arrest_order_dialog_close_button_image, arrest_order_dialog_close_button_rollover_image, arrow_left_image, arrow_left_image_pressed, arrow_left_image_rollover, arrow_right_image, arrow_right_image_pressed, arrow_right_image_rollover, thief_dialog_close_button_image, thief_dialog_close_button_rollover_image: any;
    thief_dialog_close_button_image = assets.load_image("btn_testigo_x_normal.png");
    thief_dialog_close_button_rollover_image = assets.load_image("btn_testigo_x_rollover.png");
    this.thief_dialog_close_button = new ItemImage(425, 39, thief_dialog_close_button_image, null, true);
    this.thief_dialog_close_button.set_rollover_image(thief_dialog_close_button_rollover_image, this.rollover_sound);
    arrow_left_image = assets.load_image("p0_identikit_arrow_prev_standby.png");
    const $t1: any = assets.load_image("p0_identikit_arrow_prev_hover.png");
    this.arrow_left_image_rollover = $t1;
    arrow_left_image_rollover = $t1;
    const $t2: any = assets.load_image("p0_identikit_arrow_prev_pressed.png");
    this.arrow_left_image_pressed = $t2;
    arrow_left_image_pressed = $t2;
    arrow_right_image = assets.load_image("p0_identikit_arrow_next_standby.png");
    const $t3: any = assets.load_image("p0_identikit_arrow_next_hover.png");
    this.arrow_right_image_rollover = $t3;
    arrow_right_image_rollover = $t3;
    const $t4: any = assets.load_image("p0_identikit_arrow_next_pressed.png");
    this.arrow_right_image_pressed = $t4;
    arrow_right_image_pressed = $t4;
    this.arrest_order_not_working_image = assets.load_image("p0_folder_identikit_orderbutton_inactive.png");
    this.arrest_order_issued_image = assets.load_image("p0_identikit_done_orderbutton.png");
    this.arrest_order_working_image = assets.load_image("p0_folder_identikit_orderbutton_active.png");
    this.arrest_order_working_rollover_image = assets.load_image("p0_folder_identikit_orderbutton_rollover.png");
    arrest_order_dialog_close_button_image = assets.load_image("p0_button_close.png");
    arrest_order_dialog_close_button_rollover_image = assets.load_image("p0_button_close_rollover.png");
    this.sex_left_button = new ItemImage(42, 194, arrow_left_image);
    this.sex_left_button.set_rollover_image(arrow_left_image_rollover, this.rollover_sound);
    this.sex_left_button.set_pressed_image(arrow_left_image_pressed);
    this.sex_right_button = new ItemImage(246, 194, arrow_right_image);
    this.sex_right_button.set_rollover_image(arrow_right_image_rollover, this.rollover_sound);
    this.sex_right_button.set_pressed_image(arrow_right_image_pressed);
    this.height_left_button = new ItemImage(42, 239, arrow_left_image);
    this.height_left_button.set_rollover_image(arrow_left_image_rollover, this.rollover_sound);
    this.height_left_button.set_pressed_image(arrow_left_image_pressed);
    this.height_right_button = new ItemImage(246, 239, arrow_right_image);
    this.height_right_button.set_rollover_image(arrow_right_image_rollover, this.rollover_sound);
    this.height_right_button.set_pressed_image(arrow_right_image_pressed);
    this.hair_left_button = new ItemImage(42, 286, arrow_left_image);
    this.hair_left_button.set_rollover_image(arrow_left_image_rollover, this.rollover_sound);
    this.hair_left_button.set_pressed_image(arrow_left_image_pressed);
    this.hair_right_button = new ItemImage(246, 286, arrow_right_image);
    this.hair_right_button.set_rollover_image(arrow_right_image_rollover, this.rollover_sound);
    this.hair_right_button.set_pressed_image(arrow_right_image_pressed);
    this.distinctive_left_button = new ItemImage(42, 332, arrow_left_image);
    this.distinctive_left_button.set_rollover_image(arrow_left_image_rollover, this.rollover_sound);
    this.distinctive_left_button.set_pressed_image(arrow_left_image_pressed);
    this.distinctive_right_button = new ItemImage(246, 332, arrow_right_image);
    this.distinctive_right_button.set_rollover_image(arrow_right_image_rollover, this.rollover_sound);
    this.distinctive_right_button.set_pressed_image(arrow_right_image_pressed);
    this.arrest_order_box = new ItemImage(317, 296, this.arrest_order_not_working_image, null, true);
    this.arrest_order_button = new ItemMask(318, 316, [219, 39]);
    this.arrest_order_dialog_close_button = new ItemImage(272, 305, arrest_order_dialog_close_button_image, null, true);
    this.arrest_order_dialog_close_button.set_rollover_image(arrest_order_dialog_close_button_rollover_image, this.rollover_sound);
    this.thief_dialog_close_button.add_event_handler(ItemEvent.CLICK, py.bind(this, "identikit_new_dialog_click"));
    this.sex_left_button.add_event_handler(ItemEvent.CLICK, py.bind(this, "identikit_arrow_click"));
    this.sex_right_button.add_event_handler(ItemEvent.CLICK, py.bind(this, "identikit_arrow_click"));
    this.height_left_button.add_event_handler(ItemEvent.CLICK, py.bind(this, "identikit_arrow_click"));
    this.height_right_button.add_event_handler(ItemEvent.CLICK, py.bind(this, "identikit_arrow_click"));
    this.hair_left_button.add_event_handler(ItemEvent.CLICK, py.bind(this, "identikit_arrow_click"));
    this.hair_right_button.add_event_handler(ItemEvent.CLICK, py.bind(this, "identikit_arrow_click"));
    this.distinctive_left_button.add_event_handler(ItemEvent.CLICK, py.bind(this, "identikit_arrow_click"));
    this.distinctive_right_button.add_event_handler(ItemEvent.CLICK, py.bind(this, "identikit_arrow_click"));
    this.arrest_order_button.add_event_handler(ItemEvent.CLICK, py.bind(this, "identikit_new_dialog_click"));
    this.arrest_order_dialog_close_button.add_event_handler(ItemEvent.CLICK, py.bind(this, "identikit_new_dialog_click"));
    py.m(this.identikit_thief_layer, "add", this.thief_dialog_close_button);
    py.m(this.identikit_layer, "add", this.sex_left_button);
    py.m(this.identikit_layer, "add", this.sex_right_button);
    py.m(this.identikit_layer, "add", this.height_left_button);
    py.m(this.identikit_layer, "add", this.height_right_button);
    py.m(this.identikit_layer, "add", this.hair_left_button);
    py.m(this.identikit_layer, "add", this.hair_right_button);
    py.m(this.identikit_layer, "add", this.distinctive_left_button);
    py.m(this.identikit_layer, "add", this.distinctive_right_button);
    py.m(this.identikit_layer, "add", this.arrest_order_button);
    py.m(this.identikit_layer, "add", this.arrest_order_box);
    py.m(this.arrest_order_layer, "add", this.arrest_order_dialog_close_button);
    return null;
  }
  set_up_identikit_texts(): any {
    this.identikit_case_text = new ItemText(90, 154, this.font_16, 0, "", [157, 21, 21], null, 100, 20);
    this.identikit_sex_text = new ItemText(99, 192, this.font_24, 0, "", [0, 0, 0], null, 110, 30, 2);
    this.identikit_height_text = new ItemText(99, 237, this.font_24, 0, "", [0, 0, 0], null, 110, 30, 2);
    this.identikit_hair_text = new ItemText(99, 284, this.font_24, 0, "", [0, 0, 0], null, 110, 30, 2);
    this.identikit_distinctive_text = new ItemText(99, 329, this.font_24, 0, "", [0, 0, 0], null, 110, 30, 2);
    this.identikit_thief_name = new ItemText(161, 210, this.font_24, 0, "", [157, 21, 21], null, 290, 30);
    this.identikit_thief_nickname = new ItemText(161, 229, this.font_23, 0, "", [51, 51, 51], null, 250, 30);
    this.identikit_thief_age = new ItemText(166, 248, this.font_18, 0, "", [102, 102, 102], null, 158, 25);
    this.identikit_thief_description = new ItemText(161, 270, this.font_18, 14, "", [0, 0, 0], null, 275, 132);
    this.arrest_order_name_text = new ItemText(163, 263, this.font_22, 0, "", [51, 51, 51], null, 267, 32, 2);
    this.arrest_order_nick_text = new ItemText(163, 280, this.font_20, 0, "", [102, 51, 51], null, 267, 30, 2);
    this.identikit_case_text.set_text(this.stage.game.datastore.user_character_progress.case.number);
    py.m(this.identikit_layer, "add", this.identikit_case_text);
    py.m(this.identikit_layer, "add", this.identikit_sex_text);
    py.m(this.identikit_layer, "add", this.identikit_height_text);
    py.m(this.identikit_layer, "add", this.identikit_hair_text);
    py.m(this.identikit_layer, "add", this.identikit_distinctive_text);
    py.m(this.identikit_thief_layer, "add", this.identikit_thief_name);
    py.m(this.identikit_thief_layer, "add", this.identikit_thief_age);
    py.m(this.identikit_thief_layer, "add", this.identikit_thief_nickname);
    py.m(this.identikit_thief_layer, "add", this.identikit_thief_description);
    py.m(this.arrest_order_layer, "add", this.arrest_order_name_text);
    py.m(this.arrest_order_layer, "add", this.arrest_order_nick_text);
    return null;
  }
  set_up_case_texts(): any {
    let so: any;
    this.case_number_text = new ItemText(90, 154, this.font_16, 0, "", [157, 21, 21], null, 100, 20);
    this.case_agent_text = new ItemText(68, 192, this.font_18, 13, "", [0, 0, 0], null, 170, 50, 1, 2);
    this.case_department_text = new ItemText(138, 228, this.font_18, 0, "", [0, 0, 0], null, 115, 25);
    this.case_place_text = new ItemText(92, 251, this.font_17, 13, "", [0, 0, 0], null, 175, 95);
    this.case_number2_text = new ItemText(467, 111, this.font_16, 0, "", [157, 21, 21], null, 100, 25);
    this.case_stolen_obj_text = new ItemText(323, 149, this.font_17, 13, "", [0, 0, 0], null, 210, 95);
    this.case_time_text = new ItemText(376, 274, this.font_18, 0, "", [0, 0, 0], null, 225, 232);
    this.case_number_text.set_text(this.stage.game.datastore.user_character_progress.case.number);
    this.case_number2_text.set_text(this.stage.game.datastore.user_character_progress.case.number);
    this.case_department_text.set_text(this.stage.game.datastore.user_character_progress.case.crime_location.department.name);
    this.case_place_text.set_text(this.stage.game.datastore.user_character_progress.case.crime_location.name);
    so = this.stage.game.datastore.user_character_progress.case.stolen_object.description1;
    this.case_stolen_obj_text.set_text(py.add(py.m(py.getitem(so, 0), "capitalize"), py.slice(so, 1, py.len(so))));
    this.case_time_text.set_text(py.fmt("D\xeda %s a las %s hs.", this.stage.game.datastore.user_character_progress.case.get_time_limit()));
    py.m(this.case_data_layer, "add", this.case_number_text);
    py.m(this.case_data_layer, "add", this.case_agent_text);
    py.m(this.case_data_layer, "add", this.case_department_text);
    py.m(this.case_data_layer, "add", this.case_place_text);
    py.m(this.case_data_layer, "add", this.case_number2_text);
    py.m(this.case_data_layer, "add", this.case_stolen_obj_text);
    py.m(this.case_data_layer, "add", this.case_time_text);
    return null;
  }
  set_up_case_extended_texts(): any {
    this.case_ext_number_text = new ItemText(90, 154, this.font_16, 0, "", [157, 21, 21], null, 100, 25);
    this.case_ext_text_left = new ItemText(45, 174, this.font_16, 12, "", [0, 0, 0], null, 228, 184);
    this.case_ext_text_right = new ItemText(320, 105, this.font_16, 12, "", [0, 0, 0], null, 228, 257);
    this.case_ext_number_text.set_text(this.stage.game.datastore.user_character_progress.case.number);
    this.case_ext_text_left.break_text_into(this.case_ext_text_right);
    py.m(this.case_extended_layer, "add", this.case_ext_number_text);
    py.m(this.case_extended_layer, "add", this.case_ext_text_left);
    py.m(this.case_extended_layer, "add", this.case_ext_text_right);
    return null;
  }
  load_agent_name(): any {
    let name: any;
    name = this.stage.game.datastore.user_character.charinfo.name;
    this.case_agent_text.set_text(name);
    return null;
  }
  load_case_text(): any {
    let text: any;
    text = this.stage.game.datastore.user_character_progress.case.get_full_text(this.stage.game.datastore.user_character, this.stage.game.datastore.user_character_progress);
    this.case_ext_text_left.set_text(text);
    return null;
  }
  close_folder(): any {
    this.stage.close_dialog(this.base_layer);
    this.stage.folder_default_tab = this.active_layer;
    return null;
  }
  show_arrest_order_done_dialog(): any {
    let arrest_order_background_image: any;
    this.arrest_order_layer.empty();
    this.arrest_order_sent_sound = assets.load_sound("GUI_arrest_order_sent.ogg");
    arrest_order_background_image = assets.load_image("p0_identikit_arrest_order_done_background.png");
    this.arrest_order_background.set_image(arrest_order_background_image);
    this.arrest_order_background.set_lefttop(109, 75);
    py.m(this.arrest_order_layer, "add", this.arrest_order_background);
    this.arrest_order_thief_image.set_lefttop(261, 202);
    py.m(this.arrest_order_layer, "add", this.arrest_order_thief_image);
    this.arrest_order_name_text.set_lefttop(163, 263);
    this.arrest_order_nick_text.set_lefttop(163, 280);
    py.m(this.arrest_order_layer, "add", this.arrest_order_name_text);
    py.m(this.arrest_order_layer, "add", this.arrest_order_nick_text);
    py.m(this.arrest_order_layer, "add", this.arrest_order_dialog_close_button);
    this.obsure_folder_close();
    this.stage.show_dialog(this.arrest_order_layer, py.bind(this, "arrest_order_handle_event"), undefined, undefined, py.bind(this, "clarify_folder_close"));
    this.stage.render();
    this.arrest_order_sent_sound.play();
    return null;
  }
  set_up_arrest_order_dialog(): any {
    let arrest_order_dialog_accept_button_image, arrest_order_dialog_accept_button_rollover_image, arrest_order_dialog_background_image, arrest_order_dialog_cancel_button_image, arrest_order_dialog_cancel_button_rollover_image: any;
    this.arrest_order_layer.empty();
    this.arrest_order_sound = assets.load_sound("GUI_arrest_order.ogg");
    arrest_order_dialog_background_image = assets.load_image("p0_identikit_arrest_order_warning_background.png");
    this.arrest_order_background.set_image(arrest_order_dialog_background_image);
    this.arrest_order_background.set_lefttop(119, 36);
    py.m(this.arrest_order_layer, "add", this.arrest_order_background);
    this.arrest_order_thief_image.set_lefttop(272, 177);
    py.m(this.arrest_order_layer, "add", this.arrest_order_thief_image);
    this.arrest_order_name_text.set_lefttop(168, 237);
    this.arrest_order_nick_text.set_lefttop(168, 254);
    py.m(this.arrest_order_layer, "add", this.arrest_order_name_text);
    py.m(this.arrest_order_layer, "add", this.arrest_order_nick_text);
    arrest_order_dialog_accept_button_image = assets.load_image("p0_identikit_arrest_order_btn_acept_normal.png");
    arrest_order_dialog_accept_button_rollover_image = assets.load_image("p0_identikit_arrest_order_btn_acept_rollover.png");
    arrest_order_dialog_cancel_button_image = assets.load_image("p0_identikit_arrest_order_btn_cancel_normal.png");
    arrest_order_dialog_cancel_button_rollover_image = assets.load_image("p0_identikit_arrest_order_btn_cancel_rollover.png");
    this.arrest_order_dialog_accept_button = new ItemImage(204, 296, arrest_order_dialog_accept_button_image, null, true);
    this.arrest_order_dialog_accept_button.set_rollover_image(arrest_order_dialog_accept_button_rollover_image, this.rollover_sound);
    this.arrest_order_dialog_cancel_button = new ItemImage(313, 296, arrest_order_dialog_cancel_button_image, null, true);
    this.arrest_order_dialog_cancel_button.set_rollover_image(arrest_order_dialog_cancel_button_rollover_image, this.rollover_sound);
    this.arrest_order_dialog_accept_button.add_event_handler(ItemEvent.CLICK, py.bind(this, "identikit_new_dialog_click"));
    py.m(this.arrest_order_layer, "add", this.arrest_order_dialog_accept_button);
    this.arrest_order_dialog_cancel_button.add_event_handler(ItemEvent.CLICK, py.bind(this, "identikit_new_dialog_click"));
    py.m(this.arrest_order_layer, "add", this.arrest_order_dialog_cancel_button);
    return null;
  }
  load_identikit_data(): any {
    let circle_outline_back: any;
    this.get_list_identikit();
    this.identikit_image_matrix = (() => { const $r: any[] = []; let x; for (x of py.iter(py.xrange(9))) { $r.push(""); } return $r; })();
    circle_outline_back = assets.load_image("p0_folder_identikit_suspect_selected.png");
    this.circle_outlined_image = new ItemImage(325, 110, circle_outline_back, null);
    this.arrest_order_thief_image = new ItemImage(261, 202, null, null);
    py.m(this.arrest_order_layer, "add", this.arrest_order_thief_image);
    this.selected_sex_feature = 0;
    this.selected_height_feature = 0;
    this.selected_hair_feature = 0;
    this.selected_distinctive_feature = 0;
    this.list_sex_features = [];
    this.list_height_features_male = [];
    this.list_height_features_female = [];
    this.list_hair_features = [];
    this.list_distinctive_features = [];
    py.m(this.list_sex_features, "append", "-");
    py.m(this.list_sex_features, "append", "Hombre");
    py.m(this.list_sex_features, "append", "Mujer");
    py.m(this.list_height_features_male, "append", "-");
    py.m(this.list_height_features_male, "append", "Alto");
    py.m(this.list_height_features_male, "append", "Bajo");
    py.m(this.list_height_features_female, "append", "-");
    py.m(this.list_height_features_female, "append", "Alta");
    py.m(this.list_height_features_female, "append", "Baja");
    py.m(this.list_hair_features, "append", "-");
    py.m(this.list_hair_features, "append", "Morocho");
    py.m(this.list_hair_features, "append", "Rubio");
    py.m(this.list_hair_features, "append", "Pelirrojo");
    py.m(this.list_hair_features, "append", "Canoso");
    py.m(this.list_distinctive_features, "append", "-");
    py.m(this.list_distinctive_features, "append", "Cicatriz");
    py.m(this.list_distinctive_features, "append", "Tatuaje");
    py.m(this.list_distinctive_features, "append", "Lentes");
    py.m(this.list_distinctive_features, "append", "Lunar");
    this.identikit_sex_text.set_text(py.getitem(this.list_sex_features, 0));
    this.identikit_height_text.set_text(py.getitem(this.list_sex_features, 0));
    this.identikit_hair_text.set_text(py.getitem(this.list_hair_features, 0));
    this.identikit_distinctive_text.set_text(py.getitem(this.list_distinctive_features, 0));
    return null;
  }
  set_up_identikit_background(): any {
    this.identikit_image = assets.load_image("p0_folder_identikit_back.png");
    this.identikit_thief_background_image = assets.load_image("p0_folder_identikit_suspect_popup_back.png");
    this.identikit_background = new ItemImage(44, 72, this.identikit_image, null);
    this.identikit_thief_background = new ItemImage(128, 8, this.identikit_thief_background_image, null);
    this.identikit_thief_image = new ItemImage(160, 37, null, null);
    this.identikit_thief_image_side = new ItemImage(292, 37, null, null);
    this.arrest_order_background = new ItemImage(109, 75, null, null);
    py.m(this.identikit_layer, "add", this.identikit_background);
    py.m(this.identikit_thief_layer, "add", this.identikit_thief_background);
    py.m(this.identikit_thief_layer, "add", this.identikit_thief_image);
    py.m(this.identikit_thief_layer, "add", this.identikit_thief_image_side);
    py.m(this.arrest_order_layer, "add", this.arrest_order_background);
    return null;
  }
  set_up_witness_background(): any {
    this.witness_image = assets.load_image("p0_folder_witness_back.png");
    this.witness_background = new ItemImage(44, 72, this.witness_image, null);
    py.m(this.witness_layer, "add", this.witness_background);
    return null;
  }
  identikit_arrest_order_sent(): any {
    let arrest_order_name_text, arrest_order_nick_text, arrest_order_thief, arrest_order_thief_img, done_back_bottom_image, done_back_bottom_item, done_back_center_image, done_back_center_item, done_back_left_image, done_back_left_item, done_back_right_image, done_back_right_item, done_back_top_image, done_back_top_item, stamp: any;
    if (!py.truthy(this.arrest_order_sent)) {
      this.arrest_order_sent = true;
      done_back_center_image = assets.load_image("p0_identikit_done_back_center.jpg");
      done_back_center_item = new ItemImage(48, 49, done_back_center_image);
      py.m(this.identikit_layer, "add", done_back_center_item);
      done_back_top_image = assets.load_image("p0_identikit_done_back_top.png");
      done_back_top_item = new ItemImage(30, 27, done_back_top_image);
      py.m(this.identikit_layer, "add", done_back_top_item);
      done_back_bottom_image = assets.load_image("p0_identikit_done_back_bottom.png");
      done_back_bottom_item = new ItemImage(33, 373, done_back_bottom_image);
      py.m(this.identikit_layer, "add", done_back_bottom_item);
      done_back_left_image = assets.load_image("p0_identikit_done_back_left.png");
      done_back_left_item = new ItemImage(28, 49, done_back_left_image);
      py.m(this.identikit_layer, "add", done_back_left_item);
      done_back_right_image = assets.load_image("p0_identikit_done_back_right.png");
      done_back_right_item = new ItemImage(276, 49, done_back_right_image);
      py.m(this.identikit_layer, "add", done_back_right_item);
      this.arrest_order_thief_image = new ItemImage(93, 127, null, null);
      stamp = new ItemImage(182, 128, assets.load_image("p0_identikit_done_overstamp.png"));
      arrest_order_name_text = new ItemText(58, 313, this.font_24, 16, "", [31, 31, 31], null, 207, 33, 2, 2);
      arrest_order_nick_text = new ItemText(28, 344, this.font_20, 0, "", [102, 51, 51], null, 267, (-1), 2, 2);
      if ((this.stage.game.datastore.user_character_progress.case.arrest_order_thief == null)) {
        arrest_order_thief = py.getitem(this.list_identikit_thieves, py.m(this.identikit_image_matrix, "index", "")).thief;
        this.stage.game.datastore.user_character_progress.case.arrest_order_thief = arrest_order_thief;
        this.arrest_order_thief_image.set_image(assets.load_image(py.getitem(this.list_identikit_thieves, py.m(this.identikit_image_matrix, "index", "")).thief.identikit_large_image_front));
        arrest_order_name_text.set_text(py.getitem(this.list_identikit_thieves, py.m(this.identikit_image_matrix, "index", "")).thief.name);
        arrest_order_nick_text.set_text(py.getitem(this.list_identikit_thieves, py.m(this.identikit_image_matrix, "index", "")).thief.nickname);
      } else {
        arrest_order_thief = this.stage.game.datastore.user_character_progress.case.arrest_order_thief;
        arrest_order_thief_img = assets.load_image(arrest_order_thief.identikit_large_image_front);
        this.arrest_order_thief_image.set_image(arrest_order_thief_img);
        arrest_order_name_text.set_text(arrest_order_thief.name);
        arrest_order_nick_text.set_text(arrest_order_thief.nickname);
      }
      this.arrest_order_thief_image.add_event_handler(ItemEvent.CLICK, py.bind(this, "identikit_button_click"));
      this.disable_thieves();
      py.m(this.identikit_layer, "add", this.arrest_order_thief_image);
      py.m(this.identikit_layer, "add", arrest_order_name_text);
      py.m(this.identikit_layer, "add", arrest_order_nick_text);
      py.m(this.identikit_layer, "add", stamp);
      py.m(this.identikit_layer, "remove", this.sex_left_button);
      py.m(this.identikit_layer, "remove", this.sex_right_button);
      py.m(this.identikit_layer, "remove", this.height_left_button);
      py.m(this.identikit_layer, "remove", this.height_right_button);
      py.m(this.identikit_layer, "remove", this.hair_left_button);
      py.m(this.identikit_layer, "remove", this.hair_right_button);
      py.m(this.identikit_layer, "remove", this.distinctive_left_button);
      py.m(this.identikit_layer, "remove", this.distinctive_right_button);
      py.m(this.identikit_layer, "remove", this.arrest_order_button);
      this.arrest_order_box.set_image(this.arrest_order_issued_image);
    }
    return null;
  }
  identikit_new_dialog_click(item: any, args: any): any {
    if ((py.eq(item, this.arrest_order_button) && py.truthy(this.arrest_order_is_working))) {
      this.arrest_order_name_text.set_text(py.getitem(this.list_identikit_thieves, py.m(this.identikit_image_matrix, "index", "")).thief.name);
      this.arrest_order_nick_text.set_text(py.getitem(this.list_identikit_thieves, py.m(this.identikit_image_matrix, "index", "")).thief.nickname);
      this.arrest_order_thief_image.set_image(py.getitem(this.list_identikit_thieves, py.m(this.identikit_image_matrix, "index", "")).identikit_item_image);
      this.set_up_arrest_order_dialog();
      this.obsure_folder_close();
      this.stage.show_dialog(this.arrest_order_layer, py.bind(this, "arrest_order_confirm_handle_event"), undefined, undefined, py.bind(this, "clarify_folder_close"));
      this.stage.render();
      this.arrest_order_sound.play();
    } else if (py.eq(item, this.arrest_order_dialog_close_button)) {
      this.stage.render();
      this.click_sound.play();
      this.close_arrest_order();
    } else if (py.eq(item, this.thief_dialog_close_button)) {
      this.stage.render();
      this.click_sound.play();
      this.close_identikit_thief();
    } else if (py.eq(item, this.arrest_order_dialog_cancel_button)) {
      this.stage.render();
      this.click_sound.play();
      this.cancel_arrest_order();
    } else if (py.eq(item, this.arrest_order_dialog_accept_button)) {
      this.stage.render();
      this.click_sound.play();
      this.stage.close_dialog(this.arrest_order_layer);
      this.show_arrest_order_done_dialog();
      this.identikit_arrest_order_sent();
      this.stage.render();
      this.stage.save_progress(false);
    }
    return null;
  }
  identikit_thief_handle_event(e: any): any {
    if ((py.eq(e.type, KEYDOWN) && py.eq(e.key, K_ESCAPE))) {
      this.stage.render();
      this.click_sound.play();
      this.close_identikit_thief();
    }
    return null;
  }
  close_identikit_thief(): any {
    this.identikit_thief_image.set_image(null);
    this.identikit_thief_image_side.set_image(null);
    this.stage.close_dialog(this.identikit_thief_layer);
    return null;
  }
  arrest_order_confirm_handle_event(e: any): any {
    if ((py.eq(e.type, KEYDOWN) && py.eq(e.key, K_ESCAPE))) {
      this.stage.render();
      this.click_sound.play();
      this.cancel_arrest_order();
    }
    return null;
  }
  cancel_arrest_order(): any {
    this.stage.close_dialog(this.arrest_order_layer);
    return null;
  }
  arrest_order_handle_event(e: any): any {
    if ((py.eq(e.type, KEYDOWN) && py.eq(e.key, K_ESCAPE))) {
      this.stage.render();
      this.click_sound.play();
      this.close_arrest_order();
    }
    return null;
  }
  close_arrest_order(): any {
    let cp: any;
    this.stage.close_dialog(this.arrest_order_layer);
    cp = this.stage.game.datastore.user_character_progress;
    if (!py.truthy(cp.identikit_help)) {
      this.obsure_folder_close();
      this.stage.show_help_dialog(101, 1000, undefined, py.bind(this, "clarify_folder_close"));
      cp.identikit_help = true;
    }
    return null;
  }
  button_click(item: any, args: any): any {
    if (py.eq(item, this.close_button)) {
      if (py.truthy(this.pending_changes_to_save)) {
        this.stage.save_progress(false);
        this.pending_changes_to_save = false;
      }
      this.stage.render();
      this.click_sound.play();
      this.close_folder();
    } else if (py.eq(item, this.next_button)) {
      if ((this.active_layer === 1)) {
        this.update_active_layer(2);
      }
    } else if (py.eq(item, this.previous_button)) {
      if ((this.active_layer === 2)) {
        this.update_active_layer(1);
      }
    } else if ((py.eq(item, this.case_button) && !py.eq(this.active_layer, CASE) && !py.eq(this.active_layer, CASE_EXTENDED))) {
      this.update_active_layer(CASE);
    } else if ((py.eq(item, this.identikit_button) && !py.eq(this.active_layer, IDENTIKIT))) {
      this.update_active_layer(IDENTIKIT);
    } else if ((py.eq(item, this.witness_button) && !py.eq(this.active_layer, WITNESS))) {
      this.update_active_layer(WITNESS);
    }
    return null;
  }
  select_witnesses(): any {
    if (!py.eq(this.active_layer, WITNESS)) {
      this.update_active_layer(WITNESS);
    }
    return null;
  }
  identikit_button_click(item: any, args: any): any {
    let arrest_order_thief, folder_thief, large_image, large_image_side: any;
    if ((this.stage.game.datastore.user_character_progress.case.arrest_order_thief == null)) {
      if (py.truthy(this.identikit_layer.contains(item))) {
        for (folder_thief of py.iter(this.list_identikit_thieves)) {
          if (py.eq(item, folder_thief.identikit_item_image)) {
            large_image = assets.load_image(folder_thief.thief.identikit_large_image_front);
            large_image_side = assets.load_image(folder_thief.thief.identikit_large_image_side);
            this.identikit_thief_image.set_image(large_image);
            this.identikit_thief_image_side.set_image(large_image_side);
            this.identikit_thief_name.set_text(folder_thief.thief.name);
            this.identikit_thief_nickname.set_text(folder_thief.thief.nickname);
            this.identikit_thief_age.set_text(folder_thief.thief.age);
            this.identikit_thief_description.set_text(folder_thief.thief.description);
            this.obsure_folder_close();
            this.stage.show_dialog(this.identikit_thief_layer, py.bind(this, "identikit_thief_handle_event"), undefined, undefined, py.bind(this, "clarify_folder_close"));
            this.stage.render();
            this.popup_sound.play();
          }
        }
      }
    } else if (py.eq(item, this.arrest_order_thief_image)) {
      arrest_order_thief = this.stage.game.datastore.user_character_progress.case.arrest_order_thief;
      large_image = assets.load_image(arrest_order_thief.identikit_large_image_front);
      large_image_side = assets.load_image(arrest_order_thief.identikit_large_image_side);
      this.identikit_thief_image.set_image(large_image);
      this.identikit_thief_image_side.set_image(large_image_side);
      this.identikit_thief_name.set_text(arrest_order_thief.name);
      this.identikit_thief_nickname.set_text(arrest_order_thief.nickname);
      this.identikit_thief_age.set_text(arrest_order_thief.age);
      this.identikit_thief_description.set_text(arrest_order_thief.description);
      this.obsure_folder_close();
      this.stage.show_dialog(this.identikit_thief_layer, py.bind(this, "identikit_thief_handle_event"), undefined, undefined, py.bind(this, "clarify_folder_close"));
      this.stage.render();
      this.popup_sound.play();
    }
    return null;
  }
  witness_button_click(item: any, args: any): any {
    let i, witnesses: any;
    if (py.contains(this.witness_sets, item)) {
      i = py.m(this.witness_sets, "index", item);
      witnesses = this.stage.game.datastore.user_character_progress.case.list_visited_witnesses;
      if ((i < py.len(witnesses))) {
        this.obsure_folder_close();
        this.witness_dialog.show_witness(py.getitem(witnesses, i), py.bind(this, "clarify_folder_close"));
        this.stage.render();
        this.popup_sound.play();
      }
    }
    return null;
  }
  obsure_folder_close(): any {
    this.close_button.set_alpha(80);
    return null;
  }
  clarify_folder_close(): any {
    this.close_button.set_alpha(255);
    return null;
  }
  identikit_arrow_click(item: any, args: any): any {
    let case_, last_sex_choice, max: any;
    last_sex_choice = this.selected_sex_feature;
    if ((py.eq(item, this.sex_left_button) || py.eq(item, this.sex_right_button))) {
      max = (py.m(this.list_sex_features, "__len__") - 1);
      if (((this.selected_sex_feature > 0) && py.eq(item, this.sex_left_button))) {
        this.selected_sex_feature = (this.selected_sex_feature - 1);
      } else if (((this.selected_sex_feature < max) && py.eq(item, this.sex_right_button))) {
        this.selected_sex_feature = py.add(this.selected_sex_feature, 1);
      } else if (((this.selected_sex_feature === 0) && py.eq(item, this.sex_left_button))) {
        this.selected_sex_feature = max;
      } else if ((py.eq(this.selected_sex_feature, max) && py.eq(item, this.sex_right_button))) {
        this.selected_sex_feature = 0;
      }
    }
    if ((py.eq(item, this.height_left_button) || py.eq(item, this.height_right_button))) {
      max = (py.m(this.list_height_features_male, "__len__") - 1);
      if (((this.selected_height_feature > 0) && py.eq(item, this.height_left_button))) {
        this.selected_height_feature = (this.selected_height_feature - 1);
      } else if (((this.selected_height_feature < max) && py.eq(item, this.height_right_button))) {
        this.selected_height_feature = py.add(this.selected_height_feature, 1);
      } else if (((this.selected_height_feature === 0) && py.eq(item, this.height_left_button))) {
        this.selected_height_feature = max;
      } else if ((py.eq(this.selected_height_feature, max) && py.eq(item, this.height_right_button))) {
        this.selected_height_feature = 0;
      }
    }
    if ((py.eq(item, this.hair_left_button) || py.eq(item, this.hair_right_button))) {
      max = (py.m(this.list_hair_features, "__len__") - 1);
      if (((this.selected_hair_feature > 0) && py.eq(item, this.hair_left_button))) {
        this.selected_hair_feature = (this.selected_hair_feature - 1);
      } else if (((this.selected_hair_feature < max) && py.eq(item, this.hair_right_button))) {
        this.selected_hair_feature = py.add(this.selected_hair_feature, 1);
      } else if (((this.selected_hair_feature === 0) && py.eq(item, this.hair_left_button))) {
        this.selected_hair_feature = max;
      } else if ((py.eq(this.selected_hair_feature, max) && py.eq(item, this.hair_right_button))) {
        this.selected_hair_feature = 0;
      }
    }
    if ((py.eq(item, this.distinctive_left_button) || py.eq(item, this.distinctive_right_button))) {
      max = (py.m(this.list_distinctive_features, "__len__") - 1);
      if (((this.selected_distinctive_feature > 0) && py.eq(item, this.distinctive_left_button))) {
        this.selected_distinctive_feature = (this.selected_distinctive_feature - 1);
      } else if (((this.selected_distinctive_feature < max) && py.eq(item, this.distinctive_right_button))) {
        this.selected_distinctive_feature = py.add(this.selected_distinctive_feature, 1);
      } else if (((this.selected_distinctive_feature === 0) && py.eq(item, this.distinctive_left_button))) {
        this.selected_distinctive_feature = max;
      } else if ((py.eq(this.selected_distinctive_feature, max) && py.eq(item, this.distinctive_right_button))) {
        this.selected_distinctive_feature = 0;
      }
    }
    this.update_identikit(last_sex_choice);
    this.stage.render();
    this.flip_option_sound.play();
    case_ = this.stage.game.datastore.user_character_progress.case;
    case_.list_selected_features = [];
    py.m(case_.list_selected_features, "append", this.selected_sex_feature);
    py.m(case_.list_selected_features, "append", this.selected_height_feature);
    py.m(case_.list_selected_features, "append", this.selected_hair_feature);
    py.m(case_.list_selected_features, "append", this.selected_distinctive_feature);
    this.mark_pending_changes_to_save(true);
    return null;
  }
  update_identikit(last_sex_choice: any): any {
    let case_thief: any;
    this.identikit_sex_text.set_text(py.getitem(this.list_sex_features, this.selected_sex_feature));
    this.identikit_hair_text.set_text(py.getitem(this.list_hair_features, this.selected_hair_feature));
    this.identikit_distinctive_text.set_text(py.getitem(this.list_distinctive_features, this.selected_distinctive_feature));
    if (((this.selected_sex_feature === 1) || ((last_sex_choice === 1) && (this.selected_sex_feature === 0)) || ((last_sex_choice === 0) && (this.selected_sex_feature === 0)))) {
      this.identikit_height_text.set_text(py.getitem(this.list_height_features_male, this.selected_height_feature));
    } else if (((this.selected_sex_feature === 2) || ((last_sex_choice === 2) && (this.selected_sex_feature === 0)))) {
      this.identikit_height_text.set_text(py.getitem(this.list_height_features_female, this.selected_height_feature));
    }
    case_thief = this.stage.game.datastore.user_character_progress.case.thief;
    if ((py.eq(this.selected_sex_feature, case_thief.sex) && py.eq(this.selected_height_feature, case_thief.height) && py.eq(this.selected_distinctive_feature, case_thief.distinctive_feature) && py.eq(this.selected_hair_feature, case_thief.hair))) {
      this._right_identikit_selection = true;
    } else {
      this._right_identikit_selection = false;
    }
    this.update_images();
    return null;
  }
  load_witnesses_data(): any {
    let case_, folder_witness, folder_witnesses, i, image, l, play_sound, witness: any;
    case_ = this.stage.game.datastore.user_character_progress.case;
    l = case_.list_visited_witnesses;
    folder_witnesses = case_.list_folder_witnesses;
    play_sound = true;
    i = 0;
    for (witness of py.iter(l)) {
      if (!py.truthy(witness.identikit_added)) {
        witness.identikit_added = true;
        folder_witness = new this.FolderWitness(witness);
        image = assets.load_image(folder_witness.witness.image);
        folder_witness.image = new ItemImage(py.add(py.getitem(this.witness_sets, i).get_left(), 8), py.add(py.getitem(this.witness_sets, i).get_top(), 9), image, null);
        folder_witness.underline = new ItemImage(py.add(py.getitem(this.witness_sets, i).get_left(), 8), py.add(py.getitem(this.witness_sets, i).get_top(), 78), this.witness_underline, null);
        folder_witness.name = new ItemText(py.add(py.getitem(this.witness_sets, i).get_left(), 9), py.add(py.getitem(this.witness_sets, i).get_top(), 61), this.font_22, 0, folder_witness.witness.name, [157, 21, 21], null, 200, 30);
        folder_witness.city = new ItemText(py.add(py.getitem(this.witness_sets, i).get_left(), 9), py.add(py.getitem(this.witness_sets, i).get_top(), 84), this.font_18, 10, folder_witness.witness.city.name, [51, 51, 51], null, 200, 30);
        folder_witness.department = new ItemText(py.add(py.getitem(this.witness_sets, i).get_left(), 9), py.add(py.getitem(this.witness_sets, i).get_top(), 98), this.font_20, 0, folder_witness.witness.department.name, [102, 102, 102], null, 200, 30);
        py.m(this.witness_data_layer, "add", folder_witness.image);
        py.m(this.witness_data_layer, "add", folder_witness.underline);
        py.m(this.witness_data_layer, "add", folder_witness.name);
        py.m(this.witness_data_layer, "add", folder_witness.department);
        py.m(this.witness_data_layer, "add", folder_witness.city);
        py.getitem(this.witness_sets, i).set_rollover(this.witness_set_rollover_image, this.rollover_sound);
        if (!py.contains(folder_witnesses, witness)) {
          animations.fade_in_item(folder_witness.image);
          if (py.truthy(play_sound)) {
            play_sound = false;
            this.stage.render();
            this.witness_fade_in_sound.play();
          }
          py.m(folder_witnesses, "append", witness);
          this.mark_pending_changes_to_save(false);
        }
      }
      i = i + 1;
      if ((i >= 3)) {
        break;
      }
    }
    return null;
  }
  get_list_identikit(): any {
    let cross_back, cross_image, folder_thief, i, image, pos, thief_rollover, x, y, z: any;
    this.list_identikit_thieves = [];
    this.list_identikit_crosses = [];
    cross_back = assets.load_image("p0_folder_identikit_suspect_crossed.png");
    thief_rollover = assets.load_image("p0_thieves_small_rollovershadow.png");
    x = 325;
    y = 110;
    for (i of py.range(3)) {
      for (z of py.range(3)) {
        pos = py.add(py.add(z, i), py.add(i, i));
        folder_thief = new this.FolderThief(py.getitem(this.stage.game.datastore.user_character_progress.case.list_thieves, pos));
        image = assets.load_image(folder_thief.thief.identikit_image);
        folder_thief.identikit_item_image = new ItemImage(x, y, image, null);
        py.m(this.list_identikit_thieves, "append", folder_thief);
        py.m(this.identikit_layer, "add", folder_thief.identikit_item_image);
        cross_image = new ItemImage(py.getitem(this.list_identikit_thieves, pos).identikit_item_image.get_left(), py.getitem(this.list_identikit_thieves, pos).identikit_item_image.get_top(), cross_back, null);
        py.m(this.list_identikit_crosses, "append", cross_image);
        py.getitem(this.list_identikit_thieves, pos).identikit_item_image.add_event_handler(ItemEvent.CLICK, py.bind(this, "identikit_button_click"));
        if ((this.stage.game.datastore.user_character_progress.case.arrest_order_thief == null)) {
          py.getitem(this.list_identikit_thieves, pos).identikit_item_image.set_rollover(thief_rollover, this.rollover_sound);
        }
        x = x + 70;
      }
      x = 325;
      y = y + 65;
    }
    return null;
  }
  update_images(): any {
    let distinctive_feature, hair, height, i, pos, sex: any;
    this.clean_identikit();
    sex = this.selected_sex_feature;
    height = this.selected_height_feature;
    hair = this.selected_hair_feature;
    distinctive_feature = this.selected_distinctive_feature;
    for (i of py.range(9)) {
      if (((!py.eq(py.getitem(this.list_identikit_thieves, i).thief.sex, sex) && (sex !== 0)) || (!py.eq(py.getitem(this.list_identikit_thieves, i).thief.height, height) && (height !== 0)) || (!py.eq(py.getitem(this.list_identikit_thieves, i).thief.hair, hair) && (hair !== 0)) || (!py.eq(py.getitem(this.list_identikit_thieves, i).thief.distinctive_feature, distinctive_feature) && (distinctive_feature !== 0)))) {
        if (!py.truthy(this.identikit_layer.contains(py.getitem(this.list_identikit_crosses, i)))) {
          py.m(this.identikit_layer, "add", py.getitem(this.list_identikit_crosses, i));
          py.setitem(this.identikit_image_matrix, i, "x");
        }
      }
    }
    if ((py.m(this.identikit_image_matrix, "count", "x") === 8)) {
      this.arrest_order_box.set_image(this.arrest_order_working_image);
      this.arrest_order_button.set_rollover(this.arrest_order_working_rollover_image, this.rollover_sound, (-1), (-20));
      this.arrest_order_is_working = true;
      pos = py.m(this.identikit_image_matrix, "index", "");
      this.set_circle_outlined_image(pos);
      py.m(this.identikit_layer, "add", this.circle_outlined_image);
    } else {
      this.arrest_order_box.set_image(this.arrest_order_not_working_image);
      this.arrest_order_button.set_rollover(null, null);
      this.arrest_order_is_working = false;
    }
    return null;
  }
  set_circle_outlined_image(position: any): any {
    if (((position === 0) || (position === 3) || (position === 6))) {
      this.circle_outlined_image.set_left(325);
    } else if (((position === 1) || (position === 4) || (position === 7))) {
      this.circle_outlined_image.set_left(395);
    } else if (((position === 2) || (position === 5) || (position === 8))) {
      this.circle_outlined_image.set_left(465);
    }
    if (((position >= 0) && (position <= 2))) {
      this.circle_outlined_image.set_top(110);
    } else if (((position >= 3) && (position <= 5))) {
      this.circle_outlined_image.set_top(175);
    } else if (((position >= 6) && (position <= 8))) {
      this.circle_outlined_image.set_top(240);
    }
    return null;
  }
  clean_identikit(): any {
    let item: any;
    if (py.truthy(this.identikit_layer.contains(this.circle_outlined_image))) {
      py.m(this.identikit_layer, "remove", this.circle_outlined_image);
    }
    for (item of py.iter(this.list_identikit_crosses)) {
      py.m(this.identikit_layer, "remove", item);
    }
    this.identikit_image_matrix = (() => { const $r: any[] = []; let x; for (x of py.iter(py.xrange(9))) { $r.push(""); } return $r; })();
    return null;
  }
  set_up_identikit(): any {
    this.set_up_identikit_background();
    this.set_up_identikit_texts();
    this.set_up_identikit_buttons();
    this.load_identikit_data();
    this.set_up_arrest_order_dialog();
    this.identikit_loaded = true;
    return null;
  }
  set_up_witness(): any {
    this.witness_dialog = new witness.Witness(this.stage);
    this.set_up_witness_background();
    this.set_up_witness_texts();
    this.set_up_witness_buttons();
    this.witness_loaded = true;
    return null;
  }
  mark_pending_changes_to_save(save_timer: any): any {
    let key: any;
    this.pending_changes_to_save = true;
    if (py.truthy(save_timer)) {
      key = "save_folder_pending_changes";
      this.stage.stop_timer(key);
      this.stage.start_timer(key, 1000, py.bind(this, "on_save_pending_changes"));
    }
    return null;
  }
  on_save_pending_changes(key: any, data: any): any {
    this.stage.stop_timer(key);
    if (py.truthy(this.pending_changes_to_save)) {
      this.stage.save_progress(false);
      this.pending_changes_to_save = false;
    }
    return null;
  }
  update_active_layer(layer: any): any {
    let case_: any;
    this.clean_screen();
    if (py.truthy(this.pending_changes_to_save)) {
      this.stage.save_progress(false);
      this.pending_changes_to_save = false;
    }
    if (py.eq(layer, CASE)) {
      this.active_layer = CASE;
      this.stage.add_layer(this.case_layer);
      this.stage.add_layer(this.case_data_layer);
      this.case_button.set_image(this.case_button_active_image);
      this.case_button.set_rollover_image(null, null);
      this.identikit_button.set_image(this.identikit_button_inactive_image);
      this.identikit_button.set_rollover_image(this.identikit_button_rollover_image, this.rollover_sound);
      this.witness_button.set_image(this.witness_button_inactive_image);
      this.witness_button.set_rollover_image(this.witness_button_rollover_image, this.rollover_sound);
      this.next_button.set_visible(true);
      this.previous_button.set_visible(false);
      this.load_agent_name();
    } else if (py.eq(layer, CASE_EXTENDED)) {
      this.active_layer = CASE_EXTENDED;
      this.stage.add_layer(this.case_layer);
      this.stage.add_layer(this.case_extended_layer);
      this.case_button.set_image(this.case_button_active_image);
      this.case_button.set_rollover_image(null, null);
      this.identikit_button.set_image(this.identikit_button_inactive_image);
      this.identikit_button.set_rollover_image(this.identikit_button_rollover_image, this.rollover_sound);
      this.witness_button.set_image(this.witness_button_inactive_image);
      this.witness_button.set_rollover_image(this.witness_button_rollover_image, this.rollover_sound);
      this.next_button.set_visible(false);
      this.previous_button.set_visible(true);
      this.load_case_text();
    } else if (py.eq(layer, IDENTIKIT)) {
      if (!py.truthy(this.identikit_loaded)) {
        this.set_up_identikit();
      }
      this.active_layer = IDENTIKIT;
      this.stage.add_layer(this.identikit_layer);
      this.case_button.set_image(this.case_button_inactive_image);
      this.case_button.set_rollover_image(this.case_button_rollover_image, this.rollover_sound);
      this.identikit_button.set_image(this.identikit_button_active_image);
      this.identikit_button.set_rollover_image(null, null);
      this.witness_button.set_image(this.witness_button_inactive_image);
      this.witness_button.set_rollover_image(this.witness_button_rollover_image, this.rollover_sound);
      this.next_button.set_visible(false);
      this.previous_button.set_visible(false);
      case_ = this.stage.game.datastore.user_character_progress.case;
      this.selected_sex_feature = py.getitem(case_.list_selected_features, 0);
      this.selected_height_feature = py.getitem(case_.list_selected_features, 1);
      this.selected_hair_feature = py.getitem(case_.list_selected_features, 2);
      this.selected_distinctive_feature = py.getitem(case_.list_selected_features, 3);
      this.update_identikit(this.selected_sex_feature);
      if ((this.stage.game.datastore.user_character_progress.case.arrest_order_thief != null)) {
        this.identikit_arrest_order_sent();
      }
    } else if (py.eq(layer, WITNESS)) {
      if (!py.truthy(this.witness_loaded)) {
        this.set_up_witness();
      }
      this.active_layer = WITNESS;
      this.stage.add_layer(this.witness_layer);
      this.stage.add_layer(this.witness_data_layer);
      this.case_button.set_image(this.case_button_inactive_image);
      this.case_button.set_rollover_image(this.case_button_rollover_image, this.rollover_sound);
      this.identikit_button.set_image(this.identikit_button_inactive_image);
      this.identikit_button.set_rollover_image(this.identikit_button_rollover_image, this.rollover_sound);
      this.witness_button.set_image(this.witness_button_active_image);
      this.witness_button.set_rollover_image(null, null);
      this.next_button.set_visible(false);
      this.previous_button.set_visible(false);
      this.load_witnesses_data();
    }
    this.stage.render();
    this.turn_page_sound.play();
    return null;
  }
  disable_identikit_tab(): any {
    this.identikit_button.set_rollover_image(null, null);
    this.identikit_button.remove_event_handler(ItemEvent.CLICK, py.bind(this, "button_click"));
    return null;
  }
  disable_case_tab(): any {
    this.case_button.set_rollover_image(null, null);
    this.case_button.remove_event_handler(ItemEvent.CLICK, py.bind(this, "button_click"));
    return null;
  }
  disable_witness_tab(): any {
    this.witness_button.set_rollover_image(null, null);
    this.witness_button.remove_event_handler(ItemEvent.CLICK, py.bind(this, "button_click"));
    return null;
  }
  disable_close_button(): any {
    this.close_button.set_rollover_image(null, null);
    this.close_button.remove_event_handler(ItemEvent.CLICK, py.bind(this, "button_click"));
    return null;
  }
  disable_previous_button(): any {
    this.previous_button.set_rollover_image(null, null);
    this.previous_button.remove_event_handler(ItemEvent.CLICK, py.bind(this, "button_click"));
    return null;
  }
  enable_identikit_tab(): any {
    this.identikit_button.set_rollover_image(this.identikit_button_rollover_image, this.rollover_sound);
    this.identikit_button.add_event_handler(ItemEvent.CLICK, py.bind(this, "button_click"));
    return null;
  }
  enable_case_tab(): any {
    this.case_button.set_rollover_image(this.case_button_rollover_image, this.rollover_sound);
    this.case_button.add_event_handler(ItemEvent.CLICK, py.bind(this, "button_click"));
    return null;
  }
  enable_witness_tab(): any {
    this.witness_button.set_rollover_image(this.witness_button_rollover_image, this.rollover_sound);
    this.witness_button.add_event_handler(ItemEvent.CLICK, py.bind(this, "button_click"));
    return null;
  }
  enable_close_button(): any {
    this.close_button.set_rollover_image(this.close_button_rollover_image, this.rollover_sound);
    this.close_button.add_event_handler(ItemEvent.CLICK, py.bind(this, "button_click"));
    return null;
  }
  enable_previous_button(): any {
    this.previous_button.set_rollover_image(this.previous_button_rollover_image, this.rollover_sound);
    this.previous_button.add_event_handler(ItemEvent.CLICK, py.bind(this, "button_click"));
    return null;
  }
  disable_hair_buttons(): any {
    this.hair_left_button.set_rollover_image(null, null);
    this.hair_left_button.remove_event_handler(ItemEvent.CLICK, py.bind(this, "identikit_arrow_click"));
    this.hair_left_button.set_pressed_image(null);
    this.hair_right_button.set_rollover_image(null, null);
    this.hair_right_button.remove_event_handler(ItemEvent.CLICK, py.bind(this, "identikit_arrow_click"));
    this.hair_right_button.set_pressed_image(null);
    return null;
  }
  disable_sex_buttons(): any {
    this.sex_left_button.set_rollover_image(null, null);
    this.sex_left_button.remove_event_handler(ItemEvent.CLICK, py.bind(this, "identikit_arrow_click"));
    this.sex_left_button.set_pressed_image(null);
    this.sex_right_button.set_rollover_image(null, null);
    this.sex_right_button.remove_event_handler(ItemEvent.CLICK, py.bind(this, "identikit_arrow_click"));
    this.sex_right_button.set_pressed_image(null);
    return null;
  }
  disable_distinctive_buttons(): any {
    this.distinctive_left_button.set_rollover_image(null, null);
    this.distinctive_left_button.remove_event_handler(ItemEvent.CLICK, py.bind(this, "identikit_arrow_click"));
    this.distinctive_left_button.set_pressed_image(null);
    this.distinctive_right_button.set_rollover_image(null, null);
    this.distinctive_right_button.remove_event_handler(ItemEvent.CLICK, py.bind(this, "identikit_arrow_click"));
    this.distinctive_right_button.set_pressed_image(null);
    return null;
  }
  disable_height_buttons(): any {
    this.height_left_button.set_rollover_image(null, null);
    this.height_left_button.remove_event_handler(ItemEvent.CLICK, py.bind(this, "identikit_arrow_click"));
    this.height_left_button.set_pressed_image(null);
    this.height_right_button.set_rollover_image(null, null);
    this.height_right_button.remove_event_handler(ItemEvent.CLICK, py.bind(this, "identikit_arrow_click"));
    this.height_right_button.set_pressed_image(null);
    return null;
  }
  enable_hair_buttons(): any {
    this.disable_hair_buttons();
    this.hair_left_button.set_rollover_image(this.arrow_left_image_rollover, this.rollover_sound);
    this.hair_left_button.add_event_handler(ItemEvent.CLICK, py.bind(this, "identikit_arrow_click"));
    this.hair_left_button.set_pressed_image(this.arrow_left_image_pressed);
    this.hair_right_button.set_rollover_image(this.arrow_right_image_rollover, this.rollover_sound);
    this.hair_right_button.add_event_handler(ItemEvent.CLICK, py.bind(this, "identikit_arrow_click"));
    this.hair_right_button.set_pressed_image(this.arrow_right_image_pressed);
    return null;
  }
  enable_sex_buttons(): any {
    this.disable_sex_buttons();
    this.sex_left_button.set_rollover_image(this.arrow_left_image_rollover, this.rollover_sound);
    this.sex_left_button.add_event_handler(ItemEvent.CLICK, py.bind(this, "identikit_arrow_click"));
    this.sex_left_button.set_pressed_image(this.arrow_left_image_pressed);
    this.sex_right_button.set_rollover_image(this.arrow_right_image_rollover, this.rollover_sound);
    this.sex_right_button.add_event_handler(ItemEvent.CLICK, py.bind(this, "identikit_arrow_click"));
    this.sex_right_button.set_pressed_image(this.arrow_right_image_pressed);
    return null;
  }
  enable_height_buttons(): any {
    this.disable_height_buttons();
    this.height_left_button.set_rollover_image(this.arrow_left_image_rollover, this.rollover_sound);
    this.height_left_button.add_event_handler(ItemEvent.CLICK, py.bind(this, "identikit_arrow_click"));
    this.height_left_button.set_pressed_image(this.arrow_left_image_pressed);
    this.height_right_button.set_rollover_image(this.arrow_right_image_rollover, this.rollover_sound);
    this.height_right_button.add_event_handler(ItemEvent.CLICK, py.bind(this, "identikit_arrow_click"));
    this.height_right_button.set_pressed_image(this.arrow_right_image_pressed);
    return null;
  }
  enable_distinctive_buttons(): any {
    this.disable_distinctive_buttons();
    this.distinctive_left_button.set_rollover_image(this.arrow_left_image_rollover, this.rollover_sound);
    this.distinctive_left_button.add_event_handler(ItemEvent.CLICK, py.bind(this, "identikit_arrow_click"));
    this.distinctive_left_button.set_pressed_image(this.arrow_left_image_pressed);
    this.distinctive_right_button.set_rollover_image(this.arrow_right_image_rollover, this.rollover_sound);
    this.distinctive_right_button.add_event_handler(ItemEvent.CLICK, py.bind(this, "identikit_arrow_click"));
    this.distinctive_right_button.set_pressed_image(this.arrow_right_image_pressed);
    return null;
  }
  disable_thieves(): any {
    let thief: any;
    for (thief of py.iter(this.list_identikit_thieves)) {
      thief.identikit_item_image.remove_event_handler(ItemEvent.CLICK, py.bind(this, "identikit_button_click"));
      thief.identikit_item_image.set_rollover(null, null);
    }
    return null;
  }
  clean_screen(): any {
    if (py.eq(this.active_layer, CASE)) {
      this.stage.remove_layer(this.case_layer);
      this.stage.remove_layer(this.case_data_layer);
    } else if (py.eq(this.active_layer, CASE_EXTENDED)) {
      this.stage.remove_layer(this.case_layer);
      this.stage.remove_layer(this.case_extended_layer);
    } else if (py.eq(this.active_layer, IDENTIKIT)) {
      this.stage.remove_layer(this.identikit_layer);
    } else if (py.eq(this.active_layer, WITNESS)) {
      this.stage.remove_layer(this.witness_layer);
      this.stage.remove_layer(this.witness_data_layer);
    }
    return null;
  }
  add_start_layer(start_page: any = CASE): any {
    this.stage.add_layer(this.folder_back_layer);
    this.update_active_layer(start_page);
    return null;
  }
  static FolderThief: any = class FolderThief {
    constructor(thief: any) {
      this.thief = thief;
      this.identikit_item_image = "";
      return;
    }
  };
  static FolderWitness: any = class FolderWitness {
    constructor(witness: any) {
      this.witness = witness;
      this.image = "";
      this.name = "";
      this.location = "";
      this.department = "";
      return;
    }
  };
}
(Folder as any).prototype.FolderThief = (Folder as any).FolderThief;
(Folder as any).prototype.FolderWitness = (Folder as any).FolderWitness;
py.register("game/stages/folder", $self);
export function $set(name: string, v: any): void {
  switch (name) {
    case "CASE": CASE = v; break;
    case "CASE_EXTENDED": CASE_EXTENDED = v; break;
    case "IDENTIKIT": IDENTIKIT = v; break;
    case "WITNESS": WITNESS = v; break;
  }
}
