import {DirData, EntityId} from "../types";
import State from "sucrase/dist/types/parser/tokenizer/state";
import {DirDataAction} from "../actions";

export type DirDataComponent=  {
    entityId:EntityId,

    userIds?:Array<string>,
    dir?:number,
    angle?:number
}

export const newDirData=(action:DirDataComponent):DirData=><DirDataComponent>({
    entityId:action.entityId,

    userIds:action.userIds,
    dir:action.dir,
    angle:action.angle,
})

export const dirDataReducer = (state:State,action:DirDataAction)=>{
    if(state==undefined)
    {
        return new Map()
    }
    return state
}
