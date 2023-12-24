type Modifier =  {
    name: string
    contents: string
}

type Function = {
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

type SmartContract = {
    name: string
    location: string
    contents: string
    kind: 'library' | 'interface' | 'contract'
    functions: Function []
    imports: string []
}

type CallContext = {
    contract: string,
    function: string
}

type FunctionCall = {
    callerContract: string,
    callerFunction: string,
    calleeContract: string,
    calleeFunction: string,
    hasValue: boolean
}

type LowLevelCall = {
    callerContract: string,
    callerFunction: string,
    calleeContractAddress: string,
    callType: 'call' | 'delegatecall' | 'staticcall'
    hasValue: boolean
}

type SmartContractProject = {
    location: string
    smartContracts: SmartContract []
}

export {
    Modifier,
    Function,
    SmartContract,
    SmartContractProject
}