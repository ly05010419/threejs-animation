import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls';
import { scene } from '../src/ts/scene'
import { renderer } from '../src/ts/renderer'
import { camera } from '../src/ts/camera'
import { hemiLight, dirLight } from './light'
import { loadGltf } from '../src/ts/loaders'
import * as THREE from 'three'
let controls, helperGroup = new THREE.Group(), PlaneSize = 1000, textureLoader = new THREE.TextureLoader();

scene.add(...[hemiLight, dirLight])
const helper = new THREE.DirectionalLightHelper(dirLight, 50);
helperGroup.add(helper);

scene.add(helperGroup)

// camera.position.set(4, 2, 1)
// camera.lookAt(0, 0, 0)

// 主角当前动画 
let playerActiveAction: any = null
// 主角上一次动画
let previousAction: any = null
// 主角所有的动画
let actions: any = []
// 主角的动画器
let playerMixer: THREE.AnimationMixer
// 更新主角时钟
const playerClock = new THREE.Clock();

let XBot: any

let cone: THREE.Object3D
let actionNames = ['idle', 'walk', 'run']

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
    createMesh()
    loadPlayer()

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);

}

function createMesh() {
    const geometry = new THREE.CylinderGeometry(0, 0.1, 0.3, 12);
    geometry.rotateX(Math.PI / 2);
    const material = new THREE.MeshNormalMaterial();
    cone = new THREE.Mesh(geometry, material);
    scene.add(cone);
}

const loadPlayer = async () => {
    const xbot: any = await loadGltf('../src/assets/models/Xbot.glb')
    
    XBot = xbot.scene

    box.expandByObject(XBot)
    box.getSize(XBotSize)

    XBot.position.set(0, 0, 0)
    const skeleton = new THREE.SkeletonHelper(XBot);
    skeleton.visible = true;
    helperGroup.add(skeleton);
    // XBot.add(camera)
    XBot.traverse((bot: THREE.Mesh) => {
        // console.log(bot.name);
        if (bot.isMesh) bot.castShadow = true;
    })
    const animations = xbot.animations

    playerMixer = new THREE.AnimationMixer(XBot);

    for (let i = 0; i < animations.length; i++) {

        const clip = animations[i];

        const action = playerMixer.clipAction(clip);

        action.clampWhenFinished = true;

        actions[clip.name] = action
        console.log('clip.name', clip.name);

        createHandleButton(clip.name)
    }

    playerActiveAction = actions['idle'];

    playerActiveAction.play();

    // XBot.rotation.set(0, Math.PI * 0.2, 0)

    // console.log();

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
    const dt = playerClock.getDelta();
    if (playerMixer) playerMixer.update(dt);

    if ( cone && XBot) {
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

        // updateControls()

    }
    // 更新控制器
    renderer.render(scene, camera);
}

const onKeyUp = function (event) {

    switch (event.code) {

        case 'ArrowUp':
        case 'KeyW':
            if (moveForward&&controls.isLocked) {
                fadeToAction('idle')
            }
            moveForward = false;
            break;
    }


};

const onKeyDown = function (event) {
    switch (event.code) {

        case 'ArrowUp':
        case 'KeyW':
            if (!moveForward&&controls.isLocked) {
                fadeToAction('run')
            }
            moveForward = true;
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

/**
 * 
 * @param name 下一个动画名称
 * @param duration 过度时间
 */
function fadeToAction(name: string, duration = 0.5) {

    previousAction = playerActiveAction;
    playerActiveAction = actions[name];
    if (previousAction !== playerActiveAction) {
        console.log('1');
        previousAction.fadeOut(duration);
    }

    playerActiveAction
        .reset()
        .setEffectiveTimeScale(1)
        .setEffectiveWeight(1)
        .fadeIn(duration)
        .play();

}

let offset = 120
function createHandleButton(text: string) {
    const index = actionNames.indexOf(text)
    if (index !== -1) {
        const button = document.createElement("button")
        button.innerText = text
        button.style.width = offset + 'px'
        button.style.left = index * offset + 'px'
        button.classList.add('handle-button')
        document.body.appendChild(button)
        button.onclick = () => fadeToAction(text)
    }

}
init();
animate();