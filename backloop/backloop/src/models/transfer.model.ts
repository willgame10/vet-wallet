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
export class Transfer extends Entity {

  @property({
    type: 'string',
    required: true,
  })
  to: string;
  
  @property({
    type: 'string',
    required: true,
  })
  value: string;
  
  constructor(data?: Partial<Transfer>) {
    super(data);
  }
}
export interface TransferRelations {
  // describe navigational properties here
}
export type TransferWithRelations = Transfer & TransferRelations;
