import axios from "axios";
import { notification } from 'antd';
import {WeaponType} from "../world/components/weapon";
axios.interceptors.response.use(
    res => {
        if (res.data.success !== 0) {
            notification.error({
                message: '警告',
                description: res.data.message,
            });
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
const baseURL = `http://${(typeof window!=="undefined")?window.location.hostname:self.location.hostname}:8080/`;
export const save = (data: any) => {
    return axios.post(baseURL + "save", data)
}
export const remove = (data: any) => {
    return axios.post(baseURL + "remove", data)
}

export const update = (data: any) => {
    return axios.post(baseURL + "update", data)
}
export const remove_all = () => {
    return axios.get(baseURL + "remove_all")
}
export const set_session_userId = (userId:string) => {
    return axios.get(baseURL + "set_session_userId?userId="+userId)
}
export const set_sessionId = (sessionId:string) => {
    return axios.get(baseURL + "set_sessionId?sessionId="+sessionId)
}
export const set_server_ip = (address:string) => {
    return axios.get(baseURL + "set_server_ip?address="+address)
}
export const set_map=(filename:string)=>{
    return axios.get(baseURL + "set_map?file_name="+filename)
}
export const set_weapon=(v:WeaponType)=>{
    return axios.get(baseURL + "set_weapon?WeaponType="+v)
}
