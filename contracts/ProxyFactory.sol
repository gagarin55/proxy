pragma solidity ^0.4.4;

import "./Proxy.sol";

contract ProxyFactory {

    event ProxyCreated(
        address indexed userAddress,
        address proxy);

    mapping(address => address) public senderToProxy;

    function createProxy() {
        Proxy proxy = new Proxy();
        ProxyCreated(msg.sender, proxy);
        senderToProxy[msg.sender] = proxy;
    }
}