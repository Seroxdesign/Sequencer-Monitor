import { ethers } from "ethers";
import { notifyDiscord } from "../discord/notifyDiscord";

export const fetchJobAddresses = async (sequencerContract: any) => {
  const numJobs = await sequencerContract.numJobs();
  const jobAddresses = [];
  for (let j = 0; j < numJobs; j++) {
      const jobAddress = await sequencerContract.jobAt(j);
      jobAddresses.push(jobAddress);
  }
  return jobAddresses;
};

export const handleConsecutiveWorkableBlocks = async (consecutiveWorkableBlocks: { [jobAddress: string]: number }, jobAddress: string, network: string, blocknumber: number, canWork: any) => {
  try {
    if (canWork[0] === false && consecutiveWorkableBlocks[`${jobAddress}-${network}`] > 0) {
      await notifyDiscord(`
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
      consecutiveWorkableBlocks[`${jobAddress}-${network}`] = (consecutiveWorkableBlocks[`${jobAddress}-${network}`] ?? 0) + 1;
      if (consecutiveWorkableBlocks[`${jobAddress}-${network}`] >= 10) {
        await notifyDiscord(`
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
  } catch (error) {
    console.error(`Error checking workable status for job ${jobAddress} on network ${network}:`, error);
  }
};

// Batch job workable status requests for each network
export const getWorkableStatusBatched = async (network: string, jobAddresses: string[], jobContractCache: { [jobAddress: string]: ethers.Contract }) => {
  const promises = jobAddresses.map((jobAddress: string) => jobContractCache[jobAddress].workable(network));
  return await Promise.all(promises);
};
