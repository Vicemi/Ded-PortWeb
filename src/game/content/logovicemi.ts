// The first screen of the updated edition: the logo of Vicemi Dev, shown before the opening of the game (and so before the logo of Trojan Chicken).
// Click, any key or Escape skip it. Hand-written (the generated stages are rebuilt by research/build_game.sh).
import { ItemImage, ItemRect, KEYDOWN, MOUSEBUTTONDOWN, Layer, Stage } from '../../runtime/prelude';
import * as animations from '../../engine/animations';
import * as assets from '../../engine/assets';
import * as presentation from '../stages/presentation';

export class LogoVicemiStage extends Stage {
  done = false;
  logo: any;
  initialize(): any {
    const layer = new Layer();
    layer.add(new ItemRect(0, 0, 600, 450, null, 0, '', [0, 0, 0], [12, 11, 16]));
    this.logo = new ItemImage(44, 33, assets.load_image('p0_vicemi_logo.jpg'));
    this.add_layer(layer);
    animations.wait(this, 300, () => this.show_logo());
    return null;
  }
  show_logo(): any {
    if (this.done) return null;
    this.layer_logo().add(this.logo);
    animations.fade_in_item(this.logo, 600, () => animations.wait(this, 2200, () => this.hide_logo()));
    return null;
  }
  layer_logo(): any { return this.layers[0]; }
  hide_logo(): any {
    if (this.done) return null;
    animations.fade_out_item(this.logo, false, 500, () => this.go());
    return null;
  }
  handle_event(e: any): any {
    if (e.type === KEYDOWN || e.type === MOUSEBUTTONDOWN) { this.go(); return true; }
    return null;
  }
  go(): any {
    if (this.done) return null;
    this.done = true;
    this.game.set_stage(new (presentation as any).PresentationStage(this.game));
    return null;
  }
}
