import { motion } from 'framer-motion';
import { Package, MapPin, Clock, ExternalLink, Copy } from 'lucide-react';
import { Delivery, DeliveryStatus } from '@/types/delivery';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { StatusTimeline } from './StatusTimeline';

interface DeliveryCardProps {
  delivery: Delivery;
  onViewDetails?: () => void;
}

export const DeliveryCard = ({ delivery, onViewDetails }: DeliveryCardProps) => {
  const getStatusBadgeClass = (status: DeliveryStatus) => {
    switch (status) {
      case DeliveryStatus.PENDING:
        return 'status-pending';
      case DeliveryStatus.IN_TRANSIT:
        return 'status-transit';
      case DeliveryStatus.DELIVERED:
        return 'status-delivered';
      default:
        return '';
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel p-6 hover:shadow-elevated transition-shadow duration-300"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-start gap-4">
          <div className="bg-primary/10 p-3 rounded-xl">
            <Package className="w-6 h-6 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-display font-semibold">{delivery.trackingNumber}</h3>
              <button
                onClick={() => copyToClipboard(delivery.trackingNumber, 'Tracking number')}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${getStatusBadgeClass(delivery.status)}`}>
              <div className="w-2 h-2 rounded-full bg-current animate-pulse" />
              {delivery.status}
            </div>
          </div>
        </div>
      </div>

      {/* Status Timeline */}
      <StatusTimeline currentStatus={delivery.status} className="mb-6" />

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <p className="text-sm text-muted-foreground">Origin</p>
              <p className="text-sm font-medium">{delivery.origin}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-success mt-0.5" />
            <div>
              <p className="text-sm text-muted-foreground">Destination</p>
              <p className="text-sm font-medium">{delivery.destination}</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-warning mt-0.5" />
            <div>
              <p className="text-sm text-muted-foreground">Created</p>
              <p className="text-sm font-medium">{formatDate(delivery.timestamp)}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-info mt-0.5" />
            <div>
              <p className="text-sm text-muted-foreground">Est. Delivery</p>
              <p className="text-sm font-medium">{formatDate(delivery.estimatedDelivery)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Current Location */}
      <div className="glass-card p-4 mb-6">
        <p className="text-sm text-muted-foreground mb-2">Current Location</p>
        <div className="flex items-center justify-between">
          <p className="font-medium">{delivery.currentLocation.address}</p>
          <p className="text-xs text-muted-foreground">
            {formatDate(delivery.currentLocation.timestamp)}
          </p>
        </div>
      </div>

      {/* Blockchain Info */}
      <div className="glass-card p-4 mb-6">
        <p className="text-sm text-muted-foreground mb-2">Blockchain Verification</p>
        <div className="flex items-center gap-2">
          <code className="flex-1 text-xs bg-secondary/50 px-3 py-2 rounded font-mono">
            {delivery.transactionHash.slice(0, 20)}...{delivery.transactionHash.slice(-20)}
          </code>
          <button
            onClick={() => copyToClipboard(delivery.transactionHash, 'Transaction hash')}
            className="p-2 hover:bg-secondary/50 rounded transition-colors"
          >
            <Copy className="w-4 h-4" />
          </button>
          <a
            href={`https://etherscan.io/tx/${delivery.transactionHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 hover:bg-secondary/50 rounded transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
        {delivery.blockNumber && (
          <p className="text-xs text-muted-foreground mt-2">
            Block #{delivery.blockNumber.toLocaleString()}
          </p>
        )}
      </div>

      {/* Actions */}
      {onViewDetails && (
        <Button onClick={onViewDetails} className="w-full">
          View Full Details
        </Button>
      )}
    </motion.div>
  );
};
