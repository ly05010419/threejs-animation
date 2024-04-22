import { init, render, scene, camera, disposeMaterial } from "./createScene";
import { castShadow } from "./utils/physics";
import { createVehicle } from './createVehicle';
import { loadGltf } from '../src/ts/loaders'
import { initPhysics, physicsWorld, rigidBodies } from "./utils/physics";
import * as THREE from 'three'
import { createRigidBody } from "./utils/rigidBody";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const loader = new GLTFLoader();
const wheels = new THREE.Group()
const vehicleBody = new THREE.Object3D()
let AmmoLib: any = null, vehicle: THREE.Object3D = new THREE.Object3D()
const initAmmojs = () => {
    (window as any).Ammo().then(async function (lib: any) {
        (window as any).Ammo = lib
        AmmoLib = lib
        initPhysics();
        init()
        createFloor()

        let mouse = new THREE.Vector2(); //鼠标位置
        var raycaster = new THREE.Raycaster();

        window.addEventListener("click", (event) => {
            mouse.x = (event.clientX / document.body.offsetWidth) * 2 - 1;
            mouse.y = -(event.clientY / document.body.offsetHeight) * 2 + 1;
            raycaster.setFromCamera(mouse, camera);
            var raylist = raycaster.intersectObjects(vehicle.children);
            console.log(raylist)
            if(raylist.length>1){
                const mesh = raylist[0].object
                mesh.visible = false
                console.log(mesh)
            }
           
        });
        const { group, chassisMesh } = createVehicle(new THREE.Vector3(0, 4, 0), new THREE.Quaternion(0, 0, 0, 1), physicsWorld, vehicle)
        scene.add(group)
        animate()
    });
}

const animate = () => {
    render()
    requestAnimationFrame(animate);
}


initAmmojs()

const createFloor = () => {
    // 底板
    const PlaneSize = 1000

    var shadowMaterial = new THREE.ShadowMaterial({ opacity: 0.2, transparent: false });
    const ground = new THREE.Mesh(new THREE.BoxGeometry(PlaneSize, 0.5, PlaneSize, 1, 1, 1), shadowMaterial);
    ground.receiveShadow = true;

    const { object, body } = createRigidBody(ground, true, 0, null, null)
    object.name = 'floor'
    body.setFriction(1)

    physicsWorld.addRigidBody(body);
    setPointerBttVec(object, body)
    rigidBodies.push(object)

    scene.add(object)
}

// 设置物体指针
const setPointerBttVec = (object: Object, body: any) => {
    const btVecUserData = new AmmoLib.btVector3(0, 0, 0);
    btVecUserData.threeObject = object;
    body.setUserPointer(btVecUserData);
}