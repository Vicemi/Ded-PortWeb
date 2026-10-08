// @ts-nocheck
// Generated from the original game code (see MODLOG.md). Do not edit by hand.
import * as py from '../../runtime/py';
import { Item } from '../../runtime/prelude';
import { ItemEvent } from '../../runtime/prelude';
import { ItemImage } from '../../runtime/prelude';
import { ItemMask } from '../../runtime/prelude';
import { ItemText } from '../../runtime/prelude';
import { Layer } from '../../runtime/prelude';
import * as animations from '../../engine/animations';
import * as assets from '../../engine/assets';
const get_travel_turns: any = py.lazyName("game/data/serialization", "get_travel_turns");
import * as map from './map';
import { math } from '../../runtime/py';
const phase0: any = py.lazy("game/stages/phase0");
import { random } from '../../runtime/py';
import * as $self from './map';

export let car_angle: any = 135;
export class Map extends Item {
  constructor(stage: any, from_phase0: any, car_animation: any = false) {
    super();
    this.stage = stage;
    this.from_phase0 = from_phase0;
    this.map_layer = new Layer();
    this.rollover_layer = new Layer();
    this.mask_layer = new Layer();
    this.car_layer = new Layer();
    this.font = assets.load_font("freesansbold.ttf", 13);
    this.large_font = assets.load_font("nakel___.ttf", 30);
    this.load_dialog_images();
    this.load_car_images();
    this.load_sounds();
    this.set_up(!py.truthy(car_animation), car_animation);
    return;
  }
  load_dialog_images(): any {
    this.background_image = assets.load_image("p0_map_back.png");
    this.close_button_image = assets.load_image("p0_button_close.png");
    this.close_button_image_rollover = assets.load_image("p0_button_close_rollover.png");
    return null;
  }
  close_map(): any {
    this.stage.close_dialog(this.map_layer);
    return null;
  }
  load_car_images(): any {
    let bottom_left_running, bottom_running, left_running, mark_image, top_left_running, top_running: any;
    this.car_stopped = [assets.load_image("p0_map_car_t.png"), assets.load_image("p0_map_car_tl.png"), assets.load_image("p0_map_car_l.png"), assets.load_image("p0_map_car_bl.png"), assets.load_image("p0_map_car_b.png")];
    top_running = [assets.load_image("p0_map_car_t_001.png"), assets.load_image("p0_map_car_t_002.png"), assets.load_image("p0_map_car_t_003.png")];
    top_left_running = [assets.load_image("p0_map_car_tl_001.png"), assets.load_image("p0_map_car_tl_002.png"), assets.load_image("p0_map_car_tl_003.png")];
    left_running = [assets.load_image("p0_map_car_l_001.png"), assets.load_image("p0_map_car_l_002.png"), assets.load_image("p0_map_car_l_003.png")];
    bottom_left_running = [assets.load_image("p0_map_car_bl_001.png"), assets.load_image("p0_map_car_bl_002.png"), assets.load_image("p0_map_car_bl_003.png")];
    bottom_running = [assets.load_image("p0_map_car_b_001.png"), assets.load_image("p0_map_car_b_002.png"), assets.load_image("p0_map_car_b_003.png")];
    this.car_running = [top_running, top_left_running, left_running, bottom_left_running, bottom_running];
    mark_image = assets.load_image("p0_map_dot.png");
    this.car_move_marks = new animations.MoveMarks(mark_image, 20);
    return null;
  }
  load_sounds(): any {
    this.rollover_sound = assets.load_sound("GUI_roll_over.ogg");
    this.click_sound = assets.load_sound("GUI_Click.ogg");
    this.engine_sound = assets.load_sound("p0_car_map.ogg");
    this.tires_sound = assets.load_sound("p3_car_tires.wav");
    return null;
  }
  set_up(show_close: any, all_actives: any): any {
    this.img_id_normal = false;
    this.selected_department = null;
    this.traveling_to = null;
    this.map_movement_unlocked = false;
    this.map_layer.empty();
    this.rollover_layer.empty();
    this.mask_layer.empty();
    this.car_layer.empty();
    this.background = new ItemImage(0, 0, this.background_image, null);
    py.m(this.map_layer, "add", this.background);
    this.set_map_movement_data(all_actives);
    this.set_departaments_data(all_actives);
    if (py.truthy(show_close)) {
      this.set_up_close_button();
    }
    this.set_up_department_items();
    this.set_up_department_masks();
    this.set_up_texts();
    this.set_up_active_department();
    this.set_up_car();
    return null;
  }
  set_map_movement_data(all_actives: any): any {
    let case_, clue_found: any;
    case_ = this.stage.game.datastore.user_character_progress.case;
    if (!py.truthy(all_actives)) {
      clue_found = (py.len(case_.clues_found) > 0);
      if (((py.eq(case_.last_department_visited, py.getitem(case_.list_departments, 0)) && py.eq(case_.last_department_lair, py.getitem(case_.list_departments, 0))) || (!py.truthy(case_.wrong_witness_visited) && !py.truthy(clue_found)))) {
        this.map_movement_unlocked = false;
      } else {
        this.map_movement_unlocked = true;
      }
    } else {
      this.map_movement_unlocked = true;
    }
    return null;
  }
  set_departaments_data(all_actives: any): any {
    let case_, d, dep, departments, posible_deps: any;
    departments = this.stage.game.datastore.list_departments;
    this.department_data = [new MapDepartment(py.getitem(departments, 0), "artigas", 139, 64, [255, 0, 0], 196, 104), new MapDepartment(py.getitem(departments, 1), "canelones", 224, 335, [150, 150, 150], 256, 359), new MapDepartment(py.getitem(departments, 2), "cerrolargo", 286, 170, [0, 150, 255], 339, 218), new MapDepartment(py.getitem(departments, 3), "colonia", 118, 308, [255, 150, 150], 161, 333), new MapDepartment(py.getitem(departments, 4), "durazno", 186, 220, [255, 255, 150], 245, 262), new MapDepartment(py.getitem(departments, 5), "flores", 176, 267, [255, 0, 255], 204, 296), new MapDepartment(py.getitem(departments, 6), "florida", 221, 263, [150, 255, 150], 258, 312), new MapDepartment(py.getitem(departments, 7), "lavalleja", 270, 278, [150, 150, 255], 306, 319), new MapDepartment(py.getitem(departments, 8), "maldonado", 279, 317, [0, 150, 0], 311, 366), new MapDepartment(py.getitem(departments, 9), "montevideo", 227, 368, [0, 0, 150], 238, 378), new MapDepartment(py.getitem(departments, 10), "paysandu", 127, 157, [255, 150, 0], 178, 197), new MapDepartment(py.getitem(departments, 11), "rionegro", 116, 214, [0, 255, 0], 172, 242), new MapDepartment(py.getitem(departments, 12), "rivera", 237, 113, [0, 255, 150], 289, 162), new MapDepartment(py.getitem(departments, 13), "rocha", 328, 268, [150, 0, 255], 357, 322), new MapDepartment(py.getitem(departments, 14), "salto", 132, 109, [255, 255, 0], 189, 152), new MapDepartment(py.getitem(departments, 15), "sanjose", 186, 312, [255, 150, 255], 210, 344), new MapDepartment(py.getitem(departments, 16), "soriano", 116, 258, [0, 0, 255], 154, 291), new MapDepartment(py.getitem(departments, 17), "tacuarembo", 213, 141, [0, 255, 255], 262, 197), new MapDepartment(py.getitem(departments, 18), "treintaytres", 297, 237, [255, 0, 150], 346, 261)];
    if (py.truthy(all_actives)) {
      for (dep of py.iter(this.department_data)) {
        dep.inactive = false;
      }
    } else {
      posible_deps = [];
      case_ = this.stage.game.datastore.user_character_progress.case;
      if ((py.eq(case_.last_department_lair, py.getitem(case_.list_departments, 0)) || py.eq(case_.last_department_lair, py.getitem(case_.list_departments, 1)))) {
        posible_deps = case_.list_posible_departments;
      }
      for (d of py.iter(posible_deps)) {
        py.getitem(this.department_data, py.m(this.stage.game.datastore.list_departments, "index", d)).inactive = false;
      }
      this.set_last_visited_departments();
    }
    return null;
  }
  set_up_close_button(): any {
    this.close_button = new ItemImage(275, 392, this.close_button_image, null);
    this.close_button.add_event_handler(ItemEvent.CLICK, py.bind(this, "button_click"));
    this.close_button.set_rollover_image(this.close_button_image_rollover, this.rollover_sound);
    py.m(this.map_layer, "add", this.close_button);
    return null;
  }
  set_up_department_items(): any {
    let case_, dep_data, image, inactive_item, rollover_item: any;
    case_ = this.stage.game.datastore.user_character_progress.case;
    for (dep_data of py.iter(this.department_data)) {
      if (py.truthy(this.map_movement_unlocked)) {
        if ((py.truthy(dep_data.inactive) && !py.eq(dep_data.department, py.getitem(case_.list_departments, 0)))) {
          image = assets.load_image(py.add(py.add("p0_map_inactive_", dep_data.image_name), ".png"));
          inactive_item = new ItemImage(dep_data.x, dep_data.y, image);
          py.m(this.map_layer, "add", inactive_item);
        } else {
          image = assets.load_image(py.add(py.add("p0_map_", dep_data.image_name), "_rollover.png"));
          rollover_item = new ItemImage(dep_data.x, dep_data.y, image);
          dep_data.roll_over = rollover_item;
        }
      } else {
        image = assets.load_image(py.add(py.add("p0_map_inactive_", dep_data.image_name), ".png"));
        inactive_item = new ItemImage(dep_data.x, dep_data.y, image);
        dep_data.inactive = true;
        py.m(this.map_layer, "add", inactive_item);
      }
    }
    return null;
  }
  set_up_department_masks(): any {
    let masks: any;
    masks = assets.load_mask("p0_map_mask.gif");
    this.department_masks = new ItemMask(117, 66, masks);
    py.m(this.mask_layer, "add", this.department_masks);
    this.department_masks.add_event_handler(ItemEvent.CLICK, py.bind(this, "department_masks_click"));
    this.department_masks.add_event_handler(ItemEvent.MOUSE_MOVE, py.bind(this, "department_masks_move"));
    this.department_masks.add_event_handler(ItemEvent.MOUSE_LEAVE, py.bind(this, "department_masks_leave"));
    return null;
  }
  set_up_texts(): any {
    this.department_text = new ItemText(368, 115, this.large_font, 37, "", [100, 25, 25], null, 130, 91, 2, 2);
    py.m(this.map_layer, "add", this.department_text);
    return null;
  }
  set_up_car(): any {
    let car_image, left, top: any;
    car_image = this.get_car_stopped_image(map.car_angle);
    [left, top] = this.get_car_pos(this.active_department, car_image);
    this.car = new ItemImage(left, top, car_image);
    py.m(this.car_layer, "add", this.car);
    return null;
  }
  get_car_pos(dep: any, car_image: any): any {
    let left, top: any;
    left = (dep.center_x - py.div(car_image.get_width(), 2));
    top = (dep.center_y - py.div(car_image.get_height(), 2));
    return [left, top];
  }
  button_click(item: any, args: any): any {
    this.stage.render();
    this.click_sound.play();
    if (py.eq(item, this.close_button)) {
      this.close_map();
    }
    return null;
  }
  department_masks_click(item: any, args: any): any {
    let case_, dep_data, travel_turns: any;
    if ((this.traveling_to == null)) {
      dep_data = this.get_department(args);
      if ((dep_data != null)) {
        this.stage.render();
        this.click_sound.play();
        this.set_selected_department(null, false);
        this.go_to(dep_data.department);
        this.close_button.set_visible(false);
        case_ = this.stage.game.datastore.user_character_progress.case;
        travel_turns = get_travel_turns(this.stage.game.datastore, [case_.last_department_visited, case_.last_department_lair]);
        case_.time_spend = py.add(case_.time_spend, travel_turns);
        if (py.truthy(case_.wrong_witness_visited)) {
          case_.wrong_witness_visited = false;
        }
      }
    }
    return null;
  }
  department_masks_move(item: any, args: any): any {
    let dep_data: any;
    if ((this.traveling_to == null)) {
      dep_data = this.get_department(args);
      this.set_selected_department(dep_data, true);
    }
    return null;
  }
  department_masks_leave(item: any, args: any): any {
    this.set_selected_department(null, false);
    return null;
  }
  get_department(args: any): any {
    let color, dep_data: any;
    color = this.department_masks.get_at((args.x - this.department_masks.get_left()), (args.y - this.department_masks.get_top()));
    for (dep_data of py.iter(this.department_data)) {
      if (py.eq(py.slice(dep_data.mask_color, 0, 3), py.slice(color, 0, 3))) {
        if (py.truthy(dep_data.inactive)) {
          return null;
        } else {
          return dep_data;
        }
      }
    }
    return null;
  }
  set_up_active_department(): any {
    let data, image, last_department: any;
    last_department = this.stage.game.datastore.user_character_progress.case.last_department_visited;
    for (data of py.iter(this.department_data)) {
      if (py.eq(data.department, last_department)) {
        this.active_department = data;
        break;
      }
    }
    image = assets.load_image(py.add(py.add("p0_map_active_", this.active_department.image_name), ".png"));
    this.active_department_image = new ItemImage(this.active_department.x, this.active_department.y, image);
    py.m(this.map_layer, "add", this.active_department_image);
    this.department_text.set_text(last_department.name);
    return null;
  }
  set_selected_department(dep_data: any, play_rollover_sound: any): any {
    if (!py.eq(this.selected_department, dep_data)) {
      this.rollover_layer.empty();
      this.department_text.set_text("");
      if ((dep_data != null)) {
        if (!py.eq(dep_data, this.active_department)) {
          this.department_text.set_text(dep_data.department.name);
          if (!py.truthy(dep_data.inactive)) {
            py.m(this.rollover_layer, "add", dep_data.roll_over);
            if (py.truthy(play_rollover_sound)) {
              this.stage.render();
              this.rollover_sound.stop();
              this.rollover_sound.play();
            }
          }
        }
      }
      this.selected_department = dep_data;
    }
    return null;
  }
  go_to(department: any, show_rotation_animation: any = true): any {
    let data, dep_data: any;
    for (data of py.iter(this.department_data)) {
      if (py.eq(data.department, department)) {
        dep_data = data;
        break;
      }
    }
    this.traveling_to = dep_data;
    if (py.eq(dep_data, this.active_department)) {
      animations.wait(this.stage, 2000, py.bind(this, "go_to_phase1"));
    } else {
      this.department_text.set_text(dep_data.department.name);
      this.show_rotation_animation = show_rotation_animation;
      animations.wait(this.stage, 100, py.bind(this, "start_engine"));
    }
    return null;
  }
  start_engine(): any {
    this.stage.render();
    this.engine_sound.play((-1));
    animations.wait(this.stage, 150, py.bind(this, "start_move_car"));
    return null;
  }
  start_move_car(): any {
    let new_angle, rotation_images: any;
    this.stage.render();
    this.engine_sound.play((-1));
    animations.remove_move_marks(this.car);
    animations.stop_image_sequence(this.car);
    [rotation_images, new_angle] = this.get_car_rotation_images();
    map.$set("car_angle", new_angle);
    if (py.truthy(this.show_rotation_animation)) {
      animations.start_image_sequence(this.car, rotation_images, 15, 0, py.bind(this, "rotate_car_callback"));
    } else {
      this.move_car_to_target();
    }
    return null;
  }
  get_car_rotation_images(): any {
    let angle, current_angle, diff, dx, dy, images, increment, left, top: any;
    [left, top] = this.get_car_pos(this.traveling_to, this.car.get_image());
    dx = (left - this.car.get_left());
    dy = (top - this.car.get_top());
    angle = (-math.degrees(math.atan2(dy, dx)));
    angle = py.mul(py.round(py.div(angle, 45)), 45);
    current_angle = map.car_angle;
    diff = (angle - current_angle);
    if ((diff >= 360)) {
      diff = diff - 360;
    }
    if ((((diff >= 0) && (diff <= 180)) || (diff <= (-180)))) {
      increment = 45;
    } else {
      increment = (-45);
    }
    images = [];
    if ((angle === 180)) {
      angle = (-180);
    }
    if ((current_angle === 180)) {
      current_angle = (-180);
    }
    if (!py.eq(angle, current_angle)) {
      if ((angle === 180)) {
        angle = (-180);
      }
      while (true) {
        py.m(images, "append", this.get_car_stopped_image(current_angle));
        if (py.eq(angle, current_angle)) {
          break;
        } else {
          current_angle = py.add(current_angle, increment);
          if ((current_angle >= 180)) {
            current_angle = current_angle - 360;
          } else if ((current_angle < (-180))) {
            current_angle = current_angle + 360;
          }
        }
      }
    }
    return [images, current_angle];
  }
  get_car_running_image(angle: any, index: any): any {
    if ((angle === 0)) {
      return py.getitem(py.getitem(this.car_running, 2), index).flip_h_copy();
    } else {
      if ((angle === 45)) {
        return py.getitem(py.getitem(this.car_running, 1), index).flip_h_copy();
      }
      if ((angle === 90)) {
        return py.getitem(py.getitem(this.car_running, 0), index);
      }
      if ((angle === 135)) {
        return py.getitem(py.getitem(this.car_running, 1), index);
      }
      if (py.eq(angle, (-45))) {
        return py.getitem(py.getitem(this.car_running, 3), index).flip_h_copy();
      }
      if (py.eq(angle, (-90))) {
        return py.getitem(py.getitem(this.car_running, 4), index);
      }
      if (py.eq(angle, (-135))) {
        return py.getitem(py.getitem(this.car_running, 3), index);
      }
      return py.getitem(py.getitem(this.car_running, 2), index);
    }
    return null;
  }
  get_car_stopped_image(angle: any): any {
    if ((angle === 0)) {
      return py.getitem(this.car_stopped, 2).flip_h_copy();
    } else {
      if ((angle === 45)) {
        return py.getitem(this.car_stopped, 1).flip_h_copy();
      }
      if ((angle === 90)) {
        return py.getitem(this.car_stopped, 0);
      }
      if ((angle === 135)) {
        return py.getitem(this.car_stopped, 1);
      }
      if (py.eq(angle, (-45))) {
        return py.getitem(this.car_stopped, 3).flip_h_copy();
      }
      if (py.eq(angle, (-90))) {
        return py.getitem(this.car_stopped, 4);
      }
      if (py.eq(angle, (-135))) {
        return py.getitem(this.car_stopped, 3);
      }
      return py.getitem(this.car_stopped, 2);
    }
    return null;
  }
  rotate_car_callback(item: any): any {
    this.move_car_to_target();
    return null;
  }
  move_car_to_target(): any {
    let distance, duration, dx, dy, left, top: any;
    [left, top] = this.get_car_pos(this.traveling_to, this.car.get_image());
    dx = (left - this.car.get_left());
    dy = (top - this.car.get_top());
    distance = math.sqrt(py.add(py.mul(dx, dx), py.mul(dy, dy)));
    this.start_car_on_animation();
    duration = py.mul(distance, 8);
    animations.start_move(this.car, left, top, duration, null, this.car_move_marks, py.bind(this, "move_car_callback"));
    animations.wait(this.stage, (duration - 150), py.bind(this, "play_tires_sound"));
    return null;
  }
  play_tires_sound(): any {
    this.engine_sound.stop();
    this.tires_sound.play();
    return null;
  }
  move_car_callback(item: any): any {
    let case_: any;
    case_ = this.stage.game.datastore.user_character_progress.case;
    case_.last_department_visited = this.traveling_to.department;
    animations.fade_out_item(this.active_department_image, true, 250);
    this.set_up_active_department();
    animations.fade_in_item(this.active_department_image, 250);
    animations.wait(this.stage, 2000, py.bind(this, "go_to_phase1"));
    return null;
  }
  go_to_phase1(): any {
    let game: any;
    if (py.truthy(this.from_phase0)) {
      this.stage.set_phase(1, true);
    } else {
      game = this.stage.game;
      game.set_stage(new phase0.Phase0Stage(game, 1), true, "p0_loading_slides_001.jpg");
    }
    return null;
  }
  add_other_layer(): any {
    this.stage.add_layer(this.rollover_layer);
    this.stage.add_layer(this.car_layer);
    this.stage.add_layer(this.mask_layer);
    return null;
  }
  start_car_on_animation(): any {
    let i, image_index, images, l: any;
    images = [];
    l = py.len(py.getitem(this.car_running, 0));
    image_index = 0;
    for (i of py.range(l)) {
      py.m(images, "append", this.get_car_running_image(map.car_angle, py.mod(py.add(image_index, i), l)));
    }
    animations.start_image_sequence(this.car, images, 15, (-1));
    return null;
  }
  set_last_visited_departments(): any {
    let case_, image, last_visited, last_visited_image, last_visited_item, visited, visited_image, visited_item: any;
    case_ = this.stage.game.datastore.user_character_progress.case;
    if ((py.eq(case_.last_department_lair, py.getitem(case_.list_departments, 0)) || py.eq(case_.last_department_lair, py.getitem(case_.list_departments, 1)))) {
      last_visited = py.getitem(this.department_data, py.m(this.stage.game.datastore.list_departments, "index", py.getitem(case_.list_departments, 0)));
      image = assets.load_image(py.add(py.add("p0_map_lkl_", last_visited.image_name), ".png"));
      last_visited_item = new ItemImage(last_visited.x, last_visited.y, image);
      py.m(this.map_layer, "add", last_visited_item);
    } else if (py.eq(case_.last_department_lair, py.getitem(case_.list_departments, 2))) {
      visited = py.getitem(this.department_data, py.m(this.stage.game.datastore.list_departments, "index", py.getitem(case_.list_departments, 0)));
      last_visited = py.getitem(this.department_data, py.m(this.stage.game.datastore.list_departments, "index", py.getitem(case_.list_departments, 1)));
      visited_image = assets.load_image(py.add(py.add("p0_map_lkl_", visited.image_name), ".png"));
      last_visited_image = assets.load_image(py.add(py.add("p0_map_lkl_", last_visited.image_name), ".png"));
      visited_item = new ItemImage(visited.x, visited.y, visited_image);
      last_visited_item = new ItemImage(last_visited.x, last_visited.y, last_visited_image);
      py.m(this.map_layer, "add", visited_item);
      py.m(this.map_layer, "add", last_visited_item);
    }
    return null;
  }
}
export class MapDepartment {
  constructor(department: any, image_name: any, x: any, y: any, mask_color: any, center_x: any, center_y: any) {
    this.department = department;
    this.image_name = image_name;
    this.x = x;
    this.y = y;
    this.mask_color = mask_color;
    this.center_x = center_x;
    this.center_y = center_y;
    this.inactive = true;
    return;
  }
}
py.register("game/stages/map", $self);
export function $set(name: string, v: any): void {
  switch (name) {
    case "car_angle": car_angle = v; break;
  }
}
