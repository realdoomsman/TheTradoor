'use client';

import { useState, useCallback, useEffect } from 'react';
import { Window } from '@/components/desktop/Window';
import { Taskbar } from '@/components/desktop/Taskbar';
import { ProtocolGuide } from '@/components/apps/ProtocolGuide';
import { MasterWallet } from '@/components/apps/MasterWallet';
import { AITradingDesk } from '@/components/apps/AITradingDesk';
import { StatsApp } from '@/components/apps/StatsApp';
import { TradeHistory } from '@/components/apps/TradeHistory';
import { BurnProtocol } from '@/components/apps/BurnProtocol';
import { FaqApp } from '@/components/apps/FaqApp';
import { useWallet } from '@/hooks/use-wallet';
import { useMetrics } from '@/hooks/use-metrics';

interface AppDef {
  id: string;
  title: string;
  icon: string;
  dockLabel: string;
  defaultX: number;
  defaultY: number;
  defaultW: number;
  defaultH: number;
  component: React.ComponentType;
}

const APP_REGISTRY: AppDef[] = [
  {
    id: 'protocol',
    title: 'wtf is this',
    icon: '?',
    dockLabel: 'guide',
    defaultX: 120,
    defaultY: 50,
    defaultW: 580,
    defaultH: 500,
    component: ProtocolGuide,
  },
  {
    id: 'wallet',
    title: 'the bag',
    icon: '$',
    dockLabel: 'bag',
    defaultX: 160,
    defaultY: 60,
    defaultW: 460,
    defaultH: 440,
    component: MasterWallet,
  },
  {
    id: 'trading',
    title: 'ape desk',
    icon: '>',
    dockLabel: 'ape',
    defaultX: 200,
    defaultY: 40,
    defaultW: 660,
    defaultH: 500,
    component: AITradingDesk,
  },
  {
    id: 'stats',
    title: 'pnl check',
    icon: '#',
    dockLabel: 'pnl',
    defaultX: 240,
    defaultY: 70,
    defaultW: 520,
    defaultH: 480,
    component: StatsApp,
  },
  {
    id: 'history',
    title: 'trade log',
    icon: '%',
    dockLabel: 'trades',
    defaultX: 280,
    defaultY: 50,
    defaultW: 700,
    defaultH: 460,
    component: TradeHistory,
  },
  {
    id: 'burn',
    title: 'the furnace',
    icon: 'x',
    dockLabel: 'burn',
    defaultX: 140,
    defaultY: 80,
    defaultW: 540,
    defaultH: 470,
    component: BurnProtocol,
  },
  {
    id: 'faq',
    title: 'faq / links',
    icon: '?',
    dockLabel: 'faq',
    defaultX: 220,
    defaultY: 50,
    defaultW: 500,
    defaultH: 520,
    component: FaqApp,
  },
];

interface WindowState {
  id: string;
  isMinimized: boolean;
  zIndex: number;
}

/* ── Top Status Bar ── */
function TopBar({ solPrice, walletSol }: { solPrice: number; walletSol: number }) {
  const [uptime, setUptime] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setUptime((u) => u + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatUptime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  return (
    <div className="top-bar font-mono">
      <span className="top-bar-brand">TRADOOR</span>
      <div className="top-bar-sep" />

      <div className="top-bar-item">
        SOL <span className="value live">${solPrice.toFixed(2)}</span>
      </div>
      <div className="top-bar-sep" />

      <div className="top-bar-item">
        BAG <span className="value">{walletSol.toFixed(2)} SOL</span>
      </div>
      <div className="top-bar-sep" />

      <div className="top-bar-item">
        <span className="inline-block w-1.5 h-1.5 bg-[#00ff41] pulse-dot" />
        <span className="value live">LIVE</span>
      </div>
      <div className="top-bar-sep" />

      <div className="top-bar-item">
        CA <a href="https://solscan.io/token/H6qoigb4sdnYvpMUbDyWZah8APB2firuyQNfNjgKpump" target="_blank" rel="noopener noreferrer" className="value" style={{ color: '#00ff41', cursor: 'pointer', textDecoration: 'none' }}>H6qo...pump</a>
      </div>

      <div className="top-bar-item" style={{ marginLeft: 'auto' }}>
        UPTIME <span className="value">{formatUptime(uptime)}</span>
      </div>
      <div className="top-bar-sep" />
      <div className="top-bar-item">
        NET <span className="value">MAINNET</span>
      </div>
    </div>
  );
}

/* ── Sidebar Dock ── */
function DockSidebar({
  apps,
  openIds,
  onOpen,
}: {
  apps: AppDef[];
  openIds: string[];
  onOpen: (id: string) => void;
}) {
  return (
    <div className="dock font-mono">
      {apps.map((app) => {
        const isOpen = openIds.includes(app.id);
        return (
          <button
            key={app.id}
            className="dock-item"
            onClick={() => onOpen(app.id)}
            title={app.title}
          >
            <div className="dock-icon" style={isOpen ? { borderColor: '#00ff41', color: '#00ff41' } : {}}>
              {app.icon}
            </div>
            <span className="dock-label">{app.dockLabel}</span>
            {isOpen && (
              <span
                className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-3 bg-[#00ff41]"
              />
            )}
          </button>
        );
      })}
      <div className="dock-divider" />
      <div className="dock-item" style={{ opacity: 0.3, cursor: 'default' }}>
        <div className="dock-icon">+</div>
        <span className="dock-label">soon</span>
      </div>
    </div>
  );
}

/* ── Main Desktop ── */
export function DesktopEnvironment() {
  const [openWindows, setOpenWindows] = useState<WindowState[]>([
    { id: 'protocol', isMinimized: false, zIndex: 10 },
  ]);
  const [nextZ, setNextZ] = useState(11);
  const [activeId, setActiveId] = useState<string | null>('protocol');

  const { data: wallet } = useWallet();
  const { data: metrics } = useMetrics();

  const solPrice = wallet?.solPrice ?? 0;
  const walletSol = wallet?.balanceSol ?? 0;

  const openApp = useCallback(
    (appId: string) => {
      setOpenWindows((prev) => {
        const existing = prev.find((w) => w.id === appId);
        if (existing) {
          return prev.map((w) =>
            w.id === appId ? { ...w, isMinimized: false, zIndex: nextZ } : w
          );
        }
        return [...prev, { id: appId, isMinimized: false, zIndex: nextZ }];
      });
      setNextZ((z) => z + 1);
      setActiveId(appId);
    },
    [nextZ]
  );

  const closeApp = useCallback(
    (appId: string) => {
      setOpenWindows((prev) => prev.filter((w) => w.id !== appId));
      if (activeId === appId) setActiveId(null);
    },
    [activeId]
  );

  const minimizeApp = useCallback(
    (appId: string) => {
      setOpenWindows((prev) =>
        prev.map((w) => (w.id === appId ? { ...w, isMinimized: true } : w))
      );
      if (activeId === appId) setActiveId(null);
    },
    [activeId]
  );

  const focusApp = useCallback(
    (appId: string) => {
      setOpenWindows((prev) =>
        prev.map((w) =>
          w.id === appId ? { ...w, zIndex: nextZ, isMinimized: false } : w
        )
      );
      setNextZ((z) => z + 1);
      setActiveId(appId);
    },
    [nextZ]
  );

  const handleTaskbarClick = useCallback(
    (appId: string) => {
      const win = openWindows.find((w) => w.id === appId);
      if (!win) return;
      if (win.isMinimized) focusApp(appId);
      else if (activeId === appId) minimizeApp(appId);
      else focusApp(appId);
    },
    [openWindows, activeId, focusApp, minimizeApp]
  );

  return (
    <div className="h-screen w-screen overflow-hidden font-mono flex flex-col">
      {/* Top Status Bar */}
      <TopBar solPrice={solPrice} walletSol={walletSol} />

      {/* Main Area: Dock + Desktop */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Dock */}
        <DockSidebar
          apps={APP_REGISTRY}
          openIds={openWindows.map((w) => w.id)}
          onOpen={openApp}
        />

        {/* Desktop Surface */}
        <div className="desktop-bg scanlines flex-1 relative overflow-hidden">
          {/* ASCII branding watermark */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[1] select-none">
            <pre className="text-[#1a1a1a] text-[11px] leading-tight font-mono text-center">
{`
 _____ _         _____             _                 
|_   _| |_ ___  |_   _|___ ___ _| |___ ___ ___     
  | | |   | -_|   | | |  _| .'| . | . | . |  _|    
  |_| |_|_|___|   |_| |_| |__,|___|___|___|_|      

       b u y   &   b u r n   f l y w h e e l
`}
            </pre>
          </div>

          {/* Windows */}
          {openWindows.map((winState) => {
            const appDef = APP_REGISTRY.find((a) => a.id === winState.id);
            if (!appDef) return null;
            const AppComponent = appDef.component;
            return (
              <Window
                key={winState.id}
                id={winState.id}
                title={appDef.title}
                icon={appDef.icon}
                defaultX={appDef.defaultX}
                defaultY={appDef.defaultY}
                defaultWidth={appDef.defaultW}
                defaultHeight={appDef.defaultH}
                isActive={activeId === winState.id}
                isMinimized={winState.isMinimized}
                zIndex={winState.zIndex}
                onFocus={() => focusApp(winState.id)}
                onClose={() => closeApp(winState.id)}
                onMinimize={() => minimizeApp(winState.id)}
              >
                <AppComponent />
              </Window>
            );
          })}
        </div>
      </div>

      {/* Taskbar */}
      <Taskbar
        openWindows={openWindows.map((ws) => {
          const app = APP_REGISTRY.find((a) => a.id === ws.id);
          return {
            id: ws.id,
            title: app?.title ?? ws.id,
            icon: app?.icon ?? '?',
            isMinimized: ws.isMinimized,
          };
        })}
        activeWindowId={activeId}
        onWindowClick={handleTaskbarClick}
        winRate={metrics?.winRate ?? 0}
        totalBurned={metrics?.totalTradoorBurned ?? 0}
      />
    </div>
  );
}
