import Web3 from 'web3'
import UportSubprovider from './uportSubprovider'
import HttpProvider from 'web3/lib/web3/httpprovider'
import proxyArtifacts from '../build/contracts/Proxy.json'
import { default as contract } from 'truffle-contract'
import {Web3Util} from './ropsten';


// export const web3 = new Web3()
// web3.setProvider(new Web3.providers.HttpProvider('http://localhost:8545'))


export const web3 = Web3Util.createFromMnemonic('couch solve unique spirit wine fine occur rhythm foot feature glory away');

const ProxyContract = contract(proxyArtifacts)
ProxyContract.setProvider(web3.currentProvider)


const requestAddressHook = (proxyAddress) => () => {
  console.log('requestAddressHook()')
  return new Promise((resolve, reject) => {
    resolve(proxyAddress)
  })
}

const sendTransactionHook = (proxyAddress) => {
  return (txobj) => {
    console.log('sendTransactionHook() to proxy ' + proxyAddress + ': ' + JSON.stringify(txobj))

    return new Promise((resolve, reject) => {
      const contract = web3.eth.contract(proxyArtifacts.abi).at(proxyAddress);
      contract.forward(txobj.to, 0, txobj.data, {from: txobj.from}, (err, result) => {
        if (err) {
          console.log('instance.forward err: '+err);
          reject(err);
        } else {
          console.log('instance.forward result: '+result);
          resolve(result);
        }
      })

      // This version uses truffle-contract lib

      // ProxyContract.deployed().then(instance => {
      //   console.log('proxy contract at ' + instance.address)
      //   console.log('from: '+ web3.eth.accounts[0]);
      //   return instance.forward(txobj.to, 0, txobj.data, {from: web3.eth.accounts[0]})
      // }).then(result => {
      //   console.log(JSON.stringify(result))
      //   // We must resolve with tx hash
      //   resolve(result.tx)
      // }).catch(error => {
      //   console.error(error)
      //   reject(error)
      // })


    })
  }
}

const createSubProvider = (proxyAddress, provider) => {
  return new UportSubprovider({
    requestAddress: requestAddressHook(proxyAddress),
    sendTransaction: sendTransactionHook(proxyAddress),
    provider: provider
  })
}

export const getProxiedWeb3 = (proxyAddress) => {
  const provider = createSubProvider(proxyAddress, web3.currentProvider)
  const proxiedWeb3 = new Web3()
  proxiedWeb3.setProvider(provider)
  // Work around to issue with web3 requiring a from parameter. This isn't actually used.
  proxiedWeb3.eth.defaultAccount = '0xB42E70a3c6dd57003f4bFe7B06E370d21CDA8087'
  return proxiedWeb3
}
