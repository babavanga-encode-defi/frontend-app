import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css' // or './App.css' depending on your setup
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
// import Mint from "./step_0.tsx";
// import ParticlesBackground fsrom "./components/ParticlesBackground.tsx";
import { LaserEyesProvider, GLITTR_DEVNET, TESTNET4 } from "@glittr-sdk/lasereyes";
import NavigationWrapper from "./components/NavigationWrapper.tsx";
import { NETWORK } from "./constants";

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* <ParticlesBackground /> */}
    {/* Provider for Wallet Connection */}
    <LaserEyesProvider config={{ network: NETWORK == "regtest" ? GLITTR_DEVNET : NETWORK == "testnet" ? TESTNET4 : NETWORK}}> 
      <NavigationWrapper />
      {/* <Mint /> */}
    </LaserEyesProvider>
  </React.StrictMode>
)
