/**
 * Profile Template Generator
 * Generates static HTML, CSS, and JS from student profile configuration.
 * Replicates the standard profile layout (ProfileCard, bento blocks) for Advanced Mode.
 */

interface StatItem {
  key: string;
  val: string | number;
}

interface GenerateTemplateOptions {
  username: string;
  name: string;
  role: string;
  bio: string;
  avatarUrl: string;
  github: string;
  linkedin: string;
  stats: StatItem[] | Record<string, any>;
  blocks: any[];
}

export function getAvatarExtension(url: string): string {
  if (!url) return "png";
  const cleanUrl = url.split("?")[0].split("#")[0];
  const ext = cleanUrl.split(".").pop()?.toLowerCase();
  if (ext && ["png", "jpg", "jpeg", "webp", "gif"].includes(ext)) {
    return ext === "jpeg" ? "jpg" : ext;
  }
  return "png";
}

export function generateProfileTemplate(options: GenerateTemplateOptions) {
  const { username, name, role, bio, avatarUrl, github, linkedin, stats, blocks } = options;

  // 1. Process Stats to extract bugsFixed & coffeeConsumed for the card header
  let bugsFixed = 0;
  let coffeeConsumed = 0;
  const statsObj: Record<string, string | number> = {};

  if (Array.isArray(stats)) {
    stats.forEach((s) => {
      statsObj[s.key] = s.val;
      const keyLower = s.key.toLowerCase();
      if (keyLower.includes("bug")) {
        bugsFixed = Number(s.val) || 0;
      }
      if (keyLower.includes("coffee") || keyLower.includes("chai")) {
        coffeeConsumed = Number(s.val) || 0;
      }
    });
  } else if (stats && typeof stats === "object") {
    Object.entries(stats).forEach(([key, val]) => {
      if (key !== "blocks" && key !== "advanceMode" && key !== "customHtml" && key !== "customJs" && key !== "customCss") {
        statsObj[key] = val as string | number;
        const keyLower = key.toLowerCase();
        if (keyLower.includes("bug")) {
          bugsFixed = Number(val) || 0;
        }
        if (keyLower.includes("coffee") || keyLower.includes("chai")) {
          coffeeConsumed = Number(val) || 0;
        }
      }
    });
  }

  // 2. Generate Bento Grid HTML
  const bentoBlocksHtml = blocks
    .map((block) => {
      const spanClass =
        block.colSpan === 2
          ? "md:col-span-2"
          : block.colSpan === 3
          ? "md:col-span-3"
          : "md:col-span-1";

      let headerIconSvg = ``;
      if (block.type === "skills") {
        headerIconSvg = `<svg class="bento-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2"></rect><rect x="9" y="9" width="6" height="6"></rect><path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 15h3M1 9h3M1 15h3"></path></svg>`;
      } else if (block.type === "projects") {
        headerIconSvg = `<svg class="bento-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>`;
      } else if (block.type === "timeline") {
        headerIconSvg = `<svg class="bento-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>`;
      } else if (block.type === "metrics") {
        headerIconSvg = `<svg class="bento-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2"></rect><rect x="9" y="9" width="6" height="6"></rect><path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 15h3M1 9h3M1 15h3"></path></svg>`;
      } else if (block.type === "code") {
        headerIconSvg = `<svg class="bento-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m18 16 4-4-4-4M6 8l-4 4 4 4M14.5 4l-5 16"></path></svg>`;
      } else {
        headerIconSvg = `<svg class="bento-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 17 10 11 4 5"></polyline><line x1="12" y1="19" x2="20" y2="19"></line></svg>`;
      }

      let contentHtml = "";
      if (block.type === "markdown") {
        contentHtml = parseMarkdownToHtml(block.content || "");
      } else if (block.type === "skills" && Array.isArray(block.skills)) {
        const skillsSpan = block.skills
          .map((s: string) => `<span class="skill-tag">${s}</span>`)
          .join("\n        ");
        contentHtml = `<div class="skills-wrapper">${skillsSpan}</div>`;
      } else if (block.type === "projects" && Array.isArray(block.projects)) {
        const projectsItems = block.projects
          .map(
            (p: any) => `
        <div class="project-item">
          <span class="project-title">${p.title}</span>
          <p class="project-desc">${p.description}</p>
        </div>`
          )
          .join("");
        contentHtml = `<div class="projects-list">${projectsItems}</div>`;
      } else if (block.type === "timeline" && Array.isArray(block.items)) {
        const timelineItems = block.items
          .map(
            (item: any) => `
        <div class="timeline-item">
          <div class="timeline-dot"></div>
          <div>
            <span class="timeline-date">${item.date}</span>
            <span class="timeline-title">${item.title}</span>
            <span class="timeline-desc">${item.description}</span>
          </div>
        </div>`
          )
          .join("");
        contentHtml = `<div class="timeline-list">${timelineItems}</div>`;
      } else if (block.type === "metrics") {
        const metricEntries = Object.entries(statsObj);
        if (metricEntries.length === 0) {
          contentHtml = `<p class="text-[9px] text-neutral-500 font-mono">No telemetry compiled.</p>`;
        } else {
          const metricsCards = metricEntries
            .map(([key, val]) => {
              let metricIconSvg = `<svg class="metric-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2"></rect><rect x="9" y="9" width="6" height="6"></rect><path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 15h3M1 9h3M1 15h3"></path></svg>`;
              let metricColorClass = "text-purple-400";
              const keyLower = key.toLowerCase();
              if (keyLower.includes("bug")) {
                metricIconSvg = `<svg class="metric-icon text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m8 2 1.88 1.88M14.12 3.88 16 2M9 7.13v-1M15 7.13v-1M12 20h.01M5 12h14M12 15h.01M19 12a7 7 0 0 1-7 7 7 7 0 0 1-7-7 7 7 0 0 1 7-7 7 7 0 0 1 7 7Z"></path></svg>`;
                metricColorClass = "text-red-400";
              } else if (keyLower.includes("coffee") || keyLower.includes("chai")) {
                metricIconSvg = `<svg class="metric-icon text-amber-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 8h1a4 4 0 1 1 0 8h-1M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"></path><line x1="6" y1="2" x2="6" y2="4"></line><line x1="10" y1="2" x2="10" y2="4"></line><line x1="14" y1="2" x2="14" y2="4"></line></svg>`;
                metricColorClass = "text-amber-500";
              }

              const formattedKey = key
                .replace(/([A-Z])/g, " $1")
                .trim()
                .toLowerCase();

              return `
          <div class="metric-card">
            <span class="metric-label" title="${key}">${formattedKey}</span>
            <div class="metric-row">
              <span class="metric-val">${val}</span>
              ${metricIconSvg}
            </div>
          </div>`;
            })
            .join("");
          contentHtml = `<div class="metrics-grid">${metricsCards}</div>`;
        }
      } else if (block.type === "code") {
        contentHtml = `
        <div class="code-sandbox-wrapper">
          <iframe
            srcdoc="<!DOCTYPE html><html><head><meta charset='utf-8'><style>body { margin: 0; padding: 12px; color: #f3f4f6; font-family: monospace; font-size: 11px; background: transparent; line-height: 1.4; } ${block.css || ""}</style></head><body>${block.html || ""}</body></html>"
            sandbox="allow-scripts"
            class="code-sandbox-iframe"
            loading="lazy"
          ></iframe>
        </div>`;
      }

      return `
        <!-- Bento Block: ${block.title || block.type} -->
        <div class="bento-card ${spanClass}">
          <div class="bento-header">
            ${headerIconSvg}
            <span class="bento-title">${block.title || "block_section"}</span>
          </div>
          <div class="bento-content">
            ${contentHtml}
          </div>
        </div>`;
    })
    .join("\n");

  const avatarExt = getAvatarExtension(avatarUrl);

  // 3. Components split
  const indexHtml = `<div class="student-profile-wrapper min-h-screen bg-[#050506] text-gray-200 py-8 md:py-16 relative overflow-hidden font-sans">
  <!-- Glowing backgrounds -->
  <div class="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[120px] pointer-events-none"></div>
  <div class="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none"></div>

  <div class="max-w-4xl mx-auto px-4 md:px-6 space-y-8 relative z-10 animate-fade-in">
    <!-- Breadcrumbs navigation -->
    <div class="flex justify-between items-center border-b border-white/5 pb-4">
      <a href="/browse" class="text-xs font-mono text-gray-400 hover:text-white flex items-center gap-1 transition-colors">
        &lt;../directory
      </a>
    </div>

    <!-- Profile Grid Layout -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
      
      <!-- PROFILE_CARD_COMPONENT -->

      <!-- BENTO_GRID_COMPONENT -->

    </div>
  </div>
</div>`;

  const cardHtml = `<!-- Left Column: Avatar Card & Socials -->
<div class="flex flex-col items-center gap-4 w-full">
  <!-- Interactive tilting Card -->
  <div class="profile-card w-full max-w-[280px]">
    <div class="profile-card-glow"></div>
    <div class="profile-card-inner">
      <!-- Glare effect element -->
      <div class="profile-card-glare"></div>
      
      <div class="profile-card-header">
        <div class="tech-badge">
          <svg class="tech-badge-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 17 10 11 4 5"></polyline><line x1="12" y1="19" x2="20" y2="19"></line></svg>
          <span class="tech-badge-text">@${username}</span>
        </div>
        <div class="status-badge">
          <span class="status-dot"></span>
          <span class="status-text">🐛 ${bugsFixed} / ☕ ${coffeeConsumed}</span>
        </div>
      </div>
      
      <div class="avatar-container">
        <div class="avatar-frame">
          <img class="avatar-img" src="me.${avatarExt}" alt="${name}" />
          <div class="avatar-overlay"></div>
          <!-- Corners -->
          <div class="corner corner-tl"></div>
          <div class="corner corner-tr"></div>
          <div class="corner corner-bl"></div>
          <div class="corner corner-br"></div>
        </div>
      </div>
      
      <div class="profile-card-footer">
        <div class="user-meta">
          <h3 class="user-name">${name}</h3>
          <p class="user-role">${role}</p>
        </div>
        ${github ? `
        <a href="${github}" target="_blank" class="contact-btn">
          <span>GitHub Profile</span>
          <svg class="contact-btn-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
        </a>
        ` : ''}
      </div>
    </div>
  </div>

  <!-- Social Connections -->
  ${(github || linkedin) ? `
  <div class="social-links-wrapper flex gap-2 p-2 bg-[#0c0c0d]/80 border border-white/5 rounded-xl backdrop-blur-md select-none">
    ${github ? `
    <a href="${github}" target="_blank" class="social-link-btn flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-mono rounded-lg transition-colors text-neutral-400 hover:text-white hover:bg-white/5">
      <svg class="social-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path><path d="M9 18c-4.51 2-5-2-7-2"></path></svg>
      github_profile
    </a>
    ` : ''}
    ${linkedin ? `
    <a href="${linkedin}" target="_blank" class="social-link-btn flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-mono rounded-lg transition-colors text-neutral-400 hover:text-white hover:bg-white/5">
      <svg class="social-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
      linkedin_connect
    </a>
    ` : ''}
  </div>
  ` : ''}
</div>`;

  const bentoHtml = `<!-- Right Column: Bento Grid blocks -->
<div class="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
  ${bentoBlocksHtml}
</div>`;

  const html = indexHtml
    .replace("<!-- PROFILE_CARD_COMPONENT -->", cardHtml)
    .replace("<!-- BENTO_GRID_COMPONENT -->", bentoHtml);

  const css = `/* ==========================================================================
   Default Profile Card & Page Custom CSS Override Template
   ========================================================================== */

/* Scoped target: The student profile container */
.student-profile-wrapper {
  background-color: #050506;
  background-image: radial-gradient(rgba(255, 255, 255, 0.015) 1px, transparent 1px);
  background-size: 20px 20px;
}

/* Scoped target: The card container wrapper */
.profile-card {
  position: relative;
  width: 100%;
  aspect-ratio: 3 / 4.2;
  border-radius: 1rem;
  perspective: 1000px;
  touch-action: none;
}

/* Background Neon Aura Glow */
.profile-card-glow {
  position: absolute;
  inset: -8px;
  border-radius: 1.5rem;
  filter: blur(24px);
  pointer-events: none;
  z-index: 0;
  background: radial-gradient(circle at 50% 50%, var(--behind-glow-color, rgba(168, 85, 247, 0.25)) 0%, transparent 60%);
  opacity: 0.4;
  transition: opacity 0.4s ease-out;
}

.profile-card:hover .profile-card-glow {
  opacity: 0.95;
}

/* The actual visible card body (glass box) */
.profile-card-inner {
  width: 100%;
  height: 100%;
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 1.25rem;
  border-radius: 1rem;
  border: 1px solid var(--card-border-color, rgba(255, 255, 255, 0.08));
  background: var(--card-bg, linear-gradient(145deg, rgba(20, 20, 25, 0.9) 0%, rgba(10, 10, 12, 0.8) 100%));
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(12px);
  overflow: hidden;
  transition: transform 0.4s cubic-bezier(0.25, 1, 0.5, 1), box-shadow 0.4s cubic-bezier(0.25, 1, 0.5, 1), border-color 0.3s;
}

/* Holographic Glare Layer */
.profile-card-glare {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 30;
  background: radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.12) 0%, transparent 65%);
  opacity: 0;
  transition: opacity 0.4s ease-out;
}

/* Card Header */
.profile-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  z-index: 20;
}

.tech-badge {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.25rem 0.625rem;
  border-radius: 0.375rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.tech-badge-icon {
  width: 0.875rem;
  height: 0.875rem;
  color: var(--color-primary, #a855f7);
}

.tech-badge-text {
  font-family: ui-monospace, monospace;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.05em;
  color: var(--color-primary, #a855f7);
  text-transform: uppercase;
}

.status-badge {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.125rem 0.5rem;
  border-radius: 9999px;
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.25);
}

.status-dot {
  width: 0.375rem;
  height: 0.375rem;
  border-radius: 9999px;
  background-color: #34d399;
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.status-text {
  font-family: ui-monospace, monospace;
  font-size: 9px;
  font-weight: 500;
  color: #34d399;
  max-width: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Card Center Avatar */
.avatar-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem 0;
  z-index: 20;
}

.avatar-frame {
  position: relative;
  width: 8rem;
  height: 8rem;
  border-radius: 0.75rem;
  padding: 0.25rem;
  background: linear-gradient(to top right, var(--color-primary, #a855f7), rgba(168, 85, 247, 0.4));
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 0.5rem;
  background-color: #020617;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: transform 0.5s;
}

.avatar-frame:hover .avatar-img {
  transform: scale(1.1);
}

.avatar-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(2, 6, 23, 0.4) 0%, transparent 100%);
  pointer-events: none;
  border-radius: 0.75rem;
}

.corner {
  position: absolute;
  width: 0.625rem;
  height: 0.625rem;
  border-color: rgba(255, 255, 255, 0.5);
  border-width: 0;
  transform: translate(0, 0);
}

.corner-tl { top: 0; left: 0; border-top-width: 2px; border-left-width: 2px; border-top-left-radius: 2px; transform: translate(-1px, -1px); }
.corner-tr { top: 0; right: 0; border-top-width: 2px; border-right-width: 2px; border-top-right-radius: 2px; transform: translate(1px, -1px); }
.corner-bl { bottom: 0; left: 0; border-bottom-width: 2px; border-left-width: 2px; border-bottom-left-radius: 2px; transform: translate(-1px, 1px); }
.corner-br { bottom: 0; right: 0; border-bottom-width: 2px; border-right-width: 2px; border-bottom-right-radius: 2px; transform: translate(1px, 1px); }

/* Card Footer */
.profile-card-footer {
  width: 100%;
  z-index: 20;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  padding-top: 1rem;
  background: linear-gradient(to bottom, transparent, rgba(0, 0, 0, 0.2));
  border-bottom-left-radius: 1rem;
  border-bottom-right-radius: 1rem;
}

.user-meta {
  text-align: center;
  margin-bottom: 0.875rem;
}

.user-name {
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: -0.025em;
  color: #ffffff;
  margin: 0;
}

.user-role {
  font-family: ui-monospace, monospace;
  font-size: 11px;
  font-weight: 500;
  color: #94a3b8;
  margin: 0.25rem 0 0 0;
}

.contact-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  font-family: ui-monospace, monospace;
  font-size: 12px;
  font-weight: 700;
  color: #ffffff;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  cursor: pointer;
  text-decoration: none;
  transition: all 0.2s;
}

.contact-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
}

.contact-btn-icon {
  width: 0.875rem;
  height: 0.875rem;
  color: #94a3b8;
  transition: transform 0.2s;
}

.contact-btn:hover .contact-btn-icon {
  color: #ffffff;
  transform: translate(2px, -2px);
}

/* Bento Card Grid Elements */
.bento-card {
  border-radius: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.05);
  background-color: rgba(23, 23, 27, 0.4);
  backdrop-filter: blur(12px);
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}

.bento-header {
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  padding: 0.875rem 1.25rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.bento-icon {
  width: 1rem;
  height: 1rem;
  color: var(--color-primary, #a855f7);
}

.bento-title {
  font-size: 11px;
  font-weight: 700;
  font-family: ui-monospace, monospace;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #d4d4d8;
}

.bento-content {
  padding: 1.25rem;
  font-family: ui-monospace, monospace;
  font-size: 12px;
  color: #d4d4d8;
  flex: 1;
}

/* Widget Lists & Sub-components */
.skills-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
}

.skill-tag {
  padding: 0.125rem 0.5rem;
  background-color: rgba(168, 85, 247, 0.1);
  border: 1px solid rgba(168, 85, 247, 0.2);
  color: #c084fc;
  border-radius: 0.375rem;
  font-size: 9px;
  font-weight: 600;
}

.projects-list {
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
}

.project-item {
  padding: 0.625rem;
  border: 1px solid rgba(255, 255, 255, 0.05);
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 0.5rem;
  display: flex;
  flex-direction: column;
}

.project-title {
  font-weight: 700;
  font-size: 10px;
  color: #e4e4e7;
  font-family: system-ui, -apple-system, sans-serif;
}

.project-desc {
  font-size: 9px;
  color: #71717a;
  margin-top: 0.25rem;
  line-height: 1.4;
}

.timeline-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding-left: 0.125rem;
}

.timeline-item {
  display: flex;
  gap: 0.625rem;
  font-size: 10px;
  border-left: 1px solid rgba(255, 255, 255, 0.1);
  padding-left: 0.625rem;
  position: relative;
}

.timeline-dot {
  position: absolute;
  left: -3.5px;
  top: 6px;
  width: 6px;
  height: 6px;
  border-radius: 9999px;
  background-color: var(--color-primary, #a855f7);
}

.timeline-date {
  font-size: 8px;
  color: #71717a;
  display: block;
}

.timeline-title {
  font-weight: 600;
  color: #e4e4e7;
  font-size: 10px;
  font-family: system-ui, -apple-system, sans-serif;
}

.timeline-desc {
  color: #71717a;
  font-size: 9px;
  display: block;
  margin-top: 0.125rem;
  line-height: 1.4;
}

.metrics-grid {
  display: grid;
  grid-template-cols: 1fr 1fr;
  gap: 0.5rem;
}

.metric-card {
  padding: 0.5rem;
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 0.5rem;
  border: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 3.5rem;
}

.metric-label {
  font-size: 8px;
  color: #71717a;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.metric-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 0.125rem;
}

.metric-val {
  font-size: 12px;
  font-weight: 700;
  color: #e4e4e7;
  max-width: 70%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.metric-icon {
  width: 0.75rem;
  height: 0.75rem;
  color: var(--color-primary, #a855f7);
}

.code-sandbox-wrapper {
  width: 100%;
  height: 100%;
  min-height: 160px;
  border-radius: 0.5rem;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.05);
  background-color: rgba(0, 0, 0, 0.4);
}

.code-sandbox-iframe {
  width: 100%;
  height: 100%;
  min-height: 160px;
  border: 0;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: .5; }
}

@keyframes fade-in {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fade-in {
  animation: fade-in 0.5s ease-out forwards;
}

/* Scoped target: Primary Theme variables */
:root {
  --color-primary: #a855f7;
  --behind-glow-color: rgba(168, 85, 247, 0.25);
}
`;

  const js = `// Vanilla Javascript Tilt & Glare logic for the Profile Card
document.addEventListener("DOMContentLoaded", () => {
  const card = document.querySelector(".profile-card");
  if (!card) return;
  
  const inner = card.querySelector(".profile-card-inner");
  const glare = card.querySelector(".profile-card-glare");
  const glow = card.querySelector(".profile-card-glow");
  
  if (!inner) return;
  
  card.addEventListener("pointermove", (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Max tilt angle: 10 deg
    const rotateX = -((y - centerY) / centerY) * 10;
    const rotateY = ((x - centerX) / centerX) * 10;
    
    inner.style.transform = \`perspective(1000px) rotateX(\${rotateX}deg) rotateY(\${rotateY}deg) scale3d(1.02, 1.02, 1)\`;
    inner.style.transition = "none";
    
    if (glare) {
      const px = (x / rect.width) * 100;
      const py = (y / rect.height) * 100;
      glare.style.background = \`radial-gradient(circle at \${px}% \${py}%, rgba(255, 255, 255, 0.12) 0%, transparent 65%)\`;
      glare.style.opacity = "1";
      glare.style.transition = "none";
    }
    
    if (glow) {
      const px = (x / rect.width) * 100;
      const py = (y / rect.height) * 100;
      glow.style.background = \`radial-gradient(circle at \${px}% \${py}%, var(--behind-glow-color, rgba(168, 85, 247, 0.25)) 0%, transparent var(--behind-glow-size, 50%))\`;
      glow.style.opacity = "0.95";
      glow.style.transition = "none";
    }
  });
  
  card.addEventListener("pointerleave", () => {
    inner.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
    inner.style.transition = "transform 0.4s cubic-bezier(0.25, 1, 0.5, 1), box-shadow 0.4s cubic-bezier(0.25, 1, 0.5, 1)";
    
    if (glare) {
      glare.style.opacity = "0";
      glare.style.transition = "opacity 0.4s ease-out";
    }
    
    if (glow) {
      glow.style.opacity = "0.4";
      glow.style.background = "radial-gradient(circle at 50% 50%, var(--behind-glow-color, rgba(168, 85, 247, 0.25)) 0%, transparent var(--behind-glow-size, 50%))";
      glow.style.transition = "opacity 0.4s ease-out";
    }
  });
});
`;

  return {
    indexHtml,
    cardHtml,
    bentoHtml,
    html,
    css,
    js,
    avatarExt,
  };
}

// Inline markdown parser helpers
function parseMarkdownToHtml(text: string): string {
  if (!text) return "";
  
  // Replace shortcode widgets first
  const regex = /(<Spotify\s+id="([^"]+)"\s*\/?>)|(<TerminalPrompt\s+command="([^"]+)">([\s\S]*?)<\/TerminalPrompt>)|(<GithubRepo\s+repo="([^"]+)"\s*\/?>)|(<GlowCard(?:\s+color="([^"]+)")?>([\s\S]*?)<\/GlowCard>)/g;
  
  let result = text;
  result = result.replace(regex, (match, spotifyTag, spotifyId, terminalTag, terminalCmd, terminalContent, githubTag, githubRepo, glowcardTag, glowcardColor, glowcardContent) => {
    if (spotifyTag) {
      return `
        <div class="spotify-widget my-4 w-full">
          <iframe style="border-radius: 8px;" src="https://open.spotify.com/embed/track/${spotifyId}?utm_source=generator&theme=0" width="100%" height="80" frameBorder="0" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>
        </div>
      `;
    }
    if (terminalTag) {
      return `
        <div class="terminal-widget bg-black/90 border border-white/10 rounded-lg p-4 font-mono text-xs my-4 text-emerald-400 shadow-inner">
          <div class="flex items-center gap-1.5 border-b border-white/10 pb-2 mb-2 text-neutral-500 select-none">
            <div class="h-1.5 w-1.5 rounded-full bg-red-500/60"></div>
            <div class="h-1.5 w-1.5 rounded-full bg-yellow-500/60"></div>
            <div class="h-1.5 w-1.5 rounded-full bg-green-500/60"></div>
            <span class="text-[9px] ml-1 uppercase">shell_terminal</span>
          </div>
          <div class="flex items-start gap-1">
            <span class="text-purple-400 font-bold shrink-0">guest@yearbook:~$</span>
            <span class="text-white font-semibold">${terminalCmd}</span>
          </div>
          <div class="mt-2 text-emerald-400/90 whitespace-pre-wrap leading-relaxed">${terminalContent}</div>
        </div>
      `;
    }
    if (githubTag) {
      const [owner, name] = githubRepo.split("/");
      return `
        <div class="github-repo-widget bg-[#161b22] border border-white/10 p-4 rounded-lg font-mono text-xs my-4 flex flex-col justify-between h-24 hover:border-purple-500/50 transition-colors shadow-sm">
          <div>
            <span class="text-[9px] text-neutral-400 uppercase tracking-wider block">Repository</span>
            <a href="https://github.com/${githubRepo}" target="_blank" rel="noopener noreferrer" class="text-purple-400 font-bold hover:underline block text-xs mt-1 truncate">
              ${owner || "github"}/${name || "repo"}
            </a>
          </div>
          <div class="flex items-center gap-4 text-neutral-400 mt-2 text-[10px]">
            <span class="flex items-center gap-0.5">⭐ star_count</span>
            <span class="flex items-center gap-0.5">🍴 fork_count</span>
            <span class="bg-purple-500/15 text-purple-400 border border-purple-500/20 px-1 py-0.5 rounded-sm text-[9px]">Active</span>
          </div>
        </div>
      `;
    }
    if (glowcardTag) {
      const color = glowcardColor || "rgba(125, 190, 255, 0.3)";
      return `
        <div class="glow-card-widget relative p-4 rounded-xl border border-white/5 bg-neutral-900/40 backdrop-blur-md my-4 shadow-sm group overflow-hidden transition-all duration-300 hover:border-white/20" style="box-shadow: 0 0 15px -3px ${color};">
          <div class="absolute -inset-10 opacity-20 group-hover:opacity-30 blur-2xl transition-opacity pointer-events-none" style="background: radial-gradient(circle at center, ${color} 0%, transparent 70%);"></div>
          <div class="relative z-10">
            ${parseMarkdownText(glowcardContent)}
          </div>
        </div>
      `;
    }
    return match;
  });

  return parseMarkdownText(result);
}

function parseMarkdownText(text: string): string {
  const lines = text.split("\n");
  return lines
    .map((line) => {
      const trimmed = line.trim();

      // Headers (### Header)
      const headerMatch = line.match(/^(#{1,6})\s+(.*)$/);
      if (headerMatch) {
        const level = headerMatch[1].length;
        const content = parseInlineMarkdown(headerMatch[2]);
        if (level === 1) return `<h1 class="text-xl font-bold tracking-tight text-white font-sans mt-4 mb-2">${content}</h1>`;
        if (level === 2) return `<h2 class="text-lg font-bold tracking-tight text-white font-sans mt-4 mb-2">${content}</h2>`;
        return `<h3 class="text-xs font-bold font-mono text-purple-400 uppercase tracking-wider mt-4 mb-1">${content}</h3>`;
      }

      // List bullets (- item)
      const listMatch = line.match(/^[-*]\s+(.*)$/);
      if (listMatch) {
        return `<li class="ml-4 list-disc text-neutral-400 font-mono text-xs my-1 leading-normal list-item">${parseInlineMarkdown(listMatch[1])}</li>`;
      }

      // Paragraph or divider
      if (trimmed === "") {
        return `<div class="h-3"></div>`;
      }

      // If it's already an HTML block element, do not wrap in p
      if (
        trimmed.startsWith("<div") ||
        trimmed.startsWith("</div") ||
        trimmed.startsWith("<iframe") ||
        trimmed.startsWith("<li") ||
        trimmed.startsWith("<h")
      ) {
        return line;
      }

      return `<p class="my-1 font-mono text-xs text-neutral-200 leading-relaxed">${parseInlineMarkdown(line)}</p>`;
    })
    .join("\n");
}

function parseInlineMarkdown(text: string): string {
  let result = text;
  // bold **text**
  result = result.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-bold font-sans">$1</strong>');
  // inline code `code`
  result = result.replace(/`(.*?)`/g, '<code class="bg-black/60 border border-white/10 px-1 py-0.5 rounded-sm text-emerald-400 font-mono text-[10px]">$1</code>');
  return result;
}
