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
export class Amount extends Entity {
  
@property({
    type: 'string',
    required: true,
    })
    fabricUserName: any;

  @property({
    type: 'number',
    required: true,
  })
  amount: any;

  
  constructor(data?: Partial<Amount>) {
    super(data);
  }
}
export interface AmountRelations {
  // describe navigational properties here
}
export type AmountWithRelations = Amount & AmountRelations;