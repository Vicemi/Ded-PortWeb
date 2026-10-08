// @ts-nocheck
// Generated from the original game code (see MODLOG.md). Do not edit by hand.
import * as py from '../../runtime/py';
import { ItemEvent } from '../../runtime/prelude';
import { ItemImage } from '../../runtime/prelude';
import { ItemText } from '../../runtime/prelude';
import { Layer } from '../../runtime/prelude';
import { Rect } from '../../runtime/prelude';
import * as animations from '../../engine/animations';
import * as assets from '../../engine/assets';
import { pygame } from '../../runtime/prelude';
import { random } from '../../runtime/py';
import * as text from '../../engine/textutil';

export class Help {
  constructor(stage: any, hide_up: any = false, include_ui_help: any = false) {
    this.stage = stage;
    this.hide_up = hide_up;
    this.include_ui_help = include_ui_help;
    this.ui_page_count = 4;
    this.guide_page_count = 9;
    this.layer = new Layer();
    this.current_layer = new Layer();
    this.previous_layer = new Layer();
    this.button_layer = new Layer();
    this.continue_sound = stage.click_sound;
    this.rollover_sound = stage.rollover_sound;
    this.help_sound = assets.load_sound("p0_help.ogg");
    return;
  }
  show_help(page: any, show_nextprevious: any, show_empty_background: any, close_callback: any = null, page_range: any = null): any {
    this.page = page;
    this.show_nextprevious = show_nextprevious;
    this.close_callback = close_callback;
    this.page_range = page_range;
    if ((py.truthy(this.include_ui_help) && (page === 1))) {
      this.ui_help = true;
    } else {
      this.ui_help = false;
    }
    this.load_help_shared_data();
    this.stage.show_dialog(this.layer, py.bind(this, "handle_event"));
    if (py.truthy(show_empty_background)) {
      this.stage.blind_dialog(this.layer, animations.BlindDirection.SHOW_DOWN, true, [], py.bind(this, "blind_show_help_callback"));
    } else {
      this.blind_show_help_callback(this.layer, true);
    }
    return null;
  }
  close_help(): any {
    let blind_direction: any;
    if (py.truthy(this.hide_up)) {
      blind_direction = animations.BlindDirection.HIDE_UP;
    } else {
      blind_direction = animations.BlindDirection.HIDE_DOWN;
    }
    this.stage.blind_dialog(this.layer, blind_direction, true, [], py.bind(this, "blind_close_help_callback"));
    return null;
  }
  blind_show_help_callback(layer: any, blind_background: any = false): any {
    this.set_up_help_dialog();
    this.set_up_help_page();
    this.stage.add_layer(this.previous_layer);
    this.stage.add_layer(this.current_layer);
    this.stage.add_layer(this.button_layer);
    this.stage.blind_dialog(this.layer, animations.BlindDirection.SHOW_DOWN, blind_background, []);
    this.stage.render();
    animations.wait(this.stage, 100, py.bind(this, "play_help_sound"));
    return null;
  }
  play_help_sound(): any {
    this.help_sound.play();
    return null;
  }
  load_help_shared_data(): any {
    let background_image: any;
    background_image = assets.load_image("p0_tutorial_remake_background.png");
    this.background_item = new ItemImage(51, 27, background_image);
    this.font_20_bold = assets.load_font("evilgeniusbb_bld.ttf", 20);
    this.font_13 = assets.load_font("evilgeniusbb_reg.ttf", 13);
    this.font_13_bold = assets.load_font("evilgeniusbb_bld.ttf", 13);
    this.close_button_image = assets.load_image("p0_tutorial_remake_btn_close_normal.png");
    this.close_button_rollover_image = assets.load_image("p0_tutorial_remake_btn_close_rollover.png");
    if (py.truthy(this.show_nextprevious)) {
      this.next_button_image = assets.load_image("p0_tutorial_remake_btn_next_normal.png");
      this.next_button_rollover_image = assets.load_image("p0_tutorial_remake_btn_next_rollover.png");
      this.previous_button_image = assets.load_image("p0_tutorial_remake_btn_prev_normal.png");
      this.previous_button_rollover_image = assets.load_image("p0_tutorial_remake_btn_prev_rollover.png");
    }
    this.continue_sound = assets.load_sound("GUI_Click.ogg");
    return null;
  }
  set_up_help_dialog(): any {
    let close_button_item: any;
    this.layer.empty();
    py.m(this.layer, "add", this.background_item);
    close_button_item = new ItemImage(261, 382, this.close_button_image);
    close_button_item.set_rollover_image(this.close_button_rollover_image, this.rollover_sound);
    close_button_item.add_event_handler(ItemEvent.CLICK, py.bind(this, "close_button_click"));
    py.m(this.button_layer, "add", close_button_item);
    if (py.truthy(this.show_nextprevious)) {
      this.previous_button_item = new ItemImage(220, 386, this.previous_button_image);
      this.previous_button_item.set_rollover_image(this.previous_button_rollover_image, this.rollover_sound);
      this.previous_button_item.add_event_handler(ItemEvent.CLICK, py.bind(this, "previous_button_click"));
      py.m(this.button_layer, "add", this.previous_button_item);
      this.next_button_item = new ItemImage(356, 386, this.next_button_image);
      this.next_button_item.set_rollover_image(this.next_button_rollover_image, this.rollover_sound);
      this.next_button_item.add_event_handler(ItemEvent.CLICK, py.bind(this, "next_button_click"));
      py.m(this.button_layer, "add", this.next_button_item);
    }
    return null;
  }
  set_up_help_page(): any {
    let additional_fonts, area, example_image, example_item, from_page, item, items, message, number_item, police_image, police_item, text1_item, text2_item, text3_item, text_item, to_page: any;
    items = [];
    for (item of py.iter(this.current_layer.items)) {
      py.m(items, "append", item);
    }
    this.previous_layer.empty();
    this.current_layer.empty();
    for (item of py.iter(items)) {
      py.m(this.previous_layer, "add", item);
    }
    if (py.truthy(this.ui_help)) {
      if ((this.page === 1)) {
        example_image = assets.load_image("p0_tut_nuevo_interface_notext_001.jpg");
        example_item = new ItemImage(69, 89, example_image);
        py.m(this.current_layer, "add", example_item);
        message = "DEPARTAMENTO\nACTUAL";
        text1_item = new ItemText(173, 178, this.font_13, 12, message, [0, 0, 0], null, 115, 50, 1, 1, null);
        py.m(this.current_layer, "add", text1_item);
        message = "D\xcdA & HORA";
        text2_item = new ItemText(292, 178, this.font_13, 12, message, [0, 0, 0], null, 115, 30, 3, 1, null);
        py.m(this.current_layer, "add", text2_item);
        message = "AQU\xcd PUEDES VER TODA LA\nINFORMACI\xd3N SOBRE\n&#c150,6,3!TU DETECTIVE&#c!";
        text3_item = new ItemText(219, 245, this.font_13, 12, message, [0, 0, 0], null, 176, 52, 1, 1, null);
        py.m(this.current_layer, "add", text3_item);
        police_image = assets.load_image("p0_tutorial_remake_policeman_pos1.png");
        police_item = new ItemImage(394, 69, police_image);
        py.m(this.current_layer, "add", police_item);
      } else if ((this.page === 2)) {
        example_image = assets.load_image("p0_tut_nuevo_interface_notext_002.jpg");
        example_item = new ItemImage(69, 89, example_image);
        py.m(this.current_layer, "add", example_item);
        message = "AQU\xcd VER\xc1S LOS &#c150,6,3!OBJETOS&#c! QUE\nENCUENTRES AL INVESTIGAR EL\nESCONDITE DEL LADR\xd3N.";
        text1_item = new ItemText(193, 156, this.font_13, 12, message, [0, 0, 0], null, 195, 60, 2, 1, null);
        py.m(this.current_layer, "add", text1_item);
        police_image = assets.load_image("p0_tutorial_remake_policeman_pos1.png");
        police_item = new ItemImage(394, 69, police_image);
        py.m(this.current_layer, "add", police_item);
      } else if ((this.page === 3)) {
        example_image = assets.load_image("p0_tut_nuevo_interface_notext_003.jpg");
        example_item = new ItemImage(69, 89, example_image);
        py.m(this.current_layer, "add", example_item);
        message = "CON ESTE &#c150,6,3!MAPA&#c! PUEDES\n&#c150,6,3!VIAJAR&#c! POR TODO EL PA\xcdS\nPARA ATRAPAR AL LADR\xd3N.";
        text1_item = new ItemText(110, 135, this.font_13, 12, message, [0, 0, 0], null, 235, 47, 3, 1, null);
        py.m(this.current_layer, "add", text1_item);
        message = "AQU\xcd PUEDES VER TODA LA\n&#c150,6,3!INFORMACI\xd3N&#c! SOBRE EL CASO Y\n&#c150,6,3!HACER EL IDENTIKIT&#c! DEL LADR\xd3N.";
        text2_item = new ItemText(110, 189, this.font_13, 12, message, [0, 0, 0], null, 235, 47, 3, 1, null);
        py.m(this.current_layer, "add", text2_item);
        message = "AQU\xcd PUEDES VER TODOS LOS\n&#c150,6,3!DATOS&#c! QUE HAYAS OBTENIDO\nSOBRE NUESTRO PA\xcdS.";
        text3_item = new ItemText(110, 248, this.font_13, 12, message, [0, 0, 0], null, 235, 47, 3, 1, null);
        py.m(this.current_layer, "add", text3_item);
        police_image = assets.load_image("p0_tutorial_remake_policeman_pos1.png");
        police_item = new ItemImage(394, 69, police_image);
        py.m(this.current_layer, "add", police_item);
      } else if ((this.page === 4)) {
        example_image = assets.load_image("p0_tut_nuevo_interface_notext_004.jpg");
        example_item = new ItemImage(69, 89, example_image);
        py.m(this.current_layer, "add", example_item);
        message = "PRESIONANDO LA TECLA &#c150,6,3!\"X\"&#c! ACCEDES AL MEN\xda\nPRINCIPAL. EL PROGRESO DE TU DETECTIVE\nQUEDA GUARDADO AUTOM\xc1TICAMENTE.";
        text1_item = new ItemText(147, 100, this.font_13, 12, message, [0, 0, 0], null, 286, 45, 3, 1, null);
        py.m(this.current_layer, "add", text1_item);
        police_image = assets.load_image("p0_tutorial_remake_policeman_pos1.png");
        police_item = new ItemImage(394, 69, police_image);
        py.m(this.current_layer, "add", police_item);
      }
    } else if ((this.page === 1)) {
      example_image = assets.load_image("p0_tutorial_remake_d1.jpg");
      example_item = new ItemImage(67, 140, example_image);
      py.m(this.current_layer, "add", example_item);
      number_item = new ItemText(264, 133, this.font_20_bold, 0, py.str(this.page), [144, 22, 22], null, 66, 25, 2, 1);
      py.m(this.current_layer, "add", number_item);
      additional_fonts = py.mkdict([["bold", [this.font_13_bold, 16, (-2)]]]);
      if (!py.truthy(this.include_ui_help)) {
        message = "&#c144,22,22!&#f:bold!Saludos Agente.&#f!&#c!\n";
      } else {
        message = "";
      }
      message = py.add(message, py.add("te har\xe9 una breve rese\xf1a de los\n", "&#f:bold!pasos a seguir para atrapar al ladr\xf3n.&#f!"));
      text1_item = new ItemText(114, 84, this.font_13, 16, message, [0, 0, 0], null, 364, 50, 2, 2, additional_fonts);
      py.m(this.current_layer, "add", text1_item);
      message = "Interroga a &#c144,22,22!&#f:bold!los testigos&#f!&#c! que han visto actividades sospechosas.";
      text2_item = new ItemText(171, 162, this.font_13, 16, message, [0, 0, 0], null, 243, 35, 2, 2, additional_fonts);
      py.m(this.current_layer, "add", text2_item);
      police_image = assets.load_image("p0_tutorial_remake_policeman_pos1.png");
      police_item = new ItemImage(394, 69, police_image);
      py.m(this.current_layer, "add", police_item);
    } else if ((this.page === 2)) {
      example_image = assets.load_image("p0_tutorial_remake_d4.jpg");
      example_item = new ItemImage(67, 87, example_image);
      py.m(this.current_layer, "add", example_item);
      number_item = new ItemText(264, 80, this.font_20_bold, 0, py.str(this.page), [144, 22, 22], null, 66, 25, 2, 1);
      py.m(this.current_layer, "add", number_item);
      additional_fonts = py.mkdict([["bold", [this.font_13_bold, 16, (-2)]]]);
      message = py.add(py.add(py.add("Usa las &#f:bold!pistas&#f! que te den los &#f:bold!testigos&#f! para\n", "&#f:bold!armar el identikit del ladr\xf3n&#f! y enviar\n"), "una&#f:bold! orden de arresto&#f! en su contra, sin ella\n"), "&#c144,22,22!&#f:bold!no podr\xe1s arrestarlo&#f!&#c! aunque lo atrapes.");
      text_item = new ItemText(130, 96, this.font_13, 16, message, [0, 0, 0], null, 332, 92, 2, 2, additional_fonts);
      py.m(this.current_layer, "add", text_item);
      police_image = assets.load_image("p0_tutorial_remake_policeman_pos1.png");
      police_item = new ItemImage(394, 69, police_image);
      py.m(this.current_layer, "add", police_item);
    } else if ((this.page === 3)) {
      example_image = assets.load_image("p0_tutorial_remake_d5.jpg");
      example_item = new ItemImage(67, 87, example_image);
      py.m(this.current_layer, "add", example_item);
      number_item = new ItemText(264, 80, this.font_20_bold, 0, py.str(this.page), [144, 22, 22], null, 66, 25, 2, 1);
      py.m(this.current_layer, "add", number_item);
      additional_fonts = py.mkdict([["bold", [this.font_13_bold, 16, (-2)]]]);
      message = py.add("Recuerda que tienes un &#f:bold!tiempo l\xedmite&#f! para atrapar al ladr\xf3n.\n", "SI LO SOBREPASAS, &#f:bold!ESCAPAR\xc1&#f!.");
      text_item = new ItemText(166, 112, this.font_13, 16, message, [0, 0, 0], null, 263, 50, 2, 2, additional_fonts);
      py.m(this.current_layer, "add", text_item);
      police_image = assets.load_image("p0_tutorial_remake_policeman_pos2.png");
      police_item = new ItemImage(394, 69, police_image);
      py.m(this.current_layer, "add", police_item);
    } else if ((this.page === 4)) {
      example_image = assets.load_image("p0_tutorial_remake_d2.jpg");
      example_item = new ItemImage(67, 87, example_image);
      py.m(this.current_layer, "add", example_item);
      number_item = new ItemText(264, 80, this.font_20_bold, 0, py.str(this.page), [144, 22, 22], null, 66, 25, 2, 1);
      py.m(this.current_layer, "add", number_item);
      additional_fonts = py.mkdict([["bold", [this.font_13_bold, 16, (-2)]]]);
      message = "Usa las pistas que te den para dar con el &#f:bold!escondite&#f! del ladr\xf3n.";
      text_item = new ItemText(171, 109, this.font_13, 16, message, [0, 0, 0], null, 243, 34, 2, 2, additional_fonts);
      py.m(this.current_layer, "add", text_item);
      police_image = assets.load_image("p0_tutorial_remake_policeman_pos2.png");
      police_item = new ItemImage(394, 69, police_image);
      py.m(this.current_layer, "add", police_item);
    } else if ((this.page === 5)) {
      example_image = assets.load_image("p0_tutorial_remake_d3.jpg");
      example_item = new ItemImage(67, 87, example_image);
      py.m(this.current_layer, "add", example_item);
      number_item = new ItemText(264, 80, this.font_20_bold, 0, py.str(this.page), [144, 22, 22], null, 66, 25, 2, 1);
      py.m(this.current_layer, "add", number_item);
      additional_fonts = py.mkdict([["bold", [this.font_13_bold, 16, (-2)]]]);
      message = "Investiga el escondite para\nencontrar pistas que te indiquen su\nnuevo paradero.";
      text_item = new ItemText(161, 109, this.font_13, 16, message, [0, 0, 0], null, 263, 50, 2, 2, additional_fonts);
      py.m(this.current_layer, "add", text_item);
      police_image = assets.load_image("p0_tutorial_remake_policeman_pos1.png");
      police_item = new ItemImage(394, 69, police_image);
      py.m(this.current_layer, "add", police_item);
    } else if ((this.page === 6)) {
      example_image = assets.load_image("p0_tutorial_remake_dik.jpg");
      example_item = new ItemImage(67, 87, example_image);
      py.m(this.current_layer, "add", example_item);
      number_item = new ItemText(264, 80, this.font_20_bold, 0, py.str(this.page), [144, 22, 22], null, 66, 25, 2, 1);
      py.m(this.current_layer, "add", number_item);
      message = "\xa1Persigue al ladr\xf3n &#c144,22,22!en tu coche&#c! antes de que se escape!";
      text_item = new ItemText(166, 132, this.font_13_bold, 16, message, [0, 0, 0], null, 263, 50, 2, 2, null);
      py.m(this.current_layer, "add", text_item);
      police_image = assets.load_image("p0_tutorial_remake_policeman_pos3.png");
      police_item = new ItemImage(394, 69, police_image);
      py.m(this.current_layer, "add", police_item);
    } else if ((this.page === 7)) {
      example_image = assets.load_image("p3_help_d1.jpg");
      example_item = new ItemImage(68, 87, example_image);
      py.m(this.current_layer, "add", example_item);
      message = "Debes atrapar al ladr\xf3n antes de que\nse acabe el combustible.";
      text1_item = new ItemText(141, 101, this.font_13_bold, 14, message, [0, 0, 0], null, 302, 38, 2, 2, null);
      py.m(this.current_layer, "add", text1_item);
      additional_fonts = py.mkdict([["bold", [this.font_13_bold, 14, (-1)]]]);
      message = "Para conducir el auto usa los\n&#f:bold!&#c150,6,3!siguientes controles&#c!&#f!:";
      text2_item = new ItemText(141, 141, this.font_13, 14, message, [0, 0, 0], null, 302, 38, 2, 2, additional_fonts);
      py.m(this.current_layer, "add", text2_item);
      police_image = assets.load_image("p0_tutorial_remake_policeman_pos1.png");
      police_item = new ItemImage(394, 69, police_image);
      py.m(this.current_layer, "add", police_item);
    } else if ((this.page === 8)) {
      example_image = assets.load_image("p3_help_d2.jpg");
      example_item = new ItemImage(68, 87, example_image);
      py.m(this.current_layer, "add", example_item);
      message = "&#c150,6,3!O TAMBI\xc9N PUEDES UTILIZAR:&#c!";
      text_item = new ItemText(141, 105, this.font_13_bold, 12, message, [0, 0, 0], null, 302, 38, 2, 2, null);
      py.m(this.current_layer, "add", text_item);
      police_image = assets.load_image("p0_tutorial_remake_policeman_pos1.png");
      police_item = new ItemImage(394, 69, police_image);
      py.m(this.current_layer, "add", police_item);
    } else if ((this.page === 9)) {
      example_image = assets.load_image("p3_help_d3.jpg");
      example_item = new ItemImage(68, 87, example_image);
      py.m(this.current_layer, "add", example_item);
      additional_fonts = py.mkdict([["bold", [this.font_13_bold, 16, (-2)]]]);
      message = "Para atrapar al ladr\xf3n solo debes &#f:bold!adelantarlo&#f!.";
      text2_item = new ItemText(141, 112, this.font_13, 16, message, [0, 0, 0], null, 302, 38, 2, 2, additional_fonts);
      py.m(this.current_layer, "add", text2_item);
      police_image = assets.load_image("p0_tutorial_remake_policeman_pos1.png");
      police_item = new ItemImage(394, 69, police_image);
      py.m(this.current_layer, "add", police_item);
    } else if ((this.page === 101)) {
      example_image = assets.load_image("p0_tutorial_remake_dik.jpg");
      example_item = new ItemImage(67, 87, example_image);
      py.m(this.current_layer, "add", example_item);
      additional_fonts = py.mkdict([["bold", [this.font_13_bold, 16, (-2)]]]);
      message = "&#c144,22,22!&#f:bold!\xa1MUY BIEN!&#f!&#c!\nVas por buen camino, ya tienes una &#f:bold!\xf3rden\nde arresto&#f! contra el ladr\xf3n.\n\nAhora deber\xe1s &#f:bold!seguir busc\xe1ndolo&#f!\npara poder atraparlo.";
      text_item = new ItemText(143, 93, this.font_13, 16, message, [0, 0, 0], null, 312, 128, 2, 2, additional_fonts);
      py.m(this.current_layer, "add", text_item);
      police_image = assets.load_image("p0_tutorial_remake_policeman_pos1.png");
      police_item = new ItemImage(394, 69, police_image);
      py.m(this.current_layer, "add", police_item);
    } else if ((this.page === 102)) {
      example_image = assets.load_image("p0_tutorial_remake_dg2.jpg");
      example_item = new ItemImage(67, 87, example_image);
      py.m(this.current_layer, "add", example_item);
      additional_fonts = py.mkdict([["bold", [this.font_13_bold, 16, (-2)]]]);
      message = "&#c144,22,22!&#f:bold!\xa1MUY BIEN!&#f!&#c!\nYa encontraste &#f:bold!todas las pistas&#f! que\nhay en la habitaci\xf3n.\n\nAhora deber\xe1s usarlas para descubrir la &#f:bold!nueva\nubicaci\xf3n&#f! del ladr\xf3n y &#f:bold!viajar&#f! hasta all\xed.";
      text_item = new ItemText(130, 94, this.font_13, 16, message, [0, 0, 0], null, 340, 128, 2, 2, additional_fonts);
      py.m(this.current_layer, "add", text_item);
      police_image = assets.load_image("p0_tutorial_remake_policeman_pos1.png");
      police_item = new ItemImage(394, 69, police_image);
      py.m(this.current_layer, "add", police_item);
    }
    if (py.truthy(this.show_nextprevious)) {
      if (py.truthy(this.include_ui_help)) {
        this.previous_button_item.set_visible(py.or((this.page > 1), () => !py.truthy(this.ui_help)));
        this.next_button_item.set_visible(py.or((this.page < this.guide_page_count), () => this.ui_help));
      } else {
        if ((this.page_range == null)) {
          from_page = 1;
          to_page = this.guide_page_count;
        } else {
          from_page = py.getitem(this.page_range, 0);
          to_page = py.getitem(this.page_range, 1);
        }
        this.previous_button_item.set_visible((this.page > from_page));
        this.next_button_item.set_visible((this.page < to_page));
      }
    }
    if ((py.len(this.previous_layer.items) > 0)) {
      animations.stop_blind_layer(this.current_layer);
      animations.stop_blind_layer(this.previous_layer);
      this.previous_layer.set_clip(null);
      area = new Rect(69, 52, 455, 345);
      animations.blind_layer(this.current_layer, animations.BlindDirection.SHOW_DOWN, area, 450, null, false);
      animations.blind_layer(this.previous_layer, animations.BlindDirection.HIDE_DOWN, area, 450, null, false);
    }
    return null;
  }
  close_button_click(item: any, args: any): any {
    this.stage.render();
    this.continue_sound.play();
    this.close_help();
    return null;
  }
  blind_close_help_callback(layer: any): any {
    this.stage.close_dialog(this.layer);
    if ((this.close_callback != null)) {
      this.close_callback();
    }
    return null;
  }
  previous_button_click(item: any, args: any): any {
    this.stage.render();
    this.continue_sound.play();
    this.page = this.page - 1;
    if (((this.page === 0) && !py.truthy(this.ui_help))) {
      this.page = this.ui_page_count;
      this.ui_help = true;
    }
    this.set_up_help_page();
    return null;
  }
  next_button_click(item: any, args: any): any {
    this.stage.render();
    this.continue_sound.play();
    this.page = this.page + 1;
    if (((this.page > this.ui_page_count) && py.truthy(this.ui_help))) {
      this.page = 1;
      this.ui_help = false;
    }
    this.set_up_help_page();
    return null;
  }
  handle_event(e: any): any {
    if (py.eq(e.type, pygame.KEYDOWN)) {
      if (py.eq(e.key, pygame.K_ESCAPE)) {
        this.stage.render();
        this.continue_sound.play();
        this.close_help();
        return true;
      }
    }
    return null;
  }
}
