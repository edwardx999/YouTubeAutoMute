console.log("AutoMuter Loaded");
var adPlace=document.querySelector(".video-ads");
//console.log(adPlace);
var MutationObserver=window.MutationObserver||window.WebKitMutationObserver;

var adObserver=new MutationObserver(
    function() {
        console.log("Ad Change Observed");
        autoSkip();
        autoMute();
    });

if(thisIsAVideo()) {
    console.log("Starting Observer");
    adPlace=document.querySelector(".video-ads");
    if(adPlace) {
        adObserver.observe(adPlace,{
            subtree: true,
            childList: true
        });
    }
}

setInterval(function() {
    //console.log("Polling");
    if(pageChanged()) {
        console.log("Change");
        adObserver.disconnect();
        if(thisIsAVideo()) {
            adPlace=document.querySelector(".video-ads");
            if(adPlace!=null) {
                console.log("Restarting Observer");
                adObserver.observe(adPlace,{
                    subtree: true,
                    childList: true
                });
            }
        }
    }
},300);

var URL=window.location.href;
function pageChanged() {
    var before=URL;
    return (URL=window.location.href)!=before;
}

function thisIsAVideo() {
    return window.location.href.indexOf("watch?v")>-1;
}

var shouldItBeMuted=false;

function isMuted() {
    var volumeControls=document.getElementsByClassName("ytp-volume-panel");
    if(volumeControls.length>0)
        return volumeControls[0].getAttribute("aria-valuetext").indexOf("muted")>-1;
    //console.log("Failed to find volume controls");
    return true;
}

function clickMuteButton() {
    var muteButtons=document.getElementsByClassName("ytp-mute-button ytp-button");
    if(muteButtons.length>0) {
        document.getElementsByClassName("ytp-mute-button ytp-button")[0].click();
        shouldItBeMuted=!shouldItBeMuted;
    } //else
    //console.log("Failed to find mute button");
}

function isAdPlaying() {
    return 0<document.getElementsByClassName("videoAdUi").length;
}

function autoMute() {
    if(shouldItBeMuted===isMuted()) {
        if(isAdPlaying()) {
            //console.log("Ad is Playing");
            if(!isMuted())
                clickMuteButton();
        } else if(isMuted())
            clickMuteButton();
    }
}

function autoSkip() {
    var skipButtons=document.getElementsByClassName("videoAdUiSkipButton videoAdUiAction videoAdUiFixedPaddingSkipButton");
    if(0<skipButtons.length)
        skipButtons[0].click();
    var closeBanner=document.getElementsByClassName("close-button");
    if(0<closeBanner.length)
        closeBanner[0].click();
}
