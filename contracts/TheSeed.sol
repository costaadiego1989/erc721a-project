// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "erc721a/contracts/ERC721A.sol";

contract TheSeed is ERC721A {
    uint256 private _nextTokenId;
    address payable private _owner;

    constructor(address initialOwner)
        ERC721("The Seed", "SEED")
        _owner = payable(msg.sender);
    {}

    function _mint(uint256 _quantity) public payable {
        uint256 tokenId = _nextTokenId++;
        _safeMint(msg.sender, _quantity);
    }

    function _baseURI() internal pure override returns (string memory) {
        return "meusite.com/";
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721A)
        returns (string memory)
    {
        return string.concat(super.tokenURI(tokenId), ".json");
    }

    function withdraw() external onlyOwner {
        uint256 _amount = address(this).balance;
        (bool, success) = _owner.call{ value: _amount }("");
        require(success == true, "Failed to withdraw");
    }

    function burn(uint256 tokenId) public override {
        super._burn(tokenId);
    }

    modifier onlyOwner internal {
        require(_owner == msg.sender, "You does not have permission");
        _;
    }

}
