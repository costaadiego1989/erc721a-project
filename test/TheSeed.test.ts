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

  });
});