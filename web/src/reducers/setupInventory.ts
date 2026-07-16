import { CaseReducer, PayloadAction } from '@reduxjs/toolkit';
import { getItemData, itemDurability } from '../helpers';
import { Items } from '../store/items';
import { Inventory, State } from '../typings';

const emptyInventory = (): Inventory => ({ id: '', type: '', slots: 0, maxWeight: 0, items: [] });

const buildInventory = (inventory: Inventory, curTime: number): Inventory => ({
  ...inventory,
  items: Array.from(Array(inventory.slots), (_, index) => {
    const item = Object.values(inventory.items).find((item) => item?.slot === index + 1) || {
      slot: index + 1,
    };

    if (!item.name) return item;

    if (typeof Items[item.name] === 'undefined') {
      getItemData(item.name);
    }

    item.durability = itemDurability(item.metadata, curTime);
    return item;
  }),
});

export const setupInventoryReducer: CaseReducer<
  State,
  PayloadAction<{
    leftInventory?: Inventory;
    rightInventory?: Inventory;
    backpackInventory?: Inventory | false;
    rightBackpackInventory?: Inventory | false;
  }>
> = (state, action) => {
  const { leftInventory, rightInventory, backpackInventory, rightBackpackInventory } = action.payload;
  const curTime = Math.floor(Date.now() / 1000);

  if (leftInventory) state.leftInventory = buildInventory(leftInventory, curTime);

  if (rightInventory) state.rightInventory = buildInventory(rightInventory, curTime);

  if (backpackInventory === false) {
    state.backpackInventory = emptyInventory();
  } else if (backpackInventory) {
    state.backpackInventory = buildInventory(backpackInventory, curTime);
  }

  if (rightBackpackInventory === false) {
    state.rightBackpackInventory = emptyInventory();
  } else if (rightBackpackInventory) {
    state.rightBackpackInventory = buildInventory(rightBackpackInventory, curTime);
  }

  state.shiftPressed = false;
  state.isBusy = false;
};
