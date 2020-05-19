import { Storable } from "./options_message";

export enum StorageName {
    AutoMute = "automuteautomute",
    Prepause = "automuteprepause",
    AutoSkip = "automuteautoskip"
}

export type StorageUnit = {
    [key in StorageName]?: Storable;
};

export function storeOptions(storage: StorageUnit) {
    chrome.storage.local.set(storage);
}

type GetStorageCallback = (items: undefined | StorageUnit) => void;

export function getOptions(names: StorageName | StorageName[], callback?: GetStorageCallback): void {
    chrome.storage.local.get(names, callback);
}

export function getAllOptions(callback?: GetStorageCallback): void {
    return getOptions([StorageName.AutoMute, StorageName.AutoSkip, StorageName.Prepause], callback);
}