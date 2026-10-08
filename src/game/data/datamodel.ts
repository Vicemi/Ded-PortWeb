// @ts-nocheck
// Generated from the original game code (see MODLOG.md). Do not edit by hand.
import * as py from '../../runtime/py';
import * as assets from '../../engine/assets';
import * as text from '../../engine/textutil';
import * as $self from './datamodel';
const $d1: any = [];
const $d2: any = [];
const $d3: any = [];
const $d4: any = [];
const $d5: any = [];
const $d6: any = [];
const $d7: any = [];
const $d8: any = [];
const $d9: any = [];
const $d10: any = [];
const $d11: any = [];
const $d12: any = [];
const $d13: any = [];
const $d14: any = [];
const $d15: any = [];
const $d16: any = [];

export class StolenObject {
  constructor(prep: any, desc1: any, desc2: any, type: any) {
    this.type_location = type;
    this.preposition = prep;
    this.description1 = desc1;
    this.description2 = desc2;
    return;
  }
}
export class CrimeLocation {
  constructor(prep: any, name: any, dep: any, loc1: any, loc2: any = null) {
    this.preposition = prep;
    this.name = name;
    this.department = dep;
    this.type_locations = [];
    this.add_type_location(loc1);
    if ((loc2 != null)) {
      this.add_type_location(loc2);
    }
    return;
  }
  add_type_location(loc: any): any {
    py.m(this.type_locations, "append", loc);
    return null;
  }
}
export class CityPin {
  constructor(x: any, y: any, flipped: any, name: any, tag_size: any, tag_separation: any, tag_pos: any, article: any = "") {
    this.x = x;
    this.y = y;
    this.flipped = flipped;
    this.name = name;
    this.tag_size = tag_size;
    this.tag_separation = tag_separation;
    this.tag_pos = tag_pos;
    this.article = article;
    return;
  }
}
export class Department {
  constructor(name: any, image: any, image_pos: any, locator_pos: any, city_pins: any, img_medal: any, map: any) {
    this.name = name;
    this.image = image;
    this.chase_map = map;
    this.locator_pos = locator_pos;
    this.image_pos = image_pos;
    this.id_img_medal = img_medal;
    this.city_pins = city_pins;
    return;
  }
}
export class ClueType {
  constructor(type: any) {
    this.type = type;
    return;
  }
}
export class Clue {
  constructor(id: any, types: any) {
    this.id = id;
    this.list_types = types;
    return;
  }
}
export class StageClue {
  constructor(clue: any, note_item: any) {
    this.clue = clue;
    this.note_item = note_item;
    return;
  }
  build_item_message(): any {
    let article, marked, message, visiting: any;
    if (((this.clue.id === "i509") || (this.clue.id === "i529"))) {
      if ((this.note_item.type === "HILL")) {
        if ((this.note_item.article === "el")) {
          article = "del";
        } else {
          article = py.add("de ", this.note_item.article);
        }
        if ((this.note_item.article === "los")) {
          visiting = "visitarlos";
        } else {
          visiting = "visitarlo";
        }
        message = py.add(py.add(py.add(py.add(py.add(py.add("Una postal ", article), " "), this.note_item.name), ". Seguramente el ladr\xf3n piensa "), visiting), ".");
      } else if ((this.note_item.type === "LAGOON")) {
        message = py.add(py.add("Una postal de la ", this.note_item.name), ". Seguramente el ladr\xf3n piensa visitarla.");
      } else if ((this.note_item.type === "RIVER")) {
        message = py.add(py.add("Una postal del ", this.note_item.name), ". Seguramente el ladr\xf3n piensa visitarlo.");
      } else if ((this.note_item.type === "LOCATION")) {
        message = py.add(py.add("Una postal de la localidad de ", this.note_item.name), ". Seguramente el ladr\xf3n piensa visitarla.");
      } else {
        throw new py.Exception(py.add(py.add(py.add("Unknown item type ", this.note_item.type), " for clue "), this.clue.id));
      }
    } else if (((this.clue.id === "i510") || (this.clue.id === "i511"))) {
      if ((this.note_item.type === "HILL")) {
        message = py.add(py.add(py.add(py.add("Una nota. Al parecer el ladr\xf3n piensa visitar ", this.note_item.article), " "), this.note_item.name), ".");
      } else if ((this.note_item.type === "LAGOON")) {
        message = py.add(py.add("Una nota. Al parecer el ladr\xf3n piensa visitar la ", this.note_item.name), ".");
      } else if ((this.note_item.type === "RIVER")) {
        message = py.add(py.add("Una nota. Al parecer el ladr\xf3n piensa visitar el ", this.note_item.name), ".");
      } else if ((this.note_item.type === "LOCATION")) {
        message = py.add(py.add("Una nota. Al parecer el ladr\xf3n piensa visitar la localidad de ", this.note_item.name), ".");
      } else if ((this.note_item.type === "HISTORY_FACT")) {
        message = py.add(py.add(py.add(py.add(py.add(py.add("Una nota. Al parecer el ladr\xf3n piensa visitar el sitio donde ", this.note_item.sentence_start), " "), this.note_item.article), " "), this.note_item.name), ".");
      } else if ((this.note_item.type === "WRITER")) {
        message = py.add(py.add("Una nota. Al parecer el ladr\xf3n piensa visitar el lugar de nacimiento de ", this.note_item.name), ".");
      } else {
        throw new py.Exception(py.add(py.add(py.add("Unknown item type ", this.note_item.type), " for clue "), this.clue.id));
      }
    } else if ((this.clue.id === "i523")) {
      if ((this.note_item.type === "HILL")) {
        if ((this.note_item.article === "los")) {
          marked = "marcados";
          visiting = "visitarlos";
        } else {
          marked = "marcado";
          visiting = "visitarlo";
        }
        message = py.add(py.add(py.add(py.add(py.add(py.add(py.add(py.add("Un libro de geograf\xeda que tiene ", marked), " "), this.note_item.article), " "), this.note_item.name), ". Seguramente el ladr\xf3n piensa "), visiting), ".");
      } else if ((this.note_item.type === "LAGOON")) {
        message = py.add(py.add("Un libro de geograf\xeda que tiene marcada la ", this.note_item.name), ". Seguramente el ladr\xf3n piensa visitarla.");
      } else if ((this.note_item.type === "RIVER")) {
        message = py.add(py.add("Un libro de geograf\xeda que tiene marcado el ", this.note_item.name), ". Seguramente el ladr\xf3n piensa visitarlo.");
      } else if ((this.note_item.type === "HISTORY_FACT")) {
        message = py.add(py.add(py.add(py.add(py.add(py.add("Un libro de historia sobre ", this.note_item.article), " "), this.note_item.name), ". Seguramente el ladr\xf3n piensa visitar el sitio donde "), this.note_item.sentence_start), ".");
      } else if ((this.note_item.type === "LOCATION")) {
        message = py.add(py.add("Un libro de geograf\xeda que tiene marcada la localidad de ", this.note_item.name), ". Seguramente el ladr\xf3n piensa visitarla.");
      } else if ((this.note_item.type === "WRITER")) {
        message = py.add(py.add("Un libro de ", this.note_item.name), ". Seguramente el ladr\xf3n piensa visitar su lugar de nacimiento.");
      } else {
        throw new py.Exception(py.add(py.add(py.add("Unknown item type ", this.note_item.type), " for clue "), this.clue.id));
      }
    } else if ((this.clue.id === "i526")) {
      if ((this.note_item.type === "HILL")) {
        if ((this.note_item.article === "los")) {
          visiting = "visitarlos";
        } else {
          visiting = "visitarlo";
        }
        message = py.add(py.add(py.add(py.add("Un CD con el t\xedtulo \"", this.note_item.name), "\". Seguramente el ladr\xf3n piensa "), visiting), ".");
      } else if ((this.note_item.type === "LAGOON")) {
        message = py.add(py.add("Un CD con el t\xedtulo \"", this.note_item.name), "\". Seguramente el ladr\xf3n piensa visitarla.");
      } else if ((this.note_item.type === "RIVER")) {
        message = py.add(py.add("Un CD con el t\xedtulo \"", this.note_item.name), "\". Seguramente el ladr\xf3n piensa visitarlo.");
      } else if ((this.note_item.type === "HISTORY_FACT")) {
        message = py.add(py.add(py.add(py.add("Un CD con el t\xedtulo \"", this.note_item.name), "\". Seguramente el ladr\xf3n piensa visitar el sitio donde "), this.note_item.sentence_start), ".");
      } else if ((this.note_item.type === "LOCATION")) {
        message = py.add(py.add("Un CD con el t\xedtulo \"", this.note_item.name), " y sus habitantes\". Seguramente el ladr\xf3n piensa visitar esa localidad.");
      } else if ((this.note_item.type === "WRITER")) {
        message = py.add(py.add("Un CD con el t\xedtulo \"Vida y obra de ", this.note_item.name), "\". Seguramente el ladr\xf3n piensa visitar su lugar de nacimiento.");
      } else {
        throw new py.Exception(py.add(py.add(py.add("Unknown item type ", this.note_item.type), " for clue "), this.clue.id));
      }
    } else if ((this.clue.id === "i527")) {
      if ((this.note_item.type === "HILL")) {
        if ((this.note_item.article === "los")) {
          visiting = "visitarlos";
        } else {
          visiting = "visitarlo";
        }
        message = py.add(py.add(py.add(py.add(py.add(py.add("Un mapa que tiene marcado ", this.note_item.article), " "), this.note_item.name), ". Seguramente el ladr\xf3n piensa "), visiting), ".");
      } else if ((this.note_item.type === "LAGOON")) {
        message = py.add(py.add("Un mapa que tiene marcada la ", this.note_item.name), ". Seguramente el ladr\xf3n piensa visitarla.");
      } else if ((this.note_item.type === "RIVER")) {
        message = py.add(py.add("Un mapa que tiene marcado el ", this.note_item.name), ". Seguramente el ladr\xf3n piensa visitarlo.");
      } else if ((this.note_item.type === "LOCATION")) {
        message = py.add(py.add("Un mapa que tiene marcada la localidad de ", this.note_item.name), ". Seguramente el ladr\xf3n piensa visitarla.");
      } else {
        throw new py.Exception(py.add(py.add(py.add("Unknown item type ", this.note_item.type), " for clue "), this.clue.id));
      }
    } else if ((this.clue.id === "i528")) {
      if ((this.note_item.type === "HILL")) {
        message = py.add(py.add(py.add(py.add("Un papel arrugado. Por lo que dice, el ladr\xf3n piensa visitar ", this.note_item.article), " "), this.note_item.name), ".");
      } else if ((this.note_item.type === "LAGOON")) {
        message = py.add(py.add("Un papel arrugado. Por lo que dice, el ladr\xf3n piensa visitar la ", this.note_item.name), ".");
      } else if ((this.note_item.type === "RIVER")) {
        message = py.add(py.add("Un papel arrugado. Por lo que dice, el ladr\xf3n piensa visitar el ", this.note_item.name), ".");
      } else if ((this.note_item.type === "HISTORY_FACT")) {
        message = py.add(py.add(py.add(py.add(py.add(py.add("Por lo que dice, el ladr\xf3n piensa visitar el sitio donde ", this.note_item.sentence_start), " "), this.note_item.article), " "), this.note_item.name), ".");
      } else if ((this.note_item.type === "LOCATION")) {
        message = py.add(py.add("Un papel arrugado. Por lo que dice, el ladr\xf3n piensa visitar la localidad de ", this.note_item.name), ".");
      } else if ((this.note_item.type === "WRITER")) {
        message = py.add(py.add("Un papel arrugado. Por lo que dice, el ladr\xf3n piensa visitar el lugar de nacimiento de ", this.note_item.name), ".");
      } else {
        throw new py.Exception(py.add(py.add(py.add("Unknown item type ", this.note_item.type), " for clue "), this.clue.id));
      }
    } else {
      message = "Esto no parece ser una pista interesante...";
    }
    return message;
  }
  build_right_department_message(dep: any): any {
    let article, message, subject, verb: any;
    if ((this.note_item.type === "HILL")) {
      article = this.note_item.article;
      if ((article === "los")) {
        verb = "est\xe1n ubicados";
      } else {
        verb = "est\xe1 ubicado";
      }
      article = py.add(py.m(py.getitem(article, 0), "upper"), py.slice(article, 1, null));
      message = py.add(py.add(py.add(py.add(py.add(py.add(py.add(article, " &#c144,22,22!"), this.note_item.name), "&#c! "), verb), " en el departamento de &#c144,22,22!"), dep.name), "&#c!.");
    } else if ((this.note_item.type === "LAGOON")) {
      if ((py.len(this.note_item.list_departments) > 1)) {
        message = py.add(py.add(py.add(py.add("La &#c144,22,22!", this.note_item.name), " limita con el departamento de &#c144,22,22!"), dep.name), "&#c!.");
      } else {
        message = py.add(py.add(py.add(py.add("La &#c144,22,22!", this.note_item.name), "&#c! est\xe1 ubicada en el departamento de &#c144,22,22!"), dep.name), "&#c!.");
      }
    } else if ((this.note_item.type === "RIVER")) {
      if ((py.len(this.note_item.list_departments) > 1)) {
        message = py.add(py.add(py.add(py.add("El &#c144,22,22!", this.note_item.name), "&#c! pasa por el departamento de &#c144,22,22!"), dep.name), "&#c!.");
      } else {
        message = py.add(py.add(py.add(py.add("El &#c144,22,22!", this.note_item.name), "&#c! est\xe1 ubicado en el departamento de &#c144,22,22!"), dep.name), "&#c!.");
      }
    } else if ((this.note_item.type === "LOCATION")) {
      message = py.add(py.add(py.add(py.add("La localidad de &#c144,22,22!", this.note_item.name), "&#c! est\xe1 situada en el departamento de &#c144,22,22!"), dep.name), "&#c!.");
    } else if ((this.note_item.type === "HISTORY_FACT")) {
      article = this.note_item.article;
      article = py.add(py.m(py.getitem(article, 0), "upper"), py.slice(article, 1, null));
      message = py.add(py.add(py.add(py.add(py.add(py.add(py.add(article, " &#c144,22,22!"), this.note_item.name), "&#c! "), this.note_item.sentence_start), " en el departamento de &#c144,22,22!"), dep.name), "&#c!.");
    } else if ((this.note_item.type === "WRITER")) {
      if ((this.note_item.sex === "M")) {
        subject = "El escritor ";
      } else {
        subject = "La escritora ";
      }
      message = py.add(py.add(py.add(py.add(py.add(subject, "&#c144,22,22!"), this.note_item.name), "&#c! naci\xf3 en el departamento de &#c144,22,22!"), dep.name), "&#c!.");
    } else {
      message = "";
    }
    return message;
  }
}
export class Notes {
  constructor(items: any) {
    this.items = items;
    return;
  }
}
export class NoteItem {
  constructor(name: any, type: any, distinction: any = null) {
    this.name = name;
    this.type = type;
    this.distinction = distinction;
    return;
  }
  get_full_name(): any {
    if (py.truthy(this.distinction)) {
      return py.fmt("%s (%s)", [this.name, this.distinction]);
    }
    return this.name;
  }
}
export class RiverNote extends NoteItem {
  constructor(name: any, dep_list: any, len: any, basin: any, desc1: any, desc2: any) {
    super(name, "RIVER");
    this.list_departments = dep_list;
    this.length = len;
    this.basin = basin;
    this.description1 = desc1;
    this.description2 = desc2;
    return;
  }
  get_departments(): any {
    return this.list_departments;
  }
}
export class LagoonNote extends NoteItem {
  constructor(name: any, dep_list: any, surface: any, desc1: any, desc2: any) {
    super(name, "LAGOON");
    this.list_departments = dep_list;
    this.surface = surface;
    this.description1 = desc1;
    this.description2 = desc2;
    return;
  }
  get_departments(): any {
    return this.list_departments;
  }
}
export class HillNote extends NoteItem {
  constructor(name: any, article: any, dep: any, height: any, desc1: any, desc2: any) {
    super(name, "HILL");
    this.department = dep;
    this.article = article;
    this.height = height;
    this.description1 = desc1;
    this.description2 = desc2;
    return;
  }
  get_departments(): any {
    return [this.department];
  }
}
export class HistoryFactNote extends NoteItem {
  constructor(s_start: any, article: any, name: any, dep_list: any, date: any, desc1: any, desc2: any) {
    super(name, "HISTORY_FACT");
    this.sentence_start = s_start;
    this.article = article;
    this.list_departments = dep_list;
    this.date = date;
    this.description1 = desc1;
    this.description2 = desc2;
    return;
  }
  get_departments(): any {
    return this.list_departments;
  }
}
export class LocationNote extends NoteItem {
  constructor(name: any, dep: any, loc_type: any, s_start: any, population: any, desc: any, distinction: any = null) {
    super(name, "LOCATION", distinction);
    this.department = dep;
    this.location_type = loc_type;
    this.sentence_start = s_start;
    this.population = population;
    this.description = desc;
    return;
  }
  get_departments(): any {
    return [this.department];
  }
}
export class WriterNote extends NoteItem {
  constructor(name: any, sex: any, dep: any, dates: any, desc: any) {
    super(name, "WRITER");
    this.sex = sex;
    this.department = dep;
    this.dates = dates;
    this.description = desc;
    return;
  }
  get_departments(): any {
    return [this.department];
  }
}
export class Witness {
  constructor(name: any, img: any) {
    this.image = img;
    this.name = name;
    this.identikit_added = false;
    this.department = "";
    this.city = "";
    return;
  }
}
export class JanitorStatement {
  constructor(text: any = null, type: any = null, sex: any = null, cat1: any = null, cat2: any = null, cat3: any = null) {
    this.type = type;
    this.category1 = cat1;
    this.category2 = cat2;
    this.category3 = cat3;
    this.text = text;
    this.thief_sex = sex;
    return;
  }
}
export class Statement {
  constructor(text: any) {
    this.text = text;
    return;
  }
}
export class IdentikitStatement {
  constructor(text: any, sex_f: any, height_f: any, hair_f: any, distinctive_f: any) {
    this.text = text;
    this.sex_feature = sex_f;
    this.height_feature = height_f;
    this.hair_feature = hair_f;
    this.distinctive_feature = distinctive_f;
    return;
  }
}
export class WitnessStatement {
  constructor(intro_s: any, j_s: any, i_s: any, l_s: any = null) {
    this.intro_statement = intro_s;
    this.janitor_statement = j_s;
    this.location_statement = l_s;
    this.identikit_statement = i_s;
    return;
  }
  are_equal(s: any): any {
    let result: any;
    result = py.and(py.eq(this.intro_statement, s.intro_statement), () => py.and(py.eq(this.janitor_statement, s.janitor_statement), () => py.and(py.eq(this.location_statement, s.location_statement), () => py.eq(this.identikit_statement, s.identikit_statement))));
    return result;
  }
}
export class Thief {
  constructor(sex: any, height: any, hair: any, d_feature: any, pet: any, sport: any, name: any, nick: any, age: any, desc: any, i_img: any, i_l_img_f: any, i_l_img_s: any, i_p3_img: any) {
    this.name = name;
    this.nickname = nick;
    this.age = age;
    this.description = desc;
    this.sex = sex;
    this.height = height;
    this.hair = hair;
    this.distinctive_feature = d_feature;
    this.animal = pet;
    this.sport = sport;
    this.identikit_image = i_img;
    this.identikit_large_image_side = i_l_img_s;
    this.identikit_large_image_front = i_l_img_f;
    this.phase3_image = i_p3_img;
    return;
  }
  new_thief(c: any): any {
    py.print("");
    return null;
  }
  open_thief(char_name: any): any {
    py.print("");
    return null;
  }
  delete_character(char_name: any): any {
    py.print("");
    return null;
  }
}
export class CharacterInfo {
  constructor(active: any, id: any, name: any, avatar: any, sex: any, location: any, range_level: any) {
    this.active = active;
    this.id = id;
    this.name = name;
    this.avatar = avatar;
    this.sex = sex;
    this.location = location;
    this.range_level = range_level;
    return;
  }
}
export class Character {
  constructor(charinfo: any, dep: any, uuid: any) {
    let image_name: any;
    this.charinfo = charinfo;
    this.department = dep;
    this.uuid = uuid;
    image_name = "p0_detective_";
    if ((charinfo.sex === "M")) {
      image_name = py.add(image_name, "male_");
    } else {
      image_name = py.add(image_name, "female_");
    }
    image_name = py.add(image_name, py.fmt("%03d", charinfo.avatar));
    this.avatar_image = assets.load_image(py.add(image_name, ".png"));
    this.avatar_rollover_image = assets.load_image(py.add(image_name, "_rollover.png"));
    this.avatar_asleep_image = assets.load_image(py.add(image_name, "_asleep.png"));
    if ((charinfo.sex === "M")) {
      if ((charinfo.avatar === 1)) {
        this.avatar_asleep_pos = [77, 41];
      } else if ((charinfo.avatar === 2)) {
        this.avatar_asleep_pos = [58, 58];
      } else if ((charinfo.avatar === 3)) {
        this.avatar_asleep_pos = [79, 35];
      } else if ((charinfo.avatar === 4)) {
        this.avatar_asleep_pos = [76, 44];
      } else {
        throw new py.Exception("Missing asleep position");
      }
    } else if ((charinfo.avatar === 1)) {
      this.avatar_asleep_pos = [67, 51];
    } else if ((charinfo.avatar === 2)) {
      this.avatar_asleep_pos = [47, 19];
    } else if ((charinfo.avatar === 3)) {
      this.avatar_asleep_pos = [54, 42];
    } else if ((charinfo.avatar === 4)) {
      this.avatar_asleep_pos = [70, 50];
    } else {
      throw new py.Exception("Missing asleep position");
    }
    return;
  }
}
export class HighscoreCharacter {
  constructor(name: any, uuid: any, score: any) {
    this.name = name;
    this.uuid = uuid;
    this.score = score;
    return;
  }
}
export class CharacterProgress {
  constructor(char: any, score: any = 0, resolved_cases: any = 0, medals: any = $d1, l_dep_solved: any = $d2, gardener_seen: any = false, shoptender_seen: any = false, librarian_seen: any = false, bricklayer_seen: any = false, phase2_help: any = false, phase3_help: any = false, identikit_help: any = false, show_folder: any = false, show_notes_animation: any = false, notes: any = $d3, new_notes: any = $d4, bricklayer_pictures_seen: any = $d5, last_help_step_seen: any = 0, captured_thieves: any = $d6) {
    this.character = char;
    this.score = score;
    this.resolved_cases = resolved_cases;
    this.medals = medals;
    this.list_departments_solved = l_dep_solved;
    this.minigame_gardener_help_seen = gardener_seen;
    this.minigame_shoptender_help_seen = shoptender_seen;
    this.minigame_librarian_help_seen = librarian_seen;
    this.minigame_bricklayer_help_seen = bricklayer_seen;
    this.phase2_help = phase2_help;
    this.phase3_help = phase3_help;
    this.identikit_help = identikit_help;
    this.show_folder = show_folder;
    this.show_notes_animation = show_notes_animation;
    this.notes = notes;
    this.new_notes = new_notes;
    this.bricklayer_pictures_seen = bricklayer_pictures_seen;
    this.case = null;
    this.last_help_step_seen = last_help_step_seen;
    this.range = new Range(this);
    this.captured_thieves = captured_thieves;
    return;
  }
  set_case(c: any): any {
    this.case = c;
    return null;
  }
  add_medal(name: any): any {
    let medal: any;
    for (medal of py.iter(this.medals)) {
      if (py.eq(medal.name, name)) {
        if ((medal.count < 999)) {
          medal.count = medal.count + 1;
        }
        return null;
      }
    }
    py.m(this.medals, "append", new Medal(name, 1));
    return null;
  }
}
export class Range {
  constructor(character_progress: any) {
    this._Range__character_progress = character_progress;
    this.level = 0;
    this.update();
    return;
  }
  update(): any {
    let previous_level, resolved_cases: any;
    resolved_cases = this._Range__character_progress.resolved_cases;
    previous_level = this.level;
    if ((resolved_cases < 3)) {
      this.level = 0;
      this.next_range_cases = 3;
      this.distance = 2;
      this.time_limit_percentage = 2;
      this.max_departments = 3;
      this.minigame_level = 1;
    } else if ((resolved_cases < 6)) {
      this.level = 1;
      this.next_range_cases = 6;
      this.distance = 3;
      this.time_limit_percentage = 1.8;
      this.max_departments = 5;
      this.minigame_level = 1;
    } else if ((resolved_cases < 10)) {
      this.level = 2;
      this.next_range_cases = 10;
      this.distance = 4;
      this.time_limit_percentage = 1.6;
      this.max_departments = 7;
      this.minigame_level = 2;
    } else if ((resolved_cases < 14)) {
      this.level = 3;
      this.next_range_cases = 14;
      this.distance = 5;
      this.time_limit_percentage = 1.4;
      this.max_departments = 10;
      this.minigame_level = 2;
    } else if ((resolved_cases < 18)) {
      this.level = 4;
      this.next_range_cases = 18;
      this.distance = 6;
      this.time_limit_percentage = 1.2;
      this.max_departments = 13;
      this.minigame_level = 3;
    } else {
      this.level = 5;
      this.next_range_cases = null;
      this.distance = 7;
      this.time_limit_percentage = 1;
      this.max_departments = 18;
      this.minigame_level = 3;
    }
    this._Range__character_progress.character.charinfo.range_level = this.level;
    return !py.eq(previous_level, this.level);
  }
}
export function get_range_name(level: any): any {
  if ((level === 0)) {
    return "Agente";
  } else {
    if ((level === 1)) {
      return "Oficial";
    }
    if ((level === 2)) {
      return "Sub Comisario";
    }
    if ((level === 3)) {
      return "Comisario";
    }
    if ((level === 4)) {
      return "Inspector";
    }
    return "Inspector en jefe";
  }
  return null;
}
export class Medal {
  constructor(name: any, count: any) {
    this.name = name;
    this.count = count;
    return;
  }
}
export class Case {
  constructor(n: any = null, ldl: any = null, ldv: any = null, cl: any = null, so: any = null, tl: any = null, ts: any = null, cf: any = null, wwv: any = false, t: any = null, aot: any = null, ci: any = false, list_t: any = $d7, list_w: any = $d8, list_ws: any = $d9, list_wv: any = $d10, list_wf: any = $d11, list_d: any = $d12, list_tc: any = $d13, list_pd: any = $d14, tls: any = 1, list_c: any = $d15, list_sf: any = $d16, ct: any = null, tcc: any = null) {
    this.number = n;
    this.last_department_lair = ldl;
    this.last_department_visited = ldv;
    this.crime_location = cl;
    this.stolen_object = so;
    this.time_limit = tl;
    this.time_spend = ts;
    this.clues_found = cf;
    this.wrong_witness_visited = wwv;
    this.thief = t;
    this.arrest_order_thief = aot;
    this.clues_identified = ci;
    this.list_thieves = list_t;
    this.list_witnesses = list_w;
    this.list_witness_statements = list_ws;
    this.list_visited_witnesses = list_wv;
    this.list_folder_witnesses = list_wf;
    this.list_departments = list_d;
    this.list_target_cities = list_tc;
    this.list_posible_departments = list_pd;
    this.thief_lair_set = tls;
    this.list_stage_clues = list_c;
    this.list_selected_features = list_sf;
    this.caught_thief = ct;
    this.thief_car_color = tcc;
    if (!py.truthy(this.time_spend)) {
      this.time_spend = 0;
    }
    return;
  }
  update_visited_witnesses(witness_visited: any): any {
    if (!py.contains(this.list_visited_witnesses, witness_visited)) {
      py.m(this.list_visited_witnesses, "append", witness_visited);
    }
    return null;
  }
  actual_days(): any {
    let days, hours, t: any;
    t = this.time_spend;
    days = (py.int(py.div(t, 8)) + 1);
    hours = py.add(py.add(t, ((-8) * py.int(py.div(t, 8)))), 12);
    return [days, hours];
  }
  get_turns(days: any, hour: any): any {
    return py.add(((days - 1) * 8), (hour - 12));
  }
  enough_time_left(): any {
    if ((this.time_limit > this.time_spend)) {
      return true;
    } else {
      return false;
    }
    return null;
  }
  _turns_to_time(t: any): any {
    return [(py.int(py.div(t, 8)) + 1), py.add(py.mod(t, 8), 12)];
  }
  get_time_limit(): any {
    return this._turns_to_time(this.time_limit);
  }
  get_full_text(user_character: any, user_character_progress: any): any {
    let agent, begin_highlight, days, department, end_highlight, full_text, hour, place, place_prep, sex, stolen_obj, stolen_obj2, stolen_obj_prep, text1, text2, text3, text4, text5, text6, text7, text8, text9, time: any;
    place_prep = this.crime_location.preposition;
    place = this.crime_location.name;
    stolen_obj_prep = this.stolen_object.preposition;
    stolen_obj = this.stolen_object.description1;
    stolen_obj2 = this.stolen_object.description2;
    if ((user_character_progress.case.thief.sex === 1)) {
      sex = "Masculino";
    } else {
      sex = "Femenino";
    }
    department = this.crime_location.department.name;
    [days, hour] = this._turns_to_time(this.time_limit);
    time = py.add(py.add(py.add(py.add("d\xeda ", py.str(days)), " a las "), py.str(hour)), " horas ");
    agent = user_character.charinfo.name;
    text1 = "Robo en ";
    text2 = " de ";
    text3 = ".\n\nEl director del museo report\xf3 la desaparici\xf3n ";
    text4 = " de su colecci\xf3n.\n\nVarios testigos afirman haber visto una silueta de aspecto sospechoso retirarse de la escena del crimen durante la noche, todos coinciden en que se trataba de una persona del sexo ";
    text5 = ".\n\nPor las caracter\xedsticas del caso se sospecha que sea otra fechor\xeda de la organizaci\xf3n criminal C.U.L.T. por lo que la Intendencia de ";
    text6 = " se ha puesto en contacto con nuestra divisi\xf3n para resolver este caso.\n\nContamos contigo para que encuentres al ladr\xf3n y devuelvas ";
    text7 = " a su respectivo due\xf1o antes del ";
    text8 = py.add(py.add("o ser\xe1 demasiado tarde para atraparlo.\n\nBuena suerte ", text.to_lower(get_range_name(user_character_progress.range.level))), "\n");
    text9 = "!";
    begin_highlight = "&#c149,0,0!";
    end_highlight = "&#c!";
    full_text = py.add(py.add(py.add(py.add(py.add(py.add(py.add(py.add(py.add(py.add(py.add(py.add(py.add(py.add(py.add(py.add(py.add(py.add(py.add(py.add(py.add(py.add(py.add(py.add(py.add(py.add(py.add(py.add(py.add(py.add(py.add(py.add(py.add(py.add(py.add(py.add(text1, place_prep), " "), begin_highlight), place), end_highlight), text2), begin_highlight), department), end_highlight), text3), stolen_obj_prep), " "), begin_highlight), stolen_obj), end_highlight), text4), begin_highlight), sex), end_highlight), text5), begin_highlight), department), end_highlight), text6), begin_highlight), stolen_obj2), end_highlight), text7), begin_highlight), time), end_highlight), text8), begin_highlight), agent), end_highlight), text9);
    return full_text;
  }
}
export class Animal {
  constructor(name: any, clas: any, diet: any, mov: any) {
    this.name = name;
    this.classification = clas;
    this.diet = diet;
    this.movement = mov;
    return;
  }
}
export class Sport {
  constructor(name: any, cat: any, team: any, ball: any) {
    this.name = name;
    this.category = cat;
    this.team = team;
    this.ball = ball;
    return;
  }
}
py.register("game/data/datamodel", $self);
