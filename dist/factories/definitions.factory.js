"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefinitionsFactory = void 0;
const shared_utils_1 = require("@nestjs/common/utils/shared.utils");
const mongoose = require("mongoose");
const type_metadata_storage_1 = require("../storages/type-metadata.storage");
const BUILT_IN_TYPES = [Boolean, Number, String, Map, Date];
class DefinitionsFactory {
    static createForClass(target) {
        var _a;
        if (!target) {
            throw new Error(`Target class "${target}" passed in to the "DefinitionsFactory#createForClass()" method is "undefined".`);
        }
        let schemaDefinition = {};
        let parent = target;
        while (!shared_utils_1.isUndefined(parent.prototype)) {
            if (parent === Function.prototype) {
                break;
            }
            const schemaMetadata = type_metadata_storage_1.TypeMetadataStorage.getSchemaMetadataByTarget(parent);
            if (!schemaMetadata) {
                parent = Object.getPrototypeOf(parent);
                continue;
            }
            (_a = schemaMetadata.properties) === null || _a === void 0 ? void 0 : _a.forEach((item) => {
                const options = this.inspectTypeDefinition(item.options);
                schemaDefinition = Object.assign({ [item.propertyKey]: options }, schemaDefinition);
            });
            parent = Object.getPrototypeOf(parent);
        }
        return schemaDefinition;
    }
    static inspectTypeDefinition(optionsOrType) {
        if (typeof optionsOrType === 'function') {
            if (this.isPrimitive(optionsOrType)) {
                return optionsOrType;
            }
            else if (this.isMongooseSchemaType(optionsOrType)) {
                return optionsOrType;
            }
            const schemaDefinition = this.createForClass(optionsOrType);
            const schemaMetadata = type_metadata_storage_1.TypeMetadataStorage.getSchemaMetadataByTarget(optionsOrType);
            if (schemaMetadata === null || schemaMetadata === void 0 ? void 0 : schemaMetadata.options) {
                return new mongoose.Schema(schemaDefinition, schemaMetadata.options);
            }
            return schemaDefinition;
        }
        else if (typeof optionsOrType.type === 'function') {
            optionsOrType.type = this.inspectTypeDefinition(optionsOrType.type);
            return optionsOrType;
        }
        else if (Array.isArray(optionsOrType)) {
            return optionsOrType.length > 0
                ? [this.inspectTypeDefinition(optionsOrType[0])]
                : optionsOrType;
        }
        return optionsOrType;
    }
    static isPrimitive(type) {
        return BUILT_IN_TYPES.includes(type);
    }
    static isMongooseSchemaType(type) {
        if (!type || !type.prototype) {
            return false;
        }
        const prototype = Object.getPrototypeOf(type.prototype);
        return prototype && prototype.constructor === mongoose.SchemaType;
    }
}
exports.DefinitionsFactory = DefinitionsFactory;
