console.log("AutoMuter Loaded");
var pages = {
	NOVIDEO: 0,
	WATCH: 1,
	CHANNEL: 2,
	UNKNOWN: -1
};
//var adPlace;// = document.querySelector(".video-ads");
//console.log(adPlace);
var MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

function doAuto() {
	autoMute();
	autoSkip();
	autoPause();
}

var adObserver = new MutationObserver(doAuto);

var pollingInterval = 600;
var maxAttempts = 10;
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
	adObserver.observe(player, {
		attributes: true,
		characterData: true,
		subtree: false,
		childList: false
	});
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
	var skipButtons = adPlace.getElementsByClassName("videoAdUiSkipButton");
	if (0 < skipButtons.length)
		skipButtons[0].click();
	else {
		skipButtons = adPlace.getElementsByClassName("ytp-ad-skip-button ytp-button");
		if (0 < skipButtons.length)
			skipButtons[0].click();
	}
	var closeBanner = adPlace.getElementsByClassName("close-button");
	if (0 < closeBanner.length)
		closeBanner[0].click();
	else {
		closeBanner = adPlace.getElementsByClassName("ytp-ad-close-button");
		if (0 < closeBanner.length)
			closeBanner[0].click();
	}
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
