export const UNIPAIR_ABI = [
    {
      "constant": true,
      "inputs": [],
      "name": "token0",
      "outputs": [{ "name": "", "type": "address" }],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [],
      "name": "token1",
      "outputs": [{ "name": "", "type": "address" }],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [],
      "name": "getReserves",
      "outputs": [
        { "name": "reserve0", "type": "uint112" },
        { "name": "reserve1", "type": "uint112" },
        { "name": "blockTimestampLast", "type": "uint32" }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "anonymous": false,
      "inputs": [
        { "indexed": true, "name": "sender", "type": "address" },
        { "indexed": false, "name": "amount0In", "type": "uint256" },
        { "indexed": false, "name": "amount1In", "type": "uint256" },
        { "indexed": false, "name": "amount0Out", "type": "uint256" },
        { "indexed": false, "name": "amount1Out", "type": "uint256" },
        { "indexed": true, "name": "to", "type": "address" }
      ],
      "name": "Swap",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        { "indexed": true, "name": "from", "type": "address" },
        { "indexed": true, "name": "to", "type": "address" },
        { "indexed": false, "name": "value", "type": "uint256" }
      ],
      "name": "Transfer",
      "type": "event"
    }
  ];