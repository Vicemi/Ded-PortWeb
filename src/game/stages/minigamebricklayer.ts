// @ts-nocheck
// Generated from the original game code (see MODLOG.md). Do not edit by hand.
import * as py from '../../runtime/py';
import { ItemEvent } from '../../runtime/prelude';
import { ItemImage } from '../../runtime/prelude';
import { ItemText } from '../../runtime/prelude';
import { Minigame } from './minigame';
import { Rect } from '../../runtime/prelude';
import * as animations from '../../engine/animations';
import * as assets from '../../engine/assets';
import { pygame } from '../../runtime/prelude';
import { random } from '../../runtime/py';
import * as statcodes from '../data/statcodes';
import * as $self from './minigamebricklayer';

export class MinigameBricklayer extends Minigame {
  constructor(stage: any, phase1content: any, witness: any) {
    let bricklayer_image: any;
    super(stage, phase1content, witness, statcodes.MG_BRICKLAYER, statcodes.MG_BRICKLAYER_SOLVED, statcodes.MG_BRICKLAYER_NOTSOLVED, "bricklayer");
    this.witness_minigame_box_image = assets.load_image("p1_minigame_flux_bricklayer_dialogue1.png");
    this.right_sound = assets.load_sound("p1_minigame_right.ogg");
    this.drag_sound = assets.load_sound("p1_minigame_bricklayer_drag.ogg");
    this.fade_sound = assets.load_sound("fade.ogg");
    this.showing_missing_piece = false;
    this.move_duration = (py.mul(this.drag_sound.get_length(), 1000) * 0.75);
    bricklayer_image = assets.load_image("p1_minigame_bricklayer.png");
    this.witness_item = new ItemImage(428, 66, bricklayer_image, null);
    this.puzzle_pieces = [];
    this.max_help_stages = 4;
    this.minigame_solved = false;
    this.start_time = null;
    this.pause_start_time = null;
    this.pause_total_time = 0;
    this.title = "ALBA\xd1IL";
    this.question_intro = "El Alba\xf1il se encuentra muy ocupado\nen este momento, quiz\xe1s si lo ayudas\npuedas interrogarlo luego.";
    this.question = "\xbfTe ofreces a ayudarlo?";
    this.request_text = "El due\xf1o de casa me pidi\xf3 que colocara\nun mural en la pared y me lo dio separado\nen piezas de cer\xe1mica.";
    this.request_question_text = "\xbfMe ayudas a ordenar las piezas\npara formar la imagen?";
    this.thanks_text = "\xa1Muchas gracias! El due\xf1o de casa va a quedar muy satisfecho.";
    this.picture = this.select_picture();
    return;
  }
  get_music(): any {
    return this.phase1content.music_minigame_1;
  }
  blind_show_minigame_callback(layer: any): any {
    if (!py.truthy(this.stage.game.datastore.user_character_progress.minigame_bricklayer_help_seen)) {
      this.stop_minigame(false);
      this.show_help_dialog();
      this.stage.game.datastore.user_character_progress.minigame_bricklayer_help_seen = true;
    } else {
      this.start_minigame();
    }
    return null;
  }
  load_help_data(): any {
    let back_left, back_top, background_help_image_item, background_image, upper_help_text, upper_text_height, upper_text_left, upper_text_top, upper_text_width: any;
    if ((this.help_stage === 1)) {
      background_image = assets.load_image("p1_minigame_bricklayer_help_d1.jpg");
      back_left = 126;
      back_top = 146;
      upper_help_text = "En la pantalla veremos las piezas del mural desordenadas.";
      upper_text_left = 157;
      upper_text_top = 94;
      upper_text_width = 288;
      upper_text_height = 67;
      this.help_previous_button.set_visible(false);
    } else if ((this.help_stage === 2)) {
      background_image = assets.load_image("p1_minigame_bricklayer_help_d2.jpg");
      back_left = 125;
      back_top = 143;
      upper_help_text = "Haciendo clic sobre una pieza, \xe9sta se mover\xe1 hasta el espacio vac\xedo.";
      upper_text_left = 163;
      upper_text_top = 94;
      upper_text_width = 275;
      upper_text_height = 49;
    } else if ((this.help_stage === 3)) {
      background_image = assets.load_image("p1_minigame_bricklayer_help_d3.jpg");
      back_left = 125;
      back_top = 143;
      upper_help_text = "Si hay m\xe1s piezas entre ella y el espacio vac\xedo se mover\xe1n todas.";
      upper_text_left = 156;
      upper_text_top = 94;
      upper_text_width = 288;
      upper_text_height = 56;
    } else if ((this.help_stage === 4)) {
      background_image = assets.load_image("p1_minigame_bricklayer_help_d4.jpg");
      back_left = 125;
      back_top = 143;
      upper_help_text = "Una vez que la imagen est\xe9 formada se dar\xe1 por conclu\xedda la tarea.";
      upper_text_left = 157;
      upper_text_top = 94;
      upper_text_width = 288;
      upper_text_height = 56;
    }
    background_help_image_item = new ItemImage(0, 0, null, null);
    background_help_image_item.set_image(background_image);
    background_help_image_item.set_lefttop(back_left, back_top);
    py.m(this.help_current_layer, "add", background_help_image_item);
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
    let character_progress, cols, department, location, minigame_level, photo_number, rows: any;
    photo_number = this.picture.number;
    location = this.picture.location;
    department = this.picture.department;
    character_progress = this.stage.game.datastore.user_character_progress;
    minigame_level = character_progress.range.minigame_level;
    if ((minigame_level === 1)) {
      rows = 3;
      cols = 3;
      this.maximum_time = 15;
      this.maximum_time_score = 150;
    } else if ((minigame_level === 2)) {
      rows = 3;
      cols = 3;
      this.maximum_time = 30;
      this.maximum_time_score = 200;
    } else {
      rows = 3;
      cols = 3;
      this.maximum_time = 150;
      this.maximum_time_score = 120;
    }
    this.set_up_game_background_items();
    this.set_up_puzzle(photo_number, rows, cols, minigame_level);
    this.set_up_frame(location, department);
    this.set_up_buttons();
    this.set_up_photo(photo_number);
    this.set_up_witness();
    return null;
  }
  close_click(item: any, args: any): any {
    if (!py.truthy(this.escape_key_event())) {
      this.stop_minigame(false);
      this.phase1content.minigame_solved(false);
      this.close_minigame();
    }
    return null;
  }
  set_up_buttons(): any {
    let close_image, close_item, help_image, help_item, rollover_image: any;
    close_image = assets.load_image("p1_minigames_btn_close_normal.png");
    rollover_image = assets.load_image("p1_minigames_btn_close_active.png");
    close_item = new ItemImage(258, 43, close_image);
    close_item.set_rollover_image(rollover_image, this.rollover_sound);
    close_item.add_event_handler(ItemEvent.CLICK, py.bind(this, "close_click"));
    py.m(this.layer, "add", close_item);
    help_image = assets.load_image("p1_minigames_btn_help_normal.png");
    rollover_image = assets.load_image("p1_minigames_btn_help_active.png");
    help_item = new ItemImage(293, 44, help_image);
    help_item.set_rollover_image(rollover_image, this.rollover_sound);
    help_item.add_event_handler(ItemEvent.CLICK, py.bind(this, "help_click"));
    py.m(this.layer, "add", help_item);
    return null;
  }
  set_up_game_background_items(): any {
    let background_image, background_item: any;
    background_image = assets.load_image("p1_minigame_bricklayer_background.png");
    background_item = new ItemImage(89, 62, background_image);
    py.m(this.layer, "add", background_item);
    return null;
  }
  set_up_frame(location: any, department: any): any {
    let department_text, font_10_bld, frame_image, frame_item, location_text: any;
    frame_image = assets.load_image("p1_minigame_bricklayer_frame.png");
    frame_item = new ItemImage(89, 62, frame_image);
    py.m(this.layer, "add", frame_item);
    location_text = new ItemText(180, 360, this.font_13_bld, 0, location, [75, 47, 7], null, 229, 20, 2);
    py.m(this.layer, "add", location_text);
    font_10_bld = assets.load_font("evilgeniusbb_bld.ttf", 10);
    department_text = new ItemText(180, 376, font_10_bld, 0, py.add(py.add("- ", department), " -"), [100, 66, 12], null, 229, 16, 2);
    py.m(this.layer, "add", department_text);
    return null;
  }
  set_up_photo(photo_number: any): any {
    let photo_image, photo_item: any;
    photo_image = assets.load_image(py.add(py.add("p1_minigame_bricklayer_photo_00", py.str(photo_number)), ".png"));
    photo_item = new ItemImage(0, 157, photo_image);
    py.m(this.layer, "add", photo_item);
    return null;
  }
  set_up_puzzle(photo_number: any, rows: any, cols: any, minigame_level: any): any {
    let i, j, piece: any;
    this.puzzle_image = assets.load_image(py.add(py.add("p1_minigame_bricklayer_postal_00", py.str(photo_number)), ".jpg"));
    this.tile_image = null;
    this.tile_image = assets.load_image(py.add(py.add(py.add(py.add("p1_minigame_bricklayer_tile", py.str(rows)), "x"), py.str(cols)), ".png"));
    this.rows = rows;
    this.cols = cols;
    this.minigame_level = minigame_level;
    for (piece of py.iter(this.puzzle_pieces)) {
      py.m(this.layer, "remove", piece);
    }
    this.grid = (() => { const $r: any[] = []; let j; for (j of py.iter(py.rangeList(this.rows))) { $r.push((() => { const $r: any[] = []; let i; for (i of py.iter(py.rangeList(this.cols))) { $r.push(null); } return $r; })()); } return $r; })();
    this.piece_width = py.div(this.puzzle_image.get_width(), this.cols);
    this.piece_height = py.div(this.puzzle_image.get_height(), this.rows);
    for (i of py.range(this.rows)) {
      for (j of py.range(this.cols)) {
        if ((!py.eq(i, (this.rows - 1)) || !py.eq(j, (this.cols - 1)))) {
          piece = new ItemImage(0, 0, this.create_piece_image(i, j));
          piece.add_event_handler(ItemEvent.CLICK, py.bind(this, "piece_click"));
          piece.row = i;
          piece.col = j;
          py.m(this.puzzle_pieces, "append", piece);
          py.m(this.layer, "add", piece);
        }
      }
    }
    this.shuffle();
    for (i of py.range(this.rows)) {
      for (j of py.range(this.cols)) {
        this.set_piece_pos(i, j);
      }
    }
    return null;
  }
  shuffle(): any {
    let cols, from_col, from_row, index, list, max_parity, method, min_parity, movements, n, new_col, new_row, parity, piece, piece_pos, rows: any;
    rows = this.rows;
    cols = this.cols;
    n = (py.mul(cols, rows) - 1);
    if ((this.minigame_level === 1)) {
      method = 1;
      movements = 6;
      from_row = 1;
      from_col = 0;
      min_parity = 6;
      max_parity = 10;
    } else if ((this.minigame_level === 2)) {
      method = 1;
      from_row = 0;
      from_col = 0;
      movements = 8;
      min_parity = 6;
      max_parity = 12;
    } else {
      method = 2;
      min_parity = 10;
      max_parity = 999;
      from_row = 0;
      from_col = 0;
    }
    while (true) {
      if ((method === 1)) {
        list = this.perform_random_movements(rows, cols, movements, from_row, from_col);
      } else {
        list = this.generate_random_positions(n);
      }
      parity = this.calculate_parity(list, n);
      if (((py.mod(parity, 2) === 0) && (parity >= min_parity) && (parity <= max_parity))) {
        break;
      }
    }
    for (piece of py.iter(this.puzzle_pieces)) {
      piece_pos = py.add(py.mul(piece.row, cols), piece.col);
      index = py.m(list, "index", piece_pos);
      new_row = py.div(index, cols);
      new_col = py.mod(index, cols);
      py.setitem(py.getitem(this.grid, new_row), new_col, piece);
    }
    this.from_row = from_row;
    this.from_col = from_col;
    return null;
  }
  perform_random_movements(rows: any, cols: any, movements: any, from_row: any, from_col: any): any {
    let col, direction, i, list, matrix, new_col, new_row, previous_oposite_direction, row, temp, valid_direction: any;
    matrix = (() => { const $r: any[] = []; let i; for (i of py.iter(py.xrange(rows))) { $r.push(py.rangeList(py.mul(i, cols), py.mul(py.add(i, 1), cols))); } return $r; })();
    col = (cols - 1);
    row = (rows - 1);
    previous_oposite_direction = 1;
    for (i of py.range(movements)) {
      valid_direction = false;
      while (!py.truthy(valid_direction)) {
        direction = random.randint(0, 3);
        if (py.eq(direction, previous_oposite_direction)) {
          direction = py.mod(py.add(direction, 1), 4);
        }
        if ((direction === 0)) {
          if ((row > from_row)) {
            new_col = col;
            new_row = (row - 1);
            valid_direction = true;
            previous_oposite_direction = 1;
          }
        } else if ((direction === 1)) {
          if ((py.add(row, 1) < rows)) {
            new_col = col;
            new_row = py.add(row, 1);
            valid_direction = true;
            previous_oposite_direction = 0;
          }
        } else if ((direction === 2)) {
          if ((col > from_col)) {
            new_col = (col - 1);
            new_row = row;
            valid_direction = true;
            previous_oposite_direction = 3;
          }
        } else if ((py.add(col, 1) < cols)) {
          new_col = py.add(col, 1);
          new_row = row;
          valid_direction = true;
          previous_oposite_direction = 2;
        }
      }
      temp = py.getitem(py.getitem(matrix, row), col);
      py.setitem(py.getitem(matrix, row), col, py.getitem(py.getitem(matrix, new_row), new_col));
      py.setitem(py.getitem(matrix, new_row), new_col, temp);
      row = new_row;
      col = new_col;
    }
    list = [];
    for (row of py.range(rows)) {
      for (col of py.range(cols)) {
        py.m(list, "append", py.getitem(py.getitem(matrix, row), col));
      }
    }
    return list;
  }
  generate_random_positions(n: any): any {
    let i, list, numbers: any;
    list = [];
    numbers = py.rangeList(0, n);
    for (i of py.range(n)) {
      i = random.choice(numbers);
      py.m(numbers, "remove", i);
      py.m(list, "append", i);
    }
    return list;
  }
  calculate_parity(list: any, n: any): any {
    let i, j, parity, parity_list: any;
    parity = 0;
    parity_list = py.slice(list, null, null);
    for (i of py.range(n)) {
      for (j of py.range(0, py.len(parity_list))) {
        if (py.eq(py.getitem(parity_list, j), i)) {
          py.delitem(parity_list, j);
          break;
        } else {
          parity = parity + 1;
        }
      }
    }
    return parity;
  }
  set_piece_pos(row: any, col: any, animated: any = false): any {
    let new_left, new_top, piece: any;
    piece = py.getitem(py.getitem(this.grid, row), col);
    if ((piece != null)) {
      piece.current_row = row;
      piece.current_col = col;
      new_left = py.add(114, py.mul(col, piece.get_width()));
      new_top = py.add(87, py.mul(row, piece.get_height()));
      if (py.truthy(animated)) {
        animations.start_move(piece, new_left, new_top, this.move_duration);
        animations.wait_locked(this.stage, this.move_duration, null);
      } else {
        piece.set_left(new_left);
        piece.set_top(new_top);
      }
    }
    return null;
  }
  piece_click(item: any, args: any): any {
    let c, col, empty_col, empty_row, moved, r, row: any;
    if (!py.truthy(py.bind(this, "minigame_solved"))) {
      row = item.current_row;
      col = item.current_col;
      if (((row < this.from_row) || (col < this.from_col))) {
        moved = false;
      } else {
        empty_row = (-1);
        empty_col = (-1);
        for (r of py.range(this.rows)) {
          for (c of py.range(this.cols)) {
            if ((py.getitem(py.getitem(this.grid, r), c) == null)) {
              empty_row = r;
              empty_col = c;
              break;
            }
          }
          if (!py.eq(empty_row, (-1))) {
            break;
          }
        }
        moved = false;
        if (py.eq(row, empty_row)) {
          if ((col < empty_col)) {
            c = (empty_col - 1);
            while ((c >= col)) {
              this.move_to(py.getitem(py.getitem(this.grid, row), c), row, py.add(c, 1));
              moved = true;
              c = c - 1;
            }
          } else if ((col > empty_col)) {
            c = py.add(empty_col, 1);
            while ((c <= col)) {
              this.move_to(py.getitem(py.getitem(this.grid, row), c), row, (c - 1));
              moved = true;
              c = c + 1;
            }
          }
        } else if (py.eq(col, empty_col)) {
          if ((row < empty_row)) {
            r = (empty_row - 1);
            while ((r >= row)) {
              this.move_to(py.getitem(py.getitem(this.grid, r), col), py.add(r, 1), col);
              moved = true;
              r = r - 1;
            }
          } else if ((row > empty_row)) {
            r = py.add(empty_row, 1);
            while ((r <= row)) {
              this.move_to(py.getitem(py.getitem(this.grid, r), col), (r - 1), col);
              moved = true;
              r = r + 1;
            }
          }
        }
      }
      this.stage.render();
      if (py.truthy(moved)) {
        this.drag_sound.play();
      } else {
        this.stage.click_sound.play();
      }
    }
    return null;
  }
  move_to(piece: any, to_row: any, to_col: any): any {
    let from_col, from_row: any;
    if (((to_row >= 0) && (to_row < this.rows) && (to_col >= 0) && (to_col < this.cols))) {
      if ((py.getitem(py.getitem(this.grid, to_row), to_col) == null)) {
        from_row = piece.current_row;
        from_col = piece.current_col;
        py.setitem(py.getitem(this.grid, from_row), from_col, null);
        py.setitem(py.getitem(this.grid, to_row), to_col, piece);
        this.set_piece_pos(to_row, to_col, true);
        this.check_minigame_solved();
        return true;
      }
    }
    return false;
  }
  check_minigame_solved(): any {
    let col, piece, row, solved: any;
    solved = true;
    for (row of py.range(this.rows)) {
      for (col of py.range(this.cols)) {
        piece = py.getitem(py.getitem(this.grid, row), col);
        if ((piece != null)) {
          if ((!py.eq(piece.current_row, piece.row) || !py.eq(piece.current_col, piece.col))) {
            solved = false;
            break;
          }
        }
        if (!py.truthy(solved)) {
          break;
        }
      }
    }
    if (py.truthy(solved)) {
      this.minigame_solved = true;
      this.stop_minigame(true);
      this.stage.render();
      this.right_sound.play();
      animations.wait_locked(this.stage, 500, py.bind(this, "show_missing_piece"));
    }
    return null;
  }
  show_missing_piece(): any {
    let piece: any;
    this.showing_missing_piece = true;
    piece = new ItemImage(0, 0, this.create_piece_image((this.rows - 1), (this.cols - 1)));
    piece.row = (this.rows - 1);
    piece.col = (this.cols - 1);
    py.m(this.layer, "add", piece);
    py.setitem(py.getitem(this.grid, piece.row), piece.col, piece);
    this.set_piece_pos(piece.row, piece.col);
    animations.fade_in_item(piece, 500);
    animations.wait_locked(this.stage, 1500, py.bind(this, "show_missing_piece_callback"));
    this.stage.render();
    this.fade_sound.play();
    return null;
  }
  escape_key_event(): any {
    if (py.truthy(this.showing_missing_piece)) {
      this.continue_sound.play();
      this.minigame_solved_callback();
      return true;
    }
    return null;
  }
  show_missing_piece_callback(): any {
    let button, button_normal_image, button_rollover_image: any;
    button_normal_image = assets.load_image("p0_endings_btn_continue_normal.png");
    button_rollover_image = assets.load_image("p0_endings_btn_continue_rollover.png");
    button = new ItemImage(216, 404, button_normal_image);
    button.set_rollover_image(button_rollover_image, this.rollover_sound);
    button.add_event_handler(ItemEvent.CLICK, py.bind(this, "continue_click"));
    py.m(this.layer, "add", button);
    return null;
  }
  continue_click(item: any, args: any): any {
    this.showing_missing_piece = false;
    this.minigame_solved_callback();
    this.continue_sound.play();
    return null;
  }
  create_piece_image(row: any, col: any): any {
    let surf: any;
    surf = new pygame.Surface([this.piece_width, this.piece_height], pygame.SRCALPHA, 32);
    surf.blit(this.puzzle_image.surface, [0, 0], new Rect(py.mul(col, this.piece_width), py.mul(row, this.piece_height), this.piece_width, this.piece_height));
    if ((this.tile_image != null)) {
      surf.blit(this.tile_image.surface, [0, 0]);
    }
    return new assets.Image(surf);
  }
  calculate_solved_score(): any {
    let elapsed_time, time_score: any;
    if ((this.pause_start_time != null)) {
      this.pause_total_time = py.add(this.pause_total_time, (pygame.time.get_ticks() - this.pause_start_time));
      this.pause_start_time = null;
    }
    elapsed_time = py.div(((pygame.time.get_ticks() - this.start_time) - this.pause_total_time), 1000);
    if ((elapsed_time <= this.maximum_time)) {
      time_score = py.div(py.mul(this.maximum_time_score, (this.maximum_time - elapsed_time)), this.maximum_time);
    } else {
      time_score = 0;
    }
    return [100, time_score];
  }
  select_picture(): any {
    let number, picture, pictures, pictures_seen, selected_picture: any;
    pictures_seen = this.stage.game.datastore.user_character_progress.bricklayer_pictures_seen;
    selected_picture = null;
    random.seed();
    while ((selected_picture == null)) {
      pictures = [new Picture("Piedra Pintada", "Artigas", 1), new Picture("Cerro Batov\xed", "Tacuaremb\xf3", 2), new Picture("Faro de Cabo Polonio", "Rocha", 3), new Picture("Monumento al Ahogado", "Maldonado", 4), new Picture("Real de San Carlos", "Colonia", 5)];
      for (number of py.iter(pictures_seen)) {
        for (picture of py.iter(pictures)) {
          if (py.eq(picture.number, number)) {
            py.m(pictures, "remove", picture);
            break;
          }
        }
      }
      if ((py.len(pictures) === 0)) {
        py.delitem(pictures_seen, py.sl(0, py.div(py.len(pictures_seen), 2)));
      } else {
        selected_picture = random.choice(pictures);
        py.m(pictures_seen, "append", selected_picture.number);
      }
    }
    return selected_picture;
  }
  create_character_happy_item(): any {
    let bricklayer_happy_image: any;
    bricklayer_happy_image = assets.load_image("p1_minigame_bricklayer_happy.png");
    return new ItemImage(433, 66, bricklayer_happy_image, null);
  }
}
export class Picture {
  constructor(location: any, department: any, number: any) {
    this.location = location;
    this.department = department;
    this.number = number;
    return;
  }
}
py.register("game/stages/minigamebricklayer", $self);
