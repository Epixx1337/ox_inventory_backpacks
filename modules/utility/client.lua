-- See README-backpack-utility.md for documentation.

local Utility = require 'modules.utility.shared'

local appliedByComponent = {}
local activeByRole = {}

local function isFemalePed(ped)
    return GetEntityModel(ped) == `mp_f_freemode_01`
end

local function applyComponent(config)
    local ped = cache.ped
    local component = config.component
    local drawable = isFemalePed(ped) and config.female or config.male

    if not component or type(drawable) ~= 'table' then return end

    SetPedComponentVariation(ped, component, drawable[1] or 0, drawable[2] or 0, 2)
    appliedByComponent[component] = true
end

local function resetComponent(component)
    if not appliedByComponent[component] then return end

    SetPedComponentVariation(cache.ped, component, 0, 0, 2)
    appliedByComponent[component] = nil
end

---Apply or clear the clothing for a utility slot role on the local ped.
---@param role string
---@param config table | nil clothing config ({ component, male = {drawable, texture}, female = {drawable, texture} })
function Utility.SetClothing(role, config)
    local previous = activeByRole[role]

    if config then
        activeByRole[role] = config
        applyComponent(config)
    else
        activeByRole[role] = nil

        if previous and previous.component then
            resetComponent(previous.component)
        end
    end
end

lib.onCache('ped', function()
    SetTimeout(150, function()
        for _, config in pairs(activeByRole) do
            applyComponent(config)
        end
    end)
end)

local armour = Utility.armour

if armour and Utility.armourSlot then
    local plateBusy = false
    local wearingVest = false

    ---@param restore boolean? player just loaded in; apply the stored value instead of clamping to the current ped
    function Utility.SyncArmour(restore)
        local vest = PlayerData.inventory[Utility.armourSlot]

        if restore then wearingVest = false end

        if not vest then
            if wearingVest then
                SetPedArmour(cache.ped, 0)
            end

            wearingVest = false
            return
        end

        local maxArmour = math.min((vest.metadata?.plates or 0) * armour.armourPerPlate, 100)
        local desired = math.min(vest.metadata?.armour or maxArmour, maxArmour)

        if wearingVest then
            desired = math.min(desired, GetPedArmour(cache.ped))
        end

        SetPedArmour(cache.ped, desired)
        wearingVest = true
    end

    local function plateAction(callback, label, successLabel)
        if plateBusy or not PlayerData.loaded then return end

        plateBusy = true
        client.closeInventory()

        local success = lib.progressBar({
            duration = armour.actionTime or 1500,
            label = label,
            useWhileDead = false,
            canCancel = true,
            disable = { move = true, combat = true },
            anim = { dict = 'clothingshirt', clip = 'try_shirt_positive_d' }
        })

        if success then
            local plates, response = lib.callback.await(callback, false)

            if plates then
                SetPedArmour(cache.ped, math.min(plates * armour.armourPerPlate, 100))
                lib.notify({ type = 'success', description = successLabel })
            elseif response then
                lib.notify({ type = 'error', description = locale(response) })
            end
        end

        plateBusy = false
    end

    RegisterNetEvent('ox_inventory:insertArmourPlate', function()
        plateAction('ox_inventory:insertArmourPlate', locale('armour_inserting_plate'), locale('armour_plate_inserted'))
    end)

    RegisterNetEvent('ox_inventory:removeArmourPlates', function()
        plateAction('ox_inventory:removeArmourPlates', locale('armour_removing_plates'), locale('armour_plates_removed'))
    end)

    local lastSynced

    SetInterval(function()
        if not PlayerData.loaded then return end

        local vest = PlayerData.inventory[Utility.armourSlot]
        local plates = vest and vest.metadata?.plates or 0

        if not vest or plates == 0 then
            lastSynced = nil
            return
        end

        local current = math.floor(GetPedArmour(cache.ped))
        local stored = vest.metadata?.armour or math.min(plates * armour.armourPerPlate, 100)

        -- only report damage; the server ignores anything that would raise the stored value
        if current >= stored or current == lastSynced then return end

        lastSynced = current

        TriggerServerEvent('ox_inventory:updateArmourPlates', current)
    end, 1000)
end

return Utility
