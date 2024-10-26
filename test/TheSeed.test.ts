import {
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("TheSeed", function () {
  // Fixture que será reutilizado nos testes
  async function deployFixture() {
    // Obtém as contas
    const [owner, otherAccount] = await ethers.getSigners();

    // Deploy do contrato
    const Seed = await ethers.getContractFactory("TheSeed");
    const seed = await Seed.deploy(owner);

    return { seed, owner, otherAccount };
  }

  describe("The Seeds Tests", function () {

    it("Should be name", async function () {
      const { seed, owner, otherAccount } = await loadFixture(deployFixture);

      expect(await (seed as any).name()).to.equal("The Seed");
      
    });

    it("Should be symbol", async function () {
      const { seed, owner, otherAccount } = await loadFixture(deployFixture);

      expect(await (seed as any).symbol()).to.equal("SEED");
      
    });

    it("Should mint", async function () {
      const { seed, owner, otherAccount } = await loadFixture(deployFixture);

      await seed.mint();

      const balance = await seed.balanceOf(owner.address);
      const tokenId = await seed.tokenByIndex(0);
      const ownerOf = await seed.ownerOf(tokenId);
      const ownerTokenId = await seed.tokenOfOwnerByIndex(owner.address, tokenId);
      const totalSupply = await seed.totalSupply();

      expect(balance).to.equal(1);
      expect(tokenId).to.equal(ownerTokenId);
      expect(ownerOf).to.equal(owner.address);
      expect(totalSupply).to.equal(1);
    });

    it("Should burn", async function () {
      const { seed, owner, otherAccount } = await loadFixture(deployFixture);

      await seed.mint();
      const tokenId = await seed.tokenByIndex(0);

      await seed.burn(tokenId);
      const balance = await seed.balanceOf(owner.address);
      const totalSupply = await seed.totalSupply();


      expect(balance).to.equal(0);
      expect(totalSupply).to.equal(0);
    });

    it("Should burn (approve)", async function () {
      const { seed, owner, otherAccount } = await loadFixture(deployFixture);

      await seed.mint();
      const tokenId = await seed.tokenByIndex(0);

      const instance = seed.connect(otherAccount);

      await seed.approve(otherAccount.address, tokenId);

      await instance.burn(tokenId);
      const balance = await seed.balanceOf(owner.address);
      const totalSupply = await seed.totalSupply();


      expect(balance).to.equal(0);
      expect(totalSupply).to.equal(0);
    });

    it("Should burn (approve for all)", async function () {
      const { seed, owner, otherAccount } = await loadFixture(deployFixture);

      await seed.mint();
      const tokenId = await seed.tokenByIndex(0);

      const instance = seed.connect(otherAccount);

      await seed.setApprovalForAll(otherAccount.address, true);

      await instance.burn(tokenId);
      const balance = await seed.balanceOf(owner.address);
      const totalSupply = await seed.totalSupply();


      expect(balance).to.equal(0);
      expect(totalSupply).to.equal(0);
    });

    it("Should NOT burn", async function () {
      const { seed, owner, otherAccount } = await loadFixture(deployFixture);

      await expect(seed.burn(1)).to.revertedWithCustomError(seed, "ERC721NonexistentToken");
    });

    it("Should NOT burn (approve)", async function () {
      const { seed, owner, otherAccount } = await loadFixture(deployFixture);

      await seed.mint();
      const tokenId = await seed.tokenByIndex(0);

      const instance = seed.connect(otherAccount);

      const balance = await seed.balanceOf(owner.address);
      const totalSupply = await seed.totalSupply();

      await expect(instance.burn(tokenId)).to.be.revertedWithCustomError(seed, "ERC721InsufficientApproval");
      expect(balance).to.equal(1);
      expect(totalSupply).to.equal(1);
    });

    it("Should has URI metadata", async function () {
      const { seed, owner, otherAccount } = await loadFixture(deployFixture);

      await seed.mint();
      const tokenId = await seed.tokenByIndex(0);

      const balance = await seed.balanceOf(owner.address);
      const totalSupply = await seed.totalSupply();

      expect(await seed.tokenURI(tokenId)).to.equal("meusite.com/0.json");
      expect(balance).to.equal(1);
      expect(totalSupply).to.equal(1);
    });

    it("Should has NOT URI metadata", async function () {
      const { seed, owner, otherAccount } = await loadFixture(deployFixture);

      expect(seed.tokenURI(1)).to.be.revertedWithCustomError(seed, "ERC721NonexistentToken").withArgs(1);
    });

    it("Should transfer", async function () {
      const { seed, owner, otherAccount } = await loadFixture(deployFixture);

      await seed.mint();

      const tokenId = await seed.tokenByIndex(0);
      await seed.transferFrom(owner.address, otherAccount.address, tokenId);

      const balanceFrom = await seed.balanceOf(owner.address);
      const balanceTo = await seed.balanceOf(otherAccount.address);
      const ownerOf = await seed.ownerOf(tokenId);
      const ownerTokenId = await seed.tokenOfOwnerByIndex(otherAccount.address, tokenId);

      expect(balanceFrom).to.equal(0);
      expect(balanceTo).to.equal(1);
      expect(tokenId).to.equal(ownerTokenId);
      expect(ownerOf).to.equal(otherAccount.address);
    });

  });
});