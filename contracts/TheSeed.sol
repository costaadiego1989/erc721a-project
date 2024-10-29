// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "erc721a/contracts/ERC721A.sol";

contract TheSeed is ERC721A {
    address payable private _owner;

    constructor()
        ERC721A("The Seed", "SEED")
    {
        _owner = payable(msg.sender);
    }

    function mint(uint256 _quantity) public payable {
        require(msg.value >= 0.01 ether * _quantity, "Insuficient payment");
        _mint(msg.sender, _quantity);
    }

    function _baseURI() internal pure override returns (string memory) {
        return "ipfs://QmYKg1HuJeh1xRFTHhuBpyikN4Lcc2raiFCJAAy3wJxSB7/";
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
        (bool success,) = _owner.call{ value: _amount }("");
        require(success == true, "Failed to withdraw");
    }

    function burn(uint256 tokenId) public {
        super._burn(tokenId, true);
    }

    modifier onlyOwner {
        require(_owner == msg.sender, "You does not have permission");
        _;
    }

    function contractURI() public view returns (string memory) {
        return "https://apricot-rainy-marsupial-636.mypinata.cloud/ipfs/Qmb1hNjjm6BG4mSStpSWbp2YoH4RqeQNUpH5MbnJDXa9gd";
    }

}
