import { ColorRepresentation, Mesh } from "three";

// 随机颜色
export function createRandomColor(): ColorRepresentation | undefined {

    return Math.floor(Math.random() * (1 << 24));

}

export function getRandomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1) + min);
}