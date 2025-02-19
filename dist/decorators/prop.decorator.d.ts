import * as mongoose from 'mongoose';
export declare type PropOptions =
  | mongoose.SchemaDefinition['string']
  | mongoose.SchemaType;
export declare function Prop(options?: PropOptions): PropertyDecorator;
