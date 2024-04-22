import * as THREE from 'three'

const textureLoader = new THREE.TextureLoader();
const PlaneSize = 1000
const material = new THREE.MeshPhongMaterial({ color: 0xffffff })
const plane = new THREE.Mesh(new THREE.BoxGeometry(PlaneSize, 1, PlaneSize, 1, 1, 1), material);

textureLoader.load('../src/assets/textures/grid.png', function (texture) {
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1000, 1000);
    plane.material.map = texture;
    plane.material.needsUpdate = true;
});

const geometry = new THREE.SphereGeometry(0.2, 32, 16);
const sphere = new THREE.Mesh(geometry, material.clone());
textureLoader.load('../src/assets/textures/hardwood2_diffuse.jpg', function (texture) {
    // texture.wrapS = THREE.RepeatWrapping;
    // texture.wrapT = THREE.RepeatWrapping;
    // texture.repeat.set(1000, 1000);
    sphere.material.map = texture;
    sphere.material.needsUpdate = true;
});

// 没有厚度的不可以作为物理物体 例如精灵图和下面这个平面缓冲几何体
// // 创建底板
// const geometry = new THREE.PlaneGeometry(PlaneSize, PlaneSize);
// const material = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
// const plane = new THREE.Mesh(geometry, material);
// textureLoader.load('../src/assets/textures/grid.png', function (texture) {
//     texture.wrapS = THREE.RepeatWrapping;
//     texture.wrapT = THREE.RepeatWrapping;
//     texture.repeat.set(100, 100);
//     plane.material.map = texture;
//     plane.material.needsUpdate = true;
// });
// plane.rotation.set(0.5 * Math.PI, 0, 0);


export { plane, sphere }