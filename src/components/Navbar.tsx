import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Package, Menu, X, Wallet, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { blockchainService } from '@/services/blockchain';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const address = blockchainService.getConnectedAddress();
    setWalletAddress(address);

    // Check auth session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserEmail(session?.user?.email || null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUserEmail(session?.user?.email || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleConnectWallet = async () => {
    try {
      const address = await blockchainService.connectWallet();
      setWalletAddress(address);
      toast.success('Wallet connected successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to connect wallet');
    }
  };

  const handleDisconnectWallet = async () => {
    await blockchainService.disconnectWallet();
    setWalletAddress(null);
    toast.info('Wallet disconnected');
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success('Signed out successfully');
    navigate('/auth');
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const navLinks = [
    { path: '/', label: 'Dashboard' },
    { path: '/create', label: 'Create Delivery' },
    { path: '/track', label: 'Track Package' },
    { path: '/transactions', label: 'Transactions' },
    { path: '/admin', label: 'Admin' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="glass-card border-b sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="bg-primary/10 p-2 rounded-lg group-hover:bg-primary/20 transition-colors">
              <Package className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-display font-bold gradient-text">
                ChainTrack
              </h1>
              <p className="text-xs text-muted-foreground">Blockchain Delivery</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => (
              <Link key={link.path} to={link.path}>
                <Button
                  variant="ghost"
                  className={`relative ${
                    isActive(link.path)
                      ? 'text-primary bg-primary/10'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {link.label}
                  {isActive(link.path) && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                      initial={false}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                </Button>
              </Link>
            ))}
          </div>

          {/* User Auth & Wallet */}
          <div className="hidden md:flex items-center gap-3">
            {userEmail ? (
              <>
                <div className="glass-card px-4 py-2 flex items-center gap-2">
                  <User className="w-4 h-4 text-primary" />
                  <span className="text-sm">{userEmail}</span>
                </div>
                {walletAddress ? (
                  <div className="flex items-center gap-2">
                    <div className="glass-card px-4 py-2 flex items-center gap-2">
                      <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
                      <span className="text-sm font-mono">{formatAddress(walletAddress)}</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDisconnectWallet}
                    >
                      Disconnect Wallet
                    </Button>
                  </div>
                ) : (
                  <Button onClick={handleConnectWallet} size="sm" className="gap-2">
                    <Wallet className="w-4 h-4" />
                    Connect Wallet
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSignOut}
                  className="gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </Button>
              </>
            ) : (
              <Button onClick={() => navigate('/auth')} className="gap-2">
                Sign In
              </Button>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 hover:bg-secondary/50 rounded-lg transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden overflow-hidden"
            >
              <div className="pt-4 pb-2 flex flex-col gap-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Button
                      variant={isActive(link.path) ? 'secondary' : 'ghost'}
                      className="w-full justify-start"
                    >
                      {link.label}
                    </Button>
                  </Link>
                ))}
                <div className="border-t border-border my-2" />
                {userEmail ? (
                  <>
                    <div className="glass-card px-4 py-2">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-primary" />
                        <span className="text-sm">{userEmail}</span>
                      </div>
                    </div>
                    {walletAddress ? (
                      <>
                        <div className="glass-card px-4 py-2">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
                            <span className="text-sm font-mono">{formatAddress(walletAddress)}</span>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          onClick={() => {
                            handleDisconnectWallet();
                            setIsMenuOpen(false);
                          }}
                        >
                          Disconnect Wallet
                        </Button>
                      </>
                    ) : (
                      <Button
                        onClick={() => {
                          handleConnectWallet();
                          setIsMenuOpen(false);
                        }}
                        className="gap-2"
                      >
                        <Wallet className="w-4 h-4" />
                        Connect Wallet
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      onClick={() => {
                        handleSignOut();
                        setIsMenuOpen(false);
                      }}
                      className="gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={() => {
                      navigate('/auth');
                      setIsMenuOpen(false);
                    }}
                  >
                    Sign In
                  </Button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};
