import axios from "axios";
import {ElMessage} from "element-plus";
const baseURL=`http://${window.location.hostname}:8080/`;
// const baseURL=`http://192.168.1.103:8080/`;
console.log(baseURL)

axios.interceptors.response.use(
    res => {

        if (res.data.success === 500) {
            ElMessage({
                showClose: true,
                message: res.data.data.msg,
                type: 'error',
            })

            return Promise.reject(res);
        }
        // 对响应数据做点什么
        return res;
    },
    error => {
        // 对响应错误做点什么
        // if (error.response.status === 401) {
        //     // 处理未授权的情况
        //     // 例如重定向到登录页面
        // }
        return Promise.reject(error);
    }
);
export const setControl = (params:any)=>{
    return axios.post(baseURL+"setControl",params)
}
export const getControl = (param:any)=>{
    return axios.post(baseURL+"getControl",param)
}
export const setMortarRounds = (value:number)=>{
    return axios.get(baseURL+"setMortarRounds?mortarRounds="+value)
}

export const list_fires = (flag:number)=>{
    return axios.get(baseURL + "listFires?flag="+flag)
}
export const list_trajectories = (type:string)=>{
    return axios.get(baseURL + "list_trajectories?type="+type)
}

export const create_squad = (squad_name:string)=>{
    return axios.get(baseURL + "create_squad?squad_name="+squad_name)
}
export const get_bezier_points = (type:string,data:any)=>{
    return axios.post(baseURL + "get_bezier_points?type="+type,data)
}
export const reset_trajectory = (type:string,data:any)=>{
    return axios.post(baseURL + "reset_trajectory?type="+type,data)
}
export const get_settings = ()=>{
    return axios.get(baseURL + "get_settings")
}
export const update_settings = (data:any)=>{
    if(data==""||!data)
        return
    return axios.post(baseURL + "update_settings",data)
}

// AI 服务接口
export const get_ai_api_key = ()=>{
    return axios.get(baseURL + "get_ai_api_key")
}
export const set_ai_api_key = (api_key:string)=>{
    return axios.post(baseURL + "set_ai_api_key", {api_key})
}
export const ai_chat = (message:string)=>{
    return axios.post(baseURL + "ai_chat", {message})
}

// 语音服务配置接口
export const get_voice_config = ()=>{
    return axios.get(baseURL + "get_voice_config")
}
export const set_voice_config = (config: {
    secret_id: string,
    secret_key: string,
    app_id: string,
    hotword_id?: string
})=>{
    return axios.post(baseURL + "set_voice_config", config)
}
