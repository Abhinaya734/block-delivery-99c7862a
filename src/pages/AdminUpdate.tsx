import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Loader2 } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { deliveryService } from '@/services/deliveryService';
import { supabase } from '@/integrations/supabase/client';
import { DeliveryStatus } from '@/types/delivery';

const AdminUpdate = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [deliveryId, setDeliveryId] = useState('');
  const [newStatus, setNewStatus] = useState<DeliveryStatus>(DeliveryStatus.PENDING);
  const [locationData, setLocationData] = useState({
    latitude: '',
    longitude: '',
    address: '',
  });

  const handleUpdateStatus = async () => {
    if (!deliveryId) {
      toast.error('Please enter delivery ID');
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast.error('Please sign in to update deliveries');
      return;
    }

    setIsLoading(true);

    try {
      await deliveryService.updateStatus(deliveryId, newStatus);
      toast.success('Status updated successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update status');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateLocation = async () => {
    if (!deliveryId || !locationData.address) {
      toast.error('Please fill all location fields');
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast.error('Please sign in to update deliveries');
      return;
    }

    setIsLoading(true);

    try {
      await deliveryService.updateLocation(deliveryId, {
        latitude: parseFloat(locationData.latitude) || 0,
        longitude: parseFloat(locationData.longitude) || 0,
        address: locationData.address,
        timestamp: Date.now(),
      });

      toast.success('Location updated successfully!');
      setLocationData({ latitude: '', longitude: '', address: '' });
    } catch (error: any) {
      toast.error(error.message || 'Failed to update location');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-warning/10 rounded-2xl mb-4">
              <Shield className="w-8 h-8 text-warning" />
            </div>
            <h1 className="text-4xl font-display font-bold gradient-text mb-2">
              Admin Panel
            </h1>
            <p className="text-muted-foreground">
              Update delivery status and location on the blockchain
            </p>
          </div>

          {/* Warning */}
          <div className="glass-card p-4 mb-8 border-l-4 border-warning">
            <p className="text-sm text-muted-foreground">
              <strong className="text-warning">⚠ Admin Access Required:</strong> Only authorized
              personnel should access this panel. All updates are recorded on the blockchain.
            </p>
          </div>

          {/* Update Status Section */}
          <div className="glass-panel p-8 mb-8">
            <h2 className="text-2xl font-display font-bold mb-6">Update Delivery Status</h2>

            <div className="space-y-6">
              <div>
                <Label htmlFor="deliveryId">Delivery ID *</Label>
                <Input
                  id="deliveryId"
                  value={deliveryId}
                  onChange={(e) => setDeliveryId(e.target.value)}
                  placeholder="Enter delivery ID (e.g., 1, 2, 3)"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="status">New Status *</Label>
                <Select
                  value={newStatus}
                  onValueChange={(value) => setNewStatus(value as DeliveryStatus)}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={DeliveryStatus.PENDING}>Pending</SelectItem>
                    <SelectItem value={DeliveryStatus.IN_TRANSIT}>In Transit</SelectItem>
                    <SelectItem value={DeliveryStatus.DELIVERED}>Delivered</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleUpdateStatus}
                disabled={isLoading}
                className="w-full h-12"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Status'
                )}
              </Button>
            </div>
          </div>

          {/* Update Location Section */}
          <div className="glass-panel p-8">
            <h2 className="text-2xl font-display font-bold mb-6">Update Package Location</h2>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="latitude">Latitude</Label>
                  <Input
                    id="latitude"
                    type="number"
                    step="0.000001"
                    value={locationData.latitude}
                    onChange={(e) =>
                      setLocationData({ ...locationData, latitude: e.target.value })
                    }
                    placeholder="40.7128"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="longitude">Longitude</Label>
                  <Input
                    id="longitude"
                    type="number"
                    step="0.000001"
                    value={locationData.longitude}
                    onChange={(e) =>
                      setLocationData({ ...locationData, longitude: e.target.value })
                    }
                    placeholder="-74.0060"
                    className="mt-2"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address">Location Address *</Label>
                <Input
                  id="address"
                  value={locationData.address}
                  onChange={(e) =>
                    setLocationData({ ...locationData, address: e.target.value })
                  }
                  placeholder="Coimbatore, Tamil Nadu, India"
                  className="mt-2"
                />
              </div>

              <Button
                onClick={handleUpdateLocation}
                disabled={isLoading}
                className="w-full h-12"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Location'
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default AdminUpdate;
