import { useState, useEffect } from 'react';
import { fetchDashboardData } from '@/lib/api';
import { useWallet } from '@/hooks/useWallet';
import CampaignCard from '@/components/CampaignCard';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { formatEth } from '@/lib/web3Utils';
import { Wallet, TrendingUp, BarChart3, Activity, Loader2, AlertCircle, Plus } from 'lucide-react';

export default function Dashboard() {
  const { address: userAddress, isConnected, isInitializing } = useWallet();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!userAddress) return;
      setLoading(true);
      try {
        const result = await fetchDashboardData(userAddress);
        setData(result);
      } catch (err) {
        console.error('Failed to load dashboard', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [userAddress]);

  if (isInitializing || (loading && !data)) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center p-8 bg-card rounded-2xl border border-border max-w-md">
          <AlertCircle className="w-12 h-12 text-primary mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Connect Your Wallet</h2>
          <p className="text-muted-foreground mb-6">Please connect your wallet to view your personalized dashboard statistics and campaigns.</p>
        </div>
      </div>
    );
  }

  const { myCampaigns = [], myDonations = [], totalDonated = 0, totalRaised = 0 } = data || {};

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground mb-8 font-mono text-sm">{userAddress.slice(0, 10)}...{userAddress.slice(-8)}</p>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'My Campaigns', value: myCampaigns.length.toString(), icon: <BarChart3 className="w-5 h-5" /> },
            { label: 'Total Raised', value: `${formatEth(totalRaised.toString())} ETH`, icon: <TrendingUp className="w-5 h-5" /> },
            { label: 'Donations Made', value: myDonations.length.toString(), icon: <Wallet className="w-5 h-5" /> },
            { label: 'ETH Donated', value: `${totalDonated.toFixed(2)} ETH`, icon: <Activity className="w-5 h-5" /> },
          ].map(s => (
            <div key={s.label} className="rounded-xl bg-card border border-border p-4">
              <div className="text-primary mb-2">{s.icon}</div>
              <div className="text-xl font-bold text-foreground font-mono">{s.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* My Campaigns */}
        <h2 className="text-xl font-bold text-foreground mb-4">My Campaigns</h2>
        {myCampaigns.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground bg-card rounded-xl border border-border border-dashed">
            <p className="mb-4">No campaigns created yet</p>
            <Link to="/create">
              <Button variant="outline" size="sm" className="gap-2">
                <Plus className="w-4 h-4" /> Create Your First Campaign
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {myCampaigns.map((c: any) => (
              <CampaignCard key={c.id} campaign={{
                ...c,
                target: c.targetAmount,
                owner: c.ngo?.wallet || c.ngoId,
                donors: c.donations || [],
                category: c.category || 'charity' // Default if missing
              }} />
            ))}
          </div>
        )}

        {/* Donations */}
        <h2 className="text-xl font-bold text-foreground mb-4">My Donations</h2>
        {myDonations.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground bg-card rounded-xl border border-border">
            No donations yet
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {myDonations.map((d: any) => (
              <CampaignCard key={d.id} campaign={{
                ...d.campaign,
                target: d.campaign.targetAmount,
                owner: d.campaign.ngo?.wallet || d.campaign.ngoId,
                donors: d.campaign.donations || [],
                category: d.campaign.category || 'charity'
              }} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
