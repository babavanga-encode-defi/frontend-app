import { useState } from "react";
import { GlittrSDK, Account } from "@glittr-sdk/sdk";
import { TxResultModal } from "./TxResultModal.tsx";
import { useLaserEyes } from "@glittr-sdk/lasereyes";
import { createMarketContract } from "../create_market_contract";
import { Market } from "../types/market";

export function CreateContractForm({
  client,
}: {
  client: GlittrSDK;
}) {
  const { connected, signPsbt } = useLaserEyes();
  const [showModal, setShowModal] = useState(false);
  const [marketTitle, setMarketTitle] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [txLinks, setTxLinks] = useState<{ yes?: string; no?: string }>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState<"none" | "yes" | "waiting" | "no" | "complete">("none");
  const [countdown, setCountdown] = useState<number>(60);
  const [showCountdownOverlay, setShowCountdownOverlay] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!connected) {
      alert("Please connect your wallet first");
      return;
    }

    if (!marketTitle.trim()) {
      alert("Please enter a market title");
      return;
    }

    localStorage.setItem('newMarketTitle', marketTitle);
    console.log('Stored new market title:', marketTitle);

    setIsProcessing(true);
    setCurrentStep("yes");

    try {
      const account = new Account({ network: "testnet" });
      await createMarketContract(
        account,
        marketTitle,
        client,
        signPsbt,
        (yesTxid) => {
          console.log("YES contract created:", yesTxid);
          setTxLinks(prev => ({ ...prev, yes: `https://explorer.glittr.fi/tx/${yesTxid}` }));
          setCurrentStep("waiting");
          setShowCountdownOverlay(true);
          setCountdown(60);
        },
        (noTxid) => {
          console.log("NO contract created:", noTxid);
          setCurrentStep("complete");
          setShowCountdownOverlay(false);
          
          setModalTitle("Market Created Successfully!");
          setModalMessage(`Your market "${marketTitle}" has been created! The market will appear in the list shortly.`);
          setShowModal(true);

          setMarketTitle("");
          setCurrentStep("none");
        }
      );
    } catch (error: any) {
      console.error("Market creation failed:", error);
      const markets = JSON.parse(localStorage.getItem('allMarkets') || '[]') as Market[];
      const storedTitle = localStorage.getItem('newMarketTitle');
      const updatedMarkets = markets.filter(m => m.title !== storedTitle);
      localStorage.setItem('allMarkets', JSON.stringify(updatedMarkets));
      
      setModalTitle("Market Creation Failed");
      setModalMessage(`Failed to create market: ${error?.message || 'Unknown error'}`);
      setShowModal(true);
      setShowCountdownOverlay(false);
    }
    
    setIsProcessing(false);
  };

  return (
    <section className="relative">
      <h1 className="text-2xl font-bold mb-4">Create Binary Market</h1>
      <div className="mt-1 bg-[#0f0f11] backdrop-blur-sm border border-gray-700 border-rounded-md rounded-xl px-6 py-4">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="marketTitle" className="block font-medium mb-2">
              Market Question
            </label>
            <input
              type="text"
              id="marketTitle"
              value={marketTitle}
              onChange={(e) => setMarketTitle(e.target.value)}
              placeholder="e.g., Will BTC reach $100k in 2024?"
              className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-800/50"
              required
            />
            <p className="mt-1 text-sm text-gray-400">
              This will create YES/NO tokens for your market
            </p>
          </div>

          <button
            type="submit"
            disabled={isProcessing || !marketTitle.trim()}
            className={`
              w-full rounded-lg border border-gray-700 text-white 
              transition-all duration-300 flex items-center justify-center 
              px-6 py-3 relative overflow-hidden
              ${isProcessing ? 'cursor-not-allowed opacity-75' : 'hover:bg-[#383838]'}
              ${!marketTitle.trim() ? 'opacity-50' : ''}
              bg-[#1a1a1a]
            `}
          >
            <div 
              className="absolute left-0 top-0 h-full bg-green-500/20 transition-all duration-300"
              style={{
                width: currentStep === "waiting" ? "50%" : 
                      currentStep === "complete" ? "100%" : "0%"
              }}
            />
            <span className="relative z-10">
              {currentStep === "yes" ? "Creating YES Contract..." :
               currentStep === "waiting" ? `Creating NO Contract (${countdown}s)` :
               currentStep === "complete" ? "Market Created!" :
               isProcessing ? "Creating..." : "Create Binary Market"}
            </span>
          </button>
        </form>
      </div>

      {showCountdownOverlay && (
        <>
          {/* Full screen blur overlay */}
          <div className="fixed inset-0 backdrop-blur-md bg-black/50 z-50" />
          
          {/* Content */}
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div className="bg-[#1a1a1a] p-8 rounded-lg border border-gray-700 max-w-md w-full">
              <h3 className="text-2xl font-bold text-center mb-4">Creating Binary Market</h3>
              <p className="text-center text-gray-400 mb-6">"{marketTitle}"</p>
              
              <div className="flex justify-center mb-6">
                <div className="relative w-32 h-32">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-4xl font-bold">{countdown}s</span>
                  </div>
                  <svg className="transform -rotate-90 w-32 h-32">
                    <circle
                      cx="64"
                      cy="64"
                      r="60"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="transparent"
                      className="text-gray-700"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="60"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="transparent"
                      strokeDasharray="377"
                      strokeDashoffset={377 - (377 * countdown) / 60}
                      className="text-green-500 transition-all duration-1000"
                    />
                  </svg>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                    <p className="font-medium">YES Contract Created</p>
                  </div>
                  <a 
                    href={txLinks.yes} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-blue-400 hover:text-blue-300 text-sm break-all"
                  >
                    {txLinks.yes}
                  </a>
                </div>

                <div className="bg-gray-800/50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className={`w-4 h-4 rounded-full ${currentStep === "complete" ? "bg-green-500" : "bg-gray-500"}`}></div>
                    <p className="font-medium">NO Contract</p>
                  </div>
                  <p className="text-sm text-gray-400">
                    {currentStep === "complete" ? 
                      "Market created successfully!" : 
                      "Creating in " + countdown + " seconds..."
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {currentStep !== "none" && (
        <div className="mt-4 p-4 bg-gray-800 rounded">
          <div className="flex items-center mb-4">
            <div className="w-full bg-gray-700 rounded-full h-2.5">
              <div 
                className="bg-green-500 h-2.5 rounded-full transition-all duration-300"
                style={{ 
                  width: currentStep === "waiting" ? "50%" :
                         currentStep === "complete" ? "100%" : "25%"
                }}
              />
            </div>
            <span className="ml-4 text-sm">
              {currentStep === "waiting" ? `50% (${countdown}s)` :
               currentStep === "complete" ? "100%" : "25%"}
            </span>
          </div>
          <p className="font-medium mb-2">Status: {
            currentStep === "yes" ? "Creating YES contract..." :
            currentStep === "waiting" ? "YES contract created, waiting to create NO contract..." :
            currentStep === "no" ? "Creating NO contract..." :
            "Market creation complete!"
          }</p>
          {txLinks.yes && (
            <p className="mb-2">YES Transaction: <a href={txLinks.yes} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 break-all">{txLinks.yes}</a></p>
          )}
        </div>
      )}

      {showModal && TxResultModal(
        currentStep === "complete",
        () => {
          setShowModal(false);
        },
        modalTitle,
        modalMessage,
        txLinks.no || txLinks.yes
      )}
    </section>
  );
}
