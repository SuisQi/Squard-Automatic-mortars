import * as React from "react";
import {Provider, connect} from 'react-redux'
import {
    changeMap,
    newUIStateWriteAction as writeUIState,
    newUserSettingsWriteAction as writeUserSettings
} from './actions';
import {toggleButton, unstyledToggleButton} from '../common/toggleButton';
import {Dropdown} from "../common/dropdown";
import {UIState, UserSettings} from "./types";
import {
    IconActionType,
    pickActiveWeapon,
    removeAllTargets,
    setWeaponActive,
    setWeaponHeightOverGround as setWeaponHeightOverGroundMeters
} from "../world/actions";
import {EntityId, Weapon, World} from "../world/types";
import {canonicalEntitySort, getEntitiesByType} from "../world/world";
import {WeaponType} from "../world/components/weapon";
import {Minimap} from "../minimap/types";
import {standardFormatKeypad, world2keypadStrings} from "../world/transformations";
import {mat4, vec3} from "gl-matrix";
import {sessionComponent} from "./session";
import {changeUserName, createSession, join, leave, sendMessage} from "../replication_ws/actions";
import {userSettings} from "./reducer";
import {User} from "../replication_ws/types";
import {StoreState} from "../store";
import {set_map, set_weapon} from "../api/standard";
import {maps} from "../common/mapData";
import {useTranslation} from "../i18n/hooks";
import ConnectedLanguageSwitcher from "./LanguageSwitcher";

const h = React.createElement
// @ts-ignore
const div = <P, C>(props: P, children?: C) => h("div", props as any, children)

// 地图基础数据（不包含显示名称）
export const mapBaseOptions = [
    ["albasrah", "options/albasrah_option.png"],
    ["anvil", "options/anvil_option.png"],
    ["belaya", "options/belaya_option.png"],
    ["blackcoast", "options/blackcoast_option.png"],
    ["chora", "options/chora_option.png"],
    ["fallujah", "options/fallujah_option.png"],
    ["foolsroad", "options/foolsroad_option.png"],
    ["goosebay", "options/goosebay_option.png"],
    ["gorodok", "options/gorodok_option.png"],
    ["harju", "options/harju_option.png"],
    ["jensensrange", "options/jensensrange_option.png"],
    ["kamdesh", "options/kamdesh_option.png"],
    ["kohat", "options/kohat_option.png"],
    ["kokan", "options/kokan_option.png"],
    ["logar", "options/logar_option.png"],
    ["lashkar", "options/lashkar_option.png"],
    ["manicouagan", "options/manic_option.png"],
    ["mestia", "options/mestia_option.png"],
    ["mutaha", "options/mutaha_option.png"],
    ["narva", "options/narva_option.png"],
    ["skorpoFull", "options/skorpo_option.png"],
    ["sumari", "options/sumari_option.png"],
    ["tallil", "options/tallil_option.png"],
    ["yehorivka", "options/yehorivka_option.png"],
    ["sanxianislands", "options/sanxianislands_option.png"]
];

// 武器基础数据（不包含显示名称）
const weaponBaseOptions = [
    ["standardMortar", "options/mortarRound10.png"],
    ["M121", "options/mortarRound10.png"],
    ["technicalMortar", "options/mortarRound10.png"],
    ["ub32", "options/s5rocket2.png"],
    ["hellCannon", "options/mortarRound10.png"],
    ["bm21", "options/s5rocket2.png"],
    ["MK19", "options/s5rocket2.png"],
];

// 获取本地化地图选项的函数
const getMapOptions = (t: (key: string) => string) => {
    return mapBaseOptions.map(([mapId, imagePath]) => [
        mapId,
        t(`maps.${mapId}`),
        imagePath
    ]);
};

// 获取本地化武器选项的函数
const getWeaponOptions = (t: (key: string) => string) => {
    return weaponBaseOptions.map(([weaponType, imagePath]) => [
        weaponType,
        t(`weapons.${weaponType}`),
        imagePath
    ]);
};

const mapOption: (label: string, imagePath: string) => any =
    (label, imagePath) => div({className: "flexRow mapOption"}, [
        div({className: "mapOptionImage", style: {backgroundImage: `url(${imagePath})`}}),
        div({className: "mapOptionLabel"}, label)
    ])

const weaponOption: (label: string, imagePath: string) => any =
    (label, imagePath) => div({className: "flexRow mapOption", key: label}, [
        div({className: "weaponOptionImage", style: {backgroundImage: `url(${imagePath})`}}),
        div({className: "weaponOptionLabel"}, label)
    ])

const leftPanel: (props: { userSettings: UserSettings } & any) => any
    = props => {
    const { t } = useTranslation();
    const mapOptions = getMapOptions(t);

    return h("div", {className: "leftPanel flexItem"}, [
        props.userSettings.leftPanelCollapsed
            ? div({className: "flexColumn", style: {"padding": "2px", "minHeight": "30px"}}, [
                div({className: "flexRow"}, [
                    h(Dropdown, {
                        className: "flexItem fill",
                        value: props.userSettings.mapId,
                        onChange: props.onChangeMap,
                        options: mapOptions.map(valueLabel => ({
                            value: valueLabel[0],
                            elem: mapOption(valueLabel[1], valueLabel[2])
                        }))
                    }),
                ]),
                props.userSettings.extraButtonsAlwaysShown
                    ? h(React.Fragment, {}, [
                        div({className: "v2"}, []),
                        ...extraButtons(props, t),
                    ])
                    : null,
                // 语言切换器放在底部
                div({className: "v5"}, []),
                div({className: "flexRow"}, [
                    div({className: "settingsLabel small"}, [t("common.language")]),
                    div({className: "h2"}, []),
                    h(ConnectedLanguageSwitcher, {}),
                ]),
                // 隐藏sessionComponent但保持Hook调用以避免React错误
                div({style: {display: "none"}}, [sessionComponent(props)]),
            ])
            : div({style: {padding: "2px"}}, collapsibleleftPanelSettings(props, t)),

        unstyledToggleButton({
            value: props.userSettings.leftPanelCollapsed,
            onChange: props.setCollapsed,
            label: "",
            className: "collapseButton",
            style: {},
        }),
    ])
}

const collapsibleleftPanelSettings: (props: { userSettings: UserSettings } & any, t: (key: string) => string) => any =
    (props, t) => {
        const mapOptions = getMapOptions(t);
        return [
            div({className: "flexColumn"}, [
                div({className: "flexRow",}, [
                    h(Dropdown, {
                        className: "flexItem fill",
                        value: props.userSettings.mapId,
                        onChange: props.onChangeMap,
                        options: mapOptions.map(valueLabel => ({
                            value: valueLabel[0],
                            elem: mapOption(valueLabel[1], valueLabel[2])
                        }))
                    })
                ]),
                div({className: "v2"}, []),
                div({className: "flexRow"}, [
                    toggleButton({
                            value: props.userSettings.mapGrid,
                            onChange: props.onChangeMapGrid,
                            label: "#",
                            classNameTrue: "toggleButton black",
                            classNameFalse: "toggleButton",
                            styleFalse: {color: "grey"},
                            tooltip: t("tooltips.showMapGrid"),
                        }
                    ),
                    //div({className:"h2"}),
                    //toggleButton({
                    //  value: props.userSettings.contourmap,
                    //  onChange: props.onChangeContourmap,
                    //  label: "//",
                    //  classNameTrue: "toggleButton red",
                    //  classNameFalse: "toggleButton",
                    //  styleFalse: {color: "grey"},
                    //  tooltip: "Show contour map layer",
                    //}),
                ]),
                div({className: "flexRow"}, [
                    div({className: "separator"})
                ]),
                ...weaponSettings(props, t),
                div({className: "flexRow"}, [
                    div({className: "separator"})
                ]),

                ...targetSettings(props, t),
                div({className: "v2"}, []),

                div({className: "flexRow"}, [
                    div({className: "separator"})
                ]),
                ...extraButtons(props, t),
                div({className: "flexRow"}, [
                    div({className: "separator"})
                ]),
                div({className: "flexRow"}, [
                    div({className: "separator"})
                ]),
                sessionComponent(props),
                // 底部信息和设置区域
                // div({className: "flexRow"}, [
                //     div({className: "separator"})
                // ]),
                // div({className: "flexRow hint"}, [
                //     t("common.checkTooltips"), div({className: "h5"}, []), h("a", {
                //         className: "link",
                //         href: "https://gitlab.com/squadstrat/squadmortar"
                //     }, [t("common.gitlab")]),
                // ]),

                div({className: "flexRow"}, [
                    div({className: "separator"})
                ]),
                div({className: "v2"}, []),
                // 语言切换器在底部单独一行
                div({className: "flexRow"}, [
                    div({className: "settingsLabel"}, [t("common.language") || "Language:"]),
                    div({className: "h5"}, []),
                    h(ConnectedLanguageSwitcher, {}),
                ]),
                div({className: "v2"}, []),
            ])
        ]
    }

const weaponSettings = (props: { userSettings: UserSettings } & any, t: (key: string) => string) => {
    const weaponOptions = getWeaponOptions(t);
    return [
        div({className: "flexRow",}, [
            h(Dropdown, {
                className: "flexItemFill",
                value: props.userSettings.weaponType,
                onChange: props.onChangeWeapon,
                options: weaponOptions.map(valueLabel => ({
                    value: valueLabel[0],
                    elem: weaponOption(valueLabel[1], valueLabel[2])
                }))
            })
        ]),
        div({className: "v2"}, []),
        div({className: "flexRow"}, [
            toggleButton({
                value: props.userSettings.weaponPlacementHelper,
                onChange: props.onChangeWeaponPlacementHelper,
                tooltip: t("tooltips.showKeypadsWhileMovingWeapon"),
                label: "#?",
                className: "",
                classNameTrue: " green",
                styleFalse: {color: "grey"},
            }),
            div({className: "h2"}, []),
            toggleButton({
                value: props.userSettings.weaponPlacementLabel,
                onChange: props.onChangeWeaponPlacementLabel,
                tooltip: t("tooltips.showKeypadLabelWhileMovingWeapon"),
                label: "A1",
                className: "",
                classNameTrue: " green",
                styleFalse: {color: "grey"},
            }),
        ]),
        weaponTable(props, t)
    ];
}

const weaponTable = (props: { world: World, minimap: Minimap } & any, t: (key: string) => string) => {
    let weapons = getEntitiesByType<Weapon>(props.world, "Weapon");
    canonicalEntitySort(weapons);
    return div({className: "flexRow",}, [
        h("table", {className: "weaponTable"}, [
            h("colgroup", {}, [
                h("col", {className: "indexCol"}),
                h("col", {className: "locationCol"}),
                h("col", {className: ""}),
                h("col", {className: ""}),
                h("col", {className: ""}),
            ]),
            h("thead", {}, [
                h("tr", {}, [
                    h("th", {}, [""]),
                    h("th", {}, [""]),
                    h("th", {}, [""]),
                    h("th", {}, [""]),
                    h("th", {}, [""]),
                ]),
            ]),
            h("tbody", {}, [
                ...weapons.map((weapon: Weapon, index: number) =>
                    h("tr", {key: index}, [
                        h("td", {className: "indexCell"}, [(index + 1).toString()]),
                        h("td", {}, [standardFormatKeypad(world2keypadStrings(props.minimap, mat4.getTranslation(vec3.create(), weapon.transform)))]),
                        h("td", {}, [
                            h("input", {
                                type: "number",
                                className: "textInput numberInput",
                                value: Math.floor(weapon.heightOverGround / 100),
                                onChange: props.onChangeWeaponHeightOverGround(weapon.entityId),
                                title: t("tooltips.weaponHeightOverGround"),
                            }),
                        ]),
                        h("td", {}, [
                            div({
                                className: "divButton ",
                                title: t("tooltips.activateThisWeapon"),
                                onClick: () => props.pickActiveWeapon(weapon.entityId),
                            }, "^"),
                        ]),
                        h("td", {}, [
                            toggleButton({
                                value: weapon.isActive,
                                onChange: () => props.setWeaponActive(weapon.entityId, !weapon.isActive),
                                tooltip: t("tooltips.activateDeactivateWeapon"),
                                label: "o",
                                className: "",
                                classNameTrue: " green",
                                styleFalse: {color: "grey"},
                            })
                        ]),
                    ])
                )
            ]),
        ]),
    ])
}

const targetSettings = (props: { userSettings: UserSettings } & any, t: (key: string) => string) => [
    div({className: "flexRow"}, [
        toggleButton({
            value: props.userSettings.targetGrid,
            onChange: props.onChangeTargetGrid,
            tooltip: t("tooltips.targetingGrid"),
            label: "#",
            className: "",
            classNameTrue: " green",
            styleFalse: {color: "grey"},
        }),
        div({className: "h2"}),
        toggleButton({
            value: props.userSettings.targetSpread,
            onChange: props.onChangeTargetSpread,
            tooltip: t("tooltips.projectileSpread"),
            label: "O",
            className: "",
            classNameTrue: " blue",
            styleFalse: {color: "grey"},

        }),
        div({className: "h2"}),
        toggleButton({
            value: props.userSettings.targetSplash,
            onChange: props.onChangeTargetSplash,
            tooltip: t("tooltips.splashRadius"),
            label: "(O)",
            className: "",
            classNameTrue: " red",
            styleFalse: {color: "grey"},
        }),
        div({className: "h2"}),
        toggleButton({
            value: props.userSettings.targetDistance,
            onChange: props.onChangeTargetDistance,
            tooltip: t("tooltips.weaponTargetDistance"),
            label: "m",
            className: "",
            classNameTrue: " black",
            styleFalse: {color: "grey"},
        }),
    ]),
    div({className: "v2"}, []),
    div({className: "flexRow"}, [
        toggleButton({
            value: props.userSettings.targetCompactMode,
            onChange: props.onChangeTargetCompactMode,
            tooltip: t("tooltips.compactTargetText"),
            label: "c",
            className: "",
            classNameTrue: "pink",
            styleFalse: {color: "grey"},

        }),
        div({className: "h2"}),
        toggleButton({
            value: props.userSettings.targetPlacementHelper,
            onChange: props.onChangeTargetPlacementHelper,
            tooltip: t("tooltips.showKeypadsWhileMovingTarget"),
            label: "#?",
            className: "",
            classNameTrue: "red",
            styleFalse: {color: "grey"},

        }),
        div({className: "h2"}),
        toggleButton({
            value: props.userSettings.targetPlacementLabel,
            onChange: props.onChangeTargetPlacementLabel,
            tooltip: t("tooltips.showKeypadLabelWhileMovingTarget"),
            label: "A1",
            className: "",
            classNameTrue: "red",
            styleFalse: {color: "grey"},

        }),
        div({className: "h2"}),
        h("input", {
            type: "number",
            className: "textInput numberInput",
            value: props.userSettings.fontSize,
            onChange: props.onChangeFontSize,
            title: t("tooltips.fontSize"),
        }),
    ])
]

const extraButtons = (props: { userSettings: UserSettings, uiState: UIState } & any, t: (key: string) => string) => [
    div({className: "flexRow",}, [
        toggleButton({
            value: props.userSettings.extraButtonsAlwaysShown,
            onChange: props.onChangeExtraButtons,
            tooltip: t("tooltips.showExtraButtonsInCollapsedMode"),
            label: "m.",
            className: "",
            classNameTrue: "yellow",
            styleFalse: {color: "grey"},
        }),
        div({className: "h2"}, []),
        toggleButton({
            value: props.userSettings.deleteMode,
            onChange: props.onChangeDeleteMode,
            tooltip: t("tooltips.deleteItemsWithSingleClick"),
            label: "-I",
            className: "",
            classNameTrue: "red",
            styleFalse: {color: "grey"},
        }),
        div({className: "h2"}),
        toggleButton({
            value: props.uiState.weaponCreationMode,
            onChange: props.onChangeWeaponCreationMode,
            tooltip: t("tooltips.placeTargetOrWeaponMarkers"),
            label: [
                h("span", {className: props.uiState.weaponCreationMode ? "grey" : "red"}, [t("labels.target") + " "]),
                h("span", {className: props.uiState.weaponCreationMode ? "green" : "grey"}, [t("labels.weapon")])
            ],
        }),
        div({className: "h2"}),
        toggleButton({
            value: props.userSettings.terrainmap,
            onChange: props.onChangeMapMode,
            tooltip: t("tooltips.showTerrainMap"),
            label: "-T",
            className: "",
            classNameTrue: " red",
            styleFalse: {color: "grey"},
        }),
        div({className: "h2"}),
        div({className: "v10"}, []),
        div({
            className: "divButton ",
            title: t("tooltips.removeAllTargets"),
            onClick: props.onClickRemoveAllTargets
        }, "-∀T"),
    ]),
]


const mapStateToProps = (state: StoreState /*, ownProps*/) => {
    return {
        userSettings: state.userSettings,
        sessionId: state.session?.sessionId,
        uiState: state.uiState,
        world: state.world,
        minimap: state.minimap,
        users: state.session ? Array.from(state.session?.users.values() as any) : [],
        userId: state.session?.userId,
    }
}

const mapDispatchToProps = (dispatch: any) => ({
    onChangeMap: (v:keyof (typeof maps)) => {
        dispatch(changeMap(v ))
        set_map(maps[v]['minimap_image_src'])
    },
    onChangeContourmap: (e: any) => dispatch(writeUserSettings("contourmap", e.target.value)),
    onChangeWeapon: (v: WeaponType) => {
        dispatch(writeUserSettings("weaponType", v))
        set_weapon(v)
    },
    onChangeWeaponPlacementHelper: (e: any) => dispatch(writeUserSettings("weaponPlacementHelper", e.target.value)),
    onChangeWeaponPlacementLabel: (e: any) => dispatch(writeUserSettings("weaponPlacementLabel", e.target.value)),

    onChangeMapGrid: (e: any) => {
        dispatch(writeUserSettings("mapGrid", e.target.value))
    },
    onChangeTargetSpread: (e: any) => dispatch(writeUserSettings("targetSpread", e.target.value)),
    onChangeTargetSplash: (e: any) => dispatch(writeUserSettings("targetSplash", e.target.value)),
    onChangeTargetDistance: (e: any) => dispatch(writeUserSettings("targetDistance", e.target.value)),
    onChangeTargetGrid: (e: any) => dispatch(writeUserSettings("targetGrid", e.target.value)),
    onChangeTargetCompactMode: (e: any) => dispatch(writeUserSettings("targetCompactMode", e.target.value)),
    onChangeTargetPlacementHelper: (e: any) => dispatch(writeUserSettings("targetPlacementHelper", e.target.value)),
    onChangeTargetPlacementLabel: (e: any) => dispatch(writeUserSettings("targetPlacementLabel", e.target.value)),

    onChangeFontSize: (e: any) => dispatch(writeUserSettings("fontSize", parseInt(e.target.value))),
    onChangeWeaponHeightOverGround: (entityId: EntityId) => (e: any) => dispatch(setWeaponHeightOverGroundMeters(entityId, parseInt(e.target.value))), //dispatch(writeUserSettings("extraWeaponHeight", parseInt(e.target.value))),
    onClickRemoveAllTargets: (e: any) => {
        dispatch(removeAllTargets())
        // dispatch({type:IconActionType.remove_all})
    },
    onChangeDeleteMode: (e: any) => dispatch(writeUserSettings("deleteMode", e.target.value)),
    onChangeExtraButtons: (e: any) => dispatch(writeUserSettings("extraButtonsAlwaysShown", e.target.value)),
    onChangeWeaponCreationMode: (e: any) => dispatch(writeUIState("weaponCreationMode", e.target.value)),
    onChangeMapMode: (e: any) => {
        dispatch(writeUserSettings("terrainmap", e.target.value))
    },
    setWeaponActive: (entityId: EntityId, newState: boolean) => dispatch(setWeaponActive(entityId, newState)),
    pickActiveWeapon: (entityId: EntityId, newState: boolean) => dispatch(pickActiveWeapon(entityId)),
    setCollapsed: (e: any) => dispatch(writeUserSettings("leftPanelCollapsed", e.target.value)),

    newSession: (serverAddress: string, world: World) => dispatch(createSession(serverAddress, world)),
    join: (serverAddress: string, sessionId: string) => dispatch(join(serverAddress, sessionId)),
    leave: () => dispatch(leave()),
    sendMessage: (userId: string, message: string) => dispatch(sendMessage(userId, message)),
    changeUserName: (newName: string) => dispatch(changeUserName(newName))
})

const connectedLeftPanel = connect(
    mapStateToProps,
    mapDispatchToProps
)(leftPanel)

export const makeLeftPanel: (store: any) => any =
    store => h(Provider, {store},
        h(connectedLeftPanel)
    )

