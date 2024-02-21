import axios from "axios";
import { notification } from 'antd';
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
        if (error.response.status === 401) {
            // 处理未授权的情况
            // 例如重定向到登录页面
        }
        return Promise.reject(error);
    }
);
const baseURL = "http://127.0.0.1:8080/"
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
