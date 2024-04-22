import * as THREE from 'three'
import { T as TS } from './createScene/index'
import { loadGltf, loadTexture } from '../src/ts/loaders'
const Dom2D = document.querySelector('.dom-2d')
const Dom3D = document.querySelector('.dom-3d')
const T = new TS(Dom3D, Dom2D)


loadGltf('./earth/scene.gltf').then((res) => {
    console.log(res.scene);
    (res.scene as THREE.Scene).traverse((mesh) => {
        if (mesh.isMesh) {
            console.log(mesh.parent.children);

            // console.log(mesh);
            // const keys = Object.keys(mesh.material)
            // for(let i=0;i<keys.length;i++) {
            //     const key = keys[i]
            //     if(key.indexOf('map')!==-1) {
            //         if(mesh.material[key]) {
            //             console.log(key,mesh.material);

            //         }
            //     }
            // }

        }
    })

})

const baseColor = await loadTexture('./earth/textures/phong1_baseColor.jpeg')
const cloud = await loadTexture('./earth/textures/lambert6_baseColor.png')
const light = await loadTexture('./earth/textures/phong1_emissive.jpeg')
const geometry = new THREE.SphereGeometry(15, 32, 16);
const material = new THREE.MeshStandardMaterial({
    map: baseColor,
    emissiveMap: cloud,
    emissive: new THREE.Color(0xffffff),
    emissiveIntensity: 0.4
});

const sphere = new THREE.Mesh(geometry, material);
T.scene.add(sphere);
sphere.position.x = -32

const material1 = new THREE.MeshStandardMaterial({
    map: light,
});

const newSphere = new THREE.Mesh(geometry, material1);
sphere.position.x = 32

T.scene.add(newSphere);
