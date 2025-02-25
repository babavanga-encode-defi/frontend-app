import { 
  GlittrSDK, 
  txBuilder,
  Account
} from "@glittr-sdk/sdk";
import { Psbt } from "bitcoinjs-lib";

// Helper function to generate random market number
function generateRandomMarketNumber(): string {
  // Generate a random number between 100000 and 999999
  const random = Math.floor(100000 + Math.random() * 899999);
  return random.toString();
}

export async function createMarketContract(
  account: Account,
  marketTitle: string,
  client: GlittrSDK,
  signPsbt: (psbtHex: string, finalize?: boolean, broadcast?: boolean) => Promise<{ signedPsbtHex?: string } | undefined>,
  onYesCreated?: (txid: string) => void,
  onNoCreated?: (txid: string) => void
) {
  console.log('Creating market with title:', marketTitle);
  try {
    const marketNumber = generateRandomMarketNumber();
    console.log("Generated market number:", marketNumber);
    
    // Create YES Contract
    const yesTicker = `Y${marketNumber}`;
    console.log("Creating YES contract with ticker:", yesTicker);

    // Create and broadcast YES transaction
    const yesTx = txBuilder.contractInstantiate({
      ticker: yesTicker,
      divisibility: 0,
      live_time: 0,
      supply_cap: "100000",
      mint_mechanism: {
        free_mint: {
          amount_per_mint: "10"
        }
      }
    });

    const yesPsbt = await client.createTx({
      address: account.p2wpkh().address,
      tx: yesTx,
      outputs: []
    });

    const yesResult = await signPsbt(yesPsbt.toHex(), false, false);
    if (!yesResult?.signedPsbtHex) {
      throw new Error("Failed to sign YES transaction");
    }

    const finalizedYesPsbt = Psbt.fromHex(yesResult.signedPsbtHex);
    finalizedYesPsbt.finalizeAllInputs();
    const yesTxHex = finalizedYesPsbt.extractTransaction(true).toHex();
    const yesTxid = await client.broadcastTx(yesTxHex);
    console.log("YES contract created:", yesTxid);
    
    // Notify component about YES completion
    if (onYesCreated) {
      onYesCreated(yesTxid);
    }

    // Wait 65 seconds before creating NO contract
    console.log("Waiting 65 seconds before creating NO contract...");
    await new Promise(resolve => setTimeout(resolve, 65000));

    // Create NO Contract with same number
    const noTicker = `N${marketNumber}`;
    console.log("Creating NO contract with ticker:", noTicker);

    const noTx = txBuilder.contractInstantiate({
      ticker: noTicker,
      divisibility: 0,
      live_time: 0,
      supply_cap: "100000",
      mint_mechanism: {
        free_mint: {
          amount_per_mint: "10"
        }
      }
    });

    const noPsbt = await client.createTx({
      address: account.p2wpkh().address,
      tx: noTx,
      outputs: []
    });

    const noResult = await signPsbt(noPsbt.toHex(), false, false);
    if (!noResult?.signedPsbtHex) {
      throw new Error("Failed to sign NO transaction");
    }

    const finalizedNoPsbt = Psbt.fromHex(noResult.signedPsbtHex);
    finalizedNoPsbt.finalizeAllInputs();
    const noTxHex = finalizedNoPsbt.extractTransaction(true).toHex();
    const noTxid = await client.broadcastTx(noTxHex);
    console.log("NO contract created:", noTxid);

    // Return the result first
    const result = { yesTxid, noTxid, marketNumber };

    // Then notify about NO completion
    if (onNoCreated) {
      onNoCreated(noTxid);
    }

    return result;

  } catch (error) {
    console.error("Error in createMarketContract:", error);
    throw error;
  }
}