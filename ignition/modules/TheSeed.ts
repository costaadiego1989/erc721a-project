// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const TheSeed = buildModule("TheSeed", (m) => {

  const theSeed = m.contract("TheSeed", [], {});

  return { theSeed };
});

export default TheSeed;
