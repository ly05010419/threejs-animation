import * as THREE from 'three'
import { T as createThreeScene } from './createScene'

import { loadGltf } from '../src/ts/loaders'
const dom = document.querySelector('#de_dust2')
const css2dDom = document.querySelector('#css2dRender')
const T = new createThreeScene(dom, css2dDom)

loadGltf('./models/scene.gltf').then((gltf: any) => {
    const mapModel: THREE.Mesh = gltf.scene.children[0]
    T.toSceneCenter(mapModel)
    mapModel.traverse((mesh) => {
        // console.log(mesh)
    })
    let arr: any[] = []
    T.ray(mapModel.children, (list) => {
        arr.push(list[0]?.point.toArray())
        console.log(JSON.stringify(arr))
    })
    T.scene.add(mapModel)
    T.animate()
})
