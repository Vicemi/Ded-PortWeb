// @ts-nocheck
// Generated from the original game code (see MODLOG.md). Do not edit by hand.
import * as py from '../../runtime/py';
import { CharacterInfo } from './datamodel';
import * as assets from '../../engine/assets';
import { collections } from '../../runtime/py';
import * as content_extend from '../../game/content/extend';
import * as datamodel from './datamodel';
import * as serialization from './serialization';
import * as stats from '../../runtime/stats';
import { sys } from '../../runtime/prelude';
import { uuid } from '../../runtime/py';
import * as version from '../../runtime/version';
import * as $self from './datastore';

export let BASE_REQUEST_URL: any = "http://ws.trojanchicken.com/ded/uy/";
export let UPDATE_URL: any = py.add(BASE_REQUEST_URL, "update");
export let STATS_URL: any = py.add(BASE_REQUEST_URL, "stats");
export let ERRORS_URL: any = py.add(BASE_REQUEST_URL, "errors");
export let SCORE_KEY: any = "@i90[pp.";
export let SCORE_IV: any = "\x00\x00\x00\x00\x00\x00\x00\x00";
export let VERSION: any = version.VERSION;
export let ARTIGAS: any = "Artigas";
export let CANELONES: any = "Canelones";
export let CERRO_LARGO: any = "Cerro Largo";
export let COLONIA: any = "Colonia";
export let DURAZNO: any = "Durazno";
export let FLORES: any = "Flores";
export let FLORIDA: any = "Florida";
export let LAVALLEJA: any = "Lavalleja";
export let MALDONADO: any = "Maldonado";
export let MONTEVIDEO: any = "Montevideo";
export let PAYSANDU: any = "Paysand\xfa";
export let RIO_NEGRO: any = "R\xedo Negro";
export let RIVERA: any = "Rivera";
export let ROCHA: any = "Rocha";
export let SALTO: any = "Salto";
export let SAN_JOSE: any = "San Jos\xe9";
export let SORIANO: any = "Soriano";
export let TACUAREMBO: any = "Tacuaremb\xf3";
export let TREINTA_Y_TRES: any = "Treinta y Tres";
export let GENERICO: any = "Gen\xe9rico";
export let INDIGENA: any = "Ind\xedgena";
export let GAUCHO: any = "Gaucho";
export let FOSILES: any = "F\xf3siles";
export let APARICIO_SARAVIA: any = "Aparicio Saravia";
export let FABINI: any = "Fabini";
export let ARMAS: any = "Armas";
export let MONEDAS: any = "Monedas";
export let BLANES: any = "Blanes";
export let TORRES_GARCIA: any = "Torres Garc\xeda";
export let SOLARI: any = "Solari";
export let ARTE: any = "Arte";
export let GARDEL: any = "Gardel";
export let EUSEBIO_GIMENEZ: any = "Eusebio Gim\xe9nez";
export let MALE: any = 1;
export let FEMALE: any = 2;
export let TALL: any = 1;
export let SHORT: any = 2;
export let BRUNETTE: any = 1;
export let BLONDE: any = 2;
export let REDHEAD: any = 3;
export let GREY_HAIRED: any = 4;
export let SCAR: any = 1;
export let TATOO: any = 2;
export let GLASSES: any = 3;
export let MOLE: any = 4;
export let SPORT: any = 1;
export let PET: any = 2;
export let MAMMAL: any = 1;
export let BIRD: any = 2;
export let REPTILE: any = 3;
export let FISH: any = 4;
export let HERBIVORE: any = 1;
export let CARNIVORE: any = 2;
export let WALK: any = 1;
export let FLY: any = 2;
export let SWIM: any = 3;
export let AQUATIC: any = 1;
export let TERRESTRIAL: any = 2;
export let THIEF_CAR_COLORS: any = py.mkdict([["violet", "violeta"], ["green", "verde"], ["blue", "azul"]]);
export class Datastore {
  constructor(game: any) {
    this.wrong_witness_visited = false;
    this.set_up_data(game);
    return;
  }
  load_CrimeLocations(): any {
    let crime_location, crime_location_type, d, data, department, fields, fields2, file, full_name, i, l, line, my_line, my_line2: any;
    full_name = "test2.txt";
    file = py.open(full_name, "r");
    line = py.m(file, "readline");
    data = [];
    my_line = "";
    i = 0;
    while ((line !== "")) {
      i = i + 1;
      line = py.m(py.m(line, "rstrip", "\n"), "rstrip", "\r");
      fields = py.m(line, "split", ",");
      crime_location = py.getitem(fields, 0);
      fields2 = py.m(py.getitem(fields, 1), "split", "(");
      l = py.len(py.getitem(fields2, 0));
      department = py.slice(py.slice(py.getitem(fields2, 0), 1, null), null, (l - 1));
      l = py.len(py.getitem(fields2, 1));
      crime_location_type = py.slice(py.getitem(fields2, 1), null, (l - 1));
      my_line = py.add(py.add(py.add(py.add(py.add(py.add(py.add(py.add("cl", py.str(i)), " = CrimeLocation('"), crime_location), "', '"), department), "', "), crime_location_type), ", None)");
      my_line2 = py.add(py.add(py.add("list_crime_locations.append(", "cl"), py.str(i)), ")");
      py.print(my_line);
      py.print(crime_location);
      py.print(department);
      py.print(crime_location_type);
      py.m(data, "append", my_line);
      py.m(data, "append", my_line2);
      line = py.m(file, "readline");
    }
    py.m(file, "close");
    file = py.open("test_nuevo2.txt", "w");
    for (d of py.iter(data)) {
      py.m(file, "write", py.add(d, "\n"));
    }
    file.close;
    return null;
  }
  build_note_list_departments(departments_pos: any): any {
    let d, line: any;
    line = "[";
    for (d of py.iter(departments_pos)) {
      line = py.add(line, py.add(py.add("self.list_departments[", d), "], "));
    }
    line = py.slice(line, null, (-2));
    line = py.add(line, "]");
    return line;
  }
  load_rivers(): any {
    let basin, d, data, desc, desc2, fields, file, full_name, length, line, list_deps, my_line, pos, river, river_count: any;
    full_name = "test.txt";
    file = py.open(full_name, "r");
    line = py.m(file, "readline");
    data = [];
    py.m(data, "append", "list_rivers = []");
    py.m(data, "append", "");
    [river, list_deps, length, basin, desc] = ["", "", "", "", ""];
    river_count = 0;
    while ((line !== "")) {
      if ((line !== "\n")) {
        line = py.m(py.m(line, "rstrip", "\n"), "rstrip", "\r");
        fields = py.m(line, "split", "|");
        if ((py.len(fields) === 2)) {
          river = py.getitem(fields, 0);
          list_deps = this.build_note_list_departments(py.m(py.getitem(fields, 1), "split", ","));
          pos = 1;
          desc2 = null;
        } else if ((pos === 1)) {
          length = py.getitem(fields, 0);
          pos = 2;
        } else if ((pos === 2)) {
          basin = py.getitem(fields, 0);
          pos = 3;
        } else if ((pos === 3)) {
          desc = py.getitem(fields, 0);
          pos = 4;
        } else if ((pos === 4)) {
          desc2 = py.getitem(fields, 0);
        }
      } else {
        river_count = river_count + 1;
        if (!py.truthy(desc2)) {
          my_line = py.add(py.add(py.add(py.add(py.add(py.add(py.add(py.add(py.add(py.add(py.add(py.add("r", py.str(river_count)), " = datamodel.RiverNote(\""), river), "\", "), list_deps), ", \""), length), "\", \""), basin), "\", \""), desc), "\", None)");
        } else {
          my_line = py.add(py.add(py.add(py.add(py.add(py.add(py.add(py.add(py.add(py.add(py.add(py.add(py.add(py.add("r", py.str(river_count)), " = datamodel.RiverNote(\""), river), "\", "), list_deps), ", \""), length), "\", \""), basin), "\", \""), desc), "\", \""), desc2), "\")");
        }
        py.m(data, "append", my_line);
        py.m(data, "append", py.add(py.add("list_rivers.append(r", py.str(river_count)), ")"));
        my_line = "";
      }
      line = py.m(file, "readline");
    }
    py.m(file, "close");
    file = py.open("test_nuevo.txt", "w");
    py.m(data, "append", "");
    py.m(data, "append", "return list_rivers");
    for (d of py.iter(data)) {
      py.m(file, "write", py.add(d, "\n"));
    }
    file.close;
    return null;
  }
  load_lagoons(): any {
    let d, data, desc, desc2, fields, file, full_name, lagoon, lagoon_count, line, list_deps, my_line, pos, surface: any;
    full_name = "test.txt";
    file = py.open(full_name, "r");
    line = py.m(file, "readline");
    data = [];
    py.m(data, "append", "list_lagoons = []");
    py.m(data, "append", "");
    [lagoon, list_deps, surface, desc] = ["", "", "", ""];
    lagoon_count = 0;
    while ((line !== "")) {
      if ((line !== "\n")) {
        line = py.m(py.m(line, "rstrip", "\n"), "rstrip", "\r");
        fields = py.m(line, "split", "|");
        if ((py.len(fields) === 2)) {
          lagoon = py.getitem(fields, 0);
          list_deps = this.build_note_list_departments(py.m(py.getitem(fields, 1), "split", ","));
          pos = 1;
          desc2 = null;
        } else if ((pos === 1)) {
          surface = py.getitem(fields, 0);
          pos = 2;
        } else if ((pos === 2)) {
          desc = py.getitem(fields, 0);
          pos = 3;
        } else if ((pos === 3)) {
          desc2 = py.getitem(fields, 0);
        }
      } else {
        lagoon_count = lagoon_count + 1;
        if (!py.truthy(desc2)) {
          my_line = py.add(py.add(py.add(py.add(py.add(py.add(py.add(py.add(py.add(py.add("r", py.str(lagoon_count)), " = datamodel.LagoonNote(\""), lagoon), "\", "), list_deps), ", \""), surface), "\", \""), desc), "\", None)");
        } else {
          my_line = py.add(py.add(py.add(py.add(py.add(py.add(py.add(py.add(py.add(py.add(py.add(py.add("r", py.str(lagoon_count)), " = datamodel.LagoonNote(\""), lagoon), "\", "), list_deps), ", \""), surface), "\", \""), desc), "\", \""), desc2), "\")");
        }
        py.m(data, "append", my_line);
        py.m(data, "append", py.add(py.add("list_lagoons.append(l", py.str(lagoon_count)), ")"));
        my_line = "";
      }
      line = py.m(file, "readline");
    }
    py.m(file, "close");
    file = py.open("test_nuevo.txt", "w");
    py.m(data, "append", "");
    py.m(data, "append", "return list_lagoons");
    for (d of py.iter(data)) {
      py.m(file, "write", py.add(d, "\n"));
    }
    file.close;
    return null;
  }
  load_hills(): any {
    let article, d, data, dep, desc, desc2, fields, file, full_name, height, hill, hill_count, line, my_line, pos: any;
    full_name = "test.txt";
    file = py.open(full_name, "r");
    line = py.m(file, "readline");
    data = [];
    py.m(data, "append", "list_hills = []");
    py.m(data, "append", "");
    [hill, dep, height, desc] = ["", "", "", ""];
    hill_count = 0;
    while ((line !== "")) {
      if ((line !== "\n")) {
        line = py.m(py.m(line, "rstrip", "\n"), "rstrip", "\r");
        fields = py.m(line, "split", "|");
        if ((py.len(fields) === 3)) {
          hill = py.getitem(fields, 0);
          article = py.getitem(fields, 1);
          dep = py.getitem(fields, 2);
          pos = 1;
          desc2 = null;
        } else if ((pos === 1)) {
          height = py.getitem(fields, 0);
          pos = 2;
        } else if ((pos === 2)) {
          desc = py.getitem(fields, 0);
          pos = 3;
        } else if ((pos === 3)) {
          desc2 = py.getitem(fields, 0);
        }
      } else {
        hill_count = hill_count + 1;
        if (!py.truthy(desc2)) {
          my_line = py.add(py.add(py.add(py.add(py.add(py.add(py.add(py.add(py.add(py.add(py.add(py.add("h", py.str(hill_count)), " = datamodel.HillNote(\""), hill), "\", "), article), "\", "), dep), ", \""), height), "\", \""), desc), "\", None)");
        } else {
          my_line = py.add(py.add(py.add(py.add(py.add(py.add(py.add(py.add(py.add(py.add(py.add(py.add(py.add(py.add("h", py.str(hill_count)), " = datamodel.HillNote(\""), hill), "\", "), article), "\", "), dep), ", \""), height), "\", \""), desc), "\", \""), desc2), "\")");
        }
        py.m(data, "append", my_line);
        py.m(data, "append", py.add(py.add("list_hills.append(h", py.str(hill_count)), ")"));
        my_line = "";
      }
      line = py.m(file, "readline");
    }
    py.m(file, "close");
    file = py.open("test_nuevo.txt", "w");
    py.m(data, "append", "");
    py.m(data, "append", "return list_hills");
    for (d of py.iter(data)) {
      py.m(file, "write", py.add(d, "\n"));
    }
    file.close;
    return null;
  }
  load_history_facts(): any {
    let article, d, data, date, desc, desc2, fields, file, full_name, history_fact, history_fact_count, line, list_deps, my_line, pos, sentence_start: any;
    full_name = "test.txt";
    file = py.open(full_name, "r");
    line = py.m(file, "readline");
    data = [];
    py.m(data, "append", "list_history_facts = []");
    py.m(data, "append", "");
    [history_fact, sentence_start, article, list_deps, date, desc] = ["", "", "", "", "", ""];
    history_fact_count = 0;
    pos = 1;
    desc2 = null;
    while ((line !== "")) {
      if ((line !== "\n")) {
        line = py.m(py.m(line, "rstrip", "\n"), "rstrip", "\r");
        fields = py.m(line, "split", "|");
        if ((pos === 1)) {
          sentence_start = py.getitem(fields, 0);
          pos = 2;
          desc2 = null;
        } else if ((pos === 2)) {
          article = py.getitem(fields, 0);
          pos = 3;
        } else if ((pos === 3)) {
          history_fact = py.getitem(fields, 0);
          list_deps = this.build_note_list_departments(py.m(py.getitem(fields, 1), "split", ","));
          pos = 4;
        } else if ((pos === 4)) {
          date = py.getitem(fields, 0);
          pos = 5;
        } else if ((pos === 5)) {
          desc = py.getitem(fields, 0);
          pos = 6;
        } else if ((pos === 6)) {
          desc2 = py.getitem(fields, 0);
        }
      } else {
        history_fact_count = history_fact_count + 1;
        if (!py.truthy(desc2)) {
          my_line = py.add(py.add(py.add(py.add(py.add(py.add(py.add(py.add(py.add(py.add(py.add(py.add(py.add(py.add("hf", py.str(history_fact_count)), " = datamodel.HistoryFactNote(\""), sentence_start), "\", \""), article), "\", \""), history_fact), "\", "), list_deps), ", \""), date), "\", \""), desc), "\", None)");
        } else {
          my_line = py.add(py.add(py.add(py.add(py.add(py.add(py.add(py.add(py.add(py.add(py.add(py.add(py.add(py.add(py.add(py.add("hf", py.str(history_fact_count)), " = datamodel.HistoryFactNote(\""), sentence_start), "\", \""), article), "\", \""), history_fact), "\", "), list_deps), ", \""), date), "\", \""), desc), "\", \""), desc2), "\")");
        }
        py.m(data, "append", my_line);
        py.m(data, "append", py.add(py.add("list_history_facts.append(hf", py.str(history_fact_count)), ")"));
        my_line = "";
        pos = 1;
      }
      line = py.m(file, "readline");
    }
    py.m(file, "close");
    file = py.open("test_nuevo.txt", "w");
    py.m(data, "append", "");
    py.m(data, "append", "return list_history_facts");
    for (d of py.iter(data)) {
      py.m(file, "write", py.add(d, "\n"));
    }
    file.close;
    return null;
  }
  load_locations(): any {
    let d, data, dep, desc, fields, file, full_name, line, loc_type, location, location_count, my_line, population, pos, sentence_start: any;
    full_name = "test.txt";
    file = py.open(full_name, "r");
    line = py.m(file, "readline");
    data = [];
    py.m(data, "append", "list_locations = []");
    py.m(data, "append", "");
    [location, dep, loc_type, sentence_start, population, desc] = ["", "", "", "", "", ""];
    location_count = 0;
    while ((line !== "")) {
      if ((line !== "\n")) {
        line = py.m(py.m(line, "rstrip", "\n"), "rstrip", "\r");
        fields = py.m(line, "split", "|");
        if ((py.len(fields) === 2)) {
          location = py.getitem(fields, 0);
          dep = py.getitem(fields, 1);
          pos = 1;
        } else if ((pos === 1)) {
          loc_type = py.getitem(fields, 0);
          pos = 2;
        } else if ((pos === 2)) {
          if ((loc_type === "Ciudad")) {
            sentence_start = "visitar la ciudad de";
          } else if ((loc_type === "Pueblo")) {
            sentence_start = "visitar el pueblo de";
          } else if ((loc_type === "Balneario")) {
            sentence_start = "visitar el balneario";
          } else if ((loc_type === "Poblaci\xf3n")) {
            sentence_start = "visitar la poblaci\xf3n de";
          } else if ((loc_type === "Centro poblado")) {
            sentence_start = "visitar el centro poblado de";
          } else if ((loc_type === "Villa")) {
            sentence_start = "visitar villa";
          } else if ((loc_type === "Fraccionamiento")) {
            sentence_start = "visitar el fraccionamiento de";
          }
          population = py.getitem(fields, 0);
          pos = 3;
        } else if ((pos === 3)) {
          desc = py.getitem(fields, 0);
        }
      } else {
        location_count = location_count + 1;
        my_line = py.add(py.add(py.add(py.add(py.add(py.add(py.add(py.add(py.add(py.add(py.add(py.add(py.add(py.add("loc", py.str(location_count)), " = datamodel.LocationNote(\""), location), "\", "), dep), ", \""), loc_type), "\", \""), sentence_start), "\", \""), population), "\", \""), desc), "\")");
        py.m(data, "append", my_line);
        py.m(data, "append", py.add(py.add("list_locations.append(loc", py.str(location_count)), ")"));
        my_line = "";
      }
      line = py.m(file, "readline");
    }
    py.m(file, "close");
    file = py.open("test_nuevo.txt", "w");
    py.m(data, "append", "");
    py.m(data, "append", "return list_locations");
    for (d of py.iter(data)) {
      py.m(file, "write", py.add(d, "\n"));
    }
    file.close;
    return null;
  }
  load_writers(): any {
    let d, data, dates, dep, desc, fields, file, full_name, line, my_line, pos, sex, writer, writer_count: any;
    full_name = "test.txt";
    file = py.open(full_name, "r");
    line = py.m(file, "readline");
    data = [];
    py.m(data, "append", "list_writers = []");
    py.m(data, "append", "");
    [writer, dep, dates, desc] = ["", "", "", ""];
    writer_count = 0;
    while ((line !== "")) {
      if ((line !== "\n")) {
        line = py.m(py.m(line, "rstrip", "\n"), "rstrip", "\r");
        fields = py.m(line, "split", "|");
        if ((py.len(fields) === 3)) {
          writer = py.getitem(fields, 0);
          sex = py.getitem(fields, 1);
          dep = py.getitem(fields, 2);
          pos = 1;
        } else if ((pos === 1)) {
          dates = py.getitem(fields, 0);
          pos = 2;
        } else if ((pos === 2)) {
          desc = py.getitem(fields, 0);
        }
      } else {
        writer_count = writer_count + 1;
        my_line = py.add(py.add(py.add(py.add(py.add(py.add(py.add(py.add(py.add(py.add(py.add(py.add("wr", py.str(writer_count)), " = datamodel.WriterNote(\""), writer), "\", "), sex), "\", "), dep), ", \""), dates), "\", \""), desc), "\")");
        py.m(data, "append", my_line);
        py.m(data, "append", py.add(py.add("list_writers.append(wr", py.str(writer_count)), ")"));
        my_line = "";
      }
      line = py.m(file, "readline");
    }
    py.m(file, "close");
    file = py.open("test_nuevo.txt", "w");
    py.m(data, "append", "");
    py.m(data, "append", "return list_writers");
    for (d of py.iter(data)) {
      py.m(file, "write", py.add(d, "\n"));
    }
    file.close;
    return null;
  }
  set_up_data(game: any): any {
    let department, note: any;
    this.game = game;
    this.list_departments = this.set_up_departments();
    this.list_animals = this.set_up_animals();
    this.list_sports = this.set_up_sports();
    this.list_stolen_objects = this.set_up_stolen_objects();
    this.list_crime_locations = this.set_up_crime_locations();
    this.list_thieves = this.set_up_thieves();
    content_extend.extend(this);
    this.list_lair_sets = this.set_up_lair_sets();
    this.list_witnesses = this.set_up_witness();
    this.list_statements = this.set_up_statements();
    this.list_identikit_statements = this.set_up_identikit_statements();
    this.list_janitor_statements = this.set_up_janitor_statements();
    this.list_clue_types = this.set_up_clue_types();
    this.list_clues = this.set_up_clues();
    this.list_rivers = this.set_up_rivers();
    this.list_lagoons = this.set_up_lagoons();
    this.list_hills = this.set_up_hills();
    this.list_history_facts = this.set_up_history_facts();
    this.list_locations = this.set_up_locations();
    this.list_writers = this.set_up_writers();
    this.notes_type_index = py.mkdict([["HISTORY_FACT", this.list_history_facts], ["RIVER", this.list_rivers], ["LAGOON", this.list_lagoons], ["HILL", this.list_hills], ["LOCATION", this.list_locations], ["WRITER", this.list_writers]]);
    this.department_type_index = collections.defaultdict((() => collections.defaultdict(py.list)));
    for (note of py.iter(py.add(py.add(py.add(py.add(py.add(this.list_history_facts, this.list_rivers), this.list_lagoons), this.list_hills), this.list_locations), this.list_writers))) {
      for (department of py.iter(note.get_departments())) {
        py.m(py.getitem(py.getitem(this.department_type_index, department.name), note.type), "append", note);
      }
    }
    this.load_characters();
    this.user_character = null;
    this.highscores = null;
    return null;
  }
  show_clue_messages(): any {
    let clue, clue_type, data, dep, dep_clues, dep_messages, depnames, description, location_messages, longest_message, message, messages, note_item, note_items, note_type, stageclue, valid_department: any;
    messages = [];
    longest_message = "";
    for (dep_clues of py.iter(py.m(this.department_type_index, "itervalues"))) {
      for ([note_type, note_items] of py.iter(py.m(dep_clues, "items"))) {
        for (note_item of py.iter(note_items)) {
          for (clue of py.iter(this.list_clues)) {
            clue_type = this.get_clue_type(note_type);
            if (py.contains(clue.list_types, clue_type)) {
              stageclue = new datamodel.StageClue(clue, note_item);
              message = stageclue.build_item_message();
              if ((py.len(message) > py.len(longest_message))) {
                longest_message = message;
              }
              py.m(messages, "append", [clue.id, note_type, message]);
            }
          }
        }
      }
    }
    py.m(messages, "sort");
    py.m(messages, "append", [py.add("Mensaje m\xe1s largo: ", longest_message)]);
    py.m(messages, "append", []);
    dep_messages = [];
    for (dep_clues of py.iter(py.m(this.department_type_index, "itervalues"))) {
      for ([note_type, note_items] of py.iter(py.m(dep_clues, "items"))) {
        for (note_item of py.iter(note_items)) {
          stageclue = new datamodel.StageClue(clue, note_item);
          message = stageclue.build_right_department_message(py.getitem(this.list_departments, 0));
          py.m(dep_messages, "append", [clue.id, note_type, message]);
        }
      }
    }
    py.m(dep_messages, "sort");
    messages = py.add(messages, dep_messages);
    py.m(messages, "append", []);
    location_messages = [];
    for (dep_clues of py.iter(py.m(this.department_type_index, "itervalues"))) {
      for ([note_type, note_items] of py.iter(py.m(dep_clues, "items"))) {
        for (note_item of py.iter(note_items)) {
          if (py.truthy(py.hasattr(note_item, "description"))) {
            data = [note_item.type, note_item.name, note_item.description];
            description = note_item.description;
          } else if ((note_item.description2 != null)) {
            data = [note_item.type, note_item.name, note_item.description1, note_item.description2];
            description = py.add(py.add(note_item.description1, " "), note_item.description2);
          } else {
            data = [note_item.type, note_item.name, note_item.description1];
            description = note_item.description1;
          }
          py.m(data, "append", "|");
          valid_department = false;
          if (py.truthy(py.hasattr(note_item, "department"))) {
            depnames = note_item.department.name;
            py.m(data, "append", depnames);
            if (py.contains(description, note_item.department.name)) {
              valid_department = true;
            }
          } else {
            depnames = "";
            for (dep of py.iter(note_item.list_departments)) {
              py.m(data, "append", dep.name);
              if (py.contains(description, dep.name)) {
                valid_department = true;
              }
              if ((depnames === "")) {
                depnames = dep.name;
              } else {
                depnames = py.add(depnames, py.add(", ", dep.name));
              }
            }
            if (!py.truthy(valid_department)) {
              throw new py.Exception(py.add(py.add(py.add("Invalid department associated (", depnames), ") with clue:\n"), py.str(data)));
            }
            py.m(location_messages, "append", data);
          }
        }
      }
    }
    py.m(location_messages, "sort");
    messages = py.add(messages, location_messages);
    assets.save_data("clues.txt", messages, ";", false);
    py.print("Clue messages saved!");
    return null;
  }
  load_characters(): any {
    let active_character, character, character_info, data, tb, type, value: any;
    data = assets.load_data("characters.dat", ";", false, undefined, true);
    this.characters = [];
    this.max_char_id = 0;
    active_character = null;
    if ((py.len(data) > 0)) {
      for (character of py.iter(data)) {
        if ((py.len(character) >= 2)) {
          try {
            character_info = new datamodel.CharacterInfo((py.getitem(character, 0) === "1"), py.int(py.getitem(character, 1)), this.decode_name(py.getitem(character, 2)), py.int(py.getitem(character, 3)), py.getitem(character, 4), py.getitem(character, 5), py.int(py.getitem(character, 6)));
            py.m(this.characters, "append", character_info);
            if (py.truthy(character_info.active)) {
              active_character = character_info;
            }
            if ((character_info.id > this.max_char_id)) {
              this.max_char_id = py.add(character_info.id, 1);
            }
          } catch ($e: any) {
            if (py.isExc($e, [py.Exception])) {
              py.print("Error reading characters");
              [type, value, tb] = sys.exc_info();
              stats.report_error(type, value, tb);
            }
            else throw $e;
          }
        }
      }
    }
    return active_character;
  }
  save_characters(): any {
    let active_str, character, characters_data: any;
    characters_data = [];
    for (character of py.iter(this.characters)) {
      if (py.truthy(character.active)) {
        active_str = "1";
      } else {
        active_str = "0";
      }
      py.m(characters_data, "append", [active_str, py.str(character.id), this.encode_name(character.name), py.str(character.avatar), character.sex, character.location, py.str(character.range_level)]);
    }
    assets.save_data("characters.dat", characters_data);
    return null;
  }
  encode_name(s: any): any {
    return py.m(py.m(s, "replace", "$", "$s"), "replace", ";", "$d");
  }
  decode_name(s: any): any {
    return py.m(py.m(s, "replace", "$d", ";"), "replace", "$s", "$");
  }
  create_character(name: any, is_male: any, avatar: any, location: any, set_active: any = true): any {
    let character, charinfo, id, sex: any;
    if (py.truthy(is_male)) {
      sex = "M";
    } else {
      sex = "F";
    }
    id = py.add(this.max_char_id, 1);
    this.max_char_id = id;
    charinfo = new datamodel.CharacterInfo(set_active, id, name, avatar, sex, location, 0);
    if (py.truthy(set_active)) {
      for (character of py.iter(this.characters)) {
        character.active = false;
      }
    }
    py.m(this.characters, "append", charinfo);
    serialization.delete_character(charinfo.id);
    this.save_characters();
    return charinfo;
  }
  load_character(charinfo: any): any {
    [this.user_character, this.user_character_progress, this.user_character_stage] = serialization.open_character(this, charinfo);
    return null;
  }
  delete_character(charinfo: any): any {
    py.m(this.characters, "remove", charinfo);
    this.save_characters();
    serialization.delete_character(charinfo.id);
    return null;
  }
  save_character(stage: any, check_save_in_development: any): any {
    serialization.save_character(this, this.user_character, this.user_character_progress, this.game, stage, check_save_in_development);
    this.game.stats.save_if_pending();
    return null;
  }
  get_highscores(): any {
    if ((this.highscores == null)) {
      this.load_highscores();
    }
    return this.highscores;
  }
  load_highscores(): any {
    let c_uuid, category, character, characters, data, k, line, name, score, tb, type, value: any;
    this.highscores = py.mkdict([]);
    this.highscores_pending_save = false;
    data = assets.load_data("highscores.dat", ";", false, undefined, true);
    if ((data != null)) {
      for (line of py.iter(data)) {
        try {
          category = py.getitem(line, 0);
          characters = [];
          k = 1;
          while ((k < py.len(line))) {
            name = this.decode_name(py.getitem(line, k));
            c_uuid = new uuid.UUID(py.getitem(line, py.add(k, 1)));
            score = py.int(py.getitem(line, py.add(k, 2)));
            character = new datamodel.HighscoreCharacter(name, c_uuid, score);
            py.m(characters, "append", character);
            k = k + 3;
          }
          py.setitem(this.highscores, category, characters);
        } catch ($e: any) {
          if (py.isExc($e, [py.Exception])) {
            py.print("Error reading highscores");
            [type, value, tb] = sys.exc_info();
            stats.report_error(type, value, tb);
          }
          else throw $e;
        }
      }
    }
    return null;
  }
  get_highscore_data(): any {
    let c, category, characters, data, highscores, line: any;
    highscores = this.get_highscores();
    data = [];
    for ([category, characters] of py.iter(py.m(highscores, "items"))) {
      line = [category];
      for (c of py.iter(characters)) {
        py.m(line, "append", this.encode_name(c.name));
        py.m(line, "append", py.str(c.uuid));
        py.m(line, "append", py.str(c.score));
      }
      py.m(data, "append", line);
    }
    return data;
  }
  save_highscores(): any {
    let data: any;
    if (((this.highscores != null) && py.truthy(this.highscores_pending_save))) {
      data = this.get_highscore_data();
      assets.save_data("highscores.dat", data);
      this.highscores_pending_save = false;
    }
    return null;
  }
  add_score(category: any, character: any, score: any): any {
    let characters, highscore_character, i, k, update_score: any;
    if ((this.highscores == null)) {
      this.highscores = py.mkdict([]);
    }
    highscore_character = new datamodel.HighscoreCharacter(character.charinfo.name, character.uuid, score);
    if (!py.contains(this.highscores, category)) {
      py.setitem(this.highscores, category, [highscore_character]);
      this.highscores_pending_save = true;
    } else {
      k = 0;
      characters = py.getitem(this.highscores, category);
      update_score = true;
      for (i of py.range(py.len(characters))) {
        if (py.eq(py.getitem(characters, i).uuid, character.uuid)) {
          if ((py.getitem(characters, i).score >= score)) {
            update_score = false;
          } else {
            py.delitem(characters, i);
          }
          break;
        }
      }
      if (py.truthy(update_score)) {
        k = 0;
        while ((k < py.len(characters))) {
          if ((py.getitem(characters, k).score < score)) {
            break;
          } else {
            k = k + 1;
          }
        }
        py.m(characters, "insert", k, highscore_character);
        if ((py.len(characters) > 10)) {
          py.delitem(characters, py.sl(10, null));
        }
        this.highscores_pending_save = true;
      }
    }
    return null;
  }
  update_score_name(character: any): any {
    let c, category, characters: any;
    if ((this.highscores != null)) {
      for ([category, characters] of py.iter(py.m(this.highscores, "items"))) {
        for (c of py.iter(characters)) {
          if (py.eq(c.uuid, character.uuid)) {
            c.name = character.charinfo.name;
            this.highscores_pending_save = true;
          }
        }
      }
    }
    return null;
  }
  set_up_departments(): any {
    let cities, d1, d10, d11, d12, d13, d14, d15, d16, d17, d18, d19, d2, d3, d4, d5, d6, d7, d8, d9, list_departments: any;
    list_departments = [];
    cities = [new datamodel.CityPin(152, 204, false, "Baltasar Brum", 2, 0, [125, 200]), new datamodel.CityPin(133, 113, false, "Tom\xe1s Gomensoro", 3, 1, [100, 109]), new datamodel.CityPin(90, 74, false, "Bella Uni\xf3n", 2, 0, [58, 69]), new datamodel.CityPin(359, 106, true, "Artigas", 1, 0, [348, 107])];
    d1 = new datamodel.Department(ARTIGAS, "artigas", [32, 27], [22, 10], cities, "medalla1", "field");
    py.m(list_departments, "append", d1);
    cities = [new datamodel.CityPin(89, 131, false, "Santa Luc\xeda", 2, 0, [68, 134]), new datamodel.CityPin(136, 158, false, "Canelones", 1, 0, [121, 162]), new datamodel.CityPin(155, 243, false, "Las Piedras", 2, 0, [134, 253]), new datamodel.CityPin(257, 248, true, "Pando", 1, 0, [240, 255])];
    d2 = new datamodel.Department(CANELONES, "canelones", [60, 26], [36, 54], cities, "medalla2", "beach");
    py.m(list_departments, "append", d2);
    cities = [new datamodel.CityPin(227, 199, false, "Fraile Muerto", 2, 0, [207, 207]), new datamodel.CityPin(321, 72, true, "Isidoro Nobl\xeda", 3, 1, [292, 72]), new datamodel.CityPin(311, 168, true, "Melo", 1, 0, [293, 175]), new datamodel.CityPin(464, 224, true, "R\xedo Branco", 2, 0, [431, 229])];
    d3 = new datamodel.Department(CERRO_LARGO, "cerrolargo", [84, 15], [46, 28], cities, "medalla3", "field");
    py.m(list_departments, "append", d3);
    cities = [new datamodel.CityPin(68, 106, false, "Carmelo", 1, 0, [49, 118]), new datamodel.CityPin(226, 294, false, "Colonia del Sacramento", 3, 2, [207, 296]), new datamodel.CityPin(359, 282, true, "Juan Lacaze", 2, 0, [331, 291]), new datamodel.CityPin(376, 77, true, "Florencio S\xe1nchez", 3, 1, [354, 61])];
    d4 = new datamodel.Department(COLONIA, "colonia", [35, 33], [18, 49], cities, "medalla4", "beach");
    py.m(list_departments, "append", d4);
    cities = [new datamodel.CityPin(158, 279, false, "Durazno", 1, 0, [152, 280]), new datamodel.CityPin(291, 234, true, "Carmen", 1, 0, [272, 245]), new datamodel.CityPin(364, 258, true, "Sarand\xed del Y\xed", 2, 0, [348, 272]), new datamodel.CityPin(382, 144, true, "Blanquillo", 2, 0, [352, 142])];
    d5 = new datamodel.Department(DURAZNO, "durazno", [27, 19], [31, 34], cities, "medalla5", "field");
    py.m(list_departments, "append", d5);
    cities = [new datamodel.CityPin(199, 17, false, "Andresito", 1, 0, [188, 22]), new datamodel.CityPin(225, 301, false, "Ismael Cortinas", 3, 1, [200, 308]), new datamodel.CityPin(330, 134, true, "Juan Jos\xe9 Castro", 3, 2, [301, 129]), new datamodel.CityPin(280, 148, true, "Trinidad", 1, 0, [263, 156])];
    d6 = new datamodel.Department(FLORES, "flores", [140, 12], [27, 42], cities, "medalla6", "field");
    py.m(list_departments, "append", d6);
    cities = [new datamodel.CityPin(167, 143, false, "Sarand\xed Grande", 2, 0, [139, 147]), new datamodel.CityPin(193, 240, false, "Florida", 1, 0, [176, 242]), new datamodel.CityPin(321, 226, true, "Casup\xe1", 1, 0, [301, 244]), new datamodel.CityPin(335, 155, true, "Cerro Colorado", 3, 1, [309, 170])];
    d7 = new datamodel.Department(FLORIDA, "florida", [132, 0], [34, 43], cities, "medalla7", "field");
    py.m(list_departments, "append", d7);
    cities = [new datamodel.CityPin(232, 34, false, "Jos\xe9 Batlle y Ord\xf3\xf1ez", 3, 2, [203, 30]), new datamodel.CityPin(215, 257, false, "Minas", 1, 0, [195, 272]), new datamodel.CityPin(155, 310, false, "Sol\xeds de Mataojo", 3, 2, [135, 306]), new datamodel.CityPin(348, 33, true, "Jos\xe9 Pedro Varela", 3, 2, [326, 25])];
    d8 = new datamodel.Department(LAVALLEJA, "lavalleja", [134, 9], [43, 44], cities, "medalla8", "field");
    py.m(list_departments, "append", d8);
    cities = [new datamodel.CityPin(177, 290, false, "Piri\xe1polis", 1, 0, [159, 307]), new datamodel.CityPin(232, 305, false, "Maldonado", 1, 0, [229, 304]), new datamodel.CityPin(278, 272, true, "San Carlos", 2, 0, [247, 270]), new datamodel.CityPin(288, 92, true, "Aigu\xe1", 1, 0, [285, 89])];
    d9 = new datamodel.Department(MALDONADO, "maldonado", [123, 11], [45, 51], cities, "medalla9", "beach");
    py.m(list_departments, "append", d9);
    cities = [new datamodel.CityPin(307, 282, false, "Centro", 1, 0, [299, 285], "el"), new datamodel.CityPin(220, 240, false, "Villa del Cerro", 3, 2, [199, 238], "la"), new datamodel.CityPin(377, 177, true, "Jardines del Hip\xf3dromo", 3, 2, [348, 177]), new datamodel.CityPin(453, 254, true, "Carrasco", 2, 0, [422, 261])];
    d10 = new datamodel.Department(MONTEVIDEO, "montevideo", [36, 12], [35, 58], cities, "medalla10", "beach");
    py.m(list_departments, "append", d10);
    cities = [new datamodel.CityPin(199, 252, false, "Piedras Coloradas", 3, 1, [175, 260]), new datamodel.CityPin(133, 147, false, "Quebracho", 1, 0, [121, 152]), new datamodel.CityPin(96, 249, false, "Paysand\xfa", 1, 0, [81, 258]), new datamodel.CityPin(291, 235, true, "Guich\xf3n", 1, 0, [270, 262])];
    d11 = new datamodel.Department(PAYSANDU, "paysandu", [76, 27], [19, 24], cities, "medalla11", "field");
    py.m(list_departments, "append", d11);
    cities = [new datamodel.CityPin(218, 127, false, "Young", 1, 0, [220, 127]), new datamodel.CityPin(127, 111, false, "San Javier", 1, 0, [105, 120]), new datamodel.CityPin(135, 196, false, "Nuevo Berl\xedn", 2, 0, [112, 205]), new datamodel.CityPin(81, 247, false, "Fray Bentos", 2, 0, [56, 248])];
    d12 = new datamodel.Department(RIO_NEGRO, "rionegro", [66, 35], [18, 34], cities, "medalla12", "field");
    py.m(list_departments, "append", d12);
    cities = [new datamodel.CityPin(140, 93, false, "Tranqueras", 2, 0, [121, 95]), new datamodel.CityPin(211, 184, false, "Minas de Corrales", 3, 2, [188, 186]), new datamodel.CityPin(187, 27, false, "Rivera", 1, 0, [187, 27]), new datamodel.CityPin(384, 239, true, "Vichadero", 1, 0, [372, 250])];
    d13 = new datamodel.Department(RIVERA, "rivera", [66, 12], [39, 17], cities, "medalla13", "field");
    py.m(list_departments, "append", d13);
    cities = [new datamodel.CityPin(232, 100, false, "Lascano", 1, 0, [222, 110]), new datamodel.CityPin(212, 258, false, "Rocha", 1, 0, [198, 271]), new datamodel.CityPin(304, 206, true, "Castillos", 1, 0, [281, 215]), new datamodel.CityPin(360, 109, true, "Chuy", 1, 0, [347, 116])];
    d14 = new datamodel.Department(ROCHA, "rocha", [183, 14], [53, 43], cities, "medalla14", "beach");
    py.m(list_departments, "append", d14);
    cities = [new datamodel.CityPin(104, 39, false, "Bel\xe9n", 1, 0, [98, 46]), new datamodel.CityPin(109, 114, false, "Constituci\xf3n", 2, 0, [71, 119]), new datamodel.CityPin(80, 194, false, "Salto", 1, 0, [67, 206]), new datamodel.CityPin(300, 110, true, "Pueblo Lavalleja", 3, 1, [262, 110])];
    d15 = new datamodel.Department(SALTO, "salto", [57, 36], [21, 17], cities, "medalla15", "field");
    py.m(list_departments, "append", d15);
    cities = [new datamodel.CityPin(185, 189, false, "Ecilda Paullier", 2, 0, [149, 184]), new datamodel.CityPin(273, 162, true, "San Jos\xe9 de Mayo", 3, 2, [246, 165]), new datamodel.CityPin(302, 268, true, "Libertad", 1, 0, [287, 276]), new datamodel.CityPin(374, 312, true, "Ciudad del Plata", 3, 1, [349, 314])];
    d16 = new datamodel.Department(SAN_JOSE, "sanjose", [157, 8], [30, 49], cities, "medalla16", "field");
    py.m(list_departments, "append", d16);
    cities = [new datamodel.CityPin(148, 182, false, "Dolores", 1, 0, [138, 192]), new datamodel.CityPin(190, 91, false, "Mercedes", 1, 0, [175, 95]), new datamodel.CityPin(328, 228, true, "Jos\xe9 Enrique Rod\xf3", 3, 2, [299, 231]), new datamodel.CityPin(374, 285, true, "Cardona", 1, 0, [359, 291])];
    d17 = new datamodel.Department(SORIANO, "soriano", [86, 14], [18, 41], cities, "medalla17", "field");
    py.m(list_departments, "append", d17);
    cities = [new datamodel.CityPin(149, 306, false, "Paso de los Toros", 3, 2, [123, 311]), new datamodel.CityPin(243, 114, false, "Tacuaremb\xf3", 2, 0, [214, 108]), new datamodel.CityPin(334, 131, true, "Ansina", 1, 0, [312, 135]), new datamodel.CityPin(262, 248, true, "San Gregorio de Polanco", 3, 2, [234, 253])];
    d18 = new datamodel.Department(TACUAREMBO, "tacuarembo", [132, 16], [33, 22], cities, "medalla18", "field");
    py.m(list_departments, "append", d18);
    cities = [new datamodel.CityPin(77, 116, false, "Santa Clara de Olimar", 3, 2, [55, 110]), new datamodel.CityPin(227, 220, false, "Treinta y Tres", 2, 0, [203, 225]), new datamodel.CityPin(348, 124, true, "Vergara", 1, 0, [337, 131]), new datamodel.CityPin(375, 207, true, "Gral. Enrique Mart\xednez", 3, 2, [360, 209])];
    d19 = new datamodel.Department(TREINTA_Y_TRES, "treintaytres", [29, 56], [47, 36], cities, "medalla19", "field");
    py.m(list_departments, "append", d19);
    return list_departments;
  }
  set_up_crime_locations(): any {
    let cl1, cl10, cl11, cl12, cl13, cl14, cl15, cl16, cl17, cl18, cl19, cl2, cl20, cl21, cl22, cl23, cl24, cl25, cl26, cl27, cl28, cl29, cl3, cl30, cl31, cl32, cl33, cl34, cl35, cl36, cl37, cl38, cl39, cl4, cl40, cl41, cl5, cl6, cl7, cl8, cl9, list_crime_locations: any;
    list_crime_locations = [];
    cl1 = new datamodel.CrimeLocation("el", "Museo Departamental", py.getitem(this.list_departments, 0), GENERICO, null);
    py.m(list_crime_locations, "append", cl1);
    cl2 = new datamodel.CrimeLocation("el", "Museo Hist\xf3rico Departamental \"Juan Spikerman\"", py.getitem(this.list_departments, 1), GENERICO, null);
    py.m(list_crime_locations, "append", cl2);
    cl3 = new datamodel.CrimeLocation("el", "Museo Arqueol\xf3gico \"Prof. Antonio Taddei\"", py.getitem(this.list_departments, 1), INDIGENA, FOSILES);
    py.m(list_crime_locations, "append", cl3);
    cl4 = new datamodel.CrimeLocation("el", "Museo General Aparicio Saravia", py.getitem(this.list_departments, 2), APARICIO_SARAVIA, null);
    py.m(list_crime_locations, "append", cl4);
    cl5 = new datamodel.CrimeLocation("el", "Museo Hist\xf3rico Regional", py.getitem(this.list_departments, 2), GENERICO, null);
    py.m(list_crime_locations, "append", cl5);
    cl6 = new datamodel.CrimeLocation("el", "Museo Municipal", py.getitem(this.list_departments, 3), GENERICO, null);
    py.m(list_crime_locations, "append", cl6);
    cl7 = new datamodel.CrimeLocation("el", "Museo del Ind\xedgena", py.getitem(this.list_departments, 3), INDIGENA, null);
    py.m(list_crime_locations, "append", cl7);
    cl8 = new datamodel.CrimeLocation("el", "Museo Paleontol\xf3gico y Arqueol\xf3gico", py.getitem(this.list_departments, 3), INDIGENA, FOSILES);
    py.m(list_crime_locations, "append", cl8);
    cl9 = new datamodel.CrimeLocation("el", "Museo del Gaucho", py.getitem(this.list_departments, 4), GAUCHO, null);
    py.m(list_crime_locations, "append", cl9);
    cl10 = new datamodel.CrimeLocation("el", "Museo Departamental", py.getitem(this.list_departments, 5), FOSILES, null);
    py.m(list_crime_locations, "append", cl10);
    cl11 = new datamodel.CrimeLocation("el", "Museo Cau Rusi\xf1ol", py.getitem(this.list_departments, 5), ARTE, null);
    py.m(list_crime_locations, "append", cl11);
    cl12 = new datamodel.CrimeLocation("el", "Museo Hist\xf3rico Municipal", py.getitem(this.list_departments, 6), GENERICO, null);
    py.m(list_crime_locations, "append", cl12);
    cl13 = new datamodel.CrimeLocation("el", "Museo Municipal del Gaucho", py.getitem(this.list_departments, 7), GAUCHO, null);
    py.m(list_crime_locations, "append", cl13);
    cl14 = new datamodel.CrimeLocation("el", "Museo Eduardo Fabini", py.getitem(this.list_departments, 7), FABINI, null);
    py.m(list_crime_locations, "append", cl14);
    cl15 = new datamodel.CrimeLocation("la", "Casa de la cultura", py.getitem(this.list_departments, 7), GENERICO, null);
    py.m(list_crime_locations, "append", cl15);
    cl16 = new datamodel.CrimeLocation("el", "Museo Did\xe1ctico Artiguista", py.getitem(this.list_departments, 8), ARMAS, null);
    py.m(list_crime_locations, "append", cl16);
    cl17 = new datamodel.CrimeLocation("el", "Museo Regional \"Francisco Mazzoni\"", py.getitem(this.list_departments, 8), GENERICO, null);
    py.m(list_crime_locations, "append", cl17);
    cl18 = new datamodel.CrimeLocation("el", "Museo del Gaucho y de la Moneda", py.getitem(this.list_departments, 9), GAUCHO, MONEDAS);
    py.m(list_crime_locations, "append", cl18);
    cl19 = new datamodel.CrimeLocation("el", "Museo Nacional de Artes Visuales", py.getitem(this.list_departments, 9), ARTE, null);
    py.m(list_crime_locations, "append", cl19);
    cl20 = new datamodel.CrimeLocation("el", "Museo Municipal de Bellas Artes \"Juan Manuel Blanes\"", py.getitem(this.list_departments, 9), BLANES, null);
    py.m(list_crime_locations, "append", cl20);
    cl21 = new datamodel.CrimeLocation("el", "Museo Torres Garc\xeda", py.getitem(this.list_departments, 9), TORRES_GARCIA, null);
    py.m(list_crime_locations, "append", cl21);
    cl22 = new datamodel.CrimeLocation("el", "Museo Municipal Precolombino y Colonial", py.getitem(this.list_departments, 9), INDIGENA, ARMAS);
    py.m(list_crime_locations, "append", cl22);
    cl23 = new datamodel.CrimeLocation("el", "Museo de Artes Pl\xe1sticas", py.getitem(this.list_departments, 10), ARTE, null);
    py.m(list_crime_locations, "append", cl23);
    cl24 = new datamodel.CrimeLocation("el", "Museo Hist\xf3rico Municipal", py.getitem(this.list_departments, 10), GENERICO, null);
    py.m(list_crime_locations, "append", cl24);
    cl25 = new datamodel.CrimeLocation("el", "Museo \"Luis A. Solari\"", py.getitem(this.list_departments, 11), SOLARI, null);
    py.m(list_crime_locations, "append", cl25);
    cl26 = new datamodel.CrimeLocation("el", "Museo Municipal de Historia y Arqueolog\xeda", py.getitem(this.list_departments, 12), GENERICO, null);
    py.m(list_crime_locations, "append", cl26);
    cl27 = new datamodel.CrimeLocation("el", "Museo Municipal de Artes Pl\xe1sticas", py.getitem(this.list_departments, 12), ARTE, null);
    py.m(list_crime_locations, "append", cl27);
    cl28 = new datamodel.CrimeLocation("el", "Museo Regional", py.getitem(this.list_departments, 13), MONEDAS, GENERICO);
    py.m(list_crime_locations, "append", cl28);
    cl29 = new datamodel.CrimeLocation("el", "Museo de la Fortaleza de Santa Teresa", py.getitem(this.list_departments, 13), ARMAS, null);
    py.m(list_crime_locations, "append", cl29);
    cl30 = new datamodel.CrimeLocation("el", "Museo del Fuerte San Miguel", py.getitem(this.list_departments, 13), ARMAS, null);
    py.m(list_crime_locations, "append", cl30);
    cl31 = new datamodel.CrimeLocation("el", "Museo Hist\xf3rico Municipal", py.getitem(this.list_departments, 14), GENERICO, null);
    py.m(list_crime_locations, "append", cl31);
    cl32 = new datamodel.CrimeLocation("el", "Museo del Hombre y la Tecnolog\xeda", py.getitem(this.list_departments, 14), GENERICO, null);
    py.m(list_crime_locations, "append", cl32);
    cl33 = new datamodel.CrimeLocation("el", "Museo Departamental", py.getitem(this.list_departments, 15), GENERICO, null);
    py.m(list_crime_locations, "append", cl33);
    cl34 = new datamodel.CrimeLocation("el", "Museo de Bellas Artes", py.getitem(this.list_departments, 15), ARTE, null);
    py.m(list_crime_locations, "append", cl34);
    cl35 = new datamodel.CrimeLocation("el", "Museo Santo Domingo", py.getitem(this.list_departments, 16), FOSILES, INDIGENA);
    py.m(list_crime_locations, "append", cl35);
    cl36 = new datamodel.CrimeLocation("la", "Biblioteca-Museo \"Eusebio Gim\xe9nez\"", py.getitem(this.list_departments, 16), EUSEBIO_GIMENEZ, null);
    py.m(list_crime_locations, "append", cl36);
    cl37 = new datamodel.CrimeLocation("el", "Museo Carlos Gardel", py.getitem(this.list_departments, 17), GARDEL, null);
    py.m(list_crime_locations, "append", cl37);
    cl38 = new datamodel.CrimeLocation("el", "Museo del Indio y del Gaucho \"Washington Escobar\"", py.getitem(this.list_departments, 17), INDIGENA, GAUCHO);
    py.m(list_crime_locations, "append", cl38);
    cl39 = new datamodel.CrimeLocation("el", "Museo Abierto de Artes Visuales", py.getitem(this.list_departments, 17), ARTE, null);
    py.m(list_crime_locations, "append", cl39);
    cl40 = new datamodel.CrimeLocation("el", "Museo Hist\xf3rico", py.getitem(this.list_departments, 18), GENERICO, null);
    py.m(list_crime_locations, "append", cl40);
    cl41 = new datamodel.CrimeLocation("el", "Museo Municipal de Bellas Artes \"Agust\xedn Araujo\"", py.getitem(this.list_departments, 18), ARTE, null);
    py.m(list_crime_locations, "append", cl41);
    return list_crime_locations;
  }
  set_up_rivers(): any {
    let list_rivers, r1, r10, r11, r12, r13, r14, r15, r16, r2, r3, r4, r5, r6, r7, r8, r9: any;
    list_rivers = [];
    r1 = new datamodel.RiverNote("R\xedo Arapey", [py.getitem(this.list_departments, 14)], "240 km", "11.410 km2", "Atraviesa todo el departamento de Salto y desemboca en el r\xedo Uruguay.", null);
    py.m(list_rivers, "append", r1);
    r2 = new datamodel.RiverNote("R\xedo Cebollat\xed", [py.getitem(this.list_departments, 7), py.getitem(this.list_departments, 13), py.getitem(this.list_departments, 18)], "240 km", "14.085 km2", "Corre de SO a NO", "Sirve de l\xedmite entre los departamentos de Rocha con Lavalleja y Treinta y Tres.");
    py.m(list_rivers, "append", r2);
    r3 = new datamodel.RiverNote("R\xedo Cuareim", [py.getitem(this.list_departments, 0)], "230 km", "13.390 km2", "Nace en Brasil y bordea el departamento de Artigas hasta que  desemboca en el r\xedo Uruguay.", null);
    py.m(list_rivers, "append", r3);
    r4 = new datamodel.RiverNote("R\xedo Daym\xe1n", [py.getitem(this.list_departments, 14), py.getitem(this.list_departments, 10)], "150 km", "3.183 km2", "Sirve de l\xedmite entre los departamentos de Salto y Paysand\xfa. Desemboca en el r\xedo Uruguay, cerca de all\xed se encuentran las termas del mismo nombre.", null);
    py.m(list_rivers, "append", r4);
    r5 = new datamodel.RiverNote("R\xedo Olimar", [py.getitem(this.list_departments, 18)], "155 km", "5.320 km2", "Nace en el departamento de Treinta y Tres y lo atraviesa de O a E para luego desembocar en el r\xedo Cebollat\xed.", null);
    py.m(list_rivers, "append", r5);
    r6 = new datamodel.RiverNote("R\xedo Queguay", [py.getitem(this.list_departments, 10)], "280 km", "7.866 km2", "Nace en el departamento de Paysand\xfa y desemboca en el r\xedo Uruguay.", null);
    py.m(list_rivers, "append", r6);
    r7 = new datamodel.RiverNote("R\xedo Rosario", [py.getitem(this.list_departments, 3)], "90 km", "1.745 km2", "Nace en el departamento de Colonia y lo atraviesa de N a S para luego desembocar en el R\xedo de la Plata.", null);
    py.m(list_rivers, "append", r7);
    r8 = new datamodel.RiverNote("R\xedo San Jos\xe9", [py.getitem(this.list_departments, 5), py.getitem(this.list_departments, 15)], "130 km", "3.543 km2", "Nace en el departamento de Flores atraviesa el departamento de San Jos\xe9 de NO a SE y desemboca en el r\xedo Santa Luc\xeda.", null);
    py.m(list_rivers, "append", r8);
    r9 = new datamodel.RiverNote("R\xedo San Juan", [py.getitem(this.list_departments, 3)], "80 km", "1.500 km2", "Nace en el departamento de Colonia, corre de NE a SO y desemboca en el R\xedo de la Plata.", null);
    py.m(list_rivers, "append", r9);
    r10 = new datamodel.RiverNote("R\xedo San Luis", [py.getitem(this.list_departments, 13)], "45 km", "2.360 km2", "Nace en el departamento de Rocha y desemboca en la laguna Mer\xedn.", null);
    py.m(list_rivers, "append", r10);
    r11 = new datamodel.RiverNote("R\xedo San Salvador", [py.getitem(this.list_departments, 16)], "135 km", "3.000 km2", "Nace en el departamento de Soriano y desemboca en el r\xedo Uruguay.", null);
    py.m(list_rivers, "append", r11);
    r12 = new datamodel.RiverNote("R\xedo Santa Luc\xeda", [py.getitem(this.list_departments, 7), py.getitem(this.list_departments, 6), py.getitem(this.list_departments, 1), py.getitem(this.list_departments, 15)], "230 km", "13.500 km2", "Nace en el departamento de Lavalleja, corre de E a O y es el l\xedmite de los departamentos de Florida y Canelones; al S, entre los departamentos de Canelones y San Jos\xe9; desemboca en un peque\xf1o delta, en el R\xedo de la Plata.", null);
    py.m(list_rivers, "append", r12);
    r13 = new datamodel.RiverNote("R\xedo Tacuaremb\xf3", [py.getitem(this.list_departments, 12), py.getitem(this.list_departments, 17)], "250 km", "14.000 km2", "Nace en el departamento de Rivera y corre de N a S, atraviesa el departamento de Tacuaremb\xf3 y desemboca en el r\xedo Negro.", null);
    py.m(list_rivers, "append", r13);
    r14 = new datamodel.RiverNote("R\xedo Tacuar\xed", [py.getitem(this.list_departments, 2), py.getitem(this.list_departments, 18)], "195 km", "3.600 km2", "Nace en el departamento de Cerro Largo, recorre el territorio de NO a SE hasta el l\xedmite con Treinta y Tres donde desemboca en la laguna Mer\xedn.", null);
    py.m(list_rivers, "append", r14);
    r15 = new datamodel.RiverNote("R\xedo Yaguar\xf3n", [py.getitem(this.list_departments, 2)], "225 km", "3.000 km2", "Nace al S del Brasil y es uno de los l\xedmites entre este pa\xeds y el nuestro. Desemboca en la laguna Mer\xedn luego de bordear el departamento de Cerro Largo.", null);
    py.m(list_rivers, "append", r15);
    r16 = new datamodel.RiverNote("R\xedo Y\xed", [py.getitem(this.list_departments, 18), py.getitem(this.list_departments, 4), py.getitem(this.list_departments, 6), py.getitem(this.list_departments, 5)], "225 km", "12.600 km2", "Nace en el l\xedmite entre Treinta y Tres, Florida y Durazno. Es el l\xedmite entre Florida y Durazno, y entre este \xfaltimo y Flores, hasta desembocar en el R\xedo Negro.", null);
    py.m(list_rivers, "append", r16);
    return list_rivers;
  }
  set_up_lagoons(): any {
    let l1, l2, l3, l4, l5, l6, l7, list_lagoons: any;
    list_lagoons = [];
    l1 = new datamodel.LagoonNote("Laguna de Castillos", [py.getitem(this.list_departments, 13)], "100 km2", "Ubicada en el departamento de Rocha.", "Se comunica con el oc\xe9ano Atl\xe1ntico a trav\xe9s del arroyo Valizas.");
    py.m(list_lagoons, "append", l1);
    l2 = new datamodel.LagoonNote("Laguna de Rocha", [py.getitem(this.list_departments, 13)], "72 km2", "Ubicada en el departamento de Rocha, cerca de la ciudad de La Paloma.", null);
    py.m(list_lagoons, "append", l2);
    l3 = new datamodel.LagoonNote("Laguna del Sauce", [py.getitem(this.list_departments, 8)], "70 km2", "Ubicada en el departamento de Maldonado.", "Se conecta con el R\xedo de la Plata a trav\xe9s del arroyo El Potrero.");
    py.m(list_lagoons, "append", l3);
    l4 = new datamodel.LagoonNote("Laguna Garz\xf3n", [py.getitem(this.list_departments, 8), py.getitem(this.list_departments, 13)], "35 km2", "Es el l\xedmite entre los departamentos de Maldonado y Rocha. Vierte sus aguas en el Oc\xe9ano Atl\xe1ntico.", null);
    py.m(list_lagoons, "append", l4);
    l5 = new datamodel.LagoonNote("Laguna Jos\xe9 Ignacio", [py.getitem(this.list_departments, 8)], "35 km2", "Ubicada en el departamento de Maldonado. Desemboca sobre el oc\xe9ano Atl\xe1ntico.", null);
    py.m(list_lagoons, "append", l5);
    l6 = new datamodel.LagoonNote("Laguna Mer\xedn", [py.getitem(this.list_departments, 13), py.getitem(this.list_departments, 18), py.getitem(this.list_departments, 2)], "3.750 km2", "Ubicada en el l\xedmite E de los departamentos de Rocha, Treinta y Tres y Cerro Largo.", "Est\xe1 unida a la Laguna de los Patos, perteneciente a Brasil, a trav\xe9s del r\xedo San Gonzalo.");
    py.m(list_lagoons, "append", l6);
    l7 = new datamodel.LagoonNote("Laguna Negra", [py.getitem(this.list_departments, 13)], "180 km2", "Ubicada en el departamento de Rocha.", "Es tambi\xe9n conocida como Laguna de los Difuntos.");
    py.m(list_lagoons, "append", l7);
    return list_lagoons;
  }
  set_up_hills(): any {
    let h1, h10, h11, h12, h13, h14, h15, h16, h17, h18, h19, h2, h20, h21, h3, h4, h5, h6, h7, h8, h9, list_hills: any;
    list_hills = [];
    h1 = new datamodel.HillNote("Cerro Tupamba\xe9", "el", py.getitem(this.list_departments, 2), "470 metros", "Se encuentra en la Sierra de las Ruinas, departamento de Cerro Largo.", null);
    py.m(list_hills, "append", h1);
    h2 = new datamodel.HillNote("Cerros de Ojosm\xedn", "los", py.getitem(this.list_departments, 5), "209 metros", "Se encuentran en la Cuchilla Grande, al O del departamento de Flores.", null);
    py.m(list_hills, "append", h2);
    h3 = new datamodel.HillNote("Cerro Arequita", "el", py.getitem(this.list_departments, 7), "305 metros", "Ubicado en las cercan\xedas de la ciudad de Minas, departamento de Lavalleja, junto a \xe9l corre el r\xedo Santa Luc\xeda.", null);
    py.m(list_hills, "append", h3);
    h4 = new datamodel.HillNote("Cerro Artigas", "el", py.getitem(this.list_departments, 7), "215 metros", "Ubicado en la ciudad de Minas, departamento de Lavalleja.", "En su cima hay una escultura dedicada a nuestro pr\xf3cer Jos\xe9 Artigas.");
    py.m(list_hills, "append", h4);
    h5 = new datamodel.HillNote("Cerro del Verd\xfan", "el", py.getitem(this.list_departments, 7), "325 metros", "Ubicado en las cercan\xedas de la ciudad de Minas, departamento de Lavalleja.", "El 19 de abril miles de peregrinos llegan al santuario de la Virgen del Verd\xfan que se encuentra en su cima.");
    py.m(list_hills, "append", h5);
    h6 = new datamodel.HillNote("Cerro Penitente", "el", py.getitem(this.list_departments, 7), "357 metros", "Ubicado en las cercan\xedas de la ciudad de Minas, departamento de Lavalleja.", "Aqu\xed nace el arroyo que forma la cascada llamada Salto del Penitente, que tiene 60 metros de altura.");
    py.m(list_hills, "append", h6);
    h7 = new datamodel.HillNote("Cerro Baltasar", "el", py.getitem(this.list_departments, 8), "329 metros", "Ubicado en el departamento de Maldonado. Es un cerro de piedra desnuda que parece haber sido tallado con un cincel.", null);
    py.m(list_hills, "append", h7);
    h8 = new datamodel.HillNote("Cerro Catedral", "el", py.getitem(this.list_departments, 8), "513 metros", "Ubicado en Aigu\xe1, departamento de Maldonado, su nombre se debe a su gran tama\xf1o.", "Es el cerro m\xe1s alto del pa\xeds.");
    py.m(list_hills, "append", h8);
    h9 = new datamodel.HillNote("Cerro de los Burros", "el", py.getitem(this.list_departments, 8), "171 metros", "Tambi\xe9n conocido como Cerro de la Virgen. Se encuentra frente a playa Hermosa, departamento de Maldonado.", "Est\xe1 cubierto por una vegetaci\xf3n abundante y es todo un desaf\xedo encontrar el camino hacia la cima.");
    py.m(list_hills, "append", h9);
    h10 = new datamodel.HillNote("Cerro del Toro", "el", py.getitem(this.list_departments, 8), "195 metros", "Ubicado en Piri\xe1polis, departamento de Maldonado.", "En su ladera se encuentra la famosa Fuente del Toro que Francisco Piria hizo traer especialmente de Par\xeds. Es la escultura de un toro de tama\xf1o natural y por su boca brota una chorro de agua mineral.");
    py.m(list_hills, "append", h10);
    h11 = new datamodel.HillNote("Cerro Pan de Az\xfacar", "el", py.getitem(this.list_departments, 8), "389 metros", "Ubicado en el departamento de Maldonado.", "En su cumbre hay una cruz de 35 metros de altura, a la que se puede subir para disfrutar del panorama. A sus pies se encuentra la reserva de fauna aut\xf3ctona.");
    py.m(list_hills, "append", h11);
    h12 = new datamodel.HillNote("Cerro San Antonio", "el", py.getitem(this.list_departments, 8), "130 metros", "Tambi\xe9n llamado Cerro del Ingl\xe9s. Se encuentra en Piri\xe1polis, departamento de Maldonado.", "Se puede acceder a la cima en un sistema de aerosillas. All\xed se encuentra el templo de San Antonio, cuya imagen tallada en terracota fue tra\xedda desde Mil\xe1n.");
    py.m(list_hills, "append", h12);
    h13 = new datamodel.HillNote("Cerro de las \xc1nimas", "el", py.getitem(this.list_departments, 8), "501 metros", "Situado en la Sierra de las \xc1nimas, que a su vez forma parte de la Cuchilla Grande, departamento de Maldonado.", "Es el segundo cerro m\xe1s alto del pa\xeds.");
    py.m(list_hills, "append", h13);
    h14 = new datamodel.HillNote("Cerro de Montevideo", "el", py.getitem(this.list_departments, 9), "134 metros", "Situado en la ciudad de Montevideo.", "Tiene un faro que funciona con el mecanismo original, de principios de siglo.");
    py.m(list_hills, "append", h14);
    h15 = new datamodel.HillNote("Cerro Bonito", "el", py.getitem(this.list_departments, 12), "351 metros", "Ubicado en el valle del Lunarejo, departamento de Rivera.", null);
    py.m(list_hills, "append", h15);
    h16 = new datamodel.HillNote("Cerro de los Chivos", "el", py.getitem(this.list_departments, 12), "284 metros", "Ubicado en el departamento de Rivera.", "Pertenece al grupo de cerros chatos denominado Tres Cerros del Cu\xf1apir\xfa.");
    py.m(list_hills, "append", h16);
    h17 = new datamodel.HillNote("Cerro del Medio", "el", py.getitem(this.list_departments, 12), "221 metros", "Ubicado en el departamento de Rivera.", "Pertenece al grupo de cerros chatos llamado Tres Cerros del Cu\xf1apir\xfa.");
    py.m(list_hills, "append", h17);
    h18 = new datamodel.HillNote("Cerro Lunarejo", "el", py.getitem(this.list_departments, 12), "332 metros", "Ubicado entre las localidades de Tranqueras y Masoller, departamento de Rivera, en el valle del arroyo del mismo nombre.", "Se encuentra cubierto por una vegetaci\xf3n abundante.");
    py.m(list_hills, "append", h18);
    h19 = new datamodel.HillNote("Cerro Miri\xf1aque", "el", py.getitem(this.list_departments, 12), "282 metros", "Ubicado en el departamento de Rivera.", "Pertenece al grupo de cerros chatos llamado Tres Cerros de Cu\xf1apir\xfa.");
    py.m(list_hills, "append", h19);
    h20 = new datamodel.HillNote("Cerro Batov\xed", "el", py.getitem(this.list_departments, 17), "224 metros", "Ubicado a 25 kil\xf3metros de la ciudad de Tacuaremb\xf3, capital del departamento.", "Su nombre en guaran\xed significa \"seno de virgen\" y es el emblema del departamento.");
    py.m(list_hills, "append", h20);
    h21 = new datamodel.HillNote("Cerro Cementerio", "el", py.getitem(this.list_departments, 17), "255 metros", "Ubicado en las proximidades del Valle Ed\xe9n, departamento de Tacuaremb\xf3.", "Se trata de un enorme pe\xf1asco que tiene un gran valor arqueol\xf3gico por contar con un cementerio ind\xedgena, con sus tumbas, veredas y escalones.");
    py.m(list_hills, "append", h21);
    return list_hills;
  }
  set_up_history_facts(): any {
    let hf1, hf10, hf11, hf12, hf13, hf14, hf15, hf16, hf17, hf18, hf2, hf3, hf4, hf5, hf6, hf7, hf8, hf9, list_history_facts: any;
    list_history_facts = [];
    hf1 = new datamodel.HistoryFactNote("tuvo lugar", "el", "Grito de Asencio", [py.getitem(this.list_departments, 16)], "27 de febrero de 1811", "Tuvo lugar cerca del arroyo Asencio, actual departamento de Soriano.", "Desde all\xed, un grupo de revolucionarios orientales condujeron las primeras acciones de la Revoluci\xf3n oriental.");
    py.m(list_history_facts, "append", hf1);
    hf2 = new datamodel.HistoryFactNote("tuvo lugar", "el", "Desembarco de los 33 Orientales", [py.getitem(this.list_departments, 16)], "19 de abril de 1825", "Tuvo lugar en la playa de la Agraciada, departamento de Soriano.", "Desde all\xed comenz\xf3 la Cruzada Libertadora.");
    py.m(list_history_facts, "append", hf2);
    hf3 = new datamodel.HistoryFactNote("tuvo lugar", "la", "Declaratoria de la independencia", [py.getitem(this.list_departments, 6)], "18 de julio de 1825", "Tuvo lugar en el paraje conocido como Piedra Alta, en las cercan\xedas de la ciudad de Florida.", "En este acto se declar\xf3 la independencia de la Provincia Oriental con respecto al Brasil, se estableci\xf3 su pabell\xf3n y se dictamin\xf3 su uni\xf3n a las Provincias Unidas del R\xedo de la Plata.");
    py.m(list_history_facts, "append", hf3);
    hf4 = new datamodel.HistoryFactNote("comenz\xf3", "el", "\xc9xodo del Pueblo Oriental", [py.getitem(this.list_departments, 15)], "23 de octubre de 1811", "Se denomina \xe9xodo del Pueblo Oriental a la emigraci\xf3n colectiva de casi la totalidad de las poblaciones criollas de la Banda Oriental. Siguieron a Jos\xe9 G. Artigas cuando se retir\xf3, al levantarse el Sitio de Montevideo.", "Partieron desde las cercan\xedas del arroyo San Jos\xe9.");
    py.m(list_history_facts, "append", hf4);
    hf5 = new datamodel.HistoryFactNote("tuvo lugar", "la", "Jura de la Constituci\xf3n", [py.getitem(this.list_departments, 9)], "18 de julio de 1830", "Fue la primera Constituci\xf3n uruguaya y estaba basada en las Constituciones de Francia, Estados Unidos, Argentina, Brasil, Chile y Espa\xf1a.", "El acto se desarroll\xf3 en el edificio del Cabildo, frente a la Plaza Matriz de Montevideo");
    py.m(list_history_facts, "append", hf5);
    hf6 = new datamodel.HistoryFactNote("se redactaron", "Las", "Instrucciones del A\xf1o XIII", [py.getitem(this.list_departments, 9)], "13 de abril de 1813", "Son las Instrucciones que llevaron los representantes de la Provincia Oriental, aprobadas en el Congreso de Tres Cruces, a la Asamblea Constituyente en Buenos Aires. En ellas se establecieron las normas que regir\xedan a la Provincia una vez conquistada la independencia.", "La redacci\xf3n se llev\xf3 a cabo en la quinta de Manuel Sainz de Cavia, en Montevideo, en la actual intersecci\xf3n de las calles avenida Italia y Morales.");
    py.m(list_history_facts, "append", hf6);
    hf7 = new datamodel.HistoryFactNote("tuvo lugar", "la", "Batalla de Arbolito", [py.getitem(this.list_departments, 2)], "28 de febrero de 1897", "Fue un enfrentamiento entre el ej\xe9rcito colorado, al mando del general Justino Muniz, y las fuerzas revolucionarias blancas, al mando de Aparicio Saravia.", "Tuvo lugar en la cuchilla de Arbolito, en el departamento de Cerro Largo.");
    py.m(list_history_facts, "append", hf7);
    hf8 = new datamodel.HistoryFactNote("tuvo lugar", "la", "Batalla de Arroyo Grande", [py.getitem(this.list_departments, 16), py.getitem(this.list_departments, 5)], "6 de diciembre de 1842", "Fue uno de los enfrentamientos que se produjeron durante la Guerra Grande, entre el ej\xe9rcito de la Confederaci\xf3n, al mando del general Manuel Oribe, y las fuerzas del Gobierno de Montevideo, al mando del general Fructuoso Rivera.", "Tuvo lugar en los m\xe1rgenes de dicho arroyo, afluente del r\xedo Negro, que conforma el l\xedmite de los Departamentos de Soriano y Flores.");
    py.m(list_history_facts, "append", hf8);
    hf9 = new datamodel.HistoryFactNote("tuvo lugar", "la", "Batalla de Cagancha", [py.getitem(this.list_departments, 15)], "29 de diciembre de 1839", "Fue uno de los enfrentamientos que se produjeron durante la Guerra Grande, entre el ej\xe9rcito de la Confederaci\xf3n, al mando del general Pascual Echag\xfce, y las fuerzas del Gobierno de Montevideo, al mando del general Fructuoso Rivera.", "Tuvo lugar cerca del arroyo de Cagancha, en el Departamento de San Jos\xe9.");
    py.m(list_history_facts, "append", hf9);
    hf10 = new datamodel.HistoryFactNote("tuvo lugar", "la", "Batalla de Cardal", [py.getitem(this.list_departments, 9)], "20 de enero de 1807", "Enfrentamiento entre las fuerzas defensoras de la ciudad de Montevideo y los soldados de la Armada inglesa, durante las Invasiones inglesas.", null);
    py.m(list_history_facts, "append", hf10);
    hf11 = new datamodel.HistoryFactNote("tuvo lugar", "la", "Batalla de Carpinter\xeda", [py.getitem(this.list_departments, 4)], "19 de setiembre de 1836", "Enfrentamiento entre el ej\xe9rcito del Gobierno, al mando de general Manuel Oribe, y las fuerzas revolucionarias, dirigidas por el general Fructuoso Rivera. En esta batalla nacieron las divisas blanca y colorada.", "Tuvo lugar en las cercan\xedas del arroyo Carpinter\xeda, en el Departamento de Durazno.");
    py.m(list_history_facts, "append", hf11);
    hf12 = new datamodel.HistoryFactNote("tuvo lugar", "la", "Batalla de Cerrito", [py.getitem(this.list_departments, 9)], "31 de diciembre de 1812", "Combate entre las fuerzas revolucionarias que sitiaban Montevideo, bajo las \xf3rdenes del general Jos\xe9 Rondeau, y las tropas espa\xf1olas al mando del mariscal Vigodet.", null);
    py.m(list_history_facts, "append", hf12);
    hf13 = new datamodel.HistoryFactNote("tuvo lugar", "la", "Batalla de Guayabo", [py.getitem(this.list_departments, 14)], "10 de enero de 1815", "Enfrentamiento entre el ej\xe9rcito de Buenos Aires, al mando del coronel Manuel Dorrego, y las fuerzas revolucionarias orientales, comandadas por el general Fructuoso Rivera.", "Tuvo lugar en las cercan\xedas del arroyo del mismo nombre, en el SE del departamento de Salto");
    py.m(list_history_facts, "append", hf13);
    hf14 = new datamodel.HistoryFactNote("tuvo lugar", "la", "Batalla de India Muerta", [py.getitem(this.list_departments, 13)], "27 de marzo de 1845", "Librada durante la Guerra Grande, entre el ej\xe9rcito sitiador de Montevideo, al mando del general Manuel Oribe, y las fuerzas del ej\xe9rcito de la Defensa, al mando del general Fructuoso Rivera.", "Tuvo lugar en las costas del arroyo del mismo nombre, situado en el departamento de Rocha.");
    py.m(list_history_facts, "append", hf14);
    hf15 = new datamodel.HistoryFactNote("tuvo lugar", "la", "Batalla de Las Piedras", [py.getitem(this.list_departments, 1)], "18 de mayo de 1811", "Enfrentamiento entre las tropas espa\xf1olas y las fuerzas revolucionarias al mando del general Jos\xe9 Gervasio Artigas.", "Tuvo lugar en las cercan\xedas de lo que hoy es la ciudad de Las Piedras, en el departatmento de Canelones");
    py.m(list_history_facts, "append", hf15);
    hf16 = new datamodel.HistoryFactNote("tuvo lugar", "la", "Batalla de Palmar", [py.getitem(this.list_departments, 11)], "15 de junio de 1838", "Librada entre las tropas del ej\xe9rcito del Gobierno de la Rep\xfablica, al mando del general Manuel Oribe, y las fuerzas revolucionarias, dirigidas por el general Fructuoso Rivera.", "Tuvo lugar al norte del departamento de R\xedo Negro, en una regi\xf3n as\xed denominada por la abundancia de altas palmeras.");
    py.m(list_history_facts, "append", hf16);
    hf17 = new datamodel.HistoryFactNote("tuvo lugar", "la", "Batalla de Rinc\xf3n", [py.getitem(this.list_departments, 11)], "24 de diciembre de 1825", "Enfrentamiento entre el ej\xe9rcito imperial brasile\xf1o, al mando de los coroneles Mena Barreto y Jardim, y las tropas de la Cruzada Libertadora, comandadas por el general Fructuoso Rivera.", "Tuvo lugar en un \xe1rea conocida como \"Rinc\xf3n de Haedo\", encerrada por la confluencia de los r\xedos Uruguay y Negro, en el actual departamento de R\xedo Negro.");
    py.m(list_history_facts, "append", hf17);
    hf18 = new datamodel.HistoryFactNote("tuvo lugar", "la", "Batalla de Sarand\xed", [py.getitem(this.list_departments, 6)], "12 de octubre de 1825", "Librada entre las tropas brasile\xf1as y las tropas de la Cruzada Libertadora al mando de los generales Juan Antonio Lavalleja, Manuel Oribe y Fructuoso Rivera.", "Tuvo lugar en las costas del Arroyo Sarand\xed, afluente del r\xedo Yi, en el Departamento de Florida.");
    py.m(list_history_facts, "append", hf18);
    return list_history_facts;
  }
  set_up_locations(): any {
    let list_locations, loc1, loc10, loc100, loc101, loc102, loc103, loc104, loc105, loc106, loc107, loc108, loc109, loc11, loc110, loc111, loc112, loc113, loc114, loc115, loc116, loc117, loc118, loc119, loc12, loc120, loc121, loc122, loc123, loc124, loc13, loc14, loc15, loc16, loc17, loc18, loc19, loc2, loc20, loc21, loc22, loc23, loc24, loc25, loc26, loc27, loc28, loc29, loc3, loc30, loc31, loc32, loc33, loc34, loc35, loc36, loc37, loc38, loc39, loc4, loc40, loc41, loc42, loc43, loc44, loc45, loc46, loc47, loc48, loc49, loc5, loc50, loc51, loc52, loc53, loc54, loc55, loc56, loc57, loc58, loc59, loc6, loc60, loc61, loc62, loc63, loc64, loc65, loc66, loc67, loc68, loc69, loc7, loc70, loc71, loc72, loc73, loc74, loc75, loc76, loc77, loc78, loc79, loc8, loc80, loc81, loc82, loc83, loc84, loc85, loc86, loc87, loc88, loc89, loc9, loc90, loc91, loc92, loc93, loc94, loc95, loc96, loc97, loc98, loc99: any;
    list_locations = [];
    loc1 = new datamodel.LocationNote("Baltasar Brum", py.getitem(this.list_departments, 0), "Pueblo", "visitar el pueblo de", "2.472 hab.", "Pueblo situado en el SO del departamento de Artigas.");
    py.m(list_locations, "append", loc1);
    loc2 = new datamodel.LocationNote("Bella Uni\xf3n", py.getitem(this.list_departments, 0), "Ciudad", "visitar la ciudad de", "13.187 hab.", "Ciudad situada en el NO del departamento de Artigas.");
    py.m(list_locations, "append", loc2);
    loc3 = new datamodel.LocationNote("Las Piedras", py.getitem(this.list_departments, 0), "Centro poblado", "visitar el centro poblado de", "2.164 hab.", "Centro poblado situado en el NO del departamento de Artigas.", "centro poblado");
    py.m(list_locations, "append", loc3);
    loc4 = new datamodel.LocationNote("Pintadito", py.getitem(this.list_departments, 0), "Centro poblado", "visitar el centro poblado de", "1.487 hab.", "Centro poblado situado en el NE del departamento de Artigas.");
    py.m(list_locations, "append", loc4);
    loc5 = new datamodel.LocationNote("Tom\xe1s Gomensoro", py.getitem(this.list_departments, 0), "Pueblo", "visitar el pueblo de", "2.818 hab.", "Pueblo situado en el NO del departamento de Artigas.");
    py.m(list_locations, "append", loc5);
    loc6 = new datamodel.LocationNote("Aguas Corrientes", py.getitem(this.list_departments, 1), "Pueblo", "visitar el pueblo de", "1.095 hab.", "Pueblo situado en el O del departamento de Canelones.");
    py.m(list_locations, "append", loc6);
    loc7 = new datamodel.LocationNote("Atl\xe1ntida", py.getitem(this.list_departments, 1), "Ciudad", "visitar la ciudad de", "4.580 hab.", "Ciudad situada en el S del departamento de Canelones.");
    py.m(list_locations, "append", loc7);
    loc8 = new datamodel.LocationNote("Los Cerrillos", py.getitem(this.list_departments, 1), "Villa", "visitar villa", "2.080 hab.", "Villa situada en el O del departamento de Canelones.");
    py.m(list_locations, "append", loc8);
    loc9 = new datamodel.LocationNote("Ciudad de la Costa", py.getitem(this.list_departments, 1), "Ciudad", "visitar la ciudad de", "66.402 hab.", "Ciudad situada en el SO del departamento de Canelones, integrada por las localidades de San Jos\xe9 de Carrasco, Barra de Carrasco, Parque Carrasco, Solymar, Lomas de Solymar, Colinas de Solymar, El Pinar, Lagomar, Shangril\xe1 y El Bosque.");
    py.m(list_locations, "append", loc9);
    loc10 = new datamodel.LocationNote("Colonia Nicolich", py.getitem(this.list_departments, 1), "Centro poblado", "visitar el centro poblado de", "8,811 hab.", "Centro poblado situado en el SO del departamento de Canelones.");
    py.m(list_locations, "append", loc10);
    loc11 = new datamodel.LocationNote("Empalme Olmos", py.getitem(this.list_departments, 1), "Pueblo", "visitar el pueblo de", "3.978 hab.", "Pueblo situado en el S del departamento de Canelones.");
    py.m(list_locations, "append", loc11);
    loc12 = new datamodel.LocationNote("Joaqu\xedn Su\xe1rez", py.getitem(this.list_departments, 1), "Ciudad", "visitar la ciudad de", "6.124 hab.", "Ciudad situada en el SO del departamento de Canelones.");
    py.m(list_locations, "append", loc12);
    loc13 = new datamodel.LocationNote("La Paz", py.getitem(this.list_departments, 1), "Ciudad", "visitar la ciudad de", "19.832 hab.", "Ciudad situada en el SO del departamento de Canelones.");
    py.m(list_locations, "append", loc13);
    loc14 = new datamodel.LocationNote("Las Piedras", py.getitem(this.list_departments, 1), "Ciudad", "visitar la ciudad de", "69.222 hab.", "Ciudad situada en el SO del departamento de Canelones.", "ciudad");
    py.m(list_locations, "append", loc14);
    loc15 = new datamodel.LocationNote("Migues", py.getitem(this.list_departments, 1), "Villa", "visitar villa", "2.180 hab.", "Villa situada en el E del departamento de Canelones.");
    py.m(list_locations, "append", loc15);
    loc16 = new datamodel.LocationNote("Montes", py.getitem(this.list_departments, 1), "Pueblo", "visitar el pueblo de", "1.713 hab.", "Pueblo situado en el E del departamento de Canelones.");
    py.m(list_locations, "append", loc16);
    loc17 = new datamodel.LocationNote("Pando", py.getitem(this.list_departments, 1), "Ciudad", "visitar la ciudad de", "24.004 hab.", "Ciudad situada en el SO del departamento de Canelones.");
    py.m(list_locations, "append", loc17);
    loc18 = new datamodel.LocationNote("Parque del Plata", py.getitem(this.list_departments, 1), "Ciudad", "visitar la ciudad de", "5.900 hab.", "Ciudad situada en el S del departamento de Canelones.");
    py.m(list_locations, "append", loc18);
    loc19 = new datamodel.LocationNote("Paso de Carrasco", py.getitem(this.list_departments, 1), "Pueblo", "visitar el pueblo de", "15.028 hab.", "Pueblo situado en el SO del departamento de Canelones.");
    py.m(list_locations, "append", loc19);
    loc20 = new datamodel.LocationNote("Progreso", py.getitem(this.list_departments, 1), "Ciudad", "visitar la ciudad de", "15.775 hab.", "Ciudad situada en el SO del departamento de Canelones.");
    py.m(list_locations, "append", loc20);
    loc21 = new datamodel.LocationNote("Salinas", py.getitem(this.list_departments, 1), "Ciudad", "visitar la ciudad de", "6.574 hab.", "Ciudad situada en el S del departamento de Canelones.");
    py.m(list_locations, "append", loc21);
    loc22 = new datamodel.LocationNote("San Antonio", py.getitem(this.list_departments, 1), "Pueblo", "visitar el pueblo de", "1.434 hab.", "Pueblo situado en el N del departamento de Canelones.");
    py.m(list_locations, "append", loc22);
    loc23 = new datamodel.LocationNote("San Bautista", py.getitem(this.list_departments, 1), "Pueblo", "visitar el pueblo de", "1.880 hab.", "Pueblo situado en el centro del departamento de Canelones.");
    py.m(list_locations, "append", loc23);
    loc24 = new datamodel.LocationNote("San Jacinto", py.getitem(this.list_departments, 1), "Villa", "visitar villa", "3.909 hab.", "Villa situada en el centro del departamento de Canelones.");
    py.m(list_locations, "append", loc24);
    loc25 = new datamodel.LocationNote("San Ram\xf3n", py.getitem(this.list_departments, 1), "Ciudad", "visitar la ciudad de", "6.992 hab.", "Ciudad situada en el N del departamento de Canelones.");
    py.m(list_locations, "append", loc25);
    loc26 = new datamodel.LocationNote("Santa Luc\xeda", py.getitem(this.list_departments, 1), "Ciudad", "visitar la ciudad de", "16.475 hab.", "Ciudad situada en el NO del departamento de Canelones.");
    py.m(list_locations, "append", loc26);
    loc27 = new datamodel.LocationNote("Santa Rosa", py.getitem(this.list_departments, 1), "Poblaci\xf3n", "visitar la poblaci\xf3n de", "3.660 hab.", "Poblaci\xf3n situada en el centro del departamento de Canelones.");
    py.m(list_locations, "append", loc27);
    loc28 = new datamodel.LocationNote("Sauce", py.getitem(this.list_departments, 1), "Poblaci\xf3n", "visitar la poblaci\xf3n de", "5.797 hab.", "Poblaci\xf3n situada en el SO del departamento de Canelones.");
    py.m(list_locations, "append", loc28);
    loc29 = new datamodel.LocationNote("Soca", py.getitem(this.list_departments, 1), "Ciudad", "visitar la ciudad de", "1.742 hab.", "Ciudad situada en el SE del departamento de Canelones.");
    py.m(list_locations, "append", loc29);
    loc30 = new datamodel.LocationNote("Tala", py.getitem(this.list_departments, 1), "Poblaci\xf3n", "visitar la poblaci\xf3n de", "4.939 hab.", "Poblaci\xf3n situada en el NE del departamento de Canelones.");
    py.m(list_locations, "append", loc30);
    loc31 = new datamodel.LocationNote("Toledo", py.getitem(this.list_departments, 1), "Localidad", "visitar la poblaci\xf3n de", "4.028 hab.", "Localidad situada en el SO del departamento de Canelones.");
    py.m(list_locations, "append", loc31);
    loc32 = new datamodel.LocationNote("Acegu\xe1", py.getitem(this.list_departments, 2), "Pueblo", "visitar el pueblo de", "1.493 hab.", "Pueblo situado en el N del departamento de Cerro Largo.");
    py.m(list_locations, "append", loc32);
    loc33 = new datamodel.LocationNote("Fraile Muerto", py.getitem(this.list_departments, 2), "Villa", "visitar villa", "3.229 hab.", "Villa situada en el centro del departamento de Cerro Largo.");
    py.m(list_locations, "append", loc33);
    loc34 = new datamodel.LocationNote("Isidoro Nobl\xeda", py.getitem(this.list_departments, 2), "Pueblo", "visitar el pueblo de", "2.462 hab.", "Pueblo situado en el NE del departamento de Cerro Largo.");
    py.m(list_locations, "append", loc34);
    loc35 = new datamodel.LocationNote("Melo", py.getitem(this.list_departments, 2), "Ciudad", "visitar la ciudad de", "50.578 hab.", "Ciudad situada en el centro del departamento de Cerro Largo, es su capital.");
    py.m(list_locations, "append", loc35);
    loc36 = new datamodel.LocationNote("R\xedo Branco", py.getitem(this.list_departments, 2), "Ciudad", "visitar la ciudad de", "13.456 hab.", "Ciudad situada en el SE del departamento de Cerro Largo.");
    py.m(list_locations, "append", loc36);
    loc37 = new datamodel.LocationNote("Carmelo", py.getitem(this.list_departments, 3), "Ciudad", "visitar la ciudad de", "16.866 hab.", "Ciudad ubicada en el O del departamento de Colonia.");
    py.m(list_locations, "append", loc37);
    loc38 = new datamodel.LocationNote("Colonia del Sacramento", py.getitem(this.list_departments, 3), "Ciudad", "visitar la ciudad de", "21.714 hab.", "Ciudad ubicada en el SO del departamento de Colonia.");
    py.m(list_locations, "append", loc38);
    loc39 = new datamodel.LocationNote("Colonia Valdense", py.getitem(this.list_departments, 3), "Ciudad", "visitar la ciudad de", "3.087 hab.", "Ciudad situada en el SE del departamento de Colonia.");
    py.m(list_locations, "append", loc39);
    loc40 = new datamodel.LocationNote("Florencio S\xe1nchez", py.getitem(this.list_departments, 3), "Villa", "visitar villa", "3.526 hab.", "Villa situada en el NE del departamento de Colonia.", "localidad");
    py.m(list_locations, "append", loc40);
    loc41 = new datamodel.LocationNote("Juan Lacaze", py.getitem(this.list_departments, 3), "Ciudad", "visitar la ciudad de", "13.196 hab.", "Ciudad situada en el S del departamento de Colonia.");
    py.m(list_locations, "append", loc41);
    loc42 = new datamodel.LocationNote("Nueva Helvecia", py.getitem(this.list_departments, 3), "Ciudad", "visitar la ciudad de", "10.002 hab.", "Ciudad situada en el SE del departamento de Colonia.");
    py.m(list_locations, "append", loc42);
    loc43 = new datamodel.LocationNote("Nueva Palmira", py.getitem(this.list_departments, 3), "Ciudad", "visitar la ciudad de", "9.230 hab.", "Ciudad situada en el NO del departamento de Colonia.");
    py.m(list_locations, "append", loc43);
    loc44 = new datamodel.LocationNote("Omb\xfaes de Lavalle", py.getitem(this.list_departments, 3), "Villa", "visitar villa", "3.451 hab.", "Villa situada en el N del departamento de Colonia.");
    py.m(list_locations, "append", loc44);
    loc45 = new datamodel.LocationNote("Rosario", py.getitem(this.list_departments, 3), "Ciudad", "visitar la ciudad de", "9.311 hab.", "Ciudad situada en el SE del departamento de Colonia.");
    py.m(list_locations, "append", loc45);
    loc46 = new datamodel.LocationNote("Tarariras", py.getitem(this.list_departments, 3), "Ciudad", "visitar la ciudad de", "6.070 hab.", "Ciudad situada en el SO del departamento de Colonia.");
    py.m(list_locations, "append", loc46);
    loc47 = new datamodel.LocationNote("Blanquillo", py.getitem(this.list_departments, 4), "Pueblo", "visitar el pueblo de", "1.162 hab.", "Pueblo situado en el NE del departamento de Durazno.");
    py.m(list_locations, "append", loc47);
    loc48 = new datamodel.LocationNote("Carlos Reyles", py.getitem(this.list_departments, 4), "Poblaci\xf3n", "visitar la poblaci\xf3n de", "1.039 hab.", "Poblaci\xf3n situada en el centro del departamento de Durazno.");
    py.m(list_locations, "append", loc48);
    loc49 = new datamodel.LocationNote("Carmen", py.getitem(this.list_departments, 4), "Villa", "visitar villa", "2.661 hab.", "Villa situada en el centro del departamento de Durazno.");
    py.m(list_locations, "append", loc49);
    loc50 = new datamodel.LocationNote("La Paloma", py.getitem(this.list_departments, 4), "Centro poblado", "visitar el centro poblado de", "1.547 hab.", "Centro poblado ubicado en el NE del departamento de Durazno.", "centro poblado");
    py.m(list_locations, "append", loc50);
    loc51 = new datamodel.LocationNote("Santa Bernardina", py.getitem(this.list_departments, 4), "Poblaci\xf3n", "visitar la poblaci\xf3n de", "1.333 hab.", "Poblaci\xf3n ubicada en el SO del departamento de Durazno.");
    py.m(list_locations, "append", loc51);
    loc52 = new datamodel.LocationNote("Sarand\xed del Yi", py.getitem(this.list_departments, 4), "Ciudad", "visitar la ciudad de", "7.289 hab.", "Ciudad situada en el SO del departamento de Durazno.");
    py.m(list_locations, "append", loc52);
    loc53 = new datamodel.LocationNote("Ismael Cortinas", py.getitem(this.list_departments, 5), "Poblaci\xf3n", "visitar la poblaci\xf3n de", "1.069 hab.", "Poblaci\xf3n situada en el SO del departamento de Flores.", "localidad");
    py.m(list_locations, "append", loc53);
    loc54 = new datamodel.LocationNote("Trinidad", py.getitem(this.list_departments, 5), "Ciudad", "visitar la ciudad de", "20.982 hab.", "Ciudad situada en el centro del departamento Flores, es su capital");
    py.m(list_locations, "append", loc54);
    loc55 = new datamodel.LocationNote("Andresito", py.getitem(this.list_departments, 5), "Pueblo", "visitar el pueblo de", "271 hab.", "Pueblo situado en el N del departamento de Flores.");
    py.m(list_locations, "append", loc55);
    loc56 = new datamodel.LocationNote("La Casilla", py.getitem(this.list_departments, 5), "Caser\xedo", "visitar el pueblo de", "181 hab.", "Caser\xedo situado en el centro del departamento de Flores.");
    py.m(list_locations, "append", loc56);
    loc57 = new datamodel.LocationNote("Cardal", py.getitem(this.list_departments, 6), "Pueblo", "visitar el pueblo de", "1.290 hab.", "Pueblo situado en el SO del departamento de Florida.");
    py.m(list_locations, "append", loc57);
    loc58 = new datamodel.LocationNote("Casup\xe1", py.getitem(this.list_departments, 6), "Villa", "visitar villa", "2.668 hab.", "Villa situada en el SE del departamento de Florida.");
    py.m(list_locations, "append", loc58);
    loc59 = new datamodel.LocationNote("Cerro Colorado", py.getitem(this.list_departments, 6), "Pueblo", "visitar el pueblo de", "1.336 hab.", "Pueblo situado en el SE del departamento de Florida.");
    py.m(list_locations, "append", loc59);
    loc60 = new datamodel.LocationNote("Fray Marcos", py.getitem(this.list_departments, 6), "Villa", "visitar villa", "2.509 hab.", "Villa situada en el SE del departamento de Florida.");
    py.m(list_locations, "append", loc60);
    loc61 = new datamodel.LocationNote("Nico P\xe9rez", py.getitem(this.list_departments, 6), "Pueblo", "visitar el pueblo de", "1.049 hab.", "Pueblo situado en el NE del departamento de Florida.");
    py.m(list_locations, "append", loc61);
    loc62 = new datamodel.LocationNote("Sarand\xed Grande", py.getitem(this.list_departments, 6), "Ciudad", "visitar la ciudad de", "6.362 hab.", "Ciudad situada en el NO del departamento de Florida.");
    py.m(list_locations, "append", loc62);
    loc63 = new datamodel.LocationNote("Veinticinco de Agosto", py.getitem(this.list_departments, 6), "Villa", "visitar villa", "1.794 hab.", "Villa situada en el SO del departamento de Florida.");
    py.m(list_locations, "append", loc63);
    loc64 = new datamodel.LocationNote("Veinticinco de Mayo", py.getitem(this.list_departments, 6), "Villa", "visitar villa", "1.845 hab.", "Villa situada en el SO del departamento de Florida.");
    py.m(list_locations, "append", loc64);
    loc65 = new datamodel.LocationNote("Jos\xe9 Batlle y Ord\xf3\xf1ez", py.getitem(this.list_departments, 7), "Pueblo", "visitar el pueblo de", "2.424 hab.", "Pueblo situado en el NO del departamento de Lavalleja.");
    py.m(list_locations, "append", loc65);
    loc66 = new datamodel.LocationNote("Jos\xe9 Pedro Varela", py.getitem(this.list_departments, 7), "Ciudad", "visitar la ciudad de", "5.332 hab.", "Ciudad situada en el NO del departamento de Lavalleja.");
    py.m(list_locations, "append", loc66);
    loc67 = new datamodel.LocationNote("Mariscala", py.getitem(this.list_departments, 7), "Pueblo", "visitar el pueblo de", "1.674 hab.", "Pueblo situado en el SE del departamento de Lavalleja.");
    py.m(list_locations, "append", loc67);
    loc68 = new datamodel.LocationNote("Minas", py.getitem(this.list_departments, 7), "Ciudad", "visitar la ciudad de", "37.925 hab.", "Ciudad situada en el SO del departamento de Lavalleja, es su capital.");
    py.m(list_locations, "append", loc68);
    loc69 = new datamodel.LocationNote("Sol\xeds de Mataojo", py.getitem(this.list_departments, 7), "Villa", "visitar villa", "2.676 hab.", "Villa situada en el SO del departamento de Lavalleja.");
    py.m(list_locations, "append", loc69);
    loc70 = new datamodel.LocationNote("Aigu\xe1", py.getitem(this.list_departments, 8), "Ciudad", "visitar la ciudad de", "2.676 hab.", "Ciudad situada en el S del departamento de Maldonado.");
    py.m(list_locations, "append", loc70);
    loc71 = new datamodel.LocationNote("Cerro Pelado", py.getitem(this.list_departments, 8), "Poblaci\xf3n", "visitar la poblaci\xf3n de", "6.385 hab.", "Poblaci\xf3n situada en el E del departamento de Maldonado.");
    py.m(list_locations, "append", loc71);
    loc72 = new datamodel.LocationNote("Pan de Az\xfacar", py.getitem(this.list_departments, 8), "Ciudad", "visitar la ciudad de", "7.098 hab.", "Ciudad situada en el SO del departamento de Maldonado.");
    py.m(list_locations, "append", loc72);
    loc73 = new datamodel.LocationNote("Pinares - Las Delicias", py.getitem(this.list_departments, 8), "Balneario", "visitar el balneario", "8.524 hab.", "Balneario situado en S del departamento de Maldonado.");
    py.m(list_locations, "append", loc73);
    loc74 = new datamodel.LocationNote("Piri\xe1polis", py.getitem(this.list_departments, 8), "Ciudad", "visitar la ciudad de", "7.899 hab.", "Ciudad situada en el SO del departamento de Maldonado.");
    py.m(list_locations, "append", loc74);
    loc75 = new datamodel.LocationNote("Punta del Este", py.getitem(this.list_departments, 8), "Ciudad", "visitar la ciudad de", "7.298 hab.", "Ciudad situada en el S del departamento de Maldonado.");
    py.m(list_locations, "append", loc75);
    loc76 = new datamodel.LocationNote("San Carlos", py.getitem(this.list_departments, 8), "Ciudad", "visitar la ciudad de", "24.771 hab.", "Ciudad situada en el S del departamento de Maldonado.");
    py.m(list_locations, "append", loc76);
    loc77 = new datamodel.LocationNote("San Rafael - El Placer", py.getitem(this.list_departments, 8), "Balneario", "visitar el balneario", "1.994 hab.", "Balneario situado en el S del departamento de Maldonado.");
    py.m(list_locations, "append", loc77);
    loc78 = new datamodel.LocationNote("Tambores", py.getitem(this.list_departments, 10), "Poblaci\xf3n", "visitar la poblaci\xf3n de", "1.180 hab.", "Poblaci\xf3n situada en el E del departamento de Paysand\xfa.");
    py.m(list_locations, "append", loc78);
    loc79 = new datamodel.LocationNote("Guich\xf3n", py.getitem(this.list_departments, 10), "Ciudad", "visitar la ciudad de", "5.025 hab.", "Ciudad situada en el S del departamento de Paysand\xfa.");
    py.m(list_locations, "append", loc79);
    loc80 = new datamodel.LocationNote("Nuevo Paysand\xfa", py.getitem(this.list_departments, 10), "Centro poblado", "visitar el centro poblado de", "7.468 hab.", "Centro poblado situado en el O del departamento de Paysand\xfa.");
    py.m(list_locations, "append", loc80);
    loc81 = new datamodel.LocationNote("Piedras Coloradas", py.getitem(this.list_departments, 10), "Centro poblado ", "visitar el centro poblado de", "1.113 hab.", "Centro poblado situado en el SO del departamento de Paysand\xfa.");
    py.m(list_locations, "append", loc81);
    loc82 = new datamodel.LocationNote("Quebracho", py.getitem(this.list_departments, 10), "Villa", "visitar villa", "2.813 hab.", "Villa situada en el NO del departamento de Paysand\xfa.");
    py.m(list_locations, "append", loc82);
    loc83 = new datamodel.LocationNote("San F\xe9lix", py.getitem(this.list_departments, 10), "Centro poblado", "visitar el centro poblado de", "1.149 hab.", "Centro poblado situado en el SO del departamento de Paysand\xfa.");
    py.m(list_locations, "append", loc83);
    loc84 = new datamodel.LocationNote("Fray Bentos", py.getitem(this.list_departments, 11), "Ciudad", "visitar la ciudad de", "23.122 hab.", "Ciudad situada en el SO del departamento de R\xedo Negro, es su capital.");
    py.m(list_locations, "append", loc84);
    loc85 = new datamodel.LocationNote("Nuevo Berl\xedn", py.getitem(this.list_departments, 11), "Pueblo", "visitar el pueblo de", "2.438 hab.", "Pueblo situado en el NO del departamento de R\xedo Negro.");
    py.m(list_locations, "append", loc85);
    loc86 = new datamodel.LocationNote("San Javier", py.getitem(this.list_departments, 11), "Villa", "visitar villa", "1.680 hab.", "Villa situada en el NO del departamento de R\xedo Negro.");
    py.m(list_locations, "append", loc86);
    loc87 = new datamodel.LocationNote("Young", py.getitem(this.list_departments, 11), "Ciudad", "visitar la ciudad de", "15.759 hab.", "Ciudad situada en el centro del departamento de R\xedo Negro.");
    py.m(list_locations, "append", loc87);
    loc88 = new datamodel.LocationNote("Mandub\xed", py.getitem(this.list_departments, 12), "Fraccionamiento", "visitar el fraccionamiento de", "5.157 hab.", "Fraccionamiento situado en el NE del departamento de Rivera.");
    py.m(list_locations, "append", loc88);
    loc89 = new datamodel.LocationNote("Minas de Corrales", py.getitem(this.list_departments, 12), "Pueblo", "visitar el pueblo de", "3.444 hab.", "Pueblo situado en el O del departamento de Rivera.");
    py.m(list_locations, "append", loc89);
    loc90 = new datamodel.LocationNote("Santa Teresa", py.getitem(this.list_departments, 12), "Centro poblado", "visitar el centro poblado de", "2.171 hab.", "Centro poblado situado en el NE del departamento de Rivera.");
    py.m(list_locations, "append", loc90);
    loc91 = new datamodel.LocationNote("Tranqueras", py.getitem(this.list_departments, 12), "Ciudad", "visitar la ciudad de", "7.284 hab.", "Ciudad situada en el NO del departamento de Rivera.");
    py.m(list_locations, "append", loc91);
    loc92 = new datamodel.LocationNote("Vichadero", py.getitem(this.list_departments, 12), "Villa", "visitar villa", "4.074 hab.", "Villa situada en el SE del departamento de Rivera.");
    py.m(list_locations, "append", loc92);
    loc93 = new datamodel.LocationNote("Castillos", py.getitem(this.list_departments, 13), "Ciudad", "visitar la ciudad de", "7.649 hab.", "Ciudad situada en el SE del departamento de Rocha.");
    py.m(list_locations, "append", loc93);
    loc94 = new datamodel.LocationNote("Cebollat\xed", py.getitem(this.list_departments, 13), "Pueblo", "visitar el pueblo de", "1.606 hab.", "Pueblo situado en el N del departamento de Rocha.");
    py.m(list_locations, "append", loc94);
    loc95 = new datamodel.LocationNote("Chuy", py.getitem(this.list_departments, 13), "Ciudad", "visitar la ciudad de", "10.401 hab.", "Ciudad situada en el E del departamento de Rocha.");
    py.m(list_locations, "append", loc95);
    loc96 = new datamodel.LocationNote("Dieciocho de Julio", py.getitem(this.list_departments, 13), "Villa", "visitar villa", "1.191 hab.", "Villa situada en el E del departamento de Rocha.");
    py.m(list_locations, "append", loc96);
    loc97 = new datamodel.LocationNote("La Aguada - Costa Azul", py.getitem(this.list_departments, 13), "Pueblo", "visitar el pueblo de", "1.103 hab.", "Pueblo situado en el S del departamento de Rocha.");
    py.m(list_locations, "append", loc97);
    loc98 = new datamodel.LocationNote("La Paloma", py.getitem(this.list_departments, 13), "Ciudad", "visitar la ciudad de", "3.202 hab.", "Ciudad situada en el S del departamento de Rocha.", "ciudad");
    py.m(list_locations, "append", loc98);
    loc99 = new datamodel.LocationNote("Lascano", py.getitem(this.list_departments, 13), "Ciudad", "visitar la ciudad de", "6.994 hab.", "Ciudad situada en el NO del departamento de Rocha.");
    py.m(list_locations, "append", loc99);
    loc100 = new datamodel.LocationNote("Vel\xe1zquez", py.getitem(this.list_departments, 13), "Poblaci\xf3n", "visitar la poblaci\xf3n de", "1.084 hab.", "Poblaci\xf3n situada en el O del departamento de Rocha.");
    py.m(list_locations, "append", loc100);
    loc101 = new datamodel.LocationNote("Bel\xe9n", py.getitem(this.list_departments, 14), "Pueblo", "visitar el pueblo de", "2.030 hab.", "Pueblo situado en el NO del departamento de Salto.");
    py.m(list_locations, "append", loc101);
    loc102 = new datamodel.LocationNote("Constituci\xf3n", py.getitem(this.list_departments, 14), "Pueblo", "visitar el pueblo de", "2.844 hab.", "Pueblo situado en el O del departamento de Salto.");
    py.m(list_locations, "append", loc102);
    loc103 = new datamodel.LocationNote("Pueblo Lavalleja", py.getitem(this.list_departments, 14), "Centro poblado", "visitar el centro poblado de", "1049 hab.", "Centro poblado situado en el  N del departamento de Salto.");
    py.m(list_locations, "append", loc103);
    loc104 = new datamodel.LocationNote("Ciudad del Plata", py.getitem(this.list_departments, 15), "Ciudad", "visitar la ciudad de", "26.582 hab.", "Ciudad situada en el SE del departamento de San Jos\xe9.");
    py.m(list_locations, "append", loc104);
    loc105 = new datamodel.LocationNote("Ecilda Paullier", py.getitem(this.list_departments, 15), "Villa", "visitar villa", "2.351 hab.", "Villa situada en el SO del departamento de San Jos\xe9");
    py.m(list_locations, "append", loc105);
    loc106 = new datamodel.LocationNote("Libertad", py.getitem(this.list_departments, 15), "Ciudad", "visitar la ciudad de", "9.196 hab.", "Ciudad situada en el SE del departamento de San Jos\xe9.");
    py.m(list_locations, "append", loc106);
    loc107 = new datamodel.LocationNote("Puntas de Valdez", py.getitem(this.list_departments, 15), "Centro poblado", "visitar el centro poblado de", "1.267 hab.", "Centro poblado situado en el S del departamento de San Jos\xe9.");
    py.m(list_locations, "append", loc107);
    loc108 = new datamodel.LocationNote("Rafael Perazza", py.getitem(this.list_departments, 15), "Poblaci\xf3n", "visitar la poblaci\xf3n de", "1.235 hab.", "Poblaci\xf3n situada en el S del departamento de San Jos\xe9.");
    py.m(list_locations, "append", loc108);
    loc109 = new datamodel.LocationNote("Rodr\xedguez", py.getitem(this.list_departments, 15), "Villa", "visitar villa", "2.561 hab.", "Villa situada en el E del departamento de San Jos\xe9.");
    py.m(list_locations, "append", loc109);
    loc110 = new datamodel.LocationNote("Cardona", py.getitem(this.list_departments, 16), "Ciudad", "visitar la ciudad de", "4.689 hab.", "Ciudad situada en el SE del departamento de Soriano.");
    py.m(list_locations, "append", loc110);
    loc111 = new datamodel.LocationNote("Chacras de Dolores", py.getitem(this.list_departments, 16), "Poblaci\xf3n", "visitar la poblaci\xf3n de", "3.251 hab.", "Poblaci\xf3n situada en el O del departamento de Soriano.");
    py.m(list_locations, "append", loc111);
    loc112 = new datamodel.LocationNote("Dolores", py.getitem(this.list_departments, 16), "Ciudad", "visitar la ciudad de", "15.753 hab.", "Ciudad situada en el O del departamento de Soriano.");
    py.m(list_locations, "append", loc112);
    loc113 = new datamodel.LocationNote("Jos\xe9 Enrique Rod\xf3", py.getitem(this.list_departments, 16), "Villa", "visitar villa", "2.113 hab.", "Villa situada en el S del departamento de Soriano.", "localidad");
    py.m(list_locations, "append", loc113);
    loc114 = new datamodel.LocationNote("Mercedes", py.getitem(this.list_departments, 16), "Ciudad", "visitar la ciudad de", "42.032 hab.", "Ciudad situada en el NO del departamento de Soriano, es su capital.");
    py.m(list_locations, "append", loc114);
    loc115 = new datamodel.LocationNote("Palmitas", py.getitem(this.list_departments, 16), "Pueblo", "visitar el pueblo de", "1.954 hab.", "Pueblo situado en el centro del departamento de Soriano.");
    py.m(list_locations, "append", loc115);
    loc116 = new datamodel.LocationNote("Santa Catalina", py.getitem(this.list_departments, 16), "Pueblo", "visitar el pueblo de", "1.053 hab.", "Pueblo situado en el S del departamento de Soriano.");
    py.m(list_locations, "append", loc116);
    loc117 = new datamodel.LocationNote("Ansina", py.getitem(this.list_departments, 17), "Villa", "visitar villa", "2.790 hab.", "Villa situada en el NE del departamento de Tacuaremb\xf3.");
    py.m(list_locations, "append", loc117);
    loc118 = new datamodel.LocationNote("Curtina", py.getitem(this.list_departments, 17), "Pueblo", "visitar el pueblo de", "1.029 hab.", "Pueblo situado en el O del departamento de Tacuaremb\xf3.");
    py.m(list_locations, "append", loc118);
    loc119 = new datamodel.LocationNote("Paso de los Toros", py.getitem(this.list_departments, 17), "Ciudad", "visitar la ciudad de", "13.231 hab.", "Ciudad situada en el SO del departamento de Tacuaremb\xf3.");
    py.m(list_locations, "append", loc119);
    loc120 = new datamodel.LocationNote("San Gregorio de Polanco", py.getitem(this.list_departments, 17), "Villa", "visitar villa", "3.673 hab.", "Villa situada en el S del departamento de Tacuaremb\xf3.");
    py.m(list_locations, "append", loc120);
    loc121 = new datamodel.LocationNote("Villa Sara", py.getitem(this.list_departments, 18), "Centro poblado", "visitar el centro poblado de", "1.056 hab.", "Centro poblado situado en el S del departamento de Treinta y Tres.");
    py.m(list_locations, "append", loc121);
    loc122 = new datamodel.LocationNote("Gral. Enrique Mart\xednez", py.getitem(this.list_departments, 18), "Pueblo", "visitar el pueblo de", "1.513 hab.", "Pueblo situado en el SE del departamento de Treinta y Tres.");
    py.m(list_locations, "append", loc122);
    loc123 = new datamodel.LocationNote("Santa Clara de Olimar", py.getitem(this.list_departments, 18), "Villa", "visitar villa", "2.305 hab.", "Villa situada en el NO del departamento de Treinta y Tres.");
    py.m(list_locations, "append", loc123);
    loc124 = new datamodel.LocationNote("Vergara", py.getitem(this.list_departments, 18), "Ciudad", "visitar la ciudad de", "3.986 hab.", "Ciudad situada en el E del departamento de Treinta y Tres.");
    py.m(list_locations, "append", loc124);
    return list_locations;
  }
  set_up_writers(): any {
    let list_writers, wr1, wr10, wr11, wr12, wr13, wr14, wr15, wr16, wr17, wr18, wr19, wr2, wr20, wr21, wr22, wr23, wr24, wr25, wr26, wr27, wr28, wr29, wr3, wr30, wr31, wr32, wr33, wr34, wr35, wr36, wr37, wr38, wr39, wr4, wr40, wr41, wr42, wr43, wr44, wr45, wr46, wr47, wr48, wr49, wr5, wr51, wr52, wr53, wr54, wr55, wr56, wr57, wr58, wr6, wr7, wr8, wr9: any;
    list_writers = [];
    wr1 = new datamodel.WriterNote("Eliseo Salvador Porta", "M", py.getitem(this.list_departments, 0), "(1912 - 1972)", "Narrador, poeta y ensayista nacido en Tom\xe1s Gomensoro, departamento de Artigas.");
    py.m(list_writers, "append", wr1);
    wr2 = new datamodel.WriterNote("Alba Roballo", "F", py.getitem(this.list_departments, 0), "(1908 - 1996)", "Poetisa nacida en Isla Cabello (actual Baltasar Brum), departamento de Artigas.");
    py.m(list_writers, "append", wr2);
    wr3 = new datamodel.WriterNote("Am\xe9rico Celestino del Cioppo", "M", py.getitem(this.list_departments, 1), "(1904 - 1996)", "Poeta y hombre de teatro nacido en la ciudad de Canelones.");
    py.m(list_writers, "append", wr3);
    wr4 = new datamodel.WriterNote("Marcelo Pareja", "M", py.getitem(this.list_departments, 1), "(1954)", "Poeta nacido en Las Piedras, departamento de Canelones.");
    py.m(list_writers, "append", wr4);
    wr5 = new datamodel.WriterNote("Milton Stelardo", "M", py.getitem(this.list_departments, 1), "(1918 - 2001)", "Narrador nacido en la ciudad de Canelones.");
    py.m(list_writers, "append", wr5);
    wr6 = new datamodel.WriterNote("Javier de Viana", "M", py.getitem(this.list_departments, 1), "(1868 - 1926)", "Narrador, cronista y dramaturgo nacido en la ciudad de Canelones.");
    py.m(list_writers, "append", wr6);
    wr7 = new datamodel.WriterNote("Gley Eyherabide", "M", py.getitem(this.list_departments, 2), "(1934)", "Narrador nacido en Melo, departamento de Cerro Largo.");
    py.m(list_writers, "append", wr7);
    wr8 = new datamodel.WriterNote("Juana de Ibarbourou", "F", py.getitem(this.list_departments, 2), "(1892 - 1979)", "Poetisa y narradora nacida en Melo, departamento de Cerro Largo.");
    py.m(list_writers, "append", wr8);
    wr9 = new datamodel.WriterNote("Jos\xe9 Monegal", "M", py.getitem(this.list_departments, 2), "(1892 - 1968)", "Narrador y bi\xf3grafo nacido en Melo, departamento de Cerro Largo.");
    py.m(list_writers, "append", wr9);
    wr10 = new datamodel.WriterNote("Emilio Oribe", "M", py.getitem(this.list_departments, 2), "(1893 - 1975)", "Poeta y ensayista nacido en Melo, departamento de Cerro Largo.");
    py.m(list_writers, "append", wr10);
    wr11 = new datamodel.WriterNote("Justino Zavala Mun\xedz", "M", py.getitem(this.list_departments, 2), "(1898 - 1968)", "Narrador, dramaturgo e historiador nacido en Melo, departamento de Cerro Largo.");
    py.m(list_writers, "append", wr11);
    wr12 = new datamodel.WriterNote("Carlos Mart\xednez Moreno", "M", py.getitem(this.list_departments, 3), "(1917 - 1986)", "Narrador, cr\xedtico teatral y literario nacido en la ciudad de Colonia del Sacramento.");
    py.m(list_writers, "append", wr12);
    wr13 = new datamodel.WriterNote("Roberto Bula P\xedriz", "M", py.getitem(this.list_departments, 4), "(1919 - ?)", "Poeta y ensayista nacido en Sarand\xed del Y\xed, departamento de Durazno.");
    py.m(list_writers, "append", wr13);
    wr14 = new datamodel.WriterNote("Generoso Medina", "M", py.getitem(this.list_departments, 4), "(1922 - 1974)", "Poeta y cr\xedtico nacido en la ciudad de Durazno.");
    py.m(list_writers, "append", wr14);
    wr15 = new datamodel.WriterNote("Omar Moreira", "M", py.getitem(this.list_departments, 4), "(1932)", "Narrador nacido en Puntas del Cordob\xe9s, departamento de Durazno.");
    py.m(list_writers, "append", wr15);
    wr16 = new datamodel.WriterNote("El\xedas Regules", "M", py.getitem(this.list_departments, 4), "(1861 - 1929)", "Poeta nacido en Sarand\xed del Yi, departamento de Durazno.");
    py.m(list_writers, "append", wr16);
    wr17 = new datamodel.WriterNote("Mario Arregui", "M", py.getitem(this.list_departments, 5), "(1917 - 1985)", "Narrador y bi\xf3grafo nacido en Trinidad, departamento de Flores.");
    py.m(list_writers, "append", wr17);
    wr18 = new datamodel.WriterNote("Juan Cunha", "M", py.getitem(this.list_departments, 6), "(1910 - 1985)", "Poeta nacido en Sauce de Illescas, departamento de Florida.");
    py.m(list_writers, "append", wr18);
    wr19 = new datamodel.WriterNote("Mario Delgado Apara\xedn", "M", py.getitem(this.list_departments, 6), "(1949)", "Narrador nacido en la ciudad de Florida.");
    py.m(list_writers, "append", wr19);
    wr20 = new datamodel.WriterNote("V\xedctor Dotti", "M", py.getitem(this.list_departments, 6), "(1907 - 1955)", "Narrador nacido en Molles del Pescado, departamento de Florida.");
    py.m(list_writers, "append", wr20);
    wr21 = new datamodel.WriterNote("Juan Mario Magallanes", "M", py.getitem(this.list_departments, 6), "(1893 - 1950)", "Poeta y narrador nacido en la ciudad de Florida.");
    py.m(list_writers, "append", wr21);
    wr22 = new datamodel.WriterNote("Omar Prego Gadea", "M", py.getitem(this.list_departments, 6), "(1927)", "Narrador y ensayista nacido en la ciudad de Florida.");
    py.m(list_writers, "append", wr22);
    wr23 = new datamodel.WriterNote("Manuel Benavente", "M", py.getitem(this.list_departments, 7), "(1893 - 1950)", "Poeta y ensayista nacido en Minas, departamento de Lavalleja.");
    py.m(list_writers, "append", wr23);
    wr24 = new datamodel.WriterNote("Guillermo Cuadri", "M", py.getitem(this.list_departments, 7), "(1884 - 1953)", "Poeta y prosista nacido en Minas, departamento de Lavalleja.");
    py.m(list_writers, "append", wr24);
    wr25 = new datamodel.WriterNote("Santiago Dossetti", "M", py.getitem(this.list_departments, 7), "(1902 - 1981)", "Narrador nacido en Gutierrez, departamento de Lavalleja.");
    py.m(list_writers, "append", wr25);
    wr26 = new datamodel.WriterNote("Milton Fornaro", "M", py.getitem(this.list_departments, 7), "(1947)", "Narrador nacido en Minas, departamento de Lavalleja.");
    py.m(list_writers, "append", wr26);
    wr27 = new datamodel.WriterNote("Rub\xe9n Loza Aguerrebere", "M", py.getitem(this.list_departments, 7), "(1945)", "Narrador nacido en Minas, departamento de Lavalleja.");
    py.m(list_writers, "append", wr27);
    wr28 = new datamodel.WriterNote("Juan Jos\xe9 Morosoli", "M", py.getitem(this.list_departments, 7), "(1899 - 1957)", "Narrador, poeta y ensayista nacido en Minas, departamento de Lavalleja.");
    py.m(list_writers, "append", wr28);
    wr29 = new datamodel.WriterNote("Ariel Muniz", "M", py.getitem(this.list_departments, 7), "(1942)", "Narrador nacido en Minas, departamento de Lavalleja.");
    py.m(list_writers, "append", wr29);
    wr30 = new datamodel.WriterNote("Blanca Luz Brum", "F", py.getitem(this.list_departments, 8), "(1905 - 1985)", "Poetisa y narradora nacida en Pan de Az\xfacar, departamento de Maldonado.");
    py.m(list_writers, "append", wr30);
    wr31 = new datamodel.WriterNote("Alvaro Figueredo", "M", py.getitem(this.list_departments, 8), "(1907 - 1966)", "Poeta nacido en Pan de Az\xfacar, departamento de Maldonado.");
    py.m(list_writers, "append", wr31);
    wr32 = new datamodel.WriterNote("Juan Fagetti", "M", py.getitem(this.list_departments, 10), "(1888 - 1954)", "Poeta nacido en la ciudad de Paysand\xfa.");
    py.m(list_writers, "append", wr32);
    wr33 = new datamodel.WriterNote("Luisa Luisi", "F", py.getitem(this.list_departments, 10), "(1883 - 1940)", "Poetisa y ensayista nacida en la ciudad de Paysand\xfa.");
    py.m(list_writers, "append", wr33);
    wr34 = new datamodel.WriterNote("Domingo Luis Bordoli Castelli", "M", py.getitem(this.list_departments, 11), "(1919 - 1982)", "Cr\xedtico y narrador nacido en Fray Bentos, departamento de R\xedo Negro.");
    py.m(list_writers, "append", wr34);
    wr35 = new datamodel.WriterNote("Sarandy Cabrera", "M", py.getitem(this.list_departments, 12), "(1923 - 2005)", "Poeta nacido en la ciudad de Rivera.");
    py.m(list_writers, "append", wr35);
    wr36 = new datamodel.WriterNote("Ofelia Machado Bonet", "F", py.getitem(this.list_departments, 12), "(1908 - 1987)", "Poetisa, novelista y ensayista nacida en la ciudad de Rivera.");
    py.m(list_writers, "append", wr36);
    wr37 = new datamodel.WriterNote("Gladys Castelvecchi", "F", py.getitem(this.list_departments, 13), "(1922 - 2008)", "Poetisa nacida en la ciudad de Rocha.");
    py.m(list_writers, "append", wr37);
    wr38 = new datamodel.WriterNote("Eduardo Dieste", "M", py.getitem(this.list_departments, 13), "(1882 - 1954)", "Ensayista, narrador y autor teatral nacido en la ciudad de Rocha.");
    py.m(list_writers, "append", wr38);
    wr39 = new datamodel.WriterNote("El\xedas Uriarte", "M", py.getitem(this.list_departments, 13), "(1945)", "Poeta nacido en la ciudad de Rocha.");
    py.m(list_writers, "append", wr39);
    wr40 = new datamodel.WriterNote("Enrique Amorim", "M", py.getitem(this.list_departments, 14), "(1900 - 1960)", "Narrador, poeta, dramaturgo y libretista cinematogr\xe1fico nacido en la ciudad de Salto.");
    py.m(list_writers, "append", wr40);
    wr41 = new datamodel.WriterNote("Horacio Quiroga", "M", py.getitem(this.list_departments, 14), "(1878 - 1937)", "Narrador nacido en la ciudad de Salto.");
    py.m(list_writers, "append", wr41);
    wr42 = new datamodel.WriterNote("Francisco Esp\xednola", "M", py.getitem(this.list_departments, 15), "(1901 - 1973)", "Narrador, ensayista y dramaturgo nacido en la ciudad de San Jos\xe9 de Mayo.");
    py.m(list_writers, "append", wr42);
    wr43 = new datamodel.WriterNote("Ismael Cortinas", "M", py.getitem(this.list_departments, 15), "(1884 - 1940)", "Narrador y dramaturgo nacido en la ciudad de San Jos\xe9 de Mayo.");
    py.m(list_writers, "append", wr43);
    wr44 = new datamodel.WriterNote("Ricardo Paseyro", "M", py.getitem(this.list_departments, 16), "(1926)", "Poeta y cr\xedtico nacido en Mercedes, departamento de Soriano.");
    py.m(list_writers, "append", wr44);
    wr45 = new datamodel.WriterNote("Washington Benavides", "M", py.getitem(this.list_departments, 17), "(1930)", "Poeta nacido en la ciudad de Tacuaremb\xf3.");
    py.m(list_writers, "append", wr45);
    wr46 = new datamodel.WriterNote("Mario Benedetti", "M", py.getitem(this.list_departments, 17), "(1920-2009)", "Narrador, poeta, dramaturgo y periodista nacido en Paso de los Toros, departamento de Tacuaremb\xf3.");
    py.m(list_writers, "append", wr46);
    wr47 = new datamodel.WriterNote("Victor Cunha", "M", py.getitem(this.list_departments, 17), "(1951)", "Poeta nacido en la ciudad de Tacuaremb\xf3.");
    py.m(list_writers, "append", wr47);
    wr48 = new datamodel.WriterNote("Julio Da Rosa", "M", py.getitem(this.list_departments, 18), "(1920)", "Narrador nacido en Costas de Porongos, departamento de Treinta y Tres.");
    py.m(list_writers, "append", wr48);
    wr49 = new datamodel.WriterNote("Seraf\xedn J. Garc\xeda", "M", py.getitem(this.list_departments, 18), "(1908 - 1985)", "Poeta y narrador nacido en Ca\xf1ada Grande, departamento de Treinta y Tres.");
    py.m(list_writers, "append", wr49);
    wr51 = new datamodel.WriterNote("Luis Hierro Gambardella", "M", py.getitem(this.list_departments, 18), "(1915 - 1991)", "Poeta, narrador y cr\xedtico literario nacido en la ciudad de Treinta y Tres.");
    py.m(list_writers, "append", wr51);
    wr52 = new datamodel.WriterNote("Pedro Leandro Ipuche", "M", py.getitem(this.list_departments, 18), "(1889 - 1976)", "Poeta, narrador y ensayista nacido en la ciudad de Treinta y Tres.");
    py.m(list_writers, "append", wr52);
    wr53 = new datamodel.WriterNote("Lucio Muniz", "M", py.getitem(this.list_departments, 18), "(1939)", "Poeta nacido en la ciudad de Treinta y Tres.");
    py.m(list_writers, "append", wr53);
    wr54 = new datamodel.WriterNote("Delmira Agustini", "F", py.getitem(this.list_departments, 9), "(1886 - 1914)", "Poetisa nacida en la ciudad de Montevideo.");
    py.m(list_writers, "append", wr54);
    wr55 = new datamodel.WriterNote("Eduardo Galeano", "M", py.getitem(this.list_departments, 9), "(1940)", "Narrador y periodista nacido en la ciudad de Montevideo.");
    py.m(list_writers, "append", wr55);
    wr56 = new datamodel.WriterNote("Juan Carlos Onetti", "M", py.getitem(this.list_departments, 9), "(1909 - 1994)", "Narrador y periodista nacido en la ciudad de Montevideo.");
    py.m(list_writers, "append", wr56);
    wr57 = new datamodel.WriterNote("Jos\xe9 Enrique Rod\xf3", "M", py.getitem(this.list_departments, 9), "(1871 -1917)", "Ensayista y cr\xedtico literario nacido en la ciudad de Montevideo.");
    py.m(list_writers, "append", wr57);
    wr58 = new datamodel.WriterNote("Florencio S\xe1nchez", "M", py.getitem(this.list_departments, 9), "(1875 - 1910)", "Dramaturgo nacido en la ciudad de Montevideo.");
    py.m(list_writers, "append", wr58);
    return list_writers;
  }
  set_up_clue_types(): any {
    let ct1, ct2, ct3, ct4, ct5, ct6, ct7, list_clue_types: any;
    list_clue_types = [];
    ct1 = new datamodel.ClueType("RIVER");
    py.m(list_clue_types, "append", ct1);
    ct2 = new datamodel.ClueType("LAGOON");
    py.m(list_clue_types, "append", ct2);
    ct3 = new datamodel.ClueType("HILL");
    py.m(list_clue_types, "append", ct3);
    ct4 = new datamodel.ClueType("LOCATION");
    py.m(list_clue_types, "append", ct4);
    ct5 = new datamodel.ClueType("HISTORY_FACT");
    py.m(list_clue_types, "append", ct5);
    ct6 = new datamodel.ClueType("WRITER");
    py.m(list_clue_types, "append", ct6);
    ct7 = new datamodel.ClueType("MUSICIAN");
    py.m(list_clue_types, "append", ct7);
    return list_clue_types;
  }
  set_up_clues(): any {
    let cd, hill_type, history_fact_type, lagoon_type, list_clues, location_type, river_type, writer_type: any;
    list_clues = [];
    river_type = this.get_clue_type("RIVER");
    lagoon_type = this.get_clue_type("LAGOON");
    hill_type = this.get_clue_type("HILL");
    location_type = this.get_clue_type("LOCATION");
    history_fact_type = this.get_clue_type("HISTORY_FACT");
    writer_type = this.get_clue_type("WRITER");
    cd = new datamodel.Clue("i509", [river_type, lagoon_type, location_type, hill_type]);
    py.m(list_clues, "append", cd);
    cd = new datamodel.Clue("i511", [river_type, lagoon_type, location_type, hill_type, writer_type, history_fact_type]);
    py.m(list_clues, "append", cd);
    cd = new datamodel.Clue("i510", [river_type, lagoon_type, location_type, hill_type, writer_type, history_fact_type]);
    py.m(list_clues, "append", cd);
    cd = new datamodel.Clue("i523", [hill_type, lagoon_type, river_type, history_fact_type, location_type, writer_type]);
    py.m(list_clues, "append", cd);
    cd = new datamodel.Clue("i526", [hill_type, lagoon_type, river_type, history_fact_type, location_type, writer_type]);
    py.m(list_clues, "append", cd);
    cd = new datamodel.Clue("i527", [hill_type, lagoon_type, river_type, location_type]);
    py.m(list_clues, "append", cd);
    cd = new datamodel.Clue("i528", [hill_type, lagoon_type, river_type, history_fact_type, location_type, writer_type]);
    py.m(list_clues, "append", cd);
    return list_clues;
  }
  get_clue_type(type: any): any {
    let c: any;
    for (c of py.iter(this.list_clue_types)) {
      if (py.eq(c.type, type)) {
        return c;
      }
    }
    throw new py.Exception(py.add("Clue not found: ", type));
    return null;
  }
  set_up_stolen_objects(): any {
    let list_stolen_objects, so1, so10, so11, so12, so13, so14, so15, so16, so17, so18, so19, so2, so20, so21, so22, so23, so24, so25, so26, so27, so28, so29, so3, so30, so31, so32, so33, so34, so35, so36, so37, so38, so39, so4, so40, so41, so42, so43, so44, so45, so46, so47, so48, so49, so5, so50, so51, so6, so7, so8, so9: any;
    list_stolen_objects = [];
    so1 = new datamodel.StolenObject("de", "un antiguo sable", "el sable", GENERICO);
    py.m(list_stolen_objects, "append", so1);
    so2 = new datamodel.StolenObject("de", "un trabuco naranjero", "el trabuco naranjero", GENERICO);
    py.m(list_stolen_objects, "append", so2);
    so3 = new datamodel.StolenObject("de", "un antiguo fusil", "el fusil", GENERICO);
    py.m(list_stolen_objects, "append", so3);
    so4 = new datamodel.StolenObject("de", "una valiosa pintura", "la pintura", GENERICO);
    py.m(list_stolen_objects, "append", so4);
    so5 = new datamodel.StolenObject("de", "unas fotos antiguas", "las fotos", GENERICO);
    py.m(list_stolen_objects, "append", so5);
    so6 = new datamodel.StolenObject("de", "una punta de flecha ind\xedgena", "la punta de flecha", INDIGENA);
    py.m(list_stolen_objects, "append", so6);
    so7 = new datamodel.StolenObject("de", "una vasija de cer\xe1mica ind\xedgena", "la vasija", INDIGENA);
    py.m(list_stolen_objects, "append", so7);
    so8 = new datamodel.StolenObject("de", "unas herramientas ind\xedgenas", "las herramientas", INDIGENA);
    py.m(list_stolen_objects, "append", so8);
    so9 = new datamodel.StolenObject("de", "unas boleadoras ind\xedgenas", "las boleadoras", INDIGENA);
    py.m(list_stolen_objects, "append", so9);
    so10 = new datamodel.StolenObject("de", "un arco ind\xedgena", "el arco", INDIGENA);
    py.m(list_stolen_objects, "append", so10);
    so11 = new datamodel.StolenObject("de", "un antiguo fac\xf3n", "el fac\xf3n", GAUCHO);
    py.m(list_stolen_objects, "append", so11);
    so12 = new datamodel.StolenObject("de", "una silla de montar", "la silla de montar", GAUCHO);
    py.m(list_stolen_objects, "append", so12);
    so13 = new datamodel.StolenObject("de", "unas espuelas", "las espuelas", GAUCHO);
    py.m(list_stolen_objects, "append", so13);
    so14 = new datamodel.StolenObject("de", "unas boleadoras", "las boleadoras", GAUCHO);
    py.m(list_stolen_objects, "append", so14);
    so15 = new datamodel.StolenObject("de", "una antigua vestimenta gauchesca", "la vestimenta", GAUCHO);
    py.m(list_stolen_objects, "append", so15);
    so16 = new datamodel.StolenObject("de", "unos restos fosilizados de dinosaurio", "los restos fosilizados", FOSILES);
    py.m(list_stolen_objects, "append", so16);
    so17 = new datamodel.StolenObject("de", "unos importantes restos f\xf3siles", "los restos f\xf3siles", FOSILES);
    py.m(list_stolen_objects, "append", so17);
    so18 = new datamodel.StolenObject("de", "un uniforme que perteneci\xf3 al General Aparicio Saravia", "el uniforme", APARICIO_SARAVIA);
    py.m(list_stolen_objects, "append", so18);
    so19 = new datamodel.StolenObject("de", "unas botas que pertenecieron al General Aparicio Saravia", "las botas", APARICIO_SARAVIA);
    py.m(list_stolen_objects, "append", so19);
    so20 = new datamodel.StolenObject("de", "unas espuelas que pertenecieron al General Aparicio Saravia", "las espuelas", APARICIO_SARAVIA);
    py.m(list_stolen_objects, "append", so20);
    so21 = new datamodel.StolenObject("de", "un sable que perteneci\xf3 al General Aparicio Saravia", "el sable", APARICIO_SARAVIA);
    py.m(list_stolen_objects, "append", so21);
    so22 = new datamodel.StolenObject("de", "un viol\xedn que perteneci\xf3 al m\xfasico Eduardo Fabini", "el viol\xedn", FABINI);
    py.m(list_stolen_objects, "append", so22);
    so23 = new datamodel.StolenObject("de", "las partituras originales de la obra \"Campo\" del compositor Eduardo Fabini", "las partituras", FABINI);
    py.m(list_stolen_objects, "append", so23);
    so24 = new datamodel.StolenObject("de", "las partituras originales de la obra \"La Isla de los Ceibos\" del compositor Eduardo Fabini", "las partituras", FABINI);
    py.m(list_stolen_objects, "append", so24);
    so25 = new datamodel.StolenObject("de", "las partituras originales de la obra \"La Patria Vieja\" del compositor Eduardo Fabini", "las partituras", FABINI);
    py.m(list_stolen_objects, "append", so25);
    so26 = new datamodel.StolenObject("de", "un antiguo sable", "el sable", ARMAS);
    py.m(list_stolen_objects, "append", so26);
    so27 = new datamodel.StolenObject("de", "un antiguo uniforme militar", "el uniforme", ARMAS);
    py.m(list_stolen_objects, "append", so27);
    so28 = new datamodel.StolenObject("de", "un antiguo fusil", "el fusil", ARMAS);
    py.m(list_stolen_objects, "append", so28);
    so29 = new datamodel.StolenObject("de", "un trabuco naranjero", "el trabuco naranjero", ARMAS);
    py.m(list_stolen_objects, "append", so29);
    so30 = new datamodel.StolenObject("de", "una colecci\xf3n de monedas muy antiguas", "la colecci\xf3n de monedas", MONEDAS);
    py.m(list_stolen_objects, "append", so30);
    so31 = new datamodel.StolenObject("del", "cuadro \"El Juramento de los Treinta y Tres Orientales\" del pintor Juan Manuel Blanes", "el cuadro", BLANES);
    py.m(list_stolen_objects, "append", so31);
    so32 = new datamodel.StolenObject("del", "cuadro \"Asesinato del General Venancio Flores\" del pintor Juan Manuel Blanes", "el cuadro", BLANES);
    py.m(list_stolen_objects, "append", so32);
    so33 = new datamodel.StolenObject("del", "cuadro \"La Cautiva\" del pintor Juan Manuel Blanes", "el cuadro", BLANES);
    py.m(list_stolen_objects, "append", so33);
    so34 = new datamodel.StolenObject("del", "cuadro \"Demonio, Mundo y Carne\" del pintor Juan Manuel Blanes", "el cuadro", BLANES);
    py.m(list_stolen_objects, "append", so34);
    so35 = new datamodel.StolenObject("del", "cuadro \"Nueva York\" del pintor Joaqu\xedn Torres Garc\xeda", "el cuadro", TORRES_GARCIA);
    py.m(list_stolen_objects, "append", so35);
    so36 = new datamodel.StolenObject("del", "cuadro \"Suburbio\" del pintor Joaqu\xedn Torres Garc\xeda", "el cuadro", TORRES_GARCIA);
    py.m(list_stolen_objects, "append", so36);
    so37 = new datamodel.StolenObject("del", "cuadro \"Composici\xf3n sim\xe9trica universal\" del pintor Joaqu\xedn Torres Garc\xeda", "el cuadro", TORRES_GARCIA);
    py.m(list_stolen_objects, "append", so37);
    so38 = new datamodel.StolenObject("del", "cuadro \"Arte Universal\" del pintor Joaqu\xedn Torres Garc\xeda", "el cuadro", TORRES_GARCIA);
    py.m(list_stolen_objects, "append", so38);
    so39 = new datamodel.StolenObject("del", "cuadro \"Extra\xf1a M\xe1scara\" del pintor Luis Alberto Solari", "el cuadro", SOLARI);
    py.m(list_stolen_objects, "append", so39);
    so40 = new datamodel.StolenObject("del", "cuadro \"Un d\xeda y una hist\xf3ria\" del pintor Luis Alberto Solari", "el cuadro", SOLARI);
    py.m(list_stolen_objects, "append", so40);
    so41 = new datamodel.StolenObject("del", "cuadro \"Carroza para un carnaval\" del pintor Luis Alberto Solari", "el cuadro", SOLARI);
    py.m(list_stolen_objects, "append", so41);
    so42 = new datamodel.StolenObject("del", "cuadro \"El arca de No\xe9\" del pintor Luis Alberto Solari", "el cuadro", SOLARI);
    py.m(list_stolen_objects, "append", so42);
    so43 = new datamodel.StolenObject("de", "un valioso cuadro", "el cuadro", ARTE);
    py.m(list_stolen_objects, "append", so43);
    so44 = new datamodel.StolenObject("de", "una valiosa escultura", "la escultura", ARTE);
    py.m(list_stolen_objects, "append", so44);
    so45 = new datamodel.StolenObject("de", "un pasaporte que demuestra la nacionalidad uruguaya del cantante Carlos Gardel", "el pasaporte", GARDEL);
    py.m(list_stolen_objects, "append", so45);
    so46 = new datamodel.StolenObject("de", "una foto original del cantante Carlos Gardel", "la foto", GARDEL);
    py.m(list_stolen_objects, "append", so46);
    so47 = new datamodel.StolenObject("de", "algunos recortes de peri\xf3dico de la d\xe9cada del 30", "los recortes de peri\xf3dico", GARDEL);
    py.m(list_stolen_objects, "append", so47);
    so48 = new datamodel.StolenObject("de", "un libro muy antiguo", "el libro", EUSEBIO_GIMENEZ);
    py.m(list_stolen_objects, "append", so48);
    so49 = new datamodel.StolenObject("del", "cuadro \"Romana\" del pintor Carlos Federico S\xe1ez", "el cuadro", EUSEBIO_GIMENEZ);
    py.m(list_stolen_objects, "append", so49);
    so50 = new datamodel.StolenObject("del", "cuadro \"Chocaro\" del pintor Carlos Federico S\xe1ez", "el cuadro", EUSEBIO_GIMENEZ);
    py.m(list_stolen_objects, "append", so50);
    so51 = new datamodel.StolenObject("del", "cuadro \"R\xedo Tiber\" del pintor Carlos Federico S\xe1ez", "el cuadro", EUSEBIO_GIMENEZ);
    py.m(list_stolen_objects, "append", so51);
    return list_stolen_objects;
  }
  set_up_witness(): any {
    let list_witnesses, w1, w2, w3, w4: any;
    list_witnesses = [];
    w1 = new datamodel.Witness("Jardinero", "p1_witness_gardener.png");
    py.m(list_witnesses, "append", w1);
    w2 = new datamodel.Witness("Almacenera", "p1_witness_shoptender.png");
    py.m(list_witnesses, "append", w2);
    w3 = new datamodel.Witness("Bibliotecario", "p1_witness_librarian.png");
    py.m(list_witnesses, "append", w3);
    w4 = new datamodel.Witness("Alba\xf1il", "p1_witness_bricklayer.png");
    py.m(list_witnesses, "append", w4);
    return list_witnesses;
  }
  set_up_statements(): any {
    let list_statements, st1, st2, st3: any;
    list_statements = [];
    st1 = new datamodel.Statement("No vi a nadie sospechoso por aqu\xed.");
    py.m(list_statements, "append", st1);
    st2 = new datamodel.Statement("Un hombre sospechoso\npas\xf3 por aqu\xed.");
    py.m(list_statements, "append", st2);
    st3 = new datamodel.Statement("Una mujer sospechosa\npas\xf3 por aqu\xed.");
    py.m(list_statements, "append", st3);
    return list_statements;
  }
  set_up_identikit_statements(): any {
    let is1, is10, is11, is12, is13, is14, is15, is16, is2, is3, is4, is5, is6, is7, is8, is9, list_statements: any;
    list_statements = [];
    is1 = new datamodel.IdentikitStatement("Era bastante &#c144,22,22!&#f:bold!alto&#f!&#c!.", MALE, TALL, (-1), (-1));
    py.m(list_statements, "append", is1);
    is2 = new datamodel.IdentikitStatement("Era bastante &#c144,22,22!&#f:bold!alta&#f!&#c!.", FEMALE, TALL, (-1), (-1));
    py.m(list_statements, "append", is2);
    is3 = new datamodel.IdentikitStatement("Era bastante &#c144,22,22!&#f:bold!bajo&#f!&#c!.", MALE, SHORT, (-1), (-1));
    py.m(list_statements, "append", is3);
    is4 = new datamodel.IdentikitStatement("Era bastante &#c144,22,22!&#f:bold!baja&#f!&#c!.", FEMALE, SHORT, (-1), (-1));
    py.m(list_statements, "append", is4);
    is5 = new datamodel.IdentikitStatement("Era &#c144,22,22!&#f:bold!rubio&#f!&#c!.", MALE, (-1), BLONDE, (-1));
    py.m(list_statements, "append", is5);
    is6 = new datamodel.IdentikitStatement("Era &#c144,22,22!&#f:bold!rubia&#f!&#c!.", FEMALE, (-1), BLONDE, (-1));
    py.m(list_statements, "append", is6);
    is7 = new datamodel.IdentikitStatement("Era &#c144,22,22!&#f:bold!morocho&#f!&#c!.", MALE, (-1), BRUNETTE, (-1));
    py.m(list_statements, "append", is7);
    is8 = new datamodel.IdentikitStatement("Era &#c144,22,22!&#f:bold!morocha&#f!&#c!.", FEMALE, (-1), BRUNETTE, (-1));
    py.m(list_statements, "append", is8);
    is9 = new datamodel.IdentikitStatement("Era &#c144,22,22!&#f:bold!pelirrojo&#f!&#c!.", MALE, (-1), REDHEAD, (-1));
    py.m(list_statements, "append", is9);
    is10 = new datamodel.IdentikitStatement("Era &#c144,22,22!&#f:bold!pelirroja&#f!&#c!.", FEMALE, (-1), REDHEAD, (-1));
    py.m(list_statements, "append", is10);
    is11 = new datamodel.IdentikitStatement("Era &#c144,22,22!&#f:bold!canoso&#f!&#c!.", MALE, (-1), GREY_HAIRED, (-1));
    py.m(list_statements, "append", is11);
    is12 = new datamodel.IdentikitStatement("Era &#c144,22,22!&#f:bold!canosa&#f!&#c!.", FEMALE, (-1), GREY_HAIRED, (-1));
    py.m(list_statements, "append", is12);
    is13 = new datamodel.IdentikitStatement("Ten\xeda un &#c144,22,22!&#f:bold!tatuaje&#f!&#c!.", (-1), (-1), (-1), TATOO);
    py.m(list_statements, "append", is13);
    is14 = new datamodel.IdentikitStatement("Ten\xeda una fea &#c144,22,22!&#f:bold!cicatr\xedz&#f!&#c!.", (-1), (-1), (-1), SCAR);
    py.m(list_statements, "append", is14);
    is15 = new datamodel.IdentikitStatement("Usaba &#c144,22,22!&#f:bold!lentes&#f!&#c!.", (-1), (-1), (-1), GLASSES);
    py.m(list_statements, "append", is15);
    is16 = new datamodel.IdentikitStatement("Ten\xeda un &#c144,22,22!&#f:bold!lunar&#f!&#c!.", (-1), (-1), (-1), MOLE);
    py.m(list_statements, "append", is16);
    return list_statements;
  }
  set_up_janitor_statements(): any {
    let list_statements, s10, s11, s12, s13, s14, s15, s16, s17, s18, s19, s2, s20, s3, s4, s5, s6, s7, s8, s9: any;
    list_statements = [];
    s2 = new datamodel.JanitorStatement("Me pregunt\xf3 por alg\xfan club que tuviese una &#c144,22,22!&#f:bold!piscina&#f!&#c! para practicar su &#c144,22,22!&#f:bold!deporte&#f!&#c! favorito.", 1, (-1), AQUATIC, (-1), (-1));
    py.m(list_statements, "append", s2);
    s3 = new datamodel.JanitorStatement("Me coment\xf3 que pensaba ir a la zapater\xeda a comprarse un &#c144,22,22!&#f:bold!calzado&#f!&#c! adecuado para practicar su &#c144,22,22!&#f:bold!deporte&#f!&#c! favorito.", 1, (-1), TERRESTRIAL, (-1), (-1));
    py.m(list_statements, "append", s3);
    s4 = new datamodel.JanitorStatement("Dijo que estaba aburrido porque para practicar el &#c144,22,22!&#f:bold!deporte&#f!&#c! que le gusta necesita un &#c144,22,22!&#f:bold!equipo&#f!&#c!.", 1, 1, (-1), true, (-1));
    py.m(list_statements, "append", s4);
    s5 = new datamodel.JanitorStatement("Dijo que estaba aburrida porque para practicar el &#c144,22,22!&#f:bold!deporte&#f!&#c! que le gusta necesita un &#c144,22,22!&#f:bold!equipo&#f!&#c!.", 1, 2, (-1), true, (-1));
    py.m(list_statements, "append", s5);
    s6 = new datamodel.JanitorStatement("Me coment\xf3 que pensaba ir a practicar su deporte preferido, cuando me ofrec\xed a jugar con \xe9l me dijo que &#c144,22,22!&#f:bold!no era un deporte de equipo&#f!&#c!.", 1, 1, (-1), false, (-1));
    py.m(list_statements, "append", s6);
    s7 = new datamodel.JanitorStatement("Me coment\xf3 que pensaba ir a practicar su deporte preferido, cuando me ofrec\xed a jugar con ella me dijo que &#c144,22,22!&#f:bold!no era un deporte de equipo&#f!&#c!.", 1, 2, (-1), false, (-1));
    py.m(list_statements, "append", s7);
    s8 = new datamodel.JanitorStatement("Pregunt\xf3 por una casa de deportes porque necesitaba comprar una &#c144,22,22!&#f:bold!pelota&#f!&#c! para practicar su &#c144,22,22!&#f:bold!deporte&#f!&#c! favorito.", 1, (-1), (-1), (-1), true);
    py.m(list_statements, "append", s8);
    s9 = new datamodel.JanitorStatement("Pregunt\xf3 por una casa de deportes, le ofrec\xed una pelota, pero me dijo que &#c144,22,22!&#f:bold!no se necesita una pelota&#f!&#c! para practicar el &#c144,22,22!&#f:bold!deporte&#f!&#c! que le gusta.", 1, (-1), (-1), (-1), false);
    py.m(list_statements, "append", s9);
    s10 = new datamodel.JanitorStatement("Me coment\xf3 que pensaba ir a buscar alimento para su &#c144,22,22!&#f:bold!mascota&#f!&#c! en alg\xfan comercio donde vendieran el tipo de &#c144,22,22!&#f:bold!carne&#f!&#c! que le gusta.", 2, (-1), (-1), CARNIVORE, (-1));
    py.m(list_statements, "append", s10);
    s11 = new datamodel.JanitorStatement("Me coment\xf3 que pensaba ir a la &#c144,22,22!&#f:bold!verduler\xeda&#f!&#c! a buscar alimento para su &#c144,22,22!&#f:bold!mascota&#f!&#c!.", 2, (-1), (-1), HERBIVORE, (-1));
    py.m(list_statements, "append", s11);
    s12 = new datamodel.JanitorStatement("Me coment\xf3 que como su &#c144,22,22!&#f:bold!mascota&#f!&#c! ten\xeda que &#c144,22,22!&#f:bold!amamantar&#f!&#c! a sus cr\xedas ten\xeda que alimentarla mejor.", 2, (-1), MAMMAL, (-1), (-1));
    py.m(list_statements, "append", s12);
    s13 = new datamodel.JanitorStatement("Le pregunt\xe9 si ten\xeda &#c144,22,22!&#f:bold!mascota&#f!&#c!, me dijo que si, pero que no la saca a pasear porque solo puede &#c144,22,22!&#f:bold!respirar bajo el agua&#f!&#c!.", 2, (-1), FISH, (-1), (-1));
    py.m(list_statements, "append", s13);
    s14 = new datamodel.JanitorStatement("Estaba enojado porque su &#c144,22,22!&#f:bold!mascota&#f!&#c! hab\xeda llenado la casa de &#c144,22,22!&#f:bold!plumas&#f!&#c!.", 2, 1, BIRD, (-1), (-1));
    py.m(list_statements, "append", s14);
    s15 = new datamodel.JanitorStatement("Estaba enojada porque su &#c144,22,22!&#f:bold!mascota&#f!&#c! hab\xeda llenado la casa de &#c144,22,22!&#f:bold!plumas&#f!&#c!.", 2, 2, BIRD, (-1), (-1));
    py.m(list_statements, "append", s15);
    s16 = new datamodel.JanitorStatement("Me coment\xf3 que no es agradable acariciar a su &#c144,22,22!&#f:bold!mascota&#f!&#c! porque tiene la &#c144,22,22!&#f:bold!piel fr\xeda y escamosa&#f!&#c!.", 2, (-1), REPTILE, (-1), (-1));
    py.m(list_statements, "append", s16);
    s17 = new datamodel.JanitorStatement("Me dijo que pensaba comprar una jaula nueva para su &#c144,22,22!&#f:bold!mascota&#f!&#c! porque la que ten\xeda se hab\xeda roto y ten\xeda miedo de que se &#c144,22,22!&#f:bold!volara&#f!&#c!.", 2, (-1), (-1), (-1), FLY);
    py.m(list_statements, "append", s17);
    s18 = new datamodel.JanitorStatement("Me coment\xf3 que pensaba llevar a su &#c144,22,22!&#f:bold!mascota&#f!&#c! al parque para que &#c144,22,22!&#f:bold!caminara&#f!&#c! un poco por el c\xe9sped.", 2, (-1), (-1), (-1), WALK);
    py.m(list_statements, "append", s18);
    s19 = new datamodel.JanitorStatement("Me dijo que pensaba comprar un estanque del tama\xf1o adecuado para que su &#c144,22,22!&#f:bold!mascota&#f!&#c! &#c144,22,22!&#f:bold!nadara&#f!&#c! c\xf3modamente.", 2, (-1), (-1), (-1), SWIM);
    py.m(list_statements, "append", s19);
    s20 = new datamodel.JanitorStatement("Me pidi\xf3 algunos &#c144,22,22!&#f:bold!alimentos&#f!&#c! para llevarle a su &#c144,22,22!&#f:bold!mascota&#f!&#c!.", (-1), (-1), (-1), HERBIVORE, (-1));
    py.m(list_statements, "append", s20);
    return list_statements;
  }
  set_up_thieves(): any {
    let list_thieves, t1, t10, t11, t12, t13, t14, t15, t16, t2, t3, t4, t5, t6, t7, t8, t9: any;
    list_thieves = [];
    t1 = new datamodel.Thief(MALE, SHORT, REDHEAD, GLASSES, py.getitem(this.list_animals, 13), py.getitem(this.list_sports, 5), "Tom\xe1s Prestado", "\"El usurero\"", "32 a\xf1os", "Trabajaba anteriormente en una casa de empe\xf1o que usaba como plataforma para traficar objetos robados.\nSus amigos se quejan de que nunca devuelve las cosas.", "p0_thief_small_tomas.png", "p0_thief_big_tomas_1.jpg", "p0_thief_big_tomas_2.jpg", "p0_thief_big_tomas_3.jpg");
    py.m(list_thieves, "append", t1);
    t2 = new datamodel.Thief(FEMALE, TALL, BRUNETTE, MOLE, py.getitem(this.list_animals, 7), py.getitem(this.list_sports, 3), "Helga Roben", "\"La novicia\"", "35 a\xf1os", "Originaria de Austria.\nDe joven fue novicia, pero la excomulgaron por robar el dinero de los diezmos.\nFue expulsada de su pa\xeds por bailar en las colinas, lo que ocasionaba terribles avalanchas.", "p0_thief_small_helga.png", "p0_thief_big_helga_1.jpg", "p0_thief_big_helga_2.jpg", "p0_thief_big_helga_3.jpg");
    py.m(list_thieves, "append", t2);
    t3 = new datamodel.Thief(MALE, TALL, BRUNETTE, TATOO, py.getitem(this.list_animals, 10), py.getitem(this.list_sports, 6), "Ruffo Nepomuceno Ruffiani", "\"Angelito de mam\xe1\"", "30 a\xf1os", "Boxeador retirado con un r\xe9cord de 112 peleas disputadas, 111 ganadas por knock-out. Una vez alguien hizo una broma con su segundo nombre, solo una vez.", "p0_thief_small_ruffo.png", "p0_thief_big_ruffo_1.jpg", "p0_thief_big_ruffo_2.jpg", "p0_thief_big_ruffo_3.jpg");
    py.m(list_thieves, "append", t3);
    t4 = new datamodel.Thief(FEMALE, SHORT, GREY_HAIRED, GLASSES, py.getitem(this.list_animals, 4), py.getitem(this.list_sports, 7), "Teresa Terra Pi\xf1a", "\"La abuela\"", "Edad desconocida", "Miembro fundador de CULT.\nSe rumorea que mantiene una relaci\xf3n amorosa con Timoteo T. Sacco.\nSe interesa especialmente en objetos de valor hist\xf3rico porque le recuerdan su infancia.", "p0_thief_small_teresa.png", "p0_thief_big_teresa_1.jpg", "p0_thief_big_teresa_2.jpg", "p0_thief_big_teresa_3.jpg");
    py.m(list_thieves, "append", t4);
    t5 = new datamodel.Thief(MALE, TALL, BRUNETTE, SCAR, py.getitem(this.list_animals, 5), py.getitem(this.list_sports, 0), "Giacomo Ladri", "\"El padrino\"", "51 a\xf1os", "Inmigrante italiano.\nEra due\xf1o de una cadena de pizzer\xedas y traficaba armas dentro de las cajas.\nAcept\xf3 formar parte de CULT porque le hicieron una oferta que no pod\xeda rechazar.", "p0_thief_small_giacommo.png", "p0_thief_big_giacommo_1.jpg", "p0_thief_big_giacommo_2.jpg", "p0_thief_big_giacommo_3.jpg");
    py.m(list_thieves, "append", t5);
    t6 = new datamodel.Thief(MALE, SHORT, REDHEAD, TATOO, py.getitem(this.list_animals, 12), py.getitem(this.list_sports, 3), "Steal McCrook", "\"El Duende\"", "23 a\xf1os", "Procede de Irlanda.\nAfirma tener mucha suerte, que utiliza para jugar al \"roba mont\xf3n\" por dinero en establecimientos ilegales.\nHay quienes sostienen que guarda su bot\xedn al final del arcoiris.", "p0_thief_small_steal.png", "p0_thief_big_steal_1.jpg", "p0_thief_big_steal_2.jpg", "p0_thief_big_steal_3.jpg");
    py.m(list_thieves, "append", t6);
    t7 = new datamodel.Thief(MALE, TALL, BLONDE, SCAR, py.getitem(this.list_animals, 6), py.getitem(this.list_sports, 2), "Sven Hurtensson", "\"El Vikingo\"", "48 a\xf1os", "Delincuente de origen n\xf3rdico.\nEn sus viajes de saqueo y pillaje termin\xf3 quedandose en nuestro pa\xeds.\nSe enoja mucho cuando la gente habla mal de ABBA.", "p0_thief_small_sven.png", "p0_thief_big_sven_1.jpg", "p0_thief_big_sven_2.jpg", "p0_thief_big_sven_3.jpg");
    py.m(list_thieves, "append", t7);
    t8 = new datamodel.Thief(MALE, TALL, BLONDE, TATOO, py.getitem(this.list_animals, 14), py.getitem(this.list_sports, 4), "Roberto Robani", "\"El Robin Hood integral\"", "37 a\xf1os", "Procede de una familia de alto poder adquisitivo, su vinculaci\xf3n al mundo del hampa se produce unicamente por aburrimiento.\nSe hace llamar \"El Robin Hood integral\", ya que roba tanto a ricos como a pobres sin hacer distinci\xf3n.", "p0_thief_small_roberto.png", "p0_thief_big_roberto_1.jpg", "p0_thief_big_roberto_2.jpg", "p0_thief_big_roberto_3.jpg");
    py.m(list_thieves, "append", t8);
    t9 = new datamodel.Thief(MALE, SHORT, GREY_HAIRED, SCAR, py.getitem(this.list_animals, 8), py.getitem(this.list_sports, 7), "Timoteo T. Sacco", "\"El Abuelo\"", "Edad desconocida", "Miembro fundador de CULT.\nSe rumorea que mantiene una relaci\xf3n amorosa con Teresa Terra Pi\xf1a.\nTiene como pasatiempo sentarse en las plazas a robarle migas de pan a las palomas.", "p0_thief_small_timoteo.png", "p0_thief_big_timoteo_1.jpg", "p0_thief_big_timoteo_2.jpg", "p0_thief_big_timoteo_3.jpg");
    py.m(list_thieves, "append", t9);
    t10 = new datamodel.Thief(MALE, SHORT, GREY_HAIRED, TATOO, py.getitem(this.list_animals, 11), py.getitem(this.list_sports, 1), "Langostino R\xf3balo", "\"El Pescador\"", "68 a\xf1os", "Pescador muy experimentado, su t\xe9cnica preferida para pescar es robando con mosca.\nLo han pescado robando varias veces.\nOdia los juegos de palabras.\nCarece de sentido del olfato.", "p0_thief_small_langostino.png", "p0_thief_big_langostino_1.jpg", "p0_thief_big_langostino_2.jpg", "p0_thief_big_langostino_3.jpg");
    py.m(list_thieves, "append", t10);
    t11 = new datamodel.Thief(FEMALE, TALL, BLONDE, MOLE, py.getitem(this.list_animals, 9), py.getitem(this.list_sports, 4), "Helena Del Hurto", "\"La Actr\xedz\"", "Edad desconocida", "En su \xe9poca fue una afamada actriz.\nEn la \xfaltima obra en la que particip\xf3 su actuaci\xf3n fue tan buena que se rob\xf3 el espect\xe1culo, de ah\xed en adelante se dedic\xf3 a la delincuecia.", "p0_thief_small_grace.png", "p0_thief_big_grace_1.jpg", "p0_thief_big_grace_2.jpg", "p0_thief_big_grace_3.jpg");
    py.m(list_thieves, "append", t11);
    t12 = new datamodel.Thief(FEMALE, TALL, BLONDE, GLASSES, py.getitem(this.list_animals, 2), py.getitem(this.list_sports, 2), "Vanessa Cuore", "\"La Enfermera\"", "32 a\xf1os", "Ex funcionaria de la salud.\nSe dec\xeda que por su belleza le robaba los corazones a sus pacientes.\nFue despedida injustamente por un malentendido, el director del hospital entendi\xf3 esa frase literalmente.", "p0_thief_small_vanessa.png", "p0_thief_big_vanessa_1.jpg", "p0_thief_big_vanessa_2.jpg", "p0_thief_big_vanessa_3.jpg");
    py.m(list_thieves, "append", t12);
    t13 = new datamodel.Thief(FEMALE, SHORT, GREY_HAIRED, MOLE, py.getitem(this.list_animals, 3), py.getitem(this.list_sports, 1), "Estela Bolsa Olavida", "\"La vasca\"", "76 a\xf1os", "Descendente de vascos.\nSe aprovecha de su aspecto de ancianita indefensa para asaltar a los j\xf3venes a los que les pide ayuda para cruzar la calle.\nUtiliza el dinero que obtiene para organizar partidas de rummy canasta con sus amigas.", "p0_thief_small_estela.png", "p0_thief_big_estela_1.jpg", "p0_thief_big_estela_2.jpg", "p0_thief_big_estela_3.jpg");
    py.m(list_thieves, "append", t13);
    t14 = new datamodel.Thief(FEMALE, SHORT, REDHEAD, SCAR, py.getitem(this.list_animals, 15), py.getitem(this.list_sports, 5), "Andrea A. Salto", "\"Naranjita\"", "21 a\xf1os", "Adicta a las naranjas, tiene una cicatriz en el rostro que se hizo pelando una.\nDesde muy temprana edad, robaba en los puestos de fruta de su barrio aprovechando su color de pelo, que se camuflaba perfectamente con su amada fruta.", "p0_thief_small_andrea.png", "p0_thief_big_andrea_1.jpg", "p0_thief_big_andrea_2.jpg", "p0_thief_big_andrea_3.jpg");
    py.m(list_thieves, "append", t14);
    t15 = new datamodel.Thief(FEMALE, SHORT, REDHEAD, MOLE, py.getitem(this.list_animals, 1), py.getitem(this.list_sports, 6), "Ana T. Birlo", "\"La huerfanita\"", "21 a\xf1os", "Vivi\xf3 en un orfanato los primeros a\xf1os de su vida, luego fue adoptada por un magnate.\nA causa de un trauma psicol\xf3gico solo puede comunicarse con la gente a trav\xe9s del canto y el baile.\nSiempre deja para ma\xf1ana lo que puede hacer hoy.", "p0_thief_small_ana.png", "p0_thief_big_ana_1.jpg", "p0_thief_big_ana_2.jpg", "p0_thief_big_ana_3.jpg");
    py.m(list_thieves, "append", t15);
    t16 = new datamodel.Thief(FEMALE, TALL, BRUNETTE, GLASSES, py.getitem(this.list_animals, 0), py.getitem(this.list_sports, 0), "Roberta A. Ribas Lasmanos", "\"La pianista\"", "43 a\xf1os", "Excelente pianista.\nSu obra preferida es El arte de la fuga de Johann Sebastian Bach.\nFue detenida por intentar traficar armas guard\xe1ndolas dentro de su piano en una gira mundial.\nQued\xf3 en evidencia cuando se dispararon en medio de un concierto.", "p0_thief_small_roberta.png", "p0_thief_big_roberta_1.jpg", "p0_thief_big_roberta_2.jpg", "p0_thief_big_roberta_3.jpg");
    py.m(list_thieves, "append", t16);
    return list_thieves;
  }
  set_up_lair_sets(): any {
    let list_sets: any;
    list_sets = [[1, 1], [2, 2], [3, 3], [4, 4], [5, 5], [6, 6], [7, 7], [8, 8], [9, 9], [10, 10], [11, 11], [12, 12], [13, 13], [14, 14], [13, 15]];
    return list_sets;
  }
  set_up_animals(): any {
    let a1, a10, a11, a12, a13, a14, a15, a16, a2, a3, a4, a5, a6, a7, a8, a9, list_animals: any;
    list_animals = [];
    a1 = new datamodel.Animal("gato", MAMMAL, CARNIVORE, WALK);
    py.m(list_animals, "append", a1);
    a2 = new datamodel.Animal("perro", MAMMAL, CARNIVORE, WALK);
    py.m(list_animals, "append", a2);
    a3 = new datamodel.Animal("conejo", MAMMAL, HERBIVORE, WALK);
    py.m(list_animals, "append", a3);
    a4 = new datamodel.Animal("loro", BIRD, HERBIVORE, FLY);
    py.m(list_animals, "append", a4);
    a5 = new datamodel.Animal("canario", BIRD, HERBIVORE, FLY);
    py.m(list_animals, "append", a5);
    a6 = new datamodel.Animal("\xe1guila", BIRD, CARNIVORE, FLY);
    py.m(list_animals, "append", a6);
    a7 = new datamodel.Animal("ping\xfcino", BIRD, CARNIVORE, SWIM);
    py.m(list_animals, "append", a7);
    a8 = new datamodel.Animal("tortuga de tierra", REPTILE, HERBIVORE, WALK);
    py.m(list_animals, "append", a8);
    a9 = new datamodel.Animal("tortuga de r\xedo", REPTILE, CARNIVORE, SWIM);
    py.m(list_animals, "append", a9);
    a10 = new datamodel.Animal("iguana", REPTILE, HERBIVORE, WALK);
    py.m(list_animals, "append", a10);
    a11 = new datamodel.Animal("cocodrilo", REPTILE, CARNIVORE, SWIM);
    py.m(list_animals, "append", a11);
    a12 = new datamodel.Animal("tibur\xf3n", FISH, CARNIVORE, SWIM);
    py.m(list_animals, "append", a12);
    a13 = new datamodel.Animal("pira\xf1a", FISH, CARNIVORE, SWIM);
    py.m(list_animals, "append", a13);
    a14 = new datamodel.Animal("caballito de mar", FISH, CARNIVORE, SWIM);
    py.m(list_animals, "append", a14);
    a15 = new datamodel.Animal("delf\xedn", MAMMAL, CARNIVORE, SWIM);
    py.m(list_animals, "append", a15);
    a16 = new datamodel.Animal("murci\xe9lago de la fruta", MAMMAL, HERBIVORE, FLY);
    py.m(list_animals, "append", a16);
    return list_animals;
  }
  set_up_sports(): any {
    let list_sports, s1, s2, s3, s4, s5, s6, s7, s8: any;
    list_sports = [];
    s1 = new datamodel.Sport("waterpolo", AQUATIC, true, true);
    py.m(list_sports, "append", s1);
    s2 = new datamodel.Sport("nataci\xf3n", AQUATIC, false, false);
    py.m(list_sports, "append", s2);
    s3 = new datamodel.Sport("nado sincronizado", AQUATIC, true, false);
    py.m(list_sports, "append", s3);
    s4 = new datamodel.Sport("f\xfatbol", TERRESTRIAL, true, true);
    py.m(list_sports, "append", s4);
    s5 = new datamodel.Sport("golf", TERRESTRIAL, false, true);
    py.m(list_sports, "append", s5);
    s6 = new datamodel.Sport("carrera con postas", TERRESTRIAL, true, false);
    py.m(list_sports, "append", s6);
    s7 = new datamodel.Sport("carrera", TERRESTRIAL, false, false);
    py.m(list_sports, "append", s7);
    s8 = new datamodel.Sport("caminata", TERRESTRIAL, false, false);
    py.m(list_sports, "append", s8);
    return list_sports;
  }
  generate_departments_bordering_matrix(): any {
    let matrix: any;
    matrix = [];
    py.m(matrix, "append", [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0]);
    py.m(matrix, "append", [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0]);
    py.m(matrix, "append", [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1]);
    py.m(matrix, "append", [0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0]);
    py.m(matrix, "append", [0, 0, 1, 0, 0, 1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 1]);
    py.m(matrix, "append", [0, 0, 0, 1, 1, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 0, 0]);
    py.m(matrix, "append", [0, 1, 0, 0, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1]);
    py.m(matrix, "append", [0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
    py.m(matrix, "append", [0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0]);
    py.m(matrix, "append", [0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0]);
    py.m(matrix, "append", [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0]);
    py.m(matrix, "append", [0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1, 0]);
    py.m(matrix, "append", [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0]);
    py.m(matrix, "append", [0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1]);
    py.m(matrix, "append", [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1, 0]);
    py.m(matrix, "append", [0, 1, 0, 1, 0, 1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0]);
    py.m(matrix, "append", [0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0]);
    py.m(matrix, "append", [0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 1, 1, 0, 1, 0, 0, 0, 0]);
    py.m(matrix, "append", [0, 0, 1, 0, 1, 0, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0]);
    return matrix;
  }
  generate_departments_proximity_matrix(): any {
    let matrix: any;
    matrix = [];
    py.m(matrix, "append", [0, 6, 4, 6, 4, 5, 5, 7, 7, 6, 3, 4, 2, 7, 2, 6, 4, 2, 5]);
    py.m(matrix, "append", [6, 0, 4, 1, 1, 2, 1, 1, 2, 1, 3, 3, 5, 2, 5, 1, 2, 3, 3]);
    py.m(matrix, "append", [4, 4, 0, 5, 4, 5, 3, 3, 3, 4, 4, 6, 3, 3, 4, 4, 6, 2, 1]);
    py.m(matrix, "append", [6, 1, 5, 0, 2, 2, 2, 3, 3, 2, 3, 2, 5, 4, 4, 1, 2, 4, 4]);
    py.m(matrix, "append", [4, 1, 4, 2, 0, 1, 1, 3, 3, 2, 2, 2, 3, 4, 3, 1, 2, 2, 4]);
    py.m(matrix, "append", [5, 2, 5, 2, 1, 0, 1, 3, 3, 2, 2, 2, 4, 4, 3, 1, 1, 2, 4]);
    py.m(matrix, "append", [5, 1, 3, 2, 1, 1, 0, 2, 2, 1, 3, 3, 4, 3, 4, 1, 3, 3, 4]);
    py.m(matrix, "append", [7, 1, 3, 3, 3, 3, 2, 0, 1, 1, 5, 4, 6, 1, 6, 2, 4, 5, 2]);
    py.m(matrix, "append", [7, 2, 3, 3, 3, 3, 2, 1, 0, 1, 5, 4, 6, 1, 6, 2, 4, 5, 2]);
    py.m(matrix, "append", [6, 1, 4, 2, 2, 2, 1, 1, 1, 0, 4, 3, 5, 2, 5, 1, 3, 4, 3]);
    py.m(matrix, "append", [3, 3, 4, 3, 2, 2, 3, 5, 5, 4, 0, 1, 3, 6, 1, 3, 1, 2, 6]);
    py.m(matrix, "append", [4, 3, 6, 2, 2, 2, 3, 4, 4, 3, 1, 0, 5, 5, 2, 2, 1, 3, 5]);
    py.m(matrix, "append", [2, 5, 3, 5, 3, 4, 4, 6, 6, 5, 3, 5, 0, 5, 3, 5, 5, 1, 4]);
    py.m(matrix, "append", [7, 2, 3, 4, 4, 4, 3, 1, 1, 2, 6, 5, 5, 0, 7, 3, 5, 5, 2]);
    py.m(matrix, "append", [2, 5, 4, 4, 3, 3, 4, 6, 6, 5, 1, 2, 3, 7, 0, 4, 2, 2, 5]);
    py.m(matrix, "append", [6, 1, 4, 1, 1, 1, 1, 2, 2, 1, 3, 2, 5, 3, 4, 0, 2, 4, 3]);
    py.m(matrix, "append", [4, 2, 6, 2, 2, 1, 3, 4, 4, 3, 1, 1, 5, 5, 2, 2, 0, 3, 5]);
    py.m(matrix, "append", [2, 3, 2, 4, 2, 2, 3, 5, 5, 4, 2, 3, 1, 5, 2, 4, 3, 0, 3]);
    py.m(matrix, "append", [5, 3, 1, 4, 4, 4, 3, 2, 2, 3, 6, 5, 4, 2, 5, 3, 5, 3, 0]);
    return matrix;
  }
}
py.register("game/data/datastore", $self);
export function $set(name: string, v: any): void {
  switch (name) {
    case "APARICIO_SARAVIA": APARICIO_SARAVIA = v; break;
    case "AQUATIC": AQUATIC = v; break;
    case "ARMAS": ARMAS = v; break;
    case "ARTE": ARTE = v; break;
    case "ARTIGAS": ARTIGAS = v; break;
    case "BASE_REQUEST_URL": BASE_REQUEST_URL = v; break;
    case "BIRD": BIRD = v; break;
    case "BLANES": BLANES = v; break;
    case "BLONDE": BLONDE = v; break;
    case "BRUNETTE": BRUNETTE = v; break;
    case "CANELONES": CANELONES = v; break;
    case "CARNIVORE": CARNIVORE = v; break;
    case "CERRO_LARGO": CERRO_LARGO = v; break;
    case "COLONIA": COLONIA = v; break;
    case "DURAZNO": DURAZNO = v; break;
    case "ERRORS_URL": ERRORS_URL = v; break;
    case "EUSEBIO_GIMENEZ": EUSEBIO_GIMENEZ = v; break;
    case "FABINI": FABINI = v; break;
    case "FEMALE": FEMALE = v; break;
    case "FISH": FISH = v; break;
    case "FLORES": FLORES = v; break;
    case "FLORIDA": FLORIDA = v; break;
    case "FLY": FLY = v; break;
    case "FOSILES": FOSILES = v; break;
    case "GARDEL": GARDEL = v; break;
    case "GAUCHO": GAUCHO = v; break;
    case "GENERICO": GENERICO = v; break;
    case "GLASSES": GLASSES = v; break;
    case "GREY_HAIRED": GREY_HAIRED = v; break;
    case "HERBIVORE": HERBIVORE = v; break;
    case "INDIGENA": INDIGENA = v; break;
    case "LAVALLEJA": LAVALLEJA = v; break;
    case "MALDONADO": MALDONADO = v; break;
    case "MALE": MALE = v; break;
    case "MAMMAL": MAMMAL = v; break;
    case "MOLE": MOLE = v; break;
    case "MONEDAS": MONEDAS = v; break;
    case "MONTEVIDEO": MONTEVIDEO = v; break;
    case "PAYSANDU": PAYSANDU = v; break;
    case "PET": PET = v; break;
    case "REDHEAD": REDHEAD = v; break;
    case "REPTILE": REPTILE = v; break;
    case "RIO_NEGRO": RIO_NEGRO = v; break;
    case "RIVERA": RIVERA = v; break;
    case "ROCHA": ROCHA = v; break;
    case "SALTO": SALTO = v; break;
    case "SAN_JOSE": SAN_JOSE = v; break;
    case "SCAR": SCAR = v; break;
    case "SCORE_IV": SCORE_IV = v; break;
    case "SCORE_KEY": SCORE_KEY = v; break;
    case "SHORT": SHORT = v; break;
    case "SOLARI": SOLARI = v; break;
    case "SORIANO": SORIANO = v; break;
    case "SPORT": SPORT = v; break;
    case "STATS_URL": STATS_URL = v; break;
    case "SWIM": SWIM = v; break;
    case "TACUAREMBO": TACUAREMBO = v; break;
    case "TALL": TALL = v; break;
    case "TATOO": TATOO = v; break;
    case "TERRESTRIAL": TERRESTRIAL = v; break;
    case "THIEF_CAR_COLORS": THIEF_CAR_COLORS = v; break;
    case "TORRES_GARCIA": TORRES_GARCIA = v; break;
    case "TREINTA_Y_TRES": TREINTA_Y_TRES = v; break;
    case "UPDATE_URL": UPDATE_URL = v; break;
    case "VERSION": VERSION = v; break;
    case "WALK": WALK = v; break;
  }
}
