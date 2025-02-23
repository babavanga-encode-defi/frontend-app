"use client";

import { useEffect, useState } from "react";
import { useLaserEyes } from "@glittr-sdk/lasereyes";
import { GLITTR_API } from "../constants";

interface Asset {
  contract_id: string;
  balance: string;
  ticker: string;
  divisibility: number;
}

export default function Asset() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const { paymentAddress, connected } = useLaserEyes();

  // Function to get all minted asset by address
  const fetchAssets = async () => {
    setLoading(true);
    try {
      if (!connected) {
        return;
      }

      // API to fetch minted assets by address 
      const assetResponse = await fetch(
        `${GLITTR_API}/helper/address/${paymentAddress}/balance-summary`
      );
      const assetResponseData = await assetResponse.json();
      if (assetResponseData.data.length > 0) {
        setAssets(assetResponseData.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connected]);

  if (loading) {
    return (
      <div className="flex flex-col gap-2 w-full max-w-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Your Assets</h2>
          <button
            onClick={fetchAssets}
            disabled={loading}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            <svg
              className="w-5 h-5 text-gray-600 dark:text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
        </div>
        <div className="flex justify-center items-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600 dark:border-gray-400"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 w-full max-w-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Your Assets</h2>
        <button
          onClick={fetchAssets}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <svg
            className="w-5 h-5 text-gray-600 dark:text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </button>
      </div>
      <div
        className="flex flex-wrap gap-4 overflow-y-auto max-h-[calc(100vh-200px)] pr-2 
            scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent hover:scrollbar-thumb-gray-600"
      >
        {assets.map((asset, index) => (
          <div
            key={index}
            className="flex-1 min-w-[200px] bg-white dark:bg-[#0f0f11] backdrop-blur-xs rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100 dark:border-gray-700 p-3"
          >
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {asset.ticker || "Unknown Token"}
                </span>
                <span className="px-2 py-1 text-md font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 rounded-full">
                  {asset.balance}
                </span>
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 font-mono break-all">
                {asset.contract_id}
              </div>
            </div>
          </div>
        ))}
        {assets.length === 0 && (
          <div className="w-full text-center py-6 bg-gray-50 dark:bg-gray-800/50 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700">
            <p className="text-gray-500 dark:text-gray-400">
              No assets found in your wallet
            </p>
          </div>
        )}
      </div>
    </div>
  );
}