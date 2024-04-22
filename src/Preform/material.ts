import { MeshLambertMaterial, ColorRepresentation } from 'three'
import { loadTexture } from '../ts/loaders';
// 返回一个材质对象
export function getBasicMaterial(color?: ColorRepresentation | undefined, mapUrl?: string,opt={}) {
    return new Promise<MeshLambertMaterial>(async (resolve, reject) => {
        const material = new MeshLambertMaterial({ color: color || '#ffffff',...opt });
        if (mapUrl) {
            material.map = await loadTexture(mapUrl)
        }
        resolve(material)
    })
}