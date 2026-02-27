import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { ethers } from 'ethers';
import { toast } from '@/hooks/use-toast';

declare global {
    interface Window {
        ethereum?: any;
    }
}

interface WalletState {
    address: string | null;
    isConnected: boolean;
    chainId: number | null;
    balance: string | null;
}

interface WalletContextType {
    provider: ethers.BrowserProvider | null;
    signer: ethers.JsonRpcSigner | null;
    address: string | null;
    isConnected: boolean;
    chainId: number | null;
    balance: string | null;
    isConnecting: boolean;
    isInitializing: boolean;
    error: string | null;
    smilePoints: number;
    savingsBalance: number;
    addSmilePoints: (points: number) => void;
    connect: () => Promise<void>;
    disconnect: () => void;
    refreshBalance: () => Promise<void>;
    shortenAddress: (addr?: string | null) => string;
}

const WalletContext = createContext<WalletContextType | null>(null);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [wallet, setWallet] = useState<WalletState>({
        address: null,
        isConnected: false,
        chainId: null,
        balance: null,
    });
    const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
    const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
    const [isConnecting, setIsConnecting] = useState(false);
    const [isInitializing, setIsInitializing] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [smilePoints, setSmilePoints] = useState(() => {
        return parseInt(localStorage.getItem('smile_points') || '0', 10);
    });

    const savingsBalance = parseFloat((smilePoints * 0.0001).toFixed(4)); // 1 point = 0.0001 ETH conversion for display

    const addSmilePoints = useCallback((points: number) => {
        setSmilePoints(prev => {
            const newPoints = prev + points;
            localStorage.setItem('smile_points', newPoints.toString());
            return newPoints;
        });
    }, []);

    // Load initial connection state from localStorage
    const [explicitlyConnected, setExplicitlyConnected] = useState(() => {
        return localStorage.getItem('wallet_connected') === 'true';
    });

    const fetchBalance = useCallback(async (addr: string, prov: ethers.BrowserProvider) => {
        try {
            const bal = await prov.getBalance(addr);
            const inEth = ethers.formatEther(bal);
            setWallet(w => ({ ...w, balance: parseFloat(inEth).toFixed(4) }));
        } catch (e) {
            console.warn('Failed to fetch balance', e);
        }
    }, []);

    const initConnection = useCallback(async (web3Provider: ethers.BrowserProvider) => {
        try {
            const s = await web3Provider.getSigner();
            const addr = await s.getAddress();
            const network = await web3Provider.getNetwork();

            setProvider(web3Provider);
            setSigner(s);
            setWallet({
                address: addr,
                isConnected: true,
                chainId: Number(network.chainId),
                balance: null,
            });
            setExplicitlyConnected(true);
            localStorage.setItem('wallet_connected', 'true');
            fetchBalance(addr, web3Provider);
            return addr;
        } catch (err) {
            console.error('initConnection error', err);
            throw err;
        }
    }, [fetchBalance]);

    const connect = useCallback(async () => {
        setIsConnecting(true);
        setError(null);
        let notifier: any = null;
        try {
            notifier = toast({ title: 'Connecting...', description: 'Approve connection in your wallet' });
            if (!window || !window.ethereum) {
                throw new Error('No web3 provider found. Install MetaMask.');
            }

            const web3Provider = new ethers.BrowserProvider(window.ethereum as any);
            await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
            const addr = await initConnection(web3Provider);

            if (notifier && notifier.update) {
                notifier.update({ id: notifier.id, title: 'Connected', description: addr });
            }
        } catch (err: any) {
            console.error('connect error', err);
            setError(err?.message || 'Failed to connect');
            if (notifier && notifier.update) {
                notifier.update({ id: notifier.id, title: 'Connection failed', description: err?.message || String(err), variant: 'destructive' });
            }
            localStorage.removeItem('wallet_connected');
        } finally {
            setIsConnecting(false);
        }
    }, [initConnection]);

    const disconnect = useCallback(() => {
        setProvider(null);
        setSigner(null);
        setWallet({ address: null, isConnected: false, chainId: null, balance: null });
        setError(null);
        setExplicitlyConnected(false);
        localStorage.removeItem('wallet_connected');
        toast({ title: 'Disconnected' });
    }, []);

    // Auto-reconnect on mount
    useEffect(() => {
        const checkAutoConnect = async () => {
            if (explicitlyConnected && window.ethereum) {
                try {
                    const web3Provider = new ethers.BrowserProvider(window.ethereum as any);
                    const accounts = await web3Provider.listAccounts();
                    if (accounts.length > 0) {
                        await initConnection(web3Provider);
                    } else {
                        // User was connected but MetaMask is locked or permissions revoked
                        localStorage.removeItem('wallet_connected');
                        setExplicitlyConnected(false);
                    }
                } catch (e) {
                    console.error('Auto-connect failed', e);
                } finally {
                    setIsInitializing(false);
                }
            } else {
                setIsInitializing(false);
            }
        };
        checkAutoConnect();
    }, [initConnection, explicitlyConnected]);

    const refreshBalance = useCallback(async () => {
        if (!provider || !wallet.address) return;
        await fetchBalance(wallet.address, provider);
    }, [provider, wallet.address, fetchBalance]);

    useEffect(() => {
        if (!window || !window.ethereum) return;

        const handleAccounts = (accounts: string[]) => {
            if (!accounts || accounts.length === 0) {
                disconnect();
            } else if (explicitlyConnected) {
                setWallet(w => ({ ...w, address: accounts[0] }));
                const currentProv = provider || new ethers.BrowserProvider(window.ethereum as any);
                if (!provider) setProvider(currentProv);
                fetchBalance(accounts[0], currentProv);
            }
        };

        const handleChain = (chainIdHex: string) => {
            const c = parseInt(chainIdHex, 16);
            setWallet(w => ({ ...w, chainId: c }));
            if (wallet.address) {
                const currentProv = provider || new ethers.BrowserProvider(window.ethereum as any);
                fetchBalance(wallet.address, currentProv);
            }
        };

        (window.ethereum as any).on('accountsChanged', handleAccounts);
        (window.ethereum as any).on('chainChanged', handleChain);

        return () => {
            (window.ethereum as any).removeListener('accountsChanged', handleAccounts);
            (window.ethereum as any).removeListener('chainChanged', handleChain);
        };
    }, [disconnect, fetchBalance, provider, wallet.address, explicitlyConnected]);

    const shortenAddress = (addr?: string | null) => (addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : '');

    return (
        <WalletContext.Provider value={{
            provider,
            signer,
            address: wallet.address,
            isConnected: explicitlyConnected && !!wallet.address,
            chainId: wallet.chainId,
            balance: wallet.balance,
            isConnecting,
            isInitializing,
            error,
            smilePoints,
            savingsBalance,
            addSmilePoints,
            connect,
            disconnect,
            refreshBalance,
            shortenAddress
        }}>
            {children}
        </WalletContext.Provider>
    );
};

export const useWallet = () => {
    const context = useContext(WalletContext);
    if (!context) {
        throw new Error('useWallet must be used within a WalletProvider');
    }
    return context;
};
