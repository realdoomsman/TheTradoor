'use client';

interface DesktopIconProps {
  icon: string;
  label: string;
  onClick: () => void;
}

export function DesktopIcon({ icon, label, onClick }: DesktopIconProps) {
  return (
    <button
      className="desktop-icon font-mono"
      onDoubleClick={onClick}
      onClick={onClick}
    >
      <div className="desktop-icon-img">{icon}</div>
      <div className="desktop-icon-label">{label}</div>
    </button>
  );
}
