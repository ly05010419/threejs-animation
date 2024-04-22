import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls';
import { getAnimations, animations } from './js/animations';
import './style.css'
import * as THREE from 'three'
import { AmbientLight } from 'three'
import { loadFbx, loadGltf, loadTexture } from '../src/ts/loaders'
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer'
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js";
import { Line2 } from "three/examples/jsm/lines/Line2.js";
import { WebGLRenderer } from 'three'
import { HandleAnimation } from '../src/ts/animation'
import { LineGeometry } from "three/examples/jsm/lines/LineGeometry.js";
import { PerspectiveCamera, Vector3, Vector2 } from 'three'

import TWEEN from '@tweenjs/tween.js'
import { Scene } from "three";
import _ from 'lodash'

const helperGroup = new THREE.Group(),
    cubeGroup = new THREE.Group(),
    playerGroup = new THREE.Group(),
    lineGroup = new THREE.Group(),
    group2D = new THREE.Group(),
    sphereGroup = new THREE.Group(),
    swordGroup = new THREE.Group(),
    houseGroup = new THREE.Group(),
    npcGroup = new THREE.Group(),
    enemyGroup = new THREE.Group(),
    otherModelGroup = new THREE.Group()

otherModelGroup.add(houseGroup)
otherModelGroup.add(npcGroup)
otherModelGroup.add(enemyGroup)
otherModelGroup.add(swordGroup);
let scene, camera, renderer, ambientLight, labelRenderer, player, npcAni, enemyAni, plane, maps, controls, trailPoints

let len = 20
const size = 1
const y = size / 2
let trailIndex: any[] = []
let startPoint = new THREE.Vector2()
let isCanRun = true
const w = window as any
const downMouse = new Vector2()
const enemyBox3 = new THREE.Box3()
// 是否携带武器 
let isWeapon = false
let WeaponPlayer: any = null
let playerIndex = new Vector2(gFI(3 / 4), gFI(3 / 4))
let playerPos = analysisVector(playerIndex.x, playerIndex.y)

let swordIndex = new Vector2(gFI(0.7), gFI(0.5))
let swordPos = analysisVector(swordIndex.x, swordIndex.y)

let npcIndex = new Vector2(gFI(0.2), gFI(0.3))
let npcPos = analysisVector(npcIndex.x, npcIndex.y)

let enemyIndex = new Vector2(gFI(0.1), gFI(0.9))
let enemyPos = analysisVector(enemyIndex.x, enemyIndex.y)

let houseIndex = new Vector2(gFI(0.2), gFI(0.2))
let housePos = analysisVector(houseIndex.x, houseIndex.y)
let housePosList = [
    housePos.clone().setY(housePos.clone().y - 1),
    housePos.clone().setY(housePos.clone().y + 1),
    housePos.clone().setX(housePos.clone().x - 1),
    housePos.clone().setX(housePos.clone().x + 1),
]
// getFloorInt
function gFI(bl: number) {
    return Math.floor(len * bl)
}

let enemyIsDie = false
let enemyCollision = false
let enemyBox3Helper: THREE.Box3Helper = new THREE.Box3Helper(enemyBox3, new THREE.Color('red'))
// 可通过 不可创建box的位置
const passIndex = [swordPos, playerPos]
// 不可通过
const unPassIndex = [...housePosList, npcPos, enemyPos]
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
    plane.name = 'floor'
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
            const indexV2 = analysisVector(i, j)
            const { x, y: vy } = indexV2
            const passFlag = passIndex.some((modelIndex: Vector2) => {
                return indexV2.equals(modelIndex)
            })
            const unPassFlag = unPassIndex.some((modelIndex: Vector2) => {
                return indexV2.equals(modelIndex)
            })
            console.log('unPassFlag', unPassFlag);


            if ((i % int === 0 && j % int === 0 && !passFlag) || unPassFlag) {
                if (!unPassFlag) {
                    const pos = new THREE.Vector3(x, y / 2, vy)
                    const cube2 = cube.clone()
                    cube2.position.copy(pos)
                    cubeGroup.add(cube2)
                }
                yArr.push(0)
            } else {
                flag++
                yArr.push(1)
            }
        }
        xArr.push(yArr)
    }
    maps = new w.Graph(xArr);

 
}
async function createObjects() {
    const sword: any = await loadFbx('./model/sword.fbx')
    const s = sword.children[0]
    const sScale = 0.001
    // 武器
    s.scale.set(sScale, sScale, sScale)
    s.material = new THREE.MeshLambertMaterial({ color: 0x292c33, side: THREE.DoubleSide });
    s.rotation.x = Math.PI
    s.position.set(swordPos.x, 0.8, swordPos.y)
    s.name = 'sword'
    swordGroup.add(s)

    // 房子
    const house: any = await loadFbx('./model/cartoon_house.fbx')
    const houseScale = 0.006
    house.scale.set(houseScale, houseScale, houseScale)
    house.rotation.y = Math.PI * 0.5
    // house.visible = false
    house.position.set(housePos.x, 0, housePos.y)
    houseGroup.add(house)
    // npc 农妇
    const npc: any = await loadFbx('./model/Npc.fbx')
    const p = new Vector3(npcPos.x, 0, npcPos.y)
    npc.position.copy(p)
    const npcScale = 0.007
    npc.scale.set(npcScale, npcScale, npcScale)
    npc.animations[0].name = 'Idle'
    npcGroup.add(npc)
    npc.children[0].name = 'npc'
    createNpcTask(p.setY(2))

    npcAni = new HandleAnimation(npc, npc.animations)
    npcAni.play('Idle')

    // 敌人
    const enemy: any = await loadFbx('./model/enemy.fbx')
    enemy.position.set(enemyPos.x, 0, enemyPos.y)
    const enemyScale = 0.007
    enemy.scale.set(enemyScale, enemyScale, enemyScale)
    enemy.animations[0].name = 'Idle'
    enemyGroup.add(enemy)
    enemy.children[0].name = 'enemy'
    enemyAni = new HandleAnimation(enemy, enemy.animations)
    // enemyBox3.expandByScalar(1)
    enemyBox3.expandByObject(enemyAni.model)
    enemyBox3.expandByScalar(1)
    enemyBox3Helper = new THREE.Box3Helper(enemyBox3, new THREE.Color('red'))
    enemyBox3Helper.name = 'enemyBox3'
    helperGroup.add(enemyBox3Helper)
    enemyAni.play('Idle')


    await getAnimations('./model/Run.fbx', 'Run')
    await getAnimations('./model/Weapon_Idle.fbx', 'Weapon_Idle')
    await getAnimations('./model/weaponOnce.fbx', 'weaponOnce')
}
async function createPlayer() {
    startPoint.copy(playerIndex)
    // 主角 不带武器
    const xbot: any = await loadFbx('./model/Idle.fbx')

    xbot.animations[0].name = 'Idle'
    // 主角  带武器
    WeaponPlayer = await loadFbx('./model/Weapon_Idle.fbx')
    WeaponPlayer.animations[0].name = 'Weapon_Idle'
    // 加载动作合集
    await createObjects()
    animations.push(...xbot.animations, ...WeaponPlayer.animations)
    // 注册主角
    player = new HandleAnimation(xbot, animations)
    player.model.scale.set(0.01, 0.01, 0.01)
    player.play(isWeapon ? 'Weapon_Idle' : 'Idle')
    player.once(['weaponOnce'])

    player.model.position.set(playerPos.x, 0, playerPos.y)
    // camera.lookAt(playerPos.x, 0, playerPos.y)
    playerGroup.add(player.model)
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
    scene.add(otherModelGroup);
    scene.add(sphereGroup);
    scene.add(cubeGroup);
    scene.add(lineGroup);
    scene.add(playerGroup);

    // 镜头
    camera = new PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.2, 2000000);
    //  camera = new THREE.OrthographicCamera( window.innerWidth / - 2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / - 2, 1, 1000 );
    const cameraPos = new Vector3(11, 8, 9.8);
    // const cameraPos = new Vector3(0, 8, 0);
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
    // helperGroup.add(axesHelper);


    controls = new OrbitControls(camera, renderer.domElement)
    console.log('controls', controls);
    controls.addEventListener('change', () => {
        console.log(camera.position)

    })


    ray()
    createFloor()
    createCube()

    createPlayer()

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

    if (player) {
        player.upDate()
        // 主角检测
        playerRay()
    }
    npcAni && npcAni.upDate()
    enemyAni && enemyAni.upDate()
    TWEEN && TWEEN.update();

}

const PlayerBox3 = new THREE.Box3()
const playerRay = () => {
    PlayerBox3.expandByObject(player.model)
    otherModelGroup.traverse((other: any) => {
        const box3 = new THREE.Box3()
        box3.expandByObject(other)
        const box3Flag = PlayerBox3.intersectsBox(box3)
        // 检测武器
        if (box3Flag && other.name === 'sword' && !isWeapon) {
            // 拾取武器
            player = new HandleAnimation(WeaponPlayer, animations)
            player.model.scale.set(0.01, 0.01, 0.01)
            player.once(['weaponOnce'])
            player.play('Run')
            playerGroup.remove(playerGroup.children[0])
            swordGroup.remove(swordGroup.children[0])
            playerGroup.add(player.model)
            cationAlert('拾取武器', new THREE.Vector3(swordPos.x, 0, swordPos.y))
            isWeapon = true
        }
        // console.log('other',other.name)
    })
    
    const box3Flag = PlayerBox3.intersectsBox(enemyBox3)
    if (box3Flag && isWeapon) {
        if (!enemyCollision) {
            console.log('碰撞怪物', enemyPos)
            enemyCollision = true
        }
    } else {
        enemyCollision = false
    }
}
function ray() {
    window.addEventListener("mousemove", (e) => {
        if (isCanRun) {
            getTrails(e)
        }
    });
    window.addEventListener("mousedown", (e) => {
        downMouse.x = (e.clientX / document.body.offsetWidth) * 2 - 1;
        downMouse.y = -(e.clientY / document.body.offsetHeight) * 2 + 1;
    });
    window.addEventListener("keydown", (e) => {
        if (e.code === 'Space' && isWeapon) {
            player.fadeToAction('weaponOnce')
            if (enemyCollision) {
                console.log('打击敌人');
                enemyGroup.remove(enemyGroup.children[0])
                enemyBox3Helper.parent?.remove(enemyBox3Helper)
                enemyIsDie = true
                const task = group2D.getObjectByName('task')
                console.log('task', task);

                task.element.innerText = '!'
                task && (task.visible = true)
            }
        }
    });
    window.addEventListener("mouseup", (event) => {
        const mouse = new Vector2()
        mouse.x = (event.clientX / document.body.offsetWidth) * 2 - 1;
        mouse.y = -(event.clientY / document.body.offsetHeight) * 2 + 1;
        const flag = mouse.equals(downMouse)

        if (isCanRun && flag) {
            const raylist = rayMesh(event, [plane, npcAni.model])
            if (raylist.length !== 0 && raylist[0].object.name === 'floor') {
                isCanRun = false
                run()
            } else if (raylist.length !== 0 && raylist[0].object.name === 'Peasant_girl') {
                // const 
                // 主角位置
                const s = startPoint.clone()
                const playerP = analysisVector(s.x, s.y)
                // npc位置 npcPos
                const npcP = npcPos.clone()
                // 距离过远
                console.log(npcP.sub(s), npcP.sub(s).length())
                if (Math.abs(npcP.length() - s.length()) > 22) {
                    isCanRun = false
                    run()
                    // cationAlert('距离过远', new Vector3(playerP.x, 0, playerP.y))
                } else {
                    talkNpc()
                }
            }
        }
    });
}
// 射线检测
function rayMesh(event, child: any[]) {
    let mouse = new THREE.Vector2(); //鼠标位置
    var raycaster = new THREE.Raycaster();
    mouse.x = (event.clientX / document.body.offsetWidth) * 2 - 1;
    mouse.y = -(event.clientY / document.body.offsetHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    return raycaster.intersectObjects(child);
}

// 引导线
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
// 与npc对话
const talkNpc = () => {
    const playerP = analysisVector(startPoint.x, startPoint.y)
    npcAni.model.lookAt(playerP.x, 0, playerP.y)
    player.model.lookAt(npcPos.x, 0, npcPos.y)
    console.log('与npc对话')
    if (isWeapon) {
        if (enemyIsDie) {
            console.log('任务完成')
            cationAlert('任务完成', new Vector3(npcPos.x, 0, npcPos.y))
        } else {
            console.log('村外小山岗，有危险，请前往')
            cationAlert('已经接取任务', new Vector3(npcPos.x, 0, npcPos.y))
        }
        // task
        const task = group2D.getObjectByName('task')
        task && (task.visible = false)

    } else {
        cationAlert('请先寻找武器', new Vector3(npcPos.x, 0, npcPos.y))
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

// 主角动画
let i = 1
async function run() {
    if (trailIndex.length === 0) {
        console.log('距离过近')
        isCanRun = true
        return
    }
    if (i === 1) {
        player.fadeToAction('Run')
    }
    if (i >= trailIndex.length) {
        player.fadeToAction('Idle')
        startPoint.copy(trailIndex[i - 1].vector2)
        i = 1
        isCanRun = true
        return
    }
    const start = trailIndex[i - 1]
    const end = trailIndex[i]

    const endVector = analysisVector(end.vector2.x, end.vector2.y)
    const lookAt = new THREE.Vector3(endVector.x, 0, endVector.y)
    new TWEEN.Tween(start.vector2)
        .to(end.vector2, end.time * 400)
        .start()
        .onUpdate((v: any) => {
            const { x, y } = analysisVector(v.x, v.y)
            player.model.lookAt(lookAt)
            player.model.position.set(x, 0, y)
            camera.lookAt(x, 0, y)

        })
        .onComplete(() => {
            i++
            run()
        })
}

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

// 获取随机数
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

const cationAlert = (message: string, pos: Vector3) => {
    var div = document.createElement("div");
    div.classList.add('alert')
    div.innerText = message
    console.log(pos)
    var alert = new CSS2DObject(div);
    alert.position.copy(pos);
    group2D.add(alert);

    new TWEEN.Tween(alert.position)
        .to(pos.clone().setY(2), 1000)
        .start()
        .onComplete(() => {
            group2D.remove(alert)
        })
}

const createNpcTask = (pos: Vector3) => {
    var div = document.createElement("div");
    div.classList.add('task')
    div.innerText = '?'
    var task = new CSS2DObject(div);
    task.position.copy(pos);
    task.name = 'task'

    group2D.add(task);
}