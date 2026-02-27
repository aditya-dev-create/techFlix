import { useState, useCallback } from 'react';
import { Upload, FileText, Check, Loader2 } from 'lucide-react';

interface IPFSUploadProps {
    onUpload: (hash: string, url: string) => void;
    label?: string;
    accept?: string;
}

// Using web3.storage / NFT.storage or Pinata in production.
// For hackathon demo: we simulate with a mock hash.
async function mockUploadToIPFS(file: File): Promise<{ hash: string; url: string }> {
    // In production: call Pinata or web3.storage API here
    // const formData = new FormData();
    // formData.append('file', file);
    // const res = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', { method:'POST', headers:{Authorization:`Bearer ${PINATA_JWT}`}, body: formData });
    // const data = await res.json();
    // return { hash: data.IpfsHash, url: `https://ipfs.io/ipfs/${data.IpfsHash}` };

    // DEMO: simulate upload with short delay
    await new Promise(r => setTimeout(r, 1500));
    const mockHash = `Qm${Math.random().toString(36).slice(2, 12).toUpperCase()}${Date.now().toString(36).toUpperCase()}`;
    return { hash: mockHash, url: `https://ipfs.io/ipfs/${mockHash}` };
}

export default function IPFSUpload({ onUpload, label = 'Upload to IPFS', accept = 'image/*,application/pdf' }: IPFSUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [uploaded, setUploaded] = useState<{ hash: string; url: string } | null>(null);
    const [dragOver, setDragOver] = useState(false);

    const handleFile = useCallback(async (file: File) => {
        setUploading(true);
        try {
            const result = await mockUploadToIPFS(file);
            setUploaded(result);
            onUpload(result.hash, result.url);
        } catch (e) {
            console.error('IPFS upload failed', e);
        } finally {
            setUploading(false);
        }
    }, [onUpload]);

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
    };

    return (
        <div
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-xl p-6 transition-all text-center cursor-pointer
        ${dragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-secondary/30'}
        ${uploaded ? 'border-green-500/50 bg-green-500/5' : ''}
      `}
            onClick={() => !uploading && document.getElementById('ipfs-file-input')?.click()}
        >
            <input
                id="ipfs-file-input"
                type="file"
                accept={accept}
                className="hidden"
                onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
            />

            {uploading ? (
                <div className="flex flex-col items-center gap-2">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    <p className="text-sm text-muted-foreground">Uploading to IPFS...</p>
                </div>
            ) : uploaded ? (
                <div className="flex flex-col items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                        <Check className="w-5 h-5 text-green-400" />
                    </div>
                    <p className="text-sm font-medium text-foreground">Uploaded!</p>
                    <p className="text-xs text-muted-foreground font-mono truncate max-w-full">{uploaded.hash}</p>
                    <a
                        href={uploaded.url}
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline"
                        onClick={e => e.stopPropagation()}
                    >
                        View on IPFS
                    </a>
                </div>
            ) : (
                <div className="flex flex-col items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        {accept?.includes('pdf') ? <FileText className="w-5 h-5 text-primary" /> : <Upload className="w-5 h-5 text-primary" />}
                    </div>
                    <p className="text-sm font-medium text-foreground">{label}</p>
                    <p className="text-xs text-muted-foreground">Drag & drop or click to browse</p>
                    <p className="text-xs text-muted-foreground/50">Files are pinned to IPFS for permanent storage</p>
                </div>
            )}
        </div>
    );
}
