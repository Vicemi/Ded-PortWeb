// @ts-nocheck
// Generated from the original game code (see MODLOG.md). Do not edit by hand.
import * as py from '../../runtime/py';
import * as dialogeffects from './dialogeffects';
import * as pygame from '../../runtime/prelude';

export let GAME: any = null;
export function set_game(game: any): any {
  dialogeffects.GAME = game;
  return null;
}
export function blinds_down(dirty_rects: any): any {
  __progressive_update();
  return null;
}
export function blinds_up(dirty_rects: any): any {
  __progressive_update(false);
  return null;
}
export function __progressive_update(top: any = true, frames: any = 15): any {
  let elapsed_time, height, i, size, time, y: any;
  size = dialogeffects.GAME.get_window_size();
  height = py.div(py.getitem(size, 1), (frames - 1));
  for (i of py.range(frames)) {
    time = pygame.time.get_ticks();
    if (py.truthy(top)) {
      y = py.mul(height, i);
    } else {
      y = (py.getitem(size, 1) - py.mul(height, py.add(i, 1)));
    }
    dialogeffects.GAME.update_display([[0, y, py.getitem(size, 0), py.min(height, (py.getitem(size, 1) - y))]]);
    elapsed_time = (pygame.time.get_ticks() - time);
    if ((elapsed_time < 30)) {
      pygame.time.delay((30 - elapsed_time));
    }
  }
  return null;
}
