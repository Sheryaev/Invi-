'use client';
import { Icon } from './icons';

interface Props {
  title: string;
  text: string;
  onBack: () => void;
}

export default function EmptyState({ title, text, onBack }: Props) {
  return (
    <div className="empty">
      <img className="empty-img" src="/cat.png" alt="" draggable={false} />
      <div className="empty-body">
        <span className="empty-badge"><span className="empty-dot" /> Скоро</span>
        <div className="empty-title">{title}</div>
        <p className="empty-text">{text}</p>
        <div className="empty-actions">
          <button className="btn-primary" onClick={onBack}>
            <Icon name="grid" size={15} /> Вернуться в обзор
          </button>
        </div>
      </div>
    </div>
  );
}
