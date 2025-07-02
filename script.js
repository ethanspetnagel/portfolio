// --- INTRO OVERLAY SETUP ---
(function setupIntroOverlay() {
    if (!sessionStorage.getItem('introShown')) {
        // Create overlay
        const overlay = document.createElement('div');
        overlay.id = 'introOverlay';
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100vw';
        overlay.style.height = '100vh';
        overlay.style.background = '#e2e7ed';
        overlay.style.zIndex = '99999';
        overlay.style.display = 'flex';
        overlay.style.alignItems = 'center';
        overlay.style.justifyContent = 'center';
        overlay.style.transition = 'opacity 0.3s';
        overlay.style.opacity = '1';

        // Create text element
        const introText = document.createElement('div');
        introText.id = 'introText';
        introText.textContent = 'ETHANSPETNAGEL.ONLINE';
        // Match Contact button font, size, color
        introText.style.fontFamily = '"Helvetica Neue", Helvetica, Arial, sans-serif';
        introText.style.fontWeight = 'bold';
        introText.style.fontSize = window.getComputedStyle(document.documentElement).getPropertyValue('--contact-toggle-size') || 'clamp(10.8px, 2.43vw, 29.7px)';
        introText.style.textTransform = 'uppercase';
        introText.style.letterSpacing = '0.02em';
        introText.style.color = '#2d2f32';
        introText.style.textAlign = 'center';
        introText.style.lineHeight = '1';
        introText.style.userSelect = 'none';
        overlay.appendChild(introText);

        document.body.appendChild(overlay);

        // Use the same FontFlip logic as Contact
        class IntroFontFlip {
            constructor(el) {
                this.el = el;
                this.fonts = [
                    'times new roman, serif',
                    'UnifrakturCook, cursive',
                    'Impact',
                    'Marker Felt, fantasy'
                ];
                this.originalFont = window.getComputedStyle(el).fontFamily;
                this._timeout = null;
            }
            setText(newText, onFinish) {
                this.text = newText;
                this.onFinish = onFinish;
                this.stop();
                this._animateLetter(0);
            }
            _shuffle(array) {
                let arr = array.slice();
                for (let i = arr.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [arr[i], arr[j]] = [arr[j], arr[i]];
                }
                return arr;
            }
            _animateLetter(index) {
                if (index >= this.text.length) {
                    this._renderWord(-1, -1);
                    if (typeof this.onFinish === 'function') this.onFinish();
                    return;
                }
                const shuffledFonts = this._shuffle(this.fonts);
                let fontFrame = 0;
                const animateFont = () => {
                    if (fontFrame < shuffledFonts.length) {
                        this._renderWord(index, fontFrame, shuffledFonts);
                        fontFrame++;
                        this._timeout = setTimeout(animateFont, 80);
                    } else {
                        this._renderWord(index, -1, shuffledFonts);
                        this._timeout = setTimeout(() => this._animateLetter(index + 1), 1);
                    }
                };
                animateFont();
            }
            _renderWord(activeIndex, fontFrame, fontList = this.fonts) {
                this.el.innerHTML = '';
                for (let i = 0; i < this.text.length; i++) {
                    const span = document.createElement('span');
                    span.textContent = this.text[i];
                    span.style.display = 'inline-block';
                    if (i === activeIndex && fontFrame >= 0) {
                        span.style.fontFamily = fontList[fontFrame];
                    } else {
                        span.style.fontFamily = this.originalFont;
                    }
                    this.el.appendChild(span);
                }
            }
            stop() {
                if (this._timeout) {
                    clearTimeout(this._timeout);
                    this._timeout = null;
                }
            }
        }

        // Start animation
        const introFlip = new IntroFontFlip(introText);
        introFlip.setText('ETHANSPETNAGEL.ONLINE', () => {
            overlay.style.opacity = '0';
            setTimeout(() => {
                overlay.remove();
                sessionStorage.setItem('introShown', '1');
            }, 300);
        });
    }
})();

// --- END INTRO OVERLAY SETUP ---

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
const dateText = document.getElementById('dateText');
const contactToggle = document.getElementById('contactToggle');
const contactContent = document.getElementById('contactContent');
const bioLinks = document.querySelectorAll('.bio-text-center a[data-bio]');
const bioPreview = document.getElementById('bioPreview');
const bioPreviewImage = document.getElementById('bioPreviewImage');
const rollerSection = document.getElementById('rollerSection');
const rollerTrack = document.getElementById('rollerTrack');
const rollerItems = document.querySelectorAll('.roller-item');

// Variables
let currentMedia = null;
let activeProject = null;
let videoPool = {};
let currentActiveVideo = null;
let isTransitioning = false;
let videoBrightness = {};
let hideMediaTimeout = null;
let isHoveringProject = false;
let scrollProgress = 0;
let currentIndex = 0;
let isAnimating = false;

// Roller Configuration
const ITEMS_COUNT = 7;
const VISIBLE_ITEMS = 4;
const ITEM_ANGLE = 360 / ITEMS_COUNT;

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
    document.body.classList.add('project-hovering');
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
    document.body.classList.remove('video-dark', 'video-light', 'project-hovering');
    currentMedia = null;
}

// Update roller position
function updateRoller() {
    rollerItems.forEach((item, index) => {
        const adjustedIndex = index % ITEMS_COUNT;
        const angle = (adjustedIndex - currentIndex) * ITEM_ANGLE + scrollProgress * ITEM_ANGLE;
        const radian = (angle * Math.PI) / 180;
        
        const z = Math.cos(radian) * 300;
        const y = Math.sin(radian) * 300;
        
        item.style.transform = `translateY(${y}px) translateZ(${z}px)`;
        
        // Update opacity based on position
        const normalizedAngle = ((angle % 360) + 360) % 360;
        if (normalizedAngle < 90 || normalizedAngle > 270) {
            const opacity = Math.cos(radian) * 0.7 + 0.3;
            item.style.opacity = Math.max(0.3, opacity);
            item.style.pointerEvents = 'auto';
        } else {
            item.style.opacity = '0';
            item.style.pointerEvents = 'none';
        }
        
        // Mark active item
        item.classList.remove('active');
        if (Math.abs(angle % 360) < ITEM_ANGLE / 2 || Math.abs(angle % 360 - 360) < ITEM_ANGLE / 2) {
            item.classList.add('active');
            updateActiveProject(item);
        }
    });
}

// Update active project
function updateActiveProject(item) {
    const project = item.dataset.project;
    const info = item.dataset.info;
    
    if (activeProject !== project) {
        activeProject = project;
        dateText.textContent = info;
        
        // Show video for active project
        if (currentActiveVideo) {
            currentActiveVideo.style.opacity = '0';
            currentActiveVideo.style.visibility = 'hidden';
            currentActiveVideo.pause();
        }
        
        const video = videoPool[project];
        if (video) {
            const mediaInfo = projectMedia[project];
            video.style.left = mediaInfo.position.left;
            video.style.top = mediaInfo.position.top;
            video.style.visibility = 'visible';
            video.currentTime = 0;
            video.play().then(() => {
                video.style.opacity = '1';
                fullscreenBg.classList.add('active');
                currentActiveVideo = video;
                
                // Update text colors
                const isDark = videoBrightness[project];
                document.body.classList.toggle('video-dark', isDark);
                document.body.classList.toggle('video-light', !isDark);
                document.body.classList.add('project-hovering');
            }).catch(() => {});
        } else {
            hideAllMedia();
        }
    }
}

// Handle scroll
let lastScrollTop = 0;
let rollerSticky = false;

window.addEventListener('scroll', () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const rollerTop = rollerSection.offsetTop;
    
    if (scrollTop >= rollerTop - window.innerHeight / 2) {
        if (!rollerSticky) {
            rollerSticky = true;
        }
        
        // Calculate scroll within roller section
        const scrollDelta = scrollTop - lastScrollTop;
        
        // Update scroll progress
        scrollProgress += scrollDelta * 0.002;
        
        // Handle looping
        if (scrollProgress >= 1) {
            scrollProgress -= 1;
            currentIndex = (currentIndex + 1) % ITEMS_COUNT;
        } else if (scrollProgress < 0) {
            scrollProgress += 1;
            currentIndex = (currentIndex - 1 + ITEMS_COUNT) % ITEMS_COUNT;
        }
        
        updateRoller();
    }
    
    lastScrollTop = scrollTop;
});

// Click to rotate
rollerItems.forEach((item, index) => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        
        const clickedIndex = index % ITEMS_COUNT;
        const activeItem = document.querySelector('.roller-item.active');
        
        if (item === activeItem) {
            // Navigate if clicking active item
            window.location.href = item.href;
        } else {
            // Rotate to clicked item
            if (!isAnimating) {
                isAnimating = true;
                
                // Calculate shortest rotation direction
                let targetDiff = clickedIndex - currentIndex;
                if (targetDiff > ITEMS_COUNT / 2) targetDiff -= ITEMS_COUNT;
                if (targetDiff < -ITEMS_COUNT / 2) targetDiff += ITEMS_COUNT;
                
                // Animate to target
                const startProgress = scrollProgress;
                const targetProgress = -targetDiff / ITEMS_COUNT;
                const duration = 600;
                const startTime = Date.now();
                
                function animate() {
                    const elapsed = Date.now() - startTime;
                    const t = Math.min(elapsed / duration, 1);
                    const eased = 0.5 - Math.cos(t * Math.PI) / 2;
                    
                    scrollProgress = startProgress + (targetProgress - startProgress) * eased;
                    updateRoller();
                    
                    if (t < 1) {
                        requestAnimationFrame(animate);
                    } else {
                        currentIndex = clickedIndex;
                        scrollProgress = 0;
                        updateRoller();
                        isAnimating = false;
                    }
                }
                
                animate();
            }
        }
    });
});

// Font Flip Effect (with letter scramble)
class FontFlip {
    constructor(el) {
        this.el = el;
        this.fonts = [
            'times new roman, serif',
            'UnifrakturCook, cursive',
            'Impact',
            'Marker Felt, fantasy'
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
            const span = document.createElement('span');
            span.textContent = this.text[i];
            span.style.display = 'inline-block';
            if (i === activeIndex && fontFrame >= 0) {
                span.style.fontFamily = fontList[fontFrame];
            } else {
                span.style.fontFamily = this.originalFont;
            }
            this.el.appendChild(span);
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

// Text Parting Effect
class TextPartingEffect {
    constructor() {
        this.activeElements = new Map();
    }
    init() {
        this.wrapWordsInSpans();
        const bioTexts = document.querySelectorAll('.bio-text-center');
        bioTexts.forEach(element => {
            element.addEventListener('mouseenter', (e) => this.startParting(e.target));
            element.addEventListener('mousemove', (e) => this.updateParting(e));
            element.addEventListener('mouseleave', (e) => this.endParting(e.target));
        });
    }
    wrapWordsInSpans() {
        const bioTexts = document.querySelectorAll('.bio-text-center p, .bio-text-center a');
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
        const element = event.target.closest('.bio-text-center');
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
const contactFlip = new FontFlip(contactToggle);
let isContactOpen = false;

// Helper to set the button text instantly (no animation)
function setContactButtonText(label) {
    contactToggle.innerHTML = '';
    for (let i = 0; i < label.length; i++) {
        const span = document.createElement('span');
        span.textContent = label[i];
        span.style.display = 'inline-block';
        span.style.fontFamily = contactFlip.originalFont;
        contactToggle.appendChild(span);
    }
}

// On hover, animate, then toggle contact after animation
contactToggle.addEventListener('mouseenter', function() {
    if (contactFlip._isAnimating) return;
    contactFlip.setText(isContactOpen ? 'HIDE' : 'CONTACT', function animationDone() {
        // Toggle contact section after animation
        contactContent.classList.toggle('active');
        isContactOpen = !isContactOpen;
        setContactButtonText(isContactOpen ? 'HIDE' : 'CONTACT');
    });
});

// Reset the button text on mouseleave
contactToggle.addEventListener('mouseleave', function() {
    setContactButtonText(isContactOpen ? 'HIDE' : 'CONTACT');
});

// Date text hover
dateText.addEventListener('mouseenter', function() {
    if (hideMediaTimeout) {
        clearTimeout(hideMediaTimeout);
        hideMediaTimeout = null;
    }
    document.body.classList.add('june-hover');
    if (fullscreenBg.classList.contains('active')) {
        hideAllMedia();
    }
});

dateText.addEventListener('mouseleave', function() {
    document.body.classList.remove('june-hover');
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

// Resume FontFlip
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
    if (!contactToggle || !contactContent) {
        console.error('Required elements not found!');
        return;
    }
    
    // Initialize video pool
    initializeVideoPool();
    
    // Initialize text parting effect for bio text
    textParting.init();
    
    // Initialize roller
    updateRoller();
    
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