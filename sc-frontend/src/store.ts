import { configureStore } from '@reduxjs/toolkit';
import appReducer from './redux/reducers/workspaceNode';
import {AppState} from "./types";

const initialState: AppState = {
  selectedActivityNode: undefined
}

// @ts-ignore
window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()

export default configureStore({
  preloadedState: initialState as any,
  reducer: {
    app: appReducer,
  },
})