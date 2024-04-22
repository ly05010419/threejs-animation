// import { Scene, Color, Group, MOUSE, PerspectiveCamera, Fog, Layers, Clock, SpotLight, ShaderMaterial, Raycaster, IcosahedronGeometry, BoxGeometry, MeshBasicMaterial, Mesh, AnimationMixer, DirectionalLight, Vector2, DirectionalLightHelper, PointLightHelper, PointLight, HemisphereLightHelper, HemisphereLight, AxesHelper, Vector3, WebGLRenderer, AmbientLight, Euler } from 'three'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls';

import { CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer'
import Stats from 'three/examples/jsm/libs/stats.module';
import { pointPos } from '../data';
export const T = class {
    scene: THREE.Scene = new THREE.Scene();
    scene3D: THREE.Scene = new THREE.Scene()
    camera: THREE.PerspectiveCamera
    renderer: THREE.WebGLRenderer
    controls: OrbitControls
    width: number
    height: number
    dom: any
    light: THREE.DirectionalLight
    controlsStartPos: THREE.Vector3 = new THREE.Vector3()
    pointerLockControls: PointerLockControls
    controlsMoveFlag = false
    renderCss2D: CSS2DRenderer
    css2dDom: any
    stats = new Stats();
    allScene: true
    defaultPosInfo
    constructor(dom: any, css2dDom: any) {
        this.dom = dom
        this.css2dDom = css2dDom
        this.defaultPosInfo = pointPos.find((info) => info.name = 'all')
        if (this.dom) {
            this.dom.appendChild(this.stats.dom)
            this.width = this.dom.offsetWidth;
            this.height = this.dom.offsetHeight
            this.createScene()
            this.createCamera()
            this.createRenderer()
            this.createControls()
            this.initPointerLockControls()
            this.createLight()

            const axesHelper = new THREE.AxesHelper(100);
            this.scene.add(axesHelper);
        }
    }
    createScene() {
        this.scene.background = new THREE.Color(0x000000)
    }
    createCamera() {
        const cameraPos = new THREE.Vector3().fromArray(this.defaultPosInfo.pos)
        this.camera = new THREE.PerspectiveCamera(70, this.width / this.height, 1, 20000);
        this.camera.position.copy(cameraPos)
        this.scene.add(this.camera);
    }
    createRenderer() {
        // 渲染器
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
        });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(this.width, this.height);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.needsUpdate = true

        this.renderCss2D = new CSS2DRenderer({ element: this.css2dDom });
        this.renderCss2D.setSize(this.width, this.height);
        this.dom.appendChild(this.renderer.domElement);
    }
    initPointerLockControls() {
        this.pointerLockControls = new PointerLockControls(this.camera, this.dom);
        // document.body.addEventListener('click', function () {
        //     this.allScene = false
        //     this.pointerLockControls.lock();

        // }.bind(this));
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
            console.log(this.camera.position)

        })
    }
    createLight() {
        const ambientLight = new THREE.AmbientLight(0xffffff, 1);
        this.scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 2.5);
        directionalLight.position.set(- 5, 25, - 1);
        directionalLight.castShadow = true;
        directionalLight.shadow.camera.near = 0.01;
        directionalLight.shadow.camera.far = 500;
        directionalLight.shadow.camera.right = 30;
        directionalLight.shadow.camera.left = - 30;
        directionalLight.shadow.camera.top = 30;
        directionalLight.shadow.camera.bottom = - 30;
        directionalLight.shadow.mapSize.width = 1024;
        directionalLight.shadow.mapSize.height = 1024;
        directionalLight.shadow.radius = 4;
        directionalLight.shadow.bias = - 0.00006;
        this.scene.add(directionalLight);
    }
    ray(children: THREE.Object3D[], callback: (mesh: THREE.Intersection<THREE.Object3D<THREE.Event>>[]) => void) {
        let mouse = new THREE.Vector2(); //鼠标位置
        var raycaster = new THREE.Raycaster();
        window.addEventListener("click", (event) => {
            mouse.x = (event.clientX / document.body.offsetWidth) * 2 - 1;
            mouse.y = -(event.clientY / document.body.offsetHeight) * 2 + 1;
            raycaster.setFromCamera(mouse, this.camera);
            const rallyist = raycaster.intersectObjects(children);
            if (this.controlsMoveFlag) {
                callback && callback(rallyist)
            }
        });
    }
    render() {
        this.controls && this.controls.update()
        this.renderer.render(this.scene, this.camera);
        this.renderCss2D.render(this.scene, this.camera);
        this.stats && this.stats.update();
    }
    animate() {
        this.render()
        requestAnimationFrame(this.animate.bind(this));
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
        console.log(size, center)
        mesh.position.set(0, 0, 0)
    }
}
