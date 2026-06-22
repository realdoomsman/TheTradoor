'use client';

import { useCallback, useRef, useState } from 'react';
import { useTransactionStream } from '@/hooks/use-transaction-stream';

export function FlashOverlay() {
  const [notification, setNotification] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const playClickSound = useCallback(() => {
    try {
      const audioCtx = new AudioContext();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.type = 'square';
      oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);
      gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.001,
        audioCtx.currentTime + 0.04
      );

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.start(audioCtx.currentTime);
      oscillator.stop(audioCtx.currentTime + 0.04);
    } catch {
      // AudioContext may not be available
    }
  }, []);

  const handleNewTransaction = useCallback(() => {
    document.body.classList.add('flash-active');
    setTimeout(() => {
      document.body.classList.remove('flash-active');
    }, 300);

    playClickSound();

    setNotification('SIGNAL DETECTED — NEW TRANSACTION INCOMING');
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setNotification(null);
    }, 2500);
  }, [playClickSound]);

  useTransactionStream({ onNewTransaction: handleNewTransaction });

  if (!notification) return null;

  return (
    <div className="notification-enter fixed top-0 left-0 right-0 z-[100] bg-white text-black font-mono text-[10px] tracking-widest text-center py-1.5">
      {notification}
    </div>
  );
}
