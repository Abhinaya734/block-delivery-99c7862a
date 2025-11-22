import { Delivery, DeliveryStatus } from '@/types/delivery';

export const mockDeliveries: Delivery[] = [
  {
    id: "1",
    trackingNumber: "TRK1001234567",
    sender: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    recipient: "John Doe",
    origin: "Madurai, Tamil Nadu, India",
    destination: "Chennai, Tamil Nadu, India",
    status: DeliveryStatus.IN_TRANSIT,
    currentLocation: {
      latitude: 11.1271,
      longitude: 78.6569,
      address: "Coimbatore, Tamil Nadu, India",
      timestamp: Date.now() - 3600000,
    },
    locationHistory: [
      {
        latitude: 9.9252,
        longitude: 78.1198,
        address: "Madurai, Tamil Nadu, India",
        timestamp: Date.now() - 86400000,
      },
      {
        latitude: 11.1271,
        longitude: 78.6569,
        address: "Coimbatore, Tamil Nadu, India",
        timestamp: Date.now() - 3600000,
      },
    ],
    transactionHash: "0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z",
    blockNumber: 18234567,
    timestamp: Date.now() - 86400000,
    estimatedDelivery: Date.now() + 86400000,
    packageDetails: {
      weight: "2.5 kg",
      dimensions: "30x20x15 cm",
      description: "Electronics - Handle with care",
    },
  },
  {
    id: "2",
    trackingNumber: "TRK1001234568",
    sender: "0x8ba1f109551bD432803012645Ac136ddd64DBA72",
    recipient: "Jane Smith",
    origin: "Chennai, Tamil Nadu, India",
    destination: "Madurai, Tamil Nadu, India",
    status: DeliveryStatus.DELIVERED,
    currentLocation: {
      latitude: 9.9252,
      longitude: 78.1198,
      address: "Madurai, Tamil Nadu, India",
      timestamp: Date.now() - 7200000,
    },
    locationHistory: [
      {
        latitude: 13.0827,
        longitude: 80.2707,
        address: "Chennai, Tamil Nadu, India",
        timestamp: Date.now() - 172800000,
      },
      {
        latitude: 10.7905,
        longitude: 78.7047,
        address: "Tiruchirappalli, Tamil Nadu, India",
        timestamp: Date.now() - 86400000,
      },
      {
        latitude: 9.9252,
        longitude: 78.1198,
        address: "Madurai, Tamil Nadu, India",
        timestamp: Date.now() - 7200000,
      },
    ],
    transactionHash: "0xa9b8c7d6e5f4g3h2i1j0k9l8m7n6o5p4q3r2s1t0u9v8w7x6y5z4",
    blockNumber: 18234589,
    timestamp: Date.now() - 172800000,
    estimatedDelivery: Date.now() - 7200000,
    packageDetails: {
      weight: "1.2 kg",
      dimensions: "25x15x10 cm",
      description: "Documents",
    },
  },
  {
    id: "3",
    trackingNumber: "TRK1001234569",
    sender: "0xdD2FD4581271e230360230F9337D5c0430Bf44C0",
    recipient: "Robert Johnson",
    origin: "Madurai, Tamil Nadu, India",
    destination: "Coimbatore, Tamil Nadu, India",
    status: DeliveryStatus.PENDING,
    currentLocation: {
      latitude: 9.9252,
      longitude: 78.1198,
      address: "Madurai, Tamil Nadu, India",
      timestamp: Date.now() - 1800000,
    },
    locationHistory: [
      {
        latitude: 9.9252,
        longitude: 78.1198,
        address: "Madurai, Tamil Nadu, India",
        timestamp: Date.now() - 1800000,
      },
    ],
    transactionHash: "0x2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z7a",
    blockNumber: 18234601,
    timestamp: Date.now() - 1800000,
    estimatedDelivery: Date.now() + 259200000,
    packageDetails: {
      weight: "5.0 kg",
      dimensions: "40x30x20 cm",
      description: "Books",
    },
  },
];

export const generateTrackingNumber = (): string => {
  const prefix = "TRK";
  const number = Math.floor(Math.random() * 1000000000);
  return `${prefix}${number.toString().padStart(10, '0')}`;
};

export const generateMockTransactionHash = (): string => {
  return '0x' + Array.from({ length: 64 }, () => 
    Math.floor(Math.random() * 16).toString(16)
  ).join('');
};

export const getMockDeliveryById = (id: string): Delivery | undefined => {
  return mockDeliveries.find(delivery => delivery.id === id);
};

export const getMockDeliveryByTrackingNumber = (trackingNumber: string): Delivery | undefined => {
  return mockDeliveries.find(delivery => 
    delivery.trackingNumber.toLowerCase() === trackingNumber.toLowerCase()
  );
};
