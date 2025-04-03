export const ERC721_ABI = [
  "function getTokenIdCounter() external view returns (uint256)",
  "function getMetadata(uint256 tokenId, string[] memory keys) external view returns (string[] memory)",
  "function getTokenData(uint256 tokenId) external view returns (address erc20Token,uint256 totalSupply,uint112 reserve0,uint112 reserve1,address pairAddress)",
];
