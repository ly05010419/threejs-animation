import * as THREE from 'three'
import { getArcsByTreeID } from './getMapData';
import { extrudeSettings, lineMaterial, material } from './materials';
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer';
import { T } from './createScene';
import { ResourceTracker } from './ResourceTracker';

interface Iprops {
    cityData: any;
    mapData: any
    dom: any;
    css2dDom: any;
}

export class DrawMap extends T {
    levelGroup
    mapData: any;
    level;
    track
    resMgr;
    history: any = {}
    thatCityData: any
    depLevel = 3
    constructor(params: Iprops) {
        super(params.dom, params.css2dDom)
        this.mapData = params.mapData

        this.resMgr = new ResourceTracker();
        this.track = this.resMgr.track.bind(this.resMgr);

        window.addEventListener("click", this.rayFunction.bind(this));

    }
    async toNextLevel(rayList) {
        if (rayList.length !== 0) {
            const info = rayList[0]?.object.userData?.properties
            if (info) {
                // 通过之前存的info的name在映射表里找到对应的treeID
                const treeID = this.mapData.find((hz: any) => hz.name === info.name)?.treeID

                const l = this.level + 1
                const isDraw = await this.getChildArcs(treeID, l)
                if (isDraw === false) {
                    const arcsInfo = this.thatCityData.children[treeID]

                    if (this.depLevel === this.level) return

                    this.clear()

                    this.level = l

                    this.renderHistory(arcsInfo)
                    this.drawCity([arcsInfo.payload])
                }

            }
        }
    }
    async getChildArcs(treeID: string, level: number) {
        // 通过点击时模型的treeid获取下级城市数据
        let data = await getArcsByTreeID(treeID)
        // 如果没有数据，则返回false
        if (!data) return false
        this.level = level
        // 渲染历史的dom节点
        this.renderHistory(data)
        this.thatCityData = data
        // 完美清空场景内容
        this.clear()

        const child = data.children
        let keys = Object.keys(child)
        let arcsInfo = keys.map((key) => child[key].payload)
        // 绘制城市数据
        this.drawCity(arcsInfo)

    }
    drawCity(arcsInfo: number[][][]) {
        arcsInfo.forEach((info: any) => {
            const mapInfo = info.objects.collection.geometries[0].properties
            // 每个下一级城市的组成组
            const labelGroup = new THREE.Group()
            this.levelGroup.add(labelGroup)

            info.arcs.forEach((arcs: number[][]) => {
                const cityGroup = new THREE.Group()
                this.levelGroup?.add(cityGroup)
                // 新建一个形状实例
                const shape = new THREE.Shape();
                const points: THREE.Vector3[] = [];
                arcs.forEach((v2Arr: number[], index: number) => {
                    if (index === 0) {
                        shape.moveTo(v2Arr[0], v2Arr[1]);
                    } else {
                        shape.lineTo(v2Arr[0], v2Arr[1]);
                    }
                    points.push(new THREE.Vector3(v2Arr[0], v2Arr[1], 0))
                })
                // 通过形状和挤压模型的信息，创建一个挤压模型
                const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
                const mesh = new THREE.Mesh(geometry, material);
                // 将城市信息存放在模型中
                mesh.userData.properties = mapInfo
                mesh.name = mapInfo.name
                cityGroup.add(mesh)
            })

            const label = this.track(this.drawAreaName(info.objects.collection.geometries[0].properties, new THREE.Color(Math.random() * 0xffffff)))
            const city = this.levelGroup.getObjectByName(mapInfo.name)
            if (city) {
                const pos = new THREE.Vector3()
                city?.getWorldPosition(pos)
                const { center } = this.getBoxInfo(city)
                label.position.copy(center)
                labelGroup.add(label)

            }
        })

        this.toSceneCenter(this.levelGroup)
        this.choseCamera(this.levelGroup)
        this.lastMesh = this.levelGroup.clone()
    }

    drawAreaName(info: any, color: THREE.Color) {
        // 创建一个div元素
        const moonMassDiv = document.createElement('div');
        moonMassDiv.className = 'label';
        moonMassDiv.textContent = info.name;
        moonMassDiv.style.color = `#${color.getHexString()}`
        moonMassDiv.style.backgroundColor = 'transparent';

        const label = new CSS2DObject(moonMassDiv);
        return label
    }
    rayFunction(event) {
        let mouse = new THREE.Vector2(); //鼠标位置
        // 创建射线检测实例
        var raycaster = new THREE.Raycaster();
        mouse.x = (event.clientX / document.body.offsetWidth) * 2 - 1;
        mouse.y = -(event.clientY / document.body.offsetHeight) * 2 + 1;
        // 设置一条从相机位置到鼠标位置的检测射线
        raycaster.setFromCamera(mouse, this.camera);

        const rallyist = raycaster.intersectObjects(this.levelGroup.children, true);
        if (this.controlsMoveFlag) {
            // 进行下一步绘制
            this.toNextLevel(rallyist)
        }
    }
    clear() {
        this.resMgr && this.resMgr.dispose();
        this.levelGroup = this.track(new THREE.Group())
        this.scene.add(this.levelGroup)
    }
    renderHistory(info) {
        this.history[this.level] = info
        const keys = Object.keys(this.history)
        let historyDomHTML = ``
        for (let i = 1; i <= this.level; i++) {
            const key = i
            historyDomHTML += `
                <p data-cityInfo='${JSON.stringify({
                level: key,
                info: this.history[key]
            })
                }'>${this.history[key].name}</p>${i < this.level ? '&gt;' : ''}
            `
        }
        let dom = document.querySelector('.history-dom')
        if (dom) dom.innerHTML = historyDomHTML
    }
}