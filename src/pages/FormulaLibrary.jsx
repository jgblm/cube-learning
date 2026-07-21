import { useRef, useState, useEffect, useCallback } from 'react';
import CubeViewer from '../components/CubeViewer.jsx';
import { formulasApi } from '../lib/api.js';
import { useLang, tx } from '../i18n/LangContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const EMPTY_FORM = {
  id: '',
  name_zh: '',
  name_en: '',
  category: 'Custom',
  initial_state: '',
  algorithm: '',
  state_features_zh: '',
  state_features_en: '',
  tags: '',
  creator: 'system',
  description_zh: '',
  description_en: '',
};

function FormulaCard({ formula, lang, isSelected, onSelect, onPlay, onEdit, onDelete }) {
  return (
    <div className={`formula-card${isSelected ? ' selected' : ''}`} onClick={() => onSelect(formula)}>
      <div className="name">
        {tx(formula.name, lang)}
        <small>{formula.category}</small>
      </div>
      {formula.tags.length > 0 && (
        <div className="tag-row">
          {formula.tags
            // Hide the 45-char dataFl string — it's used for 3D rendering, not display.
            .filter((t) => !(t.length === 45 && /^[lgwo]+$/.test(t)))
            .map((t) => (
              <span key={t} className="tag">
                {t}
              </span>
            ))}
        </div>
      )}
      {tx(formula.state_features, lang) && (
        <p className="state-feature">{tx(formula.state_features, lang)}</p>
      )}
      <code>{formula.algorithm}</code>
      {tx(formula.description, lang) && <p className="formula-desc">{tx(formula.description, lang)}</p>}
      <div className="card-actions" onClick={(e) => e.stopPropagation()}>
        <button className="play-btn" onClick={() => onPlay(formula)}>
          {tx({ zh: '播放', en: 'Play' }, lang)}
        </button>
        <button className="ghost-btn" onClick={() => onEdit(formula)}>
          {tx({ zh: '编辑', en: 'Edit' }, lang)}
        </button>
        <button className="ghost-btn danger" onClick={() => onDelete(formula)}>
          {tx({ zh: '删除', en: 'Delete' }, lang)}
        </button>
      </div>
    </div>
  );
}

function FormulaForm({ initial, lang, onCancel, onSubmit, saving }) {
  const [form, setForm] = useState(initial);
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>{tx({ zh: '公式详情', en: 'Formula details' }, lang)}</h3>
        <div className="form-grid">
          <label className="form-field">
            <span>{tx({ zh: 'ID（唯一）', en: 'ID (unique)' }, lang)}</span>
            <input value={form.id} onChange={set('id')} placeholder="oll-dot" />
          </label>
          <label className="form-field">
            <span>{tx({ zh: '分类', en: 'Category' }, lang)}</span>
            <input value={form.category} onChange={set('category')} placeholder="OLL / PLL / Lesson" />
          </label>
          <label className="form-field">
            <span>{tx({ zh: '名称（中）', en: 'Name (zh)' }, lang)}</span>
            <input value={form.name_zh} onChange={set('name_zh')} />
          </label>
          <label className="form-field">
            <span>{tx({ zh: '名称（英）', en: 'Name (en)' }, lang)}</span>
            <input value={form.name_en} onChange={set('name_en')} />
          </label>
          <label className="form-field form-field-wide">
            <span>{tx({ zh: '魔方公式', en: 'Algorithm' }, lang)} *</span>
            <input value={form.algorithm} onChange={set('algorithm')} placeholder="R U R' U'" />
          </label>
          <label className="form-field form-field-wide">
            <span>{tx({ zh: '初始状态（step 步序）', en: 'Initial state (setup moves)' }, lang)}</span>
            <input value={form.initial_state} onChange={set('initial_state')} placeholder="F U R U' R' F'" />
          </label>
          <label className="form-field form-field-wide">
            <span>{tx({ zh: '适用状态特点（中）', en: 'State features (zh)' }, lang)}</span>
            <input value={form.state_features_zh} onChange={set('state_features_zh')} />
          </label>
          <label className="form-field form-field-wide">
            <span>{tx({ zh: '适用状态特点（英）', en: 'State features (en)' }, lang)}</span>
            <input value={form.state_features_en} onChange={set('state_features_en')} />
          </label>
          <label className="form-field form-field-wide">
            <span>{tx({ zh: '标签（逗号分隔）', en: 'Tags (comma separated)' }, lang)}</span>
            <input value={form.tags} onChange={set('tags')} placeholder="OLL, cross" />
          </label>
          <label className="form-field">
            <span>{tx({ zh: '创建者', en: 'Creator' }, lang)}</span>
            <input value={form.creator} readOnly onChange={set('creator')} />
          </label>
          <label className="form-field form-field-wide">
            <span>{tx({ zh: '描述（中）', en: 'Description (zh)' }, lang)}</span>
            <textarea value={form.description_zh} onChange={set('description_zh')} rows={2} />
          </label>
          <label className="form-field form-field-wide">
            <span>{tx({ zh: '描述（英）', en: 'Description (en)' }, lang)}</span>
            <textarea value={form.description_en} onChange={set('description_en')} rows={2} />
          </label>
        </div>
        <div className="modal-actions">
          <button className="ghost-btn" onClick={onCancel} disabled={saving}>
            {tx({ zh: '取消', en: 'Cancel' }, lang)}
          </button>
          <button className="ctrl-btn primary" onClick={() => onSubmit(form)} disabled={saving}>
            {saving ? tx({ zh: '保存中…', en: 'Saving…' }, lang) : tx({ zh: '保存', en: 'Save' }, lang)}
          </button>
        </div>
      </div>
    </div>
  );
}

/** Login card shown when the user is not authenticated. */
function AuthScreen({ lang, onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await onLogin({ username, password });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-card">
      <h1 className="section-title">{tx({ zh: '公式库', en: 'Formula Library' }, lang)}</h1>
      <p className="section-sub">
        {tx(
          { zh: '请登录后查看与编辑公式库。', en: 'Please sign in to view and edit the formula library.' },
          lang,
        )}
      </p>
      <form className="auth-form" onSubmit={submit}>
        <input
          type="text"
          autoComplete="username"
          placeholder={tx({ zh: '用户名', en: 'Username' }, lang)}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          autoComplete="current-password"
          placeholder={tx({ zh: '密码', en: 'Password' }, lang)}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <div className="note error">{error}</div>}
        <button className="ctrl-btn primary auth-submit" type="submit" disabled={busy}>
          {busy
            ? tx({ zh: '处理中…', en: 'Please wait…' }, lang)
            : tx({ zh: '登录', en: 'Login' }, lang)}
        </button>
      </form>
    </div>
  );
}

export default function FormulaLibrary() {
  const { lang } = useLang();
  const { user, loading, login, logout } = useAuth();
  const viewerRef = useRef(null);

  const [formulas, setFormulas] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCat, setActiveCat] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState(null);
  const [formOpen, setFormOpen] = useState(null); // null | 'new' | formula
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoadingData(true);
    setError(null);
    try {
      const [fRes, cRes] = await Promise.all([
        formulasApi.list(activeCat || undefined),
        formulasApi.categories(),
      ]);
      setFormulas(fRes.formulas || []);
      setCategories(cRes.categories || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoadingData(false);
    }
  }, [activeCat]);

  const reimport = async () => {
    if (!window.confirm(tx({ zh: '将清空所有公式并重新导入，确认？', en: 'This will clear all formulas and re-import. Continue?' }, lang))) return;
    setLoadingData(true);
    setError(null);
    try {
      await formulasApi.reseed();
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoadingData(false);
    }
  };

  // Load formulas only once the user is authenticated.
  useEffect(() => {
    if (user) load();
  }, [user, load]);

  const selectFormula = (f) => {
    setSelectedId(f.id);
    const viewer = viewerRef.current;
    if (!viewer) return;
    viewer.reset();
    // Render the dataFl colour map (45-char sticker palette) onto the solved
    // cube: each of the 5×9 stickers is recoloured to the colour it would
    // have in the F2L case state, and 'l' cells become dim. Setup moves are
    // NOT executed — dataFl alone is enough to paint the case-state picture.
    const dataFl = f.tags.find((t) => t.length === 45 && /^[lgwo]+$/.test(t));
    if (dataFl) viewer.applyDataFl(dataFl);
  };

  const playFormula = (f) => {
    const viewer = viewerRef.current;
    if (!viewer) return;
    viewer.play(f.algorithm);
  };

  const openNew = () => setFormOpen({ ...EMPTY_FORM, creator: user?.username || 'system' });
  const openEdit = (f) =>
    setFormOpen({
      id: f.id,
      name_zh: f.name.zh,
      name_en: f.name.en,
      category: f.category,
      initial_state: f.initial_state,
      algorithm: f.algorithm,
      state_features_zh: f.state_features.zh,
      state_features_en: f.state_features.en,
      tags: f.tags.join(', '),
      creator: f.creator,
      description_zh: f.description.zh,
      description_en: f.description.en,
    });

  const submitForm = async (form) => {
    setSaving(true);
    try {
      const payload = {
        id: form.id.trim(),
        name: { zh: form.name_zh.trim(), en: form.name_en.trim() },
        category: form.category.trim(),
        initial_state: form.initial_state.trim(),
        algorithm: form.algorithm.trim(),
        state_features: { zh: form.state_features_zh.trim(), en: form.state_features_en.trim() },
        tags: form.tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        creator: form.creator.trim() || user?.username || 'system',
        description: { zh: form.description_zh.trim(), en: form.description_en.trim() },
      };
      const isEdit = formOpen && formOpen.id && formulas.some((f) => f.id === formOpen.id);
      if (isEdit) {
        await formulasApi.update(formOpen.id, payload);
      } else {
        await formulasApi.create(payload);
      }
      setFormOpen(null);
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const deleteFormula = async (f) => {
    if (!window.confirm(tx({ zh: `删除公式「${tx(f.name, lang)}」？`, en: `Delete "${tx(f.name, lang)}"?` }, lang))) {
      return;
    }
    try {
      await formulasApi.remove(f.id);
      if (selectedId === f.id) setSelectedId(null);
      await load();
    } catch (e) {
      setError(e.message);
    }
  };

  const filtered = activeCat ? formulas : formulas;
  const grouped = categories.length
    ? categories
    : Array.from(new Set(formulas.map((f) => f.category))).filter(Boolean);

  if (loading) {
    return <p className="section-sub">{tx({ zh: '加载中…', en: 'Loading…' }, lang)}</p>;
  }

  if (!user) {
    return <AuthScreen lang={lang} onLogin={login} />;
  }

  return (
    <div>
      <div className="lib-head">
        <div>
          <h1 className="section-title">{tx({ zh: '公式库', en: 'Formula Library' }, lang)}</h1>
          <p className="section-sub">
            {tx(
              {
                zh: 'F2L 公式已分类存入 Cloudflare D1。点击卡片在 3D 魔方上预览与播放，也可新增、编辑、删除。',
                en: 'F2L formulas are categorized in Cloudflare D1. Click a card to preview and play on the 3D cube, or add / edit / delete entries.',
              },
              lang,
            )}
          </p>
        </div>
        <div className="lib-head-actions">
          <span className="lib-user">{user.username}</span>
          <button className="ghost-btn" onClick={logout}>
            {tx({ zh: '退出', en: 'Logout' }, lang)}
          </button>
          <button className="ghost-btn" onClick={reimport} disabled={loadingData}>
            {tx({ zh: '重新导入', en: 'Re-import' }, lang)}
          </button>
          <button className="ctrl-btn primary" onClick={openNew}>
            {tx({ zh: '新增公式', en: 'New Formula' }, lang)}
          </button>
        </div>
      </div>

      {error && <div className="note error">{error}</div>}

      <CubeViewer ref={viewerRef} />

      <div className="lib-layout">
        <aside className="lib-sidebar">
          <button
            className={`cat-chip${activeCat === null ? ' active' : ''}`}
            onClick={() => setActiveCat(null)}
          >
            {tx({ zh: '全部', en: 'All' }, lang)}
          </button>
          {grouped.map((c) => (
            <button
              key={c}
              className={`cat-chip${activeCat === c ? ' active' : ''}`}
              onClick={() => setActiveCat(c)}
            >
              {c}
            </button>
          ))}
        </aside>

        <section className="lib-list">
          {loadingData ? (
            <p className="section-sub">{tx({ zh: '加载中…', en: 'Loading…' }, lang)}</p>
          ) : filtered.length === 0 ? (
            <p className="section-sub">{tx({ zh: '暂无公式', en: 'No formulas yet.' }, lang)}</p>
          ) : (
            <div className="formula-grid">
              {filtered.map((f) => (
                <FormulaCard
                  key={f.id}
                  formula={f}
                  lang={lang}
                  isSelected={selectedId === f.id}
                  onSelect={selectFormula}
                  onPlay={playFormula}
                  onEdit={openEdit}
                  onDelete={deleteFormula}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      {formOpen && (
        <FormulaForm
          initial={formOpen}
          lang={lang}
          saving={saving}
          onCancel={() => setFormOpen(null)}
          onSubmit={submitForm}
        />
      )}
    </div>
  );
}
