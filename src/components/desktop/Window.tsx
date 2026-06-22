'use client';

import { useCallback, useRef, useState, useEffect, type ReactNode } from 'react';

interface WindowProps {
  id: string;
  title: string;
  icon?: string;
  children: ReactNode;
  defaultX?: number;
  defaultY?: number;
  defaultWidth?: number;
  defaultHeight?: number;
  isActive: boolean;
  isMinimized: boolean;
  zIndex: number;
  onFocus: () => void;
  onClose: () => void;
  onMinimize: () => void;
}

export function Window({
  title,
  icon,
  children,
  defaultX = 100,
  defaultY = 60,
  defaultWidth = 560,
  defaultHeight = 420,
  isActive,
  isMinimized,
  zIndex,
  onFocus,
  onClose,
  onMinimize,
}: WindowProps) {
  const [pos, setPos] = useState({ x: defaultX, y: defaultY });
  const [size, setSize] = useState({ w: defaultWidth, h: defaultHeight });
  const [isMaximized, setIsMaximized] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null);
  const windowRef = useRef<HTMLDivElement>(null);
  const preMaxRef = useRef({ x: defaultX, y: defaultY, w: defaultWidth, h: defaultHeight });

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (isMaximized) return;
      onFocus();
      dragRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        origX: pos.x,
        origY: pos.y,
      };

      const onMove = (ev: MouseEvent) => {
        if (!dragRef.current) return;
        const dx = ev.clientX - dragRef.current.startX;
        const dy = ev.clientY - dragRef.current.startY;
        setPos({
          x: dragRef.current.origX + dx,
          y: Math.max(0, dragRef.current.origY + dy),
        });
      };

      const onUp = () => {
        dragRef.current = null;
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);
      };

      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
    },
    [pos, onFocus, isMaximized]
  );

  const toggleMaximize = useCallback(() => {
    if (isMaximized) {
      setPos({ x: preMaxRef.current.x, y: preMaxRef.current.y });
      setSize({ w: preMaxRef.current.w, h: preMaxRef.current.h });
      setIsMaximized(false);
    } else {
      preMaxRef.current = { x: pos.x, y: pos.y, w: size.w, h: size.h };
      // Account for top bar (32px) and taskbar (36px) and dock (64px)
      setPos({ x: 64, y: 32 });
      setSize({ w: window.innerWidth - 64, h: window.innerHeight - 32 - 36 });
      setIsMaximized(true);
    }
  }, [isMaximized, pos, size]);

  useEffect(() => {
    const handleResize = () => {
      if (isMaximized) {
        setSize({ w: window.innerWidth - 64, h: window.innerHeight - 32 - 36 });
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMaximized]);

  if (isMinimized) return null;

  return (
    <div
      ref={windowRef}
      className={`window-frame fixed font-mono ${isActive ? 'window-frame-active' : ''}`}
      style={{
        left: pos.x,
        top: pos.y,
        width: size.w,
        height: size.h,
        zIndex,
      }}
      onMouseDown={onFocus}
    >
      {/* Title bar */}
      <div
        className={`window-titlebar ${isActive ? '' : 'window-titlebar-inactive'}`}
        onMouseDown={handleMouseDown}
        onDoubleClick={toggleMaximize}
      >
        {icon && <div className="window-icon">{icon}</div>}
        <span className={`window-title ${isActive ? '' : 'window-title-inactive'}`}>
          {title}
        </span>
        <div className="win-btns">
          <button className="win-btn win-btn-min" onClick={onMinimize} title="Minimize">
            _
          </button>
          <button className="win-btn win-btn-max" onClick={toggleMaximize} title="Maximize">
            +
          </button>
          <button className="win-btn win-btn-close" onClick={onClose} title="Close">
            x
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="window-body">
        {children}
      </div>
    </div>
  );
}
