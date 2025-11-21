import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, TrendingUp, CheckCircle, Clock } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { DeliveryCard } from '@/components/DeliveryCard';
import { deliveryService } from '@/services/deliveryService';
import { Delivery, DeliveryStatus } from '@/types/delivery';

const Index = () => {
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inTransit: 0,
    delivered: 0,
  });
  const [recentDeliveries, setRecentDeliveries] = useState<Delivery[]>([]);

  useEffect(() => {
    const fetchDeliveries = async () => {
      const deliveries = await deliveryService.getAllDeliveries(10);
      
      const total = deliveries.length;
      const pending = deliveries.filter(d => d.status === DeliveryStatus.PENDING).length;
      const inTransit = deliveries.filter(d => d.status === DeliveryStatus.IN_TRANSIT).length;
      const delivered = deliveries.filter(d => d.status === DeliveryStatus.DELIVERED).length;

      setStats({ total, pending, inTransit, delivered });
      setRecentDeliveries(deliveries.slice(0, 4));
    };

    fetchDeliveries();
  }, []);

  const statCards = [
    { 
      label: 'Total Deliveries', 
      value: stats.total, 
      icon: Package, 
      color: 'primary',
      bgClass: 'bg-primary/10',
      textClass: 'text-primary'
    },
    { 
      label: 'Pending', 
      value: stats.pending, 
      icon: Clock, 
      color: 'info',
      bgClass: 'bg-info/10',
      textClass: 'text-info'
    },
    { 
      label: 'In Transit', 
      value: stats.inTransit, 
      icon: TrendingUp, 
      color: 'warning',
      bgClass: 'bg-warning/10',
      textClass: 'text-warning'
    },
    { 
      label: 'Delivered', 
      value: stats.delivered, 
      icon: CheckCircle, 
      color: 'success',
      bgClass: 'bg-success/10',
      textClass: 'text-success'
    },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl md:text-6xl font-display font-bold mb-4 gradient-text">
            Blockchain Delivery Tracking
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Track your packages with complete transparency and security using blockchain technology
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass-panel p-6 hover:scale-105 transition-transform duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.bgClass} p-3 rounded-xl`}>
                  <stat.icon className={`w-6 h-6 ${stat.textClass}`} />
                </div>
                <div className={`text-3xl font-display font-bold ${stat.textClass}`}>
                  {stat.value}
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Recent Deliveries */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-display font-bold">Recent Deliveries</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {recentDeliveries.map((delivery, index) => (
              <motion.div
                key={delivery.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <DeliveryCard delivery={delivery} />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Features Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="glass-panel p-8 text-center"
        >
          <h3 className="text-2xl font-display font-bold mb-4">
            Why Choose ChainTrack?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
            <div>
              <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-6 h-6 text-primary" />
              </div>
              <h4 className="font-semibold mb-2">Immutable Records</h4>
              <p className="text-sm text-muted-foreground">
                All delivery data is stored on the blockchain, ensuring complete transparency
              </p>
            </div>
            <div>
              <div className="bg-success/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-6 h-6 text-success" />
              </div>
              <h4 className="font-semibold mb-2">Real-time Updates</h4>
              <p className="text-sm text-muted-foreground">
                Track your package location and status updates in real-time
              </p>
            </div>
            <div>
              <div className="bg-warning/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-6 h-6 text-warning" />
              </div>
              <h4 className="font-semibold mb-2">Verifiable Proof</h4>
              <p className="text-sm text-muted-foreground">
                Every update includes cryptographic proof for complete authenticity
              </p>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Index;
