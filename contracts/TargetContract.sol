pragma solidity ^0.4.4;

contract TargetContract {

    event Call(address indexed caller, uint arg1);

    uint public lastArg1;

    function method(uint arg1) {
        lastArg1 = arg1;
        Call(msg.sender, arg1);
    }
}