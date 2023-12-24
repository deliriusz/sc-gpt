
//this is wrapped type used by app reducer only. Please note that it's called "app", hence the name here
import {SmartContractProject} from "./smart-contract-project";

export interface AppStateReducer {
   app: AppState
}

export type NodeData = {
   id: string,
   label: string,
   position?: {
      x: number,
      y: number,
   }
}

export type EdgeData = NodeData & {
   fromId: string,
   toId: string,
}

export interface AppState {
   selectedActivityNode?: NodeData,
   smartContractProject?: SmartContractProject
}
