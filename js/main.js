// Set current year in footer
document.getElementById('year').textContent = new Date().getFullYear();

// Language color map (subset)
const LANG_COLORS = {
  JavaScript: '#f1e05a',
  TypeScript: '#3178c6',
  Python:     '#3572A5',
  HTML:       '#e34c26',
  CSS:        '#563d7c',
  Shell:      '#89e051',
  Go:         '#00ADD8',
  Ruby:       '#701516',
};

function langColor(lang) {
  return LANG_COLORS[lang] || '#6c757d';
}

async function loadRepos() {
  const grid = document.getElementById('repo-grid');
  const GITHUB_USER = 'jonathanmh12';
  const MAX_REPOS = 6;

  try {
    const res = await fetch(
      `https://api.github.com/users/${GITHUB_USER}/repos?sort=updated&per_page=100`
    );

    if (!res.ok) throw new Error(`GitHub API returned ${res.status}`);

    const repos = await res.json();

    // Filter out forks, sort by stars then updated, take top N
    const featured = repos
      .filter(r => !r.fork && !r.archived)
      .sort((a, b) => {
        if (b.stargazers_count !== a.stargazers_count) {
          return b.stargazers_count - a.stargazers_count;
        }
        return new Date(b.updated_at) - new Date(a.updated_at);
      })
      .slice(0, MAX_REPOS);

    if (featured.length === 0) {
      grid.innerHTML = '<p class="loading">No public repositories found.</p>';
      return;
    }

    grid.innerHTML = featured.map(repo => `
      <article class="repo-card">
        <h3><a href="${repo.html_url}" target="_blank" rel="noopener">${repo.name}</a></h3>
        <p class="description">${repo.description || 'No description provided.'}</p>
        <div class="repo-meta">
          ${repo.language ? `<span>
            <span class="language-dot" style="background:${langColor(repo.language)}"></span>
            ${repo.language}
          </span>` : ''}
          <span>&#9733; ${repo.stargazers_count}</span>
          <span>&#10226; ${repo.forks_count}</span>
        </div>
      </article>
    `).join('');

  } catch (err) {
    console.error('Failed to load repos:', err);
    grid.innerHTML = `<p class="loading">
      Could not load repositories.
      <a href="https://github.com/${GITHUB_USER}?tab=repositories" target="_blank" rel="noopener">
        View on GitHub
      </a>
    </p>`;
  }
}

loadRepos();
