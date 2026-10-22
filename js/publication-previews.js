// Autoplay previews without pointer interaction, and resume when the tab returns.
const publicationVideos = document.querySelectorAll('.publication .publication-preview:not([data-hover-preview]) video');

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

// Hover previews show their static cover again as soon as interaction ends.
document.querySelectorAll('.publication-preview[data-hover-preview]').forEach(preview => {
    const video = preview.querySelector('video');
    let pointerInside = false;
    let keyboardFocused = false;
    const shouldPlay = () => !document.hidden && (pointerInside || keyboardFocused);

    const updateHoverPlayback = () => {
        if (shouldPlay()) {
            video.muted = true;
            video.play().then(() => {
                if (!shouldPlay()) video.pause();
            }).catch(() => {});
        } else {
            video.pause();
            preview.classList.remove('is-preview-playing');
            if (video.readyState > 0) video.currentTime = 0;
        }
    };

    preview.addEventListener('pointerenter', () => {
        pointerInside = true;
        updateHoverPlayback();
    });
    preview.addEventListener('pointerleave', () => {
        pointerInside = false;
        updateHoverPlayback();
    });
    preview.addEventListener('focusin', () => {
        keyboardFocused = true;
        updateHoverPlayback();
    });
    preview.addEventListener('focusout', event => {
        keyboardFocused = preview.contains(event.relatedTarget);
        updateHoverPlayback();
    });
    video.addEventListener('playing', () => {
        if (shouldPlay()) preview.classList.add('is-preview-playing');
        else video.pause();
    });
    video.addEventListener('error', () => {
        preview.classList.remove('is-preview-playing');
    });
    document.addEventListener('visibilitychange', updateHoverPlayback);
});
