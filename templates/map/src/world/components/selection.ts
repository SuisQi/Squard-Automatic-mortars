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
export type LineSelectionComponent={
    startLocation:HasTransform,
    endLocation:HasTransform,
    gap:number
}
export type SelectionComponent = SquareSelectionComponent|LineSelectionComponent
export const newSquareSelectionComponent=(action:SquareSelectionComponent):SelectionComponent=><SquareSelectionComponent>({
    location:action.location,
    w:action.w,
    h:action.h,
    gapX:action.gapX,
    gapY:action.gapY,

})
export const newLineSelectionComponent=(action:LineSelectionComponent):SelectionComponent=><LineSelectionComponent>({
    startLocation:action.startLocation,
    endLocation:action.endLocation,
    gap:action.gap

})
type State = Map<EntityId, SquareSelectionComponent>;
export const SelectionReducer = (state:State, action:SquareSelectionAction)=>{

    if(state == undefined){
        /**
         * 0:方形-SquareSelection
         * 1:直线-LineSelection
         */


        return new Map()

    }

    return state
}
