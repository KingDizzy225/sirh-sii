import React, { useRef, useState, useEffect } from 'react';
import { RefreshCcw } from 'lucide-react';

export function SignaturePad({ onSign }) {
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#0f172a';
    }, []);

    const startDrawing = (e) => {
        const { offsetX, offsetY } = getCoordinates(e);
        const ctx = canvasRef.current.getContext('2d');
        ctx.beginPath();
        ctx.moveTo(offsetX, offsetY);
        setIsDrawing(true);
    };

    const draw = (e) => {
        if (!isDrawing) return;
        const { offsetX, offsetY } = getCoordinates(e);
        const ctx = canvasRef.current.getContext('2d');
        ctx.lineTo(offsetX, offsetY);
        ctx.stroke();
    };

    const stopDrawing = () => {
        if (isDrawing) {
            const ctx = canvasRef.current.getContext('2d');
            ctx.closePath();
            setIsDrawing(false);
            
            // Notify parent
            const dataUrl = canvasRef.current.toDataURL('image/png');
            onSign(dataUrl);
        }
    };

    const getCoordinates = (e) => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        if (e.touches && e.touches.length > 0) {
            return {
                offsetX: e.touches[0].clientX - rect.left,
                offsetY: e.touches[0].clientY - rect.top
            };
        }
        return {
            offsetX: e.nativeEvent ? e.nativeEvent.offsetX : e.clientX - rect.left,
            offsetY: e.nativeEvent ? e.nativeEvent.offsetY : e.clientY - rect.top
        };
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        onSign(null);
    };

    return (
        <div className="flex flex-col items-center">
            <div className="border-2 border-slate-300 border-dashed rounded-xl bg-slate-50 relative overflow-hidden touch-none">
                <canvas
                    ref={canvasRef}
                    width={400}
                    height={150}
                    className="cursor-crosshair bg-white"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                />
            </div>
            <div className="flex justify-between w-full max-w-[400px] mt-2">
                <span className="text-xs text-slate-400">Dessinez votre signature</span>
                <button
                    type="button"
                    onClick={clearCanvas}
                    className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 font-medium"
                >
                    <RefreshCcw size={12} /> Effacer
                </button>
            </div>
        </div>
    );
}
