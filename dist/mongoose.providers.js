"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMongooseAsyncProviders = exports.createMongooseProviders = void 0;
const mongoose_utils_1 = require("./common/mongoose.utils");
function createMongooseProviders(connectionName, options = []) {
    return options.reduce((providers, option) => [
        ...providers,
        ...(option.discriminators || []).map((d) => ({
            provide: mongoose_utils_1.getModelToken(d.name),
            useFactory: (model) => model.discriminator(d.name, d.schema),
            inject: [mongoose_utils_1.getModelToken(option.name)],
        })),
        {
            provide: mongoose_utils_1.getModelToken(option.name),
            useFactory: (connection) => {
                const model = connection.model(option.name, option.schema, option.collection);
                return model;
            },
            inject: [mongoose_utils_1.getConnectionToken(connectionName)],
        },
    ], []);
}
exports.createMongooseProviders = createMongooseProviders;
function createMongooseAsyncProviders(connectionName, modelFactories = []) {
    return modelFactories.reduce((providers, option) => {
        return [
            ...providers,
            {
                provide: mongoose_utils_1.getModelToken(option.name),
                useFactory: (connection, ...args) => __awaiter(this, void 0, void 0, function* () {
                    const schema = yield option.useFactory(...args);
                    const model = connection.model(option.name, schema, option.collection);
                    return model;
                }),
                inject: [mongoose_utils_1.getConnectionToken(connectionName), ...(option.inject || [])],
            },
            ...(option.discriminators || []).map((d) => ({
                provide: mongoose_utils_1.getModelToken(d.name),
                useFactory: (model) => model.discriminator(d.name, d.schema),
                inject: [mongoose_utils_1.getModelToken(option.name)],
            })),
        ];
    }, []);
}
exports.createMongooseAsyncProviders = createMongooseAsyncProviders;
