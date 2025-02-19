import { Schema } from 'mongoose';
export declare type DiscriminatorOptions = {
  name: string;
  schema: Schema;
};
export declare type ModelDefinition = {
  name: string;
  schema: any;
  collection?: string;
  discriminators?: DiscriminatorOptions[];
};
