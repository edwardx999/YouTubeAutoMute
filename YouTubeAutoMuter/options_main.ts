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