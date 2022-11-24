"use strict";
// models/User.js
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var mongoose_1 = __importDefault(require("mongoose"));
var UserSchema = new mongoose_1["default"].Schema({
    name: String,
    email: String,
    image: String,
    elo: Number
});
exports["default"] = mongoose_1["default"].models.User || mongoose_1["default"].model("User", UserSchema);
