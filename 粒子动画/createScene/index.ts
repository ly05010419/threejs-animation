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
    lastMesh

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
        const cameraPos = new THREE.Vector3(10, 10, 10)
        this.camera = new THREE.PerspectiveCamera(60, this.width / this.height, 1, 20000);
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
        // 开始的时候记录摄像头位置
        this.controls.addEventListener('start', () => {
            this.controlsStartPos.copy(this.camera.position)
        })

        // 结束的时候计算当前镜头位置和start时的镜头位置距离，如果为0则表示没移动过镜头(鼠标)
        this.controls.addEventListener('end', () => {
            this.controlsMoveFlag = this.controlsStartPos.distanceToSquared(this.camera.position) === 0
        })

        this.controls.addEventListener('change', () => {
            // console.log(this.camera.position);

            // this.light.position.copy(this.camera.position)

        })
    }
    createLight() {
        const ambientLight1 = new THREE.AmbientLight(0xffffff, 1);
        this.scene.add(ambientLight1);
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
        // 创建一个包围盒
        const box3 = new THREE.Box3()
        // 添加包围盒对象
        box3.expandByObject(mesh)
        const size = new THREE.Vector3()
        const center = new THREE.Vector3()
        // 通过box3提供的api获取到center和size
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
