import { supabase } from '@/integrations/supabase/client';
import { Delivery, DeliveryStatus, Location, DeliveryFormData } from '@/types/delivery';
import { blockchainService } from './blockchain';
import { generateTrackingNumber, generateMockTransactionHash } from './mockData';

export class DeliveryService {
  async createDelivery(formData: DeliveryFormData): Promise<{ delivery: Delivery; transactionHash: string }> {
    const trackingNumber = generateTrackingNumber();
    const walletAddress = blockchainService.getConnectedAddress();
    
    let transactionHash: string;
    let blockNumber: number | undefined;

    // Try blockchain transaction if wallet is connected
    if (walletAddress) {
      try {
        const result = await blockchainService.createDelivery(
          trackingNumber,
          formData.recipient,
          formData.origin,
          formData.destination
        );
        transactionHash = result.transactionHash;
        blockNumber = undefined; // Will be updated when tx is mined
      } catch (error) {
        console.error('Blockchain transaction failed, using mock:', error);
        transactionHash = generateMockTransactionHash();
      }
    } else {
      // Use mock transaction for demo
      transactionHash = generateMockTransactionHash();
    }

    // Get current session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      throw new Error('You must be logged in to create a delivery');
    }

    // Call backend edge function to create delivery
    const { data, error } = await supabase.functions.invoke('create-delivery', {
      body: {
        trackingNumber,
        recipient: formData.recipient,
        origin: formData.origin,
        destination: formData.destination,
        weight: formData.weight,
        dimensions: formData.dimensions,
        description: formData.description,
        senderAddress: walletAddress || 'demo-address',
        transactionHash,
        blockNumber,
      },
    });

    if (error) {
      console.error('Error creating delivery:', error);
      throw new Error(error.message || 'Failed to create delivery');
    }

    return {
      delivery: this.mapToDelivery(data.delivery),
      transactionHash,
    };
  }

  async updateStatus(deliveryId: string, newStatus: DeliveryStatus): Promise<void> {
    const walletAddress = blockchainService.getConnectedAddress();
    
    let transactionHash: string;
    let blockNumber: number | undefined;

    if (walletAddress) {
      try {
        transactionHash = await blockchainService.updateStatus(deliveryId, newStatus);
      } catch (error) {
        console.error('Blockchain transaction failed:', error);
        transactionHash = generateMockTransactionHash();
      }
    } else {
      transactionHash = generateMockTransactionHash();
    }

    const { error } = await supabase.functions.invoke('update-delivery-status', {
      body: {
        deliveryId,
        status: newStatus,
        transactionHash,
        blockNumber,
        senderAddress: walletAddress || 'demo-address',
      },
    });

    if (error) {
      throw new Error(error.message || 'Failed to update status');
    }
  }

  async updateLocation(deliveryId: string, location: Location): Promise<void> {
    const walletAddress = blockchainService.getConnectedAddress();
    
    let transactionHash: string;

    if (walletAddress) {
      try {
        transactionHash = await blockchainService.updateLocation(deliveryId, location);
      } catch (error) {
        console.error('Blockchain transaction failed:', error);
        transactionHash = generateMockTransactionHash();
      }
    } else {
      transactionHash = generateMockTransactionHash();
    }

    const { error } = await supabase.functions.invoke('update-delivery-location', {
      body: {
        deliveryId,
        latitude: location.latitude,
        longitude: location.longitude,
        address: location.address,
        transactionHash,
        senderAddress: walletAddress || 'demo-address',
      },
    });

    if (error) {
      throw new Error(error.message || 'Failed to update location');
    }
  }

  async getDeliveryByTrackingNumber(trackingNumber: string): Promise<Delivery | null> {
    const { data, error } = await supabase
      .from('deliveries')
      .select(`
        *,
        delivery_locations(*),
        delivery_transactions(*)
      `)
      .eq('tracking_number', trackingNumber)
      .single();

    if (error) {
      console.error('Error fetching delivery:', error);
      return null;
    }

    return this.mapToDelivery(data);
  }

  async getAllDeliveries(limit: number = 10): Promise<Delivery[]> {
    const { data, error } = await supabase
      .from('deliveries')
      .select(`
        *,
        delivery_locations(*),
        delivery_transactions(*)
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching deliveries:', error);
      return [];
    }

    return data.map(this.mapToDelivery);
  }

  async getDeliveryById(id: string): Promise<Delivery | null> {
    const { data, error } = await supabase
      .from('deliveries')
      .select(`
        *,
        delivery_locations(*),
        delivery_transactions(*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching delivery:', error);
      return null;
    }

    return this.mapToDelivery(data);
  }

  private mapToDelivery(data: any): Delivery {
    const locations = data.delivery_locations || [];
    const transactions = data.delivery_transactions || [];
    
    // Get the most recent location
    const currentLocation = locations.length > 0 
      ? locations[locations.length - 1]
      : {
          latitude: 0,
          longitude: 0,
          address: data.origin,
          timestamp: new Date(data.created_at).getTime(),
        };

    // Map location history
    const locationHistory: Location[] = locations.map((loc: any) => ({
      latitude: parseFloat(loc.latitude) || 0,
      longitude: parseFloat(loc.longitude) || 0,
      address: loc.address,
      timestamp: new Date(loc.created_at).getTime(),
    }));

    // Get the creation transaction
    const creationTx = transactions.find((tx: any) => tx.transaction_type === 'create');

    return {
      id: data.id,
      trackingNumber: data.tracking_number,
      sender: data.sender_address,
      recipient: data.recipient_name,
      origin: data.origin,
      destination: data.destination,
      status: data.status as DeliveryStatus,
      currentLocation: {
        latitude: parseFloat(currentLocation.latitude) || 0,
        longitude: parseFloat(currentLocation.longitude) || 0,
        address: currentLocation.address,
        timestamp: new Date(currentLocation.created_at || data.created_at).getTime(),
      },
      locationHistory,
      transactionHash: creationTx?.transaction_hash || data.transaction_hash,
      blockNumber: creationTx?.block_number || data.block_number,
      timestamp: new Date(data.created_at).getTime(),
      estimatedDelivery: new Date(data.estimated_delivery).getTime(),
      packageDetails: {
        weight: data.package_weight || '',
        dimensions: data.package_dimensions || '',
        description: data.package_description || '',
      },
    };
  }
}

export const deliveryService = new DeliveryService();
