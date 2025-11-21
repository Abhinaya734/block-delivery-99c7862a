import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, Loader2 } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { blockchainService } from '@/services/blockchain';
import { generateTrackingNumber, generateMockTransactionHash } from '@/services/mockData';
import { DeliveryFormData } from '@/types/delivery';

const CreateDelivery = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<DeliveryFormData>({
    recipient: '',
    origin: '',
    destination: '',
    weight: '',
    dimensions: '',
    description: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validateForm = (): boolean => {
    if (!formData.recipient.trim()) {
      toast.error('Please enter recipient name');
      return false;
    }
    if (!formData.origin.trim()) {
      toast.error('Please enter origin address');
      return false;
    }
    if (!formData.destination.trim()) {
      toast.error('Please enter destination address');
      return false;
    }
    if (!formData.weight.trim()) {
      toast.error('Please enter package weight');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const trackingNumber = generateTrackingNumber();
      const walletAddress = blockchainService.getConnectedAddress();

      if (walletAddress) {
        // Real blockchain transaction
        const result = await blockchainService.createDelivery(
          trackingNumber,
          formData.recipient,
          formData.origin,
          formData.destination
        );

        toast.success('Delivery created successfully on blockchain!');
        console.log('Transaction hash:', result.transactionHash);
        console.log('Delivery ID:', result.deliveryId);
      } else {
        // Mock transaction for demo
        const mockTxHash = generateMockTransactionHash();
        console.log('Mock transaction hash:', mockTxHash);
        toast.success('Delivery created successfully (Demo Mode)');
      }

      // Reset form
      setFormData({
        recipient: '',
        origin: '',
        destination: '',
        weight: '',
        dimensions: '',
        description: '',
      });

      setTimeout(() => {
        navigate('/track');
      }, 1500);
    } catch (error: any) {
      console.error('Error creating delivery:', error);
      toast.error(error.message || 'Failed to create delivery');
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
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-4">
              <Package className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl font-display font-bold gradient-text mb-2">
              Create New Delivery
            </h1>
            <p className="text-muted-foreground">
              Register a new package on the blockchain for tracking
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="glass-panel p-8">
            <div className="space-y-6">
              {/* Recipient */}
              <div>
                <Label htmlFor="recipient">Recipient Name *</Label>
                <Input
                  id="recipient"
                  name="recipient"
                  value={formData.recipient}
                  onChange={handleChange}
                  placeholder="John Doe"
                  required
                  className="mt-2"
                />
              </div>

              {/* Origin & Destination */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="origin">Origin Address *</Label>
                  <Input
                    id="origin"
                    name="origin"
                    value={formData.origin}
                    onChange={handleChange}
                    placeholder="New York, NY, USA"
                    required
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="destination">Destination Address *</Label>
                  <Input
                    id="destination"
                    name="destination"
                    value={formData.destination}
                    onChange={handleChange}
                    placeholder="Los Angeles, CA, USA"
                    required
                    className="mt-2"
                  />
                </div>
              </div>

              {/* Weight & Dimensions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="weight">Weight *</Label>
                  <Input
                    id="weight"
                    name="weight"
                    value={formData.weight}
                    onChange={handleChange}
                    placeholder="2.5 kg"
                    required
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="dimensions">Dimensions</Label>
                  <Input
                    id="dimensions"
                    name="dimensions"
                    value={formData.dimensions}
                    onChange={handleChange}
                    placeholder="30x20x15 cm"
                    className="mt-2"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description">Package Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe the package contents..."
                  rows={4}
                  className="mt-2"
                />
              </div>

              {/* Info Box */}
              <div className="glass-card p-4 border-l-4 border-primary">
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">Note:</strong> This will create a new entry on the Ethereum blockchain.
                  Make sure your MetaMask wallet is connected and has sufficient ETH for gas fees.
                </p>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 text-lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Creating Delivery...
                  </>
                ) : (
                  <>
                    <Package className="w-5 h-5 mr-2" />
                    Create Delivery
                  </>
                )}
              </Button>
            </div>
          </form>
        </motion.div>
      </main>
    </div>
  );
};

export default CreateDelivery;
