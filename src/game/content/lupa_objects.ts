// The new objects of the magnifying glass game (phase 2): 24 small objects of Uruguay (tools/make_objects.py makes their pictures from the art sheet).
// They are added to the items that rooms can hide: each item place holder gets a few of them, so every room has a different mix of old and new objects.
// An object is only used when both its pictures (p2s01<id>.png and p2s01<id>l.png) are in the image packs.
import { has_image } from '../../engine/assets';
import { EXTRA_ITEMS } from '../../engine/stage';
import { LUPA_OBJECTS } from './lupa_objects_data';
import { CLUE_OBJECTS, OBJECT_JOKES } from './lupa_clues';

export function activeObjects(): typeof LUPA_OBJECTS {
  return LUPA_OBJECTS.filter((o) => has_image('p2s01' + o.id + '.png') && has_image('p2s01' + o.id + 'l.png'));
}

/** the item definitions of the new objects (phase 1 needs them too: a saved game can resume with one of their clues already found) */
export function registerDefinitions(): void {
  const objs = activeObjects();
  if (objs.length) EXTRA_ITEMS['p2s01'] = objs.map((o) => [o.id, Math.round(o.w / 2), Math.round(o.h / 2), 'Object']);
}

let done = false;
/** registers the definitions and adds the objects to the lists of the item place holders (once) */
export function enableNewObjects(tags: any[], itemTypes: any[], clueTypes: any[]): void {
  if (done) return;
  done = true;
  const objs = activeObjects();
  if (objs.length === 0) return;
  registerDefinitions();
  let n = 0, c = 0;
  for (const tag of tags) {
    const kind = tag[2];
    // the clue place holders get two of the clue objects each (a clue can only be hidden where its id is listed)
    if (clueTypes.includes(kind)) {
      for (let k = 0; k < 2; k++) tag[1].push(CLUE_OBJECTS[(c * 2 + k) % CLUE_OBJECTS.length].id);
      c++;
      continue;
    }
    if (!itemTypes.includes(kind)) continue;
    // 5 objects per place holder, walking through the list so that all of them are used
    for (let k = 0; k < 5; k++) tag[1].push(objs[(n * 5 + k) % objs.length].id);
    n++;
  }
}

/** the name of an object of the updated edition (for the message when the player finds it), or '' for the original items */
export function objectName(type: string): string {
  const o = LUPA_OBJECTS.find((x) => x.id === type);
  return o ? o.name : '';
}

/** the joke for an object of the updated edition that is not a clue, or '' */
export function objectJoke(type: string): string {
  return OBJECT_JOKES[type] ?? '';
}
