console.log("AutoMuter Loaded");
var adPlace = document.querySelector(".video-ads");
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
var doubleCheckPage=true;
setInterval(function () {
	//console.log("Polling");
	if(doubleCheckPage){
		pageResponse();
		doubleCheckPage=false;
	}
	else if (pageChanged()){
		pageResponse();
		doubleCheckPage=true;
	}
	else if (tryAgain > 0) {
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
	if (thisIsAVideo()) {
		console.log("Video Spotted");
		tryAgain = (restartObserver()) ? 0 : maxAttempts;
	}
}
function restartObserver() {
	adPlace = document.querySelector(".video-ads");
	if (adPlace != null) {
		console.log("Restarting Observer");
		adObserver.observe(adPlace, {
			subtree: true,
			childList: true
		});
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
	//return -1<window.location.href.indexOf("watch?v");
	return document.getElementsByClassName("html5-video-container").length > 0;
}

var shouldItBeMuted = false;

function isMuted() {
	var volumeControls = document.getElementsByClassName("ytp-volume-panel");
	if (0 < volumeControls.length)
		return -1 < volumeControls[0].getAttribute("aria-valuetext").indexOf("muted");
	//console.log("Failed to find volume controls");
	return true;
}

function clickMuteButton() {
	var muteButtons = document.getElementsByClassName("ytp-mute-button ytp-button");
	if (0 < muteButtons.length) {
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
	var closeBanner = document.getElementsByClassName("close-button");
	if (0 < closeBanner.length)
		closeBanner[0].click();
}
