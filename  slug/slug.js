// Text scramble effect class for the "OTHER PROJECTS" button/arrow
class TextScramble {
  constructor(el) {
      this.el = el;
      this.chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      this.update = this.update.bind(this);
  }

  setText(newText) {
      const oldText = this.el.innerText;
      const length = Math.max(oldText.length, newText.length);
      const promise = new Promise((resolve) => this.resolve = resolve);
      this.queue = [];

      for (let i = 0; i < length; i++) {
          const from = oldText[i] || '';
          const to = newText[i] || '';
          const start = Math.floor(Math.random() * 40);
          const end = start + Math.floor(Math.random() * 60);
          this.queue.push({ from, to, start, end });
      }

      cancelAnimationFrame(this.frameRequest);
      this.frame = 0;
      this.update();
      return promise;
  }

  update() {
      let output = '';
      let complete = 0;

      for (let i = 0, n = this.queue.length; i < n; i++) {
          let { from, to, start, end, char } = this.queue[i];

          if (this.frame >= end) {
              complete++;
              output += to;
          } else if (this.frame >= start) {
              if (!char || Math.random() < 0.28) {
                  char = this.randomChar();
                  this.queue[i].char = char;
              }
              output += char;
          } else {
              output += from;
          }
      }

      this.el.textContent = output;

      if (complete === this.queue.length) {
          this.resolve();
      } else {
          this.frameRequest = requestAnimationFrame(this.update);
          this.frame++;
      }
  }

  randomChar() {
      return this.chars[Math.floor(Math.random() * this.chars.length)];
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const tabs = document.querySelectorAll('.essay-tab');
  const essays = document.querySelectorAll('.essay-text');
  const projects = document.querySelectorAll('.project-set');
  const cursorLabel = document.getElementById('cursorLabel');
  const projectsButton = document.getElementById('projectsButton') || document.querySelector('.projects-button');
  const siteTitle = document.querySelector('.site-title');

  // Create star scroll indicators
  const createScrollStars = () => {
      const starLeft = document.createElement('div');
      starLeft.className = 'star-scroll-indicator';
      starLeft.textContent = '★';
      document.querySelector('.page').appendChild(starLeft);

      const starRight = document.createElement('div');
      starRight.className = 'star-scroll-indicator-gallery';
      starRight.textContent = '★';
      document.querySelector('.page').appendChild(starRight);

      return { starLeft, starRight };
  };

  const { starLeft, starRight } = createScrollStars();

  // SCRAMBLE EFFECT for projects button: arrow → HOME → arrow
  const projectsScramble = new TextScramble(projectsButton);
  let projectsButtonState = 'arrow';

  // Start with thicker arrow using the specific symbol
  projectsButton.textContent = '⬅';
  projectsButton.style.fontWeight = 'bold';
  projectsButton.style.fontSize = 'clamp(16px, 2.8vw, 39px)';

  projectsButton.addEventListener('mouseenter', function () {
      projectsScramble.setText('HOME');
      projectsButtonState = 'home';
  });

  projectsButton.addEventListener('mouseleave', function () {
      // Return to arrow on mouse leave
      setTimeout(() => {
          projectsButton.textContent = '⬅';
          projectsButtonState = 'arrow';
      }, 50);
  });

  // Site title hover effect - works from all directions
  let isOverTitle = false;
  
  siteTitle.addEventListener('mouseenter', function () {
      isOverTitle = true;
      document.body.classList.add('title-hover');
  });

  siteTitle.addEventListener('mouseleave', function () {
      isOverTitle = false;
      document.body.classList.remove('title-hover');
  });

  // Additional check for edge cases
  siteTitle.addEventListener('mouseover', function () {
      if (!isOverTitle) {
          isOverTitle = true;
          document.body.classList.add('title-hover');
      }
  });

  siteTitle.addEventListener('mouseout', function (e) {
      // Check if mouse is actually leaving the element
      if (!siteTitle.contains(e.relatedTarget)) {
          isOverTitle = false;
          document.body.classList.remove('title-hover');
      }
  });

  // TAB SWITCHING: Show/hide essays and project sets in sync
  tabs.forEach(tab => {
      tab.addEventListener('click', () => {
          const index = tab.dataset.index;

          // Update tabs
          tabs.forEach(t => t.classList.remove('active'));
          tab.classList.add('active');

          // Update essays
          essays.forEach(e => e.classList.remove('active'));
          const currentEssay = document.querySelector(`.essay-text[data-index="${index}"]`);
          if (currentEssay) currentEssay.classList.add('active');

          // Update projects - Fixed to match original indexing
          projects.forEach(p => p.classList.remove('active'));
          const currentProject = document.querySelector(`.project-set[data-index="${index}"]`);
          if (currentProject) currentProject.classList.add('active');

          // Scroll both columns to top when switching tabs
          document.querySelector('.essay-sidebar').scrollTop = 0;
          document.querySelector('.project-gallery').scrollTop = 0;
      });
  });

  // INFO TOGGLE
  document.querySelectorAll('.info-toggle').forEach(toggle => {
      toggle.addEventListener('click', (e) => {
          e.stopPropagation();
          const panel = toggle.nextElementSibling;
          const isActive = toggle.classList.contains('active');

          // Close all other panels
          document.querySelectorAll('.info-toggle').forEach(t => {
              if (t !== toggle) {
                  t.classList.remove('active');
                  t.nextElementSibling.classList.remove('active');
                  t.nextElementSibling.style.maxHeight = '0';
              }
          });

          // Toggle current panel
          toggle.classList.toggle('active');
          panel.classList.toggle('active');

          // Smooth content shift
          if (!isActive) {
              panel.style.maxHeight = panel.scrollHeight + 'px';
          } else {
              panel.style.maxHeight = '0';
          }
      });
  });

  // SLIDESHOW + VIDEO CONTROLS
  document.querySelectorAll('.slideshow-zone').forEach(zone => {
      const slides = zone.querySelectorAll('.slide');
      let currentIndex = 0;
      let isPlaying = false;

      function showSlide(i) {
          slides.forEach(s => s.classList.remove('current'));
          slides[i].classList.add('current');
      }

      function isVideo(slide) {
          return slide.querySelector('video') !== null;
      }

      function getCurrentVideo() {
          const currentSlide = slides[currentIndex];
          return currentSlide ? currentSlide.querySelector('video') : null;
      }

      zone.addEventListener('click', (e) => {
          // Don't interfere with info toggle
          if (e.target.classList.contains('info-toggle')) return;

          e.preventDefault();

          // Only handle clicks on the actual media
          const mediaElement = zone.querySelector('.slide.current img, .slide.current video');
          if (!mediaElement) return;

          const mediaRect = mediaElement.getBoundingClientRect();
          const mouseX = e.clientX;
          const mouseY = e.clientY;

          // Check if click is on the media element
          if (mouseX >= mediaRect.left && mouseX <= mediaRect.right &&
              mouseY >= mediaRect.top && mouseY <= mediaRect.bottom) {

              const midpoint = mediaRect.left + (mediaRect.width / 2);
              const currentVideo = getCurrentVideo();

              // If current slide is a video, handle play/pause
              if (currentVideo) {
                  if (isPlaying) {
                      currentVideo.pause();
                      isPlaying = false;
                  } else {
                      currentVideo.play();
                      isPlaying = true;
                  }
              } else {
                  // Navigate slides for images
                  if (mouseX > midpoint) {
                      // Next slide
                      currentIndex = (currentIndex + 1) % slides.length;
                  } else {
                      // Previous slide
                      currentIndex = (currentIndex - 1 + slides.length) % slides.length;
                  }

                  showSlide(currentIndex);

                  // Reset playing state for new slide
                  const newVideo = getCurrentVideo();
                  if (newVideo) {
                      isPlaying = false;
                      newVideo.pause();
                  }
              }
          }
      });

      zone.addEventListener('mousemove', (e) => {
          // Only show cursor label when hovering over the actual media
          const mediaElement = zone.querySelector('.slide.current img, .slide.current video');
          if (!mediaElement) {
              cursorLabel.style.display = 'none';
              return;
          }

          const mediaRect = mediaElement.getBoundingClientRect();
          const mouseX = e.clientX;
          const mouseY = e.clientY;

          // Check if mouse is over the media element
          if (mouseX >= mediaRect.left && mouseX <= mediaRect.right &&
              mouseY >= mediaRect.top && mouseY <= mediaRect.bottom) {

              const midpoint = mediaRect.left + (mediaRect.width / 2);
              const currentVideo = getCurrentVideo();

              let label = '';
              if (currentVideo) {
                  label = isPlaying ? 'PAUSE' : 'PLAY';
              } else if (slides.length > 1) {
                  label = mouseX > midpoint ? 'NEXT' : 'BACK';
              }

              if (label) {
                  cursorLabel.textContent = label;
                  cursorLabel.style.display = 'block';
                  cursorLabel.style.left = `${e.clientX}px`;
                  cursorLabel.style.top = `${e.clientY}px`;
                  cursorLabel.style.color = '#e0e0e0'; // Updated to light grey
              }
          } else {
              cursorLabel.style.display = 'none';
          }
      });

      zone.addEventListener('mouseleave', () => {
          cursorLabel.style.display = 'none';

          // Pause video when mouse leaves
          const currentVideo = getCurrentVideo();
          if (currentVideo && isPlaying) {
              currentVideo.pause();
              isPlaying = false;
          }
      });

      // Initialize first slide
      showSlide(currentIndex);
  });

  // Custom star scrollbar functionality
  let scrollTimeoutLeft, scrollTimeoutRight;
  const essaySidebar = document.querySelector('.essay-sidebar');
  const projectGallery = document.querySelector('.project-gallery');

  function updateStarPosition(element, star, isGallery = false) {
      const scrollPercentage = element.scrollTop / (element.scrollHeight - element.clientHeight);
      const viewportHeight = element.clientHeight;
      const topPosition = 120 + (viewportHeight - 240) * scrollPercentage;
      star.style.top = `${topPosition}px`;
  }

  function showScrollStar(element, star, timeout) {
      element.classList.add('scrolling');
      clearTimeout(timeout);
      return setTimeout(() => {
          element.classList.remove('scrolling');
      }, 1000);
  }

  essaySidebar.addEventListener('scroll', () => {
      updateStarPosition(essaySidebar, starLeft);
      scrollTimeoutLeft = showScrollStar(essaySidebar, starLeft, scrollTimeoutLeft);
  });

  projectGallery.addEventListener('scroll', () => {
      updateStarPosition(projectGallery, starRight, true);
      scrollTimeoutRight = showScrollStar(projectGallery, starRight, scrollTimeoutRight);
  });

  // Smooth scroll behavior for any anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
          e.preventDefault();
          const target = document.querySelector(this.getAttribute('href'));
          if (target) {
              target.scrollIntoView({
                  behavior: 'smooth',
                  block: 'start'
              });
          }
      });
  });

  // Add keyboard navigation for slideshows
  document.addEventListener('keydown', (e) => {
      const activeZone = document.querySelector('.project-set.active .slideshow-zone');
      if (!activeZone) return;

      const slides = activeZone.querySelectorAll('.slide');
      let currentIndex = Array.from(slides).findIndex(slide => slide.classList.contains('current'));

      if (e.key === 'ArrowRight') {
          currentIndex = (currentIndex + 1) % slides.length;
          slides.forEach(s => s.classList.remove('current'));
          slides[currentIndex].classList.add('current');
      } else if (e.key === 'ArrowLeft') {
          currentIndex = (currentIndex - 1 + slides.length) % slides.length;
          slides.forEach(s => s.classList.remove('current'));
          slides[currentIndex].classList.add('current');
      }
  });

  // Initialize on page load
  const firstTab = document.querySelector('.essay-tab.active');
  if (firstTab) {
      const index = firstTab.dataset.index;
      const firstEssay = document.querySelector(`.essay-text[data-index="${index}"]`);
      const firstProject = document.querySelector(`.project-set[data-index="${index}"]`);

      if (firstEssay) firstEssay.classList.add('active');
      if (firstProject) firstProject.classList.add('active');
  }

  // Handle window resize
  let resizeTimer;
  window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
          // Recalculate any necessary dimensions after resize
          document.querySelectorAll('.slideshow-zone').forEach(zone => {
              const slides = zone.querySelectorAll('.slide');
              const currentSlide = zone.querySelector('.slide.current');
              if (!currentSlide && slides.length > 0) {
                  slides[0].classList.add('current');
              }
          });
      }, 250);
  });

  // Preload images for smoother transitions
  function preloadImage(url) {
      const img = new Image();
      img.src = url;
  }

  // Preload all slideshow images
  document.querySelectorAll('.slide img').forEach(img => {
      preloadImage(img.src);
  });

  // Enable independent scroll for columns (Desktop)
  document.querySelectorAll('.essay-sidebar, .project-gallery').forEach(scroller => {
      scroller.addEventListener('mouseenter', function () {
          this.focus();
      });
      // Make focusable for keyboard scroll
      scroller.setAttribute('tabindex', '0');
      scroller.style.outline = 'none';
  });

  // Prevent page scroll when hovering/scrolling in either column
  document.body.addEventListener('wheel', function (e) {
      // Find which scroller is under the mouse
      const essaySidebar = document.querySelector('.essay-sidebar');
      const projectGallery = document.querySelector('.project-gallery');
      const mouseX = e.clientX;
      const mouseY = e.clientY;
      let handled = false;

      function isInside(elem) {
          const rect = elem.getBoundingClientRect();
          return mouseX >= rect.left && mouseX <= rect.right &&
              mouseY >= rect.top && mouseY <= rect.bottom;
      }
      if (isInside(essaySidebar)) {
          essaySidebar.scrollTop += e.deltaY;
          handled = true;
      } else if (isInside(projectGallery)) {
          projectGallery.scrollTop += e.deltaY;
          handled = true;
      }
      if (handled) e.preventDefault();
  }, { passive: false });
});