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
import { FabricClient } from '../services/fabric-client.service'

const fabricClient = new FabricClient();
const TAG = 'TransferController:';

export class erc20Controller {
  constructor(
    // @service(FabricClient) private fabricClient: FabricClient

  ) { }
  @post('/fabric/api/v1/getBalance', {
    responses: {
      '200': {
        description: 'getBalance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(RequestTransfer, {
            })
          }
        },
      },
    },
  })

  async getBalance(@requestBody(RequestTransfer) request_transfer: RequestTransfer): Promise<any> {
    try {
      await fabricClient.connect(request_transfer.fabricUserName);
      console.log(TAG, "Connected. Invoking");
      const result = await fabricClient.getBalance();
      console.log(TAG, "result" , result);
      await fabricClient.disconnect();
      return result
    } catch (error) {
      return error;
    }
  }
  
}