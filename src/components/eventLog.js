import React from 'react';
import {web3} from '../web3util';

class EventLog extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      events: []
    }
  }

  componentDidMount() {
    const self = this;
    const address = this.props.contractAddress;
    const contract = web3.eth.contract(this.props.contractAbi);
    const events = contract.at(address).allEvents({fromBlock: 0, toBlock: 'latest'});

    events.watch(function(error, event) {
      if (error) {
        console.error(error);
        return;
      }
      const arr = self.state.events.concat(event);
      self.setState({events: arr});
    })

    this.setState({filter: events});
  }

  render() {
    const events = this.state.events || [];
    console.log('EventLog.events='+events);
    return (
     <div>
      <p>{this.props.title}</p>
       <ul>
         {events && events.length > 0 && events.map(e => (
           <li key={e.transactionHash}>
             {JSON.stringify(e.args)}
         </li>))}
       </ul>
     </div>
    );
  }
}


export default EventLog;