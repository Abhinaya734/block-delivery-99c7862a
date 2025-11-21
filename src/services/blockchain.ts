import { ethers } from 'ethers';
import { Delivery, DeliveryStatus, Location } from '@/types/delivery';

// Smart Contract ABI (simplified for demo)
const CONTRACT_ABI = [
  "function createDelivery(string memory _trackingNumber, string memory _recipient, string memory _origin, string memory _destination) public returns (uint256)",
  "function updateStatus(uint256 _deliveryId, uint8 _status) public",
  "function updateLocation(uint256 _deliveryId, int256 _latitude, int256 _longitude, string memory _address) public",
  "function getDelivery(uint256 _deliveryId) public view returns (tuple(string trackingNumber, address sender, string recipient, string origin, string destination, uint8 status, uint256 timestamp))",
  "function getAllDeliveries() public view returns (uint256[])",
  "event DeliveryCreated(uint256 indexed deliveryId, string trackingNumber, address sender)",
  "event StatusUpdated(uint256 indexed deliveryId, uint8 status)",
  "event LocationUpdated(uint256 indexed deliveryId, string location)"
];

// Replace with your deployed contract address
const CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000000";

export class BlockchainService {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.Signer | null = null;
  private contract: ethers.Contract | null = null;
  private connectedAddress: string | null = null;

  async connectWallet(): Promise<string> {
    if (typeof window === 'undefined' || !window.ethereum) {
      throw new Error("MetaMask is not installed");
    }

    this.provider = new ethers.BrowserProvider(window.ethereum);
    const accounts = await this.provider.send("eth_requestAccounts", []);
    this.signer = await this.provider.getSigner();
    this.connectedAddress = accounts[0];
    
    this.contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      CONTRACT_ABI,
      this.signer
    );

    return this.connectedAddress;
  }

  async disconnectWallet(): Promise<void> {
    this.provider = null;
    this.signer = null;
    this.contract = null;
    this.connectedAddress = null;
  }

  getConnectedAddress(): string | null {
    return this.connectedAddress;
  }

  async createDelivery(
    trackingNumber: string,
    recipient: string,
    origin: string,
    destination: string
  ): Promise<{ transactionHash: string; deliveryId: string }> {
    if (!this.contract) throw new Error("Wallet not connected");

    const tx = await this.contract.createDelivery(
      trackingNumber,
      recipient,
      origin,
      destination
    );

    const receipt = await tx.wait();
    
    // Extract delivery ID from event logs
    const event = receipt.logs.find((log: any) => 
      log.topics[0] === ethers.id("DeliveryCreated(uint256,string,address)")
    );
    
    const deliveryId = event ? ethers.toNumber(event.topics[1]) : "0";

    return {
      transactionHash: receipt.hash,
      deliveryId: deliveryId.toString(),
    };
  }

  async updateStatus(
    deliveryId: string,
    status: DeliveryStatus
  ): Promise<string> {
    if (!this.contract) throw new Error("Wallet not connected");

    const statusMap = {
      [DeliveryStatus.PENDING]: 0,
      [DeliveryStatus.IN_TRANSIT]: 1,
      [DeliveryStatus.DELIVERED]: 2,
    };

    const tx = await this.contract.updateStatus(
      deliveryId,
      statusMap[status]
    );

    const receipt = await tx.wait();
    return receipt.hash;
  }

  async updateLocation(
    deliveryId: string,
    location: Location
  ): Promise<string> {
    if (!this.contract) throw new Error("Wallet not connected");

    const tx = await this.contract.updateLocation(
      deliveryId,
      Math.floor(location.latitude * 1000000),
      Math.floor(location.longitude * 1000000),
      location.address
    );

    const receipt = await tx.wait();
    return receipt.hash;
  }

  async getDeliveryDetails(deliveryId: string): Promise<Delivery | null> {
    if (!this.contract) throw new Error("Wallet not connected");

    try {
      const data = await this.contract.getDelivery(deliveryId);
      
      const statusMap = ["Pending", "In Transit", "Delivered"];
      
      return {
        id: deliveryId,
        trackingNumber: data.trackingNumber,
        sender: data.sender,
        recipient: data.recipient,
        origin: data.origin,
        destination: data.destination,
        status: statusMap[data.status] as DeliveryStatus,
        currentLocation: {
          latitude: 0,
          longitude: 0,
          address: data.origin,
          timestamp: Number(data.timestamp),
        },
        locationHistory: [],
        transactionHash: "",
        timestamp: Number(data.timestamp),
        estimatedDelivery: Number(data.timestamp) + 86400 * 3, // +3 days
      };
    } catch (error) {
      console.error("Error fetching delivery:", error);
      return null;
    }
  }

  async getAllDeliveries(): Promise<string[]> {
    if (!this.contract) throw new Error("Wallet not connected");

    try {
      const deliveryIds = await this.contract.getAllDeliveries();
      return deliveryIds.map((id: bigint) => id.toString());
    } catch (error) {
      console.error("Error fetching deliveries:", error);
      return [];
    }
  }

  async getTransactionDetails(txHash: string) {
    if (!this.provider) throw new Error("Wallet not connected");

    try {
      const tx = await this.provider.getTransaction(txHash);
      const receipt = await this.provider.getTransactionReceipt(txHash);
      
      return {
        hash: tx?.hash,
        from: tx?.from,
        to: tx?.to,
        blockNumber: receipt?.blockNumber,
        status: receipt?.status === 1 ? "Success" : "Failed",
        gasUsed: receipt?.gasUsed.toString(),
      };
    } catch (error) {
      console.error("Error fetching transaction:", error);
      return null;
    }
  }
}

export const blockchainService = new BlockchainService();
