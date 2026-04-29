/* ===== APP.JS — Main controller, event bindings ===== */

(() => {
  /* -------- DOM refs -------- */
  const $ = id => document.getElementById(id);
  const $$ = sel => document.querySelectorAll(sel);

  /* -------- Last generated output -------- */
  let lastOutput = '';
  let lastTool   = '';

  /* ======================================================
     SIDEBAR & TOOL SELECTION
  ====================================================== */
  function selectTool(toolName) {
    State.set('currentTool', toolName);

    $$('.nav-item').forEach(el => el.classList.remove('active'));
    const target = document.querySelector(`.nav-item[data-tool="${toolName}"]`);
    if (target) target.classList.add('active');

    const info = CONFIG.TOOLS[toolName] || {};
    $('wsTitle').textContent    = toolName + ' Generator';
    $('wsSubtitle').textContent = info.subtitle || '';
    $('breadcrumbCurrent').textContent = toolName;

    // Switch to generate tab
    switchTab('generate');
  }

  $$('.nav-item').forEach(btn => {
    btn.addEventListener('click', () => selectTool(btn.dataset.tool));
  });

  /* Sidebar collapse */
  $('sidebarToggle').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('collapsed');
  });

  /* Mobile sidebar */
  $('mobileMenuBtn').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('mobile-open');
  });

  /* ======================================================
     TAB SWITCHING
  ====================================================== */
  function switchTab(tabName) {
    State.set('currentTab', tabName);

    $$('.tab').forEach(t => t.classList.remove('active'));
    const tabBtn = document.querySelector(`.tab[data-tab="${tabName}"]`);
    if (tabBtn) tabBtn.classList.add('active');

    $$('.workspace').forEach(w => w.classList.remove('active'));
    const ws = $('ws-' + tabName);
    if (ws) ws.classList.add('active');

    if (tabName === 'history')   UI.renderHistory();
    if (tabName === 'templates') UI.renderTemplates();
    if (tabName === 'settings')  loadSettingsUI();
  }

  $$('.tab').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  /* ======================================================
     KEYWORD CHIPS
  ====================================================== */
  $$('#keywordChips .chip').forEach(chip => {
    chip.addEventListener('click', () => chip.classList.toggle('active'));
  });

  $('addKeywordBtn').addEventListener('click', addCustomKeyword);
  $('customKeyword').addEventListener('keydown', e => {
    if (e.key === 'Enter') addCustomKeyword();
  });

  function addCustomKeyword() {
    const val = $('customKeyword').value.trim();
    if (!val) return;

    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'chip active removable';
    chip.textContent = val;
    chip.addEventListener('click', () => chip.classList.toggle('active'));
    chip.addEventListener('dblclick', () => chip.remove());

    $('keywordChips').appendChild(chip);
    $('customKeyword').value = '';
    UI.toast('Keyword added. Double-click to remove.', 'success');
  }

  /* ======================================================
     CHAR COUNTER
  ====================================================== */
  $('mainPrompt').addEventListener('input', () => {
    const len = $('mainPrompt').value.length;
    $('charCounter').textContent = len + ' / 500';
    $('charCounter').style.color = len > 450 ? 'var(--accent-coral)' : '';
  });

  /* ======================================================
     GENERATE
  ====================================================== */
  $('generateBtn').addEventListener('click', runGeneration);

  async function runGeneration() {
    const prompt = $('mainPrompt').value.trim();
    if (!prompt) {
      $('mainPrompt').focus();
      UI.toast('Please enter a prompt first.', 'error');
      return;
    }

    const tool     = State.get('currentTool');
    const tone     = $('selTone').value;
    const length   = $('selLength').value;
    const audience = $('selAudience').value;
    const keywords = [...$$('#keywordChips .chip.active')].map(c => c.textContent.replace(' ×', '').trim());
    const brandVoice = $('brandVoice')?.value || '';

    State.set('isGenerating', true);
    UI.setGenerating(true);
    UI.setProgress(15);

    // Show placeholder output area
    $('outputBody').innerHTML = `
      <div class="output-placeholder">
        <div class="placeholder-icon" style="animation: blink 0.8s infinite">✦</div>
        <p>Generating your ${tool.toLowerCase()}…</p>
      </div>`;

    // Animate progress
    let prog = 15;
    const progInterval = setInterval(() => {
      prog = Math.min(prog + Math.random() * 8, 85);
      UI.setProgress(Math.round(prog));
    }, 400);

    try {
      const text = await API.generate({ tool, prompt, tone, length, audience, keywords, brandVoice });

      clearInterval(progInterval);
      UI.setProgress(100);
      setTimeout(() => UI.setProgress(null), 600);

      lastOutput = text;
      lastTool   = tool;

      UI.showOutput(text, tool);

      // Auto-save
      const settings = State.get('settings');
      if (settings.autoSave) {
        saveToHistory(prompt, text, tool);
      }

      UI.toast('Content generated!', 'success');

    } catch (err) {
      clearInterval(progInterval);
      UI.setProgress(null);

      $('outputBody').innerHTML = `
        <div class="output-placeholder">
          <div class="placeholder-icon" style="color:var(--accent-coral)">⚠</div>
          <p style="color:var(--accent-coral)">${UI.escHtml(err.message)}</p>
          <p class="placeholder-hint">Check your API key in Settings or try again.</p>
        </div>`;

      UI.toast('Generation failed: ' + err.message, 'error');
    }

    State.set('isGenerating', false);
    UI.setGenerating(false);
  }

  /* -------- Re-generate -------- */
  $('regenerateBtn').addEventListener('click', () => {
    if (!$('mainPrompt').value.trim()) { UI.toast('No prompt to regenerate.', 'error'); return; }
    runGeneration();
  });

  /* -------- Copy output -------- */
  $('copyBtn').addEventListener('click', () => {
    if (!lastOutput) { UI.toast('Nothing to copy yet.', 'error'); return; }
    navigator.clipboard.writeText(lastOutput).then(() => {
      UI.toast('Copied to clipboard!', 'success');
    }).catch(() => {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = lastOutput;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
      UI.toast('Copied!', 'success');
    });
  });

  /* -------- Manual save -------- */
  $('saveBtn').addEventListener('click', () => {
    if (!lastOutput) { UI.toast('Nothing to save.', 'error'); return; }
    saveToHistory($('mainPrompt').value, lastOutput, lastTool || State.get('currentTool'));
    UI.toast('Saved to history!', 'success');
  });

  /* -------- Save to history -------- */
  function saveToHistory(prompt, output, tool) {
    const toolInfo = CONFIG.TOOLS[tool] || {};
    const entry = {
      id:        Date.now() + '_' + Math.random().toString(36).slice(2, 7),
      tool,
      toolType:  toolInfo.type || 'blog',
      prompt:    prompt.slice(0, 80),
      output,
      wordCount: UI.countWords(output),
      timestamp: new Date().toISOString(),
    };
    State.addHistory(entry);
  }

  /* ======================================================
     HISTORY TAB EVENTS
  ====================================================== */
  $('historyList').addEventListener('click', e => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;

    const id     = btn.dataset.id;
    const action = btn.dataset.action;
    const history = State.get('history');
    const entry  = history.find(h => h.id === id);

    if (action === 'load' && entry) {
      $('mainPrompt').value = entry.prompt;
      lastOutput = entry.output;
      lastTool   = entry.tool;
      UI.showOutput(entry.output, entry.tool);
      selectTool(entry.tool);
      UI.toast('Loaded from history.', 'success');
    }

    if (action === 'delete') {
      State.removeHistory(id);
      UI.renderHistory();
      UI.toast('Removed from history.');
    }
  });

  $('clearHistoryBtn').addEventListener('click', () => {
    const settings = State.get('settings');
    if (settings.confirmClear && !confirm('Clear all generation history? This cannot be undone.')) return;
    State.clearHistory();
    UI.renderHistory();
    UI.toast('History cleared.');
  });

  /* ======================================================
     TEMPLATES TAB EVENTS
  ====================================================== */
  document.getElementById('templatesGrid').addEventListener('click', e => {
    const card = e.target.closest('.template-card');
    if (!card) return;
    const name = card.dataset.template;
    const tmpl = CONFIG.TEMPLATES.find(t => t.name === name);
    if (!tmpl) return;

    // Find matching tool
    const toolEntry = Object.entries(CONFIG.TOOLS).find(([k]) => k === tmpl.tag);
    if (toolEntry) selectTool(toolEntry[0]);

    $('mainPrompt').value = tmpl.prompt;
    $('selTone').value    = tmpl.tone;
    $('charCounter').textContent = tmpl.prompt.length + ' / 500';

    switchTab('generate');
    UI.toast('Template applied! Edit the prompt and generate.', 'success');
  });

  /* ======================================================
     SETTINGS
  ====================================================== */
  function loadSettingsUI() {
    const settings = State.get('settings');
    if ($('brandVoice'))   $('brandVoice').value   = settings.brandVoice   || '';
    if ($('defLang'))      $('defLang').value      = settings.language     || 'English';
    if ($('defModel'))     $('defModel').value     = settings.model        || CONFIG.DEFAULT_MODEL;
    if ($('tempSlider'))   $('tempSlider').value   = Math.round((settings.temperature || 0.7) * 100);
    if ($('tempVal'))      $('tempVal').textContent = settings.temperature  || '0.7';
    if ($('autoSave'))     $('autoSave').checked   = settings.autoSave     !== false;
    if ($('showWordCount'))$('showWordCount').checked = settings.showWordCount !== false;
    if ($('confirmClear')) $('confirmClear').checked = settings.confirmClear !== false;
    if ($('apiKeyInput'))  $('apiKeyInput').value  = State.get('apiKey')   || '';
    updateApiKeyStatus();
  }

  $('tempSlider').addEventListener('input', () => {
    const val = Math.round($('tempSlider').value) / 100;
    $('tempVal').textContent = val.toFixed(2);
  });

  $('saveSettingsBtn').addEventListener('click', () => {
    State.updateSettings({
      brandVoice:   $('brandVoice').value,
      language:     $('defLang').value,
      model:        $('defModel').value,
      temperature:  Math.round($('tempSlider').value) / 100,
      autoSave:     $('autoSave').checked,
      showWordCount:$('showWordCount').checked,
      confirmClear: $('confirmClear').checked,
    });
    UI.toast('Settings saved!', 'success');
  });

  $('saveApiKey').addEventListener('click', () => {
    const key = $('apiKeyInput').value.trim();
    State.set('apiKey', key);
    updateApiKeyStatus();
    UI.toast(key ? 'API key saved for this session.' : 'API key cleared.', 'success');
  });

  function updateApiKeyStatus() {
    const key = State.get('apiKey');
    const el = $('apiKeyStatus');
    if (!el) return;
    el.textContent = key
      ? '✓ Custom API key set (session only)'
      : 'No key set — using shared proxy.';
    el.style.color = key ? 'var(--accent2)' : '';
  }

  /* ======================================================
     THEME TOGGLE
  ====================================================== */
  $('themeToggle').addEventListener('click', () => {
    document.body.classList.toggle('light');
    const isLight = document.body.classList.contains('light');
    $('themeToggle').textContent = isLight ? '●' : '◑';
    UI.toast(isLight ? 'Light mode on.' : 'Dark mode on.');
  });

  /* ======================================================
     EXPORT CSV
  ====================================================== */
  $('exportBtn').addEventListener('click', () => {
    const history = State.get('history');
    if (!history.length) { UI.toast('No history to export.', 'error'); return; }

    const header = ['ID', 'Tool', 'Type', 'Prompt', 'Word Count', 'Timestamp'];
    const rows = history.map(h => [
      h.id,
      h.tool,
      h.toolType,
      '"' + h.prompt.replace(/"/g, '""') + '"',
      h.wordCount,
      h.timestamp,
    ]);

    const csv = [header, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = 'genai-studio-history.csv';
    a.click();
    URL.revokeObjectURL(url);
    UI.toast('History exported as CSV!', 'success');
  });

  /* ======================================================
     KEYBOARD SHORTCUTS
  ====================================================== */
  document.addEventListener('keydown', e => {
    // Ctrl/Cmd + Enter = Generate
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      if (!State.get('isGenerating')) runGeneration();
    }
    // Escape = close mobile sidebar
    if (e.key === 'Escape') {
      document.getElementById('sidebar').classList.remove('mobile-open');
    }
  });

  /* ======================================================
     INIT
  ====================================================== */
  function init() {
    selectTool(State.get('currentTool') || 'Blog Post');
    loadSettingsUI();
    UI.renderTemplates();

    // Restore last tab
    const lastTab = State.get('currentTab');
    if (lastTab && lastTab !== 'generate') switchTab(lastTab);
  }

  init();

})();
