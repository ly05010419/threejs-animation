import { loadFbx } from "../../src/ts/loaders"
export const animations: any = []
export const getAnimations = async (url: string, name) => {
    const module = await loadFbx(url)
    if (module.animations[0]) {
        module.animations[0].name = name
        animations.push(module.animations[0])
    }

}