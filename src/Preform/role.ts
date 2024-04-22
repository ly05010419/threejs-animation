import { AnimationMixer, Clock, Object3D } from 'three'
import { loadGltf, loadFbx, loadObj, loadTexture } from '../ts/loaders'

interface ModelType { type: 'gltf' | 'obj' | 'fbx' }
/**
     * 
     * @param modelUrl 模型路径 
     * @param type 模型类型--选择哪个加载器
     * @param isTexture 是否有贴图
     * @param textureUrl 贴图地址
 */
 class createRole {
    // 角色当前动画 
    RoleActiveAction: any = null
    // 角色上一次动画
    previousAction: any = null
    // 角色的动画器
    RoleMixer: AnimationMixer | null = null
    // 更新角色时钟
    RoleClock = new Clock();
    // 角色动画剪辑
    RoleActions: any = {}
    // 角色速度
    RoleSpeed = 4
    // 角色模型
    RoleModel: Object3D | any = null

    isTexture = false
    textureUrl = ''
    modelUrl = ''
    type = ''
    constructor(modelUrl: string, type: ModelType['type'], isTexture = false, textureUrl = '') {
        this.isTexture = isTexture
        if (this.isTexture) this.textureUrl = textureUrl;
        this.modelUrl = modelUrl
        this.type = type
        // (async ()=>await this.loadModel(modelUrl, type))()
        // 设置贴图

        this.getActions()

    }
    // 加载模型
    public  loadModel() {
        if (this.type === 'fbx') {
            this.RoleModel =  loadFbx(this.modelUrl)
            if (this.isTexture && this.textureUrl) {
                const texture =  loadTexture(this.textureUrl)
                console.log(texture);

            }
        }
    }

    // 加载动画
    getActions() {
        if (this.RoleModel.animations.length !== 0) {
            const animations = this.RoleModel.animations

            // 注册动画器
            this.RoleMixer = new AnimationMixer(this.RoleModel);
            // 收集所有动画  方便后面运动过程中改变动画
            for (let i = 0; i < animations.length; i++) {
                const clip = animations[i];
                const action = this.RoleMixer.clipAction(clip);
                this.RoleActions[clip.name] = action;

                action.clampWhenFinished = true;
                // 是否循环动画  LoopOnce 只播放一次
                // action.loop = LoopOnce;
            }
        }
    }
    playAnimate(clip: string) {
        this.RoleActiveAction = this.RoleActions[clip];
    }

    // 切换动画
    fadeToAction(name: string, duration = 0.5) {
        // 将上一个动画存起来
        this.previousAction = this.RoleActiveAction;
        // 赋予新的动画 
        this.RoleActiveAction = this.RoleActions[name];
        // 如果两个动画不相等 则隐藏上一个动画(渐隐）应该有别的可以试试
        if (this.previousAction !== this.RoleActiveAction) {
            this.previousAction.fadeOut(duration);
        }
        this.RoleActiveAction
            .reset()
            .setEffectiveTimeScale(1)
            .setEffectiveWeight(1)
            .fadeIn(duration)
            .play();

    }
}
export {createRole}