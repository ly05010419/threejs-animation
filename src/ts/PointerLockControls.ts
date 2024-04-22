import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls';
import * as THREE from 'three'
export class HandlePointerLock {

    // 控制器位置
    velocity = new THREE.Vector3();
    // 控制器角度
    direction = new THREE.Vector3();
    // 初始时间
    prevTime = performance.now();
    controls: PointerLockControls
    constructor(model: THREE.Camera, document: HTMLElement) {
        this.controls = new PointerLockControls(model, document);
        this.controls.maxPolarAngle = Math.PI * 0.5
        this.controls.minPolarAngle = Math.PI * 0.5

    }
    updateControls(moveForward: boolean, upDate = true, cb?: () => void, speed = 15) {
        const time = performance.now();
        if (this.controls?.isLocked === true) {

            const delta = (time - this.prevTime) / 1000;

            this.velocity.x -= this.velocity.x * 10.0 * delta;
            this.velocity.z -= this.velocity.z * 10.0 * delta;

            this.direction.z = Number(moveForward) - 0
            this.direction.normalize();

            if (moveForward) this.velocity.z -= this.direction.z * speed * delta;

            // console.log('this.velocity',this.velocity);
            if (upDate) {
                this.controls.moveRight(this.velocity.x * delta);
                this.controls.moveForward(this.velocity.z * delta);
            }
            cb && cb()

        }

        this.prevTime = time;

    }
}