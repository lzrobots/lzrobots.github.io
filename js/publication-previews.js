// Autoplay previews without pointer interaction, and resume when the tab returns.
const publicationVideos = document.querySelectorAll('.publication video');

const updatePreviewPlayback = () => {
    publicationVideos.forEach(video => {
        video.muted = true;
        if (document.hidden) {
            video.pause();
        } else {
            video.play().catch(() => {});
        }
    });
};

document.addEventListener('visibilitychange', updatePreviewPlayback);
updatePreviewPlayback();
