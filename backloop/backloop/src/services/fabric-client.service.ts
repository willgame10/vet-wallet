'use strict';
/*******************************************************************************
 * Copyright (c) 2022 Belltane
 *
 * All rights reserved.
 *
 * Contributors:
 *   James Worthington - Initial implementation
 *
 * Version: 0.25
 *
 *******************************************************************************/
import { Gateway, Wallet, Wallets } from 'fabric-network';
import * as fs from 'fs';
import { Amount } from '../models/amount.model';
const path = require('path');
const TAG = "FabricClient";
export class FabricClient {
  gateway: any;
  contract: any;
  org: string;
  connectionName: string;
  caName: string;
  mspName: string;
  department: string;
  networkConstants: any;
  ccp: any;
  caOrg1: string;
  networkConfig: any;
  fabricClient: any;
  connected: boolean
  constructor() {
    const caOrg1 = path.resolve(__dirname, '..', '/connections/fabric-dev/peerOrganizations/org1.example.com/tlsca', "tlsca.org1.exmple.com-cert.pem");
    this.org = caOrg1;
    console.log(TAG, "org", this.org);
  }
  prettyJSONString(inputString: string) {
    return JSON.stringify(JSON.parse(inputString), null, 2);
  }
  async connect(userID: string) {
    try {
      console.log(TAG, "Connecting As", userID);
      const wallet = await this.getWallet(userID);
      // Create new gateway configuration for connecting to our peer node.
      const networkConfigPath = path.resolve(__dirname, '..', '..', 'src/constants', "config.json");
      const networkConfig = JSON.parse(fs.readFileSync(networkConfigPath, 'utf8'));
      const channelName = "mychannel";
      const chaincodeId = "token_erc20";
      // const channelName = process.env.CHANNELNAME;
      // const chaincodeId = process.env.CHAINCODEID;
      // console.log(channelName, "", chaincodeId);
      const gateway = new Gateway();
      console.log(TAG, "Connecting");
      await gateway.connect(networkConfig,
        {
          wallet: wallet,
          identity: userID,
          clientTlsIdentity: userID,
          discovery: { enabled: false, asLocalhost: false }
        });
      // Connect to the channel.
      const channel = await gateway.getNetwork(channelName);
      // Get the contract for the chaincode.
      this.contract = channel.getContract(chaincodeId);
      this.connected = true;
    } catch (error) {
      this.connected = false;
      console.error(TAG, `Failed to connect to chaincode: ${error}`);
      return error;
    }
  }
  async disconnect() {
    await this.gateway.disconnect();
  }
  async invoke(submitInvoke: boolean, functionName: string, args: string): Promise<string> {
    try {
      let res;
      console.log(TAG, "arg", args, "functionName", functionName, "submitInvoke", submitInvoke);
      if (submitInvoke == true) {
        res = await this.contract.submitTransaction(functionName, args);
      } else {
        res = await this.contract.evaluateTransaction(functionName, args);
      }
      return res;
    }
    catch (error) {
      console.log("Function invoke failed" + error);
      throw new Error('Fabric Service couldn`t invoke chaincode function: ' + error);
    }
  }
  async invokeTransfer(functionName: string, to: string, value: number): Promise<string> {
    try {
      let res;
      console.log(TAG, "to", to,  "functionName", functionName, "value", value);
      res = await this.contract.submitTransaction(functionName, to, value);
      return res;
    }
    catch (error) {
      console.log("Function invoke failed" + error);
      throw new Error('Fabric Service couldn`t invoke chaincode function: ' + error);
    }
  }
  async getWallet(walletAccount: string): Promise<Wallet> {
    const walletPath = path.join(process.cwd(), 'wallet');
    const wallet = await Wallets.newFileSystemWallet(walletPath);
    try {
      console.log(TAG, "Get Wallet for Account", walletAccount);
      await wallet.get(walletAccount);
      return wallet;
    } catch (error: any) {
      console.error(TAG, `Failed to retrieve wallet for account ${walletAccount}: ${error}`);
      return error;
    }
  }
  async getBalance(): Promise<string> {
    try {
      let res;
      res = await this.contract.submitTransaction('ClientAccountBalance');
      return res;
    }
    catch (error) {
      console.log("Function invoke failed" + error);
      throw new Error('Fabric Service couldn`t invoke chaincode function: ' + error);
    }
  }
  async Mint(amount : any): Promise<Amount> {
    try {
      let res;
      res = await this.contract.submitTransaction('Mint');
      console.log(TAG, "Minted ammount:", amount)
      return res;
    }
    catch (error) {
      console.log("Function invoke failed" + error);
      throw new Error('Fabric Service couldn`t invoke chaincode function: ' + error);
    }
  }
}
