import React from 'react';
import { useAppSelector } from '../../store';
import { selectLeftInventory, selectUtilityConfig } from '../../store/inventory';
import { isSlotWithItem } from '../../helpers';
import { Locale } from '../../store/locale';
import { InventoryType, UtilitySlotConfig } from '../../typings';
import InventorySlot from './InventorySlot';
import BodySvg from '../utils/BodySvg';
import { BackpackIcon, ParachuteIcon, PhoneIcon, PistolIcon, VestIcon } from '../utils/icons/UtilityIcons';

const RoleIcon: React.FC<{ role: string }> = ({ role }) => {
  switch (role) {
    case 'backpack':
      return <BackpackIcon />;
    case 'armour':
      return <VestIcon />;
    case 'phone':
      return <PhoneIcon />;
    case 'parachute':
      return <ParachuteIcon />;
    case 'weapon':
    case 'weapon2':
      return <PistolIcon />;
    case 'radio':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 2h2v3h6a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2V2zm0 5v3h8V7H8zm1 5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm5 0h2v1.5h-2V12zm0 3h2v1.5h-2V15z" />
        </svg>
      );
    case 'utility':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M4 4h7v7H4V4zm2 2v3h3V6H6zm7-2h7v7h-7V4zm2 2v3h3V6h-3zM4 13h7v7H4v-7zm2 2v3h3v-3H6zm10-2h2v3h3v2h-3v3h-2v-3h-3v-2h3v-3z" />
        </svg>
      );
    case 'hotkey':
      return null;
    default:
      return (
        <svg viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="12" r="8" opacity="0.6" />
        </svg>
      );
  }
};

const PlayerUtility: React.FC = () => {
  const leftInventory = useAppSelector(selectLeftInventory);
  const utility = useAppSelector(selectUtilityConfig);

  if (!utility.length || leftInventory.type !== InventoryType.PLAYER || !leftInventory.items.length) return null;

  const slotLabel = (config: UtilitySlotConfig) => {
    if (config.label) return config.label;

    const label = Locale[`ui_${config.role}`] || config.role;

    return config.hotkey !== undefined ? `${label} ${config.hotkey}` : label;
  };

  const renderSlot = (config: UtilitySlotConfig) => {
    const item = leftInventory.items[config.slot - 1];

    if (!item) return null;

    return (
      <div className="player-utility-cell" key={`utility-${config.slot}`}>
        <p className="player-utility-slot-label">{slotLabel(config)}</p>
        <div className="player-utility-slot">
          {!isSlotWithItem(item) && (
            <div className="player-utility-placeholder">
              <RoleIcon role={config.role} />
            </div>
          )}
          <InventorySlot
            item={item}
            inventoryType={leftInventory.type}
            inventoryGroups={leftInventory.groups}
            inventoryId={leftInventory.id}
          />
        </div>
      </div>
    );
  };

  const gearSlots = utility.filter((config) => config.role !== 'hotkey');
  const quickSlots = utility
    .filter((config) => config.role === 'hotkey')
    .sort((a, b) => (a.hotkey || 0) - (b.hotkey || 0));
  const half = Math.ceil(gearSlots.length / 2);
  const leftColumn = gearSlots.slice(0, half);
  const rightColumn = gearSlots.slice(half);

  return (
    <div className="player-utility-wrapper">
      <div className="inventory-grid-header-wrapper">
        <p>{Locale.ui_equipment || 'Equipment'}</p>
      </div>
      <div className="player-utility-body">
        <div className="player-utility-column">{leftColumn.map(renderSlot)}</div>
        <div className="player-utility-figure">
          <BodySvg />
        </div>
        <div className="player-utility-column">{rightColumn.map(renderSlot)}</div>
      </div>
      {quickSlots.length > 0 && <div className="player-utility-row">{quickSlots.map(renderSlot)}</div>}
    </div>
  );
};

export default PlayerUtility;
