import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Toaster, toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import { txBuilder, GlittrSDK } from "@glittr-sdk/sdk";
import { Psbt } from "bitcoinjs-lib";
import { GLITTR_API, NETWORK, WALLET_API, API_KEY } from ".././constants";
import { useLaserEyes } from "@glittr-sdk/lasereyes";
import { createMarketContract } from "../create_market_contract";
import { Account } from "@glittr-sdk/sdk";
import MarketCreatedModal from '../components/MarketCreatedModal';
import CircularTimer from '../components/CircularTimer';
import { storageManager } from '../utils/storage';

interface Option {
  id: number;
  value: string;
}

interface DateValidationResult {
  isValid: boolean;
  message: string;
}

const client = new GlittrSDK({
  network: NETWORK!,
  electrumApi: WALLET_API!,
  glittrApi: GLITTR_API!,
  apiKey: API_KEY,
});

export default function Create() {
  const [searchParams] = useSearchParams();
  const marketType = searchParams.get('type');
  const navigate = useNavigate();
  
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imageError, setImageError] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('23:59');
  const [options, setOptions] = useState<Option[]>([
    { id: 1, value: '' }, 
    { id: 2, value: '' },
    { id: 3, value: '' }  // Start with 3 required options
  ]);
  const [initialLiquidity, setInitialLiquidity] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState('');
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [dateError, setDateError] = useState(false);
  const [liquidityError, setLiquidityError] = useState(false);
  const [titleError, setTitleError] = useState(false);
  const [optionsError, setOptionsError] = useState<number[]>([]);
  const [tagsError, setTagsError] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [marketNumber, setMarketNumber] = useState<string>('');
  const [createdMarketId, setCreatedMarketId] = useState<string | number>('');
  const [showTimer, setShowTimer] = useState(false);

  const availableTags = ['Sports', 'Politics', 'Tech', 'Entertainment', 'Finance', 'Gaming', 'Social'];

  const { paymentAddress, connected, signPsbt, paymentPublicKey } = useLaserEyes();
  
  // Get account from LaserEyes
  const account = connected && paymentPublicKey && paymentAddress ? {
    p2wpkh: () => ({
      address: paymentAddress
    }),
    network: NETWORK,
    p2pkh: () => ({
      address: paymentAddress
    }),
    p2tr: () => ({
      address: paymentAddress
    }),
    publicKey: paymentPublicKey,
  } : null;

  useEffect(() => {
    console.log("Wallet connection state:", {
      connected,
      hasPaymentAddress: !!paymentAddress,
      hasPublicKey: !!paymentPublicKey,
      hasAccount: !!account
    });

    if (!connected) {
      navigate('/');
      toast.error("Please connect your wallet first!");
    }
  }, [connected, paymentAddress, paymentPublicKey, account, navigate]);

  useEffect(() => {
    // Reset modal state when component mounts
    setShowSuccessModal(false);
    
    // Cleanup when component unmounts
    return () => {
      setShowSuccessModal(false);
    };
  }, []);

  const addOption = () => {
    const newId = options.length > 0 ? Math.max(...options.map(o => o.id)) + 1 : 1;
    setOptions([...options, { id: newId, value: '' }]);
  };

  const removeOption = (id: number) => {
    // Only allow removing non-required options (index >= 3)
    const index = options.findIndex(opt => opt.id === id);
    if (index >= 3) {
      setOptions(options.filter(option => option.id !== id));
    }
  };

  const updateOption = (id: number, value: string) => {
    setOptions(options.map(option => 
      option.id === id ? { ...option, value } : option
    ));
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const addCustomTag = () => {
    if (customTag.trim()) {
      setSelectedTags(prev => [...prev, customTag.trim()]);
      setCustomTag('');
      setIsAddingTag(false);
    }
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setFullYear(maxDate.getFullYear() + 5); // Max 5 years in the future
    return maxDate.toISOString().split('T')[0];
  };

  const validateDateTime = (date: string, time: string): DateValidationResult => {
    if (!date || !time) return {
      isValid: false,
      message: "Date and time are required"
    };
    
    const [hours, minutes] = time.split(':').map(Number);
    const selectedDate = new Date(date);
    selectedDate.setHours(hours, minutes, 0, 0);
    
    const now = new Date();
    const maxDate = new Date();
    maxDate.setFullYear(maxDate.getFullYear() + 5);
    
    if (selectedDate <= now) {
      return { isValid: false, message: "End date and time must be in the future" };
    }

    if (selectedDate > maxDate) {
      return { isValid: false, message: "End date cannot be more than 5 years in the future" };
    }

    return { isValid: true, message: "" };
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEndDate(e.target.value);
    setDateError(false);
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEndTime(e.target.value);
    setDateError(false);
  };

  const handleLiquidityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInitialLiquidity(value);
    // Only clear error state, don't validate yet
    setLiquidityError(false);
  };

  const handleLiquidityBlur = () => {
    if (!initialLiquidity) return;
    
    const liquidityAmount = parseFloat(initialLiquidity);
    if (isNaN(liquidityAmount) || liquidityAmount < 100) {
      toast.error("Initial liquidity must be at least $100", {
        position: "top-center",
        duration: 2000,
      });
      setLiquidityError(true);
    }
  };

  const handleDateTimeBlur = () => {
    if (!endDate || !endTime) return;
    
    const validation = validateDateTime(endDate, endTime);
    if (!validation.isValid) {
      toast.error(validation.message, {
        position: "top-center",
        duration: 2000,
      });
      setDateError(true);
    }
  };

  const generateMarketTicker = (title: string): string => {
    // Remove special characters and spaces, keep alphanumeric
    const cleanTitle = title.replace(/[^a-zA-Z0-9]/g, '');
    
    // Take first 5 characters (or less if title is shorter)
    const prefix = cleanTitle.substring(0, 5).toUpperCase();
    
    // Add a timestamp suffix to ensure uniqueness
    const timestamp = Date.now().toString().slice(-4);
    
    // Combine with a separator
    return `${prefix}${timestamp}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (!connected || !account || !signPsbt) {
        toast.error("Please connect your wallet first");
        return;
      }

      // Create YES contract
      const result = await createMarketContract(
        account as any,
        title,
        client,
        signPsbt,
        () => {
          // After YES contract success
          setShowTimer(true);
        },
        () => {
          // After NO contract success
          setShowTimer(false);
        }
      );
      
      // Store market data using the safe storage method
      const marketData = {
        id: result.marketNumber,
        title,
        description,
        liquidity: initialLiquidity,
        endDate,
        endTime,
        tags: selectedTags,
        yesTxid: result.yesTxid,
        noTxid: result.noTxid,
        imageUrl: imagePreview,
        createdAt: new Date().toISOString()
      };

      const existingMarkets = JSON.parse(localStorage.getItem('markets') || '[]');
      storageManager.safeSetItem('markets', [...existingMarkets, marketData]);
      
      setMarketNumber(result.marketNumber);
      setCreatedMarketId(result.marketNumber);
      setIsSuccess(true);
      setShowSuccessModal(true);

    } catch (error) {
      console.error("Transaction error:", error);
      toast.error("Failed to create market. Please try again.");
      setIsSuccess(false);
      setShowTimer(false);
    }
  };

  // Update input field classes based on error state
  const getInputErrorClass = (hasError: boolean) => 
    hasError ? 'border-[#ff5e5e] focus:border-[#ff5e5e]' : 'border-[#1a1a1a] focus:border-[#DB9AFF]';

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error("Image size should be less than 5MB", {
          position: "top-center",
          duration: 2000,
        });
        setImageError(true);
        return;
      }
      setSelectedImage(file);
      setImageError(false);
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeAllExtraOptions = () => {
    // Keep only the first 3 required options
    setOptions(options.slice(0, 3));
  };

  const handleTypeChange = () => {
    setIsTypeModalOpen(true);
  };

  const handleCloseModal = () => {
    setShowSuccessModal(false);
    setIsSuccess(false);
    
    // Reset form fields
    setTitle('');
    setDescription('');
    setEndDate('');
    setEndTime('23:59');
    setInitialLiquidity('');
    setSelectedTags([]);
    setImagePreview(null);
    setSelectedImage(null);
    
    // Reset file input
    const fileInput = document.getElementById('image-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
    
    // Reset any error states
    setImageError(false);
    setDateError(false);
    setLiquidityError(false);
    setTitleError(false);
    setOptionsError([]);
    setTagsError(false);

    // Reset market creation states
    setMarketNumber('');
    setCreatedMarketId('');
    setShowTimer(false);
  };

  return (
    <main className="min-h-screen bg-[#0A0A0A] text-white overflow-hidden">
      <Toaster />
      <div className="fixed bottom-0 left-0 right-0 h-[150px] bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/90 via-[#0A0A0A]/50 to-transparent z-50" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="pt-24 px-8 max-w-[1000px] mx-auto mb-36"
      >
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="bg-[#0A0A0A] rounded-lg border border-[#1a1a1a] overflow-hidden p-8"
        >
          <div className="flex items-center justify-between mb-8">
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-2xl font-bold"
            >
              Create {marketType === 'multi' ? 'Multi-Outcome' : 'Binary'} Market
            </motion.h1>
            <button
              onClick={() => navigate(`/create?type=${marketType === 'multi' ? 'binary' : 'multi'}`)}
              className="flex items-center gap-2 text-white/50 hover:text-white transition-colors"
            >
              <span>Create {marketType === 'multi' ? 'Binary' : 'Multi-Outcome'} Market</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 17L17 7"/>
                <path d="M7 7h10v10"/>
              </svg>
            </button>
          </div>

          <form 
            onSubmit={handleSubmit} 
            className="space-y-6"
            noValidate={true}
          >
            <div className="grid grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-white/50 mb-2">
                    Market Title <span className="text-[#ff5e5e]">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute -top-2 left-0 right-0 h-6 bg-gradient-to-b from-[#0A0A0A] to-transparent z-10" />
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => {
                        setTitle(e.target.value);
                        setTitleError(false);
                      }}
                      placeholder={marketType === 'multi' 
                        ? "e.g., Who will win 2025 Cricket Championship?" 
                        : "e.g., Will Elon Musk win 2025 Presidency?"}
                      className={`relative w-full p-3 bg-[#1a1a1a] border rounded-lg text-white placeholder-white/30 focus:outline-none transition-colors duration-200 ${getInputErrorClass(titleError)}`}
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-white/50 mb-2">
                    Market Description (optional)
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Add more details about your market..."
                    className="w-full p-3 bg-[#1a1a1a] border border-[#1a1a1a] rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-[#DB9AFF] min-h-[100px]"
                  />
                </div>

                {/* End Date */}
                <div>
                  <label className="block text-sm font-medium text-white/50 mb-2">
                    End Date & Time <span className="text-[#ff5e5e]">*</span>
                  </label>
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <input
                        type="date"
                        value={endDate}
                        onChange={handleDateChange}
                        onBlur={handleDateTimeBlur}
                        min={getMinDate()}
                        max={getMaxDate()}
                        className={`w-full p-3 bg-[#1a1a1a] border rounded-lg text-white focus:outline-none transition-colors duration-200 ${getInputErrorClass(dateError)} [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-30 [&::-webkit-calendar-picker-indicator]:hover:opacity-50 [&::-webkit-datetime-edit-fields-wrapper]:text-white/70 [&::-webkit-datetime-edit-day-field]:text-white [&::-webkit-datetime-edit-month-field]:text-white [&::-webkit-datetime-edit-year-field]:text-white [&::-webkit-calendar-picker-indicator]:p-1`}
                      />
                    </div>
                    <div className="w-44">
                      <input
                        type="time"
                        value={endTime}
                        onChange={handleTimeChange}
                        onBlur={handleDateTimeBlur}
                        className={`w-full p-3 bg-[#1a1a1a] border rounded-lg text-white focus:outline-none transition-colors duration-200 ${getInputErrorClass(dateError)} [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-30 [&::-webkit-calendar-picker-indicator]:hover:opacity-50 [&::-webkit-datetime-edit-fields-wrapper]:text-white/70 [&::-webkit-datetime-edit-hour-field]:text-white [&::-webkit-datetime-edit-minute-field]:text-white [&::-webkit-datetime-edit-ampm-field]:text-white [&::-webkit-calendar-picker-indicator]:p-1`}
                      />
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-white/30">
                    Market will end at the specified date and time
                  </p>
                </div>

                {/* Initial Liquidity */}
                <div>
                  <label className="block text-sm font-medium text-white/50 mb-2">
                    Initial Liquidity <span className="text-[#ff5e5e]">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={initialLiquidity}
                      onChange={handleLiquidityChange}
                      onBlur={handleLiquidityBlur}
                      placeholder="Minimum $100"
                      min="100"
                      step="1"
                      className={`w-full p-3 pl-8 bg-[#1a1a1a] border rounded-lg text-white placeholder-white/30 focus:outline-none transition-colors duration-200 ${getInputErrorClass(liquidityError)}`}
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50">$</span>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Options */}
                {marketType === 'multi' && (
                  <div className="relative">
                    <label className="block text-sm font-medium text-white/50 mb-2">
                      Options <span className="text-[#ff5e5e]">*</span>
                    </label>
                    <div className="relative flex flex-col">
                      <div className="relative flex-1">
                        <div className="absolute -top-2 left-0 right-0 h-6 bg-gradient-to-b from-[#0A0A0A] to-transparent z-10" />
                        <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-[#0A0A0A] to-transparent z-10" />
                        <div className="space-y-3 h-[232px] overflow-y-auto scrollbar-none">
                          <AnimatePresence>
                            {options.map((option, index) => (
                              <motion.div 
                                key={option.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="relative flex gap-3"
                              >
                                <input
                                  type="text"
                                  value={option.value}
                                  onChange={(e) => {
                                    updateOption(option.id, e.target.value);
                                    setOptionsError(prev => prev.filter(i => i !== index));
                                  }}
                                  placeholder={`Option ${index + 1}${index < 3 ? ' *' : ''}`}
                                  className={`w-full p-3 pr-12 bg-[#1a1a1a] border rounded-lg text-white placeholder-white/30 focus:outline-none transition-colors duration-200 ${getInputErrorClass(optionsError.includes(index))}`}
                                />
                                {index >= 3 && (
                                  <button
                                    type="button"
                                    onClick={() => removeOption(option.id)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-3 text-white/50 hover:text-white transition-colors"
                                  >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                      <path d="M18 6L6 18M6 6l12 12"/>
                                    </svg>
                                  </button>
                                )}
                              </motion.div>
                            ))}
                          </AnimatePresence>
                        </div>
                        {options.length > 4 && (
                          <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center pb-2 text-white/50 text-sm">
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-2 bg-[#0A0A0A] px-3 py-1 rounded-full border border-[#1a1a1a]">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M12 5v14M5 12h14"/>
                                </svg>
                                {options.length - 4} more options
                              </div>
                              <button
                                type="button"
                                onClick={removeAllExtraOptions}
                                className="flex items-center gap-2 bg-[#1a1a1a] px-4 py-1 rounded-full text-white/70 hover:text-[#ff5e5e] transition-all duration-200 hover:shadow-[0_0_15px_rgba(255,94,94,0.3)] border border-[#ff5e5e]/50 hover:border-[#ff5e5e]"
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M18 6L6 18M6 6l12 12"/>
                                </svg>
                                Delete All
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="mt-4 pt-2">
                        <button
                          type="button"
                          onClick={addOption}
                          className="text-[#DB9AFF] hover:text-[#DB9AFF]/80 transition-colors text-sm flex items-center gap-2"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 5v14M5 12h14"/>
                          </svg>
                          Add Option
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tags */}
                <div className="relative">
                  <div className="flex items-center gap-2">
                    <label className="block text-sm font-medium text-white/50">
                      Tags <span className="text-[#ff5e5e]">*</span>
                    </label>
                    {tagsError && (
                      <span className="text-xs text-[#ff5e5e]">Select at least one tag</span>
                    )}
                  </div>
                  <div className="relative">
                    <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-[#0A0A0A] to-transparent z-10" />
                    <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-[#0A0A0A] to-transparent z-10" />
                    <div className="max-h-[120px] overflow-y-auto scrollbar-none py-2">
                      <div className="flex flex-wrap gap-2">
                        {availableTags.map((tag) => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => {
                              toggleTag(tag);
                              setTagsError(false);
                            }}
                            className={`px-4 py-2 rounded-full text-sm transition-all duration-200 ${
                              selectedTags.includes(tag)
                                ? 'bg-[#DB9AFF] text-black font-medium'
                                : 'bg-[#1a1a1a] text-white/50 hover:text-white hover:bg-[#1a1a1a]/60'
                            }`}
                          >
                            {tag}
                          </button>
                        ))}
                        <AnimatePresence mode="popLayout">
                          {selectedTags.map(tag => !availableTags.includes(tag) && (
                            <motion.button
                              key={tag}
                              layout
                              initial={{ scale: 0.8, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0.8, opacity: 0 }}
                              transition={{ 
                                type: "spring",
                                stiffness: 500,
                                damping: 25,
                                mass: 1
                              }}
                              type="button"
                              onClick={() => toggleTag(tag)}
                              className="px-4 py-2 rounded-full text-sm bg-[#DB9AFF] text-black font-medium"
                            >
                              {tag}
                            </motion.button>
                          ))}
                        </AnimatePresence>
                        {isAddingTag ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={customTag}
                              onChange={(e) => setCustomTag(e.target.value)}
                              placeholder="Enter tag"
                              className="p-2 bg-[#1a1a1a] border border-[#1a1a1a] rounded-full text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#DB9AFF] w-32"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  addCustomTag();
                                }
                              }}
                            />
                            <button
                              type="button"
                              onClick={addCustomTag}
                              className="p-2 text-[#DB9AFF] hover:text-[#DB9AFF]/80"
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M5 12h14"/>
                                <path d="M12 5v14"/>
                              </svg>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setIsAddingTag(false);
                                setCustomTag('');
                              }}
                              className="p-2 text-white/50 hover:text-white"
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M18 6L6 18M6 6l12 12"/>
                              </svg>
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setIsAddingTag(true)}
                            className="px-4 py-2 rounded-full text-sm bg-[#1a1a1a] text-[#DB9AFF] hover:bg-[#1a1a1a]/60 flex items-center gap-2"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M12 5v14M5 12h14"/>
                            </svg>
                            Add Tag
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Image Upload for Binary Markets */}
                {marketType === 'binary' && (
                  <div>
                    <label className="block text-sm font-medium text-white/50 mb-2">
                      Cover Image <span className="text-[#ff5e5e]">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                        id="image-upload"
                        key={imagePreview || 'reset'}
                      />
                      <label
                        htmlFor="image-upload"
                        className={`relative w-full h-48 flex flex-col items-center justify-center bg-[#1a1a1a] border rounded-lg cursor-pointer transition-colors duration-200 overflow-hidden ${
                          imageError ? 'border-[#ff5e5e]' : imagePreview ? 'border-[#DB9AFF]' : 'border-[#1a1a1a] hover:border-[#DB9AFF]/50'
                        }`}
                      >
                        {imagePreview ? (
                          <>
                            <img
                              src={imagePreview}
                              alt="Preview"
                              className="absolute inset-0 w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                              <span className="text-white text-sm">Change Image</span>
                            </div>
                          </>
                        ) : (
                          <>
                            <svg
                              width="32"
                              height="32"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              className="text-white/30 mb-2"
                            >
                              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7"/>
                              <line x1="16" y1="5" x2="22" y2="5"/>
                              <line x1="19" y1="2" x2="19" y2="8"/>
                              <circle cx="9" cy="9" r="2"/>
                              <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                            </svg>
                            <span className="text-white/30 text-sm">Upload Image</span>
                            <span className="text-white/30 text-xs mt-1">Max size: 5MB</span>
                          </>
                        )}
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSuccess}
                className={`w-full ${
                  isSuccess 
                    ? 'bg-green-500 cursor-not-allowed'
                    : 'bg-[rgb(186,154,238)] shadow-[inset_0_0_150px_4px_rgba(88,45,155,1)] hover:shadow-[inset_0_0_200px_8px_rgba(88,45,155,1)]'
                } text-white px-8 py-3 rounded-lg text-xl font-bold transition-all duration-200 flex items-center justify-center gap-2`}
              >
                {isSuccess ? (
                  <>
                    <svg className="w-6 h-6" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                    Market Created!
                  </>
                ) : (
                  'Create Market'
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>

      {showSuccessModal && (
        <MarketCreatedModal 
          marketId={createdMarketId}
          onClose={handleCloseModal}
        />
      )}

      {showTimer && (
        <CircularTimer 
          duration={65}
          onComplete={() => setShowTimer(false)} 
        />
      )}

      {/* Type Change Modal */}
      <Dialog open={isTypeModalOpen} onOpenChange={setIsTypeModalOpen}>
        <DialogContent className="bg-[#0A0A0A] border border-[#1a1a1a] text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-bold mb-8">
              Switch to {marketType === 'multi' ? 'Binary' : 'Multi-Outcome'} Market?
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-6">
            <p className="text-center text-white/70">
              Are you sure you want to switch? Your current progress will be lost.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setIsTypeModalOpen(false)}
                className="px-6 py-2 rounded-lg border border-[#1a1a1a] text-white/70 hover:text-white hover:bg-[#1a1a1a] transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setIsTypeModalOpen(false);
                  navigate(`/create?type=${marketType === 'multi' ? 'binary' : 'multi'}`);
                }}
                className="px-6 py-2 rounded-lg bg-[rgb(186,154,238)] text-white shadow-[inset_0_0_150px_4px_rgba(88,45,155,1)] hover:shadow-[inset_0_0_200px_8px_rgba(88,45,155,1)] transition-all duration-200"
              >
                Switch
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}