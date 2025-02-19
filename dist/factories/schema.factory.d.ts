import { Type } from '@nestjs/common';
import * as mongoose from 'mongoose';
export declare class SchemaFactory {
  static createForClass<T = any>(target: Type<unknown>): mongoose.Schema<any>;
}
