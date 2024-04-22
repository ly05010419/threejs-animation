# 前言

前一段时间发了几篇threejs的文章，根据小伙伴们的反馈，总结了一下关于镜头位置的痛点，就是加载不同规格的模型后，相机位置需要一点点试才能找到合理的位置，我之前写的也是固定的相机位置，下面的案例，通过创建一些不同规格的模型，通过点击模型，让镜头找到合适的位置，因为在项目中大多用的是透视相机，所以下面案例使用 [透视相机（PerspectiveCamera）](https://threejs.org/docs/index.html?q=camera#api/zh/cameras/PerspectiveCamera)、[轨道控制器（OrbitControls）](https://threejs.org/docs/index.html?q=cont#examples/zh/controls/OrbitControls)的API进行演示。

# 正文

## 创建模型

首先创建几个不同尺寸和颜色的模型

![创建模型](https://gitee.com/sunhuapeng/threejs-animation/raw/master/%E7%9B%B8%E6%9C%BA%E9%80%82%E9%85%8D%E4%B8%8D%E5%90%8C%E5%B0%BA%E5%AF%B8%E6%A8%A1%E5%9E%8B/assets/1-1.jpg)





```typescript
const T = new TS(threeCanvas)

const group = new THREE.Group();

// 球体
const sphereGeometry = new THREE.SphereGeometry(40, 32, 16);
const sphereMaterial = new THREE.MeshLambertMaterial({ color: 0x0000ff });
const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
sphere.position.x = -100
group.add(sphere);


// 圆柱体
const cylinderGeometry = new THREE.CylinderGeometry(20, 20, 50, 32);
const cylinderMaterial = new THREE.MeshLambertMaterial({ color: 0xff0000 });
const cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);

group.add(cylinder);
// 立方体
const cubeGeometry = new THREE.BoxGeometry(10, 10, 10);
const cubeMaterial = new THREE.MeshLambertMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
cube.position.x = 100

group.add(cube);

T.scene.add(group)
```

## 创建场景

### 创建相机

```typescript
const cameraPos = new THREE.Vector3(0, 0, 180)
this.camera = new THREE.PerspectiveCamera(75, this.width / this.height, 1, 20000);
this.camera.position.copy(cameraPos)
this.scene.add(this.camera);
```

### 创建控制器

```typescript
 this.controls = new OrbitControls(this.camera, this.renderer.domElement)
  // 开始的时候记录摄像头位置
  this.controls.addEventListener('start', () => {
      this.controlsStartPos.copy(this.camera.position)
  })

  // 结束的时候计算当前镜头位置和start时的镜头位置距离，如果为0则表示没移动过镜头(鼠标)
  this.controls.addEventListener('end', () => {
      this.controlsMoveFlag = this.controlsStartPos.distanceToSquared(this.camera.position) === 0
  })

  this.controls.addEventListener('change', () => {

  })
```

`controlsMoveFlag`用来判断当前点击是否有效

### 创建射线检测

``` typescript
 /**
     * 
     * @param children 被检测物体
     * @param callback 射线回调
     */
    ray(children: THREE.Object3D[], callback: (mesh: THREE.Intersection<THREE.Object3D<THREE.Event>>[]) => void) {
      let mouse = new THREE.Vector2(); //鼠标位置
      // 创建射线检测
      var raycaster = new THREE.Raycaster();
      window.addEventListener("click", (event) => {
          // 如果控制器未移动 调用检测
          if (!this.controlsMoveFlag) {
              mouse.x = (event.clientX / document.body.offsetWidth) * 2 - 1;
              mouse.y = -(event.clientY / document.body.offsetHeight) * 2 + 1;
              raycaster.setFromCamera(mouse, this.camera);
              const rallyist = raycaster.intersectObjects(children);
              callback && callback(rallyist)
          }
      });
  }
```



### 使用射线

```typescript
const rayCallback = (mesh: THREE.Intersection<THREE.Object3D<THREE.Event>>[]) => {
    console.log('mesh', mesh[0].object)
}
T.ray(group.children, rayCallback)
```

从`T.ray`方法添加一个`rayCallback`回调方法并将检测到的物体的第一个打印出来

![使用射线](https://gitee.com/sunhuapeng/threejs-animation/raw/master/%E7%9B%B8%E6%9C%BA%E9%80%82%E9%85%8D%E4%B8%8D%E5%90%8C%E5%B0%BA%E5%AF%B8%E6%A8%A1%E5%9E%8B/assets/%E4%BD%BF%E7%94%A8%E5%B0%84%E7%BA%BF.gif)



## 计算相机位置

使用[Box3](https://threejs.org/docs/index.html?q=bo#api/zh/math/Box3)获取模型尺寸信息，包含边缘位置、尺寸、中心位置等信息

改造一下`rayCallback` 方法，在点击的时候获取信息

````typescript
...
if (mesh.length !== 0) {
    box3.expandByObject(mesh[0].object)
    const size = new THREE.Vector3()
    const center = new THREE.Vector3()
    box3.getCenter(center)
    box3.getSize(size)
    console.log(size, center, box3.min, box3.max)
}
...
````



size和center都是通过min和max计算得来的，可以看一下源码 `three.js/src/math/Box3.js`

```javascript
getCenter( target ) {

  return this.isEmpty() ? target.set( 0, 0, 0 ) : target.addVectors( this.min, this.max ).multiplyScalar( 0.5 );

}

getSize( target ) {

  return this.isEmpty() ? target.set( 0, 0, 0 ) : target.subVectors( this.max, this.min );

}
```

`subVectors`将向量A-B，得到最大结果，而min和max是通过模型的顶点信息的position属性获取，部分源码：

```
...
const positionAttribute = geometry.getAttribute( 'position' );

			// precise AABB computation based on vertex data requires at least a position attribute.
			// instancing isn't supported so far and uses the normal (conservative) code path.

			if ( precise === true && positionAttribute !== undefined && object.isInstancedMesh !== true ) {

				for ( let i = 0, l = positionAttribute.count; i < l; i ++ ) {

					if ( object.isMesh === true ) {

						object.getVertexPosition( i, _vector );
...
```

感兴趣的同学可以自行翻阅，这里点到为止



以圆柱体举例

```json
{
    "size":{
        "x":40,
        "y":50,
        "z":40
    },
    "center":{
        "x":0,
        "y":0,
        "z":0
    },
    "min":{
        "x":-20,
        "y":-25,
        "z":-20
    },
    "max":{
        "x":20,
        "y":25,
        "z":20
    }
}
```



## 计算camera相关数据

这是圆柱体的box3所含的信息，对于相机来说，影响成像范围和角度的，首先是`camera.fov`，其次是`camera.position`，`camera.lookAt`，从控制器来说，`controls.target`也是可以影响成像的，基于以上信息，center对于camera来说可以设置lookAt让camera正对着模型，size.x和size.y获取最大值，作为最长边界，

