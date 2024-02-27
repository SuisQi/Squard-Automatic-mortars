import axios from "axios";
const baseURL=`http://${window.location.hostname}:8080/`;
// const baseURL=`http://192.168.1.103:8080/`;
console.log(baseURL)
export const setState = (state:boolean)=>{
    return axios.get(baseURL+"setState?state="+(state?1:0))
}
export const getState = ()=>{
    return axios.get(baseURL+"getState")
}
export const setMortarRounds = (value:number)=>{
    return axios.get(baseURL+"setMortarRounds?mortarRounds="+value)
}

export const list_fires = ()=>{
    return axios.get(baseURL + "listFires")
}
export const list_trajectories = (type:string)=>{
    return axios.get(baseURL + "list_trajectories?type="+type)
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
