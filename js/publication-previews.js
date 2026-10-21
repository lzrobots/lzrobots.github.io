// Load and play a preview only while its frame is hovered or keyboard-focused.
document.querySelectorAll('.publication video').forEach(video => {
    const preview = video.closest('.publication-preview');
    let active = false;

    video.muted = true;

    const play = () => {
        active = true;
        video.play().then(() => {
            // The pointer may have left while the video was still loading.
            if (!active) video.pause();
        }).catch(() => {});
    };
    const pause = () => {
        active = false;
        video.pause();
    };

    preview.addEventListener('pointerenter', event => {
        if (event.pointerType !== 'touch') play();
    });
    preview.addEventListener('pointerleave', pause);
    preview.addEventListener('focusin', play);
    preview.addEventListener('focusout', pause);
    video.addEventListener('playing', () => {
        if (!active) video.pause();
    });
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) pause();
    });
});
