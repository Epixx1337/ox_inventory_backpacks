import InventoryGrid from './InventoryGrid';
import { useAppSelector } from '../../store';
import { selectBackpackInventory } from '../../store/inventory';
import { InventoryType } from '../../typings';

const BackpackInventory: React.FC = () => {
  const backpackInventory = useAppSelector(selectBackpackInventory);

  if (!backpackInventory.id || backpackInventory.type !== InventoryType.BACKPACK) return null;

  return <InventoryGrid inventory={backpackInventory} />;
};

export default BackpackInventory;
