import * as THREE from 'three'
import { otherBuildingLineMaterial } from '../materials'
/**
 * 
 * @param object 模型
 * @param lineGroup 线组
 * @param meshMaterial 模型材质
 * @param lineMaterial 线材质
 */
export const changeModelMaterial = (mesh: THREE.Mesh, meshMaterial: THREE.MeshBasicMaterial, lineMaterial: THREE.LineBasicMaterial, deg = 1): any => {
    if (mesh.isMesh) {
        if (meshMaterial) mesh.material = meshMaterial
        // 以模型顶点信息创建线条
        const line = getLine(mesh, deg, lineMaterial)
        const name = mesh.name + '_line'
        line.name = name
        mesh.add(line)
    }
}
// 通过模型创建线条
export const getLine = (object: THREE.Mesh, thresholdAngle = 1, lineMaterial: THREE.LineBasicMaterial): THREE.LineSegments => {
    // 创建线条，参数为 几何体模型，相邻面的法线之间的角度，
    var edges = new THREE.EdgesGeometry(object.geometry, thresholdAngle);
    var line = new THREE.LineSegments(edges);
    if (lineMaterial) line.material = lineMaterial
    return line;
}