import { Link, useLocation } from 'react-router-dom';
import { useWallet } from '@/hooks/useWallet';
import { Button } from '@/components/ui/button';
import { Wallet, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const { address, isConnected, isConnecting, connect, disconnect, shortenAddress, balance, chainId, refreshBalance } = useWallet();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const links = [
    { to: '/', label: 'Home' },
    { to: '/explore', label: 'Explore' },
    { to: '/create', label: 'Create' },
    { to: '/dashboard', label: 'Dashboard' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center glow-primary">
            <span className="text-primary font-bold text-lg">F</span>
          </div>
          <span className="font-bold text-lg text-foreground">FundChain</span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {links.map(l => (
            <Link
              key={l.to}
              to={l.to}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${location.pathname === l.to
                  ? 'text-primary bg-primary/10'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                }`}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {isConnected ? (
            <div className="hidden sm:flex items-center gap-3">
              <div className="flex items-center gap-3 bg-primary/5 border border-border rounded-full px-3 py-1">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">{shortenAddress(address!)?.slice(2, 4).toUpperCase()}</div>
                  <div className="flex flex-col leading-none">
                    <span className="text-sm font-medium">{shortenAddress(address!)}</span>
                    <span className="text-xs text-muted-foreground">{balance ?? '—'} ETH • chain {chainId ?? '—'}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => { e.stopPropagation(); console.debug('[Navbar] Refresh clicked'); refreshBalance?.(); }}
                  className="px-3 py-1 rounded-md bg-secondary/10 text-sm text-foreground hover:bg-secondary/20"
                >
                  Refresh
                </button>
                <Button onClick={() => { console.debug('[Navbar] Disconnect clicked'); disconnect(); }} variant="outline" size="sm">Disconnect</Button>
              </div>
            </div>
          ) : (
            <Button
              onClick={() => { console.debug('[Navbar] Connect clicked'); connect(); }}
              disabled={isConnecting}
              className="bg-primary text-primary-foreground hover:bg-primary/90 glow-primary"
              size="sm"
            >
              <Wallet className="w-4 h-4 mr-2" />
              {isConnecting ? 'Connecting...' : 'Connect Wallet'}
            </Button>
          )}
          <button
            className="md:hidden text-foreground"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden glass border-t border-border">
          {links.map(l => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setMobileOpen(false)}
              className={`block px-6 py-3 text-sm font-medium ${location.pathname === l.to ? 'text-primary bg-primary/10' : 'text-muted-foreground'
                }`}
            >
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
