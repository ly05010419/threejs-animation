import {loadGltf,loadFbx} from '../ts/loaders'

export async function createPlayer() {
    const Player = await loadGltf('src/assets/models/robot/RobotExpressive.glb')
    return Player
}