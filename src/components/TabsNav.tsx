'use client';
import { Icon } from './icons';

interface Tab { id: string; label: string; icon?: string; }

interface Props {
  tabs: Tab[];
  active: string;
  onChange: (id: string) => void;
}

export default function TabsNav({ tabs, active, onChange }: Props) {
  return (
    <div className="segtabs-wrap">
      <nav className="segtabs">
        {tabs.map(tb => (
          <button
            key={tb.id}
            className={'segtab' + (active === tb.id ? ' active' : '')}
            onClick={() => onChange(tb.id)}
          >
            {tb.icon && <Icon name={tb.icon as any} size={16} stroke={1.9} />}
            <span>{tb.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
