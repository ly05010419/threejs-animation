const geometry = new THREE.BoxGeometry(0.5, y, 0.5);
const material = new THREE.MeshLambertMaterial({ color: 0xff00ff });
const cube = new THREE.Mesh(geometry, material);
for (let i = 0; i < arr.length; i++) {
    const { x, y } = analysisVector(arr[i].x, arr[i].y)
    cube.position.set(x, 0.5, y)
    scene.add(cube.clone())
}
console.log(arr);



     // run(result)
     const geometry = new THREE.BoxGeometry(size, y, size);
     const material = new THREE.MeshLambertMaterial({ color: 0x00ffff });
     const cube = new THREE.Mesh(geometry, material);
     for (let i = 0; i < result.length; i++) {
         const { x, y } = analysisVector(result[i].x, result[i].y)
         cube.position.set(x, 0, y)
         scene.add(cube.clone())
     }