
import { AmbientLight, DirectionalLight } from 'three'
const ambientLight = new AmbientLight(0x707070);

const light = new DirectionalLight(0xffffff, 4);
light.position.set(0,10,0);
light.castShadow = true;
const d = 140;
light.shadow.camera.left = - d;
light.shadow.camera.right = d;
light.shadow.camera.top = d;
light.shadow.camera.bottom = - d;

light.shadow.camera.near = 2;
light.shadow.camera.far = 10;

light.shadow.mapSize.x = 102;
light.shadow.mapSize.y = 102;
export { ambientLight, light }