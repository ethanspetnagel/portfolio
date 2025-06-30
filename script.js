// Project media mapping with position data
const projectMedia = {
    'slug': {
        url: './slug.mp4',
        position: { left: '12%', top: '0%' }
    }, 
    'church': {
        url: './church video bg.mp4',
        position: { left: '34.5%', top: '39%' }
    },
    'talamel': {
        url: './talamel1.mp4',
        position: { left: '16%', top: '7%' }
    }, 
    'fox-and-lion': { 
        url: './foxlionbg.mp4',
        position: { left: '45%', top: '15%' }
    }, 
    'ecoscan': '',
    'cardioscape': { 
        url: './cardio.mp4',
        position: { left: '5%', top: '22%' }
    },
    'lu-rose-gold': {
        url: './lu rose gold video bg.mp4',
        position: { left: '50%', top: '30.5%' }
    },
    'green-lake-law': {
        url: './greenlake.mp4',
        position: { left: '0%', top: '20%' }
    }, 
    'june-2025': ''
};

// Bio link images
const bioImages = {
    'church-company': '',
    'talamel-health': '',
    'slug-soap': ' ',
    'crowe': '',
    'colorado': ''
};

// DOM Elements
const fullscreenBg = document.getElementById('fullscreenBg');
const projectLinks = document.querySelectorAll('.project-link');
const projectsContainer = document.querySelector('.projects-container');
const dateText = document.getElementById('dateText');
const aboutToggle = document.getElementById('aboutToggle');
const bioContent = document.getElementById('bioContent');
const bioLinks = document.querySelectorAll('.bio-text a[data-bio]');
const bioPreview = document.getElementById('bioPreview');
const bioPreviewImage = document.getElementById('bioPreviewImage');

// Variables
let currentMedia = null;
let activeProject = null;
let videoPool = {};
let currentActiveVideo = null;
let isTransitioning = false;
let videoBrightness = {};
let hideMediaTimeout = null;
let isHoveringProject = false;

// Touch device detection
const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

// Analyze video brightness
function analyzeVideoBrightness(video, project) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 160;
    canvas.height = 90;
    if (video.readyState >= 2) {
        try {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            let brightness = 0;
            let pixelCount = 0;
            for (let i = 0; i < data.length; i += 40) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                const pixelBrightness = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
                brightness += pixelBrightness;
                pixelCount++;
            }
            const avgBrightness = brightness / pixelCount;
            videoBrightness[project] = avgBrightness < 0.5;
        } catch (e) {
            videoBrightness[project] = true;
        }
    }
}

// Initialize video pool for instant playback
function initializeVideoPool() {
    Object.entries(projectMedia).forEach(([project, mediaInfo]) => {
        const url = typeof mediaInfo === 'string' ? mediaInfo : mediaInfo?.url;
        if (url && url.includes('.mp4')) {
            const video = document.createElement('video');
            video.src = url;
            video.muted = true;
            video.loop = true;
            video.playsInline = true;
            video.autoplay = false;
            video.preload = 'auto';
            video.className = 'bg-video';
            video.dataset.project = project;
            video.style.opacity = '0';
            video.style.visibility = 'hidden';
            video.style.zIndex = '1';
            fullscreenBg.appendChild(video);
            videoPool[project] = video;
            video.load();
            video.addEventListener('loadeddata', () => {
                video.play().then(() => {
                    video.pause();
                    video.currentTime = 0;
                    setTimeout(() => {
                        analyzeVideoBrightness(video, project);
                    }, 100);
                }).catch(() => {});
            });
            video.addEventListener('seeked', () => {
                analyzeVideoBrightness(video, project);
            });
        }
    });
}

// Update text colors based on video brightness
function updateTextColors(project) {
    const isDark = videoBrightness[project] !== undefined ? videoBrightness[project] : true;
    if (isDark) {
        document.body.classList.add('video-dark');
        document.body.classList.remove('video-light');
    } else {
        document.body.classList.add('video-light');
        document.body.classList.remove('video-dark');
    }
}

// Show video instantly with custom position
function showVideo(project) {
    if (isTransitioning) return false;
    const video = videoPool[project];
    if (!video) return false;
    const mediaInfo = projectMedia[project];
    if (!mediaInfo || !mediaInfo.position) return false;
    isTransitioning = true;
    const previousVideo = currentActiveVideo;
    if (previousVideo) previousVideo.style.zIndex = '1';
    video.style.zIndex = '2';
    video.style.left = mediaInfo.position.left;
    video.style.top = mediaInfo.position.top;
    video.style.visibility = 'visible';
    video.currentTime = 0;
    const playPromise = video.play();
    if (playPromise !== undefined) {
        playPromise.then(() => {
            requestAnimationFrame(() => {
                video.style.opacity = '1';
                video.classList.add('active');
                fullscreenBg.classList.add('active');
                setTimeout(() => {
                    if (previousVideo && previousVideo !== video) {
                        previousVideo.style.opacity = '0';
                        previousVideo.style.visibility = 'hidden';
                        previousVideo.pause();
                        previousVideo.classList.remove('active');
                        previousVideo.style.zIndex = '1';
                    }
                }, 100);
                isTransitioning = false;
                updateTextColors(project);
            });
        }).catch(() => {
            video.style.opacity = '1';
            video.classList.add('active');
            fullscreenBg.classList.add('active');
            if (previousVideo && previousVideo !== video) {
                previousVideo.style.opacity = '0';
                previousVideo.style.visibility = 'hidden';
                previousVideo.pause();
                previousVideo.classList.remove('active');
                previousVideo.style.zIndex = '1';
            }
            isTransitioning = false;
            updateTextColors(project);
        });
    }
    currentActiveVideo = video;
    currentMedia = projectMedia[project];
    return true;
}

// Hide all media
function hideAllMedia() {
    fullscreenBg.classList.remove('active');
    if (currentActiveVideo) {
        currentActiveVideo.style.opacity = '0';
        currentActiveVideo.style.visibility = 'hidden';
        currentActiveVideo.pause();
        currentActiveVideo.classList.remove('active');
        currentActiveVideo.style.zIndex = '1';
        currentActiveVideo = null;
    }
    document.body.classList.remove('video-dark', 'video-light');
    currentMedia = null;
}

// Font Flip Effect (no letter scramble)
class FontFlip {
    constructor(el) {
        this.el = el;
        this.fonts = [
            'Impact, fantasy',
            'Times New Roman, serif',
            'Courier New, monospace',
            'Arial Black, sans-serif',
            'Verdana, sans-serif',
            'Georgia, serif',
            'Comic Sans MS, cursive',
            'Trebuchet MS, sans-serif',
            'Lucida Console, monospace',
            'Tahoma, sans-serif'
        ];
        this.originalFont = window.getComputedStyle(el).fontFamily;
        this.originalFontSize = window.getComputedStyle(el).fontSize;
        this.originalFontWeight = window.getComputedStyle(el).fontWeight;
        this.originalLineHeight = window.getComputedStyle(el).lineHeight;
    }

    setText(newText) {
        this.text = newText;
        this.frame = 0;
        this.letterFontIndices = Array.from({length: newText.length}, () => 0);
        this.animating = true;
        this.animate();
    }

    animate() {
        if (!this.animating) return;
        this.el.innerHTML = '';
        let done = true;
        for (let i = 0; i < this.text.length; i++) {
            const span = document.createElement('span');
            span.textContent = this.text[i];
            span.style.display = 'inline-block';
            span.style.fontSize = this.originalFontSize;
            span.style.fontWeight = this.originalFontWeight;
            span.style.lineHeight = this.originalLineHeight;
            // Animate font for first 20 frames per letter, staggered
            if (this.frame < 20 + i * 2) {
                span.style.fontFamily = this.fonts[(this.letterFontIndices[i]) % this.fonts.length];
                this.letterFontIndices[i]++;
                done = false;
            } else {
                span.style.fontFamily = this.originalFont;
            }
            this.el.appendChild(span);
        }
        this.frame++;
        if (!done) {
            requestAnimationFrame(() => this.animate());
        }
    }
}

// Text Parting Effect (unchanged)
class TextPartingEffect {
    constructor() {
        this.activeElements = new Map();
    }
    init() {
        this.wrapWordsInSpans();
        const bioTexts = document.querySelectorAll('.bio-text');
        bioTexts.forEach(element => {
            element.addEventListener('mouseenter', (e) => this.startParting(e.target));
            element.addEventListener('mousemove', (e) => this.updateParting(e));
            element.addEventListener('mouseleave', (e) => this.endParting(e.target));
        });
    }
    wrapWordsInSpans() {
        const bioTexts = document.querySelectorAll('.bio-text p, .bio-text a');
        bioTexts.forEach(element => {
            if (element.querySelector('.word')) return;
            const textNodes = this.getTextNodes(element);
            textNodes.forEach(node => {
                const words = node.textContent.split(/(\s+)/);
                const fragment = document.createDocumentFragment();
                words.forEach(word => {
                    if (word.trim() !== '') {
                        const span = document.createElement('span');
                        span.className = 'word';
                        span.textContent = word;
                        fragment.appendChild(span);
                    } else {
                        fragment.appendChild(document.createTextNode(word));
                    }
                });
                node.parentNode.replaceChild(fragment, node);
            });
        });
    }
    getTextNodes(element) {
        const textNodes = [];
        const walker = document.createTreeWalker(
            element,
            NodeFilter.SHOW_TEXT,
            null,
            false
        );
        let node;
        while (node = walker.nextNode()) {
            if (node.textContent.trim() !== '') {
                textNodes.push(node);
            }
        }
        return textNodes;
    }
    startParting(element) {
        if (!this.activeElements.has(element)) {
            const words = element.querySelectorAll('.word');
            const wordData = new Map();
            words.forEach(word => {
                const rect = word.getBoundingClientRect();
                wordData.set(word, {
                    rect: rect,
                    originalTransform: word.style.transform || '',
                    isActive: true
                });
            });
            this.activeElements.set(element, {
                words: wordData,
                isActive: true
            });
        }
    }
    updateParting(event) {
        const element = event.target.closest('.bio-text');
        const data = this.activeElements.get(element);
        if (!data || !data.isActive) return;
        const cursorX = event.clientX;
        const cursorY = event.clientY;
        data.words.forEach((wordData, word) => {
            const rect = word.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const deltaX = cursorX - centerX;
            const deltaY = cursorY - centerY;
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            const maxInfluence = 150;
            if (distance < maxInfluence) {
                const strength = (1 - distance / maxInfluence) * 25;
                const angle = Math.atan2(deltaY, deltaX);
                const pushX = -Math.cos(angle) * strength;
                const pushY = -Math.sin(angle) * strength;
                word.style.transform = `translate(${pushX}px, ${pushY}px)`;
                word.style.transition = 'transform 0.1s ease-out';
            } else {
                word.style.transform = wordData.originalTransform;
                word.style.transition = 'transform 0.2s ease-out';
            }
        });
    }
    endParting(element) {
        const data = this.activeElements.get(element);
        if (data) {
            data.isActive = false;
            data.words.forEach((wordData, word) => {
                word.style.transition = 'transform 0.3s ease-out';
                word.style.transform = wordData.originalTransform;
            });
            setTimeout(() => {
                if (!data.isActive) {
                    this.activeElements.delete(element);
                }
            }, 300);
        }
    }
}

// Project hover handling
function handleProjectHover(link, isEntering) {
    if (isEntering) {
        if (hideMediaTimeout) {
            clearTimeout(hideMediaTimeout);
            hideMediaTimeout = null;
        }
        isHoveringProject = true;
        const project = link.getAttribute('data-project');
        const projectInfo = link.getAttribute('data-info');
        activeProject = project;
        projectsContainer.classList.add('hovering');
        document.body.classList.add('project-hovering');
        dateText.textContent = projectInfo;
        dateText.classList.add('project-active');
        const mediaInfo = projectMedia[project];
        const url = typeof mediaInfo === 'string' ? mediaInfo : mediaInfo?.url;
        if (url && url.includes('.mp4')) {
            showVideo(project);
        } else {
            Object.values(videoPool).forEach(v => {
                v.style.zIndex = '1';
            });
            hideAllMedia();
        }
    } else {
        isHoveringProject = false;
        hideMediaTimeout = setTimeout(() => {
            if (!isHoveringProject) {
                activeProject = null;
                projectsContainer.classList.remove('hovering');
                document.body.classList.remove('project-hovering');
                dateText.textContent = 'JUNE 2025';
                dateText.classList.remove('project-active');
                Object.values(videoPool).forEach(v => {
                    v.style.zIndex = '1';
                });
                hideAllMedia();
            }
        }, 50);
    }
}

// Initialize text effects
const textParting = new TextPartingEffect();
const aboutFlip = new FontFlip(aboutToggle);
let isAboutOpen = false;

// About toggle functionality (no direct style.display, just class)
aboutToggle.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    bioContent.classList.toggle('active');
    isAboutOpen = !isAboutOpen;
    if (isAboutOpen) {
        aboutFlip.setText('HIDE');
        setTimeout(() => {
            textParting.init();
        }, 300);
    } else {
        aboutFlip.setText('ABOUT');
    }
});

// About toggle hover effect
aboutToggle.addEventListener('mouseenter', function() {
    if (!isAboutOpen) {
        aboutFlip.setText('ABOUT');
    } else {
        aboutFlip.setText('HIDE');
    }
});

// Project link events
if (!isTouchDevice) {
    projectLinks.forEach(link => {
        link.addEventListener('mouseenter', function() {
            handleProjectHover(this, true);
        });
        link.addEventListener('mouseleave', function() {
            handleProjectHover(this, false);
        });
        link.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = this.href;
        });
    });
} else {
    let lastTouchedLink = null;
    projectLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const project = this.getAttribute('data-project');
            const projectInfo = this.getAttribute('data-info');
            if (lastTouchedLink === this) {
                window.location.href = this.href;
                return;
            }
            projectLinks.forEach(l => l.classList.remove('touch-active'));
            lastTouchedLink = this;
            this.classList.add('touch-active');
            projectsContainer.classList.add('touch-hovering');
            document.body.classList.add('project-hovering');
            dateText.textContent = projectInfo;
            dateText.classList.add('project-active');
            const mediaInfo = projectMedia[project];
            const url = typeof mediaInfo === 'string' ? mediaInfo : mediaInfo?.url;
            if (url && url.includes('.mp4')) {
                showVideo(project);
            } else {
                Object.values(videoPool).forEach(v => {
                    v.style.zIndex = '1';
                });
                hideAllMedia();
            }
        });
    });
    document.addEventListener('touchstart', function(e) {
        if (!e.target.closest('.project-link')) {
            setTimeout(() => {
                projectLinks.forEach(l => l.classList.remove('touch-active'));
                projectsContainer.classList.remove('touch-hovering');
                document.body.classList.remove('project-hovering');
                dateText.textContent = 'JUNE 2025';
                dateText.classList.remove('project-active');
                Object.values(videoPool).forEach(v => {
                    v.style.zIndex = '1';
                });
                hideAllMedia();
                lastTouchedLink = null;
            }, 50);
        }
    });
}

// Date text hover
dateText.addEventListener('mouseenter', function() {
    if (!dateText.classList.contains('project-active')) {
        if (hideMediaTimeout) {
            clearTimeout(hideMediaTimeout);
            hideMediaTimeout = null;
        }
        document.body.classList.add('june-hover');
        if (fullscreenBg.classList.contains('active')) {
            hideAllMedia();
        }
    }
});
dateText.addEventListener('mouseleave', function() {
    if (!dateText.classList.contains('project-active')) {
        document.body.classList.remove('june-hover');
    }
});

// Bio link hover
bioLinks.forEach(link => {
    link.addEventListener('mouseenter', function() {
        const bioType = this.getAttribute('data-bio');
        const imageUrl = bioImages[bioType];
        if (imageUrl) {
            bioPreviewImage.src = imageUrl;
            bioPreviewImage.alt = this.textContent;
            bioPreview.classList.add('active');
        }
    });
    link.addEventListener('mouseleave', function() {
        bioPreview.classList.remove('active');
    });
});

// Initialize everything on DOM load
document.addEventListener('DOMContentLoaded', function() {
    // Make sure elements exist
    if (!aboutToggle || !bioContent) {
        console.error('Required elements not found!');
        return;
    }
    // Initialize video pool
    initializeVideoPool();
    // Attempt to start videos after user interaction
    document.addEventListener('mousemove', () => {
        Object.values(videoPool).forEach(video => {
            if (video.paused) {
                video.play().then(() => {
                    video.pause();
                    video.currentTime = 0;
                }).catch(() => {});
            }
        });
    }, { once: true });
    // Periodically re-analyze brightness for playing videos
    setInterval(() => {
        if (currentActiveVideo && activeProject) {
            analyzeVideoBrightness(currentActiveVideo, activeProject);
            updateTextColors(activeProject);
        }
    }, 1000);
});

// Clean up on page unload
window.addEventListener('beforeunload', function() {
    if (hideMediaTimeout) {
        clearTimeout(hideMediaTimeout);
    }
});