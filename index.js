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
const ethers_1 = require("ethers");
const constants_1 = require("./constants");
const notifyDiscord_1 = require("./utils/discord/notifyDiscord");
const sequencer_1 = require("./utils/sequencer");
(0, notifyDiscord_1.notifyDiscord)('Sequencer Monitor started');
const provider = ethers_1.ethers.getDefaultProvider('mainnet', {
    alchemy: process.env.ALCHEMY_API_KEY,
    exclusive: ["alchemy"]
});
const sequencerContract = new ethers_1.ethers.Contract(constants_1.SEQUENCER_ADDRESS, constants_1.SEQUENCER_ABI, provider);
const consecutiveWorkableBlocks = {}; // Track consecutive workable blocks for each job
const jobContractCache = {};
const monitorUnworkedJobsForAllNetworks = (blocknumber) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    console.time('monitorUnworkedJobsForAllNetworks');
    try {
        const numNetworks = yield sequencerContract.numNetworks();
        for (let i = 0; i < numNetworks; i++) {
            const network = yield sequencerContract.networkAt(i);
            const jobAddresses = yield (0, sequencer_1.fetchJobAddresses)(sequencerContract);
            for (const jobAddress of jobAddresses) {
                (_a = jobContractCache[jobAddress]) !== null && _a !== void 0 ? _a : (jobContractCache[jobAddress] = new ethers_1.ethers.Contract(jobAddress, constants_1.WORKABLE_ABI, provider));
            }
            const workableStatusResponses = yield (0, sequencer_1.getWorkableStatusBatched)(network, jobAddresses, jobContractCache);
            for (let k = 0; k < jobAddresses.length; k++) {
                const jobAddress = jobAddresses[k];
                const canWork = workableStatusResponses[k];
                (0, sequencer_1.handleConsecutiveWorkableBlocks)(consecutiveWorkableBlocks, jobAddress, network, blocknumber, canWork);
            }
        }
        console.timeEnd('monitorUnworkedJobsForAllNetworks');
    }
    catch (error) {
        console.error('Error:', error);
    }
});
provider.on('block', monitorUnworkedJobsForAllNetworks);
