import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Package } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { DeliveryCard } from '@/components/DeliveryCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { getMockDeliveryByTrackingNumber } from '@/services/mockData';
import { Delivery } from '@/types/delivery';

const TrackDelivery = () => {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [delivery, setDelivery] = useState<Delivery | null>(null);

  const handleSearch = async () => {
    if (!trackingNumber.trim()) {
      toast.error('Please enter a tracking number');
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      const result = getMockDeliveryByTrackingNumber(trackingNumber);

      if (result) {
        setDelivery(result);
        toast.success('Delivery found!');
      } else {
        setDelivery(null);
        toast.error('No delivery found with this tracking number');
      }
    } catch (error) {
      toast.error('Error searching for delivery');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-4">
              <Search className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl font-display font-bold gradient-text mb-2">
              Track Your Package
            </h1>
            <p className="text-muted-foreground">
              Enter your tracking number to view real-time delivery status
            </p>
          </div>

          {/* Search Box */}
          <div className="glass-panel p-6 mb-8">
            <div className="flex flex-col sm:flex-row gap-4">
              <Input
                placeholder="Enter tracking number (e.g., TRK1001234567)"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 h-12"
              />
              <Button
                onClick={handleSearch}
                disabled={isLoading}
                className="h-12 px-8"
              >
                {isLoading ? (
                  <>
                    <Search className="w-5 h-5 mr-2 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5 mr-2" />
                    Track Package
                  </>
                )}
              </Button>
            </div>

            {/* Quick Test Buttons */}
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground mb-3">Try these test tracking numbers:</p>
              <div className="flex flex-wrap gap-2">
                {['TRK1001234567', 'TRK1001234568', 'TRK1001234569'].map((num) => (
                  <button
                    key={num}
                    onClick={() => setTrackingNumber(num)}
                    className="text-xs px-3 py-1 bg-secondary hover:bg-secondary/80 rounded-full transition-colors"
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Results */}
          <AnimatePresence mode="wait">
            {delivery ? (
              <motion.div
                key="delivery-found"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <DeliveryCard delivery={delivery} />
              </motion.div>
            ) : (
              !isLoading && (
                <motion.div
                  key="no-delivery"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="glass-card p-12 text-center"
                >
                  <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <h3 className="text-xl font-semibold mb-2">No Package Tracked Yet</h3>
                  <p className="text-muted-foreground">
                    Enter a tracking number above to view package details
                  </p>
                </motion.div>
              )
            )}
          </AnimatePresence>
        </motion.div>
      </main>
    </div>
  );
};

export default TrackDelivery;
