import * as THREE from 'three'
import { T as TS } from './createScene/index'
import { loadGltf, loadTexture } from '../src/ts/loaders'
const threeCanvas = document.querySelector('#threeCanvas')
const T = new TS(threeCanvas)

const group = new THREE.Group();

// 球体
const sphereGeometry = new THREE.SphereGeometry(40, 32, 16);
const sphereMaterial = new THREE.MeshLambertMaterial({ color: 0x0000ff });
const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
sphere.position.x = -100
group.add(sphere);


// 圆柱体
const cylinderGeometry = new THREE.CylinderGeometry(20, 20, 50, 32);
const cylinderMaterial = new THREE.MeshLambertMaterial({ color: 0xff0000 });
const cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);

group.add(cylinder);
// 立方体
const cubeGeometry = new THREE.BoxGeometry(10, 10, 10);
const cubeMaterial = new THREE.MeshLambertMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
cube.position.x = 100

group.add(cube);

T.scene.add(group)

let box3 = new THREE.Box3()
const rayCallback = (mesh: THREE.Intersection<THREE.Object3D<THREE.Event>>[]) => {
    if (mesh.length !== 0) {
        box3.expandByObject(mesh[0].object)
        const size = new THREE.Vector3()
        const center = new THREE.Vector3()
        box3.getCenter(center)
        box3.getSize(size)
        console.log(JSON.stringify({
            size, center, min:box3.min, max:box3.max
        }))
        console.log(T.camera.fov)
    }
}
T.ray(group.children, rayCallback)

