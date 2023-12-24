import {SmartContract, SmartContractProject} from '../../types'
import {ResponseContent} from "../../types";
import {callService} from "../serviceBase";

const test: SmartContract[] = [{
    location: "./fixtures/basic.ts",
    contents: "contract Contract is Ownable {" +
        "    event EA(address indexed,address indexed,address indexed,address ,address );\n    address public alice = address(uint160(1));\n    uint256 public test;\n\n    function x(uint num, bytes calldata data) external {\n        console.logBytes(msg.data);\n\n        bytes4 selector;\n        assembly {\n            selector := calldataload(data.offset)\n        }\n\n        console.logBytes4(selector);\n    }\n\n    function execute(address target, bytes calldata data) view external onlyOwner returns(bytes memory) {\n        console.logBytes(msg.data);\n\n        bytes4 selector;\n        assembly {\n            selector := calldataload(data.offset)\n        }\n\n        console.logBytes4(selector);\n    }\n\n    fallback() external {\n        console.log(\"in fallback\");\n    }\n",
    imports: ["@openzeppelin/contracts/access/Ownable.sol", "@openzeppelin/contracts/token/ERC1155/IERC1155.sol", "@openzeppelin/contracts/token/ERC721/IERC721.sol", "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol", "@openzeppelin/contracts/token/ERC20/IERC20.sol", "hardhat/console.sol"],
    functions: [{
        name: "x",
        contents: "function x(uint num, bytes calldata data) external ",
        fullyQualifiedDescriptor: "function x(uint num, bytes calldata data) external ",
        modifiers: [],
        visibility: "external",
        isConstructor: false,
        isFallback: false,
        isReceiveEther: false,
        isVirtual: false
    }, {
        name: "execute",
        contents: "function execute(address target, bytes calldata data) view external onlyOwner returns(bytes memory) ",
        fullyQualifiedDescriptor: "function execute(address target, bytes calldata data) view external onlyOwner returns(bytes memory) ",
        modifiers: [{"name": "onlyOwner", "contents": "onlyOwne"}],
        visibility: "external",
        isConstructor: false,
        isFallback: false,
        isReceiveEther: false,
        isVirtual: false
    }, {
        name: null,
        contents: "fallback() external ",
        fullyQualifiedDescriptor: "fallback() external ",
        modifiers: [],
        visibility: "external",
        isConstructor: false,
        isFallback: true,
        isReceiveEther: false,
        isVirtual: false
    }],
    kind: "contract",
    name: "Contract"
}, {
    location: "./fixtures/basic.ts",
    contents: "contract PoC {\n    bytes4 public constant ERC20_TRANSFER = IERC20.transfer.selector;\n    bytes4 public constant ERC20_ERC721_APPROVE = IERC20.approve.selector;\n    bytes4 public constant ERC20_ERC721_TRANSFER_FROM = IERC20.transferFrom.selector;\n\n    bytes4 public constant ERC721_SAFE_TRANSFER_FROM = bytes4(keccak256(\"safeTransferFrom(address,address,uint256)\"));\n    bytes4 public constant ERC721_SAFE_TRANSFER_FROM_DATA = bytes4(keccak256(\"safeTransferFrom(address,address,uint256,bytes)\"));\n    bytes4 public constant ERC721_ERC1155_SET_APPROVAL = IERC721.setApprovalForAll.selector;\n\n    bytes4 public constant ERC1155_SAFE_TRANSFER_FROM = IERC1155.safeTransferFrom.selector;\n    bytes4 public constant ERC1155_SAFE_BATCH_TRANSFER_FROM = IERC1155.safeBatchTransferFrom.selector; // @info setApprovalForAll from ERC721\n\n\n\n    bytes4 public signatureWithPermision = bytes4(0xdead1337);\n\n    // Call this function with calldata that can be prepared in getAttackerCalldata\n    function execute(address target, bytes calldata data) view external returns(bytes memory) {\n        console.logBytes(msg.data);\n        bytes4 selector;\n        assembly {\n            selector := calldataload(data.offset)\n        }\n        require(selector == signatureWithPermision, \"bad selector\");\n        return data;\n    }\n\n    // Function that prepare attacker calldata\n    function getAttackerCalldata() public view returns(bytes memory)  {\n        bytes memory usualCalldata = abi.encodeWithSelector(this.execute.selector, msg.sender, new bytes(0));\n        return abi.encodePacked(usualCalldata, signatureWithPermision);\n    }\n\n    function exploit() external returns(bytes memory data) {\n        (, data) = address(this).call(getAttackerCalldata());\n    }\n\n    function isBlacklisted(bytes4 selector) public pure returns (bool) {\n        return\n        selector == ERC20_TRANSFER ||\n        selector == ERC20_ERC721_APPROVE ||\n        selector == ERC20_ERC721_TRANSFER_FROM ||\n        selector == ERC721_SAFE_TRANSFER_FROM ||\n        selector == ERC721_SAFE_TRANSFER_FROM_DATA ||\n        selector == ERC721_ERC1155_SET_APPROVAL ||\n        selector == ERC1155_SAFE_TRANSFER_FROM ||\n        selector == ERC1155_SAFE_BATCH_TRANSFER_FROM;\n    }\n\n\n    fallback() external {\n        console.log(\"in fallback\");\n    }\n",
    imports: ["@openzeppelin/contracts/access/Ownable.sol", "@openzeppelin/contracts/token/ERC1155/IERC1155.sol", "@openzeppelin/contracts/token/ERC721/IERC721.sol", "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol", "@openzeppelin/contracts/token/ERC20/IERC20.sol", "hardhat/console.sol"],
    functions: [{
        name: "execute",
        contents: "function execute(address target, bytes calldata data) view external returns(bytes memory) ",
        fullyQualifiedDescriptor: "function execute(address target, bytes calldata data) view external returns(bytes memory) ",
        modifiers: [],
        visibility: "external",
        isConstructor: false,
        isFallback: false,
        isReceiveEther: false,
        isVirtual: false
    }, {
        name: "getAttackerCalldata",
        contents: "function getAttackerCalldata() public view returns(bytes memory)  ",
        fullyQualifiedDescriptor: "function getAttackerCalldata() public view returns(bytes memory)  ",
        modifiers: [],
        visibility: "public",
        isConstructor: false,
        isFallback: false,
        isReceiveEther: false,
        isVirtual: false
    }, {
        name: "exploit",
        contents: "function exploit() external returns(bytes memory data) ",
        fullyQualifiedDescriptor: "function exploit() external returns(bytes memory data) ",
        modifiers: [],
        visibility: "external",
        isConstructor: false,
        isFallback: false,
        isReceiveEther: false,
        isVirtual: false
    }, {
        name: "isBlacklisted",
        contents: "function isBlacklisted(bytes4 selector) public pure returns (bool) ",
        fullyQualifiedDescriptor: "function isBlacklisted(bytes4 selector) public pure returns (bool) ",
        modifiers: [],
        visibility: "public",
        isConstructor: false,
        isFallback: false,
        isReceiveEther: false,
        isVirtual: false
    }, {
        name: null,
        contents: "fallback() external ",
        fullyQualifiedDescriptor: "fallback() external ",
        modifiers: [],
        visibility: "external",
        isConstructor: false,
        isFallback: true,
        isReceiveEther: false,
        isVirtual: false
    }],
    kind: "contract",
    name: "PoC"
}] as any as SmartContract[]


const getParsedProject = async (): Promise<ResponseContent<SmartContractProject>> => {
    // TODO: implement backend
    // return callService<SmartContract[]>('parser/parseProject')
    const response: ResponseContent<SmartContractProject> = {
        isOk: true,
        status: 200,
        data: {
            location: 'test',
            smartContracts: test
        }
    }
    return Promise.resolve(response);
}

export { getParsedProject }
