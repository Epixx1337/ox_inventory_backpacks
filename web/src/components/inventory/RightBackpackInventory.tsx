import InventoryGrid from './InventoryGrid';
import { useAppSelector } from '../../store';
import { selectRightBackpackInventory } from '../../store/inventory';
import { InventoryType } from '../../typings';

const RightBackpackInventory: React.FC = () => {
  const rightBackpackInventory = useAppSelector(selectRightBackpackInventory);

  if (!rightBackpackInventory.id || rightBackpackInventory.type !== InventoryType.RIGHTBACKPACK) return null;

  return <InventoryGrid inventory={rightBackpackInventory} />;
};

export default RightBackpackInventory;
