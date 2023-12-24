import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import {AppState, NodeData, SmartContractProject} from "../../types";

const initialState: AppState = {
}

export const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setSelectedNodeData: (state, action: PayloadAction<NodeData>) => {
      state.selectedActivityNode = action.payload
    },

    setSelectedProject: (state, action: PayloadAction<SmartContractProject>) => {
      state.smartContractProject = action.payload
    },

    // setActivityCatalog: (state, action: PayloadAction<ActivityDetailsStruct[]>) => {
    //   state.activityCatalog = action.payload
    // },
    //
    // setResourceCatalog: (state, action: PayloadAction<ResourceDetailsStruct[]>) => {
    //   state.resourcesCatalog = action.payload
    // },
    //
    // setWorkflow: (state, action: PayloadAction<Workflow>) => {
    //   state.workflow = action.payload
    // },
  },
})

// Action creators are generated for each case reducer function
export const {
  setSelectedNodeData,
  setSelectedProject
  // setResourceCatalog,
  // setActivityCatalog,
  //  setWorkflow
} = appSlice.actions

export default appSlice.reducer
  