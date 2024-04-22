import { PerspectiveCamera, Vector3 } from 'three'
export const camera = new PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.2, 2000000);
const cameraPos = new Vector3(30, 15, 30);
// cameraPos.multiplyScalar(15)
// camera.rotation.order = 'YXZ';
camera.position.copy(cameraPos)