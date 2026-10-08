// @ts-nocheck
// Generated from the original game code (see MODLOG.md). Do not edit by hand.
import * as py from '../../runtime/py';
import { ItemRect } from '../../runtime/prelude';
import { Layer } from '../../runtime/prelude';
import { THIEF_CAR_COLORS } from '../data/datastore';
import * as animations from '../../engine/animations';
import * as help from './help';
import * as phase0 from './phase0';
import { platform } from '../../runtime/py';
import { pygame } from '../../runtime/prelude';

export function get_time_of_day(hour: any): any {
  if ((hour < 16)) {
    return "noon";
  }
  if ((hour < 18)) {
    return "afternoon";
  }
  return "night";
}
export class Phase3Content extends phase0.PhaseContent {
  constructor() {
    super();
    return;
  }
  initialize(game: any, stage: any): any {
    this.game = game;
    this.stage = stage;
    return null;
  }
  add_above_info_layers(): any {
    let background, background_layer, start, traceback: any;
    background_layer = new Layer();
    this.stage.add_layer(background_layer);
    background = new ItemRect(0, 0, 600, 450);
    py.m(background_layer, "add", background);
    try {
    } catch ($e: any) {
      if (py.isExc($e, [py.Exception])) {
        traceback.print_exc();
        start = (...args: any[]): any => {
          return 0;
        };
      }
      else throw $e;
    }
    this.start_racer = start;
    animations.wait(this.stage, 10, py.bind(this, "prepare_chase"));
    return null;
  }
  prepare_chase(): any {
    let cp, help_dialog: any;
    this.loading_layer = this.game.add_loading_to_stage();
    if ((this.loading_layer != null)) {
      animations.cancel_blind_layer(this.stage, this.loading_layer, true);
    }
    this.game.hide_loading();
    cp = this.game.datastore.user_character_progress;
    if (!py.truthy(cp.phase3_help)) {
      help_dialog = new help.Help(this.stage);
      help_dialog.show_help(7, true, false, py.bind(this, "close_help_callback"), [7, 9]);
      cp.phase3_help = true;
    } else {
      this.start_chase();
    }
    return null;
  }
  close_help_callback(): any {
    this.start_chase();
    return null;
  }
  start_chase(): any {
    let case_, color, overlay, result, screen, sound_values: any;
    screen = pygame.display.get_surface();
    sound_values = this.game.mixer_params;
    py.print(sound_values);
    if ((screen.get_width() === 600)) {
      overlay = 0;
    } else {
      overlay = 1;
    }
    case_ = this.game.datastore.user_character_progress.case;
    if (py.truthy(case_.thief_car_color)) {
      color = case_.thief_car_color;
    } else {
      color = "violet";
    }
    result = this.start_racer(screen, overlay, py.add("images/", case_.thief.phase3_image), py.add("images/", get_avatar_path(this.game.datastore.user_character.charinfo)), get_time_of_day(py.getitem(case_.actual_days(), 1)), py.add(py.add("data/p3_map_", case_.last_department_lair.chase_map), ".yaml"), color, py.getitem(sound_values, 0), py.getitem(sound_values, 1), py.getitem(sound_values, 2));
    if ((py.truthy(py.isinstance(result, py.type([]))) || py.truthy(py.isinstance(result, py.type([]))))) {
      result = py.getitem(result, 0);
    }
    this.game.datastore.user_character_progress.case.caught_thief = result;
    if ((this.loading_layer != null)) {
      this.stage.remove_layer(this.loading_layer);
    }
    this.stage.redraw();
    this.stage.set_phase(1);
    return null;
  }
}
export function get_avatar_path(char_info: any): any {
  let name: any;
  name = "p0_detective_";
  if ((char_info.sex === "M")) {
    name = py.add(name, "male_");
  } else {
    name = py.add(name, "female_");
  }
  name = py.add(name, py.add(py.fmt("%03d", char_info.avatar), "_carchase.jpg"));
  return name;
}
