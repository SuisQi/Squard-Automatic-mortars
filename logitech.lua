local interval = 10 -- 每次循环之间的间隔，单位是毫秒
local file_path = "E:/code/py/Squard-Automatic-mortars/pos"

function OnEvent(event, arg)
    if event == "PROFILE_ACTIVATED" then
        EnablePrimaryMouseButtonEvents(true)
        while true do
            local mouseY = GetMouseY()
            local success, err = pcall(DisplayMouseY, mouseY)
            if not success then
                OutputLogMessage("Error: %s\n", err)
            end
            Sleep(interval)
        end
    elseif event == "PROFILE_DEACTIVATED" then
        EnablePrimaryMouseButtonEvents(false)
    end
end

function GetMouseY()
    local x, y = GetMousePosition()
    return y
end

function DisplayMouseY(mouseY)
    ClearLog()
    OutputLogMessage("Mouse Y Position: %d\n", mouseY)

    local success, err = pcall(function()
        local file = io.open(file_path, "a")
        if file then
            file:write(string.format("Mouse Y Position: %d\n", mouseY))
            file:close()
        else
            error("Error opening file")
        end
    end)

    if not success then
        OutputLogMessage("File write error: %s\n", err)
    end
end
