// boot -> main menu -> new detective -> case report -> map
export default async (dev) => {
  for (let i = 0; i < 7; i++) dev.key(dev.K.ESCAPE, 120);
  dev.go(300);
  dev.save('n1_menu');
  dev.click(300, 330, 150);
  dev.type('Ana');
  dev.go(20);
  dev.click(340, 138, 40);
  dev.click(300, 139, 60);
  dev.click(248, 384, 150);
  dev.go(300);
  dev.save('n2_case');
  console.log('stage', dev.stage());
  dev.click(300, 418, 200);
  dev.go(300);
  dev.save('n3_after_case');
  console.log('stage', dev.stage());
  dev.go(400);
  dev.save('n4');
  console.log('stage', dev.stage());
};
