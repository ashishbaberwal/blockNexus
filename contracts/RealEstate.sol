//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract RealEstate is ERC721URIStorage {
    uint256 private _nextTokenId;

    constructor() ERC721("Real Estate", "REAL") {}

    function mint(string memory tokenURI) public returns (uint256) {
        // We use the `++` operator _before_ the assignment to ensure the local variable is incremented.
        // While technically the ERC721 standard doesn't mandate starting from 0 or 1, 
        // starting from 1 has become the de facto standard.
        // This trick is used to increment the _nextTokenId before using it and
        // ensures the totalSupply is always correct.
        uint256 newItemId = ++_nextTokenId;

        _mint(msg.sender, newItemId);
        _setTokenURI(newItemId, tokenURI);

        return newItemId;
    }

    function totalSupply() public view returns (uint256) {
        return _nextTokenId;
    }
}
