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


export default function Mint() {
  return(
    <div className="flex justify-center">
    <button
      className="rounded-lg bg-[#1a1a1a] hover:bg-[#383838] border border-gray-700 text-white transition-colors flex items-center justify-center text-sm px-6 h-8 min-w-[100px]"
    >
    Button to do a thing
    </button>
  </div>
  )
}
