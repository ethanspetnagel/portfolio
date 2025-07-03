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
            "UX DESIGNER + WEB DESIGNER", "Design Manager — Church California\n \nUX Designer — Talamel Health",
            "based in Queens, NY",
        ];
        let paragraphIndex = 0;

        function showNextParagraph() {
            if (paragraphIndex < paragraphs.length) {
                textElement.textContent = paragraphs[paragraphIndex];
                textElement.style.color = '#353c50'; // Set subtitle color to match project links
                
                // Set custom delay: 2s for the second subtitle, 1.7s for others
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
});

// --- END INTRO OVERLAY SETUP ---

// Project media mapping with position data
const projectMedia = {
    'slug': {
        url: './slug.mp4',
        position: { left: '27%', top: '15%' }
    }, 
    'church': {
        url: './church video bg.mp4',
        position: { left: '77%', top: '23%' }
    },
    'talamel': {
        url: './talamel1.mp4',
        position: { left: '23%', top: '31%' }
    }, 
    'fox-and-lion': { 
        url: './foxlionbg.mp4',
        position: { left: '50%', top: '30%' }
    }, 
    'ecoscan': '',
    'cardioscape': { 
        url: './cardio.mp4',
        position: { left: '85%', top: '45%' }
    },
    'lu-rose-gold': {
        url: './lu rose gold video bg.mp4',
        position: { left: '50%', top: '45%' }
    },
    'green-lake-law': {
        url: './greenlake.mp4',
        position: { left: '85%', top: '54%' }
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
            'EB Garamond', // Use the loaded web font
            'UnifrakturCook, cursive',
            'Impact',
            'Marker Felt, fantasy',
            'Carlito', // Use the loaded Calibri alternative
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

// --- ABOUT/HIDE BUTTON HOVER LOGIC ---
const aboutFlip = new FontFlip(aboutToggle);
let isAboutOpen = false;

// Helper to set button text without animation and update animator's state
function setAboutButtonText(label) {
    aboutFlip.text = label; // Keep the animator's internal text in sync
    aboutToggle.innerHTML = '';
    for (let i = 0; i < label.length; i++) {
        const span = document.createElement('span');
        span.textContent = label[i];
        span.style.display = 'inline-block';
        span.style.fontFamily = aboutFlip.originalFont;
        aboutToggle.appendChild(span);
    }
}

// Set initial text
setAboutButtonText('ABOUT');

// On hover, animate "ABOUT" then show the bio
bioSection.addEventListener('mouseenter', () => {
    if (isAboutOpen || aboutFlip._isAnimating) return;

    aboutFlip.setText('ABOUT', () => {
        bioContent.classList.add('active');
        setAboutButtonText('HIDE');
        isAboutOpen = true;
    });
});

// On mouse leave, hide the bio then animate "HIDE"
bioSection.addEventListener('mouseleave', () => {
    if (!isAboutOpen || aboutFlip._isAnimating) return;

    bioContent.classList.remove('active');
    isAboutOpen = false;

    aboutFlip.setText('HIDE', () => {
        setAboutButtonText('ABOUT');
    });
});

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

// Resume FontFlip - ROBUST VERSION WITH DEBUGGING
const resumeDownload = document.getElementById('resumeDownload');
if (resumeDownload) {
    console.log('Resume button found successfully');
    const resumeFlip = new FontFlip(resumeDownload);
    let downloadInProgress = false;

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
        console.log('Resume text set to:', text);
    }

    // Reset function to ensure clean state
    function resetResumeButton() {
        downloadInProgress = false;
        resumeFlip.stop();
        setResumeButtonText('RESUME');
        console.log('Resume button reset');
    }

    // On hover, animate and download - completes regardless of mouse position
    resumeDownload.addEventListener('mouseenter', function() {
        console.log('Resume mouseenter triggered. downloadInProgress:', downloadInProgress, 'isAnimating:', resumeFlip._isAnimating);
        
        if (downloadInProgress || resumeFlip._isAnimating) {
            console.log('Download blocked - already in progress or animating');
            return;
        }
        
        downloadInProgress = true;
        console.log('Starting resume animation and download');
        
        resumeFlip.setText('DOWNLOAD', function animationDone() {
            console.log('Animation completed, triggering download');
            
            // Trigger download after animation completes
            try {
                const link = document.createElement('a');
                link.href = './EthanSpetnagel2025.pdf';
                link.download = 'EthanSpetnagel2025.pdf';
                link.style.display = 'none';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                console.log('Download triggered successfully');
                
                // Reset after download
                setTimeout(() => {
                    resetResumeButton();
                }, 500);
                
            } catch (error) {
                console.error('Error during download:', error);
                resetResumeButton();
            }
        });
    });

    // No interruption on mouseleave - let the process complete
    resumeDownload.addEventListener('mouseleave', function() {
        console.log('Resume mouseleave - no action taken');
        // Do nothing - let animation and download complete
    });

    // Emergency reset on double-click (for debugging)
    resumeDownload.addEventListener('dblclick', function() {
        console.log('Double-click detected - force reset');
        resetResumeButton();
    });

    // Set initial text on page load
    setResumeButtonText('RESUME');
    
    // Force reset after 5 seconds if stuck (failsafe)
    setInterval(() => {
        if (downloadInProgress) {
            console.log('Checking download progress... still in progress after interval');
            // Reset if stuck for too long
            setTimeout(() => {
                if (downloadInProgress) {
                    console.log('Download seems stuck - force reset');
                    resetResumeButton();
                }
            }, 10000); // Reset after 10 seconds if still stuck
        }
    }, 5000);
    
} else {
    console.error('Resume download element not found! Check your HTML.');
    // Try to find it by class name as backup
    const backupElement = document.querySelector('.resume-download');
    if (backupElement) {
        console.log('Found resume element by class name instead');
    } else {
        console.error('Resume element not found by ID or class');
    }
}

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

// Add this ADDITIONAL debugging code to the end of your JavaScript file
// (This goes after your existing resume button code)

// Additional debugging for resume button positioning and visibility
document.addEventListener('DOMContentLoaded', function() {
    // Give the page a moment to fully render
    setTimeout(() => {
        const resumeElement = document.getElementById('resumeDownload');
        if (resumeElement) {
            // Log element properties
            const rect = resumeElement.getBoundingClientRect();
            const styles = window.getComputedStyle(resumeElement);
            
            console.log('=== RESUME BUTTON DEBUG ===');
            console.log('Element found:', resumeElement);
            console.log('Position:', {
                top: rect.top,
                left: rect.left,
                width: rect.width,
                height: rect.height,
                bottom: rect.bottom,
                right: rect.right
            });
            console.log('CSS Properties:', {
                display: styles.display,
                visibility: styles.visibility,
                opacity: styles.opacity,
                pointerEvents: styles.pointerEvents,
                zIndex: styles.zIndex,
                position: styles.position,
                fontSize: styles.fontSize
            });
            
            // Test if element is actually visible in viewport 
            const isVisible = rect.width > 0 && rect.height > 0 && 
                             rect.top >= 0 && rect.left >= 0 && 
                             rect.bottom <= window.innerHeight && 
                             rect.right <= window.innerWidth;
            console.log('Is in viewport:', isVisible);
            console.log('Window size:', {width: window.innerWidth, height: window.innerHeight});
            
            // Add a test click listener to see if ANY events work
            resumeElement.addEventListener('click', function() {
                console.log('CLICK EVENT WORKS!');
                alert('Click detected - so the element IS interactable');
            });
            
            // Test mouseover (sometimes works when mouseenter doesn't)
            resumeElement.addEventListener('mouseover', function() {
                console.log('MOUSEOVER EVENT WORKS!');
            });
            
            // Log any elements that might be covering it
            const elementsAtPosition = document.elementsFromPoint(rect.right - 10, rect.bottom - 10);
            console.log('Elements at resume position:', elementsAtPosition);
            
            // Test if the element is actually at the expected position
            const testX = rect.left + rect.width / 2;
            const testY = rect.top + rect.height / 2;
            const elementAtCenter = document.elementFromPoint(testX, testY);
            console.log('Element at center of resume button:', elementAtCenter);
            console.log('Is it the resume button?', elementAtCenter === resumeElement);
            
        } else {
            console.error('Resume element still not found in additional debug');
        }
    }, 1000); // Wait 1 second for page to fully load
});
