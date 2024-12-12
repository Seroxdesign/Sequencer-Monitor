import { ethers } from "ethers";
import { SEQUENCER_ABI, SEQUENCER_ADDRESS, WORKABLE_ABI } from "./constants";
import { notifyDiscord } from "./utils/discord/notifyDiscord";
import { fetchJobAddresses, handleConsecutiveWorkableBlocks, getWorkableStatusBatched } from "./utils/sequencer";
import dotenv from 'dotenv';

dotenv.config()

notifyDiscord('Sequencer Monitor started');

const provider = ethers.getDefaultProvider('mainnet', {
  alchemy: process.env.ALCHEMY_API_KEY,
  exclusive: ["alchemy"]
});
const sequencerContract = new ethers.Contract(SEQUENCER_ADDRESS, SEQUENCER_ABI, provider);

const consecutiveWorkableBlocks: { [jobAddress: string]: number } = {};
const jobContractCache: { [jobAddress: string]: ethers.Contract } = {};

const monitorUnworkedJobsForAllNetworks = async (blocknumber: number) => {
    console.time('monitorUnworkedJobsForAllNetworks');
    try {
        const numNetworks = await sequencerContract.numNetworks();
        const networks = await Promise.all(
            Array.from({ length: Number(numNetworks) }, (_, i) => sequencerContract.networkAt(i))
        );

        await Promise.all(networks.map(async (network) => {
            const jobAddresses = await fetchJobAddresses(sequencerContract);
            
            // Update cache for any new job addresses
            jobAddresses.forEach(jobAddress => {
                jobContractCache[jobAddress] ??= new ethers.Contract(jobAddress, WORKABLE_ABI, provider);
            });

            const workableStatusResponses = await getWorkableStatusBatched(network, jobAddresses, jobContractCache);
            
            await Promise.all(
                jobAddresses.map((jobAddress, index) =>
                    handleConsecutiveWorkableBlocks(
                        consecutiveWorkableBlocks,
                        jobAddress,
                        network,
                        blocknumber,
                        workableStatusResponses[index]
                    )
                )
            );
        }));
        
        console.timeEnd('monitorUnworkedJobsForAllNetworks');
    } catch (error) {
        console.error('Error:', error);
    }
}

provider.on('block', monitorUnworkedJobsForAllNetworks);
