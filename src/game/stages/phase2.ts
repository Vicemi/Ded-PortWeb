// @ts-nocheck
// Generated from the original game code (see MODLOG.md). Do not edit by hand.
import * as py from '../../runtime/py';
import { GRID_CELL_HEIGHT } from './phase0';
import { GRID_CELL_WIDTH } from './phase0';
import { GRID_ORIGIN } from './phase0';
import { GRID_SIZE } from './phase0';
import { IsoState } from '../../runtime/prelude';
import { ItemCell } from '../../runtime/prelude';
import { ItemCustomDraw } from '../../runtime/prelude';
import { ItemEvent } from '../../runtime/prelude';
import { ItemImage } from '../../runtime/prelude';
import { ItemText } from '../../runtime/prelude';
import { KEYDOWN } from '../../runtime/prelude';
import { Layer } from '../../runtime/prelude';
import { Rect } from '../../runtime/prelude';
import { StageIso } from '../../runtime/prelude';
import * as animations from '../../engine/animations';
import * as assets from '../../engine/assets';
import * as engine from '../../engine/engine';
import { gc } from '../../runtime/py';
import { os } from '../../runtime/prelude';
import * as phase0 from './phase0';
import { pygame } from '../../runtime/prelude';
import { random } from '../../runtime/py';
import { sys } from '../../runtime/py';
import * as text from '../../engine/textutil';
import * as $self from './phase2';
const $d1: any = [];

export class ItemTag {
  static FLOOR: any = "Floor";
  static WALL: any = "Wall";
  static WALL_ITEM: any = "Wall Item";
  static FURNITURE: any = "Furniture";
  static OBJECT: any = "Object";
}
(ItemTag as any).prototype.FLOOR = (ItemTag as any).FLOOR;
(ItemTag as any).prototype.WALL = (ItemTag as any).WALL;
(ItemTag as any).prototype.WALL_ITEM = (ItemTag as any).WALL_ITEM;
(ItemTag as any).prototype.FURNITURE = (ItemTag as any).FURNITURE;
(ItemTag as any).prototype.OBJECT = (ItemTag as any).OBJECT;
export let ITEM_TAGS: any = [ItemTag.FLOOR, ItemTag.WALL, ItemTag.WALL_ITEM, ItemTag.FURNITURE, ItemTag.OBJECT];
export class ItemState {
  static NORMAL: any = new IsoState("Normal", "");
  static OPENED: any = new IsoState("Opened", "o");
}
(ItemState as any).prototype.NORMAL = (ItemState as any).NORMAL;
(ItemState as any).prototype.OPENED = (ItemState as any).OPENED;
export let ITEM_STATES: any = [ItemState.NORMAL, ItemState.OPENED];
export class PlaceHolderType {
  static NORMALCLUE: any = [1];
  static NORMALITEM: any = [2];
  static BELOWCLUE: any = [3];
  static BELOWITEM: any = [4];
  static INSIDECLUE: any = [5];
  static INSIDEITEM: any = [6];
  static OUTSIDECLUE: any = [7];
  static OUTSIDEITEM: any = 8;
}
(PlaceHolderType as any).prototype.NORMALCLUE = (PlaceHolderType as any).NORMALCLUE;
(PlaceHolderType as any).prototype.NORMALITEM = (PlaceHolderType as any).NORMALITEM;
(PlaceHolderType as any).prototype.BELOWCLUE = (PlaceHolderType as any).BELOWCLUE;
(PlaceHolderType as any).prototype.BELOWITEM = (PlaceHolderType as any).BELOWITEM;
(PlaceHolderType as any).prototype.INSIDECLUE = (PlaceHolderType as any).INSIDECLUE;
(PlaceHolderType as any).prototype.INSIDEITEM = (PlaceHolderType as any).INSIDEITEM;
(PlaceHolderType as any).prototype.OUTSIDECLUE = (PlaceHolderType as any).OUTSIDECLUE;
(PlaceHolderType as any).prototype.OUTSIDEITEM = (PlaceHolderType as any).OUTSIDEITEM;
export class PlaceHolderTag {
  static CLUEA: any = ["ClueA", ["i509"], PlaceHolderType.NORMALCLUE];
  static CLUEB: any = ["ClueB", ["i529"], PlaceHolderType.NORMALCLUE];
  static CLUEC: any = ["ClueC", ["i511"], PlaceHolderType.NORMALCLUE];
  static CLUED: any = ["ClueD", ["i510"], PlaceHolderType.NORMALCLUE];
  static CLUEE: any = ["ClueE", ["i526"], PlaceHolderType.NORMALCLUE];
  static CLUEF: any = ["ClueF", ["i527"], PlaceHolderType.NORMALCLUE];
  static CLUEG: any = ["ClueG", ["i528"], PlaceHolderType.NORMALCLUE];
  static CLUEH: any = ["ClueH", ["i523"], PlaceHolderType.NORMALCLUE];
  static ITEMA: any = ["ItemA", ["i505"], PlaceHolderType.NORMALITEM];
  static ITEMB: any = ["ItemB", ["i503"], PlaceHolderType.NORMALITEM];
  static ITEMC: any = ["ItemC", ["i504"], PlaceHolderType.NORMALITEM];
  static ITEMD: any = ["ItemD", ["i512"], PlaceHolderType.NORMALITEM];
  static ITEME: any = ["ItemE", ["i507"], PlaceHolderType.NORMALITEM];
  static ITEMF: any = ["ItemF", ["i502"], PlaceHolderType.NORMALITEM];
  static ITEMG: any = ["ItemG", ["i501"], PlaceHolderType.NORMALITEM];
  static ITEMH: any = ["ItemH", ["i513"], PlaceHolderType.NORMALITEM];
  static ITEMI: any = ["ItemI", ["i534"], PlaceHolderType.NORMALITEM];
  static ITEMJ: any = ["ItemJ", ["i535"], PlaceHolderType.NORMALITEM];
  static ITEMK: any = ["ItemK", ["i536"], PlaceHolderType.NORMALITEM];
  static ITEML: any = ["ItemL", ["i537"], PlaceHolderType.NORMALITEM];
  static ITEMM: any = ["ItemM", ["i538"], PlaceHolderType.NORMALITEM];
  static ITEMN: any = ["ItemN", ["i539"], PlaceHolderType.NORMALITEM];
  static ITEMO: any = ["ItemO", ["i540"], PlaceHolderType.NORMALITEM];
  static ITEMP: any = ["ItemP", ["i541"], PlaceHolderType.NORMALITEM];
  static ITEMQ: any = ["ItemQ", ["i542"], PlaceHolderType.NORMALITEM];
  static ITEMR: any = ["ItemR", ["i543"], PlaceHolderType.NORMALITEM];
  static ITEMS: any = ["ItemS", ["i544"], PlaceHolderType.NORMALITEM];
  static ITEMT: any = ["ItemT", ["i545"], PlaceHolderType.NORMALITEM];
  static ITEMU: any = ["ItemU", ["i546"], PlaceHolderType.NORMALITEM];
  static ITEMV: any = ["ItemV", ["i547"], PlaceHolderType.NORMALITEM];
  static ITEMW: any = ["ItemW", ["i548"], PlaceHolderType.NORMALITEM];
  static ITEMX: any = ["ItemX", ["i549"], PlaceHolderType.NORMALITEM];
  static ITEMY: any = ["ItemY", ["i550"], PlaceHolderType.NORMALITEM];
  static ITEMZ: any = ["ItemZ", ["i551"], PlaceHolderType.NORMALITEM];
  static ITEMZA: any = ["ItemZA", ["i552"], PlaceHolderType.NORMALITEM];
  static ITEMZB: any = ["ItemZB", ["i553"], PlaceHolderType.NORMALITEM];
  static ITEMZC: any = ["ItemZC", ["i554"], PlaceHolderType.NORMALITEM];
  static ITEMZD: any = ["ItemZD", ["i555"], PlaceHolderType.NORMALITEM];
  static ITEMZE: any = ["ItemZE", ["i556"], PlaceHolderType.NORMALITEM];
  static ITEMZF: any = ["ItemZF", ["i557"], PlaceHolderType.NORMALITEM];
  static ITEMZG: any = ["ItemZG", ["i558"], PlaceHolderType.NORMALITEM];
  static BELOWCLUEA: any = ["BelowClueA", ["i509"], PlaceHolderType.BELOWCLUE];
  static BELOWCLUEB: any = ["BelowClueB", ["i529"], PlaceHolderType.BELOWCLUE];
  static BELOWCLUEC: any = ["BelowClueC", ["i511"], PlaceHolderType.BELOWCLUE];
  static BELOWCLUED: any = ["BelowClueD", ["i510"], PlaceHolderType.BELOWCLUE];
  static BELOWCLUEE: any = ["BelowClueE", ["i526"], PlaceHolderType.BELOWCLUE];
  static BELOWCLUEF: any = ["BelowClueF", ["i527"], PlaceHolderType.BELOWCLUE];
  static BELOWCLUEG: any = ["BelowClueG", ["i528"], PlaceHolderType.BELOWCLUE];
  static BELOWCLUEH: any = ["BelowClueH", ["i523"], PlaceHolderType.BELOWCLUE];
  static BELOWITEMA: any = ["BelowItemA", ["i505"], PlaceHolderType.BELOWITEM];
  static BELOWITEMB: any = ["BelowItemB", ["i503"], PlaceHolderType.BELOWITEM];
  static BELOWITEMC: any = ["BelowItemC", ["i504"], PlaceHolderType.BELOWITEM];
  static BELOWITEMD: any = ["BelowItemD", ["i512"], PlaceHolderType.BELOWITEM];
  static BELOWITEME: any = ["BelowItemE", ["i507"], PlaceHolderType.BELOWITEM];
  static BELOWITEMF: any = ["BelowItemF", ["i502"], PlaceHolderType.BELOWITEM];
  static BELOWITEMG: any = ["BelowItemG", ["i501"], PlaceHolderType.BELOWITEM];
  static BELOWITEMH: any = ["BelowItemH", ["i513"], PlaceHolderType.BELOWITEM];
  static BELOWITEMI: any = ["BelowItemI", ["i534"], PlaceHolderType.BELOWITEM];
  static BELOWITEMJ: any = ["BelowItemJ", ["i535"], PlaceHolderType.BELOWITEM];
  static BELOWITEMK: any = ["BelowItemK", ["i536"], PlaceHolderType.BELOWITEM];
  static BELOWITEML: any = ["BelowItemL", ["i537"], PlaceHolderType.BELOWITEM];
  static BELOWITEMM: any = ["BelowItemM", ["i538"], PlaceHolderType.BELOWITEM];
  static BELOWITEMN: any = ["BelowItemN", ["i539"], PlaceHolderType.BELOWITEM];
  static BELOWITEMO: any = ["BelowItemO", ["i540"], PlaceHolderType.BELOWITEM];
  static BELOWITEMP: any = ["BelowItemP", ["i541"], PlaceHolderType.BELOWITEM];
  static BELOWITEMQ: any = ["BelowItemQ", ["i542"], PlaceHolderType.BELOWITEM];
  static BELOWITEMR: any = ["BelowItemR", ["i543"], PlaceHolderType.BELOWITEM];
  static BELOWITEMS: any = ["BelowItemS", ["i544"], PlaceHolderType.BELOWITEM];
  static BELOWITEMT: any = ["BelowItemT", ["i545"], PlaceHolderType.BELOWITEM];
  static BELOWITEMU: any = ["BelowItemU", ["i546"], PlaceHolderType.BELOWITEM];
  static BELOWITEMV: any = ["BelowItemV", ["i547"], PlaceHolderType.BELOWITEM];
  static BELOWITEMW: any = ["BelowItemW", ["i548"], PlaceHolderType.BELOWITEM];
  static BELOWITEMX: any = ["BelowItemX", ["i549"], PlaceHolderType.BELOWITEM];
  static BELOWITEMY: any = ["BelowItemY", ["i550"], PlaceHolderType.BELOWITEM];
  static BELOWITEMZ: any = ["BelowItemZ", ["i551"], PlaceHolderType.BELOWITEM];
  static BELOWITEMZA: any = ["BelowItemZA", ["i552"], PlaceHolderType.BELOWITEM];
  static BELOWITEMZB: any = ["BelowItemZB", ["i553"], PlaceHolderType.BELOWITEM];
  static BELOWITEMZC: any = ["BelowItemZC", ["i554"], PlaceHolderType.BELOWITEM];
  static BELOWITEMZD: any = ["BelowItemZD", ["i555"], PlaceHolderType.BELOWITEM];
  static BELOWITEMZE: any = ["BelowItemZE", ["i556"], PlaceHolderType.BELOWITEM];
  static BELOWITEMZF: any = ["BelowItemZF", ["i557"], PlaceHolderType.BELOWITEM];
  static BELOWITEMZG: any = ["BelowItemZG", ["i558"], PlaceHolderType.BELOWITEM];
  static INSIDECLUEA: any = ["InsideClueA", ["i509"], PlaceHolderType.INSIDECLUE];
  static INSIDECLUEB: any = ["InsideClueB", ["i529"], PlaceHolderType.INSIDECLUE];
  static INSIDECLUEC: any = ["InsideClueC", ["i511"], PlaceHolderType.INSIDECLUE];
  static INSIDECLUED: any = ["InsideClueD", ["i510"], PlaceHolderType.INSIDECLUE];
  static INSIDECLUEE: any = ["InsideClueE", ["i526"], PlaceHolderType.INSIDECLUE];
  static INSIDECLUEF: any = ["InsideClueF", ["i527"], PlaceHolderType.INSIDECLUE];
  static INSIDECLUEG: any = ["InsideClueG", ["i528"], PlaceHolderType.INSIDECLUE];
  static INSIDECLUEH: any = ["InsideClueH", ["i523"], PlaceHolderType.INSIDECLUE];
  static INSIDEITEMA: any = ["InsideItemA", ["i505"], PlaceHolderType.INSIDECLUE];
  static INSIDEITEMB: any = ["InsideItemB", ["i503"], PlaceHolderType.INSIDEITEM];
  static INSIDEITEMC: any = ["InsideItemC", ["i504"], PlaceHolderType.INSIDEITEM];
  static INSIDEITEMD: any = ["InsideItemD", ["i512"], PlaceHolderType.INSIDEITEM];
  static INSIDEITEME: any = ["InsideItemE", ["i507"], PlaceHolderType.INSIDEITEM];
  static INSIDEITEMF: any = ["InsideItemF", ["i502"], PlaceHolderType.INSIDEITEM];
  static INSIDEITEMG: any = ["InsideItemG", ["i501"], PlaceHolderType.INSIDEITEM];
  static INSIDEITEMH: any = ["InsideItemH", ["i513"], PlaceHolderType.INSIDEITEM];
  static INSIDEITEMI: any = ["InsideItemI", ["i534"], PlaceHolderType.INSIDEITEM];
  static INSIDEITEMJ: any = ["InsideItemJ", ["i535"], PlaceHolderType.INSIDEITEM];
  static INSIDEITEMK: any = ["InsideItemK", ["i536"], PlaceHolderType.INSIDEITEM];
  static INSIDEITEML: any = ["InsideItemL", ["i537"], PlaceHolderType.INSIDEITEM];
  static INSIDEITEMM: any = ["InsideItemM", ["i538"], PlaceHolderType.INSIDEITEM];
  static INSIDEITEMN: any = ["InsideItemN", ["i539"], PlaceHolderType.INSIDEITEM];
  static INSIDEITEMO: any = ["InsideItemO", ["i540"], PlaceHolderType.INSIDEITEM];
  static INSIDEITEMP: any = ["InsideItemP", ["i541"], PlaceHolderType.INSIDEITEM];
  static INSIDEITEMQ: any = ["InsideItemQ", ["i542"], PlaceHolderType.INSIDEITEM];
  static INSIDEITEMR: any = ["InsideItemR", ["i543"], PlaceHolderType.INSIDEITEM];
  static INSIDEITEMS: any = ["InsideItemS", ["i544"], PlaceHolderType.INSIDEITEM];
  static INSIDEITEMT: any = ["InsideItemT", ["i545"], PlaceHolderType.INSIDEITEM];
  static INSIDEITEMU: any = ["InsideItemU", ["i546"], PlaceHolderType.INSIDEITEM];
  static INSIDEITEMV: any = ["InsideItemV", ["i547"], PlaceHolderType.INSIDEITEM];
  static INSIDEITEMW: any = ["InsideItemW", ["i548"], PlaceHolderType.INSIDEITEM];
  static INSIDEITEMX: any = ["InsideItemX", ["i549"], PlaceHolderType.INSIDEITEM];
  static INSIDEITEMY: any = ["InsideItemY", ["i550"], PlaceHolderType.INSIDEITEM];
  static INSIDEITEMZ: any = ["InsideItemZ", ["i551"], PlaceHolderType.INSIDEITEM];
  static INSIDEITEMZA: any = ["InsideItemZA", ["i552"], PlaceHolderType.INSIDEITEM];
  static INSIDEITEMZB: any = ["InsideItemZB", ["i553"], PlaceHolderType.INSIDEITEM];
  static INSIDEITEMZC: any = ["InsideItemZC", ["i554"], PlaceHolderType.INSIDEITEM];
  static INSIDEITEMZD: any = ["InsideItemZD", ["i555"], PlaceHolderType.INSIDEITEM];
  static INSIDEITEMZE: any = ["InsideItemZE", ["i556"], PlaceHolderType.INSIDEITEM];
  static INSIDEITEMZF: any = ["InsideItemZF", ["i557"], PlaceHolderType.INSIDEITEM];
  static INSIDEITEMZG: any = ["InsideItemZG", ["i558"], PlaceHolderType.INSIDEITEM];
  static OUTSIDECLUEA: any = ["OutsideClueA", ["i509"], PlaceHolderType.OUTSIDECLUE];
  static OUTSIDECLUEB: any = ["OutsideClueB", ["i529"], PlaceHolderType.OUTSIDECLUE];
  static OUTSIDECLUEC: any = ["OutsideClueC", ["i511"], PlaceHolderType.OUTSIDECLUE];
  static OUTSIDECLUED: any = ["OutsideClueD", ["i510"], PlaceHolderType.OUTSIDECLUE];
  static OUTSIDECLUEE: any = ["OutsideClueE", ["i526"], PlaceHolderType.OUTSIDECLUE];
  static OUTSIDECLUEF: any = ["OutsideClueF", ["i527"], PlaceHolderType.OUTSIDECLUE];
  static OUTSIDECLUEG: any = ["OutsideClueG", ["i528"], PlaceHolderType.OUTSIDECLUE];
  static OUTSIDECLUEH: any = ["OutsideClueH", ["i523"], PlaceHolderType.OUTSIDECLUE];
  static OUTSIDEITEMA: any = ["OutsideItemA", ["i505"], PlaceHolderType.OUTSIDECLUE];
  static OUTSIDEITEMB: any = ["OutsideItemB", ["i503"], PlaceHolderType.OUTSIDEITEM];
  static OUTSIDEITEMC: any = ["OutsideItemC", ["i504"], PlaceHolderType.OUTSIDEITEM];
  static OUTSIDEITEMD: any = ["OutsideItemD", ["i512"], PlaceHolderType.OUTSIDEITEM];
  static OUTSIDEITEME: any = ["OutsideItemE", ["i507"], PlaceHolderType.OUTSIDEITEM];
  static OUTSIDEITEMF: any = ["OutsideItemF", ["i502"], PlaceHolderType.OUTSIDEITEM];
  static OUTSIDEITEMG: any = ["OutsideItemG", ["i501"], PlaceHolderType.OUTSIDEITEM];
  static OUTSIDEITEMH: any = ["OutsideItemH", ["i513"], PlaceHolderType.OUTSIDEITEM];
  static OUTSIDEITEMI: any = ["OutsideItemI", ["i534"], PlaceHolderType.OUTSIDEITEM];
  static OUTSIDEITEMJ: any = ["OutsideItemJ", ["i535"], PlaceHolderType.OUTSIDEITEM];
  static OUTSIDEITEMK: any = ["OutsideItemK", ["i536"], PlaceHolderType.OUTSIDEITEM];
  static OUTSIDEITEML: any = ["OutsideItemL", ["i537"], PlaceHolderType.OUTSIDEITEM];
  static OUTSIDEITEMM: any = ["OutsideItemM", ["i538"], PlaceHolderType.OUTSIDEITEM];
  static OUTSIDEITEMN: any = ["OutsideItemN", ["i539"], PlaceHolderType.OUTSIDEITEM];
  static OUTSIDEITEMO: any = ["OutsideItemO", ["i540"], PlaceHolderType.OUTSIDEITEM];
  static OUTSIDEITEMP: any = ["OutsideItemP", ["i541"], PlaceHolderType.OUTSIDEITEM];
  static OUTSIDEITEMQ: any = ["OutsideItemQ", ["i542"], PlaceHolderType.OUTSIDEITEM];
  static OUTSIDEITEMR: any = ["OutsideItemR", ["i543"], PlaceHolderType.OUTSIDEITEM];
  static OUTSIDEITEMS: any = ["OutsideItemS", ["i544"], PlaceHolderType.OUTSIDEITEM];
  static OUTSIDEITEMT: any = ["OutsideItemT", ["i545"], PlaceHolderType.OUTSIDEITEM];
  static OUTSIDEITEMU: any = ["OutsideItemU", ["i546"], PlaceHolderType.OUTSIDEITEM];
  static OUTSIDEITEMV: any = ["OutsideItemV", ["i547"], PlaceHolderType.OUTSIDEITEM];
  static OUTSIDEITEMW: any = ["OutsideItemW", ["i548"], PlaceHolderType.OUTSIDEITEM];
  static OUTSIDEITEMX: any = ["OutsideItemX", ["i549"], PlaceHolderType.OUTSIDEITEM];
  static OUTSIDEITEMY: any = ["OutsideItemY", ["i550"], PlaceHolderType.OUTSIDEITEM];
  static OUTSIDEITEMZ: any = ["OutsideItemZ", ["i551"], PlaceHolderType.OUTSIDEITEM];
  static OUTSIDEITEMZA: any = ["OutsideItemZA", ["i552"], PlaceHolderType.OUTSIDEITEM];
  static OUTSIDEITEMZB: any = ["OutsideItemZB", ["i553"], PlaceHolderType.OUTSIDEITEM];
  static OUTSIDEITEMZC: any = ["OutsideItemZC", ["i554"], PlaceHolderType.OUTSIDEITEM];
  static OUTSIDEITEMZD: any = ["OutsideItemZD", ["i555"], PlaceHolderType.OUTSIDEITEM];
  static OUTSIDEITEMZE: any = ["OutsideItemZE", ["i556"], PlaceHolderType.OUTSIDEITEM];
  static OUTSIDEITEMZF: any = ["OutsideItemZF", ["i557"], PlaceHolderType.OUTSIDEITEM];
  static OUTSIDEITEMZG: any = ["OutsideItemZG", ["i558"], PlaceHolderType.OUTSIDEITEM];
}
(PlaceHolderTag as any).prototype.CLUEA = (PlaceHolderTag as any).CLUEA;
(PlaceHolderTag as any).prototype.CLUEB = (PlaceHolderTag as any).CLUEB;
(PlaceHolderTag as any).prototype.CLUEC = (PlaceHolderTag as any).CLUEC;
(PlaceHolderTag as any).prototype.CLUED = (PlaceHolderTag as any).CLUED;
(PlaceHolderTag as any).prototype.CLUEE = (PlaceHolderTag as any).CLUEE;
(PlaceHolderTag as any).prototype.CLUEF = (PlaceHolderTag as any).CLUEF;
(PlaceHolderTag as any).prototype.CLUEG = (PlaceHolderTag as any).CLUEG;
(PlaceHolderTag as any).prototype.CLUEH = (PlaceHolderTag as any).CLUEH;
(PlaceHolderTag as any).prototype.ITEMA = (PlaceHolderTag as any).ITEMA;
(PlaceHolderTag as any).prototype.ITEMB = (PlaceHolderTag as any).ITEMB;
(PlaceHolderTag as any).prototype.ITEMC = (PlaceHolderTag as any).ITEMC;
(PlaceHolderTag as any).prototype.ITEMD = (PlaceHolderTag as any).ITEMD;
(PlaceHolderTag as any).prototype.ITEME = (PlaceHolderTag as any).ITEME;
(PlaceHolderTag as any).prototype.ITEMF = (PlaceHolderTag as any).ITEMF;
(PlaceHolderTag as any).prototype.ITEMG = (PlaceHolderTag as any).ITEMG;
(PlaceHolderTag as any).prototype.ITEMH = (PlaceHolderTag as any).ITEMH;
(PlaceHolderTag as any).prototype.ITEMI = (PlaceHolderTag as any).ITEMI;
(PlaceHolderTag as any).prototype.ITEMJ = (PlaceHolderTag as any).ITEMJ;
(PlaceHolderTag as any).prototype.ITEMK = (PlaceHolderTag as any).ITEMK;
(PlaceHolderTag as any).prototype.ITEML = (PlaceHolderTag as any).ITEML;
(PlaceHolderTag as any).prototype.ITEMM = (PlaceHolderTag as any).ITEMM;
(PlaceHolderTag as any).prototype.ITEMN = (PlaceHolderTag as any).ITEMN;
(PlaceHolderTag as any).prototype.ITEMO = (PlaceHolderTag as any).ITEMO;
(PlaceHolderTag as any).prototype.ITEMP = (PlaceHolderTag as any).ITEMP;
(PlaceHolderTag as any).prototype.ITEMQ = (PlaceHolderTag as any).ITEMQ;
(PlaceHolderTag as any).prototype.ITEMR = (PlaceHolderTag as any).ITEMR;
(PlaceHolderTag as any).prototype.ITEMS = (PlaceHolderTag as any).ITEMS;
(PlaceHolderTag as any).prototype.ITEMT = (PlaceHolderTag as any).ITEMT;
(PlaceHolderTag as any).prototype.ITEMU = (PlaceHolderTag as any).ITEMU;
(PlaceHolderTag as any).prototype.ITEMV = (PlaceHolderTag as any).ITEMV;
(PlaceHolderTag as any).prototype.ITEMW = (PlaceHolderTag as any).ITEMW;
(PlaceHolderTag as any).prototype.ITEMX = (PlaceHolderTag as any).ITEMX;
(PlaceHolderTag as any).prototype.ITEMY = (PlaceHolderTag as any).ITEMY;
(PlaceHolderTag as any).prototype.ITEMZ = (PlaceHolderTag as any).ITEMZ;
(PlaceHolderTag as any).prototype.ITEMZA = (PlaceHolderTag as any).ITEMZA;
(PlaceHolderTag as any).prototype.ITEMZB = (PlaceHolderTag as any).ITEMZB;
(PlaceHolderTag as any).prototype.ITEMZC = (PlaceHolderTag as any).ITEMZC;
(PlaceHolderTag as any).prototype.ITEMZD = (PlaceHolderTag as any).ITEMZD;
(PlaceHolderTag as any).prototype.ITEMZE = (PlaceHolderTag as any).ITEMZE;
(PlaceHolderTag as any).prototype.ITEMZF = (PlaceHolderTag as any).ITEMZF;
(PlaceHolderTag as any).prototype.ITEMZG = (PlaceHolderTag as any).ITEMZG;
(PlaceHolderTag as any).prototype.BELOWCLUEA = (PlaceHolderTag as any).BELOWCLUEA;
(PlaceHolderTag as any).prototype.BELOWCLUEB = (PlaceHolderTag as any).BELOWCLUEB;
(PlaceHolderTag as any).prototype.BELOWCLUEC = (PlaceHolderTag as any).BELOWCLUEC;
(PlaceHolderTag as any).prototype.BELOWCLUED = (PlaceHolderTag as any).BELOWCLUED;
(PlaceHolderTag as any).prototype.BELOWCLUEE = (PlaceHolderTag as any).BELOWCLUEE;
(PlaceHolderTag as any).prototype.BELOWCLUEF = (PlaceHolderTag as any).BELOWCLUEF;
(PlaceHolderTag as any).prototype.BELOWCLUEG = (PlaceHolderTag as any).BELOWCLUEG;
(PlaceHolderTag as any).prototype.BELOWCLUEH = (PlaceHolderTag as any).BELOWCLUEH;
(PlaceHolderTag as any).prototype.BELOWITEMA = (PlaceHolderTag as any).BELOWITEMA;
(PlaceHolderTag as any).prototype.BELOWITEMB = (PlaceHolderTag as any).BELOWITEMB;
(PlaceHolderTag as any).prototype.BELOWITEMC = (PlaceHolderTag as any).BELOWITEMC;
(PlaceHolderTag as any).prototype.BELOWITEMD = (PlaceHolderTag as any).BELOWITEMD;
(PlaceHolderTag as any).prototype.BELOWITEME = (PlaceHolderTag as any).BELOWITEME;
(PlaceHolderTag as any).prototype.BELOWITEMF = (PlaceHolderTag as any).BELOWITEMF;
(PlaceHolderTag as any).prototype.BELOWITEMG = (PlaceHolderTag as any).BELOWITEMG;
(PlaceHolderTag as any).prototype.BELOWITEMH = (PlaceHolderTag as any).BELOWITEMH;
(PlaceHolderTag as any).prototype.BELOWITEMI = (PlaceHolderTag as any).BELOWITEMI;
(PlaceHolderTag as any).prototype.BELOWITEMJ = (PlaceHolderTag as any).BELOWITEMJ;
(PlaceHolderTag as any).prototype.BELOWITEMK = (PlaceHolderTag as any).BELOWITEMK;
(PlaceHolderTag as any).prototype.BELOWITEML = (PlaceHolderTag as any).BELOWITEML;
(PlaceHolderTag as any).prototype.BELOWITEMM = (PlaceHolderTag as any).BELOWITEMM;
(PlaceHolderTag as any).prototype.BELOWITEMN = (PlaceHolderTag as any).BELOWITEMN;
(PlaceHolderTag as any).prototype.BELOWITEMO = (PlaceHolderTag as any).BELOWITEMO;
(PlaceHolderTag as any).prototype.BELOWITEMP = (PlaceHolderTag as any).BELOWITEMP;
(PlaceHolderTag as any).prototype.BELOWITEMQ = (PlaceHolderTag as any).BELOWITEMQ;
(PlaceHolderTag as any).prototype.BELOWITEMR = (PlaceHolderTag as any).BELOWITEMR;
(PlaceHolderTag as any).prototype.BELOWITEMS = (PlaceHolderTag as any).BELOWITEMS;
(PlaceHolderTag as any).prototype.BELOWITEMT = (PlaceHolderTag as any).BELOWITEMT;
(PlaceHolderTag as any).prototype.BELOWITEMU = (PlaceHolderTag as any).BELOWITEMU;
(PlaceHolderTag as any).prototype.BELOWITEMV = (PlaceHolderTag as any).BELOWITEMV;
(PlaceHolderTag as any).prototype.BELOWITEMW = (PlaceHolderTag as any).BELOWITEMW;
(PlaceHolderTag as any).prototype.BELOWITEMX = (PlaceHolderTag as any).BELOWITEMX;
(PlaceHolderTag as any).prototype.BELOWITEMY = (PlaceHolderTag as any).BELOWITEMY;
(PlaceHolderTag as any).prototype.BELOWITEMZ = (PlaceHolderTag as any).BELOWITEMZ;
(PlaceHolderTag as any).prototype.BELOWITEMZA = (PlaceHolderTag as any).BELOWITEMZA;
(PlaceHolderTag as any).prototype.BELOWITEMZB = (PlaceHolderTag as any).BELOWITEMZB;
(PlaceHolderTag as any).prototype.BELOWITEMZC = (PlaceHolderTag as any).BELOWITEMZC;
(PlaceHolderTag as any).prototype.BELOWITEMZD = (PlaceHolderTag as any).BELOWITEMZD;
(PlaceHolderTag as any).prototype.BELOWITEMZE = (PlaceHolderTag as any).BELOWITEMZE;
(PlaceHolderTag as any).prototype.BELOWITEMZF = (PlaceHolderTag as any).BELOWITEMZF;
(PlaceHolderTag as any).prototype.BELOWITEMZG = (PlaceHolderTag as any).BELOWITEMZG;
(PlaceHolderTag as any).prototype.INSIDECLUEA = (PlaceHolderTag as any).INSIDECLUEA;
(PlaceHolderTag as any).prototype.INSIDECLUEB = (PlaceHolderTag as any).INSIDECLUEB;
(PlaceHolderTag as any).prototype.INSIDECLUEC = (PlaceHolderTag as any).INSIDECLUEC;
(PlaceHolderTag as any).prototype.INSIDECLUED = (PlaceHolderTag as any).INSIDECLUED;
(PlaceHolderTag as any).prototype.INSIDECLUEE = (PlaceHolderTag as any).INSIDECLUEE;
(PlaceHolderTag as any).prototype.INSIDECLUEF = (PlaceHolderTag as any).INSIDECLUEF;
(PlaceHolderTag as any).prototype.INSIDECLUEG = (PlaceHolderTag as any).INSIDECLUEG;
(PlaceHolderTag as any).prototype.INSIDECLUEH = (PlaceHolderTag as any).INSIDECLUEH;
(PlaceHolderTag as any).prototype.INSIDEITEMA = (PlaceHolderTag as any).INSIDEITEMA;
(PlaceHolderTag as any).prototype.INSIDEITEMB = (PlaceHolderTag as any).INSIDEITEMB;
(PlaceHolderTag as any).prototype.INSIDEITEMC = (PlaceHolderTag as any).INSIDEITEMC;
(PlaceHolderTag as any).prototype.INSIDEITEMD = (PlaceHolderTag as any).INSIDEITEMD;
(PlaceHolderTag as any).prototype.INSIDEITEME = (PlaceHolderTag as any).INSIDEITEME;
(PlaceHolderTag as any).prototype.INSIDEITEMF = (PlaceHolderTag as any).INSIDEITEMF;
(PlaceHolderTag as any).prototype.INSIDEITEMG = (PlaceHolderTag as any).INSIDEITEMG;
(PlaceHolderTag as any).prototype.INSIDEITEMH = (PlaceHolderTag as any).INSIDEITEMH;
(PlaceHolderTag as any).prototype.INSIDEITEMI = (PlaceHolderTag as any).INSIDEITEMI;
(PlaceHolderTag as any).prototype.INSIDEITEMJ = (PlaceHolderTag as any).INSIDEITEMJ;
(PlaceHolderTag as any).prototype.INSIDEITEMK = (PlaceHolderTag as any).INSIDEITEMK;
(PlaceHolderTag as any).prototype.INSIDEITEML = (PlaceHolderTag as any).INSIDEITEML;
(PlaceHolderTag as any).prototype.INSIDEITEMM = (PlaceHolderTag as any).INSIDEITEMM;
(PlaceHolderTag as any).prototype.INSIDEITEMN = (PlaceHolderTag as any).INSIDEITEMN;
(PlaceHolderTag as any).prototype.INSIDEITEMO = (PlaceHolderTag as any).INSIDEITEMO;
(PlaceHolderTag as any).prototype.INSIDEITEMP = (PlaceHolderTag as any).INSIDEITEMP;
(PlaceHolderTag as any).prototype.INSIDEITEMQ = (PlaceHolderTag as any).INSIDEITEMQ;
(PlaceHolderTag as any).prototype.INSIDEITEMR = (PlaceHolderTag as any).INSIDEITEMR;
(PlaceHolderTag as any).prototype.INSIDEITEMS = (PlaceHolderTag as any).INSIDEITEMS;
(PlaceHolderTag as any).prototype.INSIDEITEMT = (PlaceHolderTag as any).INSIDEITEMT;
(PlaceHolderTag as any).prototype.INSIDEITEMU = (PlaceHolderTag as any).INSIDEITEMU;
(PlaceHolderTag as any).prototype.INSIDEITEMV = (PlaceHolderTag as any).INSIDEITEMV;
(PlaceHolderTag as any).prototype.INSIDEITEMW = (PlaceHolderTag as any).INSIDEITEMW;
(PlaceHolderTag as any).prototype.INSIDEITEMX = (PlaceHolderTag as any).INSIDEITEMX;
(PlaceHolderTag as any).prototype.INSIDEITEMY = (PlaceHolderTag as any).INSIDEITEMY;
(PlaceHolderTag as any).prototype.INSIDEITEMZ = (PlaceHolderTag as any).INSIDEITEMZ;
(PlaceHolderTag as any).prototype.INSIDEITEMZA = (PlaceHolderTag as any).INSIDEITEMZA;
(PlaceHolderTag as any).prototype.INSIDEITEMZB = (PlaceHolderTag as any).INSIDEITEMZB;
(PlaceHolderTag as any).prototype.INSIDEITEMZC = (PlaceHolderTag as any).INSIDEITEMZC;
(PlaceHolderTag as any).prototype.INSIDEITEMZD = (PlaceHolderTag as any).INSIDEITEMZD;
(PlaceHolderTag as any).prototype.INSIDEITEMZE = (PlaceHolderTag as any).INSIDEITEMZE;
(PlaceHolderTag as any).prototype.INSIDEITEMZF = (PlaceHolderTag as any).INSIDEITEMZF;
(PlaceHolderTag as any).prototype.INSIDEITEMZG = (PlaceHolderTag as any).INSIDEITEMZG;
(PlaceHolderTag as any).prototype.OUTSIDECLUEA = (PlaceHolderTag as any).OUTSIDECLUEA;
(PlaceHolderTag as any).prototype.OUTSIDECLUEB = (PlaceHolderTag as any).OUTSIDECLUEB;
(PlaceHolderTag as any).prototype.OUTSIDECLUEC = (PlaceHolderTag as any).OUTSIDECLUEC;
(PlaceHolderTag as any).prototype.OUTSIDECLUED = (PlaceHolderTag as any).OUTSIDECLUED;
(PlaceHolderTag as any).prototype.OUTSIDECLUEE = (PlaceHolderTag as any).OUTSIDECLUEE;
(PlaceHolderTag as any).prototype.OUTSIDECLUEF = (PlaceHolderTag as any).OUTSIDECLUEF;
(PlaceHolderTag as any).prototype.OUTSIDECLUEG = (PlaceHolderTag as any).OUTSIDECLUEG;
(PlaceHolderTag as any).prototype.OUTSIDECLUEH = (PlaceHolderTag as any).OUTSIDECLUEH;
(PlaceHolderTag as any).prototype.OUTSIDEITEMA = (PlaceHolderTag as any).OUTSIDEITEMA;
(PlaceHolderTag as any).prototype.OUTSIDEITEMB = (PlaceHolderTag as any).OUTSIDEITEMB;
(PlaceHolderTag as any).prototype.OUTSIDEITEMC = (PlaceHolderTag as any).OUTSIDEITEMC;
(PlaceHolderTag as any).prototype.OUTSIDEITEMD = (PlaceHolderTag as any).OUTSIDEITEMD;
(PlaceHolderTag as any).prototype.OUTSIDEITEME = (PlaceHolderTag as any).OUTSIDEITEME;
(PlaceHolderTag as any).prototype.OUTSIDEITEMF = (PlaceHolderTag as any).OUTSIDEITEMF;
(PlaceHolderTag as any).prototype.OUTSIDEITEMG = (PlaceHolderTag as any).OUTSIDEITEMG;
(PlaceHolderTag as any).prototype.OUTSIDEITEMH = (PlaceHolderTag as any).OUTSIDEITEMH;
(PlaceHolderTag as any).prototype.OUTSIDEITEMI = (PlaceHolderTag as any).OUTSIDEITEMI;
(PlaceHolderTag as any).prototype.OUTSIDEITEMJ = (PlaceHolderTag as any).OUTSIDEITEMJ;
(PlaceHolderTag as any).prototype.OUTSIDEITEMK = (PlaceHolderTag as any).OUTSIDEITEMK;
(PlaceHolderTag as any).prototype.OUTSIDEITEML = (PlaceHolderTag as any).OUTSIDEITEML;
(PlaceHolderTag as any).prototype.OUTSIDEITEMM = (PlaceHolderTag as any).OUTSIDEITEMM;
(PlaceHolderTag as any).prototype.OUTSIDEITEMN = (PlaceHolderTag as any).OUTSIDEITEMN;
(PlaceHolderTag as any).prototype.OUTSIDEITEMO = (PlaceHolderTag as any).OUTSIDEITEMO;
(PlaceHolderTag as any).prototype.OUTSIDEITEMP = (PlaceHolderTag as any).OUTSIDEITEMP;
(PlaceHolderTag as any).prototype.OUTSIDEITEMQ = (PlaceHolderTag as any).OUTSIDEITEMQ;
(PlaceHolderTag as any).prototype.OUTSIDEITEMR = (PlaceHolderTag as any).OUTSIDEITEMR;
(PlaceHolderTag as any).prototype.OUTSIDEITEMS = (PlaceHolderTag as any).OUTSIDEITEMS;
(PlaceHolderTag as any).prototype.OUTSIDEITEMT = (PlaceHolderTag as any).OUTSIDEITEMT;
(PlaceHolderTag as any).prototype.OUTSIDEITEMU = (PlaceHolderTag as any).OUTSIDEITEMU;
(PlaceHolderTag as any).prototype.OUTSIDEITEMV = (PlaceHolderTag as any).OUTSIDEITEMV;
(PlaceHolderTag as any).prototype.OUTSIDEITEMW = (PlaceHolderTag as any).OUTSIDEITEMW;
(PlaceHolderTag as any).prototype.OUTSIDEITEMX = (PlaceHolderTag as any).OUTSIDEITEMX;
(PlaceHolderTag as any).prototype.OUTSIDEITEMY = (PlaceHolderTag as any).OUTSIDEITEMY;
(PlaceHolderTag as any).prototype.OUTSIDEITEMZ = (PlaceHolderTag as any).OUTSIDEITEMZ;
(PlaceHolderTag as any).prototype.OUTSIDEITEMZA = (PlaceHolderTag as any).OUTSIDEITEMZA;
(PlaceHolderTag as any).prototype.OUTSIDEITEMZB = (PlaceHolderTag as any).OUTSIDEITEMZB;
(PlaceHolderTag as any).prototype.OUTSIDEITEMZC = (PlaceHolderTag as any).OUTSIDEITEMZC;
(PlaceHolderTag as any).prototype.OUTSIDEITEMZD = (PlaceHolderTag as any).OUTSIDEITEMZD;
(PlaceHolderTag as any).prototype.OUTSIDEITEMZE = (PlaceHolderTag as any).OUTSIDEITEMZE;
(PlaceHolderTag as any).prototype.OUTSIDEITEMZF = (PlaceHolderTag as any).OUTSIDEITEMZF;
(PlaceHolderTag as any).prototype.OUTSIDEITEMZG = (PlaceHolderTag as any).OUTSIDEITEMZG;
export let PLACE_HOLDER_TAGS: any = [PlaceHolderTag.CLUEA, PlaceHolderTag.CLUEB, PlaceHolderTag.CLUEC, PlaceHolderTag.CLUED, PlaceHolderTag.CLUEE, PlaceHolderTag.CLUEF, PlaceHolderTag.CLUEG, PlaceHolderTag.CLUEH, PlaceHolderTag.ITEMA, PlaceHolderTag.ITEMB, PlaceHolderTag.ITEMC, PlaceHolderTag.ITEMD, PlaceHolderTag.ITEME, PlaceHolderTag.ITEMF, PlaceHolderTag.ITEMG, PlaceHolderTag.ITEMH, PlaceHolderTag.ITEMI, PlaceHolderTag.ITEMJ, PlaceHolderTag.ITEMK, PlaceHolderTag.ITEML, PlaceHolderTag.ITEMM, PlaceHolderTag.ITEMN, PlaceHolderTag.ITEMO, PlaceHolderTag.ITEMP, PlaceHolderTag.ITEMQ, PlaceHolderTag.ITEMR, PlaceHolderTag.ITEMS, PlaceHolderTag.ITEMT, PlaceHolderTag.ITEMU, PlaceHolderTag.ITEMV, PlaceHolderTag.ITEMW, PlaceHolderTag.ITEMX, PlaceHolderTag.ITEMY, PlaceHolderTag.ITEMZ, PlaceHolderTag.ITEMZA, PlaceHolderTag.ITEMZB, PlaceHolderTag.ITEMZC, PlaceHolderTag.ITEMZD, PlaceHolderTag.ITEMZE, PlaceHolderTag.ITEMZF, PlaceHolderTag.ITEMZG, PlaceHolderTag.BELOWCLUEA, PlaceHolderTag.BELOWCLUEB, PlaceHolderTag.BELOWCLUEC, PlaceHolderTag.BELOWCLUED, PlaceHolderTag.BELOWCLUEE, PlaceHolderTag.BELOWCLUEF, PlaceHolderTag.BELOWCLUEG, PlaceHolderTag.BELOWCLUEH, PlaceHolderTag.BELOWITEMA, PlaceHolderTag.BELOWITEMB, PlaceHolderTag.BELOWITEMC, PlaceHolderTag.BELOWITEMD, PlaceHolderTag.BELOWITEME, PlaceHolderTag.BELOWITEMF, PlaceHolderTag.BELOWITEMG, PlaceHolderTag.BELOWITEMH, PlaceHolderTag.BELOWITEMI, PlaceHolderTag.BELOWITEMJ, PlaceHolderTag.BELOWITEMK, PlaceHolderTag.BELOWITEML, PlaceHolderTag.BELOWITEMM, PlaceHolderTag.BELOWITEMN, PlaceHolderTag.BELOWITEMO, PlaceHolderTag.BELOWITEMP, PlaceHolderTag.BELOWITEMQ, PlaceHolderTag.BELOWITEMR, PlaceHolderTag.BELOWITEMS, PlaceHolderTag.BELOWITEMT, PlaceHolderTag.BELOWITEMU, PlaceHolderTag.BELOWITEMV, PlaceHolderTag.BELOWITEMW, PlaceHolderTag.BELOWITEMX, PlaceHolderTag.BELOWITEMY, PlaceHolderTag.BELOWITEMZ, PlaceHolderTag.BELOWITEMZA, PlaceHolderTag.BELOWITEMZB, PlaceHolderTag.BELOWITEMZC, PlaceHolderTag.BELOWITEMZD, PlaceHolderTag.BELOWITEMZE, PlaceHolderTag.BELOWITEMZF, PlaceHolderTag.BELOWITEMZG, PlaceHolderTag.INSIDECLUEA, PlaceHolderTag.INSIDECLUEB, PlaceHolderTag.INSIDECLUEC, PlaceHolderTag.INSIDECLUED, PlaceHolderTag.INSIDECLUEE, PlaceHolderTag.INSIDECLUEF, PlaceHolderTag.INSIDECLUEG, PlaceHolderTag.INSIDECLUEH, PlaceHolderTag.INSIDEITEMA, PlaceHolderTag.INSIDEITEMB, PlaceHolderTag.INSIDEITEMC, PlaceHolderTag.INSIDEITEMD, PlaceHolderTag.INSIDEITEME, PlaceHolderTag.INSIDEITEMF, PlaceHolderTag.INSIDEITEMG, PlaceHolderTag.INSIDEITEMH, PlaceHolderTag.INSIDEITEMI, PlaceHolderTag.INSIDEITEMJ, PlaceHolderTag.INSIDEITEMK, PlaceHolderTag.INSIDEITEML, PlaceHolderTag.INSIDEITEMM, PlaceHolderTag.INSIDEITEMN, PlaceHolderTag.INSIDEITEMO, PlaceHolderTag.INSIDEITEMP, PlaceHolderTag.INSIDEITEMQ, PlaceHolderTag.INSIDEITEMR, PlaceHolderTag.INSIDEITEMS, PlaceHolderTag.INSIDEITEMT, PlaceHolderTag.INSIDEITEMU, PlaceHolderTag.INSIDEITEMV, PlaceHolderTag.INSIDEITEMW, PlaceHolderTag.INSIDEITEMX, PlaceHolderTag.INSIDEITEMY, PlaceHolderTag.INSIDEITEMZ, PlaceHolderTag.INSIDEITEMZA, PlaceHolderTag.INSIDEITEMZB, PlaceHolderTag.INSIDEITEMZC, PlaceHolderTag.INSIDEITEMZD, PlaceHolderTag.INSIDEITEMZE, PlaceHolderTag.INSIDEITEMZF, PlaceHolderTag.INSIDEITEMZG, PlaceHolderTag.OUTSIDECLUEA, PlaceHolderTag.OUTSIDECLUEB, PlaceHolderTag.OUTSIDECLUEC, PlaceHolderTag.OUTSIDECLUED, PlaceHolderTag.OUTSIDECLUEE, PlaceHolderTag.OUTSIDECLUEF, PlaceHolderTag.OUTSIDECLUEG, PlaceHolderTag.OUTSIDECLUEH, PlaceHolderTag.OUTSIDEITEMA, PlaceHolderTag.OUTSIDEITEMB, PlaceHolderTag.OUTSIDEITEMC, PlaceHolderTag.OUTSIDEITEMD, PlaceHolderTag.OUTSIDEITEME, PlaceHolderTag.OUTSIDEITEMF, PlaceHolderTag.OUTSIDEITEMG, PlaceHolderTag.OUTSIDEITEMH, PlaceHolderTag.OUTSIDEITEMI, PlaceHolderTag.OUTSIDEITEMJ, PlaceHolderTag.OUTSIDEITEMK, PlaceHolderTag.OUTSIDEITEML, PlaceHolderTag.OUTSIDEITEMM, PlaceHolderTag.OUTSIDEITEMN, PlaceHolderTag.OUTSIDEITEMO, PlaceHolderTag.OUTSIDEITEMP, PlaceHolderTag.OUTSIDEITEMQ, PlaceHolderTag.OUTSIDEITEMR, PlaceHolderTag.OUTSIDEITEMS, PlaceHolderTag.OUTSIDEITEMT, PlaceHolderTag.OUTSIDEITEMU, PlaceHolderTag.OUTSIDEITEMV, PlaceHolderTag.OUTSIDEITEMW, PlaceHolderTag.OUTSIDEITEMX, PlaceHolderTag.OUTSIDEITEMY, PlaceHolderTag.OUTSIDEITEMZ, PlaceHolderTag.OUTSIDEITEMZA, PlaceHolderTag.OUTSIDEITEMZB, PlaceHolderTag.OUTSIDEITEMZC, PlaceHolderTag.OUTSIDEITEMZD, PlaceHolderTag.OUTSIDEITEMZE, PlaceHolderTag.OUTSIDEITEMZF, PlaceHolderTag.OUTSIDEITEMZG];
export class Phase2Content extends phase0.PhaseContent {
  constructor() {
    super();
    return;
  }
  initialize(game: any, stage: any): any {
    this.game = game;
    this.stage = stage;
    this.hand = new ItemImage(0, 0, assets.load_image("hand_cursor.png"));
    this.hand_item = new ItemImage(0, 0, assets.load_image("hand_item.png"));
    this.hand_magnifier = new ItemImage(0, 0, assets.load_image("hand_magnifiergrab.png"));
    this.hand_open = new ItemImage(0, 0, assets.load_image("p2_handcursor_open_002.png"));
    this.magnifier_take_sound = assets.load_sound("p2_magnifying_glass_grab.ogg");
    this.magnifier_drop_sound = assets.load_sound("p2_magnifying_glass_drop.ogg");
    this.no_clue_sound = assets.load_sound("No_Pista_Mujer.ogg");
    this.clue_sound = assets.load_sound("p1_minigame_right.ogg");
    this.door_close_big_sound = assets.load_sound("p2_door_close_big.ogg");
    this.door_close_small_sound = assets.load_sound("p2_door_close_small.ogg");
    this.door_open_big_sound = assets.load_sound("p2_door_open_big.ogg");
    this.door_open_small_sound = assets.load_sound("p2_door_open_small.ogg");
    this.drawer_open_sound = assets.load_sound("p2_drawer_open.ogg");
    this.drawer_close_sound = assets.load_sound("p2_drawer_close.ogg");
    this.fridge_open_sound = assets.load_sound("p2_fridge_open.ogg");
    this.fridge_close_sound = assets.load_sound("p2_fridge_close.ogg");
    this.chest_open_sound = assets.load_sound("p2_chest_open.ogg");
    this.chest_close_sound = assets.load_sound("p2_chest_close.ogg");
    this.oven_open_sound = assets.load_sound("p2_oven_open.ogg");
    this.oven_close_sound = assets.load_sound("p2_oven_close.ogg");
    this.music_intro = assets.load_music("p2_music_intro.ogg");
    this.music_loop = assets.load_music("p2_music_loop.ogg");
    this.magnifier_taken = false;
    this.clues_count = 0;
    this.build_tags_dictionary();
    return null;
  }
  get_music(): any {
    return [this.music_intro, this.music_loop];
  }
  add_content_layers(): any {
    let large_background, magnifier_height, magnifier_width, stage_height, stage_width, target_surface: any;
    this.stage.prepare_items_set(this.stage, false);
    this.small_back_layer = new Layer();
    this.small_items_layer = new Layer();
    this.magnifier_layer = new Layer();
    this.large_back_layer = new Layer();
    this.large_items_layer = new Layer();
    this.stage.add_layer(this.small_back_layer);
    this.stage.add_layer(this.small_items_layer);
    this.magnifier_image = assets.load_image("p2-magnifier.png");
    this.magnifier_mask = assets.load_mask("p2-magnifier-mask.gif");
    magnifier_width = this.magnifier_image.get_width();
    magnifier_height = this.magnifier_image.get_height();
    this.magnifier = new ItemCustomDraw(330, 170, magnifier_width, magnifier_height, py.bind(this, "draw_magnifier"), this.magnifier_mask);
    this.magnifier.add_event_handler(ItemEvent.CLICK, py.bind(this, "magnifier_click"));
    this.magnifier.add_event_handler(ItemEvent.MOUSE_MOVE, py.bind(this, "magnifier_mouse_move"));
    this.magnifier.add_event_handler(ItemEvent.MOUSE_LEAVE, py.bind(this, "magnifier_mouse_leave"));
    py.m(this.magnifier_layer, "add", this.magnifier);
    [stage_width, stage_height] = this.game.window.get_size();
    target_surface = new pygame.Surface([py.mul(stage_width, 2), py.mul(stage_height, 2)]);
    large_background = assets.load_image("p0_stage_background_large.jpg");
    this.large_stage = new StageIso(this.game, ITEM_TAGS, large_background, target_surface);
    this.large_stage.set_changed_handler(py.bind(this, "large_stage_changed"));
    this.stage.prepare_items_set(this.large_stage, true, this.stage.get_item_definitions());
    this.large_stage.add_layer(this.large_back_layer);
    this.large_stage.add_layer(this.large_items_layer);
    this.stage.set_prerender_buffer(this.small_items_layer);
    this.build_stage();
    return null;
  }
  add_above_options_layers(): any {
    this.stage.add_layer(this.magnifier_layer);
    return null;
  }
  add_above_info_layers(): any {
    this.items_found_layer = new Layer();
    this.stage.add_layer(this.items_found_layer);
    this.load_progress();
    return null;
  }
  load_progress(): any {
    let case_, clue_found, clues_found, item: any;
    case_ = this.stage.game.datastore.user_character_progress.case;
    clues_found = py.slice(case_.clues_found, null, null);
    for (clue_found of py.iter(clues_found)) {
      for (item of py.iter(this.large_items_layer.items)) {
        if ((py.eq(item.get_type(), clue_found) && py.truthy(py.hasattr(item, "is_clue")) && py.truthy(item.is_clue))) {
          this.found_item(item, false);
          break;
        }
      }
    }
    return null;
  }
  magnifier_click(item: any, args: any): any {
    let hit_test_item, new_mouse_x, new_mouse_y, result, state, type: any;
    if (py.truthy(this.magnifier_taken)) {
      new_mouse_x = py.add(this.magnifier.get_left(), 74);
      new_mouse_y = py.add(this.magnifier.get_top(), 66);
      this.drop_magnifier();
      this.stage.set_mouse_pos(new_mouse_x, new_mouse_y);
      this.magnifier_drop_sound.play();
      if (py.eq(this.stage.hit_test(new_mouse_x, new_mouse_y), this.magnifier)) {
        args.x = new_mouse_x;
        args.y = new_mouse_y;
        this.magnifier_mouse_move(item, args);
      }
    } else {
      [result, hit_test_item] = this.hit_test_over_magnifier(item, args.x, args.y);
      if ((result === 1)) {
        this.stage.set_mouse_cursor(this.magnifier, [py.div(this.magnifier.get_width(), 2), py.div(this.magnifier.get_height(), 2)], false, false, new Rect(88, 65, 648, 535));
        pygame.event.set_grab(true);
        this.magnifier_taken = true;
        this.magnifier_take_sound.play();
      } else if ((result === 2)) {
        this.show_item_found_message(hit_test_item, true);
      } else if ((result === 3)) {
        state = hit_test_item.get_state();
        if (py.eq(state, ItemState.NORMAL)) {
          hit_test_item.set_state(ItemState.OPENED);
          hit_test_item.small_item.set_state(ItemState.OPENED);
        } else {
          hit_test_item.set_state(ItemState.NORMAL);
          hit_test_item.small_item.set_state(ItemState.NORMAL);
        }
        this.update_magnifier_mouse_cursor(item, args);
        this.stage.render();
        if (py.eq(state, ItemState.NORMAL)) {
          type = hit_test_item.get_type();
          if ((type === "i101")) {
            this.drawer_open_sound.play();
          } else if ((type === "i105")) {
            this.oven_open_sound.play();
          } else if ((type === "i106")) {
            this.fridge_open_sound.play();
          } else if ((type === "i116")) {
            this.chest_open_sound.play();
          } else if (((type === "i110") || (type === "i104") || (type === "i108") || (type === "i125"))) {
            this.door_open_small_sound.play();
          } else {
            this.door_open_big_sound.play();
          }
        } else {
          type = hit_test_item.get_type();
          if ((type === "i101")) {
            this.drawer_close_sound.play();
          } else if ((type === "i105")) {
            this.oven_close_sound.play();
          } else if ((type === "i106")) {
            this.fridge_close_sound.play();
          } else if ((type === "i116")) {
            this.chest_close_sound.play();
          } else if (((type === "i110") || (type === "i104") || (type === "i108") || (type === "i125"))) {
            this.door_close_small_sound.play();
          } else {
            this.door_close_big_sound.play();
          }
        }
      }
    }
    return null;
  }
  magnifier_mouse_move(item: any, args: any): any {
    this.update_magnifier_mouse_cursor(item, args);
    return null;
  }
  update_magnifier_mouse_cursor(item: any, args: any): any {
    let hit_test_item, result: any;
    if (!py.truthy(this.magnifier_taken)) {
      [result, hit_test_item] = this.hit_test_over_magnifier(item, args.x, args.y);
      if ((result === 0)) {
        this.stage.set_mouse_cursor(null);
      } else if ((result === 1)) {
        this.stage.set_mouse_cursor(this.hand_magnifier, [25, 30]);
      } else if ((result === 2)) {
        this.stage.set_mouse_cursor(this.hand_item, [23, 18]);
      } else if ((result === 3)) {
        this.stage.set_mouse_cursor(this.hand_open, [25, 20]);
      } else {
        this.stage.set_mouse_cursor(this.hand, [23, 18]);
      }
    }
    return null;
  }
  hit_test_over_magnifier(item: any, x: any, y: any): any {
    let c, c_2, hand_center_x, hand_center_y, has_outside_item, hit_test_item, hit_test_stack, large_x, large_y, place_holder, small_item: any;
    hand_center_x = (x - item.get_left());
    hand_center_y = (y - item.get_top());
    if (((hand_center_x >= 0) && (hand_center_y >= 0) && (hand_center_x < this.magnifier_mask.get_width()) && (hand_center_y < this.magnifier_mask.get_height()))) {
      c = this.magnifier_mask.get_at([hand_center_x, hand_center_y]);
      if (py.eq(c, [255, 0, 0, 255])) {
        return [1, null];
      }
      c_2 = this.magnifier_mask.get_at([hand_center_x, hand_center_y]);
      if ((py.eq(c, [0, 0, 255, 255]) || py.eq(c_2, [0, 0, 255, 255]))) {
        [large_x, large_y] = this.get_amplified_pos(x, y);
        hit_test_stack = this.large_stage.hit_test_stack(large_x, large_y, true);
        for (hit_test_item of py.iter(hit_test_stack)) {
          if (py.truthy(py.isinstance(hit_test_item, ItemCell))) {
            if (py.truthy(py.hasattr(hit_test_item, "is_clue"))) {
              return [2, hit_test_item];
            }
            if (py.truthy(hit_test_item.get_definition().has_state(ItemState.OPENED))) {
              has_outside_item = false;
              small_item = hit_test_item.small_item;
              if (py.truthy(py.hasattr(small_item, "place_holders_used"))) {
                for (place_holder of py.iter(small_item.place_holders_used)) {
                  if (py.truthy(place_holder.outside)) {
                    has_outside_item = true;
                    break;
                  }
                }
              }
              if (!py.truthy(has_outside_item)) {
                c = hit_test_item.get_at_mask(large_x, large_y, "m");
                if (py.eq(c, [0, 0, 0, 255])) {
                  return [3, hit_test_item];
                }
              }
            }
          }
        }
        return [4, null];
      }
      return [0, null];
    }
    return [0, null];
  }
  drop_magnifier(): any {
    if (py.truthy(this.magnifier_taken)) {
      pygame.event.set_grab(false);
      this.magnifier_taken = false;
      this.stage.set_mouse_cursor(null);
    }
    return null;
  }
  magnifier_mouse_leave(item: any, args: any): any {
    let mouse_cursor: any;
    mouse_cursor = this.stage.get_mouse_cursor();
    if ((py.eq(mouse_cursor, this.hand) || py.eq(mouse_cursor, this.hand_item) || py.eq(mouse_cursor, this.hand_open) || py.eq(mouse_cursor, this.hand_magnifier))) {
      this.stage.set_mouse_cursor(null);
    }
    return null;
  }
  show_item_found_message(item: any, from_stage: any): any {
    let box, case_, close_button, close_x, close_y, clue_id, dialog, font, image, message, rollover_image, sound, text_item: any;
    this.items_layer_selected_item = item;
    if (py.truthy(item.is_clue)) {
      sound = this.clue_sound;
      this.update_case_last_department_lair();
      this.item_dialog = this.stage.show_clue_message(item, from_stage, false, py.bind(this, "item_dialog_close_click"));
      if (py.truthy(from_stage)) {
        clue_id = item.stage_clue.clue.id;
        case_ = this.game.datastore.user_character_progress.case;
        if (!py.contains(case_.clues_found, clue_id)) {
          py.m(case_.clues_found, "append", clue_id);
        }
        this.stage.render();
        this.stage.save_progress(false);
      }
    } else {
      dialog = new Layer();
      font = assets.load_font("evilgeniusbb_reg.ttf", 13);
      image = assets.load_image("p2_avatar_dialog_notaclue.png");
      box = new ItemImage(62, 198, image);
      py.m(dialog, "add", box);
      message = "Esto no parece ser una pista interesante...";
      message = text.to_upper(message);
      text_item = new ItemText(122, 239, font, 12, message, [0, 0, 0], null, 210, 30, 2, 2);
      py.m(dialog, "add", text_item);
      close_x = 356;
      close_y = 218;
      sound = this.no_clue_sound;
      image = assets.load_image("btn_testigo_x_normal.png");
      rollover_image = assets.load_image("btn_testigo_x_rollover.png");
      close_button = new ItemImage(close_x, close_y, image, null, true);
      close_button.set_rollover_image(rollover_image, this.stage.rollover_sound);
      close_button.add_event_handler(ItemEvent.CLICK, py.bind(this, "item_dialog_close_click"));
      py.m(dialog, "add", close_button);
      this.item_dialog = dialog;
      this.stage.prepare_dialog(dialog);
      this.stage.show_dialog(dialog, py.bind(this, "item_dialog_handle_event"));
    }
    if (py.truthy(from_stage)) {
      this.stage.render();
      sound.play();
    }
    return null;
  }
  item_dialog_handle_event(e: any): any {
    if (py.eq(e.type, KEYDOWN)) {
      if (py.eq(e.key, pygame.K_ESCAPE)) {
        this.stage.render();
        this.stage.click_sound.play();
        this.close_item_dialog();
        return true;
      }
    }
    return null;
  }
  found_item(item: any, show_animation: any = true): any {
    let cp: any;
    if (py.truthy(show_animation)) {
      animations.fade_out_item(item.small_item, true);
      animations.fade_out_item(item, true);
      this.stage.fade_sound.play();
    } else {
      py.m(item.small_item.get_layer(), "remove", item.small_item);
      py.m(item.get_layer(), "remove", item);
    }
    this.add_item_found(item, show_animation);
    this.clues_count = this.clues_count + 1;
    if ((this.clues_count === 3)) {
      cp = this.stage.game.datastore.user_character_progress;
      if (!py.truthy(cp.phase2_help)) {
        this.stage.show_help_dialog(102, 1000, py.bind(this, "drop_magnifier"));
        cp.phase2_help = true;
      }
    }
    return null;
  }
  item_dialog_close_click(item: any = null, args: any = null): any {
    this.close_item_dialog();
    return null;
  }
  close_item_dialog(): any {
    this.stage.close_dialog(this.item_dialog);
    this.item_dialog = null;
    if (py.truthy(this.items_layer_selected_item.is_clue)) {
      if ((this.items_layer_selected_item.get_layer() != null)) {
        this.found_item(this.items_layer_selected_item);
      }
    }
    this.stage.reset_dialog();
    return null;
  }
  add_item_found(items_layer_selected_item: any, show_animation: any): any {
    let item: any;
    item = this.stage.add_item_found(items_layer_selected_item, show_animation);
    if (py.truthy(show_animation)) {
      animations.fade_in_item(item, 500, py.bind(this, "check_map_help_shown"));
    }
    return null;
  }
  check_map_help_shown(item: any): any {
    if ((py.len(this.stage.items_found) === 1)) {
      this.stage.start_map_help_animation();
    }
    return null;
  }
  item_found_click(item: any, args: any): any {
    this.show_item_found_message(item.stage_item, false);
    return null;
  }
  draw_magnifier(item: any, target: any): any {
    let back_x, back_y, delta_x, delta_y, x, y: any;
    this.large_stage.render();
    x = item.get_left();
    y = item.get_top();
    [back_x, back_y] = this.get_amplified_pos(x, y);
    delta_x = 35;
    delta_y = 21;
    target.blit_stage(this.large_stage, [py.add(x, delta_x), py.add(y, delta_y)], new Rect(py.add(back_x, delta_x), py.add(back_y, delta_y), 76, 18));
    delta_x = 23;
    delta_y = 39;
    target.blit_stage(this.large_stage, [py.add(x, delta_x), py.add(y, delta_y)], new Rect(py.add(back_x, delta_x), py.add(back_y, delta_y), 101, 72));
    delta_x = 33;
    delta_y = 111;
    target.blit_stage(this.large_stage, [py.add(x, delta_x), py.add(y, delta_y)], new Rect(py.add(back_x, delta_x), py.add(back_y, delta_y), 74, 9));
    target.blit_image(this.magnifier_image, [x, y]);
    return null;
  }
  get_amplified_pos(x: any, y: any): any {
    let left, top: any;
    left = this.magnifier.get_left();
    top = this.magnifier.get_top();
    return [py.add((py.mul(left, 2) + 73), (x - left)), py.add((py.mul(top, 2) + 73), (y - top))];
  }
  build_stage(): any {
    let build_stage_attempt, case_, clue_place_holders, empty_place_holders, item_place_holders, layout, old_magnifier_visible, set_number, stage_built: any;
    case_ = this.game.datastore.user_character_progress.case;
    set_number = py.getitem(case_.thief_lair_set, 0);
    layout = py.getitem(case_.thief_lair_set, 1);
    old_magnifier_visible = this.magnifier.get_visible();
    this.magnifier.set_visible(false);
    stage_built = false;
    build_stage_attempt = 0;
    while (!py.truthy(stage_built)) {
      this.small_back_layer.empty();
      this.small_items_layer.empty();
      this.large_back_layer.empty();
      this.large_items_layer.empty();
      this.load_level_in_stages(py.fmt("l%03da", py.getitem(set_number, 0)), true);
      this.load_level_in_stages(py.fmt("l%03db", py.getitem(set_number, 1)), false);
      empty_place_holders = [];
      this.stage.load_place_holders(this.small_back_layer, empty_place_holders);
      if ((py.len(empty_place_holders) > 0)) {
        throw new py.Exception("Place holder in the back items are not supported");
      }
      this.stage.load_place_holders(this.small_items_layer, empty_place_holders);
      [clue_place_holders, item_place_holders] = this.analyze_place_holders(empty_place_holders);
      if ((layout != null)) {
        if (py.truthy(this.load_layout(layout, clue_place_holders, item_place_holders))) {
          stage_built = true;
        } else {
          py.print("Invalid layout. Generating a new one");
          layout = null;
        }
      } else {
        layout = [];
        if (py.truthy(this.add_clues_and_extra_items(clue_place_holders, item_place_holders, build_stage_attempt, layout))) {
          stage_built = true;
        } else {
          build_stage_attempt = build_stage_attempt + 1;
          layout = null;
        }
      }
    }
    py.setitem(case_.thief_lair_set, 1, layout);
    this.magnifier.set_visible(old_magnifier_visible);
    return null;
  }
  load_layout(layout: any, clue_place_holders: any, item_place_holders: any): any {
    let case_, category, clues, is_clue, item, item_type, place_holder, place_holder_index: any;
    case_ = this.game.datastore.user_character_progress.case;
    clues = case_.list_stage_clues;
    for (item of py.iter(layout)) {
      item_type = py.getitem(item, 0);
      place_holder_index = py.getitem(item, 1);
      category = py.getitem(item, 2);
      if ((category === 1)) {
        if ((place_holder_index >= py.len(clue_place_holders))) {
          return false;
        }
        place_holder = py.getitem(clue_place_holders, place_holder_index);
        is_clue = true;
      } else if ((category === 2)) {
        if ((place_holder_index >= py.len(clue_place_holders))) {
          return false;
        }
        place_holder = py.getitem(clue_place_holders, place_holder_index);
        is_clue = false;
      } else if ((category === 3)) {
        if ((place_holder_index >= py.len(item_place_holders))) {
          return false;
        }
        place_holder = py.getitem(item_place_holders, place_holder_index);
        is_clue = false;
      } else {
        return false;
      }
      if (!py.contains(place_holder.items, item_type)) {
        return false;
      }
      if (!py.truthy(this.add_item(item_type, place_holder, is_clue, clues, null))) {
        return false;
      }
    }
    return true;
  }
  disable_magnifier(): any {
    this.magnifier.set_visible(false);
    return null;
  }
  add_clues_and_extra_items(clue_place_holders: any, item_place_holders: any, build_stage_attempt: any, layout: any): any {
    let added_items, below_prob, character_progress, extra_items, fake_clues, inside_clue_prob, inside_item_prob, level: any;
    character_progress = this.stage.game.datastore.user_character_progress;
    level = character_progress.range.level;
    if ((level === 0)) {
      fake_clues = 2;
      extra_items = 3;
      below_prob = 0;
      inside_clue_prob = 0;
      inside_item_prob = 0.3;
    } else if ((level === 1)) {
      fake_clues = 3;
      extra_items = 3;
      below_prob = 0.1;
      inside_clue_prob = 0.1;
      inside_item_prob = 0.3;
    } else if ((level === 2)) {
      fake_clues = 3;
      extra_items = 4;
      below_prob = 0.2;
      inside_clue_prob = 0.2;
      inside_item_prob = 0.3;
    } else if ((level === 3)) {
      fake_clues = 4;
      extra_items = 4;
      below_prob = 0.3;
      inside_clue_prob = 0.3;
      inside_item_prob = 0.3;
    } else if ((level === 4)) {
      fake_clues = 4;
      extra_items = 5;
      below_prob = 0.4;
      inside_clue_prob = 0.4;
      inside_item_prob = 0.4;
    } else {
      fake_clues = 5;
      extra_items = 5;
      below_prob = 0.5;
      inside_clue_prob = 0.5;
      inside_item_prob = 0.4;
    }
    added_items = py.mkdict([]);
    if (!py.truthy(this.add_clues(clue_place_holders, fake_clues, below_prob, inside_clue_prob, build_stage_attempt, added_items, layout))) {
      return false;
    }
    this.add_extra_items(item_place_holders, extra_items, below_prob, inside_item_prob, added_items, layout);
    return true;
  }
  add_clues(place_holders: any, fake_clues: any, below_prob: any, inside_prob: any, build_stage_attempt: any, added_items: any, layout: any): any {
    let below_place_holders, case_, clues, clues_left, inside_place_holders, normal_place_holders, place_holder, possible_item, possible_items, used_place_holders: any;
    case_ = this.game.datastore.user_character_progress.case;
    clues_left = [py.getitem(case_.list_stage_clues, 0).clue.id, py.getitem(case_.list_stage_clues, 1).clue.id, py.getitem(case_.list_stage_clues, 2).clue.id];
    clues = case_.list_stage_clues;
    used_place_holders = [];
    [normal_place_holders, below_place_holders, inside_place_holders] = this.split_place_holders(place_holders);
    while (((py.len(clues_left) > 0) && (py.len(normal_place_holders) > 0))) {
      place_holder = this.extract_random_place_holder(normal_place_holders, below_place_holders, below_prob, inside_place_holders, inside_prob);
      if (py.truthy(this.valid_place_holder(place_holder))) {
        possible_items = py.slice(place_holder.items, null, null);
        while ((py.len(possible_items) > 0)) {
          possible_item = random.choice(possible_items);
          if (py.contains(clues_left, possible_item)) {
            if (py.truthy(this.add_item(possible_item, place_holder, true, clues, layout))) {
              py.m(clues_left, "remove", possible_item);
              py.setitem(added_items, possible_item, place_holder);
              py.m(used_place_holders, "append", place_holder);
              break;
            }
          }
          py.m(possible_items, "remove", possible_item);
        }
      }
    }
    if (((py.len(clues_left) > 0) && (build_stage_attempt < 3))) {
      py.print(py.add(py.add(py.add(py.add("Some of the clues ", py.str(clues_left)), " couldn't be located, building the stage again (attempt "), py.str(build_stage_attempt)), ")"));
      return false;
    } else {
      [normal_place_holders, below_place_holders, inside_place_holders] = this.split_place_holders(place_holders, used_place_holders);
      while (((py.len(normal_place_holders) > 0) && (fake_clues > 0))) {
        place_holder = this.extract_random_place_holder(normal_place_holders, below_place_holders, below_prob, inside_place_holders, inside_prob);
        if (py.truthy(this.valid_place_holder(place_holder))) {
          possible_items = py.slice(place_holder.items, null, null);
          while ((py.len(possible_items) > 0)) {
            possible_item = random.choice(possible_items);
            if (!py.contains(added_items, possible_item)) {
              if (py.truthy(this.add_item(possible_item, place_holder, false, null, layout))) {
                py.setitem(added_items, possible_item, place_holder);
                fake_clues = fake_clues - 1;
                break;
              }
            }
            py.m(possible_items, "remove", possible_item);
          }
        }
      }
      return true;
    }
  }
  add_extra_items(place_holders: any, extra_items: any, below_prob: any, inside_prob: any, added_items: any, layout: any): any {
    let below_place_holders, inside_place_holders, normal_place_holders, place_holder, possible_item, possible_items: any;
    [normal_place_holders, below_place_holders, inside_place_holders] = this.split_place_holders(place_holders);
    while (((extra_items > 0) && (py.len(normal_place_holders) > 0))) {
      place_holder = this.extract_random_place_holder(normal_place_holders, below_place_holders, below_prob, inside_place_holders, inside_prob);
      if (py.truthy(this.valid_place_holder(place_holder))) {
        possible_items = py.slice(place_holder.items, null, null);
        while ((py.len(possible_items) > 0)) {
          possible_item = random.choice(possible_items);
          if (!py.contains(added_items, possible_item)) {
            if (py.truthy(this.add_item(possible_item, place_holder, false, null, layout))) {
              py.setitem(added_items, possible_item, place_holder);
              extra_items = extra_items - 1;
              break;
            }
          }
          py.m(possible_items, "remove", possible_item);
        }
      }
    }
    return null;
  }
  valid_place_holder(place_holder: any): any {
    let place_holder_used, stage_item: any;
    if (py.truthy(place_holder.outside)) {
      stage_item = place_holder.stage_item;
      if (py.truthy(py.hasattr(stage_item, "place_holders_used"))) {
        for (place_holder_used of py.iter(stage_item.place_holders_used)) {
          if (py.truthy(place_holder_used.inside)) {
            return false;
          }
        }
      }
    } else if (py.truthy(place_holder.inside)) {
      stage_item = place_holder.stage_item;
      if (py.truthy(py.hasattr(stage_item, "place_holders_used"))) {
        for (place_holder_used of py.iter(stage_item.place_holders_used)) {
          if (py.truthy(place_holder_used.outside)) {
            return false;
          }
        }
      }
    }
    return true;
  }
  split_place_holders(place_holders: any, exclude_place_holders: any = $d1): any {
    let below, inside, normal, place_holder: any;
    normal = [];
    below = [];
    inside = [];
    for (place_holder of py.iter(place_holders)) {
      if (!py.contains(exclude_place_holders, place_holder)) {
        if (py.truthy(place_holder.inside)) {
          py.m(inside, "append", place_holder);
        } else if (py.truthy(place_holder.below)) {
          py.m(below, "append", place_holder);
        } else {
          py.m(normal, "append", place_holder);
        }
      }
    }
    return [normal, below, inside];
  }
  extract_random_place_holder(normal_place_holders: any, below_place_holders: any, below_prob: any, inside_place_holders: any, inside_prob: any): any {
    let below, inside, place_holder, rand_value: any;
    if ((py.len(inside_place_holders) === 0)) {
      inside = false;
    } else {
      rand_value = random.random();
      inside = (rand_value < inside_prob);
    }
    if (py.truthy(inside)) {
      place_holder = random.choice(inside_place_holders);
      py.m(inside_place_holders, "remove", place_holder);
    } else {
      if ((py.len(below_place_holders) === 0)) {
        below = false;
      } else {
        rand_value = random.random();
        below = (rand_value < below_prob);
      }
      if (py.truthy(below)) {
        place_holder = random.choice(below_place_holders);
        py.m(below_place_holders, "remove", place_holder);
      } else {
        place_holder = random.choice(normal_place_holders);
        py.m(normal_place_holders, "remove", place_holder);
      }
    }
    return place_holder;
  }
  add_item(item_type: any, place_holder: any, is_clue: any, clues: any, layout: any): any {
    let add_index, category, large_item, only_visible_in_states, small_item, stage_clue, stage_item, valid: any;
    add_index = this.get_place_holder_add_index(place_holder);
    valid = this.validate_place_holder(place_holder, false, add_index);
    if (!py.truthy(valid)) {
      return false;
    } else {
      if (py.truthy(is_clue)) {
        stage_clue = this.stage.find_clue(clues, item_type);
      } else {
        stage_clue = null;
      }
      if (py.truthy(place_holder.inside)) {
        only_visible_in_states = [ItemState.OPENED];
      } else {
        only_visible_in_states = null;
      }
      small_item = new ItemCell(this.stage, item_type, ItemState.NORMAL);
      small_item.is_clue = is_clue;
      small_item.place_holder = place_holder;
      if ((stage_clue != null)) {
        small_item.stage_clue = stage_clue;
      }
      small_item.set_to_place_holder(place_holder.stage_item, place_holder.place_holder, place_holder.below, only_visible_in_states);
      py.m(this.small_items_layer, "add", small_item, add_index);
      large_item = small_item.clone(this.large_stage);
      large_item.is_clue = is_clue;
      large_item.small_item = small_item;
      if ((stage_clue != null)) {
        large_item.stage_clue = stage_clue;
      }
      py.m(this.large_items_layer, "add", large_item, add_index);
      place_holder.stage_item.large_item.register_placeholder_item(large_item);
      if ((layout != null)) {
        if (py.truthy(place_holder.clue)) {
          if (py.truthy(is_clue)) {
            category = 1;
          } else {
            category = 2;
          }
        } else {
          category = 3;
        }
        py.m(layout, "append", [item_type, place_holder.list_index, category]);
      }
      stage_item = place_holder.stage_item;
      if (!py.truthy(py.hasattr(stage_item, "place_holders_used"))) {
        stage_item.place_holders_used = [place_holder];
      } else {
        py.m(stage_item.place_holders_used, "append", place_holder);
      }
      return true;
    }
  }
  analyze_place_holders(empty_place_holders: any): any {
    let clue_place_holders, index, info, item_place_holders, place_holder, stage_item: any;
    clue_place_holders = [];
    item_place_holders = [];
    for ([stage_item, place_holder, index] of py.iter(empty_place_holders)) {
      info = this.get_place_holder_info(place_holder.tag, stage_item, place_holder, index);
      if (py.truthy(info.clue)) {
        info.list_index = py.len(clue_place_holders);
        py.m(clue_place_holders, "append", info);
      } else {
        info.list_index = py.len(item_place_holders);
        py.m(item_place_holders, "append", info);
      }
    }
    return [clue_place_holders, item_place_holders];
  }
  get_place_holder_add_index(place_holder: any): any {
    let index, next_item, previous_item, stage_item: any;
    stage_item = place_holder.stage_item;
    index = py.m(this.small_items_layer.items, "index", stage_item);
    if (py.truthy(place_holder.below)) {
      while ((index > 0)) {
        previous_item = py.getitem(this.small_items_layer.items, (index - 1));
        if ((!py.truthy(py.hasattr(previous_item, "place_holder")) || !py.eq(previous_item.place_holder.stage_item, place_holder.stage_item) || (previous_item.place_holder.index <= place_holder.index))) {
          break;
        }
        index = index - 1;
      }
    } else {
      index = index + 1;
      while ((index < py.len(this.small_items_layer.items))) {
        next_item = py.getitem(this.small_items_layer.items, index);
        if ((!py.truthy(py.hasattr(next_item, "place_holder")) || !py.eq(next_item.place_holder.stage_item, place_holder.stage_item) || (next_item.place_holder.index > place_holder.index))) {
          break;
        }
        index = index + 1;
      }
    }
    return index;
  }
  build_tags_dictionary(): any {
    let tag: any;
    this.place_holder_tags = py.mkdict([]);
    for (tag of py.iter(PLACE_HOLDER_TAGS)) {
      py.setitem(this.place_holder_tags, py.getitem(tag, 0), tag);
    }
    return null;
  }
  get_place_holder_info(id: any, stage_item: any, place_holder: any, place_holder_index: any): any {
    let below, clue, inside, items, outside, tag, type: any;
    below = false;
    inside = false;
    outside = false;
    clue = false;
    tag = py.m(this.place_holder_tags, "get", id);
    if ((tag == null)) {
      items = null;
    } else {
      items = py.getitem(tag, 1);
      type = py.getitem(tag, 2);
      if (py.eq(type, PlaceHolderType.NORMALCLUE)) {
        clue = true;
      } else if (py.eq(type, PlaceHolderType.NORMALITEM)) {
      }
      if (py.eq(type, PlaceHolderType.OUTSIDECLUE)) {
        clue = true;
        outside = true;
      } else if (py.eq(type, PlaceHolderType.OUTSIDEITEM)) {
        outside = true;
      } else if (py.eq(type, PlaceHolderType.BELOWCLUE)) {
        clue = true;
        below = true;
      } else if (py.eq(type, PlaceHolderType.BELOWITEM)) {
        below = true;
      } else if (py.eq(type, PlaceHolderType.INSIDECLUE)) {
        clue = true;
        inside = true;
      } else if (py.eq(type, PlaceHolderType.INSIDEITEM)) {
        inside = true;
      }
    }
    return new PlaceHolderInfo(below, inside, outside, clue, stage_item, place_holder, place_holder_index, items);
  }
  validate_place_holder(place_holder: any, check_covered: any, add_index: any): any {
    let is_over, place_holder_def, stage_item, x, y: any;
    stage_item = place_holder.stage_item;
    place_holder_def = place_holder.place_holder;
    [x, y] = stage_item.get_place_holder_xy(place_holder_def);
    if ((!py.truthy(check_covered) && !py.truthy(place_holder.below))) {
      is_over = this.is_over_item(stage_item, place_holder_def, place_holder.below, add_index, x, y);
      if ((is_over === 0)) {
        return true;
      }
      return false;
    } else {
      is_over = this.is_over_item(stage_item, place_holder_def, place_holder.below, add_index, x, y);
      if ((is_over !== 0)) {
        return false;
      }
      is_over = this.is_over_item(stage_item, place_holder_def, place_holder.below, add_index, (x - 4), (y - 4));
      if ((is_over !== 0)) {
        return false;
      }
      is_over = this.is_over_item(stage_item, place_holder_def, place_holder.below, add_index, py.add(x, 4), py.add(y, 4));
      if ((is_over !== 0)) {
        return false;
      }
      return true;
    }
    return null;
  }
  is_over_item(stage_item: any, place_holder_def: any, below: any, add_index: any, x: any, y: any): any {
    let cells, height, hit_test_stack, item, item_place_holder, items, margin, width, y0: any;
    if (py.truthy(py.m(place_holder_def.tag, "startswith", "Inside"))) {
      item = this.stage.hit_test(x, y);
      if (!py.eq(stage_item, item)) {
        return 1;
      }
      if (py.truthy(py.hasattr(stage_item, "placeholder_items"))) {
        items = stage_item.placeholder_items;
        for (item of py.iter(items)) {
          if (py.truthy(py.hasattr(item, "place_holder"))) {
            item_place_holder = item.place_holder.place_holder;
            if ((py.truthy(py.m(item_place_holder.tag, "startswith", "Inside")) && (py.abs((place_holder_def.x - item_place_holder.x)) < 8) && (py.abs((place_holder_def.y - item_place_holder.y)) < 8))) {
              return 1;
            }
          }
        }
      }
      return 0;
    } else {
      item = this.stage.hit_test(x, y);
      if ((item != null)) {
        if (py.eq(stage_item, item)) {
          hit_test_stack = this.stage.hit_test_stack(x, y);
          for (item of py.iter(hit_test_stack)) {
            if ((!py.eq(item, stage_item) && py.eq(item.get_layer(), this.small_items_layer) && py.truthy(py.isinstance(item, ItemCell)) && !py.eq(item.get_definition().tag, ItemTag.FLOOR) && !py.eq(item.get_definition().tag, ItemTag.WALL))) {
              if (py.truthy(below)) {
                return 1;
              }
              if ((!py.truthy(py.hasattr(item, "place_holder")) || !py.eq(item.place_holder.stage_item, stage_item))) {
                return 1;
              }
            }
          }
          return 0;
        }
        if (py.eq(item.get_layer(), this.small_items_layer)) {
          if (py.truthy(below)) {
            return 1;
          }
          if (py.truthy(py.hasattr(item, "place_holder"))) {
            item_place_holder = item.place_holder.place_holder;
            if (((py.abs((place_holder_def.x - item_place_holder.x)) < 8) && (py.abs((place_holder_def.y - item_place_holder.y)) < 8) && py.eq(item.place_holder.stage_item, stage_item))) {
              return 1;
            }
          }
          if ((py.truthy(py.hasattr(item, "is_clue")) && py.truthy(item.is_clue))) {
            return 1;
          }
          if ((this.small_items_layer.index_of(item) < add_index)) {
            return 0;
          }
        } else {
          cells = py.add(py.getitem(GRID_SIZE, 0), py.getitem(GRID_SIZE, 1));
          width = py.mul(py.div(GRID_CELL_WIDTH, 2), cells);
          height = py.mul(py.div(GRID_CELL_HEIGHT, 2), cells);
          margin = 5;
          y0 = (py.add(py.getitem(GRID_ORIGIN, 1), height) - py.div(py.mul(py.abs((x - py.getitem(GRID_ORIGIN, 0))), height), width));
          if (((x < py.add((py.getitem(GRID_ORIGIN, 0) - py.div(width, 2)), margin)) || (x > (py.add(py.getitem(GRID_ORIGIN, 0), py.div(width, 2)) - margin)) || (y > (y0 - margin)))) {
            return 2;
          }
          return 0;
        }
        if (py.truthy(py.isinstance(item, ItemCell))) {
          if ((!py.eq(item.get_definition().tag, ItemTag.FLOOR) && (!py.truthy(py.hasattr(item, "place_holder")) || !py.eq(item.place_holder.stage_item, stage_item)))) {
            return 1;
          }
          if (py.truthy(py.hasattr(item, "is_clue"))) {
            return 1;
          }
        }
      }
      return 2;
    }
  }
  load_level_in_stages(level_name: any, background: any): any {
    let i, large_items, large_layer, small_items, small_layer: any;
    if (py.truthy(os.path.isfile(os.path.join("data", py.add(py.add(this.stage.get_set_name(), level_name), ".tcl"))))) {
      if (py.truthy(background)) {
        small_layer = this.small_back_layer;
        large_layer = this.large_back_layer;
      } else {
        small_layer = this.small_items_layer;
        large_layer = this.large_items_layer;
      }
      small_items = this.stage.load_level(level_name, small_layer, ITEM_STATES);
      large_items = this.large_stage.load_level(level_name, large_layer, ITEM_STATES);
      for (i of py.range(py.len(small_items))) {
        py.getitem(large_items, i).small_item = py.getitem(small_items, i);
        py.getitem(small_items, i).large_item = py.getitem(large_items, i);
      }
    }
    return null;
  }
  large_stage_changed(stage: any): any {
    this.magnifier.set_dirty();
    return null;
  }
  update_case_last_department_lair(): any {
    let case_: any;
    case_ = this.game.datastore.user_character_progress.case;
    if ((py.eq(case_.last_department_lair, py.getitem(case_.list_departments, 0)) && py.eq(case_.last_department_visited, py.getitem(case_.list_departments, 0)))) {
      this.game.datastore.user_character_progress.case.last_department_lair = py.getitem(case_.list_departments, 1);
    }
    return null;
  }
}
export class PlaceHolderInfo {
  constructor(below: any, inside: any, outside: any, clue: any, stage_item: any, place_holder: any, index: any, items: any) {
    this.below = below;
    this.inside = inside;
    this.outside = outside;
    this.clue = clue;
    this.stage_item = stage_item;
    this.place_holder = place_holder;
    this.index = index;
    this.items = items;
    return;
  }
}
py.register("game/stages/phase2", $self);
export function $set(name: string, v: any): void {
  switch (name) {
    case "ITEM_STATES": ITEM_STATES = v; break;
    case "ITEM_TAGS": ITEM_TAGS = v; break;
    case "PLACE_HOLDER_TAGS": PLACE_HOLDER_TAGS = v; break;
  }
}
