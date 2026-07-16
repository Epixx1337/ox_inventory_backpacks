export type UtilitySlotConfig = {
  /** Absolute slot number inside the player inventory */
  slot: number;
  /** Used for the empty-slot placeholder icon, e.g. 'backpack' | 'armour' | 'phone' | 'parachute' | 'radio' | 'weapon' | 'hotkey' */
  role: string;
  /** Display name above the box (config-driven); falls back to the ui_<role> locale, then the role */
  label?: string;
  /** Explicit allowed item names */
  items?: string[];
  /** true: accept any weapon item (name starting with WEAPON_); false: explicitly deny weapons */
  weapons?: boolean;
  /** Action key (1-5) bound to this slot; replaces the stock slot 1-5 hotbar */
  hotkey?: number;
};
