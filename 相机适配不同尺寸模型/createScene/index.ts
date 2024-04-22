import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer'
import TWEEN from '@tweenjs/tween.js'

import WebGPU from 'three/examples/jsm/capabilities/WebGPU';
import WebGL from 'three/examples/jsm/capabilities/WebGL';
// import WebGPURenderer from 'three/examples/jsm/renderers/webgpu/WebGPURenderer';
export const T = class {
    scene: THREE.Scene = new THREE.Scene();
    scene3D: THREE.Scene = new THREE.Scene()
    camera: THREE.PerspectiveCamera
    renderer: THREE.WebGLRenderer;
    controls: OrbitControls
    width: number
    height: number
    light: THREE.DirectionalLight
    controlsStartPos: THREE.Vector3 = new THREE.Vector3()
    controlsMoveFlag = false
    css2dDom
    _TWEEN = TWEEN
    lastMesh
    canvas

    constructor(threeCanvas) {
        this.canvas = threeCanvas
        if (this.canvas) {
            this.width = this.canvas.offsetWidth;
            this.height = this.canvas.offsetHeight;

            if (WebGPU.isAvailable() === false && WebGL.isWebGL2Available() === false) {
                throw new Error('No WebGPU or WebGL2 support');
            }

            this.createScene()
            this.createCamera()
            this.createRenderer()
            this.createControls()
            this.createLight()

            const axesHelper = new THREE.AxesHelper(100);
            this.scene.add(axesHelper);


        }
    }
    createScene() {
        // this.scene.background = new THREE.Color(0x000000)
    }
    createCamera() {
        const cameraPos = new THREE.Vector3(0, 0, 180)
        this.camera = new THREE.PerspectiveCamera(75, this.width / this.height, 1, 20000);
        this.camera.position.copy(cameraPos)
        this.scene.add(this.camera);

        const helper = new THREE.CameraHelper(this.camera);
        this.scene.add(helper);

    }
    createRenderer() {
        // 渲染器 THREE.WebGLRenderer
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            canvas: this.canvas
        });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(this.width, this.height);
        this.renderer.setAnimationLoop(this.render.bind(this));
    }
    createControls() {
        this.controls = new OrbitControls(this.camera, this.renderer.domElement)
        // 开始的时候记录摄像头位置
        this.controls.addEventListener('start', () => {
            this.controlsStartPos.copy(this.camera.position)
        })

        // 结束的时候计算当前镜头位置和start时的镜头位置距离，如果为0则表示没移动过镜头(鼠标)
        this.controls.addEventListener('end', () => {
            this.controlsMoveFlag = this.controlsStartPos.distanceToSquared(this.camera.position) !== 0
        })

        this.controls.addEventListener('change', () => {

        })
    }
    createLight() {
        const ambientLight1 = new THREE.AmbientLight(0xffffff, 1);
        this.scene.add(ambientLight1);

        this.light = new THREE.DirectionalLight(0xffffff, 10);
        this.light.position.set(40, 40, 40)
        this.light.castShadow = true;


        this.scene.add(this.light)
    }


    render() {
        this.controls && this.controls.update()
        this.renderer.render(this.scene, this.camera);
        this._TWEEN && this._TWEEN.update();
    }
    animate() {
        this.render()
        requestAnimationFrame(this.animate.bind(this))
    }
    /**
     * 
     * @param children 被检测物体
     * @param callback 射线回调
     */
    ray(children: THREE.Object3D[], callback: (mesh: THREE.Intersection<THREE.Object3D<THREE.Event>>[]) => void) {
        let mouse = new THREE.Vector2(); //鼠标位置
        // 创建射线检测
        var raycaster = new THREE.Raycaster();
        window.addEventListener("click", (event) => {
            // 如果控制器未移动 调用检测
            if (!this.controlsMoveFlag) {
                mouse.x = (event.clientX / document.body.offsetWidth) * 2 - 1;
                mouse.y = -(event.clientY / document.body.offsetHeight) * 2 + 1;
                raycaster.setFromCamera(mouse, this.camera);
                const rallyist = raycaster.intersectObjects(children);
                callback && callback(rallyist)
            }
        });
    }
}
