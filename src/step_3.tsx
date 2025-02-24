import { useEffect, useState } from "react";
import { GlittrSDK } from "@glittr-sdk/sdk";
import Asset from "./components/Asset";
import { CreateContractForm } from "./components/CreateContractForm";
import { GLITTR_API, NETWORK, WALLET_API, API_KEY } from "./constants";
import { useLaserEyes } from "@glittr-sdk/lasereyes";

const client = new GlittrSDK({
  network: NETWORK!,
  electrumApi: WALLET_API!,
  glittrApi: GLITTR_API!,
  apiKey: API_KEY,
});

//NEW: contract data struct
type ContractInfo = {
  ticker: string;
  contractId: string;
  supply: string;
  amountPerMint: string;
};

export default function Mint() {
  const { connected } =
    useLaserEyes();
  const [_mintingContractId, _setMintingContractId] = useState<string | null>(
    null
  );

  const [contracts, setContracts] = useState<ContractInfo[] | null>(null);

  //NEW: fetch existing contracts and display them
  useEffect(() => {
    // Fetch and process the list of deployed Glittr asset contracts
    const run = async () => {

      // API to get list of assets
      const res = await fetch(`${GLITTR_API}/helper/assets`);
      const listContractRaw = await res.json();

      // Filter to only include Freemint asset contracts
      const contracts = await Promise.all(
        Object.keys(listContractRaw.result)
          .filter((contractId: string) => {
            const contractInfo = listContractRaw.result[contractId];

            if (contractInfo.type) {
             return contractInfo.type.free_mint == true;
             } else {
               return false;
             }
          })
          .map(async (contractId: string) => {
            // Fetch asset contract metadata to get the amount_per_mint
            const contractInfo = listContractRaw.result[contractId];
            const result = await (
              await fetch(
                `${GLITTR_API}/blocktx/${contractId.split(":")[0]}/${
                  contractId.split(":")[1]
                }`
              )
            ).json();
            return {
              ticker: contractInfo.ticker ?? "",
              contractId: contractId,
              supply: `${contractInfo.total_supply}/${contractInfo.supply_cap}`,
              amountPerMint:
                result.message.message.contract_creation.contract_type.moa
                  .mint_mechanism.free_mint.amount_per_mint,
            };
          })
      );

      setContracts(contracts);
    };

    run();
  }, []);

  //NEW: lots of ts stuff to make the contract list pretty
  return (
    <div className="z-10 min-h-screen p-8 mt-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Left side - Contract List */}
        <div className="flex-grow">
          {connected && <CreateContractForm client={client} />}
          <h1 className="text-2xl font-bold mt-4">All Token Contracts</h1>
          <div className="mt-1 bg-[#0f0f11] backdrop-blur-sm border border-gray-700 border-rounded-md rounded-xl px-6 py-2">
            <div className="space-y-2">
              <div className="grid grid-cols-[200px_200px_200px_200px_1fr] text-lg font-bold text-gray-500 gap-4 items-center p-2 rounded-lg transition-colors">
                <span className="">Contract ID</span>
                <span className="">Ticker</span>
                <span className="">Supply</span>
                <span className="">Amount per Mint</span>
                {connected && <span></span>}
              </div>
              <div className="h-px bg-gray-700/30 -mx-2 my-6"></div>
              {contracts &&
                contracts.map((contract, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-[200px_200px_200px_100px_1fr] gap-4 items-center p-2 rounded-lg transition-colors"
                  >
                    <span className="text-gray-400">
                      ID: {contract.contractId}
                    </span>
                    <span className="font-semibold">{contract.ticker}</span>
                    <span className="text-gray-400">{contract.supply}</span>
                    <span className="text-gray-400">
                      {Number(contract.amountPerMint).toLocaleString()}{" "}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Vertical Divider */}
        <div className="hidden md:block w-px bg-gray-700/30 self-stretch"></div>

        {/* Right side - Asset Component */}
        <div className="md:w-[300px] shrink-0">
          <Asset />
        </div>
      </div>
    </div>
  );
}
