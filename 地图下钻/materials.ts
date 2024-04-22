import * as THREE from 'three'

// 区域材质
export const material = new THREE.MeshBasicMaterial({
    color: 0x61bfcb,
    transparent: true,
    opacity: 0.8
});
// 区域边线材质
export const lineMaterial = new THREE.LineBasicMaterial({
    color: 0xffffff
});
// 区域设置
export const extrudeSettings = {
    steps: 1,
    depth: 0.05,
    bevelEnabled: false,
    bevelThickness: 0,
    bevelSize: 0,
    bevelOffset: 0,
    bevelSegments: 0
};