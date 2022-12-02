"use strict";
// models/User.js
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
exports.__esModule = true;
var mongoose_1 = __importDefault(require("mongoose"));
var MatchSchema = new mongoose_1["default"].Schema({
  player1id: {
    type: mongoose_1["default"].Schema.Types.ObjectId,
    required: true,
  },
  player2id: {
    type: mongoose_1["default"].Schema.Types.ObjectId,
    required: false,
  },
  pgn: { type: String, required: true },
  ongoing: { type: Boolean, required: true },
  winner: {
    type: mongoose_1["default"].Schema.Types.ObjectId,
    required: false,
  },
});
exports["default"] =
  mongoose_1["default"].models.Match ||
  mongoose_1["default"].model("Match", MatchSchema);
