// Time grace: a very advanced player gets ONE more night when the time is up; the second time (or a player who is not advanced) loses the case.
import { toHub } from './lib.mjs';
const assert = (c, m) => { if (!c) throw new Error('ASSERT: ' + m); };
export default async (dev) => {
  toHub(dev);
  const ds = dev.game.datastore, st = dev.game.stage, c = ds.user_character_progress.case;
  const grace = dev.grace;
  const name = () => Object.keys(dev.py.userFiles()).find((k) => /^data\/c\d+\.dat$/.test(k));
  // definition: the start of the case is not "very advanced"; the second to last / last department of the chain or the arrest order are
  assert(!grace.veryAdvanced(c) && !grace.grant(c), 'a new case gets no grace');
  const deps = c.list_departments, n = deps.length, lair0 = c.last_department_lair;
  c.last_department_lair = deps[Math.max(1, n - 2)];
  assert(grace.veryAdvanced(c), 'second to last department counts');
  c.last_department_lair = lair0;
  c.arrest_order_thief = c.thief;
  assert(grace.veryAdvanced(c), 'arrest order counts');

  // the time runs out: one more night, with the message
  const limit0 = c.time_limit;
  st.set_time_left(c.time_limit - c.time_spend);
  dev.go(1500);
  assert(c.grace_used && c.time_limit === limit0 + 8, 'the grace was given: ' + c.time_limit + ' vs ' + limit0);
  assert(!st._Phase0Stage__ending_visible, 'the case is not lost yet');
  dev.save('grace_dialog');
  assert(/^grace;1$/m.test(dev.py.userFiles()[name()]), 'the grace is saved with the case');
  dev.click(300, 358, 80); dev.go(300);
  assert(st.layers && !st._Phase0Stage__ending_visible, 'dialog closed, game goes on');

  // the next night passes and the time is up again: the case is lost
  st.set_time_left(c.time_limit - c.time_spend);
  dev.go(2500);
  assert(c.time_limit === limit0 + 8, 'no second grace');
  assert(st._Phase0Stage__ending_visible, 'the case is lost the second time');
  dev.save('grace_lost');

  // the flag survives a reload
  dev.py.forgetMemoryFiles(); ds.load_characters(); ds.load_character(ds.characters.find((x) => x.active) || ds.characters[0]);
  assert(ds.user_character_progress.case.grace_used && ds.user_character_progress.case.time_limit === limit0 + 8, 'flag and limit survive a reload');
  console.log('ok');
};
