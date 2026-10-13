// The credit line of the main menu of the updated edition (hook added by research/content_web.py in MainMenu.set_up_mainmenu).
import { ItemText } from '../../runtime/prelude';
import * as assets from '../../engine/assets';

export function addMenuCredit(layer: any): void {
  const bold = assets.load_font('evilgeniusbb_bld.ttf', 13), small = assets.load_font('evilgeniusbb_bld.ttf', 12), reg = assets.load_font('evilgeniusbb_reg.ttf', 14);
  // on the paper of the title, to the right of "VICEMI MOD"
  layer.add(new ItemText(350, 80, bold, 16, 'Recreado por Vicemi Dev', [96, 24, 8], null, 215, 20, 2, 1));
  layer.add(new ItemText(350, 96, reg, 16, 'vicemi.dev', [70, 40, 20], null, 215, 20, 2, 1));
  // in the strip of the bottom, left of the buttons
  const news = ['Nuevos personajes,', 'minijuegos y', 'contenido adicional'].join('\n');
  const shadow = new ItemText(6, 389, small, 14, news, [0, 0, 0], null, 150, 46, 2, 1);
  shadow.set_alpha(190);
  layer.add(shadow);
  layer.add(new ItemText(5, 388, small, 14, news, [255, 222, 110], null, 150, 46, 2, 1));
}
