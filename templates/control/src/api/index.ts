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
