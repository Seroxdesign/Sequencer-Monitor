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
exports.getWorkableStatusBatched = exports.handleConsecutiveWorkableBlocks = exports.fetchJobAddresses = void 0;
const notifyDiscord_1 = require("../discord/notifyDiscord");
const fetchJobAddresses = (sequencerContract) => __awaiter(void 0, void 0, void 0, function* () {
    const numJobs = yield sequencerContract.numJobs();
    const jobAddresses = [];
    for (let j = 0; j < numJobs; j++) {
        const jobAddress = yield sequencerContract.jobAt(j);
        jobAddresses.push(jobAddress);
    }
    return jobAddresses;
});
exports.fetchJobAddresses = fetchJobAddresses;
const handleConsecutiveWorkableBlocks = (consecutiveWorkableBlocks, jobAddress, network, blocknumber, canWork) => {
    var _a;
    try {
        if (canWork[0] === false && consecutiveWorkableBlocks[`${jobAddress}-${network}`] > 0) {
            (0, notifyDiscord_1.notifyDiscord)(`
      ------------------------------------
      ${jobAddress} has been worked after ${consecutiveWorkableBlocks[`${jobAddress}-${network}`]} consecutive blocks, at block ${blocknumber} on network ${network}
      ------------------------------------
      Etherscan Links:
      Job Address: [${jobAddress}](https://etherscan.io/address/${jobAddress})
      Block Number: [${blocknumber}](https://etherscan.io/block/${blocknumber})
      Network: ${network}
      ------------------------------------
      `);
            consecutiveWorkableBlocks[`${jobAddress}-${network}`] = 0;
        }
        if (canWork[0] === true) {
            consecutiveWorkableBlocks[`${jobAddress}-${network}`] = ((_a = consecutiveWorkableBlocks[`${jobAddress}-${network}`]) !== null && _a !== void 0 ? _a : 0) + 1;
            if (consecutiveWorkableBlocks[`${jobAddress}-${network}`] >= 10) {
                (0, notifyDiscord_1.notifyDiscord)(`
        ------------------------------------
        Warning!!!! Workable job has not been worked for ${consecutiveWorkableBlocks[`${jobAddress}-${network}`]} consecutive blocks:
        ------------------------------------
        Job Address: [${jobAddress}](https://etherscan.io/address/${jobAddress})
        Network: ${network}
        Block Number: [${blocknumber}](https://etherscan.io/block/${blocknumber})
        ------------------------------------
      `);
            }
        }
    }
    catch (error) {
        console.error(`Error checking workable status for job ${jobAddress} on network ${network}:`, error);
    }
};
exports.handleConsecutiveWorkableBlocks = handleConsecutiveWorkableBlocks;
// Batch job workable status requests for each network
const getWorkableStatusBatched = (network, jobAddresses, jobContractCache) => __awaiter(void 0, void 0, void 0, function* () {
    const promises = jobAddresses.map((jobAddress) => jobContractCache[jobAddress].workable(network));
    return yield Promise.all(promises);
});
exports.getWorkableStatusBatched = getWorkableStatusBatched;
