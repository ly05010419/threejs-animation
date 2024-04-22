import * as THREE from 'three'
import { loadObj } from '../src/ts/loaders'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
// 定义常量
var scene_1 = new THREE.Scene()
var scene_2 = new THREE.Scene()

const width = window.innerWidth;
const height = window.innerHeight;

const scene_2_dom = document.querySelector('#scene_2');
window.addEventListener('scroll', () => {
    if (scene_2_dom) {
        render()
    }
})
const canvas = document.querySelector('#threeMain')
let mat = new THREE.MeshPhongMaterial({
    color: '#6e747d',
    specular: 0xd0cbc7,
    shininess: 5,
    flatShading: true
});

// 定义渲染场景必要元素
const camera = new THREE.PerspectiveCamera(60, width / height, 1, 2000);
camera.position.set(-80, 0, 180)
camera.lookAt(new THREE.Vector3(0, 5, 0));

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
        alpha: true,
        canvas: canvas
    })
    renderer.setSize(width, height)
    renderer.setScissorTest(true);
}

let pathData = []

/**
 * 控制器
 */
let controls = new OrbitControls(camera, renderer.domElement);
controls.enabled = false


let render = () => {
    /*
        * 更新
    */
    controls.update()
    camera.updateProjectionMatrix()
    if (scene_2_dom) {
        // 获取#scene_2距离屏幕的高度
        let topStr = scene_2_dom.getBoundingClientRect().top
        const top = Number(topStr) || 0;

        const h = height

        // 获取飞机所在位置的索引
        const index = Math.floor(Math.floor((1 - top / h) * 100) / 100 * pathData.length);
        // 取到飞机的位置信息
        const item = pathData[index]
        if (item) {
            const { position, rotation, } = item
            const line = scene_1.getObjectByName("line")
            // 同时变化model和line的位置和旋转角度
            if (line && position && rotation) {
                line.position.copy(new THREE.Vector3(position.x, position.y, position.z))
                line.rotation.copy(new THREE.Euler(rotation._x, rotation.y, rotation.z, rotation._order))
            }
            const model = scene_2.getObjectByName("model")
            if (model && position && rotation) {
                model.position.copy(new THREE.Vector3(position.x, position.y, position.z))
                model.rotation.copy(new THREE.Euler(rotation._x, rotation.y, rotation.z, rotation._order))
            }
        }


        // 计算场景切割的交叉点
        renderer.setScissor(0, 0, width, h - top);
        renderer.render(scene_1, camera);

        renderer.setScissor(0, h - top, width, h);
        renderer.render(scene_2, camera);
      
    }
}


const createLine = (model) => {
    const edges = new THREE.EdgesGeometry(model.children[0].geometry, 20);
    let line = new THREE.LineSegments(edges);
    return line
}

// 加载模型
const loadModel = async () => {
    const model = await loadObj('./model/1405+Plane_1.obj');
    model.position.set(80, -32, -60)
    model.rotation.set(0, -1.5708, 0)
    model.name = 'model'
    const line = createLine(model)
    line.name = 'line'
    model.traverse((child) => {
        if (child.isMesh) {
            child.material = mat.clone();
        }
    })

    /*
        * 模型加载出来以后再渲染场景 
     */
    // renderer && renderer.setAnimationLoop(render);

    // 修改分场景的背景色 方便区分
    // scene_1.background = new THREE.Color("#ff99cc")
    // scene_2.background = new THREE.Color("#ccccff")

    // modelGroup.add(line)
    // modelGroup.add(model)

    scene_1.add(line)
    scene_1.add(lightGroup)
    scene_2.add(model)
    scene_2.add(lightGroup)

    render()
}
fetch('./path.json').then((res) => res.json()).then((data) => {
    pathData = data
    console.log(data);

    loadModel()
})
