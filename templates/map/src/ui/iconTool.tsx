import {IconToolActionType, ICONToolState, UserSettings} from "./types";
import * as React from "react";
import {dispatch, StoreState} from "../store";
import {connect, Provider} from "react-redux";
import {icons} from "../common/iconDdata";
import {CSSProperties, useState} from "react";
import {transform} from "sucrase";
import {IconAction, IconActionType} from "../world/actions";

const h = React.createElement

const mapStateToProps = (state: StoreState /*, ownProps*/) => {
    return {

        iconTool:state.iconToolState
    }
}

const iconTool: (props:{iconTool: ICONToolState} &  any) => any
    = props => {

    // props.iconTool.display ? null : setCurrenIcon("")
    let t={
        top:props.iconTool.y+"px",
        left:props.iconTool.x+"px",
    }
    // console.log(props.iconTool.display)
    return (
        props.iconTool.display?
        <div className="flex flex-col fixed  gap-3" id="iconTool_s" style={t}>
            <div className="flex flex-row gap-2">
                {icons.right.map(f => {
                    const imgStyle: CSSProperties = {
                        backgroundImage: `url(${f.src})`,
                    }
                    return (
                        <div onMouseEnter={() => {

                            props.onChangeIcon(f.name)
                        }} key={f.name}
                             onMouseDown={()=>{
                                 props.onAddIcon({
                                     location:props.iconTool.location,
                                     src:f.src
                                 })
                             }}
                             className="flex flex-row justify-center items-center w-[40px] h-[40px] bg-black/50 hover:bg-black/70">
                            <div className=" bg-cover bg-center" style={imgStyle}></div>
                            <img src={f.src}></img>
                        </div>
                    )
                })}
            </div>
            {
                props.iconTool.c_name !== "" ?
                    <div className="flex flex-col bg-black/50 w-[370px]">
                        {
                            icons.right.filter(f => f.name === props.iconTool.c_name)[0].list.map(f => {
                                const imgStyle: CSSProperties = {
                                    backgroundImage: `url(${f.src})`,
                                    backgroundSize: "100% 100%"
                                }
                                return (
                                    <div className="flex flex-row p-2 hover:bg-black/70 items-center h-[30px]" onMouseDown={()=>{
                                        props.onAddIcon({
                                            location:props.iconTool.location,
                                            src:f.src
                                        })
                                    }} key={f.name}>
                                        <div className="w-[60px] flex flex-row justify-center items-center ">
                                            <img src={f.src}></img>
                                        </div>
                                        <div className="text-white font-bold">{f.name}</div>
                                    </div>
                                )
                            })
                        }
                    </div> : ""
            }

        </div>
            :<></>
    )
}
const mapDispatchToProps = (dispatch: any) => ({

    onChangeIcon:(v:string)=>dispatch({type:IconToolActionType.write,payload:{key: "c_name", value: v }}),
    onAddIcon:(v:object)=>{
        dispatch({type:IconActionType.add,payload:v})
        dispatch({type:IconToolActionType.write,payload:{key: "display", value: false }});
        dispatch({type:IconToolActionType.write,payload:{key: "c_name", value: "" }});

    }
})

const connectedIconTool = connect(
    mapStateToProps,
    mapDispatchToProps
)(iconTool)

export const makeIconTool: (store: any) => any =
    store => h(Provider, {store},
        h(connectedIconTool)
    )

