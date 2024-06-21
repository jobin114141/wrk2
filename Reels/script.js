const videos = [
    { src: '1.mp4', song: 'Song 1', description: 'This is the first video description.' },
    { src: '2.mp4', song: 'Song 2', description: 'This is the second video description.' },
    { src: '3.mp4', song: 'Song 3', description: 'This is the third video description.' },
    { src: '4.mp4', song: 'Song 4', description: 'This is the fourth video description.' },
    { src: '5.mp4', song: 'Song 5', description: 'This is the fifth video description.' },
    { src: '6.mp4', song: 'Song 6', description: 'This is the sixth video description.' },
    { src: '7.mp4', song: 'Song 7', description: 'This is the seventh video description.' },
    { src: '8.mp4', song: 'Song 8', description: 'This is the eighth video description.' },
];

const appVideos = document.getElementById('app__videos');

videos.forEach((video, index) => {
    const videoElement = document.createElement('div');
    videoElement.className = 'video';
    videoElement.innerHTML = `
        <!-- header starts -->
        <div class="videoHeader">
            <span class="material-icons"></span>
            <img src="icon1.png" alt="Reels Header Image" style="width: 100px; height: auto;">
            <span class="material-icons"></span>
        </div>
        <!-- header ends -->

        <video class="video__player" src="${video.src}" preload="auto" muted></video>

        <!-- footer starts -->
        <div class="videoFooter">
            <div class="videoFooter__ticker">
                <span class="material-icons"> music_note </span>
                <marquee>${video.song}</marquee>
            </div>
            <div class="videoFooter__description">
                <p>${video.description}</p>
            </div>
        </div>
        <!-- footer ends -->
    `;
    appVideos.appendChild(videoElement);

    const videoPlayer = videoElement.querySelector('.video__player');
    videoPlayer.addEventListener('ended', () => {
        if (!isUserScrolling) {
            console.log(`Video ${index + 1} ended, auto-scrolling to next video.`);
            scrollToNextVideo();
        }
    });

    videoPlayer.addEventListener('play', () => {
        if (!isUserScrolling) {
            console.log(`Video ${index + 1} started playing.`);
            // Reload the video to ensure it starts from the beginning
            if (!videoPlayer.paused) {
                videoPlayer.currentTime = 0;
                videoPlayer.load();
                videoPlayer.play();
            }
        }
    });
});

let autoScrollTimeout;
let isUserScrolling = false;
let userScrollTimeout;
let currentIndex = 0;

function startAutoScroll() {
    const videos = document.querySelectorAll('.video');
    if (videos[currentIndex]) {
        const videoPlayer = videos[currentIndex].querySelector('.video__player');
        videoPlayer.play();
        console.log(`Playing video ${currentIndex + 1}`);
        autoScrollTimeout = setTimeout(() => {
            if (!isUserScrolling) {
                scrollToNextVideo();
            }
        }, (videoPlayer.duration * 1000) || 3000); // Reduce the interval for faster transitions
    }
}

function stopAutoScroll() {
    clearTimeout(autoScrollTimeout);
    console.log("Auto-scroll stopped.");
}

function resetUserScrollTimeout() {
    isUserScrolling = true;
    clearTimeout(userScrollTimeout);
    userScrollTimeout = setTimeout(() => {
        isUserScrolling = false;
        console.log("User scroll timeout reset.");
        // Ensure the video in view is the current index
        const videos = document.querySelectorAll('.video');
        const currentVideo = getCurrentVisibleVideo(videos);
        if (currentVideo !== null) {
            currentIndex = Array.from(videos).indexOf(currentVideo);
        }
        startAutoScroll();
    }, 1500); // Reduce the delay for faster response
}

function getCurrentVisibleVideo(videos) {
    const threshold = 0.5; // At least 50% of the video should be visible
    let visibleVideo = null;

    videos.forEach(video => {
        const rect = video.getBoundingClientRect();
        const videoHeight = rect.height;
        const visibleHeight = Math.max(0, Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0));
        const visibility = visibleHeight / videoHeight;

        if (visibility > threshold) {
            visibleVideo = video;
        }
    });

    return visibleVideo;
}

function scrollToNextVideo() {
    const videos = document.querySelectorAll('.video');
    currentIndex = (currentIndex + 1) % videos.length;
    const previousVideoPlayer = videos[(currentIndex - 1 + videos.length) % videos.length].querySelector('.video__player');
    previousVideoPlayer.pause();
    console.log(`Scrolling to video ${currentIndex + 1}`);
    videos[currentIndex].scrollIntoView({ behavior: 'smooth' });

    // Schedule the next auto-scroll after the video duration
    startAutoScroll();
}

const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.5
};

const observerCallback = (entries, observer) => {
    entries.forEach(entry => {
        const videoPlayer = entry.target.querySelector('.video__player');
        if (entry.isIntersecting) {
            console.log(`Video in view: ${entry.target.querySelector('.video__player').src}`);
            videoPlayer.play();
        } else {
            videoPlayer.pause();
        }
    });
};

const observer = new IntersectionObserver(observerCallback, observerOptions);

document.querySelectorAll('.video').forEach(video => {
    observer.observe(video);
});

appVideos.addEventListener('scroll', () => {
    stopAutoScroll();
    resetUserScrollTimeout();
});

// Initialize the auto-scroll
startAutoScroll();
