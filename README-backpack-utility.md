# Backpack & Utility Slots for ox_inventory

Adds three features on top of stock ox_inventory (v2.47.9):

1. **Utility / equipment slots** — a middle panel between the left and right
   inventories with configurable, restricted slots (backpack, phone, radio, armor,
   free utility slots) arranged around a body figure, plus a quick-slot row bound
   to the 1–5 action keys.
2. **Backpack system** — equipping a bag in the backpack slot renders its own
   inventory panel below the pockets, applies backpack clothing to the ped
   (visible to everyone, survives outfit changes), and applies a configurable
   weight discount to the bag's contents. Every bag is a unique, persistent
   stash. Equipping armour likewise shows a vest on the ped.
3. **Armour plates** — the vest is equipped (not used); armour plates are
   inserted into it through the vest's context menu, ped armour comes from the
   plates, and taking damage wears them down and breaks them. Plates and the
   remaining armour travel with the vest and survive a relog.
4. **Collapsible panels & bag interactions** — every inventory panel can be
   collapsed with a chevron; carried bags can be opened below the right inventory
   via their context menu (the same panel scripts can use to show a robbed
   player's backpack).

---

## Player controls

| Input | Effect |
|---|---|
| Drag & drop | Move/swap/stack between any visible panels |
| `CTRL + LMB` | Fast move a stack (pockets/backpack → right inventory, right → pockets) |
| `CTRL + SHIFT + LMB` | Fast move half a stack |
| `SHIFT + Drag` | Split quantity in half |
| `ALT + LMB` (pockets) | Fast use an item |
| `ALT + LMB` (bag panel) | Fast move the item into your pockets |
| `RMB` | Context menu (pockets and backpack panel) |
| `RMB → Open Backpack` | Open a carried (not equipped) bag below the right inventory |
| Use an `armour_plate` item | Insert it into the worn vest (progress bar) |
| `RMB → Insert Plate / Remove Plates` (vest) | Manage armour plates in the worn vest |
| Chevron (above the weight bar) | Collapse/expand that panel |
| Keys `1–5` | Use the item in hotkey slots 1–5 |

Notes:
- The Use option is hidden for items inside a backpack and for bag items — take
  the item into your pockets to use it.
- Give works from the backpack panel (drag onto Give, or context menu).
- Dropping a bag on the ground keeps its contents; hand it to another player and
  the contents travel with it (same serial → same stash).

---

## Configuration

All configuration is done through convars (shown here as in `ox.cfg`).

```cfg
# Utility/equipment slot layout, appended after inventory:slots (set to [] to disable the feature)
# Entry fields: role (icon), label (box name), items (allowed names),
# weapons (true = weapons only, false = deny weapons), hotkey (binds action key 1-5)
setr inventory:utilityslots [
    { "role": "backpack", "label": "Backpack", "items": ["backpack", "duffelbag"] },
    { "role": "phone", "label": "Phone", "items": ["phone"] },
    { "role": "utility", "label": "Utility 1", "weapons": false },
    { "role": "radio", "label": "Radio", "items": ["radio"] },
    { "role": "armour", "label": "Armor", "items": ["armour"] },
    { "role": "utility", "label": "Utility 2", "weapons": false },
    { "role": "hotkey", "label": "Hotkey 1", "hotkey": 1 },
    { "role": "hotkey", "label": "Hotkey 2", "hotkey": 2 },
    { "role": "hotkey", "label": "Hotkey 3", "hotkey": 3 },
    { "role": "hotkey", "label": "Hotkey 4", "hotkey": 4 },
    { "role": "hotkey", "label": "Hotkey 5", "hotkey": 5 }
]

# Percentage of a backpack's contents weight carried while the bag is equipped/held by a player
setr inventory:backpackcarryweight 60

# Percentage of a backpack's contents weight while the bag sits in another inventory (stash/trunk/drop)
setr inventory:backpackstorageweight 30

# Clothing components applied to the ped while a utility slot is occupied (set {} to disable)
# Keyed by slot role; per-item override via a `clothing` table on the item definition
setr inventory:utilityclothing {
    "backpack": { "component": 5, "male": [40, 0], "female": [40, 0] },
    "armour": { "component": 9, "male": [4, 0], "female": [6, 0] }
}
```

`component` is the ped component id (5 = bags, 9 = body armour), `male`/`female`
are `[drawable, texture]` pairs for the freemode peds. Any role in the layout can
be given clothing this way.

```cfg
# Armour plate system: equip a vest in the armour slot and insert plates via the vest's context menu (set {} to disable)
setr inventory:armourplates { "item": "armour_plate", "armourPerPlate": 50, "maxPlates": 2, "actionTime": 1500 }
```

`item` is the plate item name, `armourPerPlate` the ped armour granted per plate
(capped at 100 total), `maxPlates` how many fit in a vest, `actionTime` the
progress bar duration in ms.

### Utility slot entries

Utility slots are **appended after** `inventory:slots`: with `inventory:slots 62`
the utility slots occupy 63+. Existing saved inventories are never affected, and
the pockets grid keeps its full configured capacity — drop-in safe for live
servers. The layout renders non-`hotkey` entries around the body figure (first
half = left column top-to-bottom, second half = right column) and `hotkey`
entries as the bottom row.

| Field | Description |
|---|---|
| `role` | Placeholder icon + fallback label: `backpack`, `phone`, `radio`, `armour`, `parachute`, `weapon`, `utility`, `hotkey` |
| `label` | Name shown above the box (falls back to the `ui_<role>` locale) |
| `items` | Explicit allowed item names |
| `weapons` | `true` = also accept any weapon; `false` = accept anything **except** weapons |
| `hotkey` | Binds action key 1–5 to this slot (replaces the stock slot 1–5 hotbar) |

A slot with neither `items` nor `weapons` accepts everything. The first
`backpack` role drives the backpack panel. Setting the convar to `[]` disables
the whole feature and restores stock behaviour (including the slot 1–5 hotbar).

### Whitelisting items per slot

`items` is a whitelist: when set, **only** the listed item names can be placed
in that slot — dragging anything else is refused in the UI and rejected by the
server (`Utility.CanHoldItem`), including items displaced into the slot by a
swap. Add every item that should fit:

```cfg
# Radio slot accepts only these two radios
{ "role": "radio", "label": "Radio", "items": ["radio", "radio_gold"] }

# Backpack slot decides which bags are equippable
{ "role": "backpack", "label": "Backpack", "items": ["backpack", "duffelbag", "tactical_backpack"] }

# Accept anything EXCEPT weapons
{ "role": "utility", "label": "Utility 1", "weapons": false }

# Weapons only, plus a specific non-weapon item
{ "role": "weapon", "label": "Gadget", "items": ["taser_cartridge"], "weapons": true }

# No restriction at all
{ "role": "hotkey", "label": "Hotkey 1", "hotkey": 1 }
```

Rules of thumb:
- `items` + `weapons: true` are OR'd — the slot accepts the listed names *and*
  any weapon.
- `weapons: false` denies weapons and accepts everything else (combine with
  `items` to deny weapons but only allow the listed names).
- Items already sitting in a slot when you tighten its whitelist can always be
  dragged out; only placement *into* the slot is validated.
- Scripted `AddItem(..., slot)` respects the same whitelist (a disallowed item
  falls back to automatic placement in the pockets).

### Backpack items

Declared in `data/items.lua`; the `backpack` table marks the item as a wearable
bag and defines its storage:

```lua
['backpack'] = {
    label = 'Backpack',
    weight = 2000,
    stack = false,
    consume = 0,
    backpack = {
        slots = 20,
        maxWeight = 20000           -- grams
    },
    -- optional per-item clothing override (any utility item, not just bags):
    -- clothing = { component = 5, male = { 45, 0 }, female = { 45, 0 } }
},
```

Add the item name to the backpack slot's `items` list to make it equippable.
Item images used by the UI: `web/images/<item>.png`.

### Locales

`ui_equipment`, `ui_backpack`, `ui_armour`, `ui_phone`, `ui_parachute`,
`ui_radio`, `ui_weapon`, `ui_utility`, `ui_hotkey`, `ui_open_backpack`,
`ui_alt_lmb_bag`, `ui_rmb_bag` (see `locales/en.json`).

---

## How it works

### Utility slots
- `modules/utility/shared.lua` parses the layout, assigns absolute slot numbers
  (`inventory:slots + index`) and bumps `shared.playerslots` by the slot count.
  Because they are ordinary player-inventory slots, weight, persistence,
  frisking, weapon tracking and item use all work unchanged.
- Auto-placement (`AddItem`, `GetEmptySlot`, `GetSlotForItem`, give, craft,
  pickups) never lands in utility slots. An explicit `AddItem(..., slot)` into a
  utility slot is honoured only if the item is allowed there.
- Allow-lists are enforced in the UI (`canDrop`/`onDrop`) and authoritatively in
  `swapItems` — including for an item displaced into a utility slot by a swap.
  Purchases (`buyItem`) and crafting cannot target utility slots.

### Backpacks (stash-backed)
- Every bag item gets a unique serial: `metadata.id = 'BPKXY123456'`, assigned in
  `Items.Metadata` on creation and `Items.CheckMetadata` on load. The serial
  names its stash `backpack-<id>`, persisted through the stock stash pipeline
  (a row in the `ox_inventory` table) — no schema changes. The item label stays
  plain, but the opened panel's title carries the serial
  (`Backpack BPKXY123456`), matching the stash name in logs and the database
  when handling reports.
- The equipped bag's stash renders as NUI panel type `backpack` below the
  pockets; a carried bag opened via context menu renders as type
  `rightbackpack` below the right inventory.
- The server never trusts the client about which stash a panel refers to: it is
  re-derived from the recorded slot's current item on every operation, and
  `swapItems` takes an extra lock on the bag's slot plus a post-lock
  revalidation, so equip/unequip cannot race content moves.
- Weight discount: after every content move (and whenever a bag changes
  holders) the bag item's `metadata.weight` is set to
  `contents * percent / 100` — `inventory:backpackcarryweight` when a player
  holds the bag, `inventory:backpackstorageweight` otherwise — and the holder's
  total weight is adjusted. Set both to 100 for full weight.
### Utility clothing
- Occupying a clothing-configured utility slot (backpack, armour by default)
  applies a ped component variation (`SetPedComponentVariation` on `cache.ped`);
  emptying the slot resets that component — but only if this system applied it,
  so appearance outfits are never clobbered. Ped components replicate natively
  to other players, so no statebags, attached objects or polling are involved.
- The clothing is re-applied on `lib.onCache('ped')` (ped model changes/respawn)
  and whenever a clothing slot's contents change.
- Equipping or unequipping a clothing slot (backpack, armour) plays a short
  dressing animation (`clothingshirt` / `try_shirt_positive_d`) — transitions
  only, so metadata updates (plates, bag weight) never replay it.

### Armour plates
- The worn vest stores its plate count in `metadata.plates` and its exact
  remaining armour in `metadata.armour`, so both persist and travel with the vest
  through stashes, drops and trades.
- Plates are inserted by **using the plate item** (its `client.event` points at
  `ox_inventory:insertArmourPlate`) or through the vest's context menu buttons.
  Both close the inventory, run a progress bar, then a server callback validates
  the worn vest and the plate items before touching metadata
  (`modules/utility/server.lua`).
- Ped armour is applied client-side from `metadata.armour`: on login, on
  equip/unequip and after plate actions. A 1s monitor reports armour loss to the
  server, which only ever *lowers* the stored value — a client can never report
  its way to more armour, broken plates are consumed rather than refunded, and
  re-syncs never heal the ped above its current armour value.
- Because the damaged value is what persists, relogging restores the armour a
  player logged out with rather than a full set of plates. Up to 1s of damage
  can be lost to an abrupt disconnect, which favours the player slightly.

### Safeguards
- `backpack`/`rightbackpack` swap types are validated against the exploit guard:
  `rightbackpack` exchanges with the player inventory or the equipped backpack
  (bag ↔ bag transfers); `backpack` may also exchange with the right inventory.
  Weights are settled through the bag discount sync in every case.
- Bags and containers can never be nested inside a bag or container.
- Moving the bag that backs the right-side panel closes that panel; unequipping
  the backpack tears down its panel via the client slot watcher.
- Shop/crafting drags only ever land in the pockets.

---

## Function reference

### `modules/utility/shared.lua` (returned table `Utility`)
| Member | Description |
|---|---|
| `slots`, `count`, `bySlot`, `hotkeys` | Parsed layout; `bySlot[slot]` → entry, `hotkeys[1-5]` → slot |
| `backpackSlot` | Absolute slot number of the backpack slot (nil when disabled) |
| `baseSlots` | Pocket slots (player slots excluding utility slots) |
| `carryWeightPercent` / `storageWeightPercent` | Weight discount percentages |
| `clothing` | Per-role clothing config from `inventory:utilityclothing` |
| `IsUtilitySlot(slot)` | Whether a slot number is a utility slot |
| `CanHoldItem(slot, itemName, itemData?)` | Allow-list predicate (true for non-utility slots) |
| `GetClientConfig()` | Layout payload for the NUI `setupUtility` action |

### `modules/utility/client.lua`
| Member | Description |
|---|---|
| `SetClothing(role, config \| nil)` | Applies/clears a clothing config on the local ped for a slot role (tracks what it applied so resets never clobber outfits) |
| `SyncArmour()` | Applies ped armour from the worn vest's plate count (equip/unequip/plate changes; never heals above current armour) |

### `modules/utility/server.lua`
| Name | Description |
|---|---|
| `ox_inventory:insertArmourPlate` (callback) | Consumes one plate item, increments `metadata.plates` on the worn vest |
| `ox_inventory:removeArmourPlates` (callback) | Returns all plates to the pockets, zeroes `metadata.plates` |
| `ox_inventory:updateArmourPlates` (event, `currentArmour`) | Damage monitor report; lowers the stored plate count, never raises it |

### `modules/inventory/server.lua`
| Function | Description |
|---|---|
| `Inventory.GetBackpackItem(name)` | Item definition when `name` is a wearable bag, else nil |
| `Inventory.SyncBackpackItemWeight(holder, slotData, contentsWeight)` | Recomputes a bag item's weight from its contents with the holder's percentage and adjusts the holder's total weight |
| `Inventory.GetEquippedBackpack(inv, createMissing?)` | Validated stash for the bag in the backpack utility slot |
| `Inventory.GetOpenBackpack(inv)` | Same, but only while the panel is registered open |
| `Inventory.OpenBackpack(inv)` | Registers the panel (hookable via `openInventory` hooks, type `backpack`) and returns its NUI payload |
| `Inventory.CloseBackpack(inv)` | Releases the panel |
| `Inventory.OpenRightBackpack(inv, slot)` | Opens a carried bag's stash as the right-side panel (type `rightbackpack`) |
| `Inventory.GetOpenRightBackpack(inv)` / `Inventory.CloseRightBackpack(inv)` | Validated access / release for the right-side panel |

### Callbacks & events
| Name | Description |
|---|---|
| `ox_inventory:openBackpack` (callback) | Returns the equipped bag's panel payload (requires the UI to be open) |
| `ox_inventory:openRightBackpack` (callback, `slot`) | Returns a carried bag's panel payload |
| `ox_inventory:giveItem` (callback, `slot, target, count, fromType?`) | `fromType = 'backpack'` gives from the equipped bag's stash |
| `ox_inventory:closeRightBackpack` (client event) | Clears the right-side bag panel in the NUI |

### NUI contract
| Direction | Name | Payload |
|---|---|---|
| Lua → UI | `setupInventory` | `{ leftInventory?, rightInventory?, backpackInventory? \| false, rightBackpackInventory? \| false }` |
| Lua → UI | `setupUtility` | `UtilitySlotConfig[]` (see `web/src/typings/utility.ts`) |
| UI → Lua | `swapItems` | `{ fromSlot, fromType, toSlot, toType, count }` — types include `backpack` / `rightbackpack`; returns `false`, `true`, or the bag/container item's new weight |
| UI → Lua | `openBagPanel` | player slot number (context menu "Open Backpack") |
| UI → Lua | `giveItem` | `{ slot, count, fromType? }` |

Robbery integration: open a target's worn bag for a police/rob script by
resolving their `Inventory.GetEquippedBackpack(targetInv)` server-side and
pushing the payload to the robber's NUI as `rightBackpackInventory` (type
`rightbackpack`); contents stay live-synced to both parties through `openedBy`.

---

## Integration guide (applying this to a clean ox_inventory)

Requires the web UI source (`web/src`) and a build step: `bun install && bun run build`
inside `web/` (the resource serves `web/build`).

### 1. New files (copy as-is)
- `modules/utility/shared.lua`, `modules/utility/client.lua`, `modules/utility/server.lua`
- `web/src/typings/utility.ts`
- `web/src/components/inventory/PlayerUtility.tsx`
- `web/src/components/inventory/BackpackInventory.tsx`
- `web/src/components/inventory/RightBackpackInventory.tsx`
- `web/src/components/utils/BodySvg.tsx`
- `web/src/components/utils/icons/UtilityIcons.tsx`
- `web/images/backpack.png`, `duffelbag.png` (plus any extra bag images)

### 2. Convars
- `init.lua`: read `inventory:utilityslots`, `inventory:backpackcarryweight`,
  `inventory:backpackstorageweight`, `inventory:utilityclothing` into `shared.*`.
- Server cfg: add the convar block shown under **Configuration**.

### 3. Lua changes
- `data/items.lua`: add bag items with `backpack = { slots, maxWeight }`.
- `modules/items/server.lua`: in `Items.Metadata` and `Items.CheckMetadata`,
  assign `metadata.id = ('BPK%s'):format(GenerateSerial())` for items whose
  definition has `backpack` (force `count = 1` in `Metadata`).
- `modules/inventory/server.lua`:
  - `local Utility = require 'modules.utility.shared'`
  - add the backpack function block (see reference above) before the
    `swapItems` callback;
  - `swapItems`: extend the from/to type exploit guard, resolve `backpack` /
    `rightbackpack` panels, extra bag-slot lock keys + post-lock revalidation,
    utility allow-list guard, bag/container nesting guard, post-move weight
    syncs, right-panel auto-close when its bag moves;
  - `AddItem` / `GetEmptySlot` / `GetSlotForItem`: skip utility slots on player
    inventories;
  - `dropItem`: guard `server.syncInventory` to player inventories and resync
    the bag after dropping from the backpack panel;
  - `giveItem`: accept `fromType` and give from the equipped bag's stash;
  - `Inventory.Remove` (player) and the `ox_inventory:closeInventory` event:
    call `CloseBackpack` / `CloseRightBackpack`.
- `server.lua`: register the `openBackpack` / `openRightBackpack` callbacks;
  call `Inventory.CloseRightBackpack(left)` when `openInventory` re-opens; the
  `container` branch must refuse `data == Utility.backpackSlot`.
- `client.lua`: `local Utility = require 'modules.utility.client'`; fetch the
  backpack panel in every `setupInventory` send (plus
  `rightBackpackInventory = false`); watch clothing slots and the backpack slot
  in `updateInventory` (`syncUtilityClothing()` + panel refresh);
  `syncUtilityClothing()` after the
  initial inventory load; remap hotkeys 1–5 through `Utility.hotkeys`; send
  `setupUtility` after `init`; add the `openBagPanel` NUI callback and the
  `closeRightBackpack` event; pass `fromType` through the give flow.
- `locales/en.json`: add the UI keys listed under **Configuration**.

### 4. Web changes
- `typings/inventory.ts`: add `BACKPACK = 'backpack'`,
  `RIGHTBACKPACK = 'rightbackpack'`; `typings/state.ts`: add
  `backpackInventory`, `rightBackpackInventory`, `utility` (+ history);
  `typings/index.ts`: export `./utility`.
- `store/inventory.ts`: new panels in initial state + history
  snapshot/rollback; `setUtilityConfig`; `setContainerWeight` takes
  `{ containerId, weight }` and matches bags by `backpack-<metadata.id>`.
- `store/contextMenu.ts`: store `inventoryType` with the opened item.
- `reducers/setupInventory.ts`: accept the two panel keys (object or `false`);
  `reducers/refreshSlots.ts`: route slot updates by inventory id.
- `helpers/index.ts`: `getTargetInventory` (4 panels; ctrl-click default:
  pockets/backpack → right, others → pockets), `findAvailableSlot` skips
  utility slots, `getUtilitySlotConfig`, `isUtilitySlot`, `utilitySlotAccepts`,
  `getSlotHotkey`, `isBackpackItem`, `canPairInventories`,
  `canMoveBetweenSlots`.
- `dnd/onDrop.ts`: guard via `canMoveBetweenSlots`; `target.item.slot === 0`
  requests automatic slot selection. `dnd/onGive.ts`: pass `fromType`.
  `dnd/onBuy.ts` / `dnd/onCraft.ts`: only allow pockets targets.
- `thunks/validateItems.ts`: route the returned weight to the right panel.
- `components/inventory/index.tsx`: three-column layout (left column: pockets +
  control row + backpack panel; middle: `PlayerUtility`; right column: right
  inventory + right bag panel).
- `InventoryGrid.tsx`: hide utility slots from the pockets grid,
  `data-inventorytype` attribute, collapse state + chevron.
- `InventorySlot.tsx`: hotkey badges via `getSlotHotkey`, extended `canDrop`,
  context menu for pockets + backpack panel, `ALT` fast-move from bags.
- `InventoryContext.tsx`: conditional Use, Give with `fromType`, Drop with the
  source panel, "Open Backpack" entry. `InventoryControl.tsx`: Give accepts
  backpack sources. `InventoryHotbar.tsx`: popup shows the hotkey-mapped slots.
- `UsefulControls.tsx`: the two extra help rows. `index.scss`: everything below
  the `.inventory-column-left` rule.

### 5. Modified stock functions — exact changes

Copy/paste reference for every edited function. "Add" means insert the snippet
at the described spot; "replace" means swap the stock lines for the snippet.
New functions (`Inventory.GetBackpackItem` → `Inventory.OpenRightBackpack` and
everything in `modules/utility/*`) are not repeated here — copy them from this
repository.

#### `init.lua` — add below `shared.dropweight`

```lua
shared.utilityslots = GetConvar('inventory:utilityslots', '')
shared.backpackcarryweight = GetConvarInt('inventory:backpackcarryweight', 60)
shared.backpackstorageweight = GetConvarInt('inventory:backpackstorageweight', 30)
shared.utilityclothing = GetConvar('inventory:utilityclothing', '')
shared.armourplates = GetConvar('inventory:armourplates', '')
```

#### `modules/items/server.lua` — add below `GenerateSerial`

```lua
local function setBackpackMetadata(item, metadata)
	if not metadata.id then
		metadata.id = ('BPK%s%s'):format(GenerateText(2), math.random(100000, 999999))
	end

	if metadata.label == ('%s %s'):format(item.label, metadata.id) then
		metadata.label = nil
	end
end
```

In `Items.Metadata`, inside the non-weapon `else` branch (before the
`if not metadata.durability then` fallback), add:

```lua
		if item.backpack then
			count = 1
			setBackpackMetadata(item, metadata)
		end
```

In `Items.CheckMetadata`, after the `metadata.bag` conversion, add:

```lua
	if item.backpack then
		setBackpackMetadata(item, metadata)
	end
```

#### `modules/shops/server.lua`

Add to the requires: `local Utility = require 'modules.utility.shared'`

In the `ox_inventory:buyItem` callback, directly after `data.count` is floored:

```lua
		if Utility.bySlot[data.toSlot] then return false end
```

#### `modules/inventory/server.lua`

Add below `local Items = require 'modules.items.server'`:

```lua
local Utility = require 'modules.utility.shared'
```

In `Inventory.Remove`, extend the player branch:

```lua
    elseif inv.player then
        activeIdentifiers[inv.owner] = nil
        Inventory.CloseBackpack(inv)
        Inventory.CloseRightBackpack(inv)
    end
```

In the `ox_inventory:swapItems` callback, replace the from/to type guard:

```lua
	if data.fromType ~= data.toType then
		local involvesRightBackpack = data.fromType == 'rightbackpack' or data.toType == 'rightbackpack'
		local involvesBackpack = data.fromType == 'backpack' or data.toType == 'backpack'

		if involvesRightBackpack then
			if data.fromType ~= 'player' and data.toType ~= 'player' and not involvesBackpack then
				Utils.LogExploit(source, 'swapItems', 'Triggered event with invalid data', true)
				return
			end
		elseif not involvesBackpack and data.toType ~= 'player' and data.fromType ~= 'player' then
			Utils.LogExploit(source, 'swapItems', 'Triggered event with invalid data', true)
			return
		end
	end
```

Replace the from/to inventory resolution:

```lua
	local function resolvePanel(panelType)
		if panelType == 'player' then return playerInventory end
		if panelType == 'backpack' then return Inventory.GetOpenBackpack(playerInventory) end
		if panelType == 'rightbackpack' then return Inventory.GetOpenRightBackpack(playerInventory) end
		return Inventory(playerInventory.open)
	end

	local toInventory = resolvePanel(data.toType)
	local fromInventory = resolvePanel(data.fromType)

	if not fromInventory or not toInventory then
		if data.fromType == 'backpack' or data.toType == 'backpack'
			or data.fromType == 'rightbackpack' or data.toType == 'rightbackpack' then
			return false
		end

		playerInventory:closeInventory()
		return
	end
```

Turn the `GetLocks` table into a variable and add the bag-slot keys:

```lua
    local lockKeys = {
       	('inventory-%s:slot-%s'):format(fromInventory.id, data.fromSlot),
        ('inventory-%s:slot-%s'):format(toInventory.id, data.toSlot)
    }

    if Utility.backpackSlot and (data.fromType == 'backpack' or data.toType == 'backpack') then
        lockKeys[#lockKeys + 1] = ('inventory-%s:slot-%s'):format(playerInventory.id, Utility.backpackSlot)
    end

    if playerInventory.rightBackpackSlot and (data.fromType == 'rightbackpack' or data.toType == 'rightbackpack') then
        lockKeys[#lockKeys + 1] = ('inventory-%s:slot-%s'):format(playerInventory.id, playerInventory.rightBackpackSlot)
    end

    local activeSlots <close> = GetLocks(lockKeys)
```

After the `if not activeSlots then ... end` rollback block, add the post-lock
revalidations:

```lua
    if data.fromType == 'backpack' or data.toType == 'backpack' then
        local backpack = Inventory.GetOpenBackpack(playerInventory)

        if not backpack
            or (data.fromType == 'backpack' and fromInventory ~= backpack)
            or (data.toType == 'backpack' and toInventory ~= backpack) then
            return false
        end
    end

    if data.fromType == 'rightbackpack' or data.toType == 'rightbackpack' then
        local bagStash = Inventory.GetOpenRightBackpack(playerInventory)

        if not bagStash
            or (data.fromType == 'rightbackpack' and fromInventory ~= bagStash)
            or (data.toType == 'rightbackpack' and toInventory ~= bagStash) then
            return false
        end
    end
```

Inside `if fromData then`, after the two stock container checks, add:

```lua
            if toInventory.player and not Utility.CanHoldItem(data.toSlot, fromData.name, Items(fromData.name)) then
                return false, 'cannot_perform'
            end

            if fromInventory.player and toData and not Utility.CanHoldItem(data.fromSlot, toData.name, Items(toData.name)) then
                return false, 'cannot_perform'
            end

            if (data.toType == 'backpack' or data.toType == 'rightbackpack' or toInventory.type == 'container')
                and (fromData.metadata.container or Inventory.GetBackpackItem(fromData.name)) then
                return false
            end
```

After the slot assignments/`changed` flags and before the sync `CreateThread`,
add the weight-discount block (see the full block around `local bagWeight` in
this repository's `swapItems`), and change the final return to:

```lua
			return bagWeight or (containerItem and containerItem.weight) or true, nil, weaponSlot
```

In `Inventory.GetEmptySlot`, replace the loop body condition:

```lua
		if not items[i] and not (inventory.player and Utility.bySlot[i]) then
			return i
		end
```

In `Inventory.GetSlotForItem`, wrap the loop body:

```lua
	for i = 1, inventory.slots do
		if not (inventory.player and Utility.bySlot[i]) then
			-- stock loop body unchanged
		end
	end
```

In `Inventory.AddItem`, before the `if slot then` branch add:

```lua
	if slot and inv.player and Utility.bySlot[slot] and not Utility.CanHoldItem(slot, item.name, item) then
		slot = nil
	end
```

and skip utility slots at the top of the auto-placement loop:

```lua
		for i = 1, inv.slots do
			if inv.player and Utility.bySlot[i] then goto next_slot end
			-- stock loop body unchanged, wrapped in do ... end
			::next_slot::
		end
```

In `dropItem`, guard the framework sync and resync the bag after dropping from
the backpack panel:

```lua
	if server.syncInventory and playerInventory.player then server.syncInventory(playerInventory) end

	if data.fromType == 'backpack' then
		local ownerInventory = Inventories[source]
		local bagSlot = ownerInventory and Utility.backpackSlot and ownerInventory.items[Utility.backpackSlot]

		if ownerInventory and bagSlot then
			Inventory.SyncBackpackItemWeight(ownerInventory, bagSlot, playerInventory.weight)
			ownerInventory:syncSlotsWithPlayer({
				{ item = bagSlot, inventory = ownerInventory.id }
			}, ownerInventory.weight)
		end
	end
```

In `giveItem`, change the signature and source resolution (and use
`playerInventory` for the ped distance check and logging):

```lua
local function giveItem(playerId, slot, target, count, fromType)
	local playerInventory = Inventory(playerId)
	local fromInventory = fromType == 'backpack' and Inventory.GetOpenBackpack(playerInventory) or playerInventory
	local toInventory = Inventory(target)

	if not playerInventory or not fromInventory or not toInventory then return end
```

after the successful `RemoveItem`, resync the bag:

```lua
					if fromType == 'backpack' then
						local bagSlot = Utility.backpackSlot and playerInventory.items[Utility.backpackSlot]

						if bagSlot then
							Inventory.SyncBackpackItemWeight(playerInventory, bagSlot, fromInventory.weight)
							playerInventory:syncSlotsWithPlayer({
								{ item = bagSlot, inventory = playerInventory.id }
							}, playerInventory.weight)
						end
					end
```

In the `ox_inventory:closeInventory` server event, add at the end:

```lua
	if inventory then
		Inventory.CloseBackpack(inventory)
		Inventory.CloseRightBackpack(inventory)
	end
```

#### `server.lua`

Change the utility require to load the plate callbacks:
`local Utility = require 'modules.utility.server'`

In `openInventory`, after `left:closeInventory(true)`:

```lua
    Inventory.CloseRightBackpack(left)
```

In the `container` branch, before `left.containerSlot = data`:

```lua
            if Utility.backpackSlot and data == Utility.backpackSlot then return false end
```

Add the panel callbacks (e.g. above `server.forceOpenInventory`):

```lua
lib.callback.register('ox_inventory:openBackpack', function(source)
    local inventory = Inventory(source)

    if not inventory or not inventory.open then return false end

    return Inventory.OpenBackpack(inventory) or false
end)

lib.callback.register('ox_inventory:openRightBackpack', function(source, slot)
    local inventory = Inventory(source)

    if not inventory or not inventory.open or type(slot) ~= 'number' then return false end

    return Inventory.OpenRightBackpack(inventory, slot) or false
end)
```

#### `client.lua`

Below the `modules.inventory.client` require:

```lua
local Utility = require 'modules.utility.client'

local function getBackpackPanel()
    return lib.callback.await('ox_inventory:openBackpack', false) or false
end
```

Below `local Items = require 'modules.items.client'`:

```lua
local utilityClothingSlots = {}
local wornUtility = {}

for i = 1, Utility.count do
    local def = Utility.slots[i]

    if Utility.clothing[def.role] then
        utilityClothingSlots[def.slot] = def.role
    end
end

local function syncUtilityClothing()
    for slot, role in pairs(utilityClothingSlots) do
        local slotItem = PlayerData.inventory[slot]
        local itemDef = slotItem and Items[slotItem.name]

        Utility.SetClothing(role, itemDef and (itemDef.clothing or Utility.clothing[role]) or nil)
    end
end
```

Every `setupInventory` SendNUIMessage gains the panel keys:

```lua
            leftInventory = left,
            rightInventory = currentInventory,
            backpackInventory = getBackpackPanel(),
            rightBackpackInventory = false
```

(`viewInventory` sends `backpackInventory = false` instead.)

At the end of `updateInventory`, add the watchers:

```lua
	local clothingChanged = false

	for slot in pairs(utilityClothingSlots) do
		if changes[slot] ~= nil then
			clothingChanged = true

			local equipped = changes[slot] ~= false

			if PlayerData.loaded and equipped ~= (wornUtility[slot] or false) then
				Utils.PlayAnim(0, 'clothingshirt', 'try_shirt_positive_d', 8.0, 3.0, 1200, 49, 0.0, 0, 0, 0)
			end

			wornUtility[slot] = equipped
		end
	end

	if clothingChanged then
		syncUtilityClothing()
	end

	if Utility.SyncArmour and Utility.armourSlot and changes[Utility.armourSlot] ~= nil then
		Utility.SyncArmour()
	end

	if Utility.backpackSlot and changes[Utility.backpackSlot] ~= nil and invOpen then
		CreateThread(function()
			local backpackInventory = getBackpackPanel()

			if invOpen then
				SendNUIMessage({
					action = 'setupInventory',
					data = { backpackInventory = backpackInventory }
				})
			end
		end)
	end
```

In `useSlot`, before the `metadata.container` branch opens a container:

```lua
			if item.metadata.container then
				if item.slot == Utility.backpackSlot then return end

				return client.openInventory('container', item.slot)
```

In the hotkey keybind loop, replace `useSlot(i)`:

```lua
				useSlot(Utility.hotkeys[i] or i)
```

After the `init` SendNUIMessage:

```lua
	if Utility.count > 0 then
		SendNUIMessage({ action = 'setupUtility', data = Utility.GetClientConfig() })
	end

	for slot in pairs(utilityClothingSlots) do
		wornUtility[slot] = PlayerData.inventory[slot] ~= nil
	end

	syncUtilityClothing()

	if Utility.SyncArmour then Utility.SyncArmour() end
```

Add the bag-panel NUI callback and close event (e.g. below the `exit` callback):

```lua
RegisterNUICallback('openBagPanel', function(slot, cb)
	cb(1)

	local panel = lib.callback.await('ox_inventory:openRightBackpack', false, slot) or false

	if invOpen then
		SendNUIMessage({ action = 'setupInventory', data = { rightBackpackInventory = panel } })
	end
end)

RegisterNetEvent('ox_inventory:closeRightBackpack', function()
	if source == '' then return end

	SendNUIMessage({ action = 'setupInventory', data = { rightBackpackInventory = false } })
end)
```

`giveItemToTarget` gains a `fromType` parameter (skip the weapon disarm when it
is set, pass it to the `ox_inventory:giveItem` callback) and the three
`giveItemToTarget(...)` call sites in the `giveItem` NUI callback pass
`data.fromType` through.

#### Web (`web/src`)

The web changes are easiest taken by copying the files listed under **4. Web
changes** from this repository — they are self-contained and the new panels are
additive to the stock layout.

### 6. Known limitations
- A bag's displayed weight refreshes on content moves and holder transfers;
  external `AddItem` directly into a `backpack-<id>` stash, or a bag inside a
  ground drop, resyncs on the next move that touches the bag.
- Items inside the right-side bag panel have no context menu.
- Moving items out of a bag checks the receiving inventory against the item's
  full weight (the discount is settled after the move), which can be slightly
  stricter than necessary near the weight cap.
