'use client';
import React from 'react';

type IconName =
  | 'grid' | 'wallet' | 'coins' | 'briefcase' | 'calendar' | 'target'
  | 'pie' | 'search' | 'bell' | 'settings' | 'sun' | 'moon' | 'trend'
  | 'arrowUp' | 'arrowDown' | 'plus' | 'sort' | 'download' | 'filter'
  | 'chevron' | 'logout' | 'spark' | 'info' | 'eye' | 'eyeOff' | 'percent'
  | 'check' | 'layers' | 'key' | 'trash' | 'close' | 'link' | 'refresh';

const ICON_PATHS: Record<IconName, React.ReactNode> = {
  grid: <><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/></>,
  wallet: <><path d="M3 7.5A2.5 2.5 0 0 1 5.5 5H18a1 1 0 0 1 1 1v1.5"/><path d="M3 7.5V17a2 2 0 0 0 2 2h14a1 1 0 0 0 1-1v-3"/><path d="M21 11h-4a2 2 0 0 0 0 4h4a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1Z"/></>,
  coins: <><ellipse cx="9" cy="6.5" rx="6" ry="2.6"/><path d="M3 6.5v4c0 1.4 2.7 2.6 6 2.6s6-1.2 6-2.6v-4"/><path d="M15 11.2c2.6.3 6 .4 6-2.2"/><path d="M9 13.1v4c0 1.4 2.7 2.6 6 2.6s6-1.2 6-2.6v-8.5"/></>,
  briefcase: <><rect x="3" y="7" width="18" height="13" rx="2.5"/><path d="M8 7V5.5A1.5 1.5 0 0 1 9.5 4h5A1.5 1.5 0 0 1 16 5.5V7"/><path d="M3 12h18"/></>,
  calendar: <><rect x="3" y="4.5" width="18" height="16" rx="2.5"/><path d="M3 9h18M8 3v3M16 3v3"/></>,
  target: <><circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1"/></>,
  pie: <><path d="M12 3a9 9 0 1 0 9 9h-9V3Z"/><path d="M14 3.2A9 9 0 0 1 20.8 10H14V3.2Z"/></>,
  search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-3.2-3.2"/></>,
  bell: <><path d="M18 8.5a6 6 0 0 0-12 0c0 6-2.5 7.5-2.5 7.5h17S18 14.5 18 8.5Z"/><path d="M10.3 20a2 2 0 0 0 3.4 0"/></>,
  settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.5 1.5 0 0 0 .3 1.6l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.5 1.5 0 0 0-2.5 1V21a2 2 0 1 1-4 0v-.1a1.5 1.5 0 0 0-2.5-1l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.5 1.5 0 0 0-1-2.5H3a2 2 0 1 1 0-4h.1a1.5 1.5 0 0 0 1-2.5l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.5 1.5 0 0 0 2.5-1V3a2 2 0 1 1 4 0v.1a1.5 1.5 0 0 0 2.5 1l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.5 1.5 0 0 0 1 2.5H21a2 2 0 1 1 0 4h-.1a1.5 1.5 0 0 0-1.5 1.4Z"/></>,
  sun: <><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></>,
  moon: <path d="M21 12.8A8.5 8.5 0 1 1 11.2 3a6.5 6.5 0 0 0 9.8 9.8Z"/>,
  trend: <><path d="M3 17 9 11l4 4 8-8"/><path d="M21 11V7h-4"/></>,
  arrowUp: <path d="M12 19V5M6 11l6-6 6 6"/>,
  arrowDown: <path d="M12 5v14M6 13l6 6 6-6"/>,
  plus: <path d="M12 5v14M5 12h14"/>,
  sort: <><path d="M7 4v16M7 4 4 7M7 4l3 3"/><path d="M17 20V4M17 20l3-3M17 20l-3-3" opacity="0.45"/></>,
  download: <><path d="M12 3v12M8 11l4 4 4-4"/><path d="M4 19h16"/></>,
  filter: <path d="M4 5h16l-6 7v6l-4-2v-4L4 5Z"/>,
  chevron: <path d="m9 6 6 6-6 6"/>,
  logout: <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5M21 12H9"/></>,
  spark: <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z"/>,
  info: <><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 7.5v.5"/></>,
  eye: <><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></>,
  eyeOff: <><path d="M3 3l18 18"/><path d="M10.6 6.2A9.7 9.7 0 0 1 12 6c6 0 9.5 6 9.5 6a15 15 0 0 1-3 3.6M6.1 7.3A15 15 0 0 0 2.5 12s3.5 6 9.5 6a9.3 9.3 0 0 0 4-.9"/><path d="M9.9 10a3 3 0 0 0 4.2 4.2"/></>,
  percent: <><path d="M19 5 5 19"/><circle cx="7.5" cy="7.5" r="2.5"/><circle cx="16.5" cy="16.5" r="2.5"/></>,
  check: <path d="M5 12.5 10 17.5 19 6.5"/>,
  layers: <><path d="M12 3 3 8l9 5 9-5-9-5Z"/><path d="M3 13l9 5 9-5M3 18l9 5 9-5"/></>,
  key: <><circle cx="8" cy="14" r="5"/><path d="M11.5 10.5 21 1M18 4l3 3M15 7l2.5 2.5"/></>,
  trash: <><path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13M10 11v6M14 11v6"/></>,
  close: <path d="M6 6l12 12M18 6 6 18"/>,
  link: <><path d="M9 15l6-6"/><path d="M11 6.5 12.8 4.7a4 4 0 0 1 5.7 5.7L16.6 12M12.8 17.5 11 19.3a4 4 0 0 1-5.7-5.7L7.2 12"/></>,
  refresh: <><path d="M20 11a8 8 0 1 0-.6 4"/><path d="M20 4v6h-6"/></>,
};

interface IconProps {
  name: IconName;
  size?: number;
  stroke?: number;
  fill?: string;
  style?: React.CSSProperties;
  className?: string;
}

export function Icon({ name, size = 20, stroke = 1.7, fill = 'none', style, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fill}
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
      className={className}
    >
      {ICON_PATHS[name]}
    </svg>
  );
}

interface TriProps {
  up: boolean;
  size?: number;
  color?: string;
}

export function Tri({ up, size = 9, color }: TriProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 10 10" style={{ flexShrink: 0 }}>
      <path
        d={up ? 'M5 1 9 8 1 8Z' : 'M5 9 1 2 9 2Z'}
        fill={color || 'currentColor'}
      />
    </svg>
  );
}
