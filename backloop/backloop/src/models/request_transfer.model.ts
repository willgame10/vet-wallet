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
import {Entity, model, property} from '@loopback/repository';
@model()
export class RequestTransfer extends Entity {

  @property({
    type: 'string',
    required: true,
  })
  fabricUserName: string;
  
  constructor(data?: Partial<RequestTransfer>) {
    super(data);
  }
}
export interface RequestTransferRelations {
  // describe navigational properties here
}
export type RequestTransferWithRelations = RequestTransfer & RequestTransferRelations;
