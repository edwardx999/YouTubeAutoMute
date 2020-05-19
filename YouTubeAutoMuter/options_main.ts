/*
Copyright(C) 2020 Edward Xie

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.
*/
import { OptionsMessage, VarLabel } from "./options_message";
import { StorageName, StorageUnit, storeOptions, getAllOptions } from "./options_storage";

const automuteInput = <HTMLInputElement>document.getElementById("autoMuteOn");
const prepauseInput = <HTMLInputElement>document.getElementById("prepauseOn");
const autoskipInput = <HTMLInputElement>document.getElementById("autoSkipOn");

getAllOptions(callback);

function assignValue(el: HTMLInputElement, options: StorageUnit, key: StorageName) {
    const value = options[key];
    if (value === undefined) {
        el.checked = true;
    }
    else {
        el.checked = Boolean(value);
    }
    el.innerText = value+"";
}

function callback(options: StorageUnit | undefined): void {
    if (options) {
        assignValue(automuteInput, options, StorageName.AutoMute);
        assignValue(prepauseInput, options, StorageName.Prepause);
        assignValue(autoskipInput, options, StorageName.AutoSkip);
    }
    else {
        automuteInput.checked = true;
        prepauseInput.checked = true;
        autoskipInput.checked = true;
    }
    addChangeListener(automuteInput, VarLabel.AutoMute, StorageName.AutoMute);
    addChangeListener(prepauseInput, VarLabel.Prepause, StorageName.Prepause);
    addChangeListener(autoskipInput, VarLabel.AutoSkip, StorageName.AutoSkip);
}

function addChangeListener(el: HTMLInputElement, varName: VarLabel, storageName: StorageName) {
    el.disabled = false;
    el.addEventListener("change", () => {
        const value = el.checked;
        const message: OptionsMessage = { automuteVar: varName, value };
        chrome.tabs.query({}, (tabs) => {
            for (const tab of tabs) { 
                chrome.tabs.sendMessage(tab.id, message);
            }
        })
        storeOptions({ [storageName]: value });
    });
}