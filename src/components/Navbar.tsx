import { Link, useLocation } from 'react-router-dom';
import { useWallet } from '@/hooks/useWallet';
import { Button } from '@/components/ui/button';
import { Wallet, Menu, X, Smile, Globe } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import SmileCameraModal from './SmileCameraModal';

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const { address, isConnected, isConnecting, connect, disconnect, shortenAddress, balance, chainId, refreshBalance } = useWallet();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [smileModalOpen, setSmileModalOpen] = useState(false);
  const location = useLocation();

  const links = [
    { to: '/', label: t('nav.explore') || 'Home' }, // Home and Explore mixed as per original text, let's keep it simple
    { to: '/explore', label: t('nav.explore') },
    { to: '/create', label: t('nav.create') },
    { to: '/dashboard', label: t('nav.dashboard') },
  ];

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-40 glass border-b border-border/50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center glow-primary">
              <span className="text-primary font-bold text-lg">T</span>
            </div>
            <span className="font-bold text-lg text-foreground tracking-tight">TrustyCrowd</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {links.slice(1).map(l => (
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
            {/* Language Switcher */}
            <div className="relative group hidden sm:block">
              <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                <Globe className="w-4 h-4" />
                <span className="uppercase">{i18n.language.slice(0, 2)}</span>
              </button>
              <div className="absolute top-full right-0 mt-1 w-32 bg-card border border-border rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 overflow-hidden">
                <button onClick={() => changeLanguage('en')} className="block w-full text-left px-4 py-2 text-sm hover:bg-secondary">English</button>
                <button onClick={() => changeLanguage('hi')} className="block w-full text-left px-4 py-2 text-sm hover:bg-secondary">हिन्दी</button>
                <button onClick={() => changeLanguage('kn')} className="block w-full text-left px-4 py-2 text-sm hover:bg-secondary">ಕನ್ನಡ</button>
              </div>
            </div>

            {/* Smile to Earn Icon */}
            <button
              onClick={() => setSmileModalOpen(true)}
              className="group relative p-2 rounded-full hover:bg-primary/20 transition-all glow-primary"
              title="Smile to Earn!"
            >
              <Smile className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-yellow-400 rounded-full animate-pulse blur-[1px]"></span>
            </button>

            {isConnected ? (
              <div className="hidden lg:flex items-center gap-2">
                <div className="flex items-center gap-2 bg-secondary border border-border rounded-lg px-3 py-1.5">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                    {shortenAddress(address!)?.slice(2, 4).toUpperCase()}
                  </div>
                  <div className="flex flex-col leading-none">
                    <span className="text-xs font-medium text-foreground">{shortenAddress(address!)}</span>
                    <span className="text-[10px] text-muted-foreground font-mono">{balance ?? '—'} ETH</span>
                  </div>
                </div>
                <Button onClick={disconnect} variant="outline" size="sm" className="h-9 border-border text-muted-foreground hover:text-foreground">
                  Disconnect
                </Button>
              </div>
            ) : (
              <Button
                onClick={connect}
                disabled={isConnecting}
                className="bg-primary text-primary-foreground hover:bg-primary/90 glow-primary h-9"
                size="sm"
              >
                <Wallet className="w-4 h-4 mr-2" />
                {isConnecting ? '...' : t('nav.connect')}
              </Button>
            )}

            <button
              className="md:hidden text-foreground p-2"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden glass border-t border-border/50">
            {links.slice(1).map(l => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setMobileOpen(false)}
                className={`block px-6 py-3 text-sm font-medium ${location.pathname === l.to ? 'text-primary bg-primary/10' : 'text-muted-foreground'}`}
              >
                {l.label}
              </Link>
            ))}
            <div className="px-6 py-3 border-t border-border/50 flex gap-4">
              <span className="text-sm font-medium text-muted-foreground">Lang:</span>
              <button onClick={() => { changeLanguage('en'); setMobileOpen(false); }} className={`text-sm ${i18n.language === 'en' ? 'text-primary' : 'text-foreground'}`}>EN</button>
              <button onClick={() => { changeLanguage('hi'); setMobileOpen(false); }} className={`text-sm ${i18n.language === 'hi' ? 'text-primary' : 'text-foreground'}`}>HI</button>
              <button onClick={() => { changeLanguage('kn'); setMobileOpen(false); }} className={`text-sm ${i18n.language === 'kn' ? 'text-primary' : 'text-foreground'}`}>KN</button>
            </div>
            {isConnected && (
              <div className="px-6 py-3 border-t border-border/50">
                <Button onClick={() => { disconnect(); setMobileOpen(false); }} variant="outline" className="w-full justify-center">Disconnect Wallet</Button>
              </div>
            )}
          </div>
        )}
      </nav>

      {/* Smile Modal */}
      <SmileCameraModal isOpen={smileModalOpen} onClose={() => setSmileModalOpen(false)} />
    </>
  );
}
