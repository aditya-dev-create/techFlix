import { useState, useEffect } from 'react';
import { fetchCampaigns } from '@/lib/api';
import CampaignCard from '@/components/CampaignCard';
import { CATEGORY_LABELS, CampaignCategory } from '@/types/campaign';
import { Search, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { useSocket } from '@/context/SocketContext';

export default function Explore() {
  const { t } = useTranslation();
  const { socket } = useSocket();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<CampaignCategory | 'all'>('all');
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const data = await fetchCampaigns();
      setCampaigns(data);
    } catch (err) {
      console.error('Failed to load campaigns', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('CAMPAIGN_UPDATED', load);
      socket.on('NEW_DONATION', load);
      return () => {
        socket.off('CAMPAIGN_UPDATED', load);
        socket.off('NEW_DONATION', load);
      };
    }
  }, [socket]);

  const filtered = campaigns.filter(c => {
    const title = c.title || '';
    const matchSearch = title.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === 'all' || c.category === category;
    return matchSearch && matchCat;
  });

  return (
    <div className="min-h-screen pt-24 pb-16 transition-colors duration-300">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-black tracking-tight text-foreground mb-3">{t('explore.title') || 'Explore Campaigns'}</h1>
        <p className="text-lg text-muted-foreground mb-10 max-w-2xl">{t('explore.desc') || 'Discover verified initiatives making a real impact. All funds are secured by smart contracts.'}</p>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-10">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder={t('explore.search') || 'Search campaigns by title or category...'}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-card border border-border/50 text-foreground text-base placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all shadow-sm glassmorphism"
            />
          </div>
          <div className="flex gap-2 flex-wrap items-center">
            <button
              onClick={() => setCategory('all')}
              className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${category === 'all' ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' : 'bg-card text-muted-foreground border border-border/50 hover:border-primary/50 hover:text-foreground glassmorphism'
                }`}
            >
              {t('explore.all') || 'All Categories'}
            </button>
            {(Object.entries(CATEGORY_LABELS) as [CampaignCategory, string][]).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setCategory(key)}
                className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${category === key ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' : 'bg-card text-muted-foreground border border-border/50 hover:border-primary/50 hover:text-foreground glassmorphism'
                  }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-32">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-32 text-muted-foreground bg-card/50 rounded-2xl border border-border/50 border-dashed glassmorphism">
            {t('explore.empty') || 'No campaigns found.'}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((c: any) => (
              <CampaignCard key={c.id} campaign={{
                ...c,
                target: c.targetAmount,
                owner: c.ngo?.wallet || c.ngoId,
                donors: c.donations || [],
                category: c.category || 'charity'
              }} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
