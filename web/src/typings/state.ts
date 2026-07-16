import { Inventory } from './inventory';
import { Slot } from './slot';
import { UtilitySlotConfig } from './utility';

export type State = {
  leftInventory: Inventory;
  rightInventory: Inventory;
  backpackInventory: Inventory;
  rightBackpackInventory: Inventory;
  utility: UtilitySlotConfig[];
  itemAmount: number;
  shiftPressed: boolean;
  isBusy: boolean;
  additionalMetadata: Array<{ metadata: string; value: string }>;
  history?: {
    leftInventory: Inventory;
    rightInventory: Inventory;
    backpackInventory: Inventory;
    rightBackpackInventory: Inventory;
  };
};
