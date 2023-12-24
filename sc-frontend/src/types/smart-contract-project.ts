export type Modifier =  {
    name: string
    contents: string
}

export type Function = {
    fullyQualifiedDescriptor: string
    name: string
    contents: string
    visibility: 'default' | 'external' | 'internal' | 'public' | 'private'
    modifiers: Modifier []
    isConstructor: boolean
    isReceiveEther: boolean
    isFallback: boolean
    isVirtual: boolean
}

export type SmartContract = {
    name: string
    location: string
    contents: string
    kind: 'library' | 'interface' | 'contract'
    functions: Function []
    imports: string []
}

export type CallContext = {
    contract: string,
    function: string
}

export type FunctionCall = {
    callerContract: string,
    callerFunction: string,
    calleeContract: string,
    calleeFunction: string,
    hasValue: boolean
}

export type LowLevelCall = {
    callerContract: string,
    callerFunction: string,
    calleeContractAddress: string,
    callType: 'call' | 'delegatecall' | 'staticcall'
    hasValue: boolean
}

export type SmartContractProject = {
    location: string
    smartContracts: SmartContract []
}