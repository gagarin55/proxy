// @flow
import bip39 from 'bip39';
import hdkey from 'ethereumjs-wallet/hdkey';
import Wallet from 'ethereumjs-wallet';
import ProviderEngine from 'web3-provider-engine';
import WalletSubprovider from 'web3-provider-engine/subproviders/wallet.js';
import Web3Subprovider from 'web3-provider-engine/subproviders/web3.js';
import Web3 from 'web3';
import {toBuffer} from 'ethereumjs-util';
import FilterSubprovider from 'web3-provider-engine/subproviders/filters.js';

/**
 * Light wrapper to instantiate web3 from mnemonic phrase
 */
export class Web3Util {

  static createInstance(wallet) {
    const providerUrl = 'https://testnet.infura.io'

    const engine = new ProviderEngine()
    engine.addProvider(new FilterSubprovider())
    engine.addProvider(new WalletSubprovider(wallet, {}))
    engine.addProvider(new Web3Subprovider(new Web3.providers.HttpProvider(providerUrl)))
    engine.start() // Required by the provider engine.

    return new Web3(engine)
  }

  static createFromMnemonic(mnemonic) {
    return Web3Util.createInstance(Web3Util.hdWallet(mnemonic));
  }

  static createFromPrivateKey(privateKey) {
    return Web3Util.createInstance(Web3Util.privateKeyWallet(privateKey))
  }

  static hdWallet(mnemonic){
    const hdwallet = hdkey.fromMasterSeed(bip39.mnemonicToSeed(mnemonic))
    // Get the first account using the standard hd path.
    const walletHDPath = 'm/44\'/60\'/0\'/0/'
    return hdwallet.derivePath(walletHDPath + '0').getWallet()
  }

  static privateKeyWallet(privateKey){
    return Wallet.fromPrivateKey(toBuffer(privateKey))
  }
}
