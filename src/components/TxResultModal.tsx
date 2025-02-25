import { Dispatch, SetStateAction } from "react";
import { EXPLORER } from "../constants";

export const TxResultModal = (
  success: boolean,
  onClose: () => void,
  title: string,
  message: string,
  txLink?: string
) => (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
    <div className="bg-[#1a1a1a] rounded-lg max-w-lg w-full p-6 border border-gray-700">
      <div className="flex items-center gap-3 mb-4">
        {success ? (
          <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
            <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        ) : (
          <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
            <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        )}
        <h3 className="text-xl font-bold">{title}</h3>
      </div>
      
      <p className="text-gray-300 mb-6">{message}</p>
      
      {txLink && (
        <div className="mb-6 p-3 bg-black/30 rounded-lg">
          <p className="text-sm text-gray-400 mb-1">Transaction Link:</p>
          <a 
            href={txLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 text-sm break-all"
          >
            {txLink}
          </a>
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-[#383838] hover:bg-[#404040] rounded-lg transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  </div>
);