// import { Scene, Color, Group, MOUSE, PerspectiveCamera, Fog, Layers, Clock, SpotLight, ShaderMaterial, Raycaster, IcosahedronGeometry, BoxGeometry, MeshBasicMaterial, Mesh, AnimationMixer, DirectionalLight, Vector2, DirectionalLightHelper, PointLightHelper, PointLight, HemisphereLightHelper, HemisphereLight, AxesHelper, Vector3, WebGLRenderer, AmbientLight, Euler } from 'three'
import * as THREE from 'three'
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer'
import { CSS3DRenderer } from 'three/examples/jsm/renderers/CSS3DRenderer'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { rigidBodies, updatePhysics } from '../utils/physics';
import TWEEN from '@tweenjs/tween.js'
import { update } from '../createVehicle'
export let scene: THREE.Scene = new THREE.Scene(), scene2: THREE.Scene = new THREE.Scene(), directionalLight: THREE.DirectionalLight, axesHelper: THREE.AxesHelper, pointLight: THREE.PointLight, hemiLight: THREE.HemisphereLight, helperGroup: THREE.Group = new THREE.Group(), camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer, controls: OrbitControls, labelRenderer: CSS2DRenderer, renderer2: CSS3DRenderer, ambientLight: THREE.AmbientLight
export let lightScene: THREE.Scene
export let width: number = 0
export let height: number = 0
let composer: any, light: THREE.DirectionalLight
const BLOOM_SCENE = 1;
const bloomLayer = new THREE.Layers();
bloomLayer.set(BLOOM_SCENE);
const playerClock = new THREE.Clock();
let threeDom: any = null
let navigationFollow = true
export const changeFollow = (val: boolean) => {

  navigationFollow = val
}
function initCamera() {
  // 镜头
  const cameraPos = new THREE.Vector3(17.441486865264633, 19.643802610477184, 20.53691205440979)

  camera = new THREE.PerspectiveCamera(50, width / height, 1, 20000);
  camera.position.copy(cameraPos)
  scene.add(camera);
}
function initRender(dom: HTMLDivElement) {
  // 渲染器
  renderer = new THREE.WebGLRenderer({
    antialias: true,
  });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(width, height);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.needsUpdate = true
  // renderer.setClearColor( 0x000000, 0 );
  dom.appendChild(renderer.domElement);


}
function initScene() {

  // 场景
  scene.fog = new THREE.Fog(0xf19454, 0, 200);
  scene.background = new THREE.Color(0xff00ff)
  const drawingCanvas = document.createElement('canvas');
  const context = drawingCanvas.getContext('2d');

  if (context) {
    // 设置canvas的尺寸
    drawingCanvas.width = 500;
    drawingCanvas.height = 500;

    // 创建渐变
    const gradient = context.createLinearGradient(0, 0, drawingCanvas.width, drawingCanvas.height);

    // 为渐变添加颜色
    gradient.addColorStop(0, '#f19454');
    gradient.addColorStop(0.4, '#f19454');
    gradient.addColorStop(1, '#f1bd9e');

    // 使用渐变填充矩形
    context.fillStyle = gradient;
    context.fillRect(0, 0, drawingCanvas.width, drawingCanvas.height);
    scene.background = new THREE.CanvasTexture(drawingCanvas)

    const axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper);
  }


  scene.add(helperGroup);
}
function initHelper() {
  // 辅助线
  axesHelper = new THREE.AxesHelper(100);
  helperGroup.add(axesHelper);
}

function initControls() {
  controls = new OrbitControls(camera, renderer.domElement)
  controls.addEventListener('change', () => {
    console.log(camera.position)
  })
}

function init() {
  threeDom = window.document.body
  width = threeDom.offsetWidth
  height = threeDom.offsetHeight

  initScene()
  initRender(threeDom)
  initCamera()
  initLight()
  initControls()
  window.addEventListener('resize', onWindowResize);
}

function onWindowResize() {
  if (threeDom) {
    width = threeDom.offsetWidth
    height = threeDom.offsetHeight
    camera.aspect = width / height
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);

  }


}

function directional(pos: THREE.Vector3) {
  light = new THREE.DirectionalLight(0xffffff, 3);
  light.position.copy(pos);
  light.castShadow = true;
  light.shadow.needsUpdate = true;


  const d = 1000;
  light.shadow.camera.left = - d;
  light.shadow.camera.right = d;
  light.shadow.camera.top = d;
  light.shadow.camera.bottom = - d;
  // light.shadow.camera.far = 3500;
  // light.shadow.bias = - 0.0001;

  light.shadow.mapSize.x = 1024 * 1000;
  light.shadow.mapSize.y = 1024 * 1000;

  // const helper = new THREE.DirectionalLightHelper(light)
  // helperGroup.add(helper)
  scene.add(light);
}
function initLight() {
  // 环境光 没阴影
  const ambientLight = new THREE.AmbientLight(0xffffff, 2);
  scene.add(ambientLight);

  const lightPos2 = new THREE.Vector3(40, 190, 100)
  directional(lightPos2)
  // directional(lightPos1)

}
// const playerDirection = new THREE.Vector3()

export function render() {
  renderer.render(scene, camera);
  const dt = playerClock.getDelta();
  // 更新物理世界
  updatePhysics(dt, rigidBodies)
  TWEEN && TWEEN.update();
  update && update?.()
  // moveCamera()
}

export function disposeMaterial(obj: any) {

  if (obj.material) {

    obj.material.dispose();

  }

}


export { init }