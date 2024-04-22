import { requestData } from "../src/request";

interface PayLoadData {
    arcs: number[][];
    bbox: number[];
    object: any;
    type: string;
    _flagEd: number
}
interface MapData {
    children: any;
    name: string;
    parent: string;
    payload: PayLoadData;
    treeID: string;
    treeName: string;
    version?: string
}
let hzMap: any
let hzData: MapData

// 获取杭州地图
async function getHZData() {
    const res = await requestData('./json/层级.json') as any
    hzData = res.data
    return res?.data
}
// 获取杭州地图映射
async function getHZMapData() {
    const res = await requestData('./json/层级映射.json') as any
    hzMap = res.data
    return hzMap
}

// 通过treeID递归到要找的数据
function recursionData(data, treeID: string) {
    const keys = Object.keys(data)
    if (keys.indexOf(treeID) !== -1) {
        return data[treeID]
    } else {
        let datas = null
        keys.forEach((key) => {
            datas = recursionData(data[key].children, treeID)
        })
        
        return datas
    }
}

// 根据treeID获取数据  下钻和返回时可用
async function getArcsByTreeID(treeID: string) {
    if (hzData.treeID === treeID) {
        return hzData
    } else {
        return recursionData(hzData.children, treeID)
    }
}

export { getHZData, getHZMapData, getArcsByTreeID }