// --- INTRO ANIMATION SETUP ---
document.addEventListener('DOMContentLoaded', function() {
    const introOverlay = document.getElementById('introOverlay');
    const introText = document.getElementById('introText');

    if (sessionStorage.getItem('introShown')) {
        if (introOverlay) {
            introOverlay.style.display = 'none';
        }
        return;
    }

    if (introOverlay && introText) {
        const introFlip = new FontFlip(introText);
        introFlip.setText('ETHAN SPETNAGEL', () => {
            startSubtitleAnimation(introOverlay, introText);
        });
    }

    function startSubtitleAnimation(overlay, textElement) {
        const paragraphs = [
"Web designer + UX designer",
            "<div style='margin-bottom: 1em; line-height: 1;'><div>Design Manager</div><div style='font-size: clamp(10.8px, 2.43vw, 29.7px); color: #34312e;'>Church California</div></div><div style='line-height: 1;'><div>UX Designer</div><div style='font-size: clamp(10.8px, 2.43vw, 29.7px); color: #34312e;'>Talamel Health</div></div>",
            
        ];
        let paragraphIndex = 0;

        function showNextParagraph() {
            if (paragraphIndex < paragraphs.length) {
                // Use innerHTML to render the styled text
                textElement.innerHTML = paragraphs[paragraphIndex];
                textElement.style.color = '#d92020'; // Set subtitle color to match project links
                textElement.style.textShadow = 'none'; // Remove embossing for subtitles
                
                // Set custom delay: 3s for the second subtitle, 1.7s for others
                const delay = (paragraphIndex === 1) ? 3000 : 1700;

                paragraphIndex++;
                setTimeout(showNextParagraph, delay); 
            } else {
                overlay.classList.add('hidden');
                sessionStorage.setItem('introShown', '1');
                setTimeout(() => {
                    overlay.style.display = 'none';
                }, 500); // Match transition duration
            }
        }
        // Small delay before starting subtitles
        setTimeout(showNextParagraph, 250);
    }

    // --- PROJECT HOVER CLASS ---
    const projectsContainer = document.querySelector('.projects-container');
    if (projectsContainer) {
        projectsContainer.addEventListener('mouseenter', () => {
            document.body.classList.add('project-links-hover');
        });
        projectsContainer.addEventListener('mouseleave', () => {
            document.body.classList.remove('project-links-hover');
        });
    }

    // --- MAIN INITIALIZATION ---
    if (!aboutToggle || !bioContent) {
        console.error('Required elements not found!');
        return;
    }
    initializeVideoPool();
    preloadPages(); // Preload linked pages
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

// Project media mapping with position data
const projectMedia = {
    'slug': {
        url: './slug.mp4',
        position: { left: '27%', top: '15%' },
        size: 'm' // Example size
    }, 
    'church': {
        url: './church video bg.mp4',
        position: { left: '77%', top: '23%' },
        size: 'm' // Example size
    },
    'talamel': {
        url: './talamel1.mp4',
        position: { left: '22%', top: '31%' },
        size: 'm' // Example size
    }, 
    'fox-and-lion': { 
        url: './foxlionbg.mp4',
        position: { left: '50%', top: '30%' },
        size: 'xl' // Example size
    }, 
    'ecoscan': '',
    'cardioscape': { 
        url: './cardio.mp4',
        position: { left: '84.5%', top: '45.5%' },
        size: 'm' // Example size
    },
    'lu-rose-gold': {
        url: './lu rose gold video bg.mp4',
        position: { left: '50%', top: '45%' },
        size: 'm' // Example size
    },
    'green-lake-law': {
        url: './bag.png',
        position: { left: '85%', top: '53.5%' },
        size: 'l' // Example size
    }, 
    'june-2025': ''
};

// Bio link images
const bioImages = {
    'me': './me.jpeg',
    'church-company': './church/brand 1.mp4',
    'talamel-health': '',
    'slug-soap': './sh.png',
    'crowe': './bird.jpg',
    'colorado': './colorado.gif'
};

// DOM Elements
const fullscreenBg = document.getElementById('fullscreenBg');
const projectLinks = document.querySelectorAll('.project-link');
const projectsContainer = document.querySelector('.projects-container');
const dateText = document.getElementById('dateText');
const aboutToggle = document.getElementById('aboutToggle');
const bioSection = document.querySelector('.bio-section'); // Get the container
const bioContent = document.getElementById('bioContent');
const bioLinks = document.querySelectorAll('.bio-text a[data-bio]');
const bioPreview = document.getElementById('bioPreview');
const bioPreviewImage = document.getElementById('bioPreviewImage');
const bioPreviewVideo = document.getElementById('bioPreviewVideo');

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

// Preload linked HTML pages to cache them
function preloadPages() {
    const links = document.querySelectorAll('.project-link');
    links.forEach(link => {
        const url = link.href;
        if (url) {
            // Fetching the page will cause the browser to cache it
            fetch(url).catch(err => console.error(`Failed to preload page: ${url}`, err));
        }
    });
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

    // Reset any existing size classes
    video.className = 'bg-video'; 
    // Add size class if it exists
    if (mediaInfo.size) {
        video.classList.add(`size-${mediaInfo.size}`);
    }

    // Use the position data from the projectMedia object
    video.style.left = mediaInfo.position.left;
    video.style.top = mediaInfo.position.top;

    isTransitioning = true;
    const previousVideo = currentActiveVideo;
    if (previousVideo) previousVideo.style.zIndex = '1';
    video.style.zIndex = '2';
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

// Font Flip Effect (with letter scramble)
class FontFlip {
    constructor(el) {
        this.el = el;
        this.fonts = [
            'EB Garamond, serif', // Use the loaded web font
            'UnifrakturCook, cursive',
            'Impact, sans-serif',
            'Courier New, monospace',
        ];
        this.originalFont = window.getComputedStyle(el).fontFamily;
        this._timeout = null;
        this._isAnimating = false;
    }

    setText(newText, onFinish) {
        this.text = newText;
        this.stop();
        this._animateLetter(0, onFinish);
    }

    // Fisher-Yates shuffle
    _shuffle(array) {
        let arr = array.slice();
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    _animateLetter(index, onFinish) {
        if (index >= this.text.length) {
            this._renderWord(-1, -1);
            this._isAnimating = false;
            if (typeof onFinish === 'function') onFinish();
            return;
        }
        // Shuffle font order for this letter
        const shuffledFonts = this._shuffle(this.fonts);
        let fontFrame = 0;
        const animateFont = () => {
            if (fontFrame < shuffledFonts.length) {
                this._renderWord(index, fontFrame, shuffledFonts);
                fontFrame++;
                this._timeout = setTimeout(animateFont, 90);
            } else {
                this._renderWord(index, -1, shuffledFonts);
                this._timeout = setTimeout(() => this._animateLetter(index + 1, onFinish), 5);
            }
        };
        this._isAnimating = true;
        animateFont();
    }

    _renderWord(activeIndex, fontFrame, fontList = this.fonts) {
        this.el.innerHTML = '';
        for (let i = 0; i < this.text.length; i++) {
            const char = this.text[i];
            const wrapper = document.createElement('span');
            const animator = document.createElement('span');

            // Style the wrapper to hold space using an invisible character
            wrapper.style.display = 'inline-block';
            wrapper.style.position = 'relative';
            wrapper.style.fontFamily = this.originalFont;
            wrapper.textContent = char;
            wrapper.style.visibility = 'hidden'; // Always hide the placeholder text

            // Style the animator to be positioned within the wrapper
            animator.textContent = char;
            animator.style.visibility = 'visible'; // Ensure the animator is always visible
            animator.style.position = 'absolute';
            animator.style.left = '0';
            animator.style.top = '0';
            animator.style.width = '100%';
            animator.style.height = '100%';
            animator.style.textAlign = 'center';
            animator.style.transformOrigin = 'center center';
            animator.style.transition = 'transform 0.1s ease, font-family 0.1s ease';

            if (i === activeIndex && fontFrame >= 0) {
                // Apply scaling and font change to the animating letter
                animator.style.fontFamily = fontList[fontFrame];
                animator.style.transform = 'scale(1.2)';
            } else {
                // Use original font and size for all other letters
                animator.style.fontFamily = this.originalFont;
                animator.style.transform = 'scale(1)';
            }
            
            wrapper.appendChild(animator);
            this.el.appendChild(wrapper);
        }
    }

    stop() {
        if (this._timeout) {
            clearTimeout(this._timeout);
            this._timeout = null;
        }
        this._isAnimating = false;
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

// Initialize text effects
const textParting = new TextPartingEffect();
textParting.init();

// --- ABOUT/HIDE BUTTON CLICK LOGIC ---
if (aboutToggle && bioContent) {
    const aboutFlip = new FontFlip(aboutToggle);

    // Helper to set button text without animation
    function setAboutButtonText(label) {
        aboutToggle.innerHTML = ''; // Clear existing content
        for (let i = 0; i < label.length; i++) {
            const span = document.createElement('span');
            span.textContent = label[i];
            span.style.display = 'inline-block';
            span.style.fontFamily = aboutFlip.originalFont;
            aboutToggle.appendChild(span);
        }
    }

    // Set the initial state of the button
    setAboutButtonText('ABOUT');

    aboutToggle.addEventListener('click', (event) => {
        event.preventDefault(); // Prevent default link behavior

        // Don't do anything if an animation is already running
        if (aboutFlip._isAnimating) {
            return;
        }

        const isActive = bioContent.classList.contains('active');

        // Toggle the active class on the button for styling
        aboutToggle.classList.toggle('active');

        if (isActive) {
            // If it's open, hide the content and animate the button to "ABOUT"
            bioContent.classList.remove('active');
            aboutFlip.setText('HIDE', () => {
                setAboutButtonText('ABOUT');
            });
        } else {
            // If it's closed, show the content and animate the button to "HIDE"
            bioContent.classList.add('active');
            aboutFlip.setText('ABOUT', () => {
                setAboutButtonText('HIDE');
            });
        }
    });
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
                dateText.textContent = 'JULY 2025';
                dateText.classList.remove('project-active');
                Object.values(videoPool).forEach(v => {
                    v.style.zIndex = '1';
                });
                hideAllMedia();
            }
        }, 50);
    }
}

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
                dateText.textContent = 'JULY 2025';
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
        const mediaUrl = bioImages[bioType];

        if (mediaUrl && mediaUrl.trim() !== '') {
            // Check if the media is a video or image
            if (mediaUrl.endsWith('.mp4')) {
                bioPreviewImage.style.display = 'none';
                bioPreviewVideo.style.display = 'block';
                if (bioPreviewVideo.src !== mediaUrl) {
                    bioPreviewVideo.src = mediaUrl;
                }
                bioPreviewVideo.play();
            } else {
                bioPreviewVideo.style.display = 'none';
                bioPreviewImage.style.display = 'block';
                bioPreviewImage.src = mediaUrl;
                bioPreviewImage.alt = this.textContent;
            }
            bioPreview.classList.add('active');
        }
    });
    link.addEventListener('mouseleave', function() {
        bioPreview.classList.remove('active');
        bioPreviewVideo.pause();
    });
});

// Resume FontFlip - Simplified Hover-to-Download Version
const resumeDownload = document.getElementById('resumeDownload');
if (resumeDownload) {
    const resumeFlip = new FontFlip(resumeDownload);
    let isDownloading = false;

    // Helper to set button text without animation
    function setResumeButtonText(text) {
        resumeDownload.innerHTML = '';
        for (let i = 0; i < text.length; i++) {
            const span = document.createElement('span');
            span.textContent = text[i];
            span.style.display = 'inline-block';
            span.style.fontFamily = resumeFlip.originalFont;
            resumeDownload.appendChild(span);
        }
    }

    // Set initial text
    setResumeButtonText('RESUME');

    resumeDownload.addEventListener('mouseenter', function() {
        // If a download is already in progress, do nothing.
        if (isDownloading) {
            return;
        }

        isDownloading = true;

        // Create a temporary link to trigger the download immediately
        const link = document.createElement('a');
        link.href = './EthanSpetnagel2025.pdf';
        link.download = 'EthanSpetnagel2025.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Animate the text to "DOWNLOAD" and then back to "RESUME"
        resumeFlip.setText('DOWNLOAD', function onAnimationComplete() {
            // Reset the button back to "RESUME" after a short delay
            setTimeout(() => {
                resumeFlip.setText('RESUME', () => {
                    setResumeButtonText('RESUME');
                    isDownloading = false; // Allow another download
                });
            }, 1500); // Wait 1.5 seconds
        });
    });
}
