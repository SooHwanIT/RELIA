// IMP START - Quick Start
import { WEB3AUTH_NETWORK } from "@web3auth/modal";
import { type Web3AuthContextConfig } from "@web3auth/modal/react";
// IMP END - Quick Start

// IMP START - Dashboard Registration
const clientId = "BF5psJ_wbCM9L2FOsBXUKzWjOCOQOol4sarlnT9nj7f8w8eqgRNU75W_e3SJAKn7nksfpdNOKzAf4jJWRVOEj10"; // get from https://dashboard.web3auth.io
// IMP END - Dashboard Registration

// IMP START - Config
const web3AuthContextConfig: Web3AuthContextConfig = {
  web3AuthOptions: {
    clientId,
    web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
  }
};
// IMP END - Config

export default web3AuthContextConfig;
