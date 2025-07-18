// --- INTRO ANIMATION SETUP ---
document.addEventListener('DOMContentLoaded', function() {
    // Always initialize video pool
    initializeVideoPool();

    const introOverlay = document.getElementById('introOverlay');
    const introText = document.getElementById('introText');
    const firstSection = document.querySelector('.first-section');
    const secondSection = document.querySelector('.second-section');

    if (sessionStorage.getItem('introShown')) {
        if (introOverlay) {
            introOverlay.classList.add('hidden');
            introOverlay.style.display = 'none';
        }
        if (firstSection) {
            firstSection.style.display = 'none';
        }
        if (secondSection) {
            secondSection.style.display = 'block';
        }
        return;
    }

    if (introOverlay && introText) {
        const introFlip = new FontFlip(introText);
        introFlip.setText('ETHAN SPETNAGEL', () => {
            // After main text animation, start subtitles
            setTimeout(() => startSubtitleAnimation(introOverlay, introText), 500);
        });
    }

    function startSubtitleAnimation(overlay, textElement) {
        const paragraphs = [
"Web designer + UX designer"
            
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
                    // New animation sequence starts here
                    const profileImage = document.querySelector('.profile-image');
                    if (profileImage) {
                        profileImage.style.opacity = '1';
                    }

                    setTimeout(() => {
                        const mainTitle = document.querySelector('.main-title');
                        const aboutText = document.querySelector('.about-text');
                        const contactLinks = document.querySelector('.first-section .contact-links');
                        const downArrow = document.querySelector('.down-arrow');

                        if (mainTitle) mainTitle.style.opacity = '1';
                        if (aboutText) aboutText.style.opacity = '1';
                        if (contactLinks) contactLinks.style.opacity = '1';
                        if (downArrow) downArrow.style.opacity = '1';
                    }, 700); // Delay for profile image animation
                }, 500); // Match transition duration
            }
        }
        // Small delay before starting subtitles
        setTimeout(showNextParagraph, 250);
    }

    // --- PROFILE IMAGE HOVER EFFECT ---
    const profileImage = document.querySelector('.profile-image');
    if (profileImage) {
        profileImage.addEventListener('mouseenter', () => {
            document.body.classList.add('profile-hover');
            profileImage.style.backgroundImage = "url('pink.png')";
        });
        profileImage.addEventListener('mouseleave', () => {
            document.body.classList.remove('profile-hover');
            profileImage.style.backgroundImage = "url('photo.png')";
        });
    }

    // --- JULY 2025 TEXT HOVER EFFECT ---
    const dateText = document.querySelector('.date-text');
    if (dateText) {
        dateText.addEventListener('mouseenter', () => {
            document.body.classList.add('profile-hover');
        });
        dateText.addEventListener('mouseleave', () => {
            document.body.classList.remove('profile-hover');
        });
    }

    // --- SMOOTH SCROLL FOR DOWN ARROW ---
    const downArrow = document.querySelector('.down-arrow');
    if (downArrow) {
        downArrow.addEventListener('click', () => {
            const oldContentSection = document.getElementById('old-content');
            if (oldContentSection) {
                oldContentSection.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
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

// --- DOM ELEMENTS (declare ONCE at the top) ---
const upArrow = document.querySelector('.up-arrow');
const downArrow = document.querySelector('.down-arrow');
const firstSection = document.querySelector('.first-section');
const secondSection = document.querySelector('.second-section');
const projectsContainer = document.querySelector('.projects-container');
const dateText = document.getElementById('dateText');
const aboutToggle = document.getElementById('aboutToggle');
const bioSection = document.querySelector('.bio-section');
const bioContent = document.getElementById('bioContent');
const bioLinks = document.querySelectorAll('.bio-text a[data-bio], .about-text a[data-bio]');
const bioPreview = document.getElementById('bioPreview');
const bioPreviewImage = document.getElementById('bioPreviewImage');
const bioPreviewVideo = document.getElementById('bioPreviewVideo');
const fullscreenBg = document.getElementById('fullscreenBg');
const projectLinks = document.querySelectorAll('.project-link');

// --- OTHER VARIABLES ---
let currentMedia = null;
let activeProject = null;
let videoPool = {};
let currentActiveVideo = null;
let isTransitioning = false;
let videoBrightness = {};
let hideMediaTimeout = null;
let isHoveringProject = false;
let upArrowTimeout = null;
let arrowTimeout = null;

// --- ARROW LOGIC ---
// Show/hide up arrow when second section is in view and not scrolling
function showUpArrowIfOnSecondSection() {
    if (!upArrow || !secondSection) return;
    const rect = secondSection.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
        upArrow.style.opacity = '1';
        upArrow.style.pointerEvents = 'auto';
    } else {
        upArrow.style.opacity = '0';
        upArrow.style.pointerEvents = 'none';
    }
}

// Show/hide down arrow when first section is in view and not scrolling
function showDownArrowIfOnFirstSection() {
    if (!downArrow || !firstSection) return;
    const rect = firstSection.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
        downArrow.style.opacity = '1';
        downArrow.style.pointerEvents = 'auto';
    } else {
        downArrow.style.opacity = '0';
        downArrow.style.pointerEvents = 'none';
    }
}

// Hide both arrows
function hideUpArrow() {
    if (!upArrow) return;
    upArrow.style.opacity = '0';
    upArrow.style.pointerEvents = 'none';
}
function hideDownArrow() {
    if (!downArrow) return;
    downArrow.style.opacity = '0';
    downArrow.style.pointerEvents = 'none';
}

// Handle scroll: hide arrows while scrolling, show after scroll stops
function handleScroll() {
    hideUpArrow();
    hideDownArrow();
    if (arrowTimeout) clearTimeout(arrowTimeout);
    arrowTimeout = setTimeout(() => {
        showUpArrowIfOnSecondSection();
        showDownArrowIfOnFirstSection();
    }, 200); // Show after scroll stops
}

window.addEventListener('scroll', handleScroll);
window.addEventListener('resize', () => {
    showUpArrowIfOnSecondSection();
    showDownArrowIfOnFirstSection();
});
document.addEventListener('DOMContentLoaded', () => {
    showUpArrowIfOnSecondSection();
    showDownArrowIfOnFirstSection();
});

// Arrow click handlers
if (upArrow) {
    upArrow.addEventListener('click', () => {
        if (firstSection) {
            window.scrollTo({
                top: firstSection.offsetTop,
                behavior: 'smooth'
            });
        }
    });
}
if (downArrow) {
    downArrow.addEventListener('click', () => {
        if (secondSection) {
            window.scrollTo({
                top: secondSection.offsetTop,
                behavior: 'smooth'
            });
        }
    });
}

// --- REST OF YOUR CODE ---
// (All other logic remains unchanged, just make sure you don't redeclare these variables again anywhere in the file)

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
    setAboutButtonText('ARTWORK');

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
                setAboutButtonText('ARTWORK');
            });
        } else {
            // If it's closed, show the content and animate the button to "HIDE"
            bioContent.classList.add('active');
            aboutFlip.setText('ARTWORK', () => {
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

// Scroll to top arrow


function updateUpArrowVisibility() {
    if (!upArrow || !secondSection) return;
    const rect = secondSection.getBoundingClientRect();
    // Show arrow if any part of second section is in the viewport
    if (rect.top < window.innerHeight && rect.bottom > 0) {
        upArrow.style.opacity = '1';
        upArrow.style.pointerEvents = 'auto';
    } else {
        upArrow.style.opacity = '0';
        upArrow.style.pointerEvents = 'none';
    }
}

function hideUpArrow() {
    if (!upArrow) return;
    upArrow.style.opacity = '0';
    upArrow.style.pointerEvents = 'none';
}

function handleScroll() {
    hideUpArrow();
    if (upArrowTimeout) clearTimeout(upArrowTimeout);
    upArrowTimeout = setTimeout(showUpArrowIfOnSecondSection, 200); // Show after scroll stops
}

window.addEventListener('scroll', handleScroll);
window.addEventListener('resize', showUpArrowIfOnSecondSection);
document.addEventListener('DOMContentLoaded', showUpArrowIfOnSecondSection);
