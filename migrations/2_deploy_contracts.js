var ProxyFactory = artifacts.require('./ProxyFactory.sol');
var TargetContract = artifacts.require('./TargetContract.sol');
var Proxy = artifacts.require('./Proxy.sol');

module.exports = function(deployer) {
  deployer.deploy(ProxyFactory);
  deployer.deploy(TargetContract);
};
