import { CatmullRomCurve3, PointsMaterial, Points, BufferAttribute, BufferGeometry, Color, Vector3 } from 'three'
interface SetFly {
    index: number, // 截取起点
    num: number, // 截取长度 // 要小于length
    points: Vector3[],
    spaced: number // 要将曲线划分为的分段数。默认是 5
    starColor: Color,
    endColor: Color,
    size: number
}
export class Fly {
    animations: Array<() => void> = []
    constructor() {

    }
    /**
     * 
     * @param params 
     * @returns 
     */
    setFly(params: SetFly) {
        // var index = 20; //取点索引位置
        // var num = 15; //从曲线上获取点数量
        var points2 = params.points.slice(params.index, params.index + params.num); //从曲线上获取一段
        var curve = new CatmullRomCurve3(points2);
        
        var newPoints2 = curve.getSpacedPoints(params.spaced); //获取更多的点数
        var geometry2 = new BufferGeometry();
        geometry2.setFromPoints(newPoints2);
        // 每个顶点对应一个百分比数据attributes.percent 用于控制点的渲染大小
        var percentArr = []; //attributes.percent的数据
        for (var i = 0; i < newPoints2.length; i++) {
            percentArr.push(i / newPoints2.length);
        }
        var percentAttribue = new BufferAttribute(new Float32Array(percentArr), 1);
        geometry2.attributes.percent = percentAttribue;
        // 批量计算所有顶点颜色数据
        var colorArr = [];
        for (var i = 0; i < newPoints2.length; i++) {
            var color1 = params.starColor; //轨迹线颜色 青色
            var color2 = params.endColor; //黄色
            var color = color1.lerp(color2, i / newPoints2.length)
            colorArr.push(color.r, color.g, color.b);
        }
        // 设置几何体顶点颜色数据
        geometry2.attributes.color = new BufferAttribute(new Float32Array(colorArr), 3);

        // 点模型渲染几何体每个顶点
        var pointsMaterial = new PointsMaterial({
            size: params.size, //点大小
            vertexColors: true, //使用顶点颜色渲染
            transparent: true,//开启透明计算
            depthTest: true, // 是否与其他模型交叉渲染
            opacity: 0.6
        });
        var flyPoints = new Points(geometry2, pointsMaterial);

        // 修改点材质的着色器源码(注意：不同版本细节可能会稍微会有区别，不过整体思路是一样的)
        pointsMaterial.onBeforeCompile = function (shader) {
            // 顶点着色器中声明一个attribute变量:百分比
            shader.vertexShader = shader.vertexShader.replace(
                'void main() {',
                [
                    'attribute float percent;', //顶点大小百分比变量，控制点渲染大小
                    'void main() {',
                ].join('\n') // .join()把数组元素合成字符串
            );
            // 调整点渲染大小计算方式
            shader.vertexShader = shader.vertexShader.replace(
                'gl_PointSize = size;',
                [
                    'gl_PointSize = percent * size;',
                ].join('\n') // .join()把数组元素合成字符串
            );

            shader.fragmentShader = shader.fragmentShader.replace('#include <output_fragment>', `
            diffuseColor.a = 1.0;
            #endif
            // https://github.com/mrdoob/three.js/pull/22425
            #ifdef USE_TRANSMISSION
            diffuseColor.a *= transmissionAlpha + 0.1;
            #endif
            // 设置透明度变化
            float r = distance(gl_PointCoord, vec2(0.5, 0.5));
            // diffuseColor.a = diffuseColor.a*(1.0 - r/0.5);//透明度线性变化
            diffuseColor.a = diffuseColor.a*pow( 1.0 - r/0.5, 6.0 );//透明度非线性变化  参数2越大，gl_PointSize要更大，可以直接设置着色器代码，可以设置材质size属性
            gl_FragColor = vec4( outgoingLight, diffuseColor.a );
    
            `);
        };
        // 飞线动画
        var indexMax = params.points.length - params.num; //飞线取点索引范围
        function animation() {
            if (params.index > indexMax) {
                params.index = 0;
            }
            params.index += 1
            points2 = params.points.slice(params.index, params.index + params.num); //从曲线上获取一段
            var curve = new CatmullRomCurve3(points2);
            var newPoints2 = curve.getSpacedPoints(params.spaced); //获取更多的点数
            geometry2.setFromPoints(newPoints2);
        }
        this.animations.push(animation)
        return flyPoints

    }
    upDate() {
        this.animations.forEach((fun: () => void) => {
            try {
                fun()
            } catch (error) {
                console.log(error);

            }
        })
    }
}