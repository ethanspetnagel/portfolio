document.addEventListener("DOMContentLoaded", () => {
  const cursorLabel = document.getElementById("cursorLabel");

  // Slideshow logic
  document.querySelectorAll(".slideshow-zone").forEach(zone => {
    const slides = zone.querySelectorAll(".slide");
    let current = 0;

    const showSlide = (i) => {
      slides.forEach((slide, idx) => {
        slide.classList.toggle("current", idx === i);
      });
      current = i;
    };

    // Mousemove = follow + update cursor
    zone.addEventListener("mousemove", (e) => {
      const rect = zone.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const label = x < rect.width / 2 ? "BACK" : "NEXT";

      cursorLabel.textContent = label;
      cursorLabel.style.display = "block";
      cursorLabel.style.left = `${e.clientX + 10}px`;
      cursorLabel.style.top = `${e.clientY + 10}px`;
    });

    // Hide cursor when leaving zone
    zone.addEventListener("mouseleave", () => {
      cursorLabel.style.display = "none";
    });

    // Click to switch slides
    zone.addEventListener("click", (e) => {
      const rect = zone.getBoundingClientRect();
      const x = e.clientX - rect.left;

      if (x < rect.width / 2) {
        if (current > 0) showSlide(current - 1);
      } else {
        if (current < slides.length - 1) showSlide(current + 1);
      }
    });

    showSlide(0);
  });

  // Essay tab switching
  const tabs = document.querySelectorAll(".essay-tab");
  const essays = document.querySelectorAll(".essay-text");
  const projectSets = document.querySelectorAll(".project-set");

  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      const index = tab.getAttribute("data-index");

      // Highlight active tab
      tabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");

      // Show the correct essay
      essays.forEach(e => e.classList.add("hidden"));
      document.querySelector(`.essay-text[data-index="${index}"]`).classList.remove("hidden");

      // Show the correct image set
      projectSets.forEach(p => p.classList.add("hidden"));
      document.querySelector(`.project-set[data-index="${index}"]`).classList.remove("hidden");
    });
  });

  // INFO toggles
  document.querySelectorAll(".info-toggle").forEach(toggle => {
    toggle.addEventListener("click", () => {
      const extra = toggle.nextElementSibling;
      extra.classList.toggle("hidden");
    });
  });
});
