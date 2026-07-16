
local defaults = [==[
[
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
]==]

local ok, slotDefs = pcall(json.decode, shared.utilityslots ~= '' and shared.utilityslots or defaults)

if not ok or type(slotDefs) ~= 'table' then
    warn('invalid inventory:utilityslots convar (expected a JSON array); utility slots disabled')
    slotDefs = {}
end

local Utility = {
    slots = slotDefs,
    count = #slotDefs,
    bySlot = {},
    hotkeys = {},
    ---@type number?
    backpackSlot = nil,
    baseSlots = shared.playerslots,
    carryWeightPercent = shared.backpackcarryweight,
    storageWeightPercent = shared.backpackstorageweight,
}

local clothingDefaults = [==[
{
    "backpack": { "component": 5, "male": [40, 0], "female": [40, 0] },
    "armour": { "component": 9, "male": [4, 0], "female": [6, 0] }
}
]==]

local clothingOk, clothing = pcall(json.decode, shared.utilityclothing ~= '' and shared.utilityclothing or clothingDefaults)

if not clothingOk or type(clothing) ~= 'table' then
    warn('invalid inventory:utilityclothing convar (expected a JSON object); utility clothing disabled')
    clothing = {}
end

---@type table<string, { component: number, male: number[], female: number[] }>
Utility.clothing = clothing

local armourDefaults = [==[
{ "item": "armour_plate", "armourPerPlate": 50, "maxPlates": 2, "actionTime": 1500 }
]==]

local armourOk, armour = pcall(json.decode, shared.armourplates ~= '' and shared.armourplates or armourDefaults)

if not armourOk or type(armour) ~= 'table' then
    warn('invalid inventory:armourplates convar (expected a JSON object); armour plates disabled')
    armour = {}
end

---@type { item: string, armourPerPlate: number, maxPlates: number, actionTime: number }?
Utility.armour = armour.item and armour or nil

for i = 1, Utility.count do
    local def = slotDefs[i]
    def.slot = shared.playerslots + i

    if def.items then
        local allowed = table.create(0, #def.items)

        for j = 1, #def.items do
            allowed[def.items[j]] = true
        end

        def.allowed = allowed
    end

    Utility.bySlot[def.slot] = def

    if def.hotkey then
        Utility.hotkeys[def.hotkey] = def.slot
    end

    if def.role == 'backpack' and not Utility.backpackSlot then
        Utility.backpackSlot = def.slot
    end

    if def.role == 'armour' and not Utility.armourSlot then
        Utility.armourSlot = def.slot
    end
end

shared.playerslots += Utility.count

---@param slot number
---@return boolean
function Utility.IsUtilitySlot(slot)
    return Utility.bySlot[slot] ~= nil
end

---@param slot number
---@param itemName string
---@param itemData table?
---@return boolean
function Utility.CanHoldItem(slot, itemName, itemData)
    local def = Utility.bySlot[slot]

    if not def then return true end

    local isWeapon = itemData?.weapon ~= nil or itemName:find('^WEAPON_') ~= nil

    if def.weapons == false and isWeapon then return false end

    if not def.allowed and not def.weapons then return true end

    if def.allowed and def.allowed[itemName] then return true end

    if def.weapons and isWeapon then return true end

    return false
end

---@return table[]
function Utility.GetClientConfig()
    local config = table.create(Utility.count, 0)

    for i = 1, Utility.count do
        local def = Utility.slots[i]

        config[i] = {
            slot = def.slot,
            role = def.role,
            label = def.label,
            items = def.items,
            weapons = def.weapons,
            hotkey = def.hotkey,
        }
    end

    return config
end

return Utility
