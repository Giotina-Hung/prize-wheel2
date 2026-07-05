import React, { useState, useRef, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { db } from '../lib/firebase';
import { addDoc, collection } from 'firebase/firestore';

interface PrizeWheelProps {
  items: string[];
}

export default function PrizeWheel({ items }: PrizeWheelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);

  const drawWheel = useCallback((rotation: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = canvas.width;
    const center = size / 2;
    const radius = size / 2 - 20;

    ctx.clearRect(0, 0, size, size);

    const sliceAngle = (2 * Math.PI) / items.length;

    // Pointer
    ctx.beginPath();
    ctx.moveTo(center, 20);
    ctx.lineTo(center - 10, 0);
    ctx.lineTo(center + 10, 0);
    ctx.closePath();
    ctx.fillStyle = 'red';
    ctx.fill();

    // Rotate context so index 0 is at the top
    ctx.save();
    ctx.translate(center, center);
    ctx.rotate(rotation - Math.PI / 2);

    items.forEach((item, index) => {
      const angle = index * sliceAngle;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, angle, angle + sliceAngle);
      ctx.closePath();
      
      ctx.fillStyle = `hsl(${(index * 360) / items.length}, 70%, 60%)`;
      ctx.fill();
      ctx.stroke();

      ctx.save();
      ctx.rotate(angle + sliceAngle / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 20px sans-serif';
      ctx.fillText(item, radius - 10, 10);
      ctx.restore();
    });
    ctx.restore();
  }, [items]);

  useEffect(() => {
    drawWheel(0);
  }, [drawWheel]);

  const spin = () => {
    if (spinning) return;
    setSpinning(true);
    setWinner(null);

    let rotation = 0;
    let velocity = Math.random() * 0.2 + 0.3; // Random initial speed
    const friction = 0.99; // Deceleration

    const animate = () => {
      velocity *= friction;
      rotation += velocity;
      drawWheel(rotation);

      if (velocity > 0.001) {
        requestAnimationFrame(animate);
      } else {
        setSpinning(false);
        const sliceAngle = (2 * Math.PI) / items.length;
        // Winner calculation aligned with new drawing rotation
        const normalized = ((-rotation) % (2 * Math.PI) + (2 * Math.PI)) % (2 * Math.PI);
        const index = Math.floor(normalized / sliceAngle) % items.length;
        setWinner(items[index]);
        
        // Save to Firestore
        addDoc(collection(db, 'draws'), {
          winner: items[index],
          timestamp: new Date().toISOString()
        }).catch((err) => {
          console.error("Error adding document: ", err);
        });
        
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    };
    animate();
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <button
        onClick={spin}
        disabled={spinning}
        className="px-8 py-4 bg-indigo-600 text-white rounded-full font-bold text-xl hover:bg-indigo-700 disabled:bg-gray-400 transition-colors shadow-lg"
      >
        開始抽籤
      </button>
      <canvas ref={canvasRef} width={500} height={500} className="rounded-full shadow-2xl" />
      {winner && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
          <div className="bg-white p-10 rounded-3xl shadow-2xl text-center transform animate-bounce">
            <h2 className="text-3xl font-bold mb-4 text-gray-800">🎉 恭喜！</h2>
            <p className="text-6xl font-black text-indigo-600">{winner}</p>
            <button 
              onClick={() => setWinner(null)}
              className="mt-8 px-6 py-2 bg-gray-800 text-white rounded-full hover:bg-gray-900"
            >
              關閉
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
