import { ethers } from "ethers";
import { SEQUENCER_ABI, SEQUENCER_ADDRESS, WORKABLE_ABI } from "./constants";
import { notifyDiscord } from "./utils/discord/notifyDiscord";
import { fetchJobAddresses, handleConsecutiveWorkableBlocks, getWorkableStatusBatched } from "./utils/sequencer";

notifyDiscord('Sequencer Monitor started');

const provider = ethers.getDefaultProvider('mainnet', {
  alchemy: process.env.ALCHEMY_API_KEY,
  exclusive: ["alchemy"]
});
const sequencerContract = new ethers.Contract(SEQUENCER_ADDRESS, SEQUENCER_ABI, provider);

const consecutiveWorkableBlocks: { [jobAddress: string]: number } = {}; // Track consecutive workable blocks for each job
const jobContractCache: { [jobAddress: string]: ethers.Contract } = {};



const monitorUnworkedJobsForAllNetworks = async (blocknumber: number) => {
    console.time('monitorUnworkedJobsForAllNetworks');
    try {
        const numNetworks = await sequencerContract.numNetworks();
        for (let i = 0; i < numNetworks; i++) {
            const network = await sequencerContract.networkAt(i);
            const jobAddresses: string[] = await fetchJobAddresses(sequencerContract);

            for (const jobAddress of jobAddresses) {
                jobContractCache[jobAddress] ??= new ethers.Contract(jobAddress, WORKABLE_ABI, provider);
            }

            const workableStatusResponses = await getWorkableStatusBatched(network, jobAddresses, jobContractCache);

            for (let k = 0; k < jobAddresses.length; k++) {
                const jobAddress = jobAddresses[k];
                const canWork = workableStatusResponses[k];
                handleConsecutiveWorkableBlocks(consecutiveWorkableBlocks, jobAddress, network, blocknumber, canWork);
            }
        }
        console.timeEnd('monitorUnworkedJobsForAllNetworks');
    } catch (error) {
        console.error('Error:', error);
    }
}

provider.on('block', monitorUnworkedJobsForAllNetworks);
