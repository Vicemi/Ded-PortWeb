// @ts-nocheck
// Generated from the original game code (see MODLOG.md). Do not edit by hand.
import * as py from '../../runtime/py';
import { BlindDirection } from '../../engine/animations';
import { ItemEvent } from '../../runtime/prelude';
import { ItemImage } from '../../runtime/prelude';
import { ItemMask } from '../../runtime/prelude';
import { KEYDOWN } from '../../runtime/prelude';
import { K_ESCAPE } from '../../runtime/prelude';
import { Layer } from '../../runtime/prelude';
import { Stage } from '../../runtime/prelude';
import * as animations from '../../engine/animations';
import { assets } from '../../runtime/prelude';
import * as case_ from './case';
import * as mainmenu from './mainmenu';

export class StartScreenStage extends Stage {
  constructor(game: any, initial_mainmenu: any = false) {
    super(game);
    this.start_layer = null;
    this.initial_mainmenu = initial_mainmenu;
    this.showing_main_menu = false;
    return;
  }
  prepare(): any {
    this.font = assets.load_font("evilgeniusbb_reg.ttf", 24);
    this.music_intro = assets.load_music("p1_music_intro.ogg");
    this.music_loop = assets.load_music("p1_music_loop.ogg");
    this.click_sound = assets.load_sound("GUI_Click.ogg");
    this.rollover_sound = assets.load_sound("GUI_roll_over.ogg");
    this.render();
    this.play_music(this.music_intro, this.music_loop);
    if (py.truthy(this.initial_mainmenu)) {
      this.show_mainmenu(true);
    } else {
      this.show_tc_logo();
      animations.wait(this, 3606, py.bind(this, "show_start_screen"));
    }
    return null;
  }
  show_tc_logo(): any {
    let ceibal_item, ceibal_logo, copy_image, copy_item, logo_image, logo_item: any;
    this.tc_layer = new Layer();
    this.add_layer(this.tc_layer);
    logo_image = assets.load_image("p0_logomain_logo.jpg");
    logo_item = new ItemImage(220, 77, logo_image);
    py.m(this.tc_layer, "add", logo_item);
    copy_image = assets.load_image("p0_copyright_copy.jpg");
    copy_item = new ItemImage(181, 417, copy_image);
    py.m(this.tc_layer, "add", copy_item);
    ceibal_logo = assets.load_image("p0_ceibal_logo.jpg");
    ceibal_item = new ItemImage(527, 7, ceibal_logo);
    py.m(this.tc_layer, "add", ceibal_item);
    animations.blind_layer(this.tc_layer, BlindDirection.SHOW_DOWN, null, 450, null, false);
    return null;
  }
  show_start_screen(): any {
    let background, background_image, blink_text: any;
    if (!py.truthy(this.showing_main_menu)) {
      this.start_layer = new Layer();
      background_image = assets.load_image("p0_presentation_back_2.jpg");
      background = new ItemImage(0, 0, background_image);
      py.m(this.start_layer, "add", background);
      this.start_info_item = new ItemMask(0, 0, [600, 450]);
      py.m(this.start_layer, "add", this.start_info_item);
      animations.wait(this, 366, py.bind(this, "add_start_info_item"));
      blink_text = assets.load_image("p0_presentation_btn_2.jpg");
      this.blink_text_image = new ItemImage(166, 398, blink_text);
      py.m(this.start_layer, "add", this.blink_text_image);
      this.blink_text_image.set_visible(false);
      this.add_layer(this.start_layer);
      animations.blind_layer(this.tc_layer, animations.BlindDirection.HIDE_DOWN, null, 450);
      animations.blind_layer(this.start_layer, animations.BlindDirection.SHOW_DOWN, null, 450, py.bind(this, "blind_set_up_start_callback"));
    }
    return null;
  }
  add_start_info_item(): any {
    if (!py.truthy(this.showing_main_menu)) {
      this.start_info_item.add_event_handler(ItemEvent.CLICK, py.bind(this, "button_click"));
    }
    return null;
  }
  blind_set_up_start_callback(layer: any): any {
    if (!py.truthy(this.is_timer_started("timer_start"))) {
      this.start_timer("timer_start", 390, py.bind(this, "update_timer"));
    }
    return null;
  }
  update_timer(item: any, args: any): any {
    if (py.truthy(this.blink_text_image.get_visible())) {
      this.blink_text_image.set_visible(false);
    } else {
      this.blink_text_image.set_visible(true);
    }
    return null;
  }
  button_click(item: any, args: any): any {
    this.render();
    this.click_sound.play();
    this.show_mainmenu();
    return null;
  }
  handle_event(e: any): any {
    if (py.eq(e.type, KEYDOWN)) {
      if ((py.eq(e.key, K_ESCAPE) && !py.truthy(this.showing_main_menu))) {
        this.render();
        this.click_sound.play();
        this.remove_layer(this.tc_layer);
        this.show_mainmenu(true);
        return true;
      }
    }
    return null;
  }
  show_mainmenu(apply_blind: any = true): any {
    if ((this.start_layer == null)) {
      this.blind_hide_start_callback(this.start_layer, apply_blind);
    } else {
      animations.blind_layer(this.start_layer, animations.BlindDirection.HIDE_DOWN, null, 450, py.bind(this, "blind_hide_start_callback"));
    }
    return null;
  }
  blind_hide_start_callback(layer: any, apply_blind: any = true): any {
    let main: any;
    this.showing_main_menu = true;
    main = new mainmenu.MainMenu(this);
    main.show_mainmenu(false, null, apply_blind);
    return null;
  }
}
