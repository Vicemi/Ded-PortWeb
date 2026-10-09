// @ts-nocheck
// Generated from the original game code (see MODLOG.md). Do not edit by hand.
import * as py from '../../runtime/py';
// unresolved from-import types DictType
// unresolved from-import types FloatType
// unresolved from-import types FunctionType
// unresolved from-import types IntType
// unresolved from-import types ListType
// unresolved from-import types LongType
// unresolved from-import types StringType
// unresolved from-import types TupleType
import * as assets from '../../engine/assets';
import * as datamodel from './datamodel';
import * as external from '../../runtime/external';
import { os } from '../../runtime/py';
const phase1: any = py.lazy("game/stages/phase1");
import { random } from '../../runtime/py';
import * as stats from '../../runtime/stats';
import { sys } from '../../runtime/py';
import { time } from '../../runtime/py';
import { uuid } from '../../runtime/py';
import * as $self from './serialization';

export function save_character(datastore: any, c: any, cp: any, game: any, stage: any, check_save_in_development: any): any {
  let bricklayer_pictures, captured_thieves, character_data, clue_found, clues, clues_found, d, department, department_solved, departments, file_name, folder_witnesses, found, i, identikit, item, j, k, lair_set, location, medal, medals, n, new_notes, notes, picture, posible_departments, s, stage_clue, statements, t, target_cities, tc, thief, thief_index, thieves, visited_witnesses, w, wit_dep, wit_dep_index, witnesses: any;
  character_data = [];
  if ((stage != null)) {
    py.m(character_data, "append", ["stage", stage]);
  }
  py.m(character_data, "append", ["info", py.str(py.m(datastore.list_departments, "index", c.department))]);
  py.m(character_data, "append", ["uuid", py.str(c.uuid)]);
  py.m(character_data, "append", ["casenum", py.str(cp.case.number)]);
  py.m(character_data, "append", ["lair", py.str(py.m(datastore.list_departments, "index", cp.case.last_department_lair))]);
  py.m(character_data, "append", ["lastvisited", py.str(py.m(datastore.list_departments, "index", cp.case.last_department_visited))]);
  py.m(character_data, "append", ["crimeloc", py.str(py.m(datastore.list_crime_locations, "index", cp.case.crime_location))]);
  py.m(character_data, "append", ["stolenobj", py.str(py.m(datastore.list_stolen_objects, "index", cp.case.stolen_object))]);
  py.m(character_data, "append", ["timelimit", py.str(cp.case.time_limit)]);
  py.m(character_data, "append", ["timespend", py.str(cp.case.time_spend)]);
  clues_found = ["cluesfound"];
  for (clue_found of py.iter(cp.case.clues_found)) {
    py.m(clues_found, "append", clue_found);
  }
  py.m(character_data, "append", clues_found);
  if (py.truthy(cp.case.wrong_witness_visited)) {
    py.m(character_data, "append", ["wrongwitness", "1"]);
  } else {
    py.m(character_data, "append", ["wrongwitness", "0"]);
  }
  py.m(character_data, "append", ["thief", py.str(py.m(datastore.list_thieves, "index", cp.case.thief))]);
  if ((cp.case.arrest_order_thief != null)) {
    thief_index = py.m(datastore.list_thieves, "index", cp.case.arrest_order_thief);
    py.m(character_data, "append", ["arrestorder", py.str(thief_index)]);
  } else {
    py.m(character_data, "append", ["arrestorder", "-1"]);
  }
  if ((cp.case.caught_thief == null)) {
    py.m(character_data, "append", ["caughtthief", "-1"]);
  } else {
    py.m(character_data, "append", ["caughtthief", py.str(cp.case.caught_thief)]);
  }
  if (py.truthy(cp.case.clues_identified)) {
    py.m(character_data, "append", ["cluesidentified", "1"]);
  } else {
    py.m(character_data, "append", ["cluesidentified", "0"]);
  }
  thieves = ["thieves"];
  for (thief of py.iter(cp.case.list_thieves)) {
    py.m(thieves, "append", py.str(py.m(datastore.list_thieves, "index", thief)));
  }
  py.m(character_data, "append", thieves);
  departments = ["departments"];
  for (department of py.iter(cp.case.list_departments)) {
    py.m(departments, "append", py.str(py.m(datastore.list_departments, "index", department)));
  }
  py.m(character_data, "append", departments);
  target_cities = ["targetcities"];
  for (tc of py.iter(cp.case.list_target_cities)) {
    py.m(target_cities, "append", py.str(tc));
  }
  py.m(character_data, "append", target_cities);
  witnesses = ["witnesses"];
  wit_dep = null;
  wit_dep_index = 0;
  for (w of py.iter(cp.case.list_witnesses)) {
    for (i of py.range(py.len(datastore.list_witnesses))) {
      if (py.eq(py.getitem(datastore.list_witnesses, i).name, w.name)) {
        if (((wit_dep == null) || !py.contains(py.getitem(cp.case.list_departments, wit_dep_index).city_pins, w.city))) {
          wit_dep_index = 0;
          for (j of py.range(py.len(cp.case.list_departments))) {
            d = py.getitem(cp.case.list_departments, j);
            if (py.contains(d.city_pins, w.city)) {
              wit_dep = d;
              wit_dep_index = j;
            }
          }
        }
        py.m(witnesses, "append", py.str(i));
        py.m(witnesses, "append", py.str(wit_dep_index));
        py.m(witnesses, "append", py.str(py.m(wit_dep.city_pins, "index", w.city)));
        if (py.contains(datastore.list_statements, w.witness_statement)) {
          py.m(witnesses, "append", py.str(py.m(datastore.list_statements, "index", w.witness_statement)));
        } else {
          found = false;
          for (k of py.range(py.len(cp.case.list_witness_statements))) {
            s = py.getitem(cp.case.list_witness_statements, k);
            if (py.truthy(s.are_equal(w.witness_statement))) {
              py.m(witnesses, "append", py.str(((-k) - 1)));
              found = true;
              break;
            }
          }
          if (!py.truthy(found)) {
            throw new py.Exception(py.add(py.add("Statement not defined (", py.str(w.witness_statement)), ")"));
          }
        }
      }
    }
  }
  py.m(character_data, "append", witnesses);
  statements = ["statements"];
  for (s of py.iter(cp.case.list_witness_statements)) {
    if (py.truthy(s.location_statement)) {
      location = "1";
    } else {
      location = "-1";
    }
    if (py.truthy(s.identikit_statement)) {
      identikit = py.str(py.m(datastore.list_identikit_statements, "index", s.identikit_statement));
    } else {
      identikit = "-2";
    }
    py.m(statements, "append", py.str(py.m(datastore.list_statements, "index", s.intro_statement)));
    py.m(statements, "append", py.str(py.m(datastore.list_janitor_statements, "index", s.janitor_statement)));
    py.m(statements, "append", location);
    py.m(statements, "append", identikit);
  }
  py.m(character_data, "append", statements);
  visited_witnesses = ["visitedwit"];
  for (w of py.iter(cp.case.list_visited_witnesses)) {
    py.m(visited_witnesses, "append", py.str(py.m(cp.case.list_witnesses, "index", w)));
  }
  py.m(character_data, "append", visited_witnesses);
  folder_witnesses = ["folderwit"];
  for (w of py.iter(cp.case.list_folder_witnesses)) {
    py.m(folder_witnesses, "append", py.str(py.m(cp.case.list_witnesses, "index", w)));
  }
  py.m(character_data, "append", folder_witnesses);
  posible_departments = ["posdepts"];
  for (d of py.iter(cp.case.list_posible_departments)) {
    py.m(posible_departments, "append", py.str(py.m(datastore.list_departments, "index", d)));
  }
  py.m(character_data, "append", posible_departments);
  lair_set = ["thieflair", py.str(py.getitem(py.getitem(cp.case.thief_lair_set, 0), 0)), py.str(py.getitem(py.getitem(cp.case.thief_lair_set, 0), 1))];
  if ((py.getitem(cp.case.thief_lair_set, 1) != null)) {
    for (item of py.iter(py.getitem(cp.case.thief_lair_set, 1))) {
      py.m(lair_set, "append", py.getitem(item, 0));
      py.m(lair_set, "append", py.str(py.getitem(item, 1)));
      py.m(lair_set, "append", py.str(py.getitem(item, 2)));
    }
  }
  py.m(character_data, "append", lair_set);
  clues = ["clues"];
  for (stage_clue of py.iter(cp.case.list_stage_clues)) {
    py.m(clues, "append", py.str(py.m(datastore.list_clues, "index", stage_clue.clue)));
    save_note(clues, stage_clue.note_item, datastore);
  }
  py.m(character_data, "append", clues);
  py.m(character_data, "append", ["selectedfeatures", py.str(py.getitem(cp.case.list_selected_features, 0)), py.str(py.getitem(cp.case.list_selected_features, 1)), py.str(py.getitem(cp.case.list_selected_features, 2)), py.str(py.getitem(cp.case.list_selected_features, 3))]);
  department_solved = ["depsolved"];
  for (d of py.iter(cp.list_departments_solved)) {
    py.m(department_solved, "append", py.str(py.m(datastore.list_departments, "index", d)));
  }
  py.m(character_data, "append", department_solved);
  if (py.truthy(cp.minigame_gardener_help_seen)) {
    py.m(character_data, "append", ["mggardenerhelp", "1"]);
  } else {
    py.m(character_data, "append", ["mggardenerhelp", "0"]);
  }
  if (py.truthy(cp.minigame_shoptender_help_seen)) {
    py.m(character_data, "append", ["mgshoptenderhelp", "1"]);
  } else {
    py.m(character_data, "append", ["mgshoptenderhelp", "0"]);
  }
  if (py.truthy(cp.minigame_librarian_help_seen)) {
    py.m(character_data, "append", ["mglibrarianhelp", "1"]);
  } else {
    py.m(character_data, "append", ["mglibrarianhelp", "0"]);
  }
  if (py.truthy(cp.minigame_bricklayer_help_seen)) {
    py.m(character_data, "append", ["mgbricklayerhelp", "1"]);
  } else {
    py.m(character_data, "append", ["mgbricklayerhelp", "0"]);
  }
  if (py.truthy(cp.phase2_help)) {
    py.m(character_data, "append", ["phase2help", "1"]);
  } else {
    py.m(character_data, "append", ["phase2help", "0"]);
  }
  if (py.truthy(cp.phase3_help)) {
    py.m(character_data, "append", ["phase3help", "1"]);
  } else {
    py.m(character_data, "append", ["phase3help", "0"]);
  }
  if (py.truthy(cp.identikit_help)) {
    py.m(character_data, "append", ["identikithelp", "1"]);
  } else {
    py.m(character_data, "append", ["identikithelp", "0"]);
  }
  if (py.truthy(cp.show_folder)) {
    py.m(character_data, "append", ["showfolder", "1"]);
  } else {
    py.m(character_data, "append", ["showfolder", "0"]);
  }
  if (py.truthy(cp.show_notes_animation)) {
    py.m(character_data, "append", ["shownotesanimation", "1"]);
  } else {
    py.m(character_data, "append", ["shownotesanimation", "0"]);
  }
  py.m(character_data, "append", ["score", py.str(cp.score)]);
  py.m(character_data, "append", ["resolvedcases", py.str(cp.resolved_cases)]);
  medals = ["medals"];
  for (medal of py.iter(cp.medals)) {
    py.m(medals, "append", medal.name);
    py.m(medals, "append", py.str(medal.count));
  }
  py.m(character_data, "append", medals);
  notes = ["notes"];
  for (n of py.iter(cp.notes)) {
    save_note(notes, n, datastore);
  }
  py.m(character_data, "append", notes);
  new_notes = ["newnotes"];
  for (n of py.iter(cp.new_notes)) {
    save_note(new_notes, n, datastore);
  }
  py.m(character_data, "append", new_notes);
  bricklayer_pictures = ["bricklayerpics"];
  for (picture of py.iter(cp.bricklayer_pictures_seen)) {
    py.m(bricklayer_pictures, "append", py.str(picture));
  }
  py.m(character_data, "append", bricklayer_pictures);
  py.m(character_data, "append", ["lasthelpstep", py.str(cp.last_help_step_seen)]);
  captured_thieves = ["capturedthieves"];
  for (t of py.iter(cp.captured_thieves)) {
    py.m(captured_thieves, "append", py.str(py.m(datastore.list_thieves, "index", t)));
  }
  py.m(character_data, "append", captured_thieves);
  file_name = py.add(py.add("c", py.str(c.charinfo.id)), ".dat");
  assets.save_data(file_name, character_data);
  return null;
}
export function open_character(datastore: any, charinfo: any): any {
  let arrest_order_thief, bricklayer_help_seen, bricklayer_pictures_seen, c_dep, c_id, c_uuid, captured_thieves, case_, case_number, category, caught_thief, char, char_progress, character_data, city, clue, clues_found, clues_identified, crime_loc, ct, d, dep_index, department, file_name, gardener_help_seen, generate_new_case, identikit_help, identikit_statement, index, intro_statement, item_type, janitor_statement, k, last_dep_lair, last_dep_visited, last_help_step_seen, layout, librarian_help_seen, line, list_clues, list_dep, list_dep_solved, list_folder_witnesses, list_posible_deps, list_sel_feat, list_target_cities, list_thieves, list_visited_witnesses, list_wit_statements, list_witnesses, location_statement, medal, medals, new_notes, note_item, notes, pending_witness_statements, phase2_help, phase3_help, place_holder, resolved_cases, score, set_elements, shoptender_help_seen, show_folder, show_notes_animation, size, stage, statement_index, stolen_obj, t, tc, thief, thief_index, thief_lair_set, time_limit, time_spend, type, value, w, w_s, wit_ori, witness, wrong_witness_visited: any;
  file_name = get_character_file_name(charinfo.id);
  character_data = assets.load_data(file_name, ";", false, undefined, true);
  if (((character_data == null) || py.eq(character_data, []))) {
    return create_new_character(datastore, charinfo);
  } else {
    c_id = charinfo.id;
    c_uuid = null;
    stage = null;
    score = 0;
    resolved_cases = 0;
    medals = [];
    bricklayer_pictures_seen = [];
    list_dep = [];
    list_dep_solved = [];
    list_target_cities = [];
    list_thieves = [];
    list_sel_feat = [];
    list_posible_deps = [];
    list_wit_statements = [];
    list_witnesses = [];
    list_visited_witnesses = [];
    list_folder_witnesses = [];
    last_dep_lair = py.getitem(datastore.list_departments, 0);
    last_dep_visited = py.getitem(datastore.list_departments, 0);
    crime_loc = py.getitem(datastore.list_crime_locations, 0);
    stolen_obj = py.getitem(datastore.list_stolen_objects, 0);
    time_spend = 0;
    time_limit = 0;
    clues_found = 0;
    list_clues = [];
    thief_lair_set = 1;
    case_number = 0;
    gardener_help_seen = false;
    bricklayer_help_seen = false;
    shoptender_help_seen = null;
    last_help_step_seen = 0;
    phase2_help = false;
    phase3_help = false;
    identikit_help = false;
    show_folder = false;
    show_notes_animation = false;
    caught_thief = null;
    clues_identified = false;
    wrong_witness_visited = false;
    thief = null;
    arrest_order_thief = null;
    notes = [];
    new_notes = [];
    captured_thieves = [];
    pending_witness_statements = [];
    generate_new_case = false;
    for (line of py.iter(character_data)) {
      type = py.getitem(line, 0);
      if ((type === "stage")) {
        stage = py.getitem(line, 1);
      } else if ((type === "info")) {
        c_dep = py.getitem(datastore.list_departments, py.int(py.getitem(line, 1)));
      } else if ((type === "uuid")) {
        c_uuid = new uuid.UUID(py.getitem(line, 1));
      } else if ((type === "casenum")) {
        case_number = py.getitem(line, 1);
      } else if ((type === "lair")) {
        last_dep_lair = py.getitem(datastore.list_departments, py.int(py.getitem(line, 1)));
      } else if ((type === "lastvisited")) {
        last_dep_visited = py.getitem(datastore.list_departments, py.int(py.getitem(line, 1)));
      } else if ((type === "crimeloc")) {
        crime_loc = py.getitem(datastore.list_crime_locations, py.int(py.getitem(line, 1)));
      } else if ((type === "stolenobj")) {
        stolen_obj = py.getitem(datastore.list_stolen_objects, py.int(py.getitem(line, 1)));
      } else if ((type === "timelimit")) {
        time_limit = py.int(py.getitem(line, 1));
      } else if ((type === "timespend")) {
        time_spend = py.int(py.getitem(line, 1));
      } else if ((type === "cluesfound")) {
        clues_found = [];
        k = 1;
        while ((k < py.len(line))) {
          py.m(clues_found, "append", py.getitem(line, k));
          k = k + 1;
        }
      } else if ((type === "wrongwitness")) {
        if ((py.int(py.getitem(line, 1)) === 1)) {
          wrong_witness_visited = true;
        } else {
          wrong_witness_visited = false;
        }
      } else if ((type === "thief")) {
        thief = py.getitem(datastore.list_thieves, py.int(py.getitem(line, 1)));
      } else if ((type === "arrestorder")) {
        thief_index = py.int(py.getitem(line, 1));
        if (py.eq(thief_index, (-1))) {
          arrest_order_thief = null;
        } else {
          arrest_order_thief = py.getitem(datastore.list_thieves, thief_index);
        }
      } else if ((type === "thieves")) {
        for (t of py.iter(py.slice(line, 1, null))) {
          py.m(list_thieves, "append", py.getitem(datastore.list_thieves, py.int(t)));
        }
      } else if ((type === "departments")) {
        for (department of py.iter(py.slice(line, 1, null))) {
          py.m(list_dep, "append", py.getitem(datastore.list_departments, py.int(department)));
        }
      } else if ((type === "targetcities")) {
        for (tc of py.iter(py.slice(line, 1, null))) {
          py.m(list_target_cities, "append", py.int(tc));
        }
      } else if ((type === "witnesses")) {
        k = 1;
        while ((k < py.len(line))) {
          wit_ori = py.getitem(datastore.list_witnesses, py.int(py.getitem(line, k)));
          witness = new datamodel.Witness(wit_ori.name, wit_ori.image);
          witness.department = py.getitem(list_dep, 0);
          dep_index = py.int(py.getitem(line, py.add(k, 1)));
          witness.city = py.getitem(py.getitem(list_dep, dep_index).city_pins, py.int(py.getitem(line, py.add(k, 2))));
          statement_index = py.int(py.getitem(line, py.add(k, 3)));
          py.m(pending_witness_statements, "append", [witness, statement_index]);
          py.m(list_witnesses, "append", witness);
          k = k + 4;
        }
      } else if ((type === "statements")) {
        k = 1;
        while ((k < py.len(line))) {
          intro_statement = py.getitem(datastore.list_statements, py.int(py.getitem(line, k)));
          janitor_statement = py.getitem(datastore.list_janitor_statements, py.int(py.getitem(line, py.add(k, 1))));
          if (!py.eq(py.int(py.getitem(line, py.add(k, 2))), (-1))) {
            city = py.getitem(py.getitem(list_dep, 0).city_pins, py.getitem(list_target_cities, 0));
            location_statement = new datamodel.Statement(phase1.generate_thief_location_statement(city));
          } else {
            location_statement = null;
          }
          if (!py.eq(py.int(py.getitem(line, py.add(k, 3))), (-2))) {
            identikit_statement = py.getitem(datastore.list_identikit_statements, py.int(py.getitem(line, py.add(k, 3))));
          } else {
            identikit_statement = null;
          }
          w_s = new datamodel.WitnessStatement(intro_statement, janitor_statement, identikit_statement, location_statement);
          py.m(list_wit_statements, "append", w_s);
          k = k + 4;
        }
      } else if ((type === "visitedwit")) {
        for (w of py.iter(py.slice(line, 1, null))) {
          index = py.int(w);
          py.m(list_visited_witnesses, "append", py.getitem(list_witnesses, index));
        }
      } else if ((type === "folderwit")) {
        for (w of py.iter(py.slice(line, 1, null))) {
          index = py.int(w);
          py.m(list_folder_witnesses, "append", py.getitem(list_witnesses, index));
        }
      } else if ((type === "posdepts")) {
        for (d of py.iter(py.slice(line, 1, null))) {
          py.m(list_posible_deps, "append", py.getitem(datastore.list_departments, py.int(d)));
        }
      } else if ((type === "thieflair")) {
        set_elements = [py.int(py.getitem(line, 1)), py.int(py.getitem(line, 2))];
        if ((py.len(line) <= 3)) {
          layout = null;
        } else {
          layout = [];
          k = 3;
          while ((k < py.len(line))) {
            item_type = py.getitem(line, k);
            place_holder = py.int(py.getitem(line, py.add(k, 1)));
            category = py.int(py.getitem(line, py.add(k, 2)));
            py.m(layout, "append", [item_type, place_holder, category]);
            k = k + 3;
          }
        }
        thief_lair_set = [set_elements, layout];
      } else if ((type === "clues")) {
        k = 1;
        while ((k < py.len(line))) {
          clue = py.getitem(datastore.list_clues, py.int(py.getitem(line, k)));
          k = k + 1;
          [note_item, size] = read_note(line, k, datastore);
          k = py.add(k, size);
          if (py.truthy(note_item)) {
            py.m(list_clues, "append", new datamodel.StageClue(clue, note_item));
          } else {
            generate_new_case = true;
          }
        }
      } else if ((type === "selectedfeatures")) {
        py.m(list_sel_feat, "append", py.int(py.getitem(line, 1)));
        py.m(list_sel_feat, "append", py.int(py.getitem(line, 2)));
        py.m(list_sel_feat, "append", py.int(py.getitem(line, 3)));
        py.m(list_sel_feat, "append", py.int(py.getitem(line, 4)));
      } else if ((type === "depsolved")) {
        for (d of py.iter(py.slice(line, 1, null))) {
          py.m(list_dep_solved, "append", py.getitem(datastore.list_departments, py.int(d)));
        }
      } else if ((type === "mggardenerhelp")) {
        if ((py.getitem(line, 1) === "1")) {
          gardener_help_seen = true;
        } else {
          gardener_help_seen = false;
        }
      } else if ((type === "mgshoptenderhelp")) {
        if ((py.getitem(line, 1) === "1")) {
          shoptender_help_seen = true;
        } else {
          shoptender_help_seen = false;
        }
      } else if ((type === "mglibrarianhelp")) {
        if ((py.getitem(line, 1) === "1")) {
          librarian_help_seen = true;
        } else {
          librarian_help_seen = false;
        }
      } else if ((type === "mgbricklayerhelp")) {
        if ((py.getitem(line, 1) === "1")) {
          bricklayer_help_seen = true;
        } else {
          bricklayer_help_seen = false;
        }
      } else if ((type === "phase2help")) {
        if ((py.getitem(line, 1) === "1")) {
          phase2_help = true;
        } else {
          phase2_help = false;
        }
      } else if ((type === "phase3help")) {
        if ((py.getitem(line, 1) === "1")) {
          phase3_help = true;
        } else {
          phase3_help = false;
        }
      } else if ((type === "identikithelp")) {
        if ((py.int(py.getitem(line, 1)) === 1)) {
          identikit_help = true;
        } else {
          identikit_help = false;
        }
      } else if ((type === "showfolder")) {
        if ((py.int(py.getitem(line, 1)) === 1)) {
          show_folder = true;
        } else {
          show_folder = false;
        }
      } else if ((type === "shownotesanimation")) {
        if ((py.int(py.getitem(line, 1)) === 1)) {
          show_notes_animation = true;
        } else {
          show_notes_animation = false;
        }
      } else if ((type === "score")) {
        score = py.int(py.getitem(line, 1));
      } else if ((type === "resolvedcases")) {
        resolved_cases = py.int(py.getitem(line, 1));
      } else if ((type === "medals")) {
        k = 1;
        while ((k < py.len(line))) {
          medal = new datamodel.Medal(py.getitem(line, k), py.int(py.getitem(line, py.add(k, 1))));
          py.m(medals, "append", medal);
          k = k + 2;
        }
      } else if ((type === "notes")) {
        k = 1;
        while ((k < py.len(line))) {
          [note_item, size] = read_note(line, k, datastore);
          k = py.add(k, size);
          if (py.truthy(note_item)) {
            py.m(notes, "append", note_item);
          }
        }
      } else if ((type === "newnotes")) {
        k = 1;
        while ((k < py.len(line))) {
          [note_item, size] = read_note(line, k, datastore);
          k = py.add(k, size);
          if (py.truthy(note_item)) {
            py.m(new_notes, "append", note_item);
          }
        }
      } else if ((type === "bricklayerpics")) {
        k = 1;
        while ((k < py.len(line))) {
          py.m(bricklayer_pictures_seen, "append", py.int(py.getitem(line, k)));
          k = k + 1;
        }
      } else if ((type === "lasthelpstep")) {
        last_help_step_seen = py.int(py.getitem(line, 1));
      } else if ((type === "caughtthief")) {
        if ((py.getitem(line, 1) === "-1")) {
          caught_thief = null;
        } else {
          value = py.getitem(line, 1);
          if (py.truthy(py.m(value, "startswith", "("))) {
            k = py.m(value, "index", ",");
            value = py.slice(value, 1, k);
          }
          caught_thief = py.int(value);
        }
      } else if ((type === "cluesidentified")) {
        if ((py.int(py.getitem(line, 1)) === 1)) {
          clues_identified = true;
        } else {
          clues_identified = false;
        }
      } else if ((type === "capturedthieves")) {
        k = 1;
        while ((k < py.len(line))) {
          ct = py.getitem(datastore.list_thieves, py.int(py.getitem(line, k)));
          if (!py.contains(captured_thieves, ct)) {
            py.m(captured_thieves, "append", ct);
          }
          k = k + 1;
        }
      }
    }
    for ([witness, statement_index] of py.iter(pending_witness_statements)) {
      if ((statement_index >= 0)) {
        witness.witness_statement = py.getitem(datastore.list_statements, statement_index);
      } else {
        witness.witness_statement = py.getitem(list_wit_statements, ((-statement_index) - 1));
      }
    }
    if ((c_uuid == null)) {
      c_uuid = uuid.uuid4();
    }
    char = new datamodel.Character(charinfo, c_dep, c_uuid);
    char_progress = new datamodel.CharacterProgress(char, score, resolved_cases, medals, list_dep_solved, gardener_help_seen, shoptender_help_seen, gardener_help_seen, bricklayer_help_seen, phase2_help, phase3_help, identikit_help, show_folder, show_notes_animation, notes, new_notes, bricklayer_pictures_seen, last_help_step_seen, captured_thieves);
    if (py.truthy(generate_new_case)) {
      stage = null;
      case_ = null;
    } else {
      case_ = new datamodel.Case(case_number, last_dep_lair, last_dep_visited, crime_loc, stolen_obj, time_limit, time_spend, clues_found, wrong_witness_visited, thief, arrest_order_thief, clues_identified, list_thieves, list_witnesses, list_wit_statements, list_visited_witnesses, list_folder_witnesses, list_dep, list_target_cities, list_posible_deps, thief_lair_set, list_clues, list_sel_feat, caught_thief);
    }
    char_progress.set_case(case_);
    return [char, char_progress, stage];
  }
}
export function create_new_character(datastore: any, charinfo: any): any {
  let char, char_progress, char_uuid, d, dep, stage: any;
  dep = py.getitem(datastore.list_departments, py.int(0));
  for (d of py.iter(datastore.list_departments)) {
    if (py.eq(d.name, charinfo.location)) {
      dep = d;
      break;
    }
  }
  char_uuid = uuid.uuid4();
  char = new datamodel.Character(charinfo, dep, char_uuid);
  char_progress = new datamodel.CharacterProgress(char);
  stage = null;
  return [char, char_progress, stage];
}
export function get_character_file_name(char_id: any): any {
  return py.add(py.add("c", py.str(char_id)), ".dat");
}
export function delete_character(char_id: any): any {
  let file_name, file_to_delete, message: any;
  file_name = get_character_file_name(char_id);
  file_to_delete = os.path.join(external.data_path, "data", file_name);
  if (py.truthy(os.path.exists(file_to_delete))) {
    try {
      os.remove(file_to_delete);
    } catch ($e: any) {
      if (py.isExc($e, [py.Exception])) {
        message = $e;
        py.print("Cannot delete data file:", file_to_delete, "(message:", message, ")");
      }
      else throw $e;
    }
  }
  return null;
}
export function save_note(list: any, note: any, datastore: any): any {
  let dep, item_type: any;
  dep = py.getitem(note.get_departments(), 0);
  item_type = note.type;
  py.m(list, "append", py.str(py.m(py.getitem(py.getitem(datastore.department_type_index, dep.name), item_type), "index", note)));
  py.m(list, "append", py.str(py.m(datastore.list_departments, "index", dep)));
  py.m(list, "append", item_type);
  return null;
}
export function read_note(line: any, k: any, datastore: any): any {
  let dep_index, dep_name, note_index, note_item, note_item_type: any;
  note_index = py.int(py.getitem(line, k));
  dep_index = py.int(py.getitem(line, py.add(k, 1)));
  note_item_type = py.getitem(line, py.add(k, 2));
  dep_name = py.getitem(datastore.list_departments, dep_index).name;
  try {
    note_item = py.getitem(py.getitem(py.getitem(datastore.department_type_index, dep_name), note_item_type), note_index);
  } catch ($e: any) {
    if (true) {
      return [null, 3];
    }
    else throw $e;
  }
  return [note_item, 3];
}
export class CaseGenerator {
  constructor(datastore: any) {
    this.use_fixed_route = false;
    this.datastore = datastore;
    return;
  }
  new_case(): any {
    let case_number, crime_location, last_department_lair, last_department_visited, list_clues, list_departments, list_folder_witnesses, list_posible_departments, list_selected_features, list_target_cities, list_thieves, list_visited_witnesses, list_witness_statements, list_witnesses, stolen_object, thief, thief_lair_set, time_limit: any;
    this._CaseGenerator__seed = time.time();
    random.seed(this._CaseGenerator__seed);
    last_department_visited = this.datastore.user_character_progress.character.department;
    last_department_lair = this.generate_case_department();
    [list_departments, list_posible_departments] = this.generate_departments(last_department_lair);
    list_target_cities = this.generate_target_cities(list_departments);
    crime_location = this.generate_crime_location(last_department_lair);
    stolen_object = this.generate_stolen_object(crime_location);
    [thief, list_thieves] = this.generate_thiefs();
    list_witnesses = this.generate_witnesses(list_departments);
    time_limit = this.generate_time_limit(list_departments);
    thief_lair_set = this.generate_thief_lair_set();
    list_witness_statements = this.generate_witness_statements(thief, this.datastore);
    case_number = this.generate_case_number();
    list_clues = this.generate_clues(list_departments);
    list_visited_witnesses = [];
    list_folder_witnesses = [];
    list_selected_features = [0, 0, 0, 0];
    return new datamodel.Case(case_number, last_department_lair, last_department_visited, crime_location, stolen_object, time_limit, 0, [], false, thief, null, false, list_thieves, list_witnesses, list_witness_statements, list_visited_witnesses, list_folder_witnesses, list_departments, list_target_cities, list_posible_departments, thief_lair_set, list_clues, list_selected_features, null);
  }
  generate_thief_lair_set(): any {
    let thief_set: any;
    thief_set = random.choice(this.datastore.list_lair_sets);
    return [thief_set, null];
  }
  select_clue_types(notes: any, clues: any, added_clues: any): any {
    let clue, list_clues: any;
    if ((py.len(clues) === 3)) {
      return true;
    }
    if (py.truthy(notes)) {
      list_clues = py.slice(this.datastore.list_clues, null, null);
      random.shuffle(list_clues);
      for (clue of py.iter(list_clues)) {
        if ((py.contains((() => { const $r: any[] = []; let type; for (type of py.iter(clue.list_types)) { $r.push(type.type); } return $r; })(), py.getitem(notes, 0).type) && !py.contains(added_clues, clue))) {
          py.m(clues, "append", new datamodel.StageClue(clue, py.getitem(notes, 0)));
          py.m(added_clues, "append", clue);
          if (py.truthy(this.select_clue_types(py.slice(notes, 1, null), clues, added_clues))) {
            return true;
          }
          py.m(added_clues, "pop");
          py.m(clues, "pop");
        }
      }
    }
    return false;
  }
  generate_department_clues(department: any): any {
    let added_clues, candidates, clues, notes, type, types: any;
    types = py.list(this.datastore.list_clue_types);
    random.shuffle(types);
    notes = [];
    for (type of py.iter(types)) {
      if ((type.type === "MUSICIAN")) {
        continue;
      }
      candidates = py.getitem(py.getitem(this.datastore.department_type_index, department.name), type.type);
      if (py.truthy(candidates)) {
        py.m(notes, "append", random.choice(candidates));
      }
      if ((py.len(notes) === 3)) {
        break;
      }
    }
    if ((py.len(notes) !== 3)) {
      throw new py.Exception(py.add(py.add(py.add(py.add(py.add("Less notes:", py.str(py.len(notes))), ", seed: "), py.str(this._CaseGenerator__seed)), "; depart: "), department.name));
    }
    clues = [];
    added_clues = [];
    if (!py.truthy(this.select_clue_types(notes, clues, added_clues))) {
      throw new py.Exception(py.add(py.add(py.add("Not enough clues, seed: ", py.str(this._CaseGenerator__seed)), "; depart: "), department.name));
    }
    if (!py.eq(py.len(py.set(added_clues)), py.len(added_clues))) {
      throw new py.Exception(py.add(py.add(py.add("repeated clues, seed: ", py.str(this._CaseGenerator__seed)), "; depart: "), department.name));
    }
    return clues;
  }
  generate_clues(list_departments: any): any {
    return this.generate_department_clues(py.getitem(list_departments, 1));
  }
  generate_witness_statements(thief: any, datastore: any): any {
    let added, i, identikit_statement, intro_statement, janitor_statement, list_animal_statements, list_identikit_statements, list_janitor_statements, list_pet_statements, list_sport_statements, list_w_statements, s, selection: any;
    list_identikit_statements = [];
    list_janitor_statements = [];
    list_sport_statements = [];
    list_pet_statements = [];
    list_w_statements = [];
    if ((thief.sex === 1)) {
      intro_statement = py.getitem(datastore.list_statements, 1);
    } else {
      intro_statement = py.getitem(datastore.list_statements, 2);
    }
    for (s of py.iter(datastore.list_identikit_statements)) {
      if ((py.eq(thief.sex, s.sex_feature) && py.eq(thief.height, s.height_feature))) {
        py.m(list_identikit_statements, "append", s);
      } else if ((py.eq(thief.sex, s.sex_feature) && py.eq(thief.hair, s.hair_feature))) {
        py.m(list_identikit_statements, "append", s);
      } else if (py.eq(thief.distinctive_feature, s.distinctive_feature)) {
        py.m(list_identikit_statements, "append", s);
      }
    }
    selection = random.choice([thief.animal, thief.sport]);
    if (py.eq(selection, thief.sport)) {
      selection = thief.animal;
      list_sport_statements = [];
      for (s of py.iter(datastore.list_janitor_statements)) {
        if ((s.type === 1)) {
          if ((py.eq(s.category1, thief.sport.category) || py.eq(s.category2, thief.sport.team) || py.eq(s.category3, thief.sport.ball))) {
            if ((py.eq(thief.sex, s.thief_sex) || py.eq(s.thief_sex, (-1)))) {
              py.m(list_sport_statements, "append", s);
            }
          }
        }
      }
      for (i of py.range(3)) {
        py.m(list_janitor_statements, "append", py.m(list_sport_statements, "pop", py.m(list_sport_statements, "index", random.choice(list_sport_statements))));
      }
    } else {
      selection = thief.sport;
      list_animal_statements = [];
      for (s of py.iter(datastore.list_janitor_statements)) {
        if ((s.type === 2)) {
          if ((py.eq(s.category1, thief.animal.classification) || py.eq(s.category2, thief.animal.diet) || py.eq(s.category3, thief.animal.movement))) {
            if ((py.eq(thief.sex, s.thief_sex) || py.eq(s.thief_sex, (-1)))) {
              py.m(list_animal_statements, "append", s);
            }
          }
        }
      }
      for (i of py.range(3)) {
        py.m(list_janitor_statements, "append", py.m(list_animal_statements, "pop", py.m(list_animal_statements, "index", random.choice(list_animal_statements))));
      }
    }
    added = false;
    for (i of py.range(3)) {
      identikit_statement = null;
      if ((i === 0)) {
        identikit_statement = py.getitem(list_identikit_statements, 0);
      } else if ((i === 1)) {
        identikit_statement = py.getitem(list_identikit_statements, 1);
      } else if ((i === 2)) {
        identikit_statement = py.getitem(list_identikit_statements, 2);
      }
      janitor_statement = py.getitem(list_janitor_statements, i);
      py.m(list_w_statements, "append", new datamodel.WitnessStatement(intro_statement, janitor_statement, identikit_statement));
    }
    return list_w_statements;
  }
  generate_case_number(): any {
    let first_7_digits, last_digit: any;
    first_7_digits = random.choice(py.xrange(9999999));
    last_digit = random.choice(py.xrange(10));
    return py.add(py.add(py.str(first_7_digits), "-"), py.str(last_digit));
  }
  generate_time_limit(list_departments: any): any {
    let basic_turns, dep_distance, i, minigame_turns, proximity_matrix, range, thief_lair, times_resolution, total_turns, travel_turns: any;
    proximity_matrix = this.datastore.generate_departments_proximity_matrix();
    range = this.datastore.user_character_progress.range;
    minigame_turns = 1;
    thief_lair = 1;
    times_resolution = 1;
    basic_turns = py.mul(py.add(py.mul(minigame_turns, 3), thief_lair), times_resolution);
    travel_turns = 0;
    for (i of py.range(1)) {
      dep_distance = get_travel_turns(this.datastore, [py.getitem(list_departments, i), py.getitem(list_departments, py.add(i, 1))]);
      travel_turns = py.add(travel_turns, dep_distance);
    }
    total_turns = (py.int(py.mul(py.add(basic_turns, travel_turns), range.time_limit_percentage)) + 1);
    return total_turns;
  }
  generate_thiefs(): any {
    let captured_thieves, case_thief, possible_thieves, same_sex, t, thieves: any;
    possible_thieves = py.slice(this.datastore.list_thieves, null, null);
    captured_thieves = this.datastore.user_character_progress.captured_thieves;
    if (py.eq(py.len(captured_thieves), py.len(possible_thieves))) {
      py.delitem(captured_thieves, py.sl(0, py.div(py.len(possible_thieves), 2)));
    }
    for (t of py.iter(captured_thieves)) {
      if (py.contains(possible_thieves, t)) {
        py.m(possible_thieves, "remove", t);
      }
    }
    case_thief = random.choice(possible_thieves);
    same_sex = py.filter(((x) => py.and(py.eq(x.sex, case_thief.sex), () => (x !== case_thief))), this.datastore.list_thieves);
    random.shuffle(same_sex);
    thieves = py.add([case_thief], py.slice(same_sex, null, 7));
    py.m(thieves, "append", random.choice(py.filter(((x) => !py.eq(x.sex, case_thief.sex)), this.datastore.list_thieves)));
    random.shuffle(thieves);
    return [case_thief, thieves];
  }
  generate_stolen_object(crime_location: any): any {
    let list_posible_stolen_objects, so, stolen_obj, type_loc: any;
    list_posible_stolen_objects = [];
    for (type_loc of py.iter(crime_location.type_locations)) {
      for (stolen_obj of py.iter(this.datastore.list_stolen_objects)) {
        if (py.eq(stolen_obj.type_location, type_loc)) {
          py.m(list_posible_stolen_objects, "append", stolen_obj);
          so = random.choice(list_posible_stolen_objects);
        }
      }
    }
    return so;
  }
  generate_witnesses(list_departments: any): any {
    let c, dep, i, list_pos_cities, list_witnesses, random_wit, wit, wit_ori, witnesses: any;
    list_witnesses = [];
    dep = py.getitem(list_departments, 0);
    list_pos_cities = [];
    for (c of py.iter(dep.city_pins)) {
      py.m(list_pos_cities, "append", c);
    }
    witnesses = [];
    for (i of py.range(py.len(dep.city_pins))) {
      if ((py.len(witnesses) === 0)) {
        witnesses = py.slice(this.datastore.list_witnesses, null, null);
      }
      random_wit = random.choice(witnesses);
      py.m(witnesses, "remove", random_wit);
      wit_ori = random_wit;
      wit = new datamodel.Witness(wit_ori.name, wit_ori.image);
      wit.department = dep;
      wit.city = py.m(list_pos_cities, "pop", py.m(list_pos_cities, "index", random.choice(list_pos_cities)));
      wit.witness_statement = py.getitem(this.datastore.list_statements, 0);
      py.m(list_witnesses, "append", wit);
    }
    return list_witnesses;
  }
  generate_crime_location(last_department_lair: any): any {
    let cl, crime_loc, list_posible_crime_locs: any;
    list_posible_crime_locs = [];
    for (crime_loc of py.iter(this.datastore.list_crime_locations)) {
      if (py.eq(crime_loc.department, last_department_lair)) {
        py.m(list_posible_crime_locs, "append", crime_loc);
      }
    }
    cl = random.choice(list_posible_crime_locs);
    return cl;
  }
  generate_case_department(): any {
    let dep, list_case_departments: any;
    list_case_departments = [];
    for (dep of py.iter(this.datastore.list_departments)) {
      if (!py.truthy(py.m(this.datastore.user_character_progress.list_departments_solved, "__contains__", dep))) {
        py.m(list_case_departments, "append", dep);
      }
    }
    if ((py.len(list_case_departments) === 0)) {
      this.datastore.user_character_progress.list_departments_solved = [];
      return this.generate_case_department();
    } else {
      if (py.truthy(this.use_fixed_route)) {
        return py.getitem(list_case_departments, 8);
      }
      return random.choice(list_case_departments);
    }
    return null;
  }
  generate_departments(last_department_lair: any): any {
    let IN_RANGE, OUT_OF_RANGE, d, dep_selection, i, last_dep, list_border_deps, list_deps_to_visit, list_posible_border_departments, list_posible_deps, proximity_matrix, range, t1, t2: any;
    IN_RANGE = true;
    OUT_OF_RANGE = false;
    proximity_matrix = this.datastore.generate_departments_proximity_matrix();
    range = this.datastore.user_character_progress.range;
    last_dep = last_department_lair;
    list_posible_deps = [];
    list_deps_to_visit = [];
    py.m(list_deps_to_visit, "append", last_department_lair);
    list_border_deps = this.get_border_departments(last_dep);
    t1 = "";
    for (i of py.range(py.len(list_border_deps))) {
      t1 = py.add(t1, py.add(py.getitem(list_border_deps, i).name, ", "));
    }
    for (d of py.iter(list_border_deps)) {
      if ((py.truthy(this.department_in_range(proximity_matrix, range, last_dep, d)) && !py.truthy(py.m(list_deps_to_visit, "__contains__", d)))) {
        py.m(list_posible_deps, "append", d);
      }
    }
    for (d of py.iter(list_posible_deps)) {
      py.m(list_border_deps, "remove", d);
    }
    t2 = "";
    for (i of py.range(py.len(list_posible_deps))) {
      t2 = py.add(t2, py.add(py.getitem(list_posible_deps, i).name, ", "));
    }
    if ((py.len(list_posible_deps) > range.max_departments)) {
      while ((py.len(list_posible_deps) > range.max_departments)) {
        py.m(list_posible_deps, "remove", random.choice(list_posible_deps));
      }
    } else if ((py.len(list_posible_deps) < range.max_departments)) {
      list_posible_border_departments = this.generate_posible_departments(proximity_matrix, range, list_deps_to_visit, list_posible_deps, last_dep, IN_RANGE);
      while (((py.len(list_posible_border_departments) > 0) && (py.len(list_posible_deps) < range.max_departments))) {
        dep_selection = py.m(list_posible_border_departments, "pop", py.m(list_posible_border_departments, "index", random.choice(list_posible_border_departments)));
        if (((py.len(list_posible_deps) < range.max_departments) && !py.truthy(py.m(list_posible_deps, "__contains__", dep_selection)) && !py.truthy(py.m(list_deps_to_visit, "__contains__", dep_selection)))) {
          py.m(list_posible_deps, "append", dep_selection);
        }
      }
      while (((py.len(list_border_deps) > 0) && (py.len(list_posible_deps) < range.max_departments))) {
        dep_selection = py.m(list_border_deps, "pop", py.m(list_border_deps, "index", random.choice(list_border_deps)));
        if (((py.len(list_posible_deps) < range.max_departments) && !py.truthy(py.m(list_posible_deps, "__contains__", dep_selection)) && !py.truthy(py.m(list_deps_to_visit, "__contains__", dep_selection)))) {
          py.m(list_posible_deps, "append", dep_selection);
        }
      }
      while ((py.len(list_posible_deps) < range.max_departments)) {
        if (((py.len(list_posible_deps) === 17) && (py.len(list_deps_to_visit) === 2))) {
          break;
        }
        list_posible_border_departments = this.generate_posible_departments(proximity_matrix, range, list_deps_to_visit, list_posible_deps, last_dep, OUT_OF_RANGE);
        while (((py.len(list_posible_border_departments) > 0) && (py.len(list_posible_deps) < range.max_departments))) {
          dep_selection = py.m(list_posible_border_departments, "pop", py.m(list_posible_border_departments, "index", random.choice(list_posible_border_departments)));
          if (((py.len(list_posible_deps) < range.max_departments) && !py.truthy(py.m(list_posible_deps, "__contains__", dep_selection)) && !py.truthy(py.m(list_deps_to_visit, "__contains__", dep_selection)))) {
            py.m(list_posible_deps, "append", dep_selection);
          }
        }
      }
    }
    if (py.truthy(this.use_fixed_route)) {
      last_dep = py.getitem(list_posible_deps, 0);
    } else {
      last_dep = random.choice(list_posible_deps);
    }
    py.m(list_deps_to_visit, "append", last_dep);
    return [list_deps_to_visit, list_posible_deps];
  }
  generate_target_cities(deps: any): any {
    let d, target_cities: any;
    target_cities = [];
    for (d of py.iter(deps)) {
      py.m(target_cities, "append", random.choice(py.xrange(py.len(d.city_pins))));
    }
    return target_cities;
  }
  generate_posible_departments(proximity_matrix: any, range: any, list_deps_to_visit: any, list_deps_added: any, last_dep: any, in_range: any): any {
    let d, list_border_deps, td, test_list_border_deps: any;
    list_border_deps = [];
    for (d of py.iter(list_deps_added)) {
      test_list_border_deps = this.get_border_departments(d);
      for (td of py.iter(test_list_border_deps)) {
        if ((!py.truthy(py.m(list_border_deps, "__contains__", td)) && !py.truthy(py.m(list_deps_added, "__contains__", td)) && !py.truthy(py.m(list_deps_to_visit, "__contains__", td)))) {
          if (py.truthy(in_range)) {
            if (py.truthy(this.department_in_range(proximity_matrix, range, last_dep, td))) {
              py.m(list_border_deps, "append", td);
            }
          } else {
            py.m(list_border_deps, "append", td);
          }
        }
      }
    }
    return list_border_deps;
  }
  department_in_range(proximity_matrix: any, range: any, start_dep: any, end_dep: any): any {
    let dep_distance, dep_in_matrix_position, max_allowed_distance: any;
    max_allowed_distance = this.datastore.user_character_progress.range.distance;
    dep_in_matrix_position = py.m(this.datastore.list_departments, "index", start_dep);
    dep_distance = py.getitem(py.getitem(proximity_matrix, dep_in_matrix_position), py.m(this.datastore.list_departments, "index", end_dep));
    if (((dep_distance <= max_allowed_distance) && (dep_distance !== 0))) {
      return true;
    } else {
      return false;
    }
    return null;
  }
  get_border_departments(start_dep: any): any {
    let border, border_matrix, dep_in_matrix_position, i, list_border_deps: any;
    border_matrix = this.datastore.generate_departments_bordering_matrix();
    dep_in_matrix_position = py.m(this.datastore.list_departments, "index", start_dep);
    list_border_deps = [];
    for (i of py.range(19)) {
      border = py.getitem(py.getitem(border_matrix, dep_in_matrix_position), i);
      if ((border === 1)) {
        py.m(list_border_deps, "append", py.getitem(this.datastore.list_departments, i));
      }
    }
    return list_border_deps;
  }
}
export function get_travel_turns(datastore: any, list_deps: any): any {
  let dep_distance, final_dep_in_matrix_position, initial_dep_in_matrix_position, proximity_matrix: any;
  proximity_matrix = datastore.generate_departments_proximity_matrix();
  initial_dep_in_matrix_position = py.m(datastore.list_departments, "index", py.getitem(list_deps, 0));
  final_dep_in_matrix_position = py.m(datastore.list_departments, "index", py.getitem(list_deps, 1));
  dep_distance = py.getitem(py.getitem(proximity_matrix, initial_dep_in_matrix_position), final_dep_in_matrix_position);
  return dep_distance;
}
export function check_obj_equals(o1: any, name1: any, stack1: any, o2: any, name2: any, stack2: any, check_cache: any): any {
  let field, field1, field2, fields1, fields2, i, key, type1, type2: any;
  if ((o1 == null)) {
    if ((o2 == null)) {
      return null;
    }
    throw new py.Exception(py.add(py.add(py.add(py.add(py.add(py.add("Objects are not equal. '", name1), "' is None, and '"), name2), "' has value '"), py.str(o2)), "'"));
  } else if ((o2 == null)) {
    throw new py.Exception(py.add(py.add(py.add(py.add(py.add(py.add("Objects are not equal. '", name2), "' is None, and '"), name1), "' has value '"), py.str(o1)), "'"));
  }
  if ((!py.contains(stack1, o1) && !py.contains(stack2, o2))) {
    py.m(stack1, "append", o1);
    py.m(stack2, "append", o2);
    type1 = py.type(o1);
    type2 = py.type(o2);
    if (!py.eq(type1, type2)) {
      throw new py.Exception(py.add(py.add(py.add(py.add(py.add(py.add(py.add(py.add("Objects are not equal. '", name1), "' (type '"), py.str(type1)), ") has a different type than '"), name2), "' (type "), py.str(type2)), ")"));
    }
    if ((type1 === FunctionType)) {
    } else if (((type1 === IntType) || (type1 === LongType) || (type1 === FloatType) || (type1 === StringType))) {
      if (!py.eq(o1, o2)) {
        throw new py.Exception(py.add(py.add(py.add(py.add(py.add(py.add(py.add(py.add("Objects are not equal. '", name1), "' (="), py.str(o1)), ") has a different value than '"), name2), "' (="), py.str(o2)), ")"));
      }
    } else if ((type1 === assets.Image)) {
      if (!py.eq(o1.get_file_name(), o2.get_file_name())) {
        throw new py.Exception(py.add(py.add(py.add(py.add(py.add(py.add(py.add(py.add("Objects are not equal. '", name1), "' has a image '"), o1.get_file_name()), "' and '"), name2), "' has image '"), o2.get_file_name()), "'"));
      }
    } else if (((type1 === TupleType) || (type1 === ListType))) {
      if (!py.eq(py.len(o1), py.len(o2))) {
        throw new py.Exception(py.add(py.add(py.add(py.add(py.add(py.add(py.add(py.add("Objects are not equal. '", name1), "' (count "), py.str(py.len(o1))), ") has a different number of elements than '"), name2), "' (count "), py.str(py.len(o2))), ")"));
      }
      for (i of py.range(py.len(o1))) {
        check_obj_equals(py.getitem(o1, i), py.add(py.add(py.add(name1, "["), py.str(i)), "]"), stack1, py.getitem(o2, i), py.add(py.add(py.add(name2, "["), py.str(i)), "]"), stack2, check_cache);
      }
    } else if ((type1 === DictType)) {
      if (!py.eq(py.len(o1), py.len(o2))) {
        throw new py.Exception(py.add(py.add(py.add(py.add("Objects are not equal. '", name1), "' has a different number of elements than '"), name2), "'"));
      }
      for (key of py.range(py.len(o1))) {
        if (!py.contains(o2, key)) {
          throw new py.Exception(py.add(py.add(py.add(py.add(py.add(py.add("Objects are not equal. '", name1), "' has key '"), py.str(key)), " but dictionary '"), name2), "' doesn't have it."));
        }
        check_obj_equals(py.getitem(o1, key), py.add(py.add(py.add(name1, "["), py.str(key)), "]"), stack1, py.getitem(o2, key), py.add(py.add(py.add(name2, "["), py.str(key)), "]"), stack2, check_cache);
      }
    } else if ((!py.contains(check_cache, o1) || !py.eq(py.getitem(check_cache, o1), o2))) {
      py.setitem(check_cache, o1, o2);
      fields1 = py.dir(o1);
      fields2 = py.dir(o2);
      for (field1 of py.iter(fields1)) {
        if (!py.truthy(py.m(field1, "startswith", "__"))) {
          if (!py.contains(fields2, field1)) {
            throw new py.Exception(py.add(py.add(py.add(py.add(py.add(py.add(py.add(py.add(py.add(py.add("Objects are not equal. Field '", field1), "' is defined in '"), name1), "' ("), py.str(o1)), ") but it is not defined in '"), name2), "' ("), py.str(o2)), ")"));
          }
        }
      }
      for (field2 of py.iter(fields2)) {
        if (!py.truthy(py.m(field2, "startswith", "__"))) {
          if (!py.contains(fields1, field2)) {
            throw new py.Exception(py.add(py.add(py.add(py.add(py.add(py.add(py.add(py.add(py.add(py.add("Objects are not equal. Field '", field2), "' is defined in '"), name2), "' ("), py.str(o2)), ") but it is not defined in '"), name1), "' ("), py.str(o2)), ")"));
          }
        }
      }
      for (field of py.iter(fields1)) {
        if (!py.truthy(py.m(field, "startswith", "__"))) {
          check_obj_equals(py.getattr(o1, field), py.add(py.add(name1, "."), field), stack1, py.getattr(o2, field), py.add(py.add(name2, "."), field), stack2, check_cache);
        }
        py.m(stack1, "append", o1);
      }
    }
    py.m(stack1, "remove", o1);
    py.m(stack2, "remove", o2);
  }
  return null;
}
py.register("game/data/serialization", $self);
