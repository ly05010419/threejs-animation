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
    dom: any
    light: THREE.DirectionalLight
    controlsStartPos: THREE.Vector3 = new THREE.Vector3()
    controlsMoveFlag = false
    renderCss2D: CSS2DRenderer
    css2dDom
    _TWEEN = TWEEN
    rayFunction
    constructor(dom: any, css2dDom: any) {
        this.dom = dom
        this.css2dDom = css2dDom
        if (this.dom) {
            this.width = this.dom.offsetWidth;
            this.height = this.dom.offsetHeight;

            if (WebGPU.isAvailable() === false && WebGL.isWebGL2Available() === false) {
                throw new Error('No WebGPU or WebGL2 support');
            }

            this.createScene()
            this.createCamera()
            this.createRenderer()
            this.createControls()
            this.createLight()

            const axesHelper = new THREE.AxesHelper(10);
            this.scene.add(axesHelper);
        }
    }
    createScene() {
        // this.scene.background = new THREE.Color(0x000000)
    }
    createCamera() {
        const cameraPos = new THREE.Vector3(20,20, 20)
        this.camera = new THREE.PerspectiveCamera(45, this.width / this.height, 1, 20000);
        this.camera.position.copy(cameraPos)
        this.scene.add(this.camera);
    }
    createRenderer() {
        // 渲染器 THREE.WebGLRenderer
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
        });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(this.width, this.height);
        this.renderer.setAnimationLoop(this.render.bind(this));
        this.dom.appendChild(this.renderer.domElement);

        this.renderCss2D = new CSS2DRenderer({ element: this.css2dDom });
        this.renderCss2D.setSize(this.width, this.height);
    }
    createControls() {
        this.controls = new OrbitControls(this.camera, this.renderer.domElement)
        this.controls.addEventListener('start', () => {
            this.controlsStartPos.copy(this.camera.position)
        })

        this.controls.addEventListener('end', () => {
            this.controlsMoveFlag = this.controlsStartPos.distanceToSquared(this.camera.position) === 0
        })

        this.controls.addEventListener('change', () => {
            // console.log(this.camera.position);

            // this.light.position.copy(this.camera.position)

        })
    }
    createLight() {
        const ambientLight = new THREE.AmbientLight(0xffffff, 1);
        this.scene.add(ambientLight);

        const light = new THREE.DirectionalLight(0xffffff, 3);

        const lightPos2 = new THREE.Vector3(5, 5, 5)
        light.position.copy(lightPos2);
        light.castShadow = true;
        light.shadow.needsUpdate = true;


        const d = 1000;
        light.shadow.camera.left = - d;
        light.shadow.camera.right = d;
        light.shadow.camera.top = d;
        light.shadow.camera.bottom = - d;

        light.shadow.mapSize.x = 1024 * 1000;
        light.shadow.mapSize.y = 1024 * 1000;

        this.light = light
        this.scene.add(light);
    }
    ray(children: THREE.Object3D[], callback: (mesh: THREE.Intersection<THREE.Object3D<THREE.Event>>[]) => void) {
        window.removeEventListener("click", this.rayFunction);
        this.rayFunction = null;
        let mouse = new THREE.Vector2(); //鼠标位置
        var raycaster = new THREE.Raycaster();
        
        function rayFun(event) {
            mouse.x = (event.clientX / document.body.offsetWidth) * 2 - 1;
            mouse.y = -(event.clientY / document.body.offsetHeight) * 2 + 1;
            raycaster.setFromCamera(mouse, this.camera);
            const rallyist = raycaster.intersectObjects(children);
            if (this.controlsMoveFlag) {
                callback && callback(rallyist)
            }
        }
        window.addEventListener("click", rayFun.bind(this));
        this.rayFunction = rayFun

    }
    render() {
        this.controls && this.controls.update()
        this.renderCss2D.render(this.scene, this.camera);
        this.renderer.render(this.scene, this.camera);
        this._TWEEN && this._TWEEN.update();
    }
    animate() {
        this.render()
        requestAnimationFrame(this.animate.bind(this))
    }
    getBoxInfo(mesh) {
        const box3 = new THREE.Box3()
        box3.expandByObject(mesh)
        const size = new THREE.Vector3()
        const center = new THREE.Vector3()
        box3.getCenter(center)
        box3.getSize(size)
        return {
            size, center
        }
    }
    toSceneCenter(mesh) {
        const { center, size } = this.getBoxInfo(mesh)
        mesh.position.copy(center.negate())
    }
}
