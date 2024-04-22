/**
 * 
 * @param deltaTime 更新时间
 * @param physicsWorld 物理世界，所有的物理元素都在这里
 * @param rigidBodies 存放刚体的数组
 */

import { Object3D, Vector3 } from "three";

const gravityConstant = 17.8; // 重力常数

export let physicsWorld: any
export let dispatcher: any

// 初始化物理引擎
export function initPhysics() {
    let Ammo = (window as any).Ammo
    // 注册碰撞器
    let collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
    // 注册碰撞器内容 之后的碰撞检测会使用到
    dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration);
    let broadphase = new Ammo.btDbvtBroadphase();
    let solver = new Ammo.btSequentialImpulseConstraintSolver();
    // 注册物理世界  后续受物理作用的模型都需要放在这里，供ammp更新
    physicsWorld = new Ammo.btDiscreteDynamicsWorld(dispatcher, broadphase, solver, collisionConfiguration);
    // 设置初始化重力，重力是向下作用力，所以在这里取反，其实初始值设置成负数是同样的
    physicsWorld.setGravity(new Ammo.btVector3(0, - gravityConstant, 0));

 

}

// 更新物理引擎
/**
 * 
 * @param deltaTime 更新时间
 * @param rigidBodies 刚体
 * @param cb 回调 pos：在重力影响下导致的位置变换   dir：在物理引擎影响下的角度变化 objThree 当前被影响的模型
 */
export function updatePhysics(deltaTime: number, rigidBodies: Object3D[], cb?: (pos: Vector3, dir: Vector3, objThree: Object3D) => void) {
    let Ammo = (window as any).Ammo

    const transformAux1 = new Ammo.btTransform();

    // Step world
    physicsWorld.stepSimulation(deltaTime, 10);

    // Update rigid bodies

    for (let i = 0, il = rigidBodies.length; i < il; i++) {

        const objThree = rigidBodies[i];

        const objPhys = objThree.userData.physicsBody;
        const PhysUpdate = objThree.userData.PhysUpdate;
        const ms = objPhys.getMotionState();
        // console.log('objPhys', objPhys);
        // getRollingFriction 滚动摩擦力

        if (ms) {

            ms.getWorldTransform(transformAux1);
            
            const p = transformAux1.getOrigin();
            
            const q = transformAux1.getRotation();

            const pl = (objThree.userData.positionLock || [])
            let px = p.x()
            let py = p.y()
            let pz = p.z()
            for (let i = 0; i < pl.length; i++) {
                const dir = pl[i];
                if (dir === 'x') px = 0
                if (dir === 'y') py = 0
                if (dir === 'z') pz = 0
            }


            // console.log('objThree.userData.rotateLook',objThree.userData.rotateLock);

            const rl = (objThree.userData.rotateLock || [])
            let rx = q.x()
            let ry = q.y()
            let rz = q.z()
            let rw = q.w()
            for (let i = 0; i < rl.length; i++) {
                const dir = rl[i];
                if (dir === 'x') rx = 0
                if (dir === 'y') ry = 0
                if (dir === 'z') rz = 0
                if (dir === 'w') rw = 0
            }

            if (PhysUpdate) {
                objThree.position.set(px, py, pz);
                // 如果方向锁定传的是true 则不进行方向修改
                if (rl !== true) {
                    objThree.quaternion.set(rx, ry, rz, rw);
                }

            } else {
                cb && cb(new Vector3(px, py, pz), new Vector3(rx, ry, rz), objThree);
            }

            objThree.userData.collided = false;

        }

    }

}
