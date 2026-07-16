import InventoryComponent from './components/inventory';
import useNuiEvent from './hooks/useNuiEvent';
import { Items } from './store/items';
import { Locale } from './store/locale';
import { setImagePath } from './store/imagepath';
import { setupInventory, setUtilityConfig } from './store/inventory';
import { Inventory, UtilitySlotConfig } from './typings';
import { useAppDispatch } from './store';
import { debugData } from './utils/debugData';
import DragPreview from './components/utils/DragPreview';
import { fetchNui } from './utils/fetchNui';
import { useDragDropManager } from 'react-dnd';
import KeyPress from './components/utils/KeyPress';

debugData<UtilitySlotConfig[]>([
  {
    action: 'setupUtility',
    data: [
      { slot: 51, role: 'backpack', label: 'Backpack', items: ['backpack', 'duffelbag'] },
      { slot: 52, role: 'phone', label: 'Phone', items: ['phone'] },
      { slot: 53, role: 'utility', label: 'Utility 1', weapons: false },
      { slot: 54, role: 'radio', label: 'Radio', items: ['radio'] },
      { slot: 55, role: 'armour', label: 'Armor', items: ['armour'] },
      { slot: 56, role: 'utility', label: 'Utility 2', weapons: false },
      { slot: 57, role: 'hotkey', label: 'Hotkey 1', hotkey: 1 },
      { slot: 58, role: 'hotkey', label: 'Hotkey 2', hotkey: 2 },
      { slot: 59, role: 'hotkey', label: 'Hotkey 3', hotkey: 3 },
      { slot: 60, role: 'hotkey', label: 'Hotkey 4', hotkey: 4 },
      { slot: 61, role: 'hotkey', label: 'Hotkey 5', hotkey: 5 },
    ],
  },
]);

debugData([
  {
    action: 'setupInventory',
    data: {
      leftInventory: {
        id: 'test',
        type: 'player',
        slots: 61,
        label: 'Bob Smith',
        weight: 3000,
        maxWeight: 5000,
        items: [
          {
            slot: 51,
            name: 'backpack',
            weight: 2500,
            count: 1,
            metadata: { id: 'BPK123456DEMO' },
          },
          { slot: 55, name: 'armour', weight: 3000, count: 1, metadata: { durability: 64 } },
          { slot: 57, name: 'WEAPON_PISTOL', weight: 1100, count: 1, metadata: { durability: 91, ammo: 12 } },
          { slot: 58, name: 'bandage', weight: 120, count: 3 },
          {
            slot: 1,
            name: 'iron',
            weight: 3000,
            metadata: {
              description: `name: Svetozar Miletic  \n Gender: Male`,
              ammo: 3,
              mustard: '60%',
              ketchup: '30%',
              mayo: '10%',
            },
            count: 5,
          },
          { slot: 2, name: 'powersaw', weight: 0, count: 1, metadata: { durability: 75 } },
          { slot: 3, name: 'copper', weight: 100, count: 12, metadata: { type: 'Special' } },
          {
            slot: 4,
            name: 'water',
            weight: 100,
            count: 1,
            metadata: { description: 'Generic item description' },
          },
          { slot: 5, name: 'water', weight: 100, count: 1 },
          {
            slot: 6,
            name: 'backwoods',
            weight: 100,
            count: 1,
            metadata: {
              label: 'Russian Cream',
              imageurl: 'https://i.imgur.com/2xHhTTz.png',
            },
          },
        ],
      },
      rightInventory: {
        id: 'shop',
        type: 'crafting',
        slots: 5000,
        label: 'Bob Smith',
        weight: 3000,
        maxWeight: 5000,
        items: [
          {
            slot: 1,
            name: 'lockpick',
            weight: 500,
            price: 300,
            ingredients: {
              iron: 5,
              copper: 12,
              powersaw: 0.1,
            },
            metadata: {
              description: 'Simple lockpick that breaks easily and can pick basic door locks',
            },
          },
        ],
      },
      backpackInventory: {
        id: 'backpack-BPK123456DEMO',
        type: 'backpack',
        slots: 20,
        label: 'Backpack',
        maxWeight: 20000,
        items: [
          { slot: 1, name: 'water', weight: 100, count: 4 },
          { slot: 2, name: 'bandage', weight: 120, count: 2 },
        ],
      },
    },
  },
]);

const App: React.FC = () => {
  const dispatch = useAppDispatch();
  const manager = useDragDropManager();

  useNuiEvent<{
    locale: { [key: string]: string };
    items: typeof Items;
    leftInventory: Inventory;
    imagepath: string;
  }>('init', ({ locale, items, leftInventory, imagepath }) => {
    for (const name in locale) Locale[name] = locale[name];
    for (const name in items) Items[name] = items[name];

    setImagePath(imagepath);
    dispatch(setupInventory({ leftInventory }));
  });

  useNuiEvent<UtilitySlotConfig[]>('setupUtility', (data) => dispatch(setUtilityConfig(data)));

  fetchNui('uiLoaded', {});

  useNuiEvent('closeInventory', () => {
    manager.dispatch({ type: 'dnd-core/END_DRAG' });
  });

  return (
    <div className="app-wrapper">
      <InventoryComponent />
      <DragPreview />
      <KeyPress />
    </div>
  );
};

addEventListener('dragstart', function (event) {
  event.preventDefault();
});

export default App;
