import React, { useRef, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Camera, X, Loader2, Sparkles, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWallet } from '@/context/WalletContext';
import { useToast } from '@/hooks/use-toast';

interface SmileCameraModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function SmileCameraModal({ isOpen, onClose }: SmileCameraModalProps) {
    const { t } = useTranslation();
    const { addSmilePoints } = useWallet();
    const { toast } = useToast();

    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const [isReady, setIsReady] = useState(false);
    const [detecting, setDetecting] = useState(false);
    const [score, setScore] = useState<number | null>(null);
    const [points, setPoints] = useState<number | null>(null);

    // Start Camera
    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user' }
            });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                streamRef.current = stream;
                setIsReady(true);
            }
        } catch (err) {
            console.error("Camera access error:", err);
            toast({
                title: "Camera Access Failed",
                description: "Please allow camera permissions to use Smile-to-Earn.",
                variant: "destructive"
            });
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        setIsReady(false);
        setScore(null);
        setPoints(null);
    };

    useEffect(() => {
        if (isOpen) {
            startCamera();
        } else {
            stopCamera();
        }
        return () => stopCamera();
    }, [isOpen]);

    const detectSmile = () => {
        setDetecting(true);
        // Simulate AI smile detection
        setTimeout(() => {
            const randomScore = Math.floor(Math.random() * 41) + 60; // 60 to 100
            setScore(randomScore);
            setPoints(randomScore * 10);
            setDetecting(false);
        }, 2500);
    };

    const handleClaim = () => {
        if (points) {
            addSmilePoints(points);
            toast({
                title: t('smile.claimed'),
                description: `+${points} points added to your savings wallet!`,
            });
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-background/90 backdrop-blur-sm"
                onClick={onClose}
            />

            <div className="relative w-full max-w-md rounded-2xl bg-card border border-border p-6 shadow-2xl glassmorphism glow-primary z-10 animate-in zoom-in-95 duration-200">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-muted-foreground hover:text-foreground p-1 rounded-full bg-secondary/50 hover:bg-secondary transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="text-center mb-6">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary mx-auto mb-3">
                        <Sparkles className="w-6 h-6" />
                    </div>
                    <h2 className="text-2xl font-bold text-foreground mb-2">{t('smile.title')}</h2>
                    <p className="text-sm text-muted-foreground">{t('smile.desc')}</p>
                </div>

                <div className="relative aspect-video rounded-xl bg-black overflow-hidden mb-6 border-2 border-primary/20">
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover"
                    />
                    {!isReady && (
                        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                            <Camera className="w-8 h-8 opacity-50" />
                        </div>
                    )}

                    {detecting && (
                        <div className="absolute inset-0 bg-primary/20 backdrop-blur-xs flex flex-col items-center justify-center">
                            <Loader2 className="w-10 h-10 text-primary animate-spin mb-2" />
                            <div className="text-primary font-medium">{t('smile.detecting')}</div>
                        </div>
                    )}

                    {score && (
                        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center p-4 text-center animate-in fade-in zoom-in duration-300">
                            <CheckCircle2 className="w-12 h-12 text-green-400 mb-2" />
                            <div className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">
                                {t('smile.score')}: {score}%
                            </div>
                            <div className="text-4xl font-black text-foreground mb-4">
                                +{points} <span className="text-lg text-muted-foreground font-medium">PTS</span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex gap-3">
                    {score ? (
                        <Button
                            onClick={handleClaim}
                            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold h-12 text-lg glow-primary"
                        >
                            {t('smile.claim')}
                        </Button>
                    ) : (
                        <>
                            {isReady ? (
                                <Button
                                    onClick={detectSmile}
                                    disabled={detecting}
                                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-11 glow-primary"
                                >
                                    {t('smile.start')}
                                </Button>
                            ) : (
                                <Button
                                    onClick={startCamera}
                                    className="w-full bg-secondary text-foreground hover:bg-secondary/80 h-11"
                                >
                                    Enable Camera
                                </Button>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
