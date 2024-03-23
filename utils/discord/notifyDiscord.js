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
exports.notifyDiscord = void 0;
const discord_js_1 = require("discord.js");
const notifyDiscord = (message) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
        if (!webhookUrl) {
            throw new Error('DISCORD_WEBHOOK_URL not set');
        }
        const webhookClient = new discord_js_1.WebhookClient({ url: webhookUrl });
        yield webhookClient.send(message);
    }
    catch (error) {
        console.error('Failed to send notification to Discord:', error);
    }
});
exports.notifyDiscord = notifyDiscord;
