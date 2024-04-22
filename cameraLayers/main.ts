import * as THREE from 'three'
import { T as TS } from './createScene/index'


const Dom2D = document.querySelector('.dom-2d')
const Dom3D = document.querySelector('.dom-3d')

const T = new TS(Dom3D, Dom2D)

let group1 = new THREE.Group()
let group2 = new THREE.Group()
let group3 = new THREE.Group()
T.scene.add(group1)
T.scene.add(group2)
T.scene.add(group3)

// 立方体 THREE.Layers.set(1)
const geometry1 = new THREE.BoxGeometry(1, 1, 1);
const material1 = new THREE.MeshLambertMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry1, material1);
cube.layers.set(1)
group1.add(cube);

// 胶囊 THREE.Layers.set(2)
const geometry2 = new THREE.CapsuleGeometry(1, 1, 4, 8);
const material2 = new THREE.MeshLambertMaterial({ color: 0xffff00 });
const capsule = new THREE.Mesh(geometry2, material2);
capsule.layers.set(2)
group2.add(capsule);

// 圆锥  THREE.Layers.set(3)
const geometry3 = new THREE.ConeGeometry(5, 20, 32);
const material3 = new THREE.MeshLambertMaterial({ color: 0xff00ff });
const cone = new THREE.Mesh(geometry3, material3);
cone.layers.set(3)
group3.add(cone);

// 默认相机layers为1
T.camera.layers.set(1)
// 用的是Lambert网格材质所以需要灯光的加持，light同时也要修改
T.light.layers.set(1)

const btns = document.querySelectorAll('.btns button')
if (btns) {
	for (let i = 0; i < btns.length; i++) {
		const btn = btns[i]
		btn.onclick = () => {
			// 点击按钮修改相机的layers
			console.log(i + 1);

			T.camera.layers.set(i + 1)
			T.light.layers.set(i + 1)

		}
	}
}