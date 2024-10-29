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
    const seed = await Seed.deploy();

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

      await seed.mint(1, { value: ethers.parseEther("0.01") });

      const balance = await seed.balanceOf(owner.address);
      const tokenId = 0;
      const ownerOf = await seed.ownerOf(tokenId);
      const totalSupply = await seed.totalSupply();

      expect(balance).to.equal(1);
      expect(ownerOf).to.equal(owner.address);
      expect(totalSupply).to.equal(1);
    });

    it("Should NOT mint", async function () {
      const { seed, owner, otherAccount } = await loadFixture(deployFixture);

      expect(seed.mint(1)).to.revertedWith("Insuficient payment");
    });

    it("Should not mint if not an owner", async function () {
      const { seed, owner, otherAccount } = await loadFixture(deployFixture);

      const instance = seed.connect(otherAccount);

      expect(instance.mint(1)).to.be.revertedWithCustomError(seed, "TransferCallerNotOwnerNorApproved");

    });

    it("Should not mint if token does not exist", async function () {
      const { seed, owner, otherAccount } = await loadFixture(deployFixture);

      await expect(seed.mint(0)).to.be.revertedWithCustomError(seed, "MintZeroQuantity");

    });

    it("Should burn", async function () {
      const { seed, owner, otherAccount } = await loadFixture(deployFixture);

      await seed.mint(1, { value: ethers.parseEther("0.01") });
      const tokenId = 0;

      await seed.burn(tokenId);
      const balance = await seed.balanceOf(owner.address);
      const totalSupply = await seed.totalSupply();


      expect(balance).to.equal(0);
      expect(totalSupply).to.equal(0);
    });

    it("Should burn (approve)", async function () {
      const { seed, owner, otherAccount } = await loadFixture(deployFixture);

      await seed.mint(1, { value: ethers.parseEther("0.01") });
      const tokenId = 0;
      const instance = seed.connect(otherAccount);
      
      await seed.approve(otherAccount.address, tokenId);
      const approved = await seed.getApproved(tokenId);

      await instance.burn(tokenId);

      const balance = await seed.balanceOf(owner.address);
      const totalSupply = await seed.totalSupply();

      expect(balance).to.equal(0);
      expect(totalSupply).to.equal(0);
      expect(approved).to.equal(otherAccount.address);

    });

    it("Should burn (approve for all)", async function () {
      const { seed, owner, otherAccount } = await loadFixture(deployFixture);

      await seed.mint(1, { value: ethers.parseEther("0.01") });
      const tokenId = 0;

      const instance = seed.connect(otherAccount);

      await seed.setApprovalForAll(otherAccount.address, true);
      const approved = await seed.isApprovedForAll(owner.address, otherAccount.address);

      await instance.burn(tokenId);
      const balance = await seed.balanceOf(owner.address);
      const totalSupply = await seed.totalSupply();

      expect(balance).to.equal(0);
      expect(totalSupply).to.equal(0);
      expect(approved).to.equal(true);

    });

    it("Should NOT burn", async function () {
      const { seed, owner, otherAccount } = await loadFixture(deployFixture);

      await expect(seed.burn(1)).to.revertedWithCustomError(seed, "OwnerQueryForNonexistentToken");
    });

    it("Should NOT burn (approve)", async function () {
      const { seed, owner, otherAccount } = await loadFixture(deployFixture);

      await seed.mint(1, { value: ethers.parseEther("0.01") });
      const tokenId = 0;

      const instance = seed.connect(otherAccount);

      const balance = await seed.balanceOf(owner.address);
      const totalSupply = await seed.totalSupply();

      await expect(instance.burn(tokenId)).to.be.revertedWithCustomError(seed, "TransferCallerNotOwnerNorApproved");
      expect(balance).to.equal(1);
      expect(totalSupply).to.equal(1);
    });

    it("Should has URI metadata", async function () {
      const { seed, owner, otherAccount } = await loadFixture(deployFixture);

      await seed.mint(1, { value: ethers.parseEther("0.01") });
      const tokenId = 0;

      const balance = await seed.balanceOf(owner.address);
      const totalSupply = await seed.totalSupply();

      expect(await seed.tokenURI(tokenId)).to.equal("meusite.com/0.json");
      expect(balance).to.equal(1);
      expect(totalSupply).to.equal(1);
    });

    it("Should has NOT URI metadata", async function () {
      const { seed, owner, otherAccount } = await loadFixture(deployFixture);

      expect(seed.tokenURI(1)).to.be.revertedWithCustomError(seed, "URIQueryForNonexistentToken").withArgs(1);
    });

    it("Should transfer", async function () {
      const { seed, owner, otherAccount } = await loadFixture(deployFixture);

      await seed.mint(1, { value: ethers.parseEther("0.01") });

      const tokenId = 0;
      await seed.transferFrom(owner.address, otherAccount.address, tokenId);

      const balanceFrom = await seed.balanceOf(owner.address);
      const balanceTo = await seed.balanceOf(otherAccount.address);
      const ownerOf = await seed.ownerOf(tokenId);

      expect(balanceFrom).to.equal(0);
      expect(balanceTo).to.equal(1);
      expect(ownerOf).to.equal(otherAccount.address);
    });

    it("Should NOT transfer", async function () {
      const { seed, owner, otherAccount } = await loadFixture(deployFixture);

      await seed.mint(1, { value: ethers.parseEther("0.01") });
      const tokenId = 0;
      
      const instance = seed.connect(otherAccount);

      await expect(instance.transferFrom(otherAccount.address, owner.address, tokenId))
        .to
        .be
        .revertedWithCustomError(seed, "TransferFromIncorrectOwner");

      const balanceFrom = await seed.balanceOf(owner.address);
      const balanceTo = await seed.balanceOf(otherAccount.address);
      const ownerOf = await seed.ownerOf(tokenId);

      expect(balanceFrom).to.equal(1);
      expect(balanceTo).to.equal(0);
      expect(ownerOf).to.equal(owner.address);
    });

    it("Should NOT transfer if token does not exist", async function () {
      const { seed, owner, otherAccount } = await loadFixture(deployFixture);

      expect(seed.transferFrom(otherAccount.address, owner.address, 1))
        .to
        .be
        .revertedWithCustomError(seed, "TransferCallerNotOwnerNorApproved");
    });

    it("Should emit transfer event", async function () {
      const { seed, owner, otherAccount } = await loadFixture(deployFixture);

      await seed.mint(1, { value: ethers.parseEther("0.01") });
      const tokenId = 0;

      expect(await seed.transferFrom(owner.address, otherAccount.address, tokenId))
        .to
        .emit(seed, "Transfer")
        .withArgs(owner.address, otherAccount.address, tokenId);
    });

    it("Should transfer approved)", async function () {
      const { seed, owner, otherAccount } = await loadFixture(deployFixture);

      await seed.mint(1, { value: ethers.parseEther("0.01") });
      const tokenId = 0;

      await seed.approve(otherAccount.address, tokenId);
      const instance = seed.connect(otherAccount);
      
      const approved = await seed.getApproved(tokenId);
      await instance.transferFrom(owner.address, otherAccount.address, tokenId);
      const balance = await seed.balanceOf(otherAccount.address);
      const ownerOf = await seed.ownerOf(tokenId);

      expect(balance)
        .to
        .equal(1);

      expect(approved)
        .to
        .equal(otherAccount);

      expect(ownerOf)
        .to
        .equal(otherAccount);
    });

    it("Should emit approval event", async function () {
      const { seed, owner, otherAccount } = await loadFixture(deployFixture);

      await seed.mint(1, { value: ethers.parseEther("0.01") });
      const tokenId = 0;

      await seed.approve(otherAccount.address, tokenId);
      const approved = await  seed.getApproved(tokenId);

      expect(approved)
        .to
        .emit(seed, "Approval")
        .withArgs(owner.address, otherAccount.address, tokenId);
    });

    it("Should clear approvals)", async function () {
      const { seed, owner, otherAccount } = await loadFixture(deployFixture);

      await seed.mint(1, { value: ethers.parseEther("0.01") });
      const tokenId = 0;

      await seed.approve(otherAccount.address, tokenId);
      await seed.transferFrom(owner.address, otherAccount.address, tokenId);

      const approved = await seed.getApproved(tokenId);

      expect(approved)
        .to
        .equal("0x0000000000000000000000000000000000000000");
    });

    it("Should transfer approved for all)", async function () {
      const { seed, owner, otherAccount } = await loadFixture(deployFixture);

      await seed.mint(1, { value: ethers.parseEther("0.01") });
      const tokenId = 0;

      await seed.setApprovalForAll(otherAccount.address, true);
      const approved = await seed.isApprovedForAll(owner.address, otherAccount.address);

      const instance = seed.connect(otherAccount);
      await instance.transferFrom(owner.address, otherAccount.address, tokenId);

      const balance = await seed.balanceOf(otherAccount.address);
      const ownerOf = await seed.ownerOf(tokenId);

      expect(balance)
        .to
        .equal(1);

      expect(approved)
        .to
        .equal(true);

      expect(ownerOf)
        .to
        .equal(otherAccount.address);
    });

    it("Should emit approval for all event", async function () {
      const { seed, owner, otherAccount } = await loadFixture(deployFixture);

      await seed.mint(1, { value: ethers.parseEther("0.01") });
      const tokenId = 0;

      await seed.setApprovalForAll(otherAccount.address, true);
      const approved = await seed.isApprovedForAll(owner.address, otherAccount.address);

      expect(approved)
        .to
        .emit(seed, "ApprovalForAll")
        .withArgs(owner.address, otherAccount.address, true);
    });

    it("Should support interfaces", async function () {
      const { seed, owner, otherAccount } = await loadFixture(deployFixture);

      expect(await seed.supportsInterface("0x80ac58cd"))
        .to
        .equal(true);
    });

    it("Should be increase balance", async function () {
      const { seed, owner, otherAccount } = await loadFixture(deployFixture);

      const initialBalance = await seed.balanceOf(owner.address);
      expect(initialBalance).to.equal(0);

      await seed.mint(1, { value: ethers.parseEther("0.01") });

      const finalBalance = await seed.balanceOf(owner.address);
      expect(finalBalance).to.equal(1);

    });

    it("Should withdraw", async function () {
      const { seed, owner, otherAccount } = await loadFixture(deployFixture);

      const ownerBalanceBefore = await ethers.provider.getBalance(owner);
      const instance = seed.connect(otherAccount);

      await instance.mint(1, { value: ethers.parseEther("0.01") });
      await seed.withdraw();

      const contractBalance = await ethers.provider.getBalance(seed);
      const ownerBalanceAfter = await ethers.provider.getBalance(owner);

      expect(contractBalance).to.equal(0);
      expect(ownerBalanceAfter).to.gt(ownerBalanceBefore);
    });

    it("Should NOT withdraw", async function () {
      const { seed, owner, otherAccount } = await loadFixture(deployFixture);

      const instance = seed.connect(otherAccount);

      await seed.mint(1, { value: ethers.parseEther("0.01") });

      expect(instance.withdraw()).to.revertedWith("You does not have permission");
    });

  });
});