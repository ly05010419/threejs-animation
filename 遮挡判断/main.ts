import * as THREE from 'three'
import { T as TS } from './createScene/index'
import MeshBasicNodeMaterial from 'three/examples/jsm/nodes/materials/MeshBasicNodeMaterial'
import { CSS2DRenderer,CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer'

import NodeFrame from 'three/examples/jsm/nodes/core/NodeFrame.js'

import { nodeObject, uniform, Node, NodeUpdateType } from 'three/examples/jsm/nodes/Nodes';

import Renderer from 'three/examples/jsm/renderers/common/Renderer.js'
import {Swizzable} from 'three/examples/jsm/nodes/shadernode/ShaderNode'

const Dom2D = document.querySelector('.dom-2d')
const Dom3D = document.querySelector('.dom-3d')

let moonMassLabel
// new WebGPURenderer({})
const T = new TS(Dom3D, Dom2D)

const geometry = new THREE.BoxGeometry( 1, 1, 1 );
const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
const cube = new THREE.Mesh( geometry, material );
// T.scene.add( cube );

// 平面几何体
const planeGeometry = new THREE.PlaneGeometry(2, 2);
// 创建一个平面网格
const plane = new THREE.Mesh(planeGeometry, new MeshBasicNodeMaterial({ color: 0x00ff00}));
T.scene.add(plane)
// 创建一个球几何体
const sphereGeometry = new THREE.SphereGeometry(0.5);
// 创建球的网格
const sphere = new THREE.Mesh(sphereGeometry, new MeshBasicNodeMaterial({ color: 0xffff00 }));
sphere.position.z = -2
T.scene.add(sphere)

// 创建一个div元素
const moonMassDiv = document.createElement('div');
moonMassDiv.className = 'label';
moonMassDiv.textContent = '7.342e22 kg';
moonMassDiv.style.color = '#fff'
moonMassDiv.style.backgroundColor = 'transparent';

moonMassLabel = new CSS2DObject(moonMassDiv);
moonMassLabel.position.set(0, 0.8, 0);
moonMassLabel.layers.set(1);
sphere.add(moonMassLabel)
/**
 * testObject 需要改变的对象
 * normalLayer 未被遮挡的值
 * occludedLayer  被遮挡时的值
 */
class OcclusionNode extends Node {
    uniformNode:Swizzable;
    testObject:THREE.Object3D; 
    normalLayer:number;
    occludedLayer: number
    constructor(testObject:THREE.Object3D, normalLayer:number, occludedLayer:number) {
        super('vec3');
        /** This method must be overriden when {@link updateType} !== 'none' */
        // 必要代码
        this.updateType = NodeUpdateType.OBJECT;

        // uniform 是 GLSL 着色器中的全局变量。
        this.uniformNode = uniform(1);

        this.testObject = testObject;
        this.normalLayer = normalLayer;
        this.occludedLayer = occludedLayer;

    }

    async update(frame:NodeFrame) {
        if(frame.renderer) {
            // 更新时通过render判断被检测物品是否被遮挡
            const isOccluded = (frame.renderer as Renderer).isOccluded(this.testObject);
            // 如果被遮挡，取之前存的被遮挡的值，如果没有被遮挡，取为被遮挡的值
            const val = isOccluded ? this.occludedLayer : this.normalLayer
            // 修改label的层级位置
            moonMassLabel && moonMassLabel.layers.set(val)
        }
    }

    setup( /* builder */) {

        return this.uniformNode;

    }

}

// 创建一个遮挡实例
const instanceUniform = nodeObject( new OcclusionNode( sphere, 1, 0 ) );

sphere.material.opacityNode = instanceUniform

sphere.occlusionTest = true;
