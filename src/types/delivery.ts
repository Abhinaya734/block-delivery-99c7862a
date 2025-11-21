export enum DeliveryStatus {
  PENDING = "Pending",
  IN_TRANSIT = "In Transit",
  DELIVERED = "Delivered",
}

export interface Location {
  latitude: number;
  longitude: number;
  address: string;
  timestamp: number;
}

export interface Delivery {
  id: string;
  trackingNumber: string;
  sender: string;
  recipient: string;
  origin: string;
  destination: string;
  status: DeliveryStatus;
  currentLocation: Location;
  locationHistory: Location[];
  transactionHash: string;
  blockNumber?: number;
  timestamp: number;
  estimatedDelivery: number;
  packageDetails?: {
    weight: string;
    dimensions: string;
    description: string;
  };
}

export interface DeliveryFormData {
  recipient: string;
  origin: string;
  destination: string;
  weight: string;
  dimensions: string;
  description: string;
}
