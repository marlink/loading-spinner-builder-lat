import React, { useState, useEffect, useRef } from 'react';

const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export const PerformanceMonitor: React.FC = () => {
    const [fps, setFps] = useState(0);
    const [memory, setMemory] = useState<string | null>(null);
    const frameCountRef = useRef(0);
    const lastTimeRef = useRef(performance.now());
    // FIX: Initialize useRef with null to prevent errors.
    const animationFrameRef = useRef<number | null>(null);

    useEffect(() => {
        const loop = (time: number) => {
            frameCountRef.current++;
            if (time - lastTimeRef.current >= 1000) {
                setFps(frameCountRef.current);
                frameCountRef.current = 0;
                lastTimeRef.current = time;

                // Check for memory API
                const perf = window.performance as any;
                if (perf.memory && perf.memory.usedJSHeapSize) {
                    setMemory(formatBytes(perf.memory.usedJSHeapSize));
                }
            }
            animationFrameRef.current = requestAnimationFrame(loop);
        };

        animationFrameRef.current = requestAnimationFrame(loop);

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, []);
    
    const getFpsColor = (currentFps: number) => {
        if (currentFps >= 55) return 'text-green-400';
        if (currentFps >= 40) return 'text-yellow-400';
        return 'text-red-400';
    }

    return (
        <div className="absolute bottom-2 left-2 bg-black/50 backdrop-blur-sm text-white text-xs font-mono p-2 rounded-md z-10 select-none">
            <div className="flex items-center gap-3">
                <span className={getFpsColor(fps)}>FPS: {fps}</span>
                {memory && <span className="text-cyan-400">MEM: {memory}</span>}
            </div>
        </div>
    );
};
