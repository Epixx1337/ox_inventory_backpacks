import { createAsyncThunk } from '@reduxjs/toolkit';
import { setContainerWeight } from '../store/inventory';
import { InventoryType } from '../typings';
import { fetchNui } from '../utils/fetchNui';
import type { RootState } from '../store';

export const validateMove = createAsyncThunk(
  'inventory/validateMove',
  async (
    data: {
      fromSlot: number;
      fromType: string;
      toSlot: number;
      toType: string;
      count: number;
    },
    { rejectWithValue, dispatch, getState }
  ) => {
    try {
      const response = await fetchNui<boolean | number>('swapItems', data);

      if (response === false) return rejectWithValue(response);

      if (typeof response === 'number') {
        const state = getState() as RootState;
        const containerId =
          data.fromType === InventoryType.BACKPACK || data.toType === InventoryType.BACKPACK
            ? state.inventory.backpackInventory.id
            : data.fromType === InventoryType.RIGHTBACKPACK || data.toType === InventoryType.RIGHTBACKPACK
              ? state.inventory.rightBackpackInventory.id
              : state.inventory.rightInventory.id;

        dispatch(setContainerWeight({ containerId, weight: response }));
      }
    } catch (error) {
      return rejectWithValue(false);
    }
  }
);
