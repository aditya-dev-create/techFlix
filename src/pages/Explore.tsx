import { useState, useEffect } from 'react';
import { fetchCampaigns } from '@/lib/api';
import CampaignCard from '@/components/CampaignCard';
import { CATEGORY_LABELS, CampaignCategory } from '@/types/campaign';
import { Search, Loader2 } from 'lucide-react';

export default function Explore() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<CampaignCategory | 'all'>('all');
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
    load();
  }, []);

  const filtered = campaigns.filter(c => {
    const title = c.title || '';
    const matchSearch = title.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === 'all' || c.category === category;
    return matchSearch && matchCat;
  });

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-foreground mb-2">Explore Campaigns</h1>
        <p className="text-muted-foreground mb-8">Discover transparent, blockchain-verified projects</p>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search campaigns..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-secondary border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => { console.debug('[Explore] Category set all'); setCategory('all'); }}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${category === 'all' ? 'bg-primary/10 text-primary border border-primary/30' : 'bg-secondary text-muted-foreground border border-border hover:text-foreground'
                }`}
            >
              All
            </button>
            {(Object.entries(CATEGORY_LABELS) as [CampaignCategory, string][]).map(([key, label]) => (
              <button
                key={key}
                onClick={() => { console.debug('[Explore] Category set', key); setCategory(key); }}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${category === key ? 'bg-primary/10 text-primary border border-primary/30' : 'bg-secondary text-muted-foreground border border-border hover:text-foreground'
                  }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">No campaigns found</div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
