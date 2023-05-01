type Modifier =  {
    name: string
}

type Function = {
    fullyQualifiedDescriptor: string
    name: string
    contents: string
    visibility: 'default' | 'external' | 'internal' | 'public' | 'private'
    modifiers: Modifier []
    // isConstructor: boolean
    // isReceiveEther: boolean
    // isFallback: boolean
    // isVirtual: boolean
}

type SmartContract = {
    name: string
    location: string
    contents: string
    kind: 'library' | 'interface' | 'contract'
    functions: Function []
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