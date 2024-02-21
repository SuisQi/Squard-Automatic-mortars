import * as React from "react";
import { Provider, connect  } from 'react-redux'
import { createSession, join, sendMessage } from '../replication_ws/actions';
import { canvas2world, event2canvas, standardFormatKeypad, world2keypadStrings } from "../world/transformations";
import { getHeight } from "../heightmap/heightmap";

const h = React.createElement
// @ts-ignore
const div = <P, C>(props: P, children?: C) => h("div", props, children)

const tooltip: (props:any) => any
  = props => {
    const worldPos = canvas2world(props.camera, props.uiState.mousePosition);
    const keypad = world2keypadStrings(props.minimap, worldPos)
    const height = getHeight(props.heightmap, worldPos)
    return h("div", {className: ""}, [
      `${standardFormatKeypad(keypad)} |  ${(height/100).toFixed(1)}m`,
      //`pos: ${worldPos.map(Math.floor)}`
    ])
}

const mapStateToProps = (state: any /*, ownProps*/) => {
  return {
    uiState: state.uiState,
    minimap: state.minimap,
    heightmap: state.heightmap,
    camera: state.camera
  }
}

const mapDispatchToProps = (dispatch: any) => ({
})

const connectedTooltip = connect(
  mapStateToProps,
  mapDispatchToProps
)(tooltip)

export const makeTooltip: (store: any) => any =
  store =>  h(Provider, {store},
    h(connectedTooltip)
  )
