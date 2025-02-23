import { useEffect, useState } from "react";
import { txBuilder, GlittrSDK } from "@glittr-sdk/sdk";
import Asset from "./components/Asset";
import { Psbt } from "bitcoinjs-lib";
import { CreateContractForm } from "./components/CreateContractForm";
import { TxResultModal } from "./components/TxResultModal";
import { GLITTR_API, NETWORK, WALLET_API } from "./constants";
import { useLaserEyes } from "@glittr-sdk/lasereyes";

const client = new GlittrSDK({
  network: NETWORK!,
  electrumApi: WALLET_API!,
  glittrApi: GLITTR_API!,
  apiKey: "",
});

type ContractInfo = {
  ticker: string;
  contractId: string;
  supply: string;
  amountPerMint: string;
};

export default function Mint() {
  const { paymentAddress, connected, signPsbt, paymentPublicKey } =
    useLaserEyes();
  const [mintingContractId, setMintingContractId] = useState<string | null>(
    null
  );
  const [showModal, setShowModal] = useState(false);
  const [mintStatus, setMintStatus] = useState<{
    success: boolean;
    txid?: string;
  }>({ success: false });

  const [contracts, setContracts] = useState<ContractInfo[] | null>(null);

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

  // This is function to construct and broadcast a Glittr asset mint transaction
  const mint = async (contract: ContractInfo) => {
    setMintingContractId(contract.contractId);
    try {
      if (!contract.contractId) return;
      const [blockContractId, txContractId] = contract.contractId.split(":").map(Number);

      // Construct a Glittr asset mint message
      const tx = txBuilder.contractCall({
        contract: [blockContractId, txContractId],
        call_type: {
          mint: { pointer: 0 },
        },
      });
      console.log("tx", tx)

      // This is a Glittr sdk helper function
      // to construct PSBT with embedded Glittr message in the OP_RETURN
      const psbt = await client.createTx({
        address: paymentAddress,
        tx,
        outputs: [{ address: paymentAddress, value: 546 }],
        publicKey: paymentPublicKey,
      });

      // Sign the PSBT
      const result = await signPsbt(psbt.toHex());

      if (result && result?.signedPsbtHex) {
        const newPsbt = Psbt.fromHex(result?.signedPsbtHex);
        newPsbt.finalizeAllInputs();
        const newHex = newPsbt.extractTransaction(true).toHex();

        // This is a Glittr sdk helper function
        // to broadcast bitcoin transaction
        const txid = await client.broadcastTx(newHex);
        setMintStatus({ success: true, txid });
        setShowModal(true);
      }
    } catch (error) {
      console.error(error);
      setMintStatus({ success: false });
      setShowModal(true);
    } finally {
      setMintingContractId(null);
    }
  };

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
                    {connected && (
                      <div className="flex justify-end">
                        <button
                          onClick={() => mint(contract)}
                          disabled={mintingContractId === contract.contractId}
                          className="rounded-lg bg-[#1a1a1a] hover:bg-[#383838] border border-gray-700 text-white transition-colors flex items-center justify-center text-sm px-6 h-8 min-w-[100px]"
                        >
                          {mintingContractId === contract.contractId
                            ? "Minting..."
                            : "MINT →"}
                        </button>
                      </div>
                    )}
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

      {/* Modal */}
      {showModal &&
        TxResultModal(
          mintStatus.success,
          setShowModal,
          mintStatus.success ? "Minting Successful!" : "Minting Failed",
          mintStatus.success
            ? "Your token has been successfully minted."
            : "There was an error while minting your token. Please try again.",
          mintStatus.txid
        )}
    </div>
  );
}
