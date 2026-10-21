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
