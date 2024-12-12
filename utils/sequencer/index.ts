import { ethers } from "ethers";
import { notifyDiscord } from "../discord/notifyDiscord";

export const fetchJobAddresses = async (sequencerContract: ethers.Contract): Promise<string[]> => {
  const numJobs = await sequencerContract.numJobs();
  return Promise.all(
    Array.from({ length: Number(numJobs) }, (_, j) => sequencerContract.jobAt(j))
  );
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

export const getWorkableStatusBatched = async (network: string, jobAddresses: string[], jobContractCache: { [jobAddress: string]: ethers.Contract }) => {
  return Promise.all(
    jobAddresses.map(jobAddress => jobContractCache[jobAddress].workable(network))
  );
};