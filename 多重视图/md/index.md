
![2024-02-02 10.11.43.gif](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/fa8de93e2d28455ab1b24efadc64b7a1~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1440&h=686&s=4911621&e=gif&f=54&b=bfb9b5)

# 前言
摸鱼时发现了这threejs实现的效果，从效果图中可以看出来，在滚动页面的时候，模型在进入不同的场景，或者说进入不同的页面，渲染模式改变了，下面我们一步一步拆解出这种效果是怎么实现的，首先第一步，先找到一个合适的模型，我是直接下载的这个原地址的飞机模型，我们加入一些自己的思考和实践来实现出这个效果。希望大家能够跟着一起做，效果实现起来很简单，但是过程中遇到的小细节，还是需要好好把握一下，本文在 [gitee仓库](https://gitee.com/sunhuapeng/threejs-animation) 有代码，每个节点都有tag，有没讲明白的地方，可以偷看一下代码。

# 准备工作
模型下载下来是`.obj`格式的，这里用`OBJLoader`来加载模型，提取公共方法

```ts
// 加载OBJ模型
export function loadObj(url: string) {
    return new Promise<any>((resolve, reject) => {
        new OBJLoader()
            .load(url, function (object) {
                resolve(object)
            });
    })
}

```

## 加载模型

```ts
// 加载模型
const loadModel = async () => {
    const model = await loadObj('./model/1405+Plane_1.obj')
}
```
## 创建场景

场景创建的代码这里就不赘述了，之前的历史文章也都提到很多次，用到的api包括场景`Scene`,渲染器`WebGLRenderer`,透视相机`PerspectiveCamera`,环境光`AmbientLight`，平行光`DirectionalLight`，轨道控制器`OrbitControls`。

将加载好的模型，添加到场景中，我们得到如下的效果

![2024-02-02 16.32.07.gif](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/90d31ed21178440691a5d85cb34a1832~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1440&h=686&s=461862&e=gif&f=47&b=ff8dc2)

## 渲染两种不同材质的模型
以已经加载的模型为基础，创建出一份线稿文件，并加载到场景中，创建线稿代码

修改一下`loadModel`方法，调用创建线稿的方法

```ts
// 加载模型
const loadModel = async () => {
    const model = await loadObj('./model/1405+Plane_1.obj')
    const line = createLine(model)
    model.traverse((child) => {
        if (child.isMesh) {
            child.material = mat.clone();
        }
    })

    /*
        * 模型加载出来以后再渲染场景 
     */
    renderer && renderer.setAnimationLoop(render);

    // 修改分场景的背景色 方便区分
    scene_1.background = new THREE.Color("#ff99cc")

    scene_1.add(lightGroup)
    scene_1.add(model)
    line.position.x = 100
    scene_1.add(line)
}
```

### createLine

```ts
const createLine = (model) => {
    const edges = new THREE.EdgesGeometry(model.children[0].geometry, 20);
    let line = new THREE.LineSegments(edges);
    return line
}
```

这里线稿的方法写的很粗糙，在之前的文章[threejs渲染高级感可视化涡轮模型](https://juejin.cn/post/7301486808236130345) 中有详细的介绍如何创建不同效果的线稿和如何利用线稿做一些threjs通道方法的应用，感兴趣的同学可以关注一下

这样我们就得到了一个原模型和一个线稿模型

![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/39d1dc65470142d8b849edf1353a1f84~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1588&h=834&s=183094&e=png&b=ff99cc)

以上代码地址：[v.plane.1.0.1](https://gitee.com/sunhuapeng/threejs-animation/tree/v.plane.1.0.1)

# 创建分场景
目前这两个模型是加载在同一个场景`scene_1`下，所以看到的是两个同时存在的模型，下面将详细讲解如何将两个模型分别放在不同的场景，并且同步进行变换
## 创建多个场景
进行多个场景创建，要提前了解一下 WebGLRenderer的API裁剪`setScissor`和裁剪检测`setScissorTest`，
setScissor支持四个参数，可以视作两个对角坐标点的x,y，比如 `setScissor(0,0,window,innerWidht,window,innerHeight)`，前两组坐标视为起点的x和y，后两组视为结束点的x和y的坐标，以这两个点之间连垂直水平的直线组成的矩形区域既视作为裁剪区域

比如下面这张gif图，鼠标移动时，有一个裁剪区域跟随鼠标移动，渲染不同的材质，原理是相同的。


<img src="https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/97e83ccde16a4ffe870e96e5b52151c2~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1440&h=1030&s=6829326&e=gif&f=57&b=cad9d6" alt="2024-02-02 16.54.29.gif" width="50%" />

那么接下来我们要为之前的代码改造一下，首先创建两个场景`scene_1`和`scene_2`。

```ts
var scene_1 = new THREE.Scene()
var scene_2 = new THREE.Scene()
```
接下来要做一个分屏，浏览器窗口的上半部分为scene_1的裁剪区，下半部分为scene_2的裁剪区

为renderer 添加`setScissorTest`属性

```ts
let renderer
if (canvas) {
    renderer = new THREE.WebGLRenderer({ // 渲染器
      ...
    renderer.setScissorTest(true);
}
```

定义屏幕尺寸

```ts
const width = window.innerWidth;
const height = window.innerHeight;

```

计算每个分屏的起点和终点

```ts
let render = () => {
    ...
    renderer.setScissor(0, 0, width, height / 2);
    renderer.render(scene_1, camera);

    renderer.setScissor(0, height / 2, width, height);
    renderer.render(scene_2, camera);
}

```
scene_1的渲染区域将屏幕左上角到屏幕中间裁剪掉，scene_2从屏幕中间到屏幕右下角裁剪掉

将之前创建的线稿模型`line`添加到scene_1

```ts
// 加载模型
const loadModel = async () => {
    ...
    scene_1.add(line)
    scene_1.add(lightGroup)
    scene_2.add(model)
    scene_2.add(lightGroup)
    
}
```

于是你得到了下面这个效果

![2024-02-02 17.09.18.gif](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/505d72fbf79d49fc9e91484633600b9f~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1440&h=1030&s=1447682&e=gif&f=59&b=c7c5fe)

以上代码地址：[v.plane.1.0.2](https://gitee.com/sunhuapeng/threejs-animation/tree/v.plane.1.0.2)

# 结合滚动变换场景
回头看看前面文章开头的效果图，在页面滚动的时候，到了某一个节点才渲染线稿，所以裁切区域肯定不是固定的，要监听页面的滚动，为了能让页面能够滚动，将创建两个屏幕那么大的div，再将渲染3d视图的canvas浮动起，去除背景颜色，让后面的页面内容能够显现出来
## 将背景透明化
要让scene的背景透明化，使用renderer的一个参数即可`alpha: true`

改造一下创建渲染器的方法，并去掉`scene_1`和`scene_2`的背景色

```
/**
 * 渲染器
 */
let renderer
if (canvas) {
    renderer = new THREE.WebGLRenderer({ // 渲染器
        alpha: true,
        ...
    })
    ..
}
```

滚动元素

```html
 <div id="scene_1"></div>
<div id="scene_2"></div>
<!-- 渲染3d -->
<canvas id="threeMain"></canvas>
```

```css
* {
    margin: 0;
    padding: 0;
}
/* 将3d视图浮动起来 */
#threeMain {
    position: fixed;
    top: 0;
    left: 0;
    
}
body {
    overflow: hidden auto;
}
[id^=scene_] {
    width: 100vw;
    height: 100vh;
    margin: auto;
}
#scene_1 {
    background: rgb(255, 243, 189);
}
#scene_2 {
    background: rgb(30, 28, 20);
}
```
由于页面滚动和轨道控制器冲突，我们使用`controls.enabled = false`先暂时将轨道控制器禁用掉


<img src="https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/92433b9975704e9990656aff589c2214~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1440&h=1030&s=315421&e=gif&f=40&b=fff3b5" alt="2024-02-02 17.32.47.gif" width="50%" />

## 监听滚动并修改渲染器的裁剪区域

接下来要做的就是渲染器的 裁剪区域跟随滚动位置而改变

在render中获取到`#scene_2`元素的top值，通过计算，使场景`scene_1`和场景`scene_2`在切割的时候以`#scene_2`的头部位置分割，

### 性能优化

这里简单提一嘴关于性能方面的问题，setAnimationLoop回调方式在`WebGLAnimation.js`文件中也是使用`requestAnimationFrame`实现的，在屏幕刷新时对场景进行绘制的循环，如果项目中没有动画的需求，或者不考虑方法的特殊功能性，可以选择性的不去使用这个方法，像目前这个页面，每次更新都是根据页面的滚动做相应的操作，那完全可以在监听窗口的滚动事件去调用render函数，这样能够保证页面静态时候的不占用过多的浏览器资源

那么我们改造一下代码

loadModal文件

```ts
// 加载模型
const loadModel = async () => {
  ...
    /*
        * 模型加载出来以后再渲染场景 
        * 这里将循环调用注释掉
     */
    // renderer && renderer.setAnimationLoop(render);
    ...
    // 在加载完模型后，第一次调用渲染函数，让场景渲染出来
    render()
}
loadModel()
```

改造render函数

```ts
// 获取#scene_2dom元素
const scene_2_dom = document.querySelector('#scene_2');
// 监听滚动事件
window.addEventListener('scroll', () => {
    if (scene_2_dom) {
       // 在页面滚动的时候调用render渲染函数
        render()
    }
})
let render = () => {
      ...
    if (scene_2_dom) {
        // 获取#scene_2距离屏幕的高度
        let topStr = scene_2_dom.getBoundingClientRect().top
        const top = Number(topStr) || 0

        // 计算场景切割的交叉点
        renderer.setScissor(0, 0, width, height - top);
        renderer.render(scene_1, camera);

        renderer.setScissor(0, height - top, width, height);
        renderer.render(scene_2, camera);
    }
}

```

现阶段效果

![2024-02-02 18.11.34.gif](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/30637bac85bf44b684ef739d118296b9~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1440&h=1030&s=525950&e=gif&f=57&b=fff3b5)



以上代码地址[v.plane.1.0.3](https://gitee.com/sunhuapeng/threejs-animation/tree/v.plane.1.0.3)

# 飞行路径

给飞机设计一条飞行路径，在页面滚动的时候，可以让飞机沿轨道飞行。

模拟出一段飞机运动的轨迹，并组合一下数据，通过`fetch`请求到json的数据

```ts

fetch('./path.json').then((res) => res.json()).then((data) => {
    pathData = data
    console.log(data);
    loadModel()
})
```


![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/5d6a4dab1ac74e1cb02cd0ada06cdd70~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=844&h=292&s=49382&e=png&b=fefefe)

得到大概992条数据，通过计算`#scene_2`的top值和height的值得到一个百分比，如果从一个滚动屏幕的距离为1 那么top/height就是当前滚动的位置，`Math.floor(Math.floor((1 - top / h) * 100) / 100 * pathData.length)`计算出当前飞机应该在的位置的索引，继续改造一下render方法

``` ts
let render = () => {
      ...
    if (scene_2_dom) {
        // 获取#scene_2距离屏幕的高度
        let topStr = scene_2_dom.getBoundingClientRect().top
        const top = Number(topStr) || 0;

        const h = height

        // 获取飞机所在位置的索引
        const index = Math.floor(Math.floor((1 - top / h) * 100) / 100 * pathData.length);
        // 取到飞机的位置信息
        const item = pathData[index]
        if (item) {
            const { position, rotation, } = item
            const line = scene_1.getObjectByName("line")
            // 同时变化model和line的位置和旋转角度
            if (line && position && rotation) {
                line.position.copy(new THREE.Vector3(position.x, position.y, position.z))
                line.rotation.copy(new THREE.Euler(rotation._x, rotation.y, rotation.z, rotation._order))
            }
            const model = scene_2.getObjectByName("model")
            if (model && position && rotation) {
                model.position.copy(new THREE.Vector3(position.x, position.y, position.z))
                model.rotation.copy(new THREE.Euler(rotation._x, rotation.y, rotation.z, rotation._order))
            }
        }
...
      
    }
}
```
# 最终效果

![2024-02-03 14.59.09.gif](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/81c92b5f9b4945db9ae91980c956643f~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1062&h=626&s=408682&e=gif&f=53&b=fff3b6)






