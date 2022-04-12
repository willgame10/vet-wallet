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
import { post, requestBody, getModelSchemaRef } from '@loopback/rest';
import { Transfer } from '../models/transfer.model';
import { RequestTransfer } from '../models/request_transfer.model';
import { service } from '@loopback/core';
import { FabricClient } from '../services/fabric-client.service';
import { User } from '../models';
import { FabricCAClient } from '../services/fabric-ca-client.service';
import { Amount } from '../models/amount.model';

const fabricClient = new FabricClient();
const TAG = 'TransferController:';

export class erc20Controller {
  constructor(
    //@service(FabricClient) private fabricClient: FabricClient

  ) { }
  // @post('/fabric/api/v1/getBalance', {
  //   responses: {
  //     '200': {
  //       description: 'getBalance',
  //       content: {
  //         'application/json': {
  //           schema: getModelSchemaRef(RequestTransfer, {
  //           })
  //         }
  //       },
  //     },
  //   },
  // })

  // async getBalance(@requestBody(RequestTransfer) request_transfer: RequestTransfer): Promise<any> {
  //   try {
  //     await fabricClient.connect(request_transfer.fabricUserName);
  //     console.log(TAG, "Connected. retrieving balance");
  //     const result = await fabricClient.getBalance();
  //     console.log(TAG, "result" , result);
  //     await fabricClient.disconnect();
  //     return result
  //   } catch (error) {
  //     return error;
  //   }
  // }
 
  @post('/user/api/v1/GetAccountBalance', {responses: {'200': {description: 'GetAccountBalance',content: { 'application/json': { schema: getModelSchemaRef(User) } },},},})
  async GetAccountBalance(@requestBody({
    content: {'application/json': {schema: getModelSchemaRef(User, {}),},},}) user: User): Promise<any> {
    await fabricClient.connect(user.fabricUserName);
    const result = await fabricClient.getBalance();
    console.log(TAG, "ClientAccountBalance", result)
    return result;
  }

  @post('/user/api/v1/Mint', {responses: {'200': {description: 'mint',content: { 'application/json': { schema: getModelSchemaRef(Amount) } },},},})
  async Mint(@requestBody({
    content: {'application/json': {schema: getModelSchemaRef(Amount, {}, ),},},}) amount: Amount): Promise<any> {
    await fabricClient.connect(amount.fabricUserName);
    const result = await fabricClient.Mint(amount);
    console.log(TAG, "Mint", result)
    return result;
  }

}