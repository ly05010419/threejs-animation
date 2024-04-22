import { RepeatWrapping, AxesHelper, LoopOnce, Group, AnimationMixer, DirectionalLightHelper, SkeletonHelper, Box3, Matrix4, DoubleSide, PlaneGeometry, MeshBasicMaterial, Clock, TextureLoader, ColorRepresentation, Quaternion, Vector3, WebGLRenderer, Mesh, Material, BoxGeometry, Color, MeshPhongMaterial, Object3D, Euler, Vector4 } from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

let Ammo = (window as any).Ammo
import { ambientLight, light } from './ts/light'
import { renderer as rendererTS } from './ts/renderer'
import { camera as cameraTS } from './ts/camera'
import { scene as sceneTS } from './ts/scene'
import grid from './assets/textures/hardwood2_diffuse.jpg'
import { createPlayer } from './Preform/player'
import { createRole } from './preform/role'
// import './ts/loadModel'
// import { loadModels } from './ts/loadModel'
import { loadFbx } from './ts/loaders'
export const helperGroup = new Group()
let camera = cameraTS, Player: any, controls: any, scene = sceneTS, renderer = rendererTS, textureLoader = new TextureLoader();
// 底板尺寸
const PlaneSize = 1000


// 辅助线
const axesHelper = new AxesHelper(100);
scene.add(axesHelper);
scene.add(helperGroup);

// 主角当前动画 
let playerActiveAction: any = null
// 主角上一次动画
let previousAction: any = null
// 主角的动画器
let playerMixer: AnimationMixer
// 更新主角时钟
const playerClock = new Clock();
// 主角动画剪辑
const playerActions: any = {}
// 主角速度
const PlayerSpeed = 4


const train = new Object3D()

train.add(camera)
// train.position.setY(200)
// Rigid bodies include all movable objects
scene.add(train)

const rigidBodies: Object3D[] = [];

Ammo().then(function (AmmoLib: any) {
  Ammo = AmmoLib;
  (window as any).Ammo = Ammo
  init();
  animate();

});


// - Functions -

const init = async () => {
  // 创建场景
  initGraphics();
  // 创建物理引擎
  // initPhysics();
  // 创建物理物体
  createObjects();
  // 创建主角
  initPlayer()


}

function initGraphics() {
  scene.add(...[light, ambientLight])
  const helper = new DirectionalLightHelper(light, 5);
  helperGroup.add(helper);

  document.body.appendChild(renderer.domElement);

  controls = new OrbitControls(camera, renderer.domElement)



  // controls.addEventListener('change', () => {
  //   console.log(camera.position);

  // })
  // controls.target.set(0, 2, 0);
  // controls.update();
  window.addEventListener('resize', onWindowResize);

}


// 创建所有需要的元素
async function createObjects() {
  // 创建底板
  const geometry = new PlaneGeometry(PlaneSize, PlaneSize);
  const material = new MeshBasicMaterial({ color: 0xffffff, side: DoubleSide });
  const plane = new Mesh(geometry, material);
  textureLoader.load(grid, function (texture) {
    texture.wrapS = RepeatWrapping;
    texture.wrapT = RepeatWrapping;
    texture.repeat.set(100, 100);
    plane.material.map = texture;
    plane.material.needsUpdate = true;
  });
  plane.rotation.set(0.5 * Math.PI, 0, 0);
  scene.add(plane)



}
const initPlayer = async () => {

  Player = await createPlayer()


  // 获取到所有的动画
  const animations = Player.animations
  Player = Player.scene
  // camera.lookAt(Player.position)
  // 注册主角动画器
  playerMixer = new AnimationMixer(Player);

  // 收集所有动画  方便后面运动过程中改变动画
  for (let i = 0; i < animations.length; i++) {
    const clip = animations[i];
    const action = playerMixer.clipAction(clip);
    playerActions[clip.name] = action;

    action.clampWhenFinished = true;
    // 是否循环动画  LoopOnce 只播放一次
    // action.loop = LoopOnce;
  }

  playerActiveAction = playerActions['Idle'];
  fadeToAction('Idle')

  scene.add(Player)

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

// 渲染函数
function render() {
  light.position.copy(camera.position);
  const dt = playerClock.getDelta();
  updatePlayer(dt)


  // 更新控制器
  // upDateLockControls(controls)

  renderer.render(scene, camera);
}

// 更新主角

function updatePlayer(deltaTime: number) {

  if (playerMixer) playerMixer.update(deltaTime);

}


// 切换动画
function fadeToAction(name: string, duration = 0.5) {

  previousAction = playerActiveAction;
  playerActiveAction = playerActions[name];
  if (previousAction !== playerActiveAction) {
    previousAction.fadeOut(duration);
  }

  playerActiveAction
    .reset()
    .setEffectiveTimeScale(1)
    .setEffectiveWeight(1)
    .fadeIn(duration)
    .play();

}