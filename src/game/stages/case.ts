// @ts-nocheck
// Generated from the original game code (see MODLOG.md). Do not edit by hand.
import * as py from '../../runtime/py';
import { ItemEvent } from '../../runtime/prelude';
import { ItemImage } from '../../runtime/prelude';
import { ItemText } from '../../runtime/prelude';
import { KEYDOWN } from '../../runtime/prelude';
import { K_ESCAPE } from '../../runtime/prelude';
import { Layer } from '../../runtime/prelude';
import { Stage } from '../../runtime/prelude';
import * as animations from '../../engine/animations';
import { assets } from '../../runtime/prelude';
import * as map from './map';
import * as $self from './case';

export class CaseStage extends Stage {
  constructor(game: any) {
    super(game);
    return;
  }
  initialize(): any {
    this.font = assets.load_font("powdrft_.ttf", 17);
    this.newcase_sound = assets.load_sound("GUI_Turn_Page.ogg");
    this.rollover_sound = assets.load_sound("GUI_roll_over.ogg");
    this.continue_sound = assets.load_sound("GUI_Click.ogg");
    return null;
  }
  prepare(): any {
    this.set_up_case();
    return null;
  }
  set_up_case(): any {
    let background, background_image, next_image, next_rollover_image, text, text1, text2, text3: any;
    this.case_layer = new Layer();
    background = assets.load_image("p0_case_presentation_clean.jpg");
    background_image = new ItemImage(0, 0, background);
    py.m(this.case_layer, "add", background_image);
    text1 = new ItemText(45, 120, this.font, 13, "", [0, 0, 0], null, 230, 270);
    py.m(this.case_layer, "add", text1);
    text2 = new ItemText(330, 68, this.font, 13, "", [0, 0, 0], null, 131, 102);
    py.m(this.case_layer, "add", text2);
    text3 = new ItemText(330, 159, this.font, 13, "", [0, 0, 0], null, 220, 227);
    py.m(this.case_layer, "add", text3);
    text1.break_text_into(text2);
    text2.break_text_into(text3);
    text = this.game.datastore.user_character_progress.case.get_full_text(this.game.datastore.user_character, this.game.datastore.user_character_progress);
    text1.set_text(text);
    next_image = assets.load_image("p0_endings_btn_continue_normal.png");
    next_rollover_image = assets.load_image("p0_endings_btn_continue_rollover.png");
    this.next_button = new ItemImage(220, 401, next_image);
    this.next_button.set_rollover_image(next_rollover_image, this.rollover_sound);
    this.next_button.add_event_handler(ItemEvent.CLICK, py.bind(this, "next_click"));
    py.m(this.case_layer, "add", this.next_button);
    this.add_layer(this.case_layer);
    animations.blind_layer(this.case_layer, animations.BlindDirection.SHOW_DOWN, null);
    this.render();
    this.newcase_sound.play();
    return null;
  }
  next_click(item: any, args: any): any {
    this.render();
    this.continue_sound.play();
    this.go_next();
    return null;
  }
  go_next(): any {
    let crime_department, m: any;
    crime_department = this.game.datastore.user_character_progress.case.crime_location.department;
    m = new map.Map(this, false, true);
    this.show_dialog(m.map_layer, null);
    m.add_other_layer();
    m.go_to(crime_department, false);
    return null;
  }
  handle_event(e: any): any {
    if ((py.eq(e.type, KEYDOWN) && py.eq(e.key, K_ESCAPE))) {
      this.render();
      this.continue_sound.play();
      this.go_next();
    }
    return null;
  }
}
py.register("game/stages/case", $self);
