import TWEEN, { Tween } from '@tweenjs/tween.js'

let tn

let flag = true
// 循环渲染
function animate() {
    requestAnimationFrame(animate);
    if (flag) {
        TWEEN && TWEEN.update();
    }
}

animate()

const startBtn = document.querySelector('#start')
const pauseBtn = document.querySelector('#pause')
const box = document.querySelector('#box')
if (startBtn) {
    startBtn.addEventListener('click', () => {
        
        flag = true
        tn.resume()
    })
}
if (pauseBtn) {
    pauseBtn.addEventListener('click', () => {
        flag = false
        tn.pause()
        console.log(tn);
       
    })
}



tn = new TWEEN.Tween({ left: 0 })
    .to({ left: 100 }, 10000)
    .onUpdate((v: any) => {
        if (box) {
            box.style.left = `${v.left}%`
        }
    })
    .onComplete(() => {
        console.log('结束');
    }).start()