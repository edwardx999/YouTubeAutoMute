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
console.log("AutoMuter Loaded");
const MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

class PlayerObserver {
	constructor(player) {
		this.player = player;
		this.ads = player.getElementsByClassName("video-ads")[0];
		if (!this.ads) {
			throw "No ads found";
		}
		this.muteButton = player.getElementsByClassName("ytp-mute-button")[0];
		if (!this.muteButton) {
			throw "No mute button found";
		}
		this.playButton = player.getElementsByClassName("ytp-play-button")[0];
		if (!this.muteButton) {
			throw "No play button found";
		}
		this.prepause = false
		this.observer = null;
		this.wasAdPlaying = false;
	}
	isAdPlaying() {
		return this.player.getAttribute("class").indexOf("ad-int") > -1;
	}
	isPaused() {
		return this.player.getAttribute("class").indexOf("paused-mode") > -1;
	}
	isMuted() {
		return this.muteButton.getAttribute("title").indexOf("Unmute") > -1
	}
	clickPlayButton() {
		this.playButton.click();
	}
	play() {
		if (this.isPaused()) {
			clickPlayButton();
		}
	}
	pause() {
		if (!this.isPaused()) {
			clickPlayButton();
		}
	}
	clickMuteButton() {
		this.muteButton.click()
	}
	mute() {
		if (!this.isMuted()) {
			this.clickMuteButton()
		}
	}
	unmute() {
		if (this.isMuted()) {
			this.clickMuteButton();
		}
	}
	autoEvents() {
		console.log("Event detected");
		this.autoMute();
		this.autoSkip();
		this.autoPause();
	}
	autoMute() {
		const wasAdPlaying = this.wasAdPlaying;
		const isAdPlaying = this.wasAdPlaying = this.isAdPlaying();
		if (wasAdPlaying) {
			if (!isAdPlaying) {
				this.unmute();
			}
		}
		else if(isAdPlaying) {
			this.mute()
		}
	}
	autoSkip() {
		const press = (name) => {
			const b = this.ads.getElementsByClassName(name);
			if (b.length) {
				b[0].click();
				return true;
			}
			return false;
		}
		if (press("ytp-ad-skip-button"));
		else if (press("ytp-ad-overlay-close-button"));
		// else if (press("videoAdUiSkipButton"));
	}
	autoPause() {
		if (this.isAdPlaying()) {
			if (this.isPaused()) {
				if (!this.prepause) {
					this.prepause = true;
					this.play()
				}
			}
		} else if (this.prepause) {
			setTimeout(() => { this.pause() }, 10);
			this.prepause = false;
		}
	}
	createObserver() {
		const observer = this.observer = new MutationObserver(() => { this.autoEvents(); });
		observer.observe(this.ads, {
			attributes: false,
			characterData: false,
			subtree: true,
			childList: true
		});
	}
	killObserver() {
		this.observer.disconnect();
		this.observer = null;
	}
};

const pollingInterval = 50;
const pollingIncrease = 40;
var pollingTime = pollingInterval;
const maxAttempts = 100;
var players = [];
function playerFound(player) {
	for (let i = 0; i < players.length; ++i) {
		if (players[i].player === player) {
			return true;
		}
	}
	return false;
}

chrome.runtime.onMessage.addListener(
	function (request, sender, sendResponse) {
		if (request === "automutepageupdate") {
			console.log("page update");
			pageResponse();
		}
	});
	
function findPlayers() {
	restartObserver();
	setTimeout(findPlayers, pollingTime);
	pollingTime += pollingIncrease;
}

findPlayers();

function pageResponse() {
	pollingTime = pollingInterval;
}

function restartObserver() {
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
		} catch {}
	}
	return true;
}
