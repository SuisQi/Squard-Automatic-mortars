import { UIState, UIStateActionType } from "../ui/types";
import { Get, WriteAction } from "./types";

/*
export const newWriteAction = <T, S, K extends keyof S> (type: T, key: K, value: S[K]) => 
  ({type, payload: {key, value}})

const wa = newWriteAction<any, UIState, any>(UIStateActionType.write, "mouseDown", 1)
*/