// More new kinds of witness (the updated edition), each with a real-time canvas minigame in its own file:
//   Matero      "Mate cebado"   pour the thermos into the mate up to the mark (mate.ts)
//   Corredora   "Rambla"        jump the obstacles of the Rambla at sunset (rambla.ts)
// Their pictures are drawn by code (witnessart.ts), so they are always available. They join the registry of newgames.ts (see content/facts.ts).
import { MinigameMate } from './mate';
import { MinigameRambla } from './rambla';

export { MinigameMate, MinigameRambla };
export const EXTRA_WITNESSES: Record<string, { cls: any; image: string }> = {
  Matero: { cls: MinigameMate, image: 'p1_witness_matero.png' },
  Corredora: { cls: MinigameRambla, image: 'p1_witness_corredora.png' },
};
