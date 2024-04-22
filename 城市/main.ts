import * as THREE from 'three'
import { T as createThreeScene } from './createScene'

import { loadGltf, loadObj } from '../src/ts/loaders'
import { Fly } from './utils/fly'
import { CameraPosInfo, flyLineData, presetsCameraPos } from './data'
import { floorMaterial, otherBuildingLineMaterial, otherBuildingMaterial } from './materials'
import { changeModelMaterial } from './utils/createLine'
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer'
const dom = document.querySelector('#city_map')
const css2dDom = document.querySelector('#css2dRender')
const T = new createThreeScene(dom, css2dDom)

loadGltf('./models/scene.gltf').then((gltf: any) => {

    if(!T)return
    const group = gltf.scene.clone() as THREE.Group

    const scale = 10
    group.scale.set(scale, scale, scale)
    // 删除多余模型
    const mesh1 = group.getObjectByName('Text_test-base_0')
    if (mesh1 && mesh1.parent) mesh1.parent.remove(mesh1)

    const mesh2 = group.getObjectByName('Text_text_0')
    if (mesh2 && mesh2.parent) mesh2.parent.remove(mesh2)

    // 建筑颜色
    const buildColor = new THREE.Color(0x22B7F2)
    // 建筑线框颜色
    const buildLineColor = new THREE.Color(0x2381CA)
    // 非主要建筑颜色
    const otherBuildColor = new THREE.Color(0x7C7C7D)
    // 非主要建筑线框颜色
    const otherBuildLineColor = new THREE.Color(0x656566)
    // 渲染线条时，相邻面的法线之间的角度，达到这个角度就会渲染线条
    const buildLineDeg = 0.001
    const buildLineOpacity = 1
    const buildOpacity = 0.85
    // 重命名模型
    // 环球金融中心
    const hqjrzx = group.getObjectByName('02-huanqiujinrongzhongxin_huanqiujinrongzhongxin_0')
    if (hqjrzx) {
        hqjrzx.name = 'hqjrzx'
        changeModelMaterial(hqjrzx, otherBuildingMaterial(buildColor, buildOpacity), otherBuildingLineMaterial(buildLineColor, buildLineOpacity), buildLineDeg)
    }

    // 上海中心
    const shzx = group.getObjectByName('01-shanghaizhongxindasha_shanghaizhongxindasha_0')
    if (shzx) {
        shzx.name = 'shzx'
        changeModelMaterial(shzx, otherBuildingMaterial(buildColor, buildOpacity), otherBuildingLineMaterial(buildLineColor, buildLineOpacity), buildLineDeg)
    }
    // 金茂大厦
    const jmds = group.getObjectByName('03-jinmaodasha_jjinmaodasha_0')
    if (jmds) {
        jmds.name = 'jmds'
        changeModelMaterial(jmds, otherBuildingMaterial(buildColor, buildOpacity), otherBuildingLineMaterial(buildLineColor, buildLineOpacity), buildLineDeg)
    }
    // 东方明珠塔
    const dfmzt = group.getObjectByName('04-dongfangmingzhu_dongfangmingzhu_0')
    if (dfmzt) {
        dfmzt.name = 'dfmzt'
        changeModelMaterial(dfmzt, otherBuildingMaterial(buildColor, buildOpacity), otherBuildingLineMaterial(buildLineColor, buildLineOpacity), buildLineDeg)
    }

    T.scene.add(group)
    T.toSceneCenter(group)


    group.traverse((mesh: any) => {
        mesh as THREE.Mesh
        if (mesh.isMesh && (mesh.name.indexOf('Shanghai') !== -1 || mesh.name.indexOf('Object') !== -1)) {
            if (mesh.name.indexOf('Floor') !== -1) {
                mesh.material = floorMaterial
            } else if (mesh.name.indexOf('River') !== -1) {
            } else {
                changeModelMaterial(mesh, otherBuildingMaterial(otherBuildColor, 0.8), otherBuildingLineMaterial(otherBuildLineColor, 0.4), buildLineDeg)
            }
        }
    })

    let arr = []
    // T.ray(group.children, (meshList) => {
    //     console.log('meshList', meshList);
    //     arr.push(...meshList[0].point.toArray())
    //     console.log(JSON.stringify(arr));
    // })

    createFly()
    createTag()
    T.animate()
})

// 创建建筑标记
function createTag() {
    const buildTagGroup = new THREE.Group()
    T.scene.add(buildTagGroup)
    presetsCameraPos.forEach((cameraPos: CameraPosInfo, i: number) => {
        if (cameraPos.tagPos) {
            // 渲染2d文字
            const element = document.createElement('li');
            // 将信息存入dom节点中，如果是react或者vue写的，不用这么存，直接存data或者state
            element.setAttribute('data-cameraPosInfo', JSON.stringify(cameraPos))
            element.classList.add('build_tag')
            element.innerText = `${i + 1}`
            // 将初始化好的dom节点渲染成CSS2DObject，并在scene场景中渲染
            const tag = new CSS2DObject(element);
            const tagPos = new THREE.Vector3().fromArray(cameraPos.tagPos)
            tag.position.copy(tagPos)
            buildTagGroup.add(tag)
        }
    })
    // 监听建筑标记点击事件
    if (css2dDom) {
        css2dDom.addEventListener('click', function (e) {
            if (e.target) {
                if(e.target.nodeName=== 'LI') {
                    console.dir(e);
                    const cameraPosInfo = e.target.getAttribute('data-cameraPosInfo')
                    if (cameraPosInfo) {
                        const {pos,target} = JSON.parse(cameraPosInfo)
                        T.controls.target.set(...target)
                        T.handleCameraPos(pos)
                    }
                }
            }
        });
    }

}

function buildTagClick(e) {
    console.log('e', e);

}
// 创建飞线
function createFly() {
    let flyLineGroup = new THREE.Group()

    flyLineData.forEach((data: number[]) => {
        const points: THREE.Vector2[] = []
        for (let i = 0; i < data.length / 3; i++) {
            const x = data[i * 3]
            const z = data[i * 3 + 2]
            const point = new THREE.Vector2(x, z)
            points.push(point)
        }
        const curve = new THREE.SplineCurve(points);
        // 此处决定飞线每个点的疏密程度，数值越大，对gpu的压力越大
        const curvePoints = curve.getPoints(100);
        const flyPoints = curvePoints.map((curveP: THREE.Vector2) => new THREE.Vector3(curveP.x, 0, curveP.y))

        // const l = points.length - 1

        const flyGroup = T._Fly.setFly({
            index: Math.random() > 0.5 ? 50 : 20,
            num: 20,
            points: flyPoints,
            spaced: 50, // 要将曲线划分为的分段数。默认是 5
            starColor: new THREE.Color(Math.random() * 0xffffff),
            endColor: new THREE.Color(Math.random() * 0xffffff),
            size: 0.5
        })
        flyLineGroup.add(flyGroup)
    })
    T.scene.add(flyLineGroup)
}