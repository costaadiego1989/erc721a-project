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

  describe("Deployment", function () {

    it("Should be name", async function () {
      const { seed, owner, otherAccount } = await loadFixture(deployFixture);

      expect(await (seed as any).name()).to.equal("The Seed");
      
    });

  });
});