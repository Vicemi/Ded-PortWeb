// main.py: creates the Game with its title, cursor and loading picture, builds the datastore and starts at the presentation (the game's opening screens).
import { Game } from '../engine/engine';
import { setCurrentGame } from '../runtime/prelude';
import { Stats } from '../runtime/stats';
import * as datastore from './data/datastore';
import * as statcodes from './data/statcodes';
import * as presentation from './stages/presentation';

/** The original checked a server for new versions; the web version is always the latest */
class UpdateManager {
  description: string | null = null;
  package: string | null = null;
  url: string | null = null;
  exists_update(): boolean { return false; }
  execute_update(): void { /* nothing */ }
  web_cb(_result: unknown): void { /* nothing */ }
}

export function createGame(canvas: HTMLCanvasElement): Game {
  const g = new Game('División Especial de Detectives', 'cursor.png', 'p0_loading.gif') as Game & { datastore: any; update_manager: UpdateManager };
  g.attach(canvas);
  setCurrentGame(g);
  g.set_quit_on_escape(false);
  g.stats = new Stats() as unknown as Game['stats'];
  g.datastore = new (datastore as any).Datastore(g);
  g.update_manager = new UpdateManager();
  (g.stats as unknown as Stats).start_time_event(statcodes.PLAY);
  g.run(new (presentation as any).PresentationStage(g));
  return g;
}
