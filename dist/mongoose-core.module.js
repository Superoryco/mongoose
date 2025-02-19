"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var MongooseCoreModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongooseCoreModule = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const mongoose = require("mongoose");
const rxjs_1 = require("rxjs");
const mongoose_utils_1 = require("./common/mongoose.utils");
const mongoose_constants_1 = require("./mongoose.constants");
let MongooseCoreModule = MongooseCoreModule_1 = class MongooseCoreModule {
    constructor(connectionName, moduleRef) {
        this.connectionName = connectionName;
        this.moduleRef = moduleRef;
    }
    static forRoot(uri, options = {}) {
        const { retryAttempts, retryDelay, connectionName, connectionFactory } = options, mongooseOptions = __rest(options, ["retryAttempts", "retryDelay", "connectionName", "connectionFactory"]);
        const mongooseConnectionFactory = connectionFactory || ((connection) => connection);
        const mongooseConnectionName = mongoose_utils_1.getConnectionToken(connectionName);
        const mongooseConnectionNameProvider = {
            provide: mongoose_constants_1.MONGOOSE_CONNECTION_NAME,
            useValue: mongooseConnectionName,
        };
        const connectionProvider = {
            provide: mongooseConnectionName,
            useFactory: () => __awaiter(this, void 0, void 0, function* () {
                return yield rxjs_1.defer(() => __awaiter(this, void 0, void 0, function* () {
                    return mongooseConnectionFactory(mongoose.createConnection(uri, Object.assign({ useNewUrlParser: true, useUnifiedTopology: true }, mongooseOptions)), mongooseConnectionName);
                }))
                    .pipe(mongoose_utils_1.handleRetry(retryAttempts, retryDelay))
                    .toPromise();
            }),
        };
        return {
            module: MongooseCoreModule_1,
            providers: [connectionProvider, mongooseConnectionNameProvider],
            exports: [connectionProvider],
        };
    }
    static forRootAsync(options) {
        const mongooseConnectionName = mongoose_utils_1.getConnectionToken(options.connectionName);
        const mongooseConnectionNameProvider = {
            provide: mongoose_constants_1.MONGOOSE_CONNECTION_NAME,
            useValue: mongooseConnectionName,
        };
        const connectionProvider = {
            provide: mongooseConnectionName,
            useFactory: (mongooseModuleOptions) => __awaiter(this, void 0, void 0, function* () {
                const { retryAttempts, retryDelay, connectionName, uri, connectionFactory } = mongooseModuleOptions, mongooseOptions = __rest(mongooseModuleOptions, ["retryAttempts", "retryDelay", "connectionName", "uri", "connectionFactory"]);
                const mongooseConnectionFactory = connectionFactory || ((connection) => connection);
                return yield rxjs_1.defer(() => __awaiter(this, void 0, void 0, function* () {
                    return mongooseConnectionFactory(mongoose.createConnection(mongooseModuleOptions.uri, Object.assign({ useNewUrlParser: true, useUnifiedTopology: true }, mongooseOptions)), mongooseConnectionName);
                }))
                    .pipe(mongoose_utils_1.handleRetry(mongooseModuleOptions.retryAttempts, mongooseModuleOptions.retryDelay))
                    .toPromise();
            }),
            inject: [mongoose_constants_1.MONGOOSE_MODULE_OPTIONS],
        };
        const asyncProviders = this.createAsyncProviders(options);
        return {
            module: MongooseCoreModule_1,
            imports: options.imports,
            providers: [
                ...asyncProviders,
                connectionProvider,
                mongooseConnectionNameProvider,
            ],
            exports: [connectionProvider],
        };
    }
    onApplicationShutdown() {
        return __awaiter(this, void 0, void 0, function* () {
            const connection = this.moduleRef.get(this.connectionName);
            connection && (yield connection.close());
        });
    }
    static createAsyncProviders(options) {
        if (options.useExisting || options.useFactory) {
            return [this.createAsyncOptionsProvider(options)];
        }
        const useClass = options.useClass;
        return [
            this.createAsyncOptionsProvider(options),
            {
                provide: useClass,
                useClass,
            },
        ];
    }
    static createAsyncOptionsProvider(options) {
        if (options.useFactory) {
            return {
                provide: mongoose_constants_1.MONGOOSE_MODULE_OPTIONS,
                useFactory: options.useFactory,
                inject: options.inject || [],
            };
        }
        const inject = [
            (options.useClass || options.useExisting),
        ];
        return {
            provide: mongoose_constants_1.MONGOOSE_MODULE_OPTIONS,
            useFactory: (optionsFactory) => __awaiter(this, void 0, void 0, function* () { return yield optionsFactory.createMongooseOptions(); }),
            inject,
        };
    }
};
MongooseCoreModule = MongooseCoreModule_1 = __decorate([
    common_1.Global(),
    common_1.Module({}),
    __param(0, common_1.Inject(mongoose_constants_1.MONGOOSE_CONNECTION_NAME)),
    __metadata("design:paramtypes", [String, core_1.ModuleRef])
], MongooseCoreModule);
exports.MongooseCoreModule = MongooseCoreModule;
