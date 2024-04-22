import axios from 'axios'

export const requestData = (url: string) => {
    return new Promise((reslove, rej) => {
        axios.get(url).then((res) => {
            reslove(res)
        }).catch((error) => {
            rej(error)
        })

    })

}