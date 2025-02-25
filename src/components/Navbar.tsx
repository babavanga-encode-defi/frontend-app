"use client";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import {
  useLaserEyes,
  UNISAT,
  LEATHER,
  XVERSE,
  ORANGE,
  GLITTR,
  ProviderType,
  GLITTR_DEVNET,
} from "@glittr-sdk/lasereyes";
import { NETWORK, WALLET_API } from "../constants";
import { useNavigate } from 'react-router-dom';

const styles = `
  @font-face {
    font-family: 'Libre Baskerville';
    src: url('/LibreBaskerville-Bold.ttf') format('truetype');
    font-weight: bold;
    font-style: normal;
  }
`;

export default function Navbar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [balance, setBalance] = useState({ btc: 0, sats: 0 });
  const { connect, paymentAddress, connected, disconnect } = useLaserEyes();
  const [isCopied, setIsCopied] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<
    "multi" | "binary" | null
  >(null);

  const fetchBalance = async () => {
    if (!connected) return;

    try {
      const response = await fetch(`${WALLET_API}/address/${paymentAddress}`);
      const data = await response.json();

      const funded = data.chain_stats.funded_txo_sum;
      const spent = data.chain_stats.spent_txo_sum;
      const balanceSats = funded - spent;
      const balanceBtc = balanceSats / 100000000;

      setBalance({
        btc: balanceBtc,
        sats: balanceSats,
      });
    } catch (error) {
      console.error("Error fetching balance:", error);
    }
  };

  useEffect(() => {
    if (paymentAddress && connected) {
      fetchBalance();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentAddress]);

  const handleCopy = async () => {
    if (!paymentAddress) return;
    try {
      await navigator.clipboard.writeText(paymentAddress);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const connectWallet = (wallet: ProviderType) => {
    connect(wallet);
    setIsModalOpen(false);
  };

  const handleCreateMarket = () => {
    setIsCreateModalOpen(true);
    setSelectedOption(null);
  };

  const handleOptionSelect = (option: "multi" | "binary") => {
    setSelectedOption(option);
  };

  const handleCreateSubmit = () => {
    if (selectedOption) {
      navigate(`/create?type=${selectedOption}`);
      setIsCreateModalOpen(false);
    }
  };

  const navigate = useNavigate();

  return (
    <div className="relative bg-transparent font-funnel">
      <div className="flex justify-between items-center max-w-[1440px] mx-auto px-8 py-4">
        <div className="flex items-center">
          <style>{styles}</style>
          <a href="/">
            <h1 className="text-3xl font-['Libre_Baskerville'] font-bold">Baba Vanga</h1>
          </a>
        </div>

        <div className="flex items-center gap-3">
          {connected ? (
            <>
              <button onClick={handleCreateMarket} className="btn-glow py-1.5 px-4">
                <span>Create Market</span>
              </button>
              <a href="/account" className="btn-glow">
                <span>
                  {`${balance.btc.toFixed(8)} BTC`}
                </span>
              </a>
              <div
                className="relative"
                onMouseEnter={() => setIsDropdownOpen(true)}
                onMouseLeave={() => setIsDropdownOpen(false)}
              >
                <button className="btn-glow flex items-center gap-1 py-1.5 px-4 bg-[#0A0A0A] rounded-lg">
                  <span className="font-mono">
                    {paymentAddress.slice(0, 6)}...{paymentAddress.slice(-4)}
                  </span>
                </button>

                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="absolute right-0 mt-2 w-64 rounded-lg bg-[#0A0A0A] shadow-lg ring-1 ring-[#1a1a1a] z-50"
                    >
                      <div className="py-2">
                        <div className="px-4 py-3 text-sm text-white/50 border-b border-[#1a1a1a] flex items-center justify-between">
                          <span className="truncate">{paymentAddress}</span>
                          <button
                            onClick={handleCopy}
                            className="text-white/50 hover:text-white transition-colors ml-2"
                          >
                            {isCopied ? "✓" : "Copy"}
                          </button>
                        </div>
                        <div className="px-4 py-3 text-sm text-white/50 border-b border-[#1a1a1a]">
                          <div className="flex items-center justify-between">
                            <span>Balance</span>
                            <div className="flex flex-col items-end">
                              <span>{balance.btc.toFixed(8)} BTC</span>
                              <span className="text-xs text-white/30">
                                {balance.sats.toLocaleString()} sats
                              </span>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => disconnect()}
                          className="block w-full px-4 py-2 text-sm text-[#FF3737] hover:bg-[#1a1a1a] text-left"
                        >
                          Disconnect
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <button
              onClick={() => setIsModalOpen(true)}
              className="btn-glow py-1.5 px-4 rounded-lg bg-[#0A0A0A] hover:bg-[#1a1a1a] transition-colors"
            >
              <span>Connect Wallet</span>
            </button>
          )}
        </div>
      </div>
      <div className="absolute inset-0 bg-[#0A0A0A] -z-10" />
      <div className="absolute -bottom-24 left-0 right-0 h-[120px] bg-gradient-to-b from-[#0A0A0A] via-[#0A0A0A]/95 to-transparent -z-10" />

      {/* Modal for wallet selection */}
      {isModalOpen && (
        <div className="z-50 fixed inset-0 flex items-center justify-center bg-black bg-opacity-70">
          <div className="bg-[#1b1b1b] bg-opacity-80 rounded-lg border border-gray-800 p-6">
            <h2 className="text-lg font-funnel mb-4 text-gray-300">
              Select Wallet
            </h2>
            <div className="space-y-2">
              <button
                onClick={() => connectWallet(GLITTR)}
                className="w-full rounded-lg bg-[#1a1a1a] hover:bg-[#383838] border border-gray-700 transition-colors text-white p-2"
              >
                GLITTR WALLET
              </button>
              {NETWORK != GLITTR_DEVNET && (
                <>
                  <button
                    onClick={() => connectWallet(UNISAT)}
                    className="w-full rounded-lg bg-[#1a1a1a] hover:bg-[#383838] border border-gray-700 transition-colors text-white p-2"
                  >
                    UNISAT
                  </button>
                  <button
                    onClick={() => connectWallet(LEATHER)}
                    className="w-full rounded-lg bg-[#1a1a1a] hover:bg-[#383838] border border-gray-700 text-white transition-colors p-2"
                  >
                    LEATHER
                  </button>
                  <button
                    onClick={() => connectWallet(XVERSE)}
                    className="w-full rounded-lg bg-[#1a1a1a] hover:bg-[#383838] border border-gray-700 text-white transition-colors p-2"
                  >
                    XVERSE
                  </button>
                  <button
                    onClick={() => connectWallet(ORANGE)}
                    className="w-full rounded-lg bg-[#1a1a1a] hover:bg-[#383838] border border-gray-700 text-white transition-colors p-2"
                  >
                    ORANGE
                  </button>
                </>
              )}
            </div>
            <p className="mt-4 text-xs text-gray-200">
              To view and manage your Glittr assets. Install{" "}
              <a
                href="https://docs.glittr.fi/building-on-glittr/installing-glittr-wallet"
                target="_blank"
                rel="noopener noreferrer"
              >
                <u>Glittr Wallet</u>
              </a>
              !
            </p>
            <button
              onClick={() => setIsModalOpen(false)}
              className="mt-4 text-white"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Create Market Type Dialog with Overlay */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <AnimatePresence>
          {isCreateModalOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            />
          )}
        </AnimatePresence>
        <DialogContent className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-[#0A0A0A] border border-[#1a1a1a] rounded-2xl p-10 z-50">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-bold mb-8">
              What kind of market you want to create?
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-6">
            <button
              onClick={() => handleOptionSelect("multi")}
              className={`flex flex-col gap-3 p-6 rounded-xl border transition-all duration-200 text-center ${
                selectedOption === "multi"
                  ? "border-[#DB9AFF] bg-[#1a1a1a]"
                  : "border-[#1a1a1a] hover:border-[#DB9AFF]/50 hover:bg-[#1a1a1a]/50"
              }`}
            >
              <div className="text-lg font-bold">Multi-Outcome</div>
              <p className="text-sm text-white/50">
                Create a market with multiple possible outcomes where users
                can predict from various options.
              </p>
            </button>

            <button
              onClick={() => handleOptionSelect("binary")}
              className={`flex flex-col gap-3 p-6 rounded-xl border transition-all duration-200 text-center ${
                selectedOption === "binary"
                  ? "border-[#DB9AFF] bg-[#1a1a1a]"
                  : "border-[#1a1a1a] hover:border-[#DB9AFF]/50 hover:bg-[#1a1a1a]/50"
              }`}
            >
              <div className="text-lg font-bold">Binary</div>
              <p className="text-sm text-white/50">Create a market with two possible outcomes - Yes or No, Win or Lose, etc.</p>
            </button>
          </div>

          {selectedOption && (
            <div className="flex justify-end mt-4">
              <button
                onClick={handleCreateSubmit}
                className="bg-[rgb(186,154,238)] text-white px-8 py-2 rounded-lg text-lg font-bold shadow-[inset_0_0_150px_4px_rgba(88,45,155,1)] hover:shadow-[inset_0_0_200px_8px_rgba(88,45,155,1)] transition-shadow duration-200"
              >
                Select
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
