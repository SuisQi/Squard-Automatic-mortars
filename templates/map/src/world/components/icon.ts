import {EntityId, HasTransform, Icon, World} from "../types";
import {EntityComponent} from "./entity";
import {StoreAction} from "../../store";
import {IconAction, IconActionType} from "../actions";
import {SetAction} from "./types";
import {SVGBuffer} from "../../common/svgBuffer";
export type IconComponent={
    entityId:EntityId,
    src:string,
    image:HTMLImageElement
}

export const newIcon=(action:IconComponent):Icon=><IconComponent & HasTransform>({
    entityId: action.entityId,
    src: action.src,
    image:action.image

})
type State = Map<EntityId, IconComponent>;
export const iconReducer = (state:State, action:IconAction)=>{

    if(state == undefined){
        return new Map()
    }

    return state
}
