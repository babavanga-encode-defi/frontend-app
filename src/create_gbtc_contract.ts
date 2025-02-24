import {
    Account,
    addFeeToTx,
    BitcoinUTXO,
    electrumFetchNonGlittrUtxos,
    GlittrSDK,
    OpReturnMessage,
    Output,
    txBuilder
  } from "@glittr-sdk/sdk";
  import { GLITTR_API, NETWORK, WALLET_API, WIF, API_KEY} from "./constants";

  const client = new GlittrSDK({
    network: NETWORK,
    apiKey: API_KEY,
    glittrApi: GLITTR_API,
    electrumApi: WALLET_API
  });

  const creatorAccount = new Account({
    wif: WIF,
    network: NETWORK,
  });  

async function deployGBTCContract() {
  
    const tx: OpReturnMessage = {
      contract_creation: {
        contract_type: {
            moa: {
                divisibility: 9,
                live_time: 0,
                mint_mechanism: {
                    purchase: {
                        input_asset: {
                            raw_btc: {}
                        },
                        ratio: {
                            fixed: {
                                ratio: [1,1]
                            }
                        },
                        pay_to_key: Array.from(creatorAccount.p2pkh().keypair.publicKey)
                    }
                }
            }
        }
      }
    }
  
    const address = creatorAccount.p2pkh().address
    const utxos = await electrumFetchNonGlittrUtxos(client, address)
    const nonFeeInputs: BitcoinUTXO[] = []
    const nonFeeOutputs: Output[] = [
      { script: txBuilder.compile(tx), value: 0 }, // Output #0 should always be OP_RETURN
      { address: address, value: 546 }
    ]
  
    const { inputs, outputs } = await addFeeToTx(NETWORK, address, utxos, nonFeeInputs, nonFeeOutputs)
  
    const txid = await client.createAndBroadcastRawTx({
      account: creatorAccount.p2pkh(),
      inputs,
      outputs
    })
  
    console.log(`TXID : ${txid}`)
  }

  deployGBTCContract()