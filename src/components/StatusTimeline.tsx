import { motion } from 'framer-motion';
import { Package, Truck, CheckCircle, Clock } from 'lucide-react';
import { DeliveryStatus } from '@/types/delivery';

interface StatusTimelineProps {
  currentStatus: DeliveryStatus;
  className?: string;
}

export const StatusTimeline = ({ currentStatus, className = '' }: StatusTimelineProps) => {
  const statuses = [
    { 
      status: DeliveryStatus.PENDING, 
      icon: Clock, 
      label: 'Pending',
      color: 'info'
    },
    { 
      status: DeliveryStatus.IN_TRANSIT, 
      icon: Truck, 
      label: 'In Transit',
      color: 'warning'
    },
    { 
      status: DeliveryStatus.DELIVERED, 
      icon: CheckCircle, 
      label: 'Delivered',
      color: 'success'
    },
  ];

  const currentIndex = statuses.findIndex(s => s.status === currentStatus);

  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center justify-between relative">
        {/* Progress Line */}
        <div className="absolute top-6 left-0 right-0 h-1 bg-secondary/30 -z-10" />
        <motion.div
          className="absolute top-6 left-0 h-1 bg-primary -z-10"
          initial={{ width: '0%' }}
          animate={{ 
            width: currentIndex === 0 ? '0%' : 
                   currentIndex === 1 ? '50%' : 
                   '100%' 
          }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />

        {/* Status Icons */}
        {statuses.map((item, index) => {
          const isActive = index <= currentIndex;
          const isCurrent = index === currentIndex;
          const Icon = item.icon;

          return (
            <div key={item.status} className="flex flex-col items-center gap-3 flex-1">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.2, type: 'spring' }}
                className={`
                  relative w-12 h-12 rounded-full flex items-center justify-center
                  ${isActive ? 'bg-primary' : 'bg-secondary'}
                  ${isCurrent ? 'ring-4 ring-primary/30 animate-glow-pulse' : ''}
                  transition-all duration-300
                `}
              >
                <Icon
                  className={`w-6 h-6 ${
                    isActive ? 'text-primary-foreground' : 'text-muted-foreground'
                  }`}
                />
                {isCurrent && (
                  <motion.div
                    className="absolute inset-0 rounded-full bg-primary"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    style={{ opacity: 0.3 }}
                  />
                )}
              </motion.div>
              <div className="text-center">
                <p
                  className={`text-sm font-medium ${
                    isActive ? 'text-foreground' : 'text-muted-foreground'
                  }`}
                >
                  {item.label}
                </p>
                {isCurrent && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs text-primary mt-1"
                  >
                    Current Status
                  </motion.p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
