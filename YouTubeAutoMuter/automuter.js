var adPlace = document.querySelector(".video-ads");
var MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
var observer = new MutationObserver(
		function (mutations) {
		if (videoPage) {
			console.log("d");
			autoSkip();
			autoMute();
		}
	});
observer.observe(adPlace, {
	subtree: true,
	childList: true
});
var videoPage = true;
/*setInterval(function () {
if (videoPage) {
console.log("d");
autoSkip();
autoMute();
}
}, 500);*/

setInterval(function () {
	videoPage = isThisAVideo();
}, 700);

function isThisAVideo() {
	return window.location.href.indexOf("watch?v") > -1;
}

var shouldItBeMuted = false;

function isMuted() {
	var volumeControls = document.getElementsByClassName("ytp-volume-panel");
	if (volumeControls.length > 0)
		return volumeControls[0].getAttribute("aria-valuetext").indexOf("muted") > -1;
	//console.log("Failed to find volume controls");
	return true;
}

function clickMuteButton() {
	var muteButtons = document.getElementsByClassName("ytp-mute-button ytp-button");
	if (muteButtons.length > 0) {
		document.getElementsByClassName("ytp-mute-button ytp-button")[0].click();
		shouldItBeMuted = !shouldItBeMuted;
	} //else
	//console.log("Failed to find mute button");
}

function isAdPlaying() {
	return 0 < document.getElementsByClassName("videoAdUi").length;
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
	var skipButtons = document.getElementsByClassName("videoAdUiSkipButton videoAdUiAction videoAdUiFixedPaddingSkipButton");
	if (0 < skipButtons.length)
		skipButtons[0].click();
}
