/*
Copyright(C) 2017-2020 Edward Xie

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
import { OptionsMessage, VarLabel, Storable } from "./options_message";
import { PageChangeAlert } from "./page_change_message";
import { StorageName, getAllOptions } from "./options_storage";

console.log("AutoMuter Loaded");

type MutationObserverConstructor = typeof window.MutationObserver;

const MyMutationObserver: MutationObserverConstructor = window.MutationObserver
	// @ts-ignore
	|| window.WebKitMutationObserver;

function coerceStoredValue(value: any): boolean {
	if (value === undefined) {
		return true;
	}
	return Boolean(value);
}

class PlayerObserver {
	static options: Storable[];
	static initializeOptions(callback: () => any): void {
		getAllOptions((options) => {
			if (options) {
				console.log(options);
				PlayerObserver.options = new Array<any>(VarLabel.MAX);
				PlayerObserver.options[VarLabel.AutoMute] = coerceStoredValue(options![StorageName.AutoMute]);
				PlayerObserver.options[VarLabel.AutoSkip] = coerceStoredValue(options![StorageName.AutoSkip]);
				PlayerObserver.options[VarLabel.Prepause] = coerceStoredValue(options![StorageName.Prepause]);
			}
			PlayerObserver.options = [true, true, true];
			callback();
		});
	}
	player: Element;
	ads: Element;
	muteButton: HTMLElement;
	playButton: HTMLElement;
	prepause: boolean;
	observer: MutationObserver;
	wasAdPlaying: boolean;
	wasPaused: boolean;
	constructor(player: Element) {
		this.player = player;
		this.ads = player.getElementsByClassName("video-ads")[0];
		if (!this.ads) {
			throw "No ads found";
		}
		this.muteButton = <HTMLElement>player.getElementsByClassName("ytp-mute-button")[0];
		if (!this.muteButton) {
			throw "No mute button found";
		}
		this.playButton = <HTMLElement>player.getElementsByClassName("ytp-play-button")[0];
		if (!this.muteButton) {
			throw "No play button found";
		}
		this.prepause = false;
		this.observer = new MyMutationObserver(() => { this.autoEvents(); });
		this.wasAdPlaying = false;
		this.wasPaused = false;
	}
	isAdPlaying(): boolean {
		return this.player.getAttribute("class").indexOf("ad-int") > -1;
	}
	isPaused(): boolean {
		return this.player.getAttribute("class").indexOf("paused-mode") > -1;
	}
	isMuted(): boolean {
		return this.muteButton.getAttribute("title").indexOf("Unmute") > -1
	}
	clickPlayButton(): void {
		this.playButton.click();
	}
	play(): void {
		if (this.isPaused()) {
			this.clickPlayButton();
		}
	}
	pause(): void {
		if (!this.isPaused()) {
			this.clickPlayButton();
		}
	}
	clickMuteButton(): void {
		this.muteButton.click()
	}
	mute(): void {
		if (!this.isMuted()) {
			this.clickMuteButton()
		}
	}
	unmute(): void {
		if (this.isMuted()) {
			this.clickMuteButton();
		}
	}
	autoEvents(): void {
		console.log("Event detected");
		const options = PlayerObserver.options;
		if (options[VarLabel.AutoMute]) {
			this.autoMute();
		}
		if (options[VarLabel.Prepause]) {
			this.autoPause();
		}
		else {
			this.prepause = false;
		}
		if (options[VarLabel.AutoSkip]) {
			this.autoSkip();
		}
	}
	autoMute(): void {
		const wasAdPlaying = this.wasAdPlaying;
		const isAdPlaying = this.wasAdPlaying = this.isAdPlaying();
		if (wasAdPlaying) {
			if (!isAdPlaying) {
				// console.log("auto unmuted");
				this.unmute();
			}
		}
		else if (isAdPlaying) {
			// console.log("auto muted");
			this.mute();
		}
	}
	autoSkip(): void {
		const press = (name: string) => {
			const b = this.ads.getElementsByClassName(name);
			if (b.length) {
				(<HTMLElement>b[0]).click();
				// console.log("autoskipped " + name);
				return true;
			}
			return false;
		}
		press("ytp-ad-skip-button") || press("ytp-ad-overlay-close-button");
	}
	autoPause(): void {
		if (this.isAdPlaying()) {
			const wasPaused = this.wasPaused;
			const isPaused = this.wasPaused = this.isPaused();
			if (isPaused && !wasPaused) {
				if (!this.prepause) {
					this.prepause = true;
					// console.log("prepause activated");
					this.play();
				}
				else {
					this.prepause = false;
				}
			}
		} else if (this.prepause) {
			this.prepause = false;
			// console.log("auto paused");
			this.pause();
		}
	}
	createObserver(): void {
		this.observer.observe(this.ads, {
			attributes: false,
			characterData: false,
			subtree: true,
			childList: true
		});
		this.observer.observe(this.player, {
			attributes: true,
			attributeFilter: ["class"]
		});
		this.autoEvents();
	}
	killObserver(): void {
		this.observer.disconnect();
	}
};

const pollingInterval = 50;
const pollingIncrease = 40;
let pollingTime = pollingInterval;
const maxAttempts = 100;
let players: PlayerObserver[] = [];

function playerFound(player: Element): boolean {
	const len = players.length;
	for (let i = 0; i < len; ++i) {
		if (players[i].player === player) {
			return true;
		}
	}
	return false;
}

function findPlayers(): void {
	restartObserver();
	setTimeout(findPlayers, pollingTime);
	pollingTime += pollingIncrease;
}

function pageResponse(): void {
	pollingTime = pollingInterval;
}

function restartObserver(): void {
	const playersFound = document.getElementsByClassName("html5-video-player");
	for (let i = 0; i < playersFound.length; ++i) {
		const p = playersFound[i];
		if (playerFound(p)) {
			continue;
		}
		try {
			const po = new PlayerObserver(p);
			players.push(po);
			po.createObserver();
			console.log("Found player");
		} catch { }
	}
}

PlayerObserver.initializeOptions(() => {
	chrome.runtime.onMessage.addListener(
		(request) => {
			if (request === PageChangeAlert.PageChange) {
				console.log("page update");
				pageResponse();
			}
			if (request) {
				const optionsRequest = <OptionsMessage>request;
				const varLabel = optionsRequest.automuteVar;
				if (varLabel >= VarLabel.FIRST && varLabel < VarLabel.MAX) {
					console.log(optionsRequest);
					PlayerObserver.options[varLabel] = optionsRequest.value;
					for (const observer of players) {
						observer.autoEvents();
					}
				}
			}
			return true;
		});
	findPlayers();
});