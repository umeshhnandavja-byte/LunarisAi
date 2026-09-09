const fs = require('fs');
let obj = '# Crater Terrain OBJ\n';
const size = 30;
const res = 30;
const vertices = [];
for (let y = 0; y <= res; y++) {
  for (let x = 0; x <= res; x++) {
    const px = (x / res - 0.5) * size;
    const py = (y / res - 0.5) * size;
    const dist = Math.sqrt(px*px + py*py);
    let pz = 0;
    if (dist < 4) pz = (dist * dist * 0.2) - 3.2;
    else if (dist < 6) pz = Math.sin((dist - 4) * Math.PI / 2) * 2 - 0.5;
    else pz = Math.max(0, 1.5 - (dist - 6) * 0.2) + (Math.random()-0.5)*0.2;
    vertices.push(`v ${px.toFixed(3)} ${pz.toFixed(3)} ${py.toFixed(3)}`);
  }
}
obj += vertices.join('\n') + '\n';
for (let y = 0; y < res; y++) {
  for (let x = 0; x < res; x++) {
    const i0 = y * (res + 1) + x + 1;
    const i1 = i0 + 1;
    const i2 = (y + 1) * (res + 1) + x + 1;
    const i3 = i2 + 1;
    obj += `f ${i0} ${i2} ${i1}\n`;
    obj += `f ${i1} ${i2} ${i3}\n`;
  }
}
fs.writeFileSync('public/crater.obj', obj);
console.log('Created public/crater.obj');
