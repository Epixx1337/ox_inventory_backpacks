-- See README-backpack-utility.md for documentation.

local Utility = require 'modules.utility.shared'

if not Utility.armour or not Utility.armourSlot then return Utility end

local Inventory = require 'modules.inventory.server'
local Items = require 'modules.items.server'

local function getWornVest(inv)
    local slotData = inv.items[Utility.armourSlot]

    if not slotData or not Items(slotData.name) then return end

    return slotData
end

lib.callback.register('ox_inventory:insertArmourPlate', function(source)
    local inv = Inventory(source)

    if not inv then return false end

    local vest = getWornVest(inv)

    if not vest then return false, 'armour_no_vest' end

    local plates = vest.metadata.plates or 0

    if plates >= Utility.armour.maxPlates then return false, 'armour_plates_full' end

    if not Inventory.RemoveItem(inv, Utility.armour.item, 1) then return false, 'armour_no_plates' end

    local metadata = table.clone(vest.metadata)
    metadata.plates = plates + 1

    Inventory.SetMetadata(inv, vest.slot, metadata)

    if server.loglevel > 0 then
        lib.logger(inv.owner, 'armourPlates', ('"%s" inserted a plate into "%s" (%s/%s)'):format(inv.label, vest.name, metadata.plates, Utility.armour.maxPlates))
    end

    return metadata.plates
end)

lib.callback.register('ox_inventory:removeArmourPlates', function(source)
    local inv = Inventory(source)

    if not inv then return false end

    local vest = getWornVest(inv)

    if not vest then return false, 'armour_no_vest' end

    local plates = vest.metadata.plates or 0

    if plates == 0 then return false, 'armour_no_plates' end

    if not Inventory.AddItem(inv, Utility.armour.item, plates) then return false, 'cannot_carry' end

    local metadata = table.clone(vest.metadata)
    metadata.plates = 0

    Inventory.SetMetadata(inv, vest.slot, metadata)

    if server.loglevel > 0 then
        lib.logger(inv.owner, 'armourPlates', ('"%s" removed %sx plates from "%s"'):format(inv.label, plates, vest.name))
    end

    return 0
end)

RegisterNetEvent('ox_inventory:updateArmourPlates', function(currentArmour)
    if type(currentArmour) ~= 'number' then return end

    local inv = Inventory(source)

    if not inv then return end

    local vest = getWornVest(inv)

    if not vest then return end

    local plates = vest.metadata.plates or 0

    if plates == 0 then return end

    currentArmour = math.max(0, math.min(currentArmour, 100))

    local allowed = math.ceil(currentArmour / Utility.armour.armourPerPlate)

    if allowed >= plates then return end

    local metadata = table.clone(vest.metadata)
    metadata.plates = allowed

    Inventory.SetMetadata(inv, vest.slot, metadata)

    if server.loglevel > 1 then
        lib.logger(inv.owner, 'armourPlates', ('"%s" broke %sx plates in "%s" (%s remaining)'):format(inv.label, plates - allowed, vest.name, allowed))
    end
end)

return Utility
