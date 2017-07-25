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

var adObserver = new MutationObserver(
		function () {
		console.log("Ad Change Observed");
		autoSkip();
		autoMute();
	});

var pollingInterval = 700;
var maxAttempts = 3;
var tryAgain = 0;
var doubleCheckPage = true;
var pageType = pages.NOVIDEO;
var player;
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
	console.log("");
	console.log("Change");
	adObserver.disconnect();
	if (pageType = thisIsAVideo()) {
		console.log("Video Spotted");
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
			return;
	}
	//console.log(player);
	//adPlace = player;//.getElementsByClassName("video-ads ytp-ad-module")[0];
	if (player != null) {
		console.log("Restarting Observer");
		adObserver.observe(player, {
			attributes: true,
			characterData: true,
			subtree: false,
			childList: false
		});
		autoMute();
		return true;
	}
	console.log("Failed to find adPlace");
	return false;
}
var URL = window.location.href;
function pageChanged() {
	var before = URL;
	return (URL = window.location.href) != before;
}

function thisIsAVideo() {
	if (-1 < window.location.href.indexOf("watch?v"))
		return pages.WATCH;
	if (-1 < window.location.href.indexOf("channel") && document.getElementById("c4-player") != null)
		return pages.CHANNEL;
	if (0 < document.getElementsByClassName("html5-video-container").length)
		return pages.UNKNOWN;
	return pages.NOVIDEO;
}

var shouldItBeMuted = false;
/*chrome.storage.local.get("shouldItBeMuted", function (result) {
var res = result.shouldItBeMuted;
if (typeof res === "undefined") {
shouldItBeMuted = false;
} else {
shouldItBeMuted = res;
}
//console.log(res);
//console.log(shouldItBeMuted);
});*/
//if(shouldItBeMuted==null) shouldItBeMuted=false;
//console.log(shouldItBeMuted);

function isMuted() {
	var volumeControls = player.getElementsByClassName("ytp-volume-panel");
	if (0 < volumeControls.length)
		return -1 < volumeControls[0].getAttribute("aria-valuetext").indexOf("muted");
	//console.log("Failed to find volume controls");
	return true;
}

function clickMuteButton() {
	//console.log("Clicking Mute Button");
	var muteButtons = player.getElementsByClassName("ytp-mute-button ytp-button");
	if (0 < muteButtons.length) {
		document.getElementsByClassName("ytp-mute-button ytp-button")[0].click();
		shouldItBeMuted = !shouldItBeMuted;
		/*chrome.storage.local.set({
		"shouldItBeMuted": shouldItBeMuted
		}, function () {
		console.log("Local set " + shouldItBeMuted);
		});*/
	} else
		console.log("Failed to find mute button");
}

function isAdPlaying() {
	return player.getAttribute("class").indexOf("ad-show")>-1;
}

function autoMute() {
	if (shouldItBeMuted === isMuted()) {
		if (isAdPlaying()) {
			//console.log("Ad is Playing");
			if (!isMuted())
				clickMuteButton();
		} else if (isMuted())
			clickMuteButton();
	}
}

function autoSkip() {
	var skipButtons = player.getElementsByClassName("videoAdUiSkipButton videoAdUiAction videoAdUiFixedPaddingSkipButton");
	if (0 < skipButtons.length)
		skipButtons[0].click();
	var closeBanner = player.getElementsByClassName("close-button");
	if (0 < closeBanner.length)
		closeBanner[0].click();
}
