import * as THREE from 'three'
// 建筑材质
export const otherBuildingMaterial = (color: THREE.Color, opacity = 1) => {
    return new THREE.MeshLambertMaterial({
        color,
        transparent: true,
        opacity
    });
}
// 建筑线条材质
export const otherBuildingLineMaterial = (color: THREE.Color, opacity = 1) => {
    return new THREE.LineBasicMaterial(
        {
            color,
            depthTest: true,
            transparent: true,
            opacity
        }
    )
}
export const floorMaterial = new THREE.MeshLambertMaterial({
    color: 0x0f1418,
    // color: 0x000000,
    // forceSinglePass: true,
    // transparent: true,
    // opacity: 0.4,
    wireframe: true,
})


// new THREE.MeshLambertMaterial({
//     color: 0xffffff,
//     forceSinglePass: true,
//     transparent: true,
//     opacity: 0.4,
//     wireframe: true,
// })