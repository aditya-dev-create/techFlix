import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Shield, Eye, Coins, Blocks } from 'lucide-react';
import CampaignCard from '@/components/CampaignCard';
import StatsBar, { defaultStats } from '@/components/StatsBar';
import { mockCampaigns } from '@/data/mockData';

export default function Index() {
  const featured = mockCampaigns.filter(c => c.verified).slice(0, 3);

  return (
    <div className="min-h-screen pt-16">
      {/* Hero */}
      <section className="relative overflow-hidden py-24 md:py-32">
        <div className="absolute inset-0 grid-pattern opacity-30" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-primary text-sm font-medium mb-6">
              <Blocks className="w-4 h-4" />
              Blockchain-Powered Transparency
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
              Fund the Future,{' '}
              <span className="text-primary glow-text">On-Chain</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
              Every donation immutable. Every withdrawal transparent. Smart contracts ensure your funds reach their purpose — trustlessly.
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Link to="/explore">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 glow-primary px-6 h-12 text-base">
                  Explore Campaigns
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link to="/create">
                <Button variant="outline" className="border-border text-foreground hover:bg-secondary h-12 px-6 text-base">
                  Start a Campaign
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="container mx-auto px-4 -mt-8 relative z-10">
        <StatsBar stats={defaultStats()} />
      </section>

      {/* How it works */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-2xl font-bold text-foreground text-center mb-12">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {[
            { icon: <Coins className="w-6 h-6" />, title: 'Donate Trustlessly', desc: 'Send ETH directly to the smart contract. No middlemen, no hidden fees.' },
            { icon: <Eye className="w-6 h-6" />, title: 'Track On-Chain', desc: 'Every transaction is visible on the blockchain. Full transparency by default.' },
            { icon: <Shield className="w-6 h-6" />, title: 'Milestone Release', desc: 'Funds unlock only when milestones are approved by donors. Your money, your vote.' },
          ].map((item, i) => (
            <div key={i} className="text-center p-6 rounded-xl bg-card border border-border">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mx-auto mb-4">
                {item.icon}
              </div>
              <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="container mx-auto px-4 pb-20">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-foreground">Featured Campaigns</h2>
          <Link to="/explore" className="text-primary text-sm hover:underline flex items-center gap-1">
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {featured.map(c => (
            <CampaignCard key={c.id} campaign={c} />
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>FundChain — Decentralized Crowdfunding on Ethereum</p>
          <p className="mt-1 font-mono text-xs">Built for Hackathon Demo • Sepolia Testnet</p>
        </div>
      </footer>
    </div>
  );
}
