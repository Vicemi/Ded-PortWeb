// @ts-nocheck
// Generated from the original game code (see MODLOG.md). Do not edit by hand.
import * as py from '../../runtime/py';
import { IsoState } from '../../runtime/prelude';
import { ItemCell } from '../../runtime/prelude';
import { ItemEvent } from '../../runtime/prelude';
import { ItemImage } from '../../runtime/prelude';
import { ItemMask } from '../../runtime/prelude';
import { ItemText } from '../../runtime/prelude';
import { Layer } from '../../runtime/prelude';
import { Minigame } from './minigame';
import * as animations from '../../engine/animations';
import * as assets from '../../engine/assets';
import { bisect } from '../../runtime/py';
import { pygame as $pg } from '../../runtime/prelude'; const delay = (ms: number) => $pg.time.delay(ms);
import { pygame } from '../../runtime/prelude';
import { random } from '../../runtime/py';
import * as statcodes from '../data/statcodes';
const $d1: any = [];

export let GRID_ORIGIN: any = [308, 206];
export let GRID_CELL_WIDTH: any = 34;
export let GRID_CELL_HEIGHT: any = 18;
export let GRID_SIZE: any = [10, 10];
export let ITEM_TAGS: any = ["Soil", "Item", "Selection"];
export let ITEM_STATES: any = [new IsoState("Normal", "")];
export let PLACE_HOLDER_TAGS: any = ["Normal"];
export class MinigameGardener extends Minigame {
  constructor(stage: any, phase1content: any, witness: any) {
    let gardener_image: any;
    super(stage, phase1content, witness, statcodes.MG_GARDENER, statcodes.MG_GARDENER_SOLVED, statcodes.MG_GARDENER_NOTSOLVED, "gardener");
    this.painting = false;
    this.shovel_sound = assets.load_sound("p1_minigame_gardener_shovel.ogg");
    this.minigame_solved_sound = assets.load_sound("p1_minigame_right.ogg");
    this.wrong_sound = assets.load_sound("p1_minigame_wrong.ogg");
    this.witness_minigame_box_image = assets.load_image("p1_minigame_flux_gardener_dialogue1.png");
    gardener_image = assets.load_image("p1_minigame_gardener.png");
    this.witness_item = new ItemImage(438, 83, gardener_image, null);
    this.max_help_stages = 4;
    this.start_time = null;
    this.pause_start_time = null;
    this.pause_total_time = 0;
    this.title = "JARDINERO";
    this.question_intro = "El Jardinero se encuentra muy ocupado\nen este momento, quiz\xe1s si lo ayudas\npuedas interrogarlo luego.";
    this.question = "\xbfTe ofreces a ayudarlo?";
    this.request_text = "La se\xf1ora de la casa me pidi\xf3 que\nplantara su jard\xedn como se\nmuestra en la lista.";
    this.request_question_text = "\xbfPuedes ayudarme a resolverlo?";
    this.thanks_text = "\xa1Muchas gracias!\n\nQued\xf3 perfecto, la se\xf1ora va a estar muy conforme con el trabajo.";
    return;
  }
  get_music(): any {
    return this.phase1content.music_minigame_1;
  }
  blind_show_minigame_callback(layer: any): any {
    if (!py.truthy(this.stage.game.datastore.user_character_progress.minigame_gardener_help_seen)) {
      this.stop_minigame(false);
      this.show_help_dialog();
      this.stage.game.datastore.user_character_progress.minigame_gardener_help_seen = true;
    } else {
      this.start_minigame();
    }
    return null;
  }
  load_help_data(): any {
    let back_left, back_top, background_help_image_item, background_image, lower_help_text, lower_text_height, lower_text_left, lower_text_top, lower_text_width, upper_help_text, upper_text_height, upper_text_left, upper_text_top, upper_text_width: any;
    if ((this.help_stage === 1)) {
      background_image = assets.load_image("p1_minigame_gardener_help_d1.jpg");
      back_left = 124;
      back_top = 132;
      upper_help_text = "El jard\xedn est\xe1 dividido en 100 partes iguales.";
      upper_text_left = 205;
      upper_text_top = 92;
      upper_text_width = 192;
      upper_text_height = 37;
      lower_help_text = "x 100";
      lower_text_left = 304;
      lower_text_top = 334;
      lower_text_width = 49;
      lower_text_height = 16;
      this.help_previous_button.set_visible(false);
    } else if ((this.help_stage === 2)) {
      background_image = assets.load_image("p1_minigame_gardener_help_d2.jpg");
      back_left = 124;
      back_top = 167;
      upper_help_text = "En la lista aparecen los diferentes tipos de plantas con las que debemos llenar el jard\xedn y las proporciones correspondientes.";
      upper_text_left = 157;
      upper_text_top = 93;
      upper_text_width = 288;
      upper_text_height = 66;
    } else if ((this.help_stage === 3)) {
      background_image = assets.load_image("p1_minigame_gardener_help_d25.jpg");
      back_left = 124;
      back_top = 132;
      upper_help_text = "Podemos plantar de a una casilla haciendo click en ella.";
      upper_text_left = 156;
      upper_text_top = 93;
      upper_text_width = 288;
      upper_text_height = 42;
      lower_help_text = "O podemos plantar de a varias, dejando apretado el bot\xf3n izquierdo del rat\xf3n\ny moviendo el cursor.";
      lower_text_left = 151;
      lower_text_top = 308;
      lower_text_width = 298;
      lower_text_height = 54;
    } else if ((this.help_stage === 4)) {
      background_image = assets.load_image("p1_minigame_gardener_help_d3.jpg");
      back_left = 124;
      back_top = 153;
      upper_help_text = "al completar la cantidad correspondiente a cada planta, cambiar\xe1 el color en la lista a rojo.";
      upper_text_left = 154;
      upper_text_top = 93;
      upper_text_width = 288;
      upper_text_height = 56;
      lower_help_text = "cuando se complete toda la lista, se dar\xe1 por conclu\xedda la tarea.";
      lower_text_left = 157;
      lower_text_top = 313;
      lower_text_width = 288;
      lower_text_height = 39;
    }
    background_help_image_item = new ItemImage(0, 0, null, null);
    background_help_image_item.set_image(background_image);
    background_help_image_item.set_lefttop(back_left, back_top);
    py.m(this.help_current_layer, "add", background_help_image_item);
    if ((this.help_stage !== 2)) {
      this.lower_help_text_item = new ItemText(lower_text_left, lower_text_top, this.font_14, 16, lower_help_text, [183, 35, 35], null, lower_text_width, lower_text_height, 2);
      py.m(this.help_current_layer, "add", this.lower_help_text_item);
    }
    this.upper_help_text_item = new ItemText(upper_text_left, upper_text_top, this.font_14, 16, upper_help_text, [183, 35, 35], null, upper_text_width, upper_text_height, 2);
    py.m(this.help_current_layer, "add", this.upper_help_text_item);
    return null;
  }
  start_minigame(): any {
    this.play_music();
    this.start_play_stats_event();
    if ((this.start_time == null)) {
      this.start_time = pygame.time.get_ticks();
    } else {
      this.pause_total_time = py.add(this.pause_total_time, (pygame.time.get_ticks() - this.pause_start_time));
      this.pause_start_time = null;
    }
    return null;
  }
  stop_minigame(solved: any): any {
    this.end_play_stats_event(solved);
    this.pause_start_time = pygame.time.get_ticks();
    return null;
  }
  set_up_minigame(): any {
    let character_progress, minigame_level, n_fractions: any;
    character_progress = this.stage.game.datastore.user_character_progress;
    minigame_level = character_progress.range.minigame_level;
    if ((minigame_level === 1)) {
      n_fractions = 0;
    } else if ((minigame_level === 2)) {
      n_fractions = 5;
    } else {
      n_fractions = random.randint(2, 3);
    }
    this.average_time = 90;
    this.build_list(n_fractions);
    this.prepare_grid();
    this.set_up_game_background_items();
    this.set_up_witness();
    this.set_up_options();
    this.set_up_buttons();
    this.set_up_texts();
    this.stage.add_layer(this.grid_layer);
    this.stage.add_layer(this.grid_selection_layer);
    this.stage.add_layer(this.grid_goodjob_layer);
    this.stage.set_prerender_buffer(this.grid_layer);
    return null;
  }
  build_list(n_fractions: any): any {
    let added_flowers, flower, fractions, item, option_icon, percentages, text_icon: any;
    this.list = [];
    random.seed();
    [percentages, fractions] = this.generate_values(n_fractions);
    added_flowers = [];
    while ((py.len(added_flowers) < 4)) {
      flower = random.randint(1, 5);
      if (!py.contains(added_flowers, flower)) {
        if ((flower === 1)) {
          option_icon = assets.load_image("p1_minigame_gardener_opt_daisy.png");
          text_icon = assets.load_image("p1_minigame_gardener_icon_daisy.png");
          item = new ListItem(option_icon, "MARGARITAS", text_icon, py.getitem(percentages, py.len(added_flowers)), py.getitem(fractions, py.len(added_flowers)), "i010", 0);
          py.m(this.list, "append", item);
        } else if ((flower === 2)) {
          option_icon = assets.load_image("p1_minigame_gardener_opt_carnation.png");
          text_icon = assets.load_image("p1_minigame_gardener_icon_carnation.png");
          item = new ListItem(option_icon, "CLAVELES", text_icon, py.getitem(percentages, py.len(added_flowers)), py.getitem(fractions, py.len(added_flowers)), "i011", 0);
          py.m(this.list, "append", item);
        } else if ((flower === 3)) {
          option_icon = assets.load_image("p1_minigame_gardener_opt_rose.png");
          text_icon = assets.load_image("p1_minigame_gardener_icon_rose.png");
          item = new ListItem(option_icon, "ROSAS", text_icon, py.getitem(percentages, py.len(added_flowers)), py.getitem(fractions, py.len(added_flowers)), "i014", 0);
          py.m(this.list, "append", item);
        } else if ((flower === 4)) {
          option_icon = assets.load_image("p1_minigame_gardener_opt_jazmin.png");
          text_icon = assets.load_image("p1_minigame_gardener_icon_jazmin.png");
          item = new ListItem(option_icon, "JAZMINES", text_icon, py.getitem(percentages, py.len(added_flowers)), py.getitem(fractions, py.len(added_flowers)), "i013", 0);
          py.m(this.list, "append", item);
        } else {
          option_icon = assets.load_image("p1_minigame_gardener_opt_tulip_y.png");
          text_icon = assets.load_image("p1_minigame_gardener_icon_tulip_y.png");
          item = new ListItem(option_icon, "TULIPANES", text_icon, py.getitem(percentages, py.len(added_flowers)), py.getitem(fractions, py.len(added_flowers)), "i012", 0);
          py.m(this.list, "append", item);
        }
        py.m(added_flowers, "append", flower);
      }
    }
    option_icon = assets.load_image("p1_minigame_gardener_opt_soil.png");
    text_icon = assets.load_image("p1_minigame_gardener_icon_soil.png");
    item = new ListItem(option_icon, "TIERRA", text_icon, py.getitem(percentages, 4), py.getitem(fractions, 4), "soil", py.mul(py.getitem(GRID_SIZE, 0), py.getitem(GRID_SIZE, 1)));
    py.m(this.list, "append", item);
    return null;
  }
  generate_values(n_fractions: any): any {
    let f, fraction_sets, fractions, fractions_assigned, fractions_options, index, indexes, n_items, percentage, percentages, total: any;
    n_items = 5;
    percentages = (() => { const $r: any[] = []; let i; for (i of py.iter(py.rangeList(n_items))) { $r.push(0); } return $r; })();
    fractions = (() => { const $r: any[] = []; let i; for (i of py.iter(py.rangeList(n_items))) { $r.push(null); } return $r; })();
    total = 0;
    fractions_assigned = 0;
    while (((fractions_assigned < n_fractions) || ((n_fractions < n_items) && (total >= 100)))) {
      if (py.eq(n_fractions, n_items)) {
        fraction_sets = [[["1_4", 25], ["1_4", 25], ["1_5", 20], ["1_5", 20], ["1_10", 10]], [["2_5", 40], ["3_10", 30], ["1_10", 10], ["1_10", 10], ["1_10", 10]], [["2_5", 40], ["1_5", 20], ["1_5", 20], ["1_10", 10], ["1_10", 10]], [["3_10", 30], ["3_10", 30], ["1_5", 20], ["1_10", 10], ["1_10", 10]]];
        fractions_options = random.choice(fraction_sets);
      } else {
        fractions_options = [["1_2", 50], ["1_4", 25], ["1_5", 20], ["1_10", 10], ["2_4", 50], ["2_5", 40], ["3_10", 30]];
      }
      fractions_assigned = 0;
      percentages = (() => { const $r: any[] = []; let i; for (i of py.iter(py.rangeList(n_items))) { $r.push(0); } return $r; })();
      fractions = (() => { const $r: any[] = []; let i; for (i of py.iter(py.rangeList(n_items))) { $r.push(null); } return $r; })();
      indexes = (() => { const $r: any[] = []; let i; for (i of py.iter(py.rangeList(n_items))) { $r.push(i); } return $r; })();
      total = 0;
      while (((fractions_assigned < n_fractions) && (py.len(fractions_options) > 0))) {
        f = random.choice(fractions_options);
        py.m(fractions_options, "remove", f);
        percentage = py.getitem(f, 1);
        if ((py.add(total, percentage) <= 100)) {
          index = random.choice(indexes);
          py.m(indexes, "remove", index);
          py.setitem(percentages, index, py.add(py.getitem(percentages, index), percentage));
          py.setitem(fractions, index, f);
          total = py.add(total, percentage);
          fractions_assigned = fractions_assigned + 1;
        }
      }
    }
    while ((total < 100)) {
      index = random.randint(0, (n_items - 1));
      if (((py.getitem(percentages, index) < 65) && (py.getitem(fractions, index) == null))) {
        py.setitem(percentages, index, py.getitem(percentages, index) + 5);
        total = total + 5;
      }
    }
    return [percentages, fractions];
  }
  set_up_game_background_items(): any {
    let garden_image, garden_item_image, grid_image, grid_item_image, grid_mask: any;
    garden_image = assets.load_image("p1_minigame_gardener_background.png");
    garden_item_image = new ItemImage(14, 57, garden_image);
    py.m(this.layer, "add", garden_item_image);
    grid_image = assets.load_image("p1_minigame_gardener_grid.png");
    grid_item_image = new ItemImage(137, 206, grid_image);
    py.m(this.layer, "add", grid_item_image);
    grid_mask = assets.load_mask("p1_minigame_gardener_grid_mask.gif");
    this.grid_mask_item = new ItemMask(134, 209, grid_mask);
    this.grid_mask_item.add_event_handler(ItemEvent.MOUSE_ENTER, py.bind(this, "grid_enter"));
    this.grid_mask_item.add_event_handler(ItemEvent.MOUSE_LEAVE, py.bind(this, "grid_leave"));
    this.grid_mask_item.add_event_handler(ItemEvent.MOUSE_MOVE, py.bind(this, "grid_mousemove"));
    this.grid_mask_item.add_event_handler(ItemEvent.CLICK, py.bind(this, "grid_click"));
    py.m(this.layer, "add", this.grid_mask_item);
    return null;
  }
  set_up_options(): any {
    this.option_image_normal = assets.load_image("p1_minigame_gardener_opt_button.png");
    this.option_image_rollover = assets.load_image("p1_minigame_gardener_opt_rollover.png");
    this.option_image_selected = assets.load_image("p1_minigame_gardener_opt_selected.png");
    this.add_option(8, 180, py.getitem(this.list, 0));
    this.add_option(52, 180, py.getitem(this.list, 1));
    this.add_option(95, 180, py.getitem(this.list, 2));
    this.add_option(31, 225, py.getitem(this.list, 3));
    this.add_option(74, 225, py.getitem(this.list, 4));
    this.selected_option = null;
    this.mouse_option_cursor = new ItemImage(0, 0, null);
    return null;
  }
  add_option(x: any, y: any, list_item: any): any {
    let icon_item, option_item: any;
    option_item = new ItemImage(x, y, this.option_image_normal);
    option_item.set_rollover_image(this.option_image_rollover, this.rollover_sound);
    option_item.list_item = list_item;
    option_item.add_event_handler(ItemEvent.CLICK, py.bind(this, "tool_option_item_click"));
    py.m(this.layer, "add", option_item);
    icon_item = new ItemImage(x, y, list_item.option_icon);
    py.m(this.layer, "add", icon_item);
    return option_item;
  }
  set_up_buttons(): any {
    let close_image, close_item, help_image, help_item, rollover_image: any;
    close_image = assets.load_image("p1_minigames_btn_close_normal.png");
    rollover_image = assets.load_image("p1_minigames_btn_close_active.png");
    close_item = new ItemImage(268, 49, close_image);
    close_item.set_rollover_image(rollover_image, this.rollover_sound);
    close_item.add_event_handler(ItemEvent.CLICK, py.bind(this, "close_click"));
    py.m(this.layer, "add", close_item);
    help_image = assets.load_image("p1_minigames_btn_help_normal.png");
    rollover_image = assets.load_image("p1_minigames_btn_help_active.png");
    help_item = new ItemImage(303, 49, help_image);
    help_item.set_rollover_image(rollover_image, this.rollover_sound);
    help_item.add_event_handler(ItemEvent.CLICK, py.bind(this, "help_click"));
    py.m(this.layer, "add", help_item);
    return null;
  }
  set_up_texts(): any {
    this.add_list_item(109, 112, py.getitem(this.list, 0));
    this.add_list_item(109, 132, py.getitem(this.list, 1));
    this.add_list_item(109, 151, py.getitem(this.list, 2));
    this.add_list_item(311, 122, py.getitem(this.list, 3));
    this.add_list_item(311, 142, py.getitem(this.list, 4));
    this.update_items_text();
    return null;
  }
  add_list_item(x: any, y: any, list_item: any): any {
    let icon_item, percentage_item, percentage_symbol_item, text, text_item: any;
    icon_item = new ItemImage(x, y, list_item.text_icon);
    py.m(this.layer, "add", icon_item);
    text = py.add(list_item.text, ".................");
    text_item = new ItemText(py.add(x, 26), py.add(y, 4), this.font_12_bld, 0, text, [80, 70, 70], null, 108, 19);
    py.m(this.layer, "add", text_item);
    if ((list_item.fraction == null)) {
      if ((list_item.percentage < 10)) {
        text = py.add(" ", py.str(list_item.percentage));
      } else {
        text = py.str(list_item.percentage);
      }
      percentage_item = new ItemText(py.add(x, 135), (y - 1), this.font_18, 0, text, [80, 70, 70]);
      py.m(this.layer, "add", percentage_item);
      percentage_symbol_item = new ItemText(py.add(x, 160), py.add(y, 4), this.font_12_bld, 0, "%", [80, 70, 70]);
      py.m(this.layer, "add", percentage_symbol_item);
    } else {
      text = py.m(py.getitem(list_item.fraction, 0), "replace", "_", "/");
      percentage_item = new ItemText(py.add(x, 135), (y - 1), this.font_18, 0, text, [80, 70, 70]);
      py.m(this.layer, "add", percentage_item);
      percentage_symbol_item = null;
    }
    list_item.text_items = [text_item, percentage_item, percentage_symbol_item];
    return null;
  }
  prepare_grid(): any {
    this.grid_layer = new Layer();
    this.grid_positions = [];
    this.grid_goodjob_layer = new Layer();
    this.grid_selection_layer = new Layer();
    this.stage.set_tags(ITEM_TAGS);
    this.stage.set_grid_definition(GRID_ORIGIN, GRID_CELL_WIDTH, GRID_CELL_HEIGHT, 1);
    this.stage.set_items("p1gs01");
    this.grid_data = (() => { const $r: any[] = []; let j; for (j of py.iter(py.rangeList(10))) { $r.push((() => { const $r: any[] = []; let i; for (i of py.iter(py.rangeList(10))) { $r.push(null); } return $r; })()); } return $r; })();
    this.selection_grid = (() => { const $r: any[] = []; let j; for (j of py.iter(py.rangeList(10))) { $r.push((() => { const $r: any[] = []; let i; for (i of py.iter(py.rangeList(10))) { $r.push(new ItemCell(this.stage, "i001", py.getitem(ITEM_STATES, 0), false, j, i)); } return $r; })()); } return $r; })();
    return null;
  }
  close_click(item: any, args: any): any {
    this.stop_minigame(false);
    this.phase1content.minigame_solved(false);
    this.close_minigame();
    return null;
  }
  grid_enter(item: any, args: any): any {
    let item_definition, item_image, item_type: any;
    if ((this.selected_option != null)) {
      item_type = this.selected_option.list_item.item_type;
      if ((item_type === "soil")) {
        this.stage.set_mouse_cursor(null);
      } else {
        item_image = this.stage.load_item_image(item_type, py.getitem(ITEM_STATES, 0));
        item_definition = this.stage.get_item_definition(item_type);
        this.mouse_option_cursor.set_image(item_image);
        this.stage.set_mouse_cursor(this.mouse_option_cursor, item_definition.center);
      }
    }
    return null;
  }
  grid_leave(item: any, args: any): any {
    if (!py.truthy(this.painting)) {
      this.stage.set_mouse_cursor(null);
      this.grid_selection_layer.empty();
    }
    return null;
  }
  grid_mousemove(item: any, args: any): any {
    let cell, col, filled_items, row, selection_filled, selection_type: any;
    if ((!py.truthy(this.painting) && (this.selected_option != null))) {
      [row, col] = this.stage.get_rowcol(args.x, args.y);
      if (((row >= 0) && (row < py.getitem(GRID_SIZE, 0)) && (col >= 0) && (col < py.getitem(GRID_SIZE, 1)))) {
        this.grid_selection_layer.empty();
        cell = py.getitem(py.getitem(this.selection_grid, row), col);
        filled_items = this.get_items_filled();
        selection_type = this.selected_option.list_item.item_type;
        selection_filled = this.get_selection_filled(selection_type, filled_items);
        this.set_selection_cell_type(row, col, selection_type, cell, selection_filled, filled_items);
        py.m(this.grid_selection_layer, "add", cell);
      } else {
        this.grid_selection_layer.empty();
      }
    }
    return null;
  }
  grid_click(item: any, args: any): any {
    let col, row: any;
    if ((this.selected_option != null)) {
      [row, col] = this.stage.get_rowcol(args.x, args.y);
      if (((row >= 0) && (row < py.getitem(GRID_SIZE, 0)) && (col >= 0) && (col < py.getitem(GRID_SIZE, 1)))) {
        this.painting = true;
        this.painting_from = [row, col];
        this.stage.capture_leftmousedown(this.grid_mask_item, py.bind(this, "mouse_paint"));
      }
    }
    return null;
  }
  mouse_paint(mouse_args: any, released: any): any {
    let col, minigame_solved, mouse_inside, row: any;
    [row, col] = this.stage.get_rowcol(mouse_args.x, mouse_args.y);
    if (((row >= 0) && (row < py.getitem(GRID_SIZE, 0)) && (col >= 0) && (col < py.getitem(GRID_SIZE, 1)))) {
      mouse_inside = true;
    } else {
      if ((row < 0)) {
        row = 0;
      } else if ((row >= py.getitem(GRID_SIZE, 0))) {
        row = (py.getitem(GRID_SIZE, 0) - 1);
      }
      if ((col < 0)) {
        col = 0;
      } else if ((col >= py.getitem(GRID_SIZE, 1))) {
        col = (py.getitem(GRID_SIZE, 1) - 1);
      }
      mouse_inside = false;
    }
    this.painting_to = [row, col];
    if (py.truthy(released)) {
      this.painting = false;
      minigame_solved = this.paint_items(mouse_args.x, mouse_args.y);
      this.grid_selection_layer.empty();
      if ((!py.truthy(mouse_inside) || py.truthy(minigame_solved))) {
        this.stage.set_mouse_cursor(null);
      } else {
        this.grid_selection_layer.empty();
        py.m(this.grid_selection_layer, "add", py.getitem(py.getitem(this.selection_grid, row), col));
      }
    } else {
      this.update_paint_region();
    }
    return null;
  }
  update_paint_region(): any {
    let c, cell, filled_items, from_col, from_row, r, selection_filled, selection_type, to_col, to_row: any;
    from_row = py.min(py.getitem(this.painting_from, 0), py.getitem(this.painting_to, 0));
    from_col = py.min(py.getitem(this.painting_from, 1), py.getitem(this.painting_to, 1));
    to_row = py.max(py.getitem(this.painting_from, 0), py.getitem(this.painting_to, 0));
    to_col = py.max(py.getitem(this.painting_from, 1), py.getitem(this.painting_to, 1));
    filled_items = this.get_items_filled();
    selection_type = this.selected_option.list_item.item_type;
    selection_filled = this.get_selection_filled(selection_type, filled_items);
    for (r of py.range(0, 10)) {
      for (c of py.range(0, 10)) {
        cell = py.getitem(py.getitem(this.selection_grid, r), c);
        if (((r >= from_row) && (r <= to_row) && (c >= from_col) && (c <= to_col))) {
          this.set_selection_cell_type(r, c, selection_type, cell, selection_filled, filled_items);
          if ((cell.get_layer() == null)) {
            py.m(this.grid_selection_layer, "add", cell);
          }
        } else if ((cell.get_layer() != null)) {
          py.m(this.grid_selection_layer, "remove", cell);
        }
      }
    }
    return null;
  }
  set_selection_cell_type(r: any, c: any, selection_type: any, selection_cell: any, selection_filled: any, filled_items: any): any {
    let filled, item, item_type: any;
    if ((selection_type === "soil")) {
      selection_cell.set_type("i001");
    } else if (py.truthy(selection_filled)) {
      selection_cell.set_type("i002");
    } else if ((py.getitem(py.getitem(this.grid_data, r), c) != null)) {
      item_type = py.getitem(py.getitem(this.grid_data, r), c).get_type();
      if (py.eq(item_type, selection_type)) {
        selection_cell.set_type("i001");
      } else {
        filled = false;
        for (item of py.iter(filled_items)) {
          if (py.eq(item.item_type, item_type)) {
            filled = true;
            break;
          }
        }
        if (py.truthy(filled)) {
          selection_cell.set_type("i002");
        } else {
          selection_cell.set_type("i001");
        }
      }
    } else {
      selection_cell.set_type("i001");
    }
    return null;
  }
  get_selection_filled(selection_type: any, filled_items: any): any {
    let filled, item: any;
    filled = false;
    for (item of py.iter(filled_items)) {
      if (py.eq(item.item_type, selection_type)) {
        filled = true;
        break;
      }
    }
    return filled;
  }
  paint_items(x: any, y: any): any {
    let c, cell, center_col, center_row, from_col, from_row, has_filled_item, index, item, item_type, new_filled_items, old_filled_items, r, separation, to_col, to_row: any;
    if ((this.selected_option == null)) {
      return false;
    } else {
      item_type = this.selected_option.list_item.item_type;
      old_filled_items = this.get_items_filled();
      has_filled_item = this.has_selection_filled_item(item_type, old_filled_items);
      if (py.truthy(has_filled_item)) {
        this.stage.render();
        this.wrong_sound.play();
        return false;
      }
      [from_row, from_col] = this.painting_from;
      [to_row, to_col] = this.painting_to;
      for (r of py.range(py.min(from_row, to_row), py.add(py.max(from_row, to_row), 1))) {
        for (c of py.range(py.min(from_col, to_col), py.add(py.max(from_col, to_col), 1))) {
          if ((py.getitem(py.getitem(this.grid_data, r), c) != null)) {
            cell = py.getitem(py.getitem(this.grid_data, r), c);
            if (!py.eq(item_type, cell.get_type())) {
              this.substract_item(cell.get_type());
              if ((item_type !== "soil")) {
                cell.set_type(item_type);
                this.sum_item(item_type);
              } else {
                py.setitem(py.getitem(this.grid_data, r), c, null);
                py.m(this.grid_layer, "remove", cell);
                py.m(this.grid_positions, "remove", py.add(r, c));
                this.sum_item("soil");
              }
            }
          } else if ((item_type !== "soil")) {
            item_type = this.selected_option.list_item.item_type;
            cell = new ItemCell(this.stage, item_type, py.getitem(ITEM_STATES, 0));
            cell.set_position(r, c);
            py.setitem(py.getitem(this.grid_data, r), c, cell);
            index = bisect.bisect(this.grid_positions, py.add(r, c));
            py.m(this.grid_layer, "add", cell, index);
            py.m(this.grid_positions, "insert", index, py.add(r, c));
            this.substract_item("soil");
            this.sum_item(item_type);
          }
        }
      }
      new_filled_items = this.update_items_text(old_filled_items);
      this.stage.render();
      this.shovel_sound.play();
      if ((py.len(new_filled_items) > 0)) {
        center_row = py.fdiv(py.float(py.add(from_row, to_row)), 2);
        center_col = py.fdiv(py.float(py.add(from_col, to_col)), 2);
        [x, y] = this.stage.get_xy(center_row, center_col);
        separation = 95;
        x = x - py.div(py.mul((py.len(new_filled_items) - 1), separation), 2);
        y = y - 20;
        for (item of py.iter(new_filled_items)) {
          if ((item.percentage !== 0)) {
            this.start_goodjob_animation(item, x, y);
            x = py.add(x, separation);
          }
        }
        this.stage.render();
        this.minigame_solved_sound.play();
      }
      return this.check_minigame_solved();
      return null;
    }
  }
  has_selection_filled_item(selection_item_type: any, filled_items: any): any {
    let c, cell, from_col, from_row, item, r, to_col, to_row: any;
    if ((selection_item_type === "soil")) {
      return false;
    } else {
      for (item of py.iter(filled_items)) {
        if (py.eq(item.item_type, selection_item_type)) {
          return true;
        }
      }
      [from_row, from_col] = this.painting_from;
      [to_row, to_col] = this.painting_to;
      for (r of py.range(py.min(from_row, to_row), py.add(py.max(from_row, to_row), 1))) {
        for (c of py.range(py.min(from_col, to_col), py.add(py.max(from_col, to_col), 1))) {
          if ((py.getitem(py.getitem(this.grid_data, r), c) != null)) {
            cell = py.getitem(py.getitem(this.grid_data, r), c);
            if (!py.eq(selection_item_type, cell.get_type())) {
              for (item of py.iter(filled_items)) {
                if (py.eq(item.item_type, cell.get_type())) {
                  return true;
                }
              }
            }
          }
        }
      }
      return false;
    }
  }
  sum_item(item_type: any): any {
    let item: any;
    for (item of py.iter(this.list)) {
      if (py.eq(item.item_type, item_type)) {
        item.count = item.count + 1;
        break;
      }
    }
    return null;
  }
  substract_item(item_type: any): any {
    let item: any;
    for (item of py.iter(this.list)) {
      if (py.eq(item.item_type, item_type)) {
        item.count = item.count - 1;
        break;
      }
    }
    return null;
  }
  get_items_filled(): any {
    let current_percentage, filled_items, item, total: any;
    filled_items = [];
    total = py.mul(py.getitem(GRID_SIZE, 0), py.getitem(GRID_SIZE, 1));
    for (item of py.iter(this.list)) {
      current_percentage = py.int((py.fdiv(py.float(item.count), total) * 100));
      if (py.eq(current_percentage, item.percentage)) {
        py.m(filled_items, "append", item);
      }
    }
    return filled_items;
  }
  update_items_text(exclude_filled_items: any = $d1): any {
    let current_percentage, filled_items, item, item_text, total: any;
    filled_items = [];
    total = py.mul(py.getitem(GRID_SIZE, 0), py.getitem(GRID_SIZE, 1));
    for (item of py.iter(this.list)) {
      current_percentage = py.int((py.fdiv(py.float(item.count), total) * 100));
      if (py.eq(current_percentage, item.percentage)) {
        for (item_text of py.iter(item.text_items)) {
          if ((item_text != null)) {
            item_text.set_color([154, 4, 4]);
          }
        }
        if (!py.contains(exclude_filled_items, item)) {
          py.m(filled_items, "append", item);
        }
      } else {
        for (item_text of py.iter(item.text_items)) {
          if ((item_text != null)) {
            item_text.set_color([80, 70, 70]);
          }
        }
      }
    }
    return filled_items;
  }
  start_goodjob_animation(item: any, x: any, y: any): any {
    let animation: any;
    animation = new GoodJobAnimation(this.stage, this.grid_goodjob_layer, item, x, y);
    animation.start();
    return null;
  }
  tool_option_item_click(item: any, args: any): any {
    this.stage.render();
    this.stage.click_sound.play();
    this.set_selected_option(item);
    return null;
  }
  set_selected_option(item: any): any {
    if ((this.selected_option != null)) {
      this.selected_option.set_image(this.option_image_normal);
      this.selected_option.set_rollover_image(this.option_image_rollover, this.rollover_sound);
    }
    this.selected_option = item;
    item.set_image(this.option_image_selected);
    item.set_rollover_image(null, null);
    return null;
  }
  check_minigame_solved(): any {
    let current_percentage, item, solved, total: any;
    solved = true;
    total = py.mul(py.getitem(GRID_SIZE, 0), py.getitem(GRID_SIZE, 1));
    for (item of py.iter(this.list)) {
      current_percentage = py.int((py.fdiv(py.float(item.count), total) * 100));
      if (!py.eq(current_percentage, item.percentage)) {
        solved = false;
        break;
      }
    }
    if (py.truthy(solved)) {
      this.stop_minigame(true);
      this.grid_selection_layer.empty();
      animations.wait_locked(this.stage, 2000, py.bind(this, "minigame_solved_callback"));
    }
    return solved;
  }
  create_character_happy_item(): any {
    let gardener_happy_image: any;
    gardener_happy_image = assets.load_image("p1_minigame_gardener_happy.png");
    return new ItemImage(438, 83, gardener_happy_image, null);
  }
  calculate_solved_score(): any {
    let elapsed_time, time_score: any;
    if ((this.pause_start_time != null)) {
      this.pause_total_time = py.add(this.pause_total_time, (pygame.time.get_ticks() - this.pause_start_time));
      this.pause_start_time = null;
    }
    elapsed_time = py.div(((pygame.time.get_ticks() - this.start_time) - this.pause_total_time), 1000);
    if ((elapsed_time <= this.average_time)) {
      time_score = py.div((128 * (this.average_time - elapsed_time)), this.average_time);
    } else {
      time_score = 0;
    }
    return [100, time_score];
  }
}
export class ListItem {
  constructor(option_icon: any, text: any, text_icon: any, percentage: any, fraction: any, item_type: any, count: any) {
    this.option_icon = option_icon;
    this.text = text;
    this.text_icon = text_icon;
    this.percentage = percentage;
    this.fraction = fraction;
    this.item_type = item_type;
    this.count = count;
    return;
  }
}
export class GoodJobAnimation {
  constructor(stage: any, grid_goodjob_layer: any, item: any, x: any, y: any) {
    let fraction_str, left, number_str, top: any;
    this.stage = stage;
    this.grid_goodjob_layer = grid_goodjob_layer;
    if ((item.fraction == null)) {
      if ((item.percentage < 10)) {
        number_str = py.add("0", py.str(item.percentage));
      } else {
        number_str = py.str(item.percentage);
      }
      this.color_image = assets.load_image(py.add(py.add("p1_minigame_gardener_goodjob_n", number_str), ".png"));
      this.white_image = assets.load_image(py.add(py.add("p1_minigame_gardener_goodjob_w", number_str), ".png"));
    } else {
      fraction_str = py.getitem(item.fraction, 0);
      this.color_image = assets.load_image(py.add(py.add("p1_minigame_gardener_goodjob_f", fraction_str), ".png"));
      this.white_image = assets.load_image(py.add(py.add("p1_minigame_gardener_goodjob_w", fraction_str), ".png"));
    }
    left = (x - py.div(this.color_image.get_width(), 2));
    top = (y - py.div(this.color_image.get_height(), 2));
    this.color_item = new ItemImage(left, top, this.color_image);
    this.white_item = new ItemImage(left, top, this.white_image);
    return;
  }
  start(): any {
    let from_size, to_size: any;
    py.m(this.grid_goodjob_layer, "add", this.color_item);
    py.m(this.grid_goodjob_layer, "add", this.white_item);
    from_size = [py.int((py.float(this.color_image.get_width()) * 0.82)), py.int((py.float(this.color_image.get_height()) * 0.82))];
    animations.start_resize(this.color_item, this.color_image, from_size, this.color_image.get_size(), 230, 1, this._GoodJobAnimation__resize_callback);
    to_size = [py.int((py.float(this.white_image.get_width()) * 0.82)), py.int((py.float(this.white_image.get_height()) * 0.82))];
    animations.start_resize(this.white_item, this.white_image, from_size, this.white_image.get_size(), 230, 1);
    this.white_item.set_alpha(200);
    animations.fade_out_item(this.white_item, true, 230);
    return null;
  }
  _GoodJobAnimation__resize_callback(item: any): any {
    animations.wait(this.stage, 100, this._GoodJobAnimation__wait_callback);
    return null;
  }
  _GoodJobAnimation__wait_callback(): any {
    if ((this.grid_goodjob_layer.get_stage() != null)) {
      animations.start_move(this.color_item, this.color_item.get_left(), (this.color_item.get_top() - 83), 560);
      animations.fade_out_item(this.color_item, true, 560);
    }
    return null;
  }
}
