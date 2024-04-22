import * as THREE from 'three'
import { T as TS } from './createScene/index'
import { getHZData, getHZMapData, getArcsByTreeID } from './getMapData'
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer'
import { DrawMap } from './drawMap'

const Dom2D = document.querySelector('.dom-2d')
const Dom3D = document.querySelector('.dom-3d')


const hzMap = await getHZMapData()
const HZData = await getHZData();

const drawCity = new DrawMap({
    css2dDom: Dom2D,
    dom: Dom3D,
    cityData: HZData,
    mapData: hzMap,
})
drawCity.getChildArcs('1', 1)

const historyDom = document.querySelector('.history-dom')
if (historyDom) {
    historyDom.addEventListener('click', (event: any) => {
        const tag = event?.target
        if (tag?.nodeName === 'P') {
            const cityInfoStr = tag.getAttribute('data-cityInfo')
            const cityInfo = JSON.parse(cityInfoStr)
            if (cityInfo.level !== drawCity.level) {
                drawCity.getChildArcs(cityInfo.info.treeID, cityInfo.level)
            }
        }
    })
}
