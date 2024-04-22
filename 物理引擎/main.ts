import { RepeatWrapping, AxesHelper, LoopOnce, Group, AnimationMixer, DirectionalLightHelper, SkeletonHelper, Box3, Matrix4, DoubleSide, PlaneGeometry, MeshBasicMaterial, Clock, TextureLoader, ColorRepresentation, Quaternion, Vector3, WebGLRenderer, Mesh, Material, BoxGeometry, Color, MeshPhongMaterial, Object3D, Euler, Vector4, Scene, Vector2 } from 'three'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { plane, sphere } from './js/createFloor'
let Ammo = (window as any).Ammo
import { dirLight, hemiLight } from './js/light'
import { renderer as rendererTS } from '../src/ts/renderer'
import { camera as cameraTS } from '../src/ts/camera'
import { scene as sceneTS } from '../src/ts/scene'
import { loadFbx, loadGltf } from '../src/ts/loaders';
import { HandleAnimation } from '../src/ts/animation'
import { createRigidBody } from '../src/ts/rigidBody'
import { initPhysics, updatePhysics, physicsWorld, dispatcher } from '../src/ts/physics'
import { HandlePointerLock } from '../src/ts/PointerLockControls';
const helperGroup = new Group()
const playerClock = new Clock();
let moveForward = false;
let camera = cameraTS, Player: any, controls: any, scene = sceneTS, renderer = rendererTS, Handles, handleControls

let PlayerParams = {
    gravity: 100, // 重力
    friction: 10, //摩擦力
    speed: 4
}

let jumpOnce = false, jumpTop = 0
let linearVelocity = new THREE.Vector2();

// 辅助线
const axesHelper = new AxesHelper(100);
helperGroup.add(axesHelper);
scene.add(helperGroup);

const rigidBodies: Object3D[] = [];

Ammo().then(function (AmmoLib: any) {
    Ammo = AmmoLib;
    (window as any).Ammo = Ammo
    init();
    animate();
});


const init = async () => {
    // 创建场景
    initGraphics();
    // 创建物理引擎
    initPhysics();
    // 创建物理物体
    createObjects();
    // 创建主角
    initPlayer()
}

function initGraphics() {
    scene.add(...[hemiLight, dirLight])

    document.body.appendChild(renderer.domElement);

    window.addEventListener('resize', onWindowResize);

}


// 创建所有需要的元素
async function createObjects() {
    // 引用地板并加入物理世界
    const { object, body } = createRigidBody(plane, true, false, null, null)
    object.name = 'floor'
    physicsWorld.addRigidBody(body);
    setPointerBttVec(object, body)
    rigidBodies.push(object)
    body.setRollingFriction(10)

    for (let i = 0; i < 10; i++) {
        const { object: object1, body: body1 } = createRigidBody(sphere.clone(), true, true, new Vector3(0, 1, 0), null, new Vector3(0, 13, 0))
        object1.name = 'sphere'
        object1.userData.PhysUpdate = true
        setPointerBttVec(object1, body1)
        physicsWorld.addRigidBody(body1);
        rigidBodies.push(object1)
        scene.add(object1)
    }

    scene.add(object)
}
const initPlayer = async () => {
    // 创建主角并加入物理世界
    Player = await loadGltf('../src/assets/models/Xbot.glb')
    console.log('object',Player.scene);
    // Player.scene.scale.set(0.5,0.5,0.5)
    // Player.scene.matrix.decompose(new Vector3(0.5,0.5,0.5),new THREE.Quaternion(),new Vector3(0.5,0.5,0.5))
    // Player.scene.updateWorldMatrix(true,true)
    console.log('Player.scene.children[1]',Player.scene)
    Player.scene.scale.applyMatrix4(new Matrix4().makeScale(0.4, 0.4, 0.4))
    // Player.scene.children[0].children[1].geometry.applyMatrix4(new Matrix4().makeScale(0.4, 0.4, 0.4))
    // Player.scene.children[0].children[2].geometry.applyMatrix4(new Matrix4().makeScale(0.4, 0.4, 0.4))
    const { object, body } = createRigidBody(Player.scene, true, true, new Vector3(0, 1, 0), null, undefined, undefined)
    object.name = 'Player'
    object.userData.PhysUpdate = true
    object.userData.rotateLock = true
    object.userData.positionLock = ['', '', '']
    object.userData.handlePlayer = handlePlayer

    // 设置摩擦力
    body.setRollingFriction(PlayerParams.friction)
    // 设置重力
    body.setGravity(PlayerParams.gravity)

    // 将主角添加至物理世界
    physicsWorld.addRigidBody(body);

    setPointerBttVec(object, body)
    // 绑定主角动画
    Handles = new HandleAnimation(object, Player.animations)
    console.log('主角动画列表', Handles.animateNameList);
    // Handles.once(['jump'])
    // 设置主角初始化动作
    Handles.play('idle')
    // 渲染主角骨骼
    helperGroup.add(Handles.createSkeleton());
    // 添加主角至刚体系统
    rigidBodies.push(object)
    scene.add(object)

    handleControls = new HandlePointerLock(object, document.body)
    controls = handleControls.controls

    renderer.domElement.addEventListener('click', function () {
        controls.lock();
    });


    controls.addEventListener('change', function () {

    });
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);

}
const handlePlayer = (pos: Vector3, dir: Vector3) => {
    Player.scene.position.setY(pos.y)
}

// 设置物体指针
const setPointerBttVec = (object, body) => {
    const btVecUserData = new Ammo.btVector3(0, 0, 0);
    btVecUserData.threeObject = object;
    body.setUserPointer(btVecUserData);
}
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}



// 循环渲染
function animate() {
    requestAnimationFrame(animate);
    render();
}


const onKeyUp = function (event) {

    switch (event.code) {

        case 'ArrowUp':
        case 'KeyW':
            if (moveForward && controls.isLocked) {
                linearVelocity.set(0, 0)
                Handles.fadeToAction('idle')
            }
            moveForward = false;
            break;
        case 'ShiftLeft':
            if (moveForward && controls.isLocked) Handles.fadeToAction('walk')
            PlayerParams.speed = 4
            break;
    }
};

const onKeyDown = function (event) {
    switch (event.code) {
        case 'ArrowUp':
        case 'KeyW':
            if (!moveForward && controls.isLocked) {
                Handles.fadeToAction('walk')
            }
            moveForward = true;
            break;
        case 'ShiftLeft':
            if (moveForward && controls.isLocked) Handles.fadeToAction('run')
            PlayerParams.speed = 8
            break;
    }
}

// 渲染函数
function render() {
    const dt = playerClock.getDelta();
    // 更新物理世界
    // PhysUpdate
    updatePhysics(dt, rigidBodies, (pos: Vector3, dir: Vector3, objectThree: Object3D) => { })

    // 更新动画
    Handles && Handles.upDate(camera, 8, 2.5)
    // 更新控制器
    handleControls && handleControls.updateControls(moveForward, false)
    // 指针锁定后的操作
    if (controls?.isLocked) {
        if (moveForward) {
            const dir = new Vector3()
            // 获取控制器方向参数
            controls.getDirection(dir)
            const v3 = dir.clone().negate().multiplyScalar(PlayerParams.speed)
            // 修改运动参数
            linearVelocity.set(v3.x, v3.z)
        }
        Player.scene.userData.physicsBody.setLinearVelocity(new Ammo.btVector3(linearVelocity.x, jumpTop, linearVelocity.y))

        rayRigidBodyCheck()
    }

    renderer.render(scene, camera);
}

// 碰撞检测
const rayRigidBodyCheck = () => {
    // 物理世界的物体数量,在initPhysics初始化物理引擎注册的
    for (let i = 0, il = dispatcher.getNumManifolds(); i < il; i++) {

        const contactManifold = dispatcher.getManifoldByIndexInternal(i);

        const rb0 = Ammo.castObject(contactManifold.getBody0(), Ammo.btRigidBody);
        const rb1 = Ammo.castObject(contactManifold.getBody1(), Ammo.btRigidBody);

        const threeObject0 = Ammo.castObject(rb0.getUserPointer(), Ammo.btVector3).threeObject;
        const threeObject1 = Ammo.castObject(rb1.getUserPointer(), Ammo.btVector3).threeObject;

        const n = threeObject0?.name
        const n1 = threeObject1?.name

        if (n1 === 'Player' && n === 'sphere') {
            console.log('踢球');
            
        }

    }
}