import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls';
import { scene } from '../src/ts/scene'
import { renderer } from '../src/ts/renderer'
import { camera } from '../src/ts/camera'
import { hemiLight, dirLight } from './light'
import { loadGltf } from '../src/ts/loaders'
import * as THREE from 'three'
let controls, helperGroup = new THREE.Group(), PlaneSize = 1000, textureLoader = new THREE.TextureLoader();

scene.add(...[hemiLight])

scene.add(helperGroup)

// camera.position.set(4, 2, 1)
// camera.lookAt(0, 0, 0)

// 更新主角时钟
const playerClock = new THREE.Clock();

let XBot: any

const XBotSize = new THREE.Vector3();
const box = new THREE.Box3()

// 控制器位置
const velocity = new THREE.Vector3();
// 控制器角度
const direction = new THREE.Vector3();
// 初始时间
let prevTime = performance.now();
// 方向
let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;


const init = async () => {
    document.body.appendChild(renderer.domElement);

    const axesHelper = new THREE.AxesHelper(10);
    helperGroup.add(axesHelper)

    window.addEventListener('resize', onWindowResize);

    createObjects()
    
    loadPlayer()

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);

}



const loadPlayer = async () => {
    const xbot: any = await loadGltf('../src/assets/models/Xbot.glb')
    
    XBot = xbot.scene

    box.expandByObject(XBot)
    box.getSize(XBotSize)

    XBot.position.set(0, 0, 0)
    
    // XBot.add(camera)

    controls = new PointerLockControls(XBot, document.body);
    controls.maxPolarAngle = Math.PI * 0.5
    controls.minPolarAngle = Math.PI * 0.5
    document.body.addEventListener('click', function () {
        controls.lock();
    });

    scene.add(XBot)

}

// 创建所有需要的元素
async function createObjects() {
    // 创建底板
    const geometry = new THREE.PlaneGeometry(PlaneSize, PlaneSize);
    const material = new THREE.MeshLambertMaterial({ color: 0xffffff, side: THREE.DoubleSide });
    const plane = new THREE.Mesh(geometry, material);
    plane.receiveShadow = true;
    textureLoader.load('../src/assets/textures/grid.png', function (texture) {
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(1000, 1000);
        plane.material.map = texture;
        plane.material.needsUpdate = true;
    });
    plane.rotation.set(-0.5 * Math.PI, 0, 0);
    scene.add(plane)
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function render() {
    
    if (XBot) {
        let xbotV3 = new THREE.Vector3();

        XBot.getWorldPosition(xbotV3);

        const playerDirection = new THREE.Vector3()
        XBot.getWorldDirection(playerDirection);
        playerDirection.normalize();
        playerDirection.multiplyScalar(5)
        updateControls()
        camera.position.copy(playerDirection.negate().setY(XBotSize.y + 2).add(xbotV3));
        camera.lookAt(xbotV3.clone().setY(XBotSize.y))
        camera.updateProjectionMatrix()

    }
    // 更新控制器
    renderer.render(scene, camera);
}

const onKeyUp = function (event) {

    switch (event.code) {

        case 'KeyA':
            if (moveLeft&&controls.isLocked) {
                // fadeToAction('idle')
             }
             moveLeft = false;
             break;
        case 'KeyD':
            if (moveRight&&controls.isLocked) {
               // fadeToAction('idle')
            }
            moveRight = false;
            break;
        case 'KeyW':
            if (moveForward&&controls.isLocked) {
               // fadeToAction('idle')
            }
            moveForward = false;
            break;
         case 'KeyS':
             if (moveBackward&&controls.isLocked) {
               // fadeToAction('idle')
            }
            moveBackward = false;
               break;
    }


};

const onKeyDown = function (event) {
    switch (event.code) {

        case 'KeyA':
            if (moveLeft&&controls.isLocked) {
                // fadeToAction('idle')
             }
             moveLeft = true;
             break;
        case 'KeyW':
            if (!moveForward&&controls.isLocked) {
               // fadeToAction('run')
            }
            moveForward = true;
            break;
        case 'KeyS':
            if (moveBackward&&controls.isLocked) {
               // fadeToAction('idle')
            }
            moveBackward = true;
            break;
        case 'KeyD':
            if (moveRight&&controls.isLocked) {
               // fadeToAction('idle')
            }
            moveRight = true;
            break;

    }
}


function updateControls() {
    const time = performance.now();
    if (controls.isLocked === true) {

        const delta = (time - prevTime) / 1000;

        velocity.x -= velocity.x * 10.0 * delta;
        velocity.z -= velocity.z * 10.0 * delta;

        direction.z = Number(moveForward) - Number(moveBackward);
        direction.x = Number(moveRight) - Number(moveLeft);
        direction.normalize(); // this ensures consistent movements in all directions

        if (moveForward || moveBackward) velocity.z -= direction.z * 40.0 * delta;
        if (moveLeft || moveRight) velocity.x -= direction.x * 40.0 * delta;

        controls.moveRight(velocity.x * delta);
        controls.moveForward(velocity.z * delta);

    }

    prevTime = time;
}

// 循环渲染
function animate() {
    requestAnimationFrame(animate);
    render();
}



init();
animate();