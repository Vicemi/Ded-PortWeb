// shared steps for the headless scenarios
export function toMenu(dev) { for (let i = 0; i < 7; i++) dev.key(dev.K.ESCAPE, 120); dev.go(300); }
export function newGame(dev, name = 'Ana') {
  toMenu(dev);
  dev.click(300, 330, 150);
  dev.type(name);
  dev.go(20);
  dev.click(340, 138, 40);
  dev.click(300, 139, 60);
  dev.click(248, 384, 150);
  dev.go(300);
}
/** from the case report to the phase 0 hub with the help closed */
export function toHub(dev) {
  newGame(dev);
  dev.click(300, 418, 200);
  dev.go(700);
  dev.click(300, 400, 100);   // close the help
  dev.go(200);
}
