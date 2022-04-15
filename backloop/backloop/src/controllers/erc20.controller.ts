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
import { FabricClient } from '../services/fabric-client.service';
import { Amount } from '../models/amount.model';
import { Balance } from '../models/balance.model';

const fabricClient = new FabricClient();
const TAG = 'erc20Controller:';

export class erc20Controller {
  constructor(
    //@service(FabricClient) private fabricClient: FabricClient

  ) { }
 
  @post('/user/api/v1/GetAccountBalance', {responses: {'200': {description: 'GetAccountBalance',content: { 'application/json': { schema: getModelSchemaRef(Balance) } },},},})
  async GetAccountBalance(@requestBody({
    content: {'application/json': {schema: getModelSchemaRef(Balance, {}),},},}) balance: Balance): Promise<any> {
    await fabricClient.connect(balance.fabricUserName);
    const result = await fabricClient.getBalance();
    console.log(TAG, result)
    return result;
  }

  @post('/user/api/v1/Mint', {responses: {'200': {description: 'mint',content: { 'application/json': { schema: getModelSchemaRef(Amount) } },},},})
  async Mint(@requestBody({
    content: {'application/json': {schema: getModelSchemaRef(Amount, {}, ),},},}) amount: Amount): Promise<any> {
    await fabricClient.connect(amount.fabricUserName);
    const result = await fabricClient.Mint(amount.amount);
    console.log(TAG, result)
    return result;
  }

  @post('/user/api/v1/GetID', {responses: {'200': {description: 'ID',content: { 'application/json': { schema: getModelSchemaRef(Balance) } },},},})
  async Balance(@requestBody({
    content: {'application/json': {schema: getModelSchemaRef(Balance, {}, ),},},}) balance: Balance): Promise<any> {
    await fabricClient.connect(balance.fabricUserName);
    const result = await fabricClient.getClientAccountID();
    console.log(TAG, result)
    return result;
  }

}