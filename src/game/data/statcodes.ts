// @ts-nocheck
// Generated from the original game code (see MODLOG.md). Do not edit by hand.
import * as py from '../../runtime/py';
import * as $self from './statcodes';

export let PLAY: any = "PLAY";
export let MG_BRICKLAYER: any = "MG_BRICKLAYER";
export let MG_BRICKLAYER_SOLVED: any = "MG_BRICKLAYER_S";
export let MG_BRICKLAYER_NOTSOLVED: any = "MG_BRICKLAYER_NS";
export let MG_GARDENER: any = "MG_GARDENER";
export let MG_GARDENER_SOLVED: any = "MG_GARDENER_S";
export let MG_GARDENER_NOTSOLVED: any = "MG_GARDENER_NS";
export let MG_LIRARIAN: any = "MG_LIRARIAN";
export let MG_LIRARIAN_SOLVED: any = "MG_LIRARIAN_S";
export let MG_LIRARIAN_NOTSOLVED: any = "MG_LIRARIAN_NS";
export let MG_SHOPTENDER: any = "MG_SHOPTENDER";
export let MG_SHOPTENDER_SOLVED: any = "MG_SHOPTENDER_S";
export let MG_SHOPTENDER_NOTSOLVED: any = "MG_SHOPTENDER_NS";
export let PHASE_PREFIX: any = "PHASE";
export let ENDGAME_SOLVED: any = "ENDGAME_S";
export let ENDGAME_TIME_UP: any = "ENDGAME_T";
export let ENDGAME_BAD_ORDER: any = "ENDGAME_BO";
py.register("game/data/statcodes", $self);
export function $set(name: string, v: any): void {
  switch (name) {
    case "ENDGAME_BAD_ORDER": ENDGAME_BAD_ORDER = v; break;
    case "ENDGAME_SOLVED": ENDGAME_SOLVED = v; break;
    case "ENDGAME_TIME_UP": ENDGAME_TIME_UP = v; break;
    case "MG_BRICKLAYER": MG_BRICKLAYER = v; break;
    case "MG_BRICKLAYER_NOTSOLVED": MG_BRICKLAYER_NOTSOLVED = v; break;
    case "MG_BRICKLAYER_SOLVED": MG_BRICKLAYER_SOLVED = v; break;
    case "MG_GARDENER": MG_GARDENER = v; break;
    case "MG_GARDENER_NOTSOLVED": MG_GARDENER_NOTSOLVED = v; break;
    case "MG_GARDENER_SOLVED": MG_GARDENER_SOLVED = v; break;
    case "MG_LIRARIAN": MG_LIRARIAN = v; break;
    case "MG_LIRARIAN_NOTSOLVED": MG_LIRARIAN_NOTSOLVED = v; break;
    case "MG_LIRARIAN_SOLVED": MG_LIRARIAN_SOLVED = v; break;
    case "MG_SHOPTENDER": MG_SHOPTENDER = v; break;
    case "MG_SHOPTENDER_NOTSOLVED": MG_SHOPTENDER_NOTSOLVED = v; break;
    case "MG_SHOPTENDER_SOLVED": MG_SHOPTENDER_SOLVED = v; break;
    case "PHASE_PREFIX": PHASE_PREFIX = v; break;
    case "PLAY": PLAY = v; break;
  }
}
