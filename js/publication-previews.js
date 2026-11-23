// Load and play previews only while visible to avoid decoding every video at once.
const publicationVideos = document.querySelectorAll('.publication .publication-preview:not([data-hover-preview]) video');
const visibleVideos = new Set();
const pendingPreviews = new Map();
const minimumVisibleRatio = 0.25;
const previewDelayMs = 200;

const playPreview = (video, source) => {
    if (source) {
        source.src = source.dataset.src;
        source.removeAttribute('data-src');
        video.load();
    }
    video.muted = true;
    video.play().then(() => {
        if (document.hidden || !visibleVideos.has(video)) video.pause();
    }).catch(() => {});
};

const updatePreviewPlayback = () => {
    publicationVideos.forEach(video => {
        const shouldPlay = !document.hidden && visibleVideos.has(video);
        if (!shouldPlay) {
            clearTimeout(pendingPreviews.get(video));
            pendingPreviews.delete(video);
            video.pause();
            return;
        }
        const source = video.querySelector('source[data-src]');
        if (!source) {
            if (video.paused) playPreview(video);
            return;
        }
        if (pendingPreviews.has(video)) return;

        // Give fast scrolling a chance to pass a preview before requesting its MP4.
        const timer = setTimeout(() => {
            pendingPreviews.delete(video);
            if (!document.hidden && visibleVideos.has(video)) playPreview(video, source);
        }, previewDelayMs);
        pendingPreviews.set(video, timer);
    });
};
const posterVideos = document.querySelectorAll('.publication-preview video[data-poster]');
const loadPoster = video => {
    video.poster = video.dataset.poster;
    video.removeAttribute('data-poster');
};

if ('IntersectionObserver' in window) {
    const posterObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(({ target, isIntersecting }) => {
            if (!isIntersecting) return;
            loadPoster(target);
            observer.unobserve(target);
        });
    }, { rootMargin: '200px 0px' });
    posterVideos.forEach(video => posterObserver.observe(video));

    const previewObserver = new IntersectionObserver(entries => {
        entries.forEach(({ target, intersectionRatio }) => {
            if (intersectionRatio >= minimumVisibleRatio) visibleVideos.add(target);
            else visibleVideos.delete(target);
        });
        updatePreviewPlayback();
    }, { threshold: minimumVisibleRatio });
    publicationVideos.forEach(video => previewObserver.observe(video));
    document.addEventListener('visibilitychange', updatePreviewPlayback);
} else {
    posterVideos.forEach(loadPoster);
}

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
