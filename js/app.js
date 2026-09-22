(function(){
  const THEME_KEY = 'sports_theme';
  const state = {
    data: null,
    category: 'news',
    keyword: ''
  };

  function initTheme() {
    const saved = localStorage.getItem(THEME_KEY) || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', saved);
    document.getElementById('themeToggle').textContent = saved === 'dark' ? '☀️' : '🌙';
  }

  document.getElementById('themeToggle').addEventListener('click', () => {
    const cur = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', cur);
    localStorage.setItem(THEME_KEY, cur);
    document.getElementById('themeToggle').textContent = cur === 'dark' ? '☀️' : '🌙';
  });

  document.querySelectorAll('.cat-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.category = btn.dataset.tab;
      document.querySelectorAll('.tab-pane').forEach(p => p.style.display = 'none');
      const pane = document.getElementById('tab-' + state.category);
      if (pane) pane.style.display = 'block';
      render();
    });
  });

  function doSearch() {
    state.keyword = document.getElementById('searchInput').value.trim().toLowerCase();
    render();
  }
  document.getElementById('searchBtn').addEventListener('click', doSearch);
  document.getElementById('searchInput').addEventListener('keydown', e => { if (e.key === 'Enter') doSearch(); });
  document.getElementById('searchInput').addEventListener('input', () => {
    state.keyword = document.getElementById('searchInput').value.trim().toLowerCase();
    render();
  });

  function escapeHtml(s) {
    return String(s || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  function renderNews() {
    const data = (state.data && state.data.news) || [];
    let list = data;
    if (state.keyword) {
      list = list.filter(it => {
        const hay = (it.title + ' ' + it.category + ' ' + it.desc + ' ' + it.source).toLowerCase();
        return hay.includes(state.keyword);
      });
    }
    document.getElementById('totalCount').textContent = `共 ${list.length} 条资讯`;
    document.getElementById('emptyState').style.display = list.length === 0 ? 'block' : 'none';

    document.getElementById('newsGrid').innerHTML = list.map(it => `
      <article class="news-card" onclick="window.open('${escapeAttr(it.link || '#')}', '_blank', 'noopener')">
        <span class="news-cat ${it.category || '综合'}">${escapeHtml(it.category || '综合')}</span>
        <h3 class="news-title">${escapeHtml(it.title)}</h3>
        <p class="news-desc">${escapeHtml(it.desc || '')}</p>
        <div class="news-meta">
          <span>${escapeHtml(it.source || '')}</span>
          <span>${escapeHtml(it.date || '')}</span>
        </div>
      </article>
    `).join('');
  }

  function renderLeagueTable(containerId, list, columns, opts) {
    opts = opts || {};
    let filtered = list || [];
    if (state.keyword) {
      filtered = filtered.filter(it => {
        const hay = Object.values(it).join(' ').toLowerCase();
        return hay.includes(state.keyword);
      });
    }
    const totalCol = columns.length;
    const header = `<thead><tr>${columns.map(c => `<th>${c.label}</th>`).join('')}</tr></thead>`;
    const rows = filtered.map((it, i) => {
      const rank = i + 1;
      let posCls = 'rank-pos';
      if (rank === 1) posCls += ' p1';
      else if (rank === 2) posCls += ' p2';
      else if (rank === 3) posCls += ' p3';
      else if (opts.championZone && rank <= opts.championZone) posCls += ' champion-zone';
      else if (opts.relegation && rank > (filtered.length - opts.relegation)) posCls += ' relegation';

      const cells = columns.map(col => {
        if (col.key === 'pos') return `<td><span class="${posCls}">${rank}</span></td>`;
        if (col.key === 'team') {
          const initial = (it.team || '?').slice(0, 2);
          return `<td><div class="team-cell"><span class="team-logo">${escapeHtml(initial)}</span>${escapeHtml(it.team || '')}</div></td>`;
        }
        if (col.key === 'pts') return `<td><span class="points">${escapeHtml(it.pts || 0)}</span></td>`;
        if (col.key === 'form') {
          const form = (it.form || '').split('').slice(0, 5);
          return `<td><span class="form">${form.map(c => `<span class="${c}">${c}</span>`).join('')}</span></td>`;
        }
        if (col.key === 'player') {
          const initial = (it.player || '?').slice(0, 1);
          return `<td><div class="team-cell"><span class="team-logo">${escapeHtml(initial)}</span>${escapeHtml(it.player || '')}<span style="margin-left:8px;color:var(--text-secondary);font-weight:400;font-size:12px;">${escapeHtml(it.country || it.team || '')}</span></div></td>`;
        }
        if (col.key === 'match') {
          return `<td><div>${escapeHtml(it.home || '')} <strong style="color:var(--accent-red, #ef4444)">VS</strong> ${escapeHtml(it.away || '')}</div><div style="font-size:12px;color:var(--text-secondary);margin-top:2px;">${escapeHtml(it.league || '')}</div></td>`;
        }
        return `<td>${escapeHtml(it[col.key] || (col.def || ''))}</td>`;
      }).join('');
      return `<tr>${cells}</tr>`;
    }).join('');
    const el = document.getElementById(containerId);
    if (!el) return;
    el.innerHTML = header + '<tbody>' + rows + '</tbody>';
  }

  function render() {
    const d = state.data;
    if (!d) return;

    if (state.category === 'news') {
      renderNews();
      return;
    }
    document.getElementById('emptyState').style.display = 'none';
    const cols = {
      football: [
        { key: 'pos', label: '排名' },
        { key: 'team', label: '球队' },
        { key: 'played', label: '赛' },
        { key: 'win', label: '胜' },
        { key: 'draw', label: '平' },
        { key: 'lose', label: '负' },
        { key: 'gf', label: '进' },
        { key: 'ga', label: '失' },
        { key: 'gd', label: '净' },
        { key: 'pts', label: '积分' },
        { key: 'form', label: '近5场' }
      ],
      basketball: [
        { key: 'pos', label: '排名' },
        { key: 'team', label: '球队' },
        { key: 'played', label: '赛' },
        { key: 'win', label: '胜' },
        { key: 'lose', label: '负' },
        { key: 'winRate', label: '胜率%' },
        { key: 'pf', label: '得分' },
        { key: 'pa', label: '失分' },
        { key: 'gd', label: '净胜' },
        { key: 'streak', label: '近况' }
      ],
      tennis: [
        { key: 'pos', label: '排名' },
        { key: 'player', label: '球员' },
        { key: 'age', label: '年龄' },
        { key: 'points', label: '积分' },
        { key: 'tournaments', label: '参赛' },
        { key: 'best', label: '最高排名' }
      ],
      esports: [
        { key: 'pos', label: '排名' },
        { key: 'team', label: '战队' },
        { key: 'played', label: '赛' },
        { key: 'win', label: '胜' },
        { key: 'lose', label: '负' },
        { key: 'winRate', label: '胜率%' },
        { key: 'netWin', label: '净胜局' },
        { key: 'form', label: '近况' }
      ],
      schedule: [
        { key: 'date', label: '时间' },
        { key: 'match', label: '对阵' },
        { key: 'round', label: '轮次' },
        { key: 'venue', label: '场馆' },
        { key: 'status', label: '状态' }
      ]
    };

    if (state.category === 'football') {
      document.getElementById('totalCount').textContent = `共 ${((d.epl||[]).length + (d.laliga||[]).length + (d.csl||[]).length)} 支球队`;
      renderLeagueTable('eplTable', d.epl, cols.football, { championZone: 4, relegation: 3 });
      renderLeagueTable('laligaTable', d.laliga, cols.football, { championZone: 4, relegation: 3 });
      renderLeagueTable('cslTable', d.csl, cols.football, { championZone: 3, relegation: 2 });
    } else if (state.category === 'basketball') {
      document.getElementById('totalCount').textContent = `共 ${((d.nbaWest||[]).length + (d.nbaEast||[]).length + (d.cba||[]).length)} 支球队`;
      renderLeagueTable('nbaWest', d.nbaWest, cols.basketball, { championZone: 6 });
      renderLeagueTable('nbaEast', d.nbaEast, cols.basketball, { championZone: 6 });
      renderLeagueTable('cbaTable', d.cba, cols.basketball, { championZone: 4 });
    } else if (state.category === 'tennis') {
      document.getElementById('totalCount').textContent = `共 ${((d.atp||[]).length + (d.wta||[]).length)} 位球员`;
      renderLeagueTable('atpRank', d.atp, cols.tennis);
      renderLeagueTable('wtaRank', d.wta, cols.tennis);
    } else if (state.category === 'esports') {
      document.getElementById('totalCount').textContent = `共 ${((d.lpl||[]).length + (d.kpl||[]).length)} 支战队`;
      renderLeagueTable('lplTable', d.lpl, cols.esports, { championZone: 4 });
      renderLeagueTable('kplTable', d.kpl, cols.esports, { championZone: 4 });
    } else if (state.category === 'schedule') {
      document.getElementById('totalCount').textContent = `共 ${(d.schedule||[]).length} 场赛事`;
      renderLeagueTable('scheduleTable', d.schedule, cols.schedule);
    }
  }

  function escapeAttr(s) { return escapeHtml(s); }

  async function loadData() {
    const loading = document.getElementById('loadingState');
    loading.style.display = 'block';
    try {
      const base = (document.querySelector('base') && document.querySelector('base').href) || '';
      const res = await fetch(base + 'data/data.json', { cache: 'no-cache' });
      if (!res.ok) throw new Error('load failed');
      const data = await res.json();
      state.data = data;
      if (data.lastUpdate) document.getElementById('lastUpdate').textContent = '最后更新：' + data.lastUpdate;
      render();
    } catch (e) {
      document.getElementById('newsGrid').innerHTML = `<div class="empty-state"><p>⚠️ 数据加载失败，请稍后重试</p></div>`;
    } finally {
      loading.style.display = 'none';
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    loadData();
  });
})();
