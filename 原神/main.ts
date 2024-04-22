import * as THREE from 'three'
import { loadGltf, loadObj } from '../src/ts/loaders'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
// 定义常量
var scene = new THREE.Scene()
scene.background = new THREE.Color('#dddddd');
const width = window.innerWidth;
const height = window.innerHeight;

const canvas = document.querySelector('#threeMain')


// 定义渲染场景必要元素
const camera = new THREE.PerspectiveCamera(60, width / height, 1, 2000);
camera.position.set(8, 6, 10)

// 灯光组
const lightGroup = new THREE.Group()

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
lightGroup.add(directionalLight);
/**
 * 环境光
 */
const AmbientLight = new THREE.AmbientLight(0xffffff, 1.5);
lightGroup.add(AmbientLight);

/**
 * 渲染器
 */
let renderer
if (canvas) {
    renderer = new THREE.WebGLRenderer({ // 渲染器
        antialias: true, //抗锯齿
        // alpha: true,
        canvas: canvas
    })
    renderer.setSize(width, height)
}

/**
 * 控制器
 */
let controls = new OrbitControls(camera, renderer.domElement);

let render = () => {
    /*
        * 更新
    */
    controls.update()
    camera.updateProjectionMatrix()
    renderer.render(scene, camera)
}


// 加载模型
const loadModel = async () => {
    const modelScene = await loadGltf('./model/scene.gltf');
    console.log('modelScene', modelScene);
    const model: THREE.Group = modelScene.scene.children[0];
    scene.add(lightGroup)
    scene.add(model)

    renderer.setAnimationLoop(render)
}
loadModel()