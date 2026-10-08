// @ts-nocheck
// Generated from the original game code (see MODLOG.md). Do not edit by hand.
import * as py from '../../runtime/py';
import { ItemEvent } from '../../runtime/prelude';
import { ItemImage } from '../../runtime/prelude';
import { ItemMask } from '../../runtime/prelude';
import { ItemText } from '../../runtime/prelude';
import * as animations from '../../engine/animations';
import * as assets from '../../engine/assets';
import * as datamodel from '../data/datamodel';
import * as text from '../../engine/textutil';

export class CharacterId {
  constructor(rollover_sound: any = null) {
    this.loaded = false;
    this.rollover_mask = null;
    this.name_rollover_item = null;
    this.rollover_sound = rollover_sound;
    return;
  }
  set_up_id(layer: any, char_info: any, x: any, y: any, enable_edit: any = false, click_callback: any = null): any {
    let backdrop, box, name_rollover_image, rollover_image: any;
    this.layer = layer;
    if (!py.truthy(this.loaded)) {
      this.load_assets();
    }
    backdrop = new ItemImage(x, y, this.backdrop_image);
    py.m(layer, "add", backdrop);
    if (py.truthy(click_callback)) {
      rollover_image = assets.load_image("p0_mainmenu_rolloverID.png");
      this.rollover_mask = new ItemMask(py.add(x, 29), py.add(y, 25), rollover_image.get_size());
      this.rollover_mask.set_rollover(rollover_image, this.rollover_sound);
      this.rollover_mask.add_event_handler(ItemEvent.CLICK, click_callback);
      py.m(layer, "add", this.rollover_mask);
    } else if (py.truthy(enable_edit)) {
      name_rollover_image = assets.load_image("p0_merits_main_name_rollover.jpg");
      this.name_rollover_item = new ItemImage(py.add(x, 152), py.add(y, 79), name_rollover_image);
      this.name_rollover_item.set_visible(false);
      py.m(layer, "add", this.name_rollover_item);
      this.rollover_mask = new ItemMask(this.name_rollover_item.get_left(), this.name_rollover_item.get_top(), name_rollover_image.get_size());
      this.rollover_mask.add_event_handler(ItemEvent.MOUSE_ENTER, py.bind(this, "name_enter"));
      this.rollover_mask.add_event_handler(ItemEvent.MOUSE_LEAVE, py.bind(this, "name_leave"));
      py.m(layer, "add", this.rollover_mask);
    }
    this.avatar = new ItemImage(py.add(x, 42), py.add(y, 38), null);
    py.m(layer, "add", this.avatar);
    box = new ItemImage(py.add(x, 37), py.add(y, 33), this.box_image);
    py.m(layer, "add", box);
    this.range_text = new ItemText(py.add(x, 167), py.add(y, 63), this.font_11, 0, "", [148, 34, 34], null, 130, 13, 1, 1);
    py.m(layer, "add", this.range_text);
    this.name_text = new ItemText(py.add(x, 167), py.add(y, 89), this.font_16, 16, "", [58, 30, 16], null, 100, 49, 1, 1);
    py.m(layer, "add", this.name_text);
    this.range_item = new ItemImage(py.add(x, 42), py.add(y, 125), null);
    py.m(layer, "add", this.range_item);
    if (py.truthy(enable_edit)) {
      this.name_text.set_max_chars(30);
      this.name_text.set_editable(true);
      this.name_text.set_edit_on_click(this.rollover_mask, py.bind(this, "name_click"));
      this.name_text.add_event_handler(ItemEvent.GOT_FOCUS, py.bind(this, "name_got_focus"));
      this.name_text.add_event_handler(ItemEvent.LOST_FOCUS, py.bind(this, "name_lost_focus"));
    }
    this.load_character(char_info);
    return null;
  }
  name_click(item: any, args: any): any {
    let stage: any;
    stage = this.layer.get_stage();
    stage.render();
    stage.click_sound.play();
    return null;
  }
  name_enter(item: any, args: any): any {
    this.update_name_rollover_visible();
    return null;
  }
  name_leave(item: any, args: any): any {
    this.update_name_rollover_visible();
    return null;
  }
  name_got_focus(item: any, args: any): any {
    this.update_name_rollover_visible();
    return null;
  }
  name_lost_focus(item: any, args: any): any {
    let character, new_name, stage: any;
    this.update_name_rollover_visible();
    stage = this.layer.get_stage();
    character = stage.game.datastore.user_character;
    new_name = apply_name_text_casing(item.get_text());
    if (!py.eq(character.charinfo.name, new_name)) {
      character.charinfo.name = new_name;
      this.name_text.set_text(new_name);
      stage.game.datastore.save_characters();
      stage.game.datastore.update_score_name(character);
      stage.game.datastore.save_highscores();
    }
    return null;
  }
  update_name_rollover_visible(): any {
    let stage, visible: any;
    stage = this.layer.get_stage();
    visible = py.or(py.eq(stage.get_over_item(), this.rollover_mask), () => py.eq(stage.get_focus(), this.name_text));
    this.name_rollover_item.set_visible(visible);
    return null;
  }
  load_character(char_info: any): any {
    let placeholder_image, range: any;
    if ((char_info == null)) {
      placeholder_image = assets.load_image("p0_detective_placeholder.jpg");
      this.avatar.set_image(placeholder_image);
      this.range_text.set_text("");
      this.name_text.set_text("");
      this.range_item.set_visible(false);
      if (py.truthy(this.rollover_mask)) {
        this.rollover_mask.set_visible(false);
      }
    } else {
      this.load_avatar(char_info);
      this.avatar.set_image(this.avatar_image);
      range = datamodel.get_range_name(char_info.range_level);
      this.range_text.set_text(range);
      this.range_item.set_visible(true);
      this.load_range(char_info);
      this.range_item.set_image(this.range_image);
      this.name_text.set_text(char_info.name);
      if (py.truthy(this.rollover_mask)) {
        this.rollover_mask.set_visible(true);
      }
    }
    return null;
  }
  load_range(char_info: any): any {
    if (!py.eq(char_info.range_level, this.range_image_level)) {
      this.range_image = assets.load_image(py.add(py.add("p0_detective_ranks_lvl", py.str(char_info.range_level)), ".png"));
      this.range_image_level = char_info.range_level;
    }
    return null;
  }
  load_assets(): any {
    if (!py.truthy(this.loaded)) {
      this.backdrop_image = assets.load_image("p0_mainmenu_id_backdrop.png");
      this.box_image = assets.load_image("p0_merits_main_id_box.png");
      this.font_11 = assets.load_font("evilgeniusbb_bld.ttf", 11);
      this.font_16 = assets.load_font("evilgeniusbb_reg.ttf", 16);
      this.avatar_name = null;
      this.range_image_level = (-1);
      this._CharacterId__loaded = true;
    }
    return null;
  }
  load_avatar(char_info: any): any {
    let name: any;
    name = "p0_detective_";
    if ((char_info.sex === "M")) {
      name = py.add(name, "male_");
    } else {
      name = py.add(name, "female_");
    }
    name = py.add(name, py.add(py.fmt("%03d", char_info.avatar), "_id.jpg"));
    if (!py.eq(this.avatar_name, name)) {
      this.avatar_image = assets.load_image(name);
      this.avatar_name = name;
    }
    return null;
  }
}
export function apply_name_text_casing(name: any): any {
  let i, l, new_name, start: any;
  start = 0;
  new_name = "";
  l = py.len(name);
  i = 0;
  while ((i <= l)) {
    if (py.eq(i, l)) {
      if ((start < l)) {
        new_name = py.add(new_name, py.add(text.to_upper(py.getitem(name, start)), text.to_lower(py.slice(name, py.add(start, 1), i))));
      }
    } else if ((py.getitem(name, i) === " ")) {
      new_name = py.add(new_name, py.add(py.add(text.to_upper(py.getitem(name, start)), text.to_lower(py.slice(name, py.add(start, 1), i))), " "));
      start = py.add(i, 1);
    }
    i = i + 1;
  }
  return new_name;
}
