"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.services = void 0;
const service_1 = __importDefault(require("./service"));
exports.services = [service_1.default];
exports.default = {
    services: exports.services,
};
