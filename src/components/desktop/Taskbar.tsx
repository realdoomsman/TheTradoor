'use client';

import { useEffect, useState } from 'react';

interface TaskbarProps {
  openWindows: { id: string; title: string; icon: string; isMinimized: boolean }[];
  activeWindowId: string | null;
  onWindowClick: (id: string) => void;
  winRate?: number;
  totalBurned?: number;
}

function formatBurned(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toLocaleString();
}

export function Taskbar({
  openWindows,
  activeWindowId,
  onWindowClick,
  winRate = 0,
  totalBurned = 0,
}: TaskbarProps) {
  const [time, setTime] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const h = now.getHours();
      const m = String(now.getMinutes()).padStart(2, '0');
      const ampm = h >= 12 ? 'PM' : 'AM';
      const h12 = h % 12 || 12;
      setTime(`${h12}:${m} ${ampm}`);
    };
    update();
    const interval = setInterval(update, 30_000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="taskbar font-mono">
      {/* Start */}
      <button className="start-btn">TRADOOR</button>

      <div className="taskbar-sep" />

      {/* Open windows */}
      {openWindows.map((win) => (
        <button
          key={win.id}
          className={`taskbar-btn ${
            activeWindowId === win.id && !win.isMinimized ? 'taskbar-btn-active' : ''
          }`}
          onClick={() => onWindowClick(win.id)}
        >
          <span style={{ fontSize: 9, fontWeight: 900 }}>{win.icon}</span>
          <span className="truncate">{win.title}</span>
        </button>
      ))}

      {/* Live stats ticker */}
      <div className="taskbar-ticker">
        <span>
          W/R <span className="sol-price">{winRate.toFixed(0)}%</span>
        </span>
        <span>
          BURNED <span style={{ color: '#ffaa00', fontWeight: 'bold' }}>
            {formatBurned(totalBurned)}
          </span>
        </span>
        <span className="network">solana mainnet</span>
        <div className="taskbar-clock">{time}</div>
      </div>
    </div>
  );
}
