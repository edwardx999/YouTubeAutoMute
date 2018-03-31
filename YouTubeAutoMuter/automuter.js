/*
Copyright(C) 2017 Edward Xie

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
const pages = {
	NOVIDEO: 0,
	WATCH: 1,
	CHANNEL: 2,
	UNKNOWN: -1
};
//var adPlace;// = document.querySelector(".video-ads");
//console.log(adPlace);
var MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

function doAuto() {
	console.log("Event detected");
	autoMute();
	autoSkip();
	autoPause();
}

const adObserver = new MutationObserver(doAuto);

const pollingInterval = 600;
const maxAttempts = 10;
var tryAgain = 0;
var doubleCheckPage = true;
var pageType = pages.NOVIDEO;
var player;
var muteButton;
var pauseButton;
var volumeControls;
var adPlace;
var prepause = false;

setInterval(function () {
	//console.log("Polling");
	if (doubleCheckPage) {
		pageResponse();
		doubleCheckPage = false;
	} else if (pageChanged()) {
		pageResponse();
		doubleCheckPage = true;
	} else if (tryAgain > 0) {
		--tryAgain;
		adObserver.disconnect();
		if (restartObserver())
			tryAgain = 0;
	}
}, pollingInterval);

function pageResponse() {
	//console.log("");
	//console.log("Change");
	adObserver.disconnect();
	if (pageType = isThisAVideo()) {
		//console.log("Video Spotted");
		tryAgain = (restartObserver()) ? 0 : maxAttempts;
	}
}

function restartObserver() {
	switch (pageType) {
	case pages.WATCH:
		player = document.getElementById("movie_player");
		break;
	case pages.CHANNEL:
		player = document.getElementById("c4-player");
		break;
	default:
		return false;
	}

	//console.log(player);
	if (player == null) {
		console.log("Failed to find player");
		return false;
	}
	console.log("Restarting Observer");
	if ((adPlace = player.getElementsByClassName("video-ads")[0]) == null ||
		(pauseButton = player.getElementsByClassName("ytp-play-button")[0]) == null ||
		(muteButton = player.getElementsByClassName("ytp-mute-button")[0]) == null ||
		(volumeControls = player.getElementsByClassName("ytp-volume-panel")[0]) == null) {
		return false;
	}

	//console.log(adPlace);
	//console.log(pauseButton);
	//console.log(muteButton);
	//console.log(volumeControls);
	adObserver.observe(adPlace, {
		attributes: false,
		characterData: false,
		subtree: true,
		childList: true
	});
	/*adObserver.observe(player, {
	attributes: true,
	characterData: true,
	subtree: false,
	childList: false
	});*/
	doAuto();
	return true;
}

var URL = "";
function pageChanged() {
	if (URL === window.location.href) {
		return false;
	}
	URL = window.location.href;
	return true;
}

function isThisAVideo() {
	if (-1 < window.location.href.indexOf("watch?"))
		return pages.WATCH;
	if (-1 < window.location.href.indexOf("channel") && document.getElementById("c4-player") != null)
		return pages.CHANNEL;
	if (0 < document.getElementsByClassName("html5-video-container").length)
		return pages.UNKNOWN;
	return pages.NOVIDEO;
}

var shouldItBeMuted = false;
chrome.storage.local.get("shouldItBeMuted", function (result) {
	var res = result.shouldItBeMuted;
	if (typeof res === "undefined") {
		shouldItBeMuted = false;
	} else {
		shouldItBeMuted = res;
	}
	//console.log(res);
	//console.log(shouldItBeMuted);
});
//if(shouldItBeMuted==null) shouldItBeMuted=false;
//console.log(shouldItBeMuted);

function isMuted() {
	return -1 < volumeControls.getAttribute("aria-valuetext").indexOf("muted");
}

function clickMuteButton() {
	//console.log("Clicking Mute Button");
	muteButton.click();
	shouldItBeMuted = !shouldItBeMuted;
	chrome.storage.local.set({
		"shouldItBeMuted": shouldItBeMuted
	}, function () {
		//console.log("Local set " + shouldItBeMuted);
	});
}

function isAdPlaying() {
	return player.getAttribute("class").indexOf("ad-int") > -1;
}

function autoMute() {
	if (isAdPlaying()) {
		if (!isMuted())
			clickMuteButton();
	} else if (shouldItBeMuted === isMuted()) {
		if (isMuted())
			clickMuteButton();
	}
}

function autoSkip() {
	var ads=adPlace.getElementsByClassName("adDisplay");
	if(ads.length){
		ads[0].remove();
	}	
	function press(name) {
		var b = adPlace.getElementsByClassName(name);
		if (0 < b.length) {
			b[0].click();
			return true;
		}
		return false;
	}
	
	if (press("videoAdUiSkipButton"));
	else if (press("ytp-ad-skip-button ytp-button"));

	// if (press("close-button"));
	// else if (press("ytp-ad-close-button"));
	// else if (press("svg-close-button"));
}

function isVideoPaused() {
	return player.getAttribute("class").indexOf("pause") > -1;
}

function autoPause() {
	if (isAdPlaying()) {
		if (isVideoPaused()) {
			if (!prepause) {
				prepause = true;
				clickPauseButton();
			}
		}
	} else if (prepause) {
		setTimeout(clickPauseButton, 10);
		prepause = false;
	}
}

function clickPauseButton() {
	//console.log("Clicking Pause Button")
	pauseButton.click();
}
