import { Mesh, Object3D, Quaternion, Vector3, Matrix4 } from "three";
import * as THREE from 'three'
import { ConvexObjectBreaker } from 'three/examples/jsm/misc/ConvexObjectBreaker'
/**
 * 
 * @param object 物体本身
 * @param isShape 是否为实体  false为静态
 * @param mass 是否受引力影响
 * @param pos 起始位置
 * @param quat 四元数 表示位置方向角度等
 * @param vel 线性速度
 * @param angVel 线性角度
 * @param pointFrom 自定义碰撞器形状
 * @returns {模型、刚体实体}
 */

// 设置刚体
export function createRigidBody(object: any, isShape: boolean, mass: number, pos: Vector3 | null, quat: Quaternion | null, vel?: Vector3, angVel?: Vector3, pointFrom?: Mesh) {
    const convexBreaker = new ConvexObjectBreaker();

    let Ammo = (window as any).Ammo
    convexBreaker.prepareBreakableObject(object, mass || 0, new THREE.Vector3(), new THREE.Vector3(), false);

    // 设置位子
    if (pos) {
        object.position.copy(pos);
    } else {
        pos = object.position;
    }
    // 设置旋转
    if (quat) {
        object.quaternion.copy(quat);
    } else {
        quat = object.quaternion;
    }
    let physicsShape: any

    // 判断是否支持实体 即是否添加碰撞器 下面的代码是收集碰撞器点位的
    if (isShape) {
        // 如果是自定义碰撞器,则提取自定义碰撞器定点信息
        let shape = pointFrom?.clone() || object.clone()
        // 如果不是组对象，则直接提取
        if (!shape.isGroup) {
            physicsShape = createConvexHullPhysicsShape(shape);
        }
        // 如果是租对象，遍历组内所有成员，并收集顶点信息（这部分要严格限制数据类型，确保能找到顶点信息）
        if (shape.isGroup) {
            let i = 0
            shape.traverse((child: any) => {
                if (child.isMesh) {
                    if (i === 0) {
                        physicsShape = createConvexHullPhysicsShape(child)
                    } else {
                        physicsShape.addPoint(createConvexHullPhysicsShape(child))
                    }
                    i++
                }
            })
        }
    }

    // 创建一个transform对象，用来收集对象的信息 getOrigin、getRotation 等方法
    const transform = new Ammo.btTransform();
    transform.setIdentity();
    // 设置对象初始位置
    transform.setOrigin(new Ammo.btVector3(pos?.x, pos?.y, pos?.z));
    // 设置对象旋转角度
    transform.setRotation(new Ammo.btQuaternion(quat?.x, quat?.y, quat?.z, quat?.w));

    const motionState = new Ammo.btDefaultMotionState(transform);

    // 设置惯性 后续可通过 btRigidBody 对象进行修改 存在模型的userData中
    const localInertia = new Ammo.btVector3(0, 0, 0);

    physicsShape && physicsShape.calculateLocalInertia(mass, localInertia);
    // 注册刚体信息
    const rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, physicsShape, localInertia);
    // 获取刚体实体
    const body = new Ammo.btRigidBody(rbInfo);

    // body.setFriction(0.5);

    // 设置线性运动
    if (vel) {
        body.setLinearVelocity(new Ammo.btVector3(vel.x, vel.y, vel.z));
    }
    // 设置线性角度
    if (angVel) {
        body.setAngularVelocity(new Ammo.btVector3(angVel.x, angVel.y, angVel.z));
    }
    // 将信息收集到模型
    object.userData.physicsBody = body;
    object.userData.collided = true;
    // 设置运动状态  如果不收引力影响则不设置 （底板创建mass参数为false）
    if (mass > 0) {
        body.setActivationState(4);
    }
   


    return { object, body };

}

/**
 * 
 * @param coords 物体所有顶点信息
 * @returns 
 */
// 按照外围点创建碰撞器
export function createConvexHullPhysicsShape(mesh: Mesh) {
    let Ammo = (window as any).Ammo
    const tempBtVec3_1 = new Ammo.btVector3(0, 0, 0);
    // 设置一个收集器
    const shape = new Ammo.btConvexHullShape();
    const matrix = mesh.matrixWorld
    const geometry = mesh.geometry.clone()
    geometry.applyMatrix4(matrix)

    const positions = geometry.getAttribute('position')
    // 定点偏移，也可通过动态传参的方式自定义，目前为不偏移
    const { array, count, itemSize } = positions
    for (let i = 0; i < count; i++) {
        const v3 = new THREE.Vector3().fromArray(array, i * itemSize)
        tempBtVec3_1.setValue(v3.x, v3.y, v3.z);
        const lastOne = (i === count - 1);
        shape.addPoint(tempBtVec3_1, lastOne);
    }
    return shape;

}
