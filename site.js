(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const revealItems = document.querySelectorAll(
    '.story-card, .system-pane, .insight-banner, .project, .note-card, .publication-feature, .publication-principles > div, .article-prose > section'
  );

  revealItems.forEach((item) => item.classList.add('reveal'));
  if (reducedMotion || !('IntersectionObserver' in window)) {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  } else {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12 });
    revealItems.forEach((item) => revealObserver.observe(item));
  }

  document.querySelectorAll('[data-rail]').forEach((rail) => {
    const railId = rail.getAttribute('data-rail');
    document.querySelectorAll(`[data-rail-control="${railId}"]`).forEach((control) => {
      control.addEventListener('click', () => {
        const direction = control.getAttribute('data-direction') === 'next' ? 1 : -1;
        rail.scrollBy({ left: rail.clientWidth * 0.82 * direction, behavior: reducedMotion ? 'auto' : 'smooth' });
      });
    });
  });

  const flowSteps = document.querySelectorAll('.flow-step');
  const flowDetail = document.querySelector('.flow-detail p');
  flowSteps.forEach((step) => {
    step.addEventListener('click', () => {
      flowSteps.forEach((item) => item.setAttribute('aria-selected', 'false'));
      step.setAttribute('aria-selected', 'true');
      if (flowDetail) flowDetail.textContent = step.dataset.detail || '';
    });
  });

  const mapNodes = document.querySelectorAll('.map-node');
  const mapExplainer = document.querySelector('.map-explainer');
  mapNodes.forEach((node) => {
    node.addEventListener('click', () => {
      mapNodes.forEach((item) => item.setAttribute('aria-pressed', 'false'));
      node.setAttribute('aria-pressed', 'true');
      if (mapExplainer) mapExplainer.textContent = node.dataset.explainer || '';
    });
  });

  const progress = document.querySelector('.reading-progress');
  const article = document.querySelector('.article-prose');
  const tocLinks = Array.from(document.querySelectorAll('.article-toc a'));
  const sections = tocLinks
    .map((link) => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  const syncReadingState = () => {
    if (progress && article) {
      const rect = article.getBoundingClientRect();
      const distance = Math.max(1, article.offsetHeight - window.innerHeight * 0.55);
      const read = Math.min(1, Math.max(0, -rect.top / distance));
      progress.style.width = `${read * 100}%`;
    }

    if (sections.length) {
      let activeId = sections[0].id;
      sections.forEach((section) => {
        if (section.getBoundingClientRect().top <= 150) activeId = section.id;
      });
      tocLinks.forEach((link) => link.classList.toggle('active', link.getAttribute('href') === `#${activeId}`));
    }
  };

  if (progress || sections.length) {
    syncReadingState();
    window.addEventListener('scroll', syncReadingState, { passive: true });
  }

  const checklist = document.querySelector('.deployment-checklist');
  if (checklist) {
    const checks = Array.from(checklist.querySelectorAll('input[type="checkbox"]'));
    const count = checklist.querySelector('[data-check-count]');
    const bar = checklist.querySelector('.checklist-progress i');
    const syncChecklist = () => {
      const completed = checks.filter((input) => input.checked).length;
      if (count) count.textContent = `${completed} / ${checks.length} checked`;
      if (bar) bar.style.width = `${(completed / checks.length) * 100}%`;
    };
    checks.forEach((input) => input.addEventListener('change', syncChecklist));
    syncChecklist();
  }
})();
