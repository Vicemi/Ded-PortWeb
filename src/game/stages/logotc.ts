// @ts-nocheck
// Generated from the original game code (see MODLOG.md). Do not edit by hand.
import * as py from '../../runtime/py';
import { ItemImage } from '../../runtime/prelude';
import { ItemRect } from '../../runtime/prelude';
import { Layer } from '../../runtime/prelude';
import { Stage } from '../../runtime/prelude';
import * as animations from '../../engine/animations';
import { assets } from '../../runtime/prelude';
import * as startscreen from './startscreen';
import * as $self from './logotc';

export class LogoTCStage extends Stage {
  constructor(game: any) {
    super(game);
    return;
  }
  initialize(): any {
    let back_rect, logo_image: any;
    this.layer = new Layer();
    back_rect = new ItemRect(0, 0, 600, 450, null, 0, "", [0, 0, 0], [173, 168, 153]);
    py.m(this.layer, "add", back_rect);
    logo_image = assets.load_image_alpha("p0_placalogo.gif", null);
    this.logo = new ItemImage(220, 121, logo_image);
    this.add_layer(this.layer);
    animations.wait(this, 2000, py.bind(this, "show_logo"));
    return null;
  }
  show_logo(): any {
    py.m(this.layer, "add", this.logo);
    animations.fade_in_item(this.logo, 500, py.bind(this, "wait_show_logo"));
    return null;
  }
  wait_show_logo(item: any): any {
    animations.wait(this, 3300, py.bind(this, "hide_logo"));
    return null;
  }
  hide_logo(): any {
    animations.fade_out_item(this.logo, false, 500, py.bind(this, "wait_hide_logo"));
    return null;
  }
  wait_hide_logo(item: any): any {
    animations.wait(this, 500, py.bind(this, "go_to_main"));
    return null;
  }
  go_to_main(): any {
    this.game.set_stage(new startscreen.StartScreenStage(this.game));
    return null;
  }
}
py.register("game/stages/logotc", $self);
