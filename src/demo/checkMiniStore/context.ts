import createMiniStore from "@/utils/createStore";
// import createContext from "/@/utils/createCtx";

const defaultStore = {
  sonName: 'default sonname',
  daughterName: 'default daughtername',
}

export const { Provider, useSelector, useDispatch } = createMiniStore(defaultStore)
// export const [useCtx, Provider] = createContext(defaultStore)