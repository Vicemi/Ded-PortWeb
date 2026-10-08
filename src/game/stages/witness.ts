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

export class Witness {
  constructor(stage: any) {
    this.stage = stage;
    this.font_18 = assets.load_font("powdrft_.ttf", 18);
    this.font_19 = assets.load_font("powdrft_.ttf", 19);
    this.font_20 = assets.load_font("powdrft_.ttf", 20);
    this.font_24 = assets.load_font("powdrft_.ttf", 24);
    this.rollover_sound = stage.rollover_sound;
    this.click_sound = stage.click_sound;
    this.layer = new Layer();
    this.set_up_witness_background();
    this.set_up_witness_texts();
    this.set_up_witness_buttons();
    return;
  }
  show_witness(witness: any, close_callback: any = null): any {
    let s, witness_image: any;
    this.close_callback = close_callback;
    witness_image = assets.load_image(witness.image);
    this.image.set_image(witness_image);
    this.name.set_text(witness.name);
    this.city.set_text(witness.city.name);
    this.department.set_text(witness.department.name);
    s = py.add(py.add(py.add(py.add(py.add(py.add("\"", witness.witness_statement.intro_statement.text), "\"\n\n\""), witness.witness_statement.janitor_statement.text), "\"\n\n\""), witness.witness_statement.identikit_statement.text), "\"");
    if (py.truthy(witness.witness_statement.location_statement)) {
      s = py.add(s, py.add(py.add("\n\n\"", py.m(witness.witness_statement.location_statement.text, "replace", "\n", " ")), "\""));
    }
    this.statement.set_text(s);
    this.stage.show_dialog(this.layer, py.bind(this, "witness_handle_event"));
    return null;
  }
  close_witness(): any {
    this.stage.close_dialog(this.layer);
    if ((this.close_callback != null)) {
      this.close_callback();
    }
    return null;
  }
  witness_handle_event(e: any): any {
    if ((py.eq(e.type, KEYDOWN) && py.eq(e.key, K_ESCAPE))) {
      this.stage.render();
      this.click_sound.play();
      this.close_witness();
    }
    return null;
  }
  set_up_witness_background(): any {
    this.background_image = assets.load_image("p0_witness_popup.png");
    this.background = new ItemImage(112, 53, this.background_image, null);
    this.image = new ItemImage(154, 82, null, null);
    py.m(this.layer, "add", this.background);
    py.m(this.layer, "add", this.image);
    return null;
  }
  set_up_witness_texts(): any {
    let additional_fonts: any;
    this.name = new ItemText(219, 78, this.font_24, 0, "", [157, 21, 21], null, 180, 232);
    this.department = new ItemText(220, 117, this.font_18, 0, "", [102, 102, 102], null, 250, 232);
    this.city = new ItemText(221, 101, this.font_20, 0, "", [51, 51, 51], null, 250, 232);
    additional_fonts = py.mkdict([["bold", [this.font_19, 14, 0]]]);
    this.statement = new ItemText(157, 158, this.font_19, 14, "", [51, 51, 51], null, 285, 205, 1, 1, additional_fonts);
    py.m(this.layer, "add", this.name);
    py.m(this.layer, "add", this.city);
    py.m(this.layer, "add", this.department);
    py.m(this.layer, "add", this.statement);
    return null;
  }
  set_up_witness_buttons(): any {
    this.close_button_image = assets.load_image("btn_testigo_x_normal.png");
    this.close_button_image_rollover = assets.load_image("btn_testigo_x_rollover.png");
    this.close_button = new ItemImage(432, 75, this.close_button_image, null, true);
    this.close_button.set_rollover(this.close_button_image_rollover, this.rollover_sound);
    this.close_button.add_event_handler(ItemEvent.CLICK, py.bind(this, "close_click"));
    py.m(this.layer, "add", this.close_button);
    return null;
  }
  close_click(item: any, args: any): any {
    this.stage.render();
    this.click_sound.play();
    this.close_witness();
    return null;
  }
}
