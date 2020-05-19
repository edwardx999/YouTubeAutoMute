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