import {EntityId, HasTransform, Icon} from "../types";
import {IconComponent} from "./icon";
import {IconAction, SquareSelectionAction} from "../actions";
import {mat4, vec3} from "gl-matrix";
import {newTransform} from "./transform";

export type SquareSelectionComponent={
    location:HasTransform,
    w:number,
    h:number,
    gapX:number,
    gapY:number
}
export type SelectionComponent = SquareSelectionComponent
export const newSquareSelectionComponent=(action:SquareSelectionComponent):SquareSelectionComponent=><SquareSelectionComponent>({
    location:action.location,
    w:action.w,
    h:action.h,
    gapX:action.gapX,
    gapY:action.gapY
})
type State = Map<EntityId, SquareSelectionComponent>;
export const SelectionReducer = (state:State, action:SquareSelectionAction)=>{

    if(state == undefined){
        /**
         * 0:方形-SquareSelection
         */


        return new Map()

    }

    return state
}
