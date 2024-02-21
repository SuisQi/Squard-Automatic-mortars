import * as React from "react";
import { Provider, connect  } from 'react-redux'
import { newUserSettingsWriteAction as writeUserSettings} from './actions';
import { Store0 } from '../store';
import { toggleButton } from '../common/toggleButton';
import { drawAll } from '../render/canvas';
import { useState } from 'react';
import { createSession, join, leave, sendMessage } from '../replication_ws/actions';
import { DataConnection } from "peerjs";
import { Session, User } from "../replication_ws/types";
import { UserSettings } from "./types";
import { World } from "../world/types";

const h = React.createElement
// @ts-ignore
const div = <P, C>(props: P, children?: C) => h("div", props, children)

const get_default_websocket_address = () => process.env.NODE_ENV === "development" ? "ws://" + window.location.hostname + ":1234" : "wss://squadmortar.xyz/ws";
const server_address_sanitization = (input: string) => input.trim();
const session_id_sanitization = server_address_sanitization;

const rightPanel: (props:any) => any
= props => {
  return h("div", {className: "rightPanel flexItem"}, [
    sessionComponent(props)
  ])

}


export const sessionComponent: (props:any) => any
  = props => {
    const [sessionId, setSessionId] = useState("");
    const [serverAddress, setServerAddress] = useState(get_default_websocket_address());
    const [editingUserName, setEditingUserName] = useState(false);
    return h(React.Fragment, {}, [
      div({className: "flexRow", style: {width: "100%"}}, [
        div({style: {paddingTop: "3px"}}, ["Server(beta)"]),
        div({className: "v10"}, []),
        div({
          className: "divButton",
          title: "reset server to default",
          onClick: () => setServerAddress(get_default_websocket_address())
        }, "R"),
      ]),
      div({className: "v2"}),
      div({className: "flexRow", style: {justifyContent: "space-between"}}, [
        div({className: "flexItem", style: {height: "22px", width: "100%"}},
          h("textarea", {className:"sessionTextInput", value: serverAddress, onChange: (e) => setServerAddress(server_address_sanitization((<HTMLTextAreaElement>e.target).value))})
        ),
      ]),

      div({className: "v2"}),
      div({className: "flexRow", style: {}}, [
        div({style: {paddingTop: "3px"}}, ["Session"]),
      ]),

      props.sessionId ?
      h(React.Fragment, {}, [
        div({className: "v2"}),
        div({className: "flexRow", style: {}}, [
          h("div", {className: "flexItemFill"}, props.sessionId)
        ])
      ])
      : null,
      div({className: "v2"}),
      div({className: "flexRow"}, [

      ]),
      div({className: "v2"}),
      div({className: "flexRow", style: {justifyContent: "space-between", width: "100%"}}, [
        div({className: "flexItem", style: {height: "22px", width: "100%"}},
          h("textarea", {className:"sessionTextInput", value: sessionId, onChange: (e) => setSessionId(session_id_sanitization((<HTMLTextAreaElement>e.target).value))})
        ),
      ]),
      div({className: "v2"}),
      div({className: "flexRow", style: {justifyContent: "space-between"}}, [
        h("div", {className: "flexItem divButton", style:{width: "100%"},
          onClick: () => props.newSession(serverAddress, props.world)
        }, "Create"),
        div({className: "h2"}),
        h("div", {className: "flexItemFill divButton ", onClick: () => props.join(serverAddress, sessionId)}, "Join"),
        div({className: "h2"}),
        h("div", {className: "flexItemFill divButton", onClick: () => props.leave(),}, "Leave"),
      ]),
      props.sessionId ? h(React.Fragment, {}, [
        div({className: "v2"}),
        div({className: "flexRow", style: {}}, "Users"),
        userList({editingUserName, setEditingUserName, ...props})

      ]) : null,
      /*
      div({className: "white"}, "hello"),
      div({className: "green"}, "hello"),
      div({className: "yellow"}, "hello"),
      div({className: "red"}, "hello"),
      div({className: "blue"}, "hello"),
      */
  ])
}

const userList = (props: {users: Array<User>, userId: string | null, editingUserName: boolean, setEditingUserName: (newValue: boolean) => any} & any) => {
  return div({className: "flexRow", style: {overflowX: "hidden", maxHeight: "100px"}}, [
    div({className: "flexColumn", style: {width: "100%"}}, props.users?.map((user: User) =>
      user.id === props.userId
        ? editableString(
          div({className: "flexRow green bold", style: {cursor: "pointer"}}, "> " + user.name),
          props.editingUserName, props.setEditingUserName, props.changeUserName
        )
        : div({className: "flexRow green"}, "| " + user.name)
    ))
  ])
}

const editableString = (value:React.ReactNode, editing: boolean, setEditing: (newValue: boolean) => any, onChange: (newValue: string) => any) => {
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && e.target === document.activeElement){
      setEditing(false);
      onChange((e.target as any).value)
    }
  }
  const onBlur = () => {
    setEditing(false);
  }
  return editing
    ? h("textarea", {
      className:"sessionTextInput",
      style: {height: "22px", width: "100%"},
      onKeyDown,
      onBlur,
    })
    : div({onClick: () => setEditing(true)}, [value])
}


const mapStateToProps = (state: {session: Session, userSettings: UserSettings, world: World} /*, ownProps*/) => {
  return {
    userSettings: state.userSettings,
    sessionId: state.session?.sessionId,
    users: state.session?.users.values(),
    world: state.world,
  }
}

const mapDispatchToProps = (dispatch: any) => ({
  newSession: (serverAddress: string, world: World) =>  dispatch(createSession(serverAddress, world)),
  join: (serverAddress: string, sessionId: string) => dispatch(join(serverAddress, sessionId)),
  leave: () => dispatch(leave()),
  sendMessage: (userId: string, message: string) => dispatch(sendMessage(userId, message)),
})

const connectedRightPanel = connect(
  mapStateToProps,
  mapDispatchToProps
)(rightPanel)

export const makeRightPanel: (store: any) => any =
  store =>  h(Provider, {store},
    h(connectedRightPanel)
  )
