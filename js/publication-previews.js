// Start every muted preview independently, without hover or playback controls.
document.querySelectorAll('.publication video').forEach(video => {
    video.muted = true;
    const start = Number(video.dataset.previewStart || 0);
    const end = Number(video.dataset.previewEnd || 0);
    const play = () => {
        video.play().catch(() => {});
    };
    if (end > start) {
        video.addEventListener('loadedmetadata', () => {
            video.currentTime = start;
            play();
        });
        video.addEventListener('timeupdate', () => {
            if (!video.seeking && (video.currentTime < start - 0.1 || video.currentTime >= end)) {
                video.currentTime = start;
            }
        });
    }
    play();
    video.addEventListener('canplay', play, { once: true });
});

// Loop the selected demonstration interval using the official YouTube API.
const youtubePreviews = document.querySelectorAll('iframe[data-video-id]');
if (youtubePreviews.length) {
    youtubePreviews.forEach(iframe => {
        const url = new URL(iframe.src);
        url.searchParams.set('origin', window.location.origin);
        iframe.src = url.href;
    });
    const initializePlayers = () => {
        youtubePreviews.forEach(iframe => {
            const start = Number(iframe.dataset.previewStart);
            const end = Number(iframe.dataset.previewEnd);
            const repeat = player => {
                player.mute();
                player.seekTo(start, true);
                player.playVideo();
            };
            new YT.Player(iframe, {
                events: {
                    onReady: event => {
                        const player = event.target;
                        repeat(player);
                        // Seeking reuses the buffered video instead of reloading its intro.
                        const timer = window.setInterval(() => {
                            if (!iframe.isConnected) {
                                window.clearInterval(timer);
                                return;
                            }
                            if (player.getPlayerState() === YT.PlayerState.PLAYING && player.getCurrentTime() >= end) {
                                repeat(player);
                            }
                        }, 200);
                    },
                    onStateChange: event => {
                        if (event.data === YT.PlayerState.ENDED) repeat(event.target);
                    }
                }
            });
        });
    };
    if (window.YT && window.YT.Player) {
        initializePlayers();
    } else {
        window.onYouTubeIframeAPIReady = initializePlayers;
        const script = document.createElement('script');
        script.src = 'https://www.youtube.com/iframe_api';
        document.head.appendChild(script);
    }
}
