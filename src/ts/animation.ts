import * as THREE from 'three'
export class HandleAnimation {
    // 主角当前动画 
    playerActiveAction: any = null
    // 主角上一次动画
    previousAction: any = null
    // 主角所有的动画
    actions: any = []
    // 主角的动画器
    playerMixer: THREE.AnimationMixer
    // 更新主角时钟
    playerClock = new THREE.Clock();

    // 模型
    model: THREE.Object3D

    animations: any[]
    // 骨骼
    cone: THREE.Mesh | undefined

    modelSize = new THREE.Vector3();
    box = new THREE.Box3()

    follow = true
    animateNameList: string[] = []

    // 当前动作
    thatState = ''
    // 单次动作名称合集
    onceAni: string[] = []
    constructor(model: THREE.Object3D, animations: any[]) {
        this.model = model
        this.box.expandByObject(this.model)
        this.box.getSize(this.modelSize)
        this.playerMixer = new THREE.AnimationMixer(this.model);

        this.playerMixer.addEventListener('finished', this.restoreState.bind(this))

        this.animations = animations
        this.getMovement()
    }

    // 获取所有动画
    getMovement() {
        for (let i = 0; i < this.animations.length; i++) {

            const clip = this.animations[i];

            const action = this.playerMixer.clipAction(clip);

            action.clampWhenFinished = true;
            this.animateNameList.push(clip.name)
            this.actions[clip.name] = action

        }
    }
    // 创建骨骼
    createSkeleton() {
        const skeleton = new THREE.SkeletonHelper(this.model);
        skeleton.visible = true;
        return skeleton
    }


    /**
     * 
     * @param name 下一个动画名称
     * @param duration 过度时间
     */
    fadeToAction(name: string, duration = 0.5) {
        console.log('this.onceAni',this.onceAni)
        const index = this.onceAni.findIndex((once: string) => once === name)
        if (index === -1) this.thatState = name
        
        this.previousAction = this.playerActiveAction;
        this.playerActiveAction = this.actions[name];
        if (this.previousAction !== this.playerActiveAction) {
            this.previousAction.fadeOut(duration);
        }

        this.playerActiveAction
            .reset()
            .setEffectiveTimeScale(1)
            .setEffectiveWeight(1)
            .fadeIn(duration)
            .play();

    }

    play(name: string) {
        this.playerActiveAction = this.actions[name];
        this.playerActiveAction.play();
        this.thatState = name
    }
    // 过滤一次性动画
    once(onceAni: string[]) {
        for (let i = 0; i < onceAni.length; i++) {
            const name = onceAni[i]
            if (this.actions[name]) {
                const action = this.actions[name]
                action.clampWhenFinished = true;
                action.loop = THREE.LoopOnce;
            }
        }
        this.onceAni = onceAni

    }
    // 某个动画结束后 播放之前的循环动画
    restoreState() {
        this.playerMixer.removeEventListener('finished', this.restoreState.bind(this));
        this.fadeToAction(this.thatState, 0.2);
    }
    // 更新
    upDate(camera: THREE.PerspectiveCamera, y = 5, offset = 2) {
        const dt = this.playerClock.getDelta();
        if (this.playerMixer) this.playerMixer.update(dt);
        if (camera) {

            let xbotV3 = new THREE.Vector3();

            this.model.getWorldPosition(xbotV3);

            const playerDirection = new THREE.Vector3()
            this.model.getWorldDirection(playerDirection);
            playerDirection.normalize();
            playerDirection.multiplyScalar(y)
            const cv = playerDirection.negate().setY(this.modelSize.y + offset).add(xbotV3)
            if (this.follow) {
                camera.position.copy(cv);
            }
            camera.lookAt(xbotV3.clone().setY(cv.y - offset))

            camera.updateProjectionMatrix()
        }
    }

}