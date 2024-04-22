import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'
import { Mesh, TextureLoader, Texture, Object3D } from 'three'
const fbxLoader = new FBXLoader();
const textureLoader = new TextureLoader();
const gltfLoader = new GLTFLoader();

/**
 * 
 * @param modelUrl 模型地址
 * @param textureUrl 贴图地址
 * @returns 
 */
// 加载FBX模型
export function loadFbx(modelUrl: string, cb?: (event: ProgressEvent) => void): Promise<Object3D> {
    return new Promise((resolve, reject) => {
        fbxLoader.load(modelUrl, function (loadedModel) {
            resolve(loadedModel)
        }, (a) => {
            cb&&cb(a)
        });
    })
}

// 加载OBJ模型
export function loadObj(url: string) {
    return new Promise<any>((resolve, reject) => {
        new OBJLoader()
            .load(url, function (object) {
                resolve(object)
            });
    })
}

// 加载纹理
export function loadTexture(grid: string) {
    return new Promise<Texture>((resolve, reject) => {
        textureLoader.load(grid, (texture) => {
            resolve(texture)
        });
    })
}

// 加载gltf

export function loadGltf(url: string) {
    return new Promise<Object>((resolve, reject) => {
        gltfLoader.load(url, function (gltf) {
            console.log('gltf',gltf)
            resolve(gltf)
        });
    })
}
export function loadObjMtl(objUrl: string, mtlUrl: string) {
    return new Promise<THREE.Object3D>((resolve, reject) => {

        new MTLLoader()
            .load(mtlUrl, function (materials) {

                materials.preload();

                new OBJLoader()
                    .setMaterials(materials)
                    .load(objUrl, function (object) {
                        resolve(object)
                    });

            });
    })
}