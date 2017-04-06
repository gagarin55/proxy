import React, { Component } from 'react'
import { RaisedButton, Card, CardTitle, CardText, CardHeader } from 'material-ui'
import { Grid, Row, Col } from 'react-flexbox-grid-aphrodite'
import './App.css'
import { default as contract } from 'truffle-contract'
import proxyFactoryArtifacts from '../build/contracts/ProxyFactory.json'
import proxyArtifacts from '../build/contracts/Proxy.json'
import targetContractArtifacts from '../build/contracts/TargetContract.json'
import { web3, getProxiedWeb3 } from './web3util'
import EventLog from './components/eventLog'

const ProxyFactory = contract(proxyFactoryArtifacts)
ProxyFactory.setProvider(web3.currentProvider)

const Proxy = contract(proxyArtifacts)
Proxy.setProvider(web3.currentProvider)

const TargetContract = contract(targetContractArtifacts)
TargetContract.setProvider(web3.currentProvider)

/* Ropsten */
const proxyFactoryContract = '0x53e9f6fb892135481811746eca3b38530671d92b';
const targetContractAddress = '0x8f8676f680555ca066b4c2c28ff477cbb2361751';

/* Local */
// const proxyFactoryContract = '0xb5bd0ec6c2607c1647c44edab307abf815c14f34'
// const targetContractAddress = '0xa1c31993038e1d5eb66f80e1a65d1c2cab7d8a9a'

class App extends Component {

  constructor (props) {
    super(props)
    this.state = {}
  }

  componentDidMount () {
    const self = this
    self.setState({proxyFactoryContract: proxyFactoryContract})

    // Get our address
    web3.eth.getAccounts((err, accs) => {
      if (!err) {
        console.log('web3.eth.getAccounts = ' + accs)
        const account = accs[0]
        self.setState({account: account})

        // Let's get Proxy address for our from address
        ProxyFactory.at(proxyFactoryContract).then(instance => {
          return instance.senderToProxy.call(account)
        }).then(result => {
          console.log('instance.senderToProxy.call(account): ' + result)
          self.setState({proxyContract: result})
        })
      }
    })

  }

  createProxy = () => {
    console.log('createProxy')
    const self = this
    let factory;
    ProxyFactory.at(proxyFactoryContract).then(instance => {
      factory = instance;
      return instance.createProxy({from: this.state.account})
    }).then((result) => {
      console.log(JSON.stringify(result))
      return factory.senderToProxy.call(this.state.account)
    }).then(result => {
      console.log('instance.senderToProxy.call(account): ' + result)
      self.setState({proxyContract: result})
    })
  }

  callTargetDirectly = () => {
    console.log('callTargetDirectly()')
    const self = this
    let target
    TargetContract.at(targetContractAddress).then(instance => {
      target = instance
      return instance.method(1, {from: this.state.account})
    }).then((result) => {
      console.log('instance.method: ' + JSON.stringify(result))
      return target.lastArg1.call()
    }).then(result => {
      self.setState({targetValue: result.toNumber()})
      console.log('target.lastArg1: ' + result)
    })
  }

  callTargetByProxy = () => {
    const proxiedWeb3 = getProxiedWeb3(this.state.proxyContract)
    const targetContract = contract(targetContractArtifacts)
    targetContract.setProvider(proxiedWeb3.currentProvider)

    const self = this;
    let target
    targetContract.at(targetContractAddress).then(instance => {
      target = instance
      return instance.method(6, {from: this.state.account})
    }).then((result) => {
      console.log('instance.method: ' + JSON.stringify(result))
      return target.lastArg1.call()
    }).then(result => {
      console.log('target.lastArg1: ' + result)
      self.setState({targetValue: result.toNumber()})
    }).catch(error => {
      console.error('proxiedContract.method call error: ' + error)
    })
  }


  render () {
    const {proxyContract, account, targetValue} = this.state;
    const proxyFactoryAddress = this.state.proxyFactoryContract

    return (
      <div className="App">
        <Grid fluid style={{marginLeft: 0, width: 'auto'}}>
          <Row>
            <Col>
              <p className="App-intro">
                Your account <code><strong>{account}</strong></code>
              </p>
              <p className="App-intro">
                Your identity <code><strong>{proxyContract}</strong></code>
              </p>
              <p className="App-intro">
                Proxy Factory <code><strong>{proxyFactoryAddress}</strong></code>
              </p>
            </Col>
          </Row>
          <Row around="lg, xs">
            <Col lg={4}>
              <Card>
                <CardTitle>
                  <p>Proxy Factory <code><strong>{proxyFactoryAddress}</strong></code></p>
                  <RaisedButton label='Create Proxy'
                                primary
                                onTouchTap={this.createProxy}/>
                </CardTitle>
                <CardText>
                  <EventLog title="Proxy Factory Events"
                            contractAddress={proxyFactoryContract}
                            contractAbi={proxyFactoryArtifacts.abi}/>
                </CardText>
              </Card>
            </Col>
            <Col lg={4}>
              <Card>
                <CardHeader>
                  <p>Your identity (Proxy conract) <code><strong>{proxyContract}</strong></code></p>
                </CardHeader>
                <CardText>
                  {proxyContract &&
                    (<EventLog title="Proxy events"
                      contractAddress={proxyContract}
                      contractAbi={proxyArtifacts.abi}
                    />)
                  }
                </CardText>
              </Card>
            </Col>


            <Col lg={4}>
              <Card>
                <CardTitle>
                  <p>Target contract {targetContractAddress}</p>
                  <p>Target value: <strong>{targetValue}</strong></p>
                  <RaisedButton label='Call Directly'
                                primary
                                onTouchTap={this.callTargetDirectly}/>
                  <RaisedButton label='Call Through Proxy'
                                primary
                                onTouchTap={this.callTargetByProxy}/>
                </CardTitle>
                <CardText>
                  <EventLog title="TargetContract Events"
                            contractAddress={targetContractAddress}
                            contractAbi={targetContractArtifacts.abi}/>
                </CardText>
              </Card>
            </Col>
          </Row>
        </Grid>
      </div>
    )
  }
}

export default App
