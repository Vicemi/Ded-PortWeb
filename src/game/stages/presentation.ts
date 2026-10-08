// @ts-nocheck
// Generated from the original game code (see MODLOG.md). Do not edit by hand.
import * as py from '../../runtime/py';
import { ERRORS_URL } from '../data/datastore';
import { ItemEvent } from '../../runtime/prelude';
import { ItemImage } from '../../runtime/prelude';
import { ItemMask } from '../../runtime/prelude';
import { ItemText } from '../../runtime/prelude';
import { KEYDOWN } from '../../runtime/prelude';
import { K_ESCAPE } from '../../runtime/prelude';
import { K_SPACE } from '../../runtime/prelude';
import { Layer } from '../../runtime/prelude';
import { STATS_URL } from '../data/datastore';
import { Stage } from '../../runtime/prelude';
import { UPDATE_URL } from '../data/datastore';
import { VERSION } from '../data/datastore';
import * as animations from '../../engine/animations';
import { assets } from '../../runtime/prelude';
import * as external from '../../runtime/external';
import { pygame } from '../../runtime/prelude';
import * as startscreen from './startscreen';
import * as stats from '../../runtime/stats';
import * as web from '../../runtime/web';
import * as $self from './presentation';

export function send_error_cb(result: any): any {
  if (!py.truthy(result.error)) {
    stats.delete_error_data();
  }
  return null;
}
export class PresentationStage extends Stage {
  constructor(game: any) {
    super(game);
    return;
  }
  initialize(): any {
    let data, error_data: any;
    data = py.mkdict([["current", VERSION]]);
    error_data = stats.get_error_data(10000);
    web.query(UPDATE_URL, data, {callback: this.game.update_manager.web_cb});
    web.send_data(STATS_URL, py.mkdict([["current", VERSION], ["stats", this.game.stats.get_data()]]), {compressed: true});
    if (py.truthy(error_data)) {
      web.send_data(ERRORS_URL, py.mkdict([["current", py.fmt("%.2f", VERSION)], ["error", py.m(error_data, "decode", "utf-8", "replace")]]), {encoding: "json", callback: send_error_cb, compressed: true});
      error_data = undefined;
    }
    this.actual_screen = 0;
    this.actual_item = 0;
    this.actual_layer = null;
    this.next_item_wait = null;
    this.caution_screen_shown = !py.truthy(external.other_activities_running());
    this.font_13 = assets.load_font("evilgeniusbb_reg.ttf", 13);
    this.font_14 = assets.load_font("evilgeniusbb_reg.ttf", 14);
    this.font_13_bold = assets.load_font("evilgeniusbb_bld.ttf", 13);
    this.music_intro = assets.load_music("p2_music_intro.ogg");
    this.music_loop = assets.load_music("p2_music_loop.ogg");
    this.rollover_sound = assets.load_sound("GUI_roll_over.ogg");
    this.continue_sound = assets.load_sound("GUI_Click.ogg");
    return null;
  }
  prepare(): any {
    let button, image, layer, text: any;
    if (py.truthy(this.caution_screen_shown)) {
      this.start_presentation();
    } else {
      layer = new Layer();
      this.add_layer(layer);
      image = assets.load_image("p0_gamewarning_backslide.png");
      py.m(layer, "add", new ItemImage(132, 111, image));
      text = new ItemText(163, 183, this.font_14, 13, "Se recomienda cerrar todas las aplicaciones para el correcto funcionamiento del juego.", [153, 0, 0], null, 268, 56, 2, 2);
      py.m(layer, "add", text);
      button = new ItemImage(245, 265, assets.load_image("p0_gamewarning_btn_continuar_normal.png"));
      button.set_rollover_image(assets.load_image("p0_gamewarning_btn_continuar_rollover.png"), this.rollover_sound);
      button.add_event_handler(ItemEvent.CLICK, py.bind(this, "start_presentation"));
      py.m(layer, "add", button);
      this.caution_screen_shown = true;
    }
    return null;
  }
  start_presentation(...args: any[]): any {
    this.render();
    this.play_music(this.music_intro, this.music_loop);
    this.set_up_escape_button();
    this.show_next_screen();
    return null;
  }
  show_next_screen(): any {
    let index: any;
    if ((this.actual_screen !== 5)) {
      this.empty_layers();
      this.continue_button_layer = null;
      this.continue_visible = false;
      this.layer = new Layer();
      this.add_layer(this.layer);
      this.set_up_background();
      this.add_layer(this.escape_layer);
    } else {
      this.empty_layers([this.layer, this.escape_layer]);
      py.m(this.layer, "remove", this.screen_mask);
      index = py.m(this.layers, "index", this.layer);
      this.layer = new Layer();
      this.set_up_background();
      this.add_layer(this.layer, py.add(index, 1));
      this.continue_button_layer = null;
      this.continue_visible = false;
    }
    animations.blind_layer(this.layer, animations.BlindDirection.SHOW_DOWN, null, 450, py.bind(this, "blind_show_screen_callback"), false);
    return null;
  }
  blind_show_screen_callback(layer: any): any {
    this.add_fast_click_mask();
    this.show_next_item();
    return null;
  }
  add_fast_click_mask(): any {
    this.screen_mask = new ItemMask(0, 0, [600, 450]);
    this.screen_mask.add_event_handler(ItemEvent.CLICK, py.bind(this, "screen_click"));
    py.m(this.layer, "add", this.screen_mask);
    return null;
  }
  screen_click(item: any, args: any): any {
    if ((!py.truthy(this.continue_button_layer) && (this.actual_layer != null) && (this.actual_layer.get_stage() == null))) {
      if ((this.next_item_wait != null)) {
        animations.cancel_wait(this, this.next_item_wait);
      }
      this.add_next_item_with_blind();
    }
    return null;
  }
  set_up_background(): any {
    let background_image, background_item, background_surface, newspaper_image, newspaper_item_image, window_height, window_width: any;
    if ((this.actual_screen === 0)) {
      newspaper_image = assets.load_image("p0_intro_s1_background.jpg");
      newspaper_item_image = new ItemImage(0, 0, newspaper_image, null);
      py.m(this.layer, "add", newspaper_item_image);
    } else if ((this.actual_screen === 1)) {
      newspaper_image = assets.load_image("p0_intro_s2_background.jpg");
      newspaper_item_image = new ItemImage(0, 0, newspaper_image, null);
      py.m(this.layer, "add", newspaper_item_image);
    } else if ((this.actual_screen === 2)) {
      newspaper_image = assets.load_image("p0_intro_s3_background.jpg");
      newspaper_item_image = new ItemImage(0, 0, newspaper_image, null);
      py.m(this.layer, "add", newspaper_item_image);
    } else if ((this.actual_screen === 3)) {
      newspaper_image = assets.load_image("p0_intro_s4_background.jpg");
      newspaper_item_image = new ItemImage(0, 0, newspaper_image, null);
      py.m(this.layer, "add", newspaper_item_image);
    } else if ((this.actual_screen === 4)) {
      newspaper_image = assets.load_image("p0_intro_s5_background.jpg");
      newspaper_item_image = new ItemImage(0, 0, newspaper_image, null);
      py.m(this.layer, "add", newspaper_item_image);
    } else if ((this.actual_screen === 5)) {
      while ((py.len(this.layer.items) > 1)) {
        py.m(this.layer, "remove", py.getitem(this.layer.items, 1));
      }
      [window_width, window_height] = this.game.get_window_size();
      background_surface = new pygame.Surface([py.div(window_width, 2), py.div(window_height, 2)], pygame.SRCALPHA, 32);
      background_surface.fill([0, 0, 0, 180]);
      background_image = new assets.Image(background_surface);
      background_item = new ItemImage(0, 0, background_image);
      py.m(this.layer, "add", background_item);
      background_item = new ItemImage(py.div(window_width, 2), 0, background_image);
      py.m(this.layer, "add", background_item);
      background_item = new ItemImage(0, py.div(window_height, 2), background_image);
      py.m(this.layer, "add", background_item);
      background_item = new ItemImage(py.div(window_width, 2), py.div(window_height, 2), background_image);
      py.m(this.layer, "add", background_item);
    }
    return null;
  }
  set_up_escape_button(): any {
    let button_image, button_item, button_text_image, rollover_image: any;
    this.escape_layer = new Layer();
    button_image = assets.load_image("p0_escape_intro_btn_normal.png");
    rollover_image = assets.load_image("p0_escape_intro_btn_rollover.png");
    button_item = new ItemImage(545, 26, button_image);
    button_item.set_rollover_image(rollover_image, this.rollover_sound);
    button_item.add_event_handler(ItemEvent.CLICK, py.bind(this, "escape_button_click"));
    button_item.add_event_handler(ItemEvent.MOUSE_ENTER, py.bind(this, "escape_button_enter"));
    button_item.add_event_handler(ItemEvent.MOUSE_LEAVE, py.bind(this, "escape_button_leave"));
    py.m(this.escape_layer, "add", button_item);
    button_text_image = assets.load_image("p0_escape_intro_txt.png");
    this.escape_text_item = new ItemImage(433, 24, button_text_image);
    this.escape_text_item.set_visible(false);
    py.m(this.escape_layer, "add", this.escape_text_item);
    return null;
  }
  escape_button_click(item: any, args: any): any {
    this.render();
    this.continue_sound.play();
    this.skip_presentation();
    return null;
  }
  escape_button_enter(item: any, args: any): any {
    this.escape_text_item.set_visible(true);
    return null;
  }
  escape_button_leave(item: any, args: any): any {
    this.escape_text_item.set_visible(false);
    return null;
  }
  show_continue_button(): any {
    let continue_button, continue_image, continue_rollover_image: any;
    if (!py.truthy(this.continue_visible)) {
      this.actual_layer = new Layer();
      continue_image = assets.load_image("p0_endings_btn_continue_normal.png");
      continue_rollover_image = assets.load_image("p0_endings_btn_continue_rollover.png");
      continue_button = new ItemImage(233, 403, continue_image);
      continue_button.set_rollover_image(continue_rollover_image, this.rollover_sound);
      continue_button.add_event_handler(ItemEvent.CLICK, py.bind(this, "continue_button_click"));
      py.m(this.actual_layer, "add", continue_button);
      this.continue_visible = true;
      this.next_item_wait = animations.wait(this, 2000, py.bind(this, "add_next_item_with_blind"));
    }
    return null;
  }
  show_next_item(): any {
    let image, left, top: any;
    if ((this.actual_screen === 0)) {
      if ((this.actual_item === 0)) {
        image = assets.load_image("p0_intro_s1_dialogue.png");
        left = 317;
        top = 327;
        this.show_image(left, top, image, 1000);
      } else {
        this.show_continue_button();
      }
    } else if ((this.actual_screen === 1)) {
      if ((this.actual_item === 0)) {
        image = assets.load_image("p0_intro_s2_dialogue1.png");
        left = 49;
        top = 38;
        this.show_image(left, top, image, 1000);
      } else if ((this.actual_item === 1)) {
        image = assets.load_image("p0_intro_s2_dialogue2.png");
        left = 352;
        top = 281;
        this.show_image(left, top, image, 5500);
      } else {
        this.show_continue_button();
      }
    } else if ((this.actual_screen === 2)) {
      if ((this.actual_item === 0)) {
        image = assets.load_image("p0_intro_s3_dialogue1.png");
        left = 5;
        top = 24;
        this.show_image(left, top, image, 1000);
      } else if ((this.actual_item === 1)) {
        image = assets.load_image("p0_intro_s3_dialogue2.png");
        left = 308;
        top = 146;
        this.show_image(left, top, image, 5000);
      } else if ((this.actual_item === 2)) {
        image = assets.load_image("p0_intro_s3_dialogue3.png");
        left = 6;
        top = 317;
        this.show_image(left, top, image, 5000);
      } else {
        this.show_continue_button();
      }
    } else if ((this.actual_screen === 3)) {
      if ((this.actual_item === 0)) {
        image = assets.load_image("p0_intro_s4_dialogue1.png");
        left = 31;
        top = 29;
        this.show_image(left, top, image, 2000);
      } else if ((this.actual_item === 1)) {
        image = assets.load_image("p0_intro_s4_dialogue2.png");
        left = 328;
        top = 184;
        this.show_image(left, top, image, 5000);
      } else {
        this.show_continue_button();
      }
    } else if ((this.actual_screen === 4)) {
      if ((this.actual_item === 0)) {
        image = assets.load_image("p0_intro_s5_dialogue1.png");
        left = 3;
        top = 53;
        this.show_image(left, top, image, 1000);
      } else {
        this.show_continue_button();
      }
    } else if ((this.actual_screen === 5)) {
      if ((this.actual_item === 0)) {
        image = assets.load_image("p0_intro_s6_dialogue1.png");
        left = 149;
        top = 150;
        this.show_image(left, top, image, 250);
      } else {
        this.show_continue_button();
      }
    }
    return null;
  }
  show_image(left: any, top: any, image: any, milliseconds: any): any {
    let box_image: any;
    this.actual_layer = new Layer();
    box_image = new ItemImage(left, top, image);
    py.m(this.actual_layer, "add", box_image);
    this.next_item_wait = animations.wait(this, milliseconds, py.bind(this, "add_next_item_with_blind"));
    return null;
  }
  show_text(left: any, top: any, milliseconds: any, text: any, font: any, color: any, width: any = (-1), height: any = (-1)): any {
    let item: any;
    this.actual_layer = new Layer();
    item = new ItemText(left, top, font, 0, text, color, undefined, width, height, 2, 2);
    py.m(this.actual_layer, "add", item);
    this.next_item_wait = animations.wait(this, milliseconds, py.bind(this, "add_next_item_with_blind"));
    return null;
  }
  add_next_item_with_blind(): any {
    this.next_item_wait = null;
    if ((this.actual_screen === 0)) {
      if ((this.actual_item < 1)) {
        this.actual_item = this.actual_item + 1;
      } else {
        this.actual_item = 0;
        this.actual_screen = 1;
      }
    } else if ((this.actual_screen === 1)) {
      if ((this.actual_item < 2)) {
        this.actual_item = this.actual_item + 1;
      } else {
        this.actual_item = 0;
        this.actual_screen = 2;
      }
    } else if ((this.actual_screen === 2)) {
      if ((this.actual_item < 3)) {
        this.actual_item = this.actual_item + 1;
      } else {
        this.actual_item = 0;
        this.actual_screen = 3;
      }
    } else if ((this.actual_screen === 3)) {
      if ((this.actual_item < 2)) {
        this.actual_item = this.actual_item + 1;
      } else {
        this.actual_item = 0;
        this.actual_screen = 4;
      }
    } else if ((this.actual_screen === 4)) {
      if ((this.actual_item < 1)) {
        this.actual_item = this.actual_item + 1;
      } else {
        this.actual_item = 0;
        this.actual_screen = 5;
      }
    } else if ((this.actual_screen === 5)) {
      if ((this.actual_item < 1)) {
        this.actual_item = 1;
      } else {
        this.actual_item = 0;
        this.actual_screen = 6;
      }
    }
    this.add_layer(this.actual_layer);
    if ((this.escape_layer.get_stage() != null)) {
      this.remove_layer(this.escape_layer);
    }
    this.add_layer(this.escape_layer);
    animations.blind_layer(this.actual_layer, animations.BlindDirection.SHOW_DOWN, this.actual_layer.get_bounds(), 450, null, false);
    if ((this.actual_item !== 0)) {
      this.show_next_item();
    }
    return null;
  }
  continue_button_click(item: any, args: any): any {
    let initial_stage: any;
    this.render();
    this.continue_sound.play();
    if ((this.actual_screen === 6)) {
      initial_stage = new startscreen.StartScreenStage(this.game);
      this.game.set_stage(initial_stage);
    } else {
      this.show_next_screen();
    }
    return null;
  }
  handle_event(e: any): any {
    if (py.eq(e.type, KEYDOWN)) {
      if ((py.eq(e.key, K_SPACE) || py.eq(e.key, K_ESCAPE))) {
        this.render();
        this.continue_sound.play();
        pygame.time.wait(py.int(py.mul(this.continue_sound.get_length(), 1000)));
        this.skip_presentation();
        return true;
      }
    }
    return null;
  }
  skip_presentation(): any {
    let initial_stage: any;
    initial_stage = new startscreen.StartScreenStage(this.game);
    this.game.set_stage(initial_stage);
    return null;
  }
}
py.register("game/stages/presentation", $self);
