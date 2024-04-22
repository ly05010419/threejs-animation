import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import * as THREE from 'three'
import { AmbientLight } from 'three'
import { loadGltf, loadTexture } from '../src/ts/loaders'
import { CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer'
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js";
import { Line2 } from "three/examples/jsm/lines/Line2.js";
import { WebGLRenderer } from 'three'
import { HandleAnimation } from '../src/ts/animation'
import { LineGeometry } from "three/examples/jsm/lines/LineGeometry.js";
import { PerspectiveCamera, Vector3, Vector2 } from 'three'

import TWEEN from '@tweenjs/tween.js'
import { Scene } from "three";
import _ from 'lodash'

const helperGroup = new THREE.Group(), cubeGroup = new THREE.Group(), lineGroup = new THREE.Group(), group2D = new THREE.Group(), sphereGroup = new THREE.Group()
let scene, camera, renderer, ambientLight, labelRenderer, player, plane, maps, controls, trailPoints

let len = 10
const size = 1
const y = size / 2
let trailIndex: any[] = []
let startPoint = new THREE.Vector2()
let isCanRun = true
const w = window as any
init()

// 渲染一个底板
function createFloor() {
    const textureLoader = new THREE.TextureLoader();
    const PlaneSize = len

    const geometry = new THREE.PlaneGeometry(PlaneSize, PlaneSize);
    const material = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
    plane = new THREE.Mesh(geometry, material);
    plane.rotation.x = Math.PI * 0.5

    textureLoader.load('../src/assets/textures/grid.png', function (texture) {
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(len, len);
        plane.material.map = texture;
        plane.material.needsUpdate = true;
    });
    scene.add(plane)
}

function createCube() {

    const geometry = new THREE.BoxGeometry(size, y, size);
    const material = new THREE.MeshLambertMaterial({ color: 0x9dd3ce });
    const cube = new THREE.Mesh(geometry, material);

    let flag = 0
    let xArr: number[][] = []
    for (let i = 0; i < len; i++) {
        let yArr: number[] = []
        for (let j = 0; j < len; j++) {
            const int = getRandomInt(0, len)
            const { x, y: vy } = analysisVector(i, j)

            if (i % int === 0 && j % int === 0) {
                const pos = new THREE.Vector3(x, y / 2, vy)
                const cube2 = cube.clone()
                cube2.position.copy(pos)
                cubeGroup.add(cube2)
                yArr.push(0)
            } else {
                if (flag === 40) {
                    createPlayer(x, vy)
                    startPoint.set(i, j)
                }
                flag++
                yArr.push(1)
            }
        }
        xArr.push(yArr)
    }
    console.log('xArr',xArr);
    
    maps = new w.Graph(xArr);


}
async function createPlayer(x: number, y: number) {
    const xbot: any = await loadGltf('../src/assets/models/Xbot.glb')
    player = new HandleAnimation(xbot.scene, xbot.animations)
    player.play('idle')
    player.model.position.set(x, 0, y)
    scene.add(player.model)
}
async function init() {
    // 场景
    scene = new Scene();
    const sceneTexture = await loadTexture('../src/assets/textures/bg.jpeg')
    sceneTexture.wrapS = THREE.RepeatWrapping;
    sceneTexture.wrapT = THREE.RepeatWrapping;
    sceneTexture.repeat.set(1, 1);
    scene.background = sceneTexture

    scene.add(helperGroup);
    scene.add(group2D);
    scene.add(cubeGroup);
    scene.add(lineGroup);
    // scene.add(sphereGroup);

    // 镜头
    camera = new PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.2, 2000000);
    //  camera = new THREE.OrthographicCamera( window.innerWidth / - 2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / - 2, 1, 1000 );
    const cameraPos = new Vector3(len / 2 + 1, len / 2, len / 2 + 1);
    camera.position.copy(cameraPos)

    // 渲染器
    renderer = new WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.needsUpdate = true
    document.body.appendChild(renderer.domElement);

    labelRenderer = new CSS2DRenderer();
    labelRenderer.setSize(window.innerWidth, window.innerHeight);
    labelRenderer.domElement.style.position = "absolute";
    labelRenderer.domElement.style.top = "0";
    labelRenderer.domElement.style.pointerEvents = "none";
    document.body.appendChild(labelRenderer.domElement);

    // 灯光
    ambientLight = new AmbientLight(0xffffff, 1);
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.2);
    directionalLight.position.x = 50
    directionalLight.position.y = 50
    directionalLight.position.z = 20
    scene.add(directionalLight);

    // 辅助线
    const axesHelper = new THREE.AxesHelper(100);
    helperGroup.add(axesHelper);


    controls = new OrbitControls(camera, renderer.domElement)

    ray()
    createFloor()
    createCube()
    animate();


}

// 循环渲染
function animate() {
    requestAnimationFrame(animate);
    render();
}

// 渲染函数
function render() {
    renderer.render(scene, camera);
    labelRenderer.render(scene, camera);
    player && player.upDate()
    TWEEN && TWEEN.update();
}

function ray() {

    window.addEventListener("mousemove", (e) => {
        if (isCanRun) {
            getTrails(e)
        }
    });
    window.addEventListener("click", (event) => {
        if (isCanRun) {
            const raylist = rayMesh(event, [plane])
            if (raylist.length !== 0) {
                isCanRun = false
                
                run()
            }
        }
    });
}
function rayMesh(event, child: any[]) {

    let mouse = new THREE.Vector2(); //鼠标位置
    var raycaster = new THREE.Raycaster();
    mouse.x = (event.clientX / document.body.offsetWidth) * 2 - 1;
    mouse.y = -(event.clientY / document.body.offsetHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    return raycaster.intersectObjects(child);
}

const getTrails = (event: any) => {
    const raylist = rayMesh(event, [plane])
    if (raylist.length !== 0) {
        const { x, z } = raylist[0].point
        const { x: ex, y: ey } = reverseAnalysisVector(new Vector2(x, z))
        var starPosition = maps.grid[startPoint.x][startPoint.y];
        var endPosition = maps.grid[ex][ey];
        trailPoints = w.astar.search(maps, starPosition, endPosition, {
            closest: true
        });

        const { x: px, y: py } = reverseAnalysisVector(new Vector2(player.model.position.x, player.model.position.z))

        if (trailPoints.length === 0) {
            console.log('不可到达')
            return
        } else {
            trailPoints.unshift(new Vector2(px, py))
            trailIndex = turnPoint(trailPoints)

            drawTrail(trailIndex)
            // player.fadeToAction('walk')
            // run(trailIndex)
        }
    }
}

// 绘制轨迹
function drawTrail(indexList: any) {
    lineGroup.remove(lineGroup.children[0])
    const linePoints: number[] = []
    for (let i = 0; i < indexList.length; i++) {
        const point = indexList[i].vector2
        const vector: Vector2 = analysisVector(point.x, point.y)
        const v3 = new THREE.Vector3(vector.x, 0, vector.y)
        linePoints.push(...v3.toArray())
    }
    const geometry = new LineGeometry();
    if (!linePoints.length) {
        console.log('距离过近')
        return
    }

    geometry.setPositions(linePoints);

    //类型数组创建顶点颜色color数据
    // 设置几何体attributes属性的颜色color属性
    const matLine = new LineMaterial({
        linewidth: 0.01, // 可以调整线宽
        dashed: true,
        opacity: 0.5,
        dashScale: 0.01,
        vertexColors: true, // 是否使用顶点颜色
    });

    let line = new Line2(geometry, matLine);
    lineGroup.add(line);
}
// 根据两点之间的距离计算出所需时间
function getRunTime(v: Vector2, v1: Vector2): number {
    let time = 0
    if (v.x === v1.x) {
        time = v.y - v1.y
    } else if (v.y === v1.y) {
        time = v.x - v1.x
    }
    return Math.abs(time || 1)
}
// 获取拐点，去掉中间直线部分
function turnPoint(result): any[] {
    let arr: any[] = []
    for (let i = 0, j = 1, l = 2; i < result.length - 2; i++, j++, l++) {
        const that = new THREE.Vector2(result[i].x, result[i].y)
        const next = new THREE.Vector2(result[j].x, result[j].y)
        const last = new THREE.Vector2(result[l].x, result[l].y)
        // console.log(a, b)
        if (i === 0) {
            arr.push({
                time: 1,
                vector2: that
            })
        }
        if (that.x !== last.x && that.y !== last.y) {
            const vector2 = next
            const time = getRunTime(arr[arr.length - 1].vector2, vector2)
            arr.push({
                time, vector2
            })
        }
        if (l === result.length - 1) {
            const vector2 = last
            const time = getRunTime(arr[arr.length - 1].vector2, vector2)
            arr.push({
                time, vector2
            })

        }
    }

    return arr

}

// 目标移动
let i = 1
async function run() {
    if(trailIndex.length===0) {
        console.log('距离过近')
        isCanRun = true
        return
    }
    if(i===1) {
        player.fadeToAction('run')
    }
    if (i >= trailIndex.length) {
        player.fadeToAction('idle')
        startPoint.copy(trailIndex[i - 1].vector2)
        i = 1
        isCanRun = true
        return
    }
    const start = trailIndex[i - 1]
    const end = trailIndex[i]

    const endVector = analysisVector(end.vector2.x, end.vector2.y)
    const lookAt = new THREE.Vector3(endVector.x, 0, endVector.y)

    player.model.lookAt(lookAt)

    new TWEEN.Tween(start.vector2)
        .to(end.vector2, end.time * 400)
        .start()
        .onUpdate((v: any) => {
            const { x, y } = analysisVector(v.x, v.y)
            player.model.position.set(x, 0, y)
        })
        .onComplete(() => {
            i++
            run()
        })
}
// 物体之间的射线
// function rayMesh() {
//     group2D.traverse((text: any) => {
//         if (!text.isGroup) {
//             const opt = pointRay(camera.position, text.position, sphereGroup);
//             text.element.style.opacity = Number(!opt).toString();
//         }
//     });
// }

// 索引解析 索引转向量
function analysisVector(i: number, j: number): THREE.Vector2 {
    return new THREE.Vector2(-len / 2 + i + (size / 2), -len / 2 + j + (size / 2))
}
// 逆向解析 向量转数组索引
function reverseAnalysisVector(v2: Vector2): Vector2 {
    return v2.floor().addScalar(len / 2)

}
function pointRay(star, end, children) {
    let nstar = star.clone(); // 克隆一个新的位置信息，这样不会影响传入的三维向量的值
    let nend = end.clone().sub(nstar).normalize(); // 克隆一个新的位置信息，这样不会影响传入的三维向量的值

    const raycaster = new THREE.Raycaster(nstar, nend); // 创建一个正向射线
    const intersects = raycaster.intersectObjects(
        children.children,
        true
    );
    let jclang = 0
    let textlang = 0
    if (intersects.length != 0) {
        jclang = star.distanceTo(intersects[0].point)
        textlang = star.distanceTo(end)
    }
    return jclang < textlang;
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}