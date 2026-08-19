interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

/**
 * Bottom navigation bar matching the premium dark app aesthetic.
 * Uses emoji icons as placeholders — swap with SVG icons later.
 */
export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const tabs = [
    { id: 'scan',    icon: '⊞',  label: 'Scan' },
    { id: 'history', icon: '☰',  label: 'History' },
    { id: 'settings', icon: '⚙', label: 'Settings' },
  ];

  return (
    <nav className="bottom-nav" id="bottom-nav">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`nav-item ${activeTab === tab.id ? 'nav-item--active' : ''}`}
          onClick={() => onTabChange(tab.id)}
        >
          <span className="nav-icon">{tab.icon}</span>
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
