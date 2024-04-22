import { loadFbx, loadObj, loadTexture } from "./loaders";
import { Mesh, Vector3, Matrix4, Vector4, SkinnedMesh as sdn, Skeleton, SkeletonHelper, Bone, CylinderGeometry, Box3, Group, MeshPhongMaterial, Color, TextureLoader, RepeatWrapping } from 'three'
interface ModelTypes {
    rigidBodies: Mesh[],
    meshs: Mesh[]
}
export const loadModels = async (scale = new Vector3(1, 1, 1)): Promise<ModelTypes> => {
    const rigidBodies: Mesh[] = [];
    const meshs: Mesh[] = []
    // 立方体模型
    const Baum1: any = await loadFbx('src/assets/models/box/Lava.fbx')
    const mesh = Baum1.children[0].clone()
    mesh.geometry.applyMatrix4(new Matrix4().makeScale(0.3, 0.3, 0.3))
    mesh.material = new MeshPhongMaterial({
        map: await loadTexture('src/assets/textures/box/Erde.png')
    })
    rigidBodies.push(mesh)

    // const Baum2 = await loadFbx('src/assets/models/box/Holztreppe.fbx')
    // const mesh2 = Baum2.children[0].clone()
    // mesh2.geometry.applyMatrix4(new Matrix4().makeScale(0.4, 0.4, 0.4))
    // mesh2.material = new MeshPhongMaterial({
    //     map: await loadTexture('src/assets/textures/box/Eisenerz.png')
    // })
    // rigidBodies.push(mesh2)

    return { rigidBodies, meshs }
}
