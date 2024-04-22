// import { Scene, Color, Group, MOUSE, PerspectiveCamera, Fog, Layers, Clock, SpotLight, ShaderMaterial, Raycaster, IcosahedronGeometry, BoxGeometry, MeshBasicMaterial, Mesh, AnimationMixer, DirectionalLight, Vector2, DirectionalLightHelper, PointLightHelper, PointLight, HemisphereLightHelper, HemisphereLight, AxesHelper, Vector3, WebGLRenderer, AmbientLight, Euler } from 'three'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
// import { OrbitControls } from '../utils/OrbitControls';
import { CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer'
import { presetsCameraPos } from '../data'
import { Fly } from '../utils/fly';
import TWEEN from '@tweenjs/tween.js'
export const T = class {
    scene: THREE.Scene = new THREE.Scene();
    scene3D: THREE.Scene = new THREE.Scene()
    camera: THREE.PerspectiveCamera
    renderer: THREE.WebGLRenderer
    controls: OrbitControls
    width: number
    height: number
    dom: any
    defaultInfo: any
    light: THREE.DirectionalLight
    _Fly: Fly = new Fly()
    controlsStartPos: THREE.Vector3 = new THREE.Vector3()
    controlsMoveFlag = false
    renderCss2D: CSS2DRenderer
    css2dDom
    _TWEEN = TWEEN
    constructor(dom: any, css2dDom: any) {
        this.dom = dom
        this.css2dDom = css2dDom
        this.defaultInfo = presetsCameraPos.find((pos) => pos.name === 'aerial')
        if (this.dom) {
            this.width = this.dom.offsetWidth;
            this.height = this.dom.offsetHeight
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
        const drawingCanvas = document.createElement('canvas');
        const context = drawingCanvas.getContext('2d');

        if (context) {
            // 设置canvas的尺寸
            drawingCanvas.width = this.width;
            drawingCanvas.height = this.height;

            // 创建渐变
            const gradient = context.createRadialGradient(this.width / 2, this.height, 0, this.width/2, this.height/2, Math.max(this.width, this.height));

            // 为渐变添加颜色
            gradient.addColorStop(0, '#0b171f');
            gradient.addColorStop(0.6, '#000000');

            // 使用渐变填充矩形
            context.fillStyle = gradient;
            context.fillRect(0, 0, drawingCanvas.width, drawingCanvas.height);
            this.scene.background = new THREE.CanvasTexture(drawingCanvas)
            this.scene.fog = new THREE.Fog(0x000000, 0, 200);
        }
    }
    createCamera() {
        const cameraPos = new THREE.Vector3().fromArray(this.defaultInfo.pos)
        this.camera = new THREE.PerspectiveCamera(12, this.width / this.height, 1, 20000);
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
    createControls() {
        this.controls = new OrbitControls(this.camera, this.renderer.domElement)
        this.controls.target.set(...this.defaultInfo.target)
        this.controls.addEventListener('start', () => {
            this.controlsStartPos.copy(this.camera.position)
        })

        this.controls.addEventListener('end', () => {
            this.controlsMoveFlag = this.controlsStartPos.distanceToSquared(this.camera.position) === 0
        })

        this.controls.addEventListener('change', () => {
            console.log(this.camera.position)
            this.light.position.copy(this.camera.position)

        })
    }
    createLight() {
        const ambientLight = new THREE.AmbientLight(0xffffff, 1);
        this.scene.add(ambientLight);

        const light = new THREE.DirectionalLight(0xffffff, 3);

        const lightPos2 = new THREE.Vector3().fromArray(this.defaultInfo.pos)
        light.position.copy(lightPos2);
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

        const helper = new THREE.DirectionalLightHelper(light)
        this.scene.add(helper)
        this.light = light
        this.scene.add(light);
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
        this._Fly && this._Fly.upDate()
        this._TWEEN && this._TWEEN.update();
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
        mesh.position.copy(center.negate().setY(0))
    }
    handleCameraPos(end: number[]) {
        // 结束时候相机位置
        const endV3 = new THREE.Vector3().fromArray(end)
        // 目前相机到目标位置的距离，根据不同的位置判断运动的时间长度，从而保证速度不变
        const length = this.camera.position.distanceTo(endV3)
        // 如果位置相同，不运行动画
        if (length === 0) return
        new this._TWEEN.Tween(this.camera.position)
            .to(endV3, Math.sqrt(length) * 400)
            .start()
            // .onUpdate((value) => {
            //     console.log(value)
            // })
            .onComplete(() => {

            })
    }
}
