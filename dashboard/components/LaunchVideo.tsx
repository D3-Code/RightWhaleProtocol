"use client";

import { Play, Pause, Volume2, VolumeX, Radio } from "lucide-react";
import { useRef, useState, useEffect } from "react";

export function LaunchVideo() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(true);
    const [isMuted, setIsMuted] = useState(true);

    useEffect(() => {
        // Attempt autoplay
        if (videoRef.current) {
            videoRef.current.play().catch((err) => {
                console.log("Autoplay prevented:", err);
                setIsPlaying(false);
            });
        }
    }, []);

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const toggleMute = () => {
        if (videoRef.current) {
            videoRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    };

    return (
        <div
            className="flex flex-col w-full h-auto bg-black/40 backdrop-blur-md border border-white/5 relative group overflow-hidden"
        >
            {/* Header */}
            <div className="p-3 border-b border-zinc-800 flex justify-between items-center bg-black/20 z-10">
                <div className="flex items-center gap-2">
                    <Radio className="w-4 h-4 text-red-500 animate-pulse" />
                    <span className="text-xs text-zinc-300 font-mono-tech uppercase tracking-widest font-bold">
                        LIVE TRANSMISSION
                    </span>
                </div>
                <div className="flex gap-1">
                    <span className="text-[10px] text-red-500 font-bold animate-pulse px-2 py-0.5 bg-red-500/10 rounded border border-red-500/20">
                        ON AIR
                    </span>
                </div>
            </div>

            {/* Video Container */}
            <div className="relative flex-1 bg-black w-full h-full overflow-hidden group" style={{ aspectRatio: '1080/674' }}>
                <video
                    ref={videoRef}
                    src="/RightWhale.mov"
                    className="w-full h-full object-cover"
                    loop
                    muted={isMuted}
                    playsInline
                />

                {/* Overlay Controls */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-4 z-20">
                    <button
                        onClick={togglePlay}
                        className="p-2 bg-white/10 hover:bg-white/20 rounded-full border border-white/10 transition-colors"
                    >
                        {isPlaying ? (
                            <Pause className="w-5 h-5 text-white" />
                        ) : (
                            <Play className="w-5 h-5 text-white" />
                        )}
                    </button>

                    <button
                        onClick={toggleMute}
                        className="p-2 bg-white/10 hover:bg-white/20 rounded-full border border-white/10 transition-colors"
                    >
                        {isMuted ? (
                            <VolumeX className="w-5 h-5 text-white" />
                        ) : (
                            <Volume2 className="w-5 h-5 text-white" />
                        )}
                    </button>
                </div>

                {/* CRT Scanline Effect Overlay */}
                <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-[5] bg-[length:100%_2px,3px_100%]"></div>
            </div>
        </div>
    );
}
