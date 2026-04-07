import { useState, useRef, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { Config } from '../types';
import type { PakTemplate, PakAssignments } from '../types/templates';
import { parseConfig } from '../utils/yamlParser';

interface Props {
  config: Config;
  templates: PakTemplate[];
  assignments: PakAssignments;
  onSave: (templates: PakTemplate[], assignments: PakAssignments) => void;
  onClose: () => void;
}

const TYPE_PALETTE = [
  '#4a7fa8', '#4a9a6a', '#9a6a4a', '#7a4a9a',
  '#9a4a7a', '#4a9a9a', '#9a9a4a', '#6a8a4a',
];

function typeColor(type: string): string {
  let hash = 0;
  for (let i = 0; i < type.length; i++) hash = (hash * 31 + type.charCodeAt(i)) & 0xffffff;
  return TYPE_PALETTE[Math.abs(hash) % TYPE_PALETTE.length];
}

export function TemplateDialog({ config, templates, assignments, onSave, onClose }: Props) {
  const [localTemplates, setLocalTemplates] = useState<PakTemplate[]>(templates);
  const [localAssignments, setLocalAssignments] = useState<PakAssignments>(assignments);
  const [selectedId, setSelectedId] = useState<string | null>(templates[0]?.id ?? null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [pakSearch, setPakSearch] = useState('');
  const [pendingFile, setPendingFile] = useState<{ text: string } | null>(null);
  const [pendingName, setPendingName] = useState('');
  const [pendingType, setPendingType] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedTemplate = localTemplates.find(t => t.id === selectedId) ?? null;
  const knownTypes = [...new Set(localTemplates.map(t => t.pakType).filter(Boolean))];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleFileSelected = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = evt => {
      const text = evt.target?.result as string;
      try {
        parseConfig(text);
        setPendingFile({ text });
        setPendingName(file.name.replace(/\.ya?ml$/i, ''));
        setPendingType(knownTypes[0] ?? '');
        setUploadError(null);
      } catch (err) {
        setUploadError(
          `Ошибка YAML: ${err instanceof Error ? err.message.slice(0, 100) : 'неверный формат'}`,
        );
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }, [knownTypes]);

  const handleConfirmUpload = useCallback(() => {
    if (!pendingFile || !pendingName.trim()) return;
    const newTpl: PakTemplate = {
      id: `tpl_${Date.now()}`,
      name: pendingName.trim(),
      pakType: pendingType.trim(),
      yaml: pendingFile.text,
      uploadedAt: new Date().toISOString(),
    };
    setLocalTemplates(prev => [...prev, newTpl]);
    setSelectedId(newTpl.id);
    setPendingFile(null);
    setPendingName('');
    setPendingType('');
  }, [pendingFile, pendingName, pendingType]);

  const handleCancelUpload = useCallback(() => {
    setPendingFile(null);
    setPendingName('');
    setPendingType('');
  }, []);

  const handleDelete = useCallback((id: string) => {
    setLocalTemplates(prev => prev.filter(t => t.id !== id));
    setLocalAssignments(prev => {
      const next = { ...prev };
      for (const pak of Object.keys(next)) {
        if (next[pak] === id) delete next[pak];
      }
      return next;
    });
    setSelectedId(prev => (prev === id ? (localTemplates.find(t => t.id !== id)?.id ?? null) : prev));
  }, [localTemplates]);

  const handleAssign = useCallback((pakId: string, templateId: string) => {
    setLocalAssignments(prev => {
      if (!templateId) {
        const next = { ...prev };
        delete next[pakId];
        return next;
      }
      return { ...prev, [pakId]: templateId };
    });
  }, []);

  const handleApplyToAll = useCallback((tplId: string) => {
    setLocalAssignments(prev => {
      const next = { ...prev };
      for (const pak of config.contour.paks) {
        if (!next[pak.id]) next[pak.id] = tplId;
      }
      return next;
    });
  }, [config.contour.paks]);

  const handleClearAll = useCallback(() => {
    setLocalAssignments({});
  }, []);

  const handleSave = () => {
    onSave(localTemplates, localAssignments);
    onClose();
  };

  const filteredPaks = config.contour.paks.filter(
    p => !pakSearch || p.name.toLowerCase().includes(pakSearch.toLowerCase()),
  );

  const assignedCount = (tplId: string) =>
    Object.values(localAssignments).filter(v => v === tplId).length;

  const totalAssigned = Object.keys(localAssignments).length;

  // ── styles ──────────────────────────────────────────────────────────────────

  const S = {
    overlay: {
      position: 'fixed' as const, inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    },
    dialog: {
      background: '#0f1729', border: '1px solid #1e2d47', borderRadius: 12,
      width: 880, maxWidth: '96vw', maxHeight: '88vh',
      display: 'flex', flexDirection: 'column' as const,
      boxShadow: '0 24px 72px rgba(0,0,0,0.75)',
    },
    header: {
      padding: '14px 20px', borderBottom: '1px solid #1e2d47',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
    },
    uploadBar: {
      padding: '10px 20px', borderBottom: '1px solid #1a2640',
      flexShrink: 0, minHeight: 46,
    },
    body: { flex: 1, display: 'flex', minHeight: 0 },
    leftPanel: {
      width: 270, flexShrink: 0, borderRight: '1px solid #1a2640',
      display: 'flex', flexDirection: 'column' as const, minHeight: 0,
    },
    rightPanel: {
      flex: 1, display: 'flex', flexDirection: 'column' as const, minHeight: 0,
    },
    footer: {
      padding: '12px 20px', borderTop: '1px solid #1e2d47',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
    },
  };

  return createPortal(
    <div style={S.overlay} onClick={onClose}>
      <div style={S.dialog} onClick={e => e.stopPropagation()}>

        {/* ── Header ─────────────────────────────────────────────────────────── */}
        <div style={S.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: '#4a7fa8', fontSize: 16 }}>⚙</span>
            <span style={{ color: '#c8d3e8', fontWeight: 600, fontSize: 14 }}>
              Настройка шаблонов ПАК
            </span>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#5C6B7F', cursor: 'pointer', fontSize: 20, lineHeight: 1, padding: '0 2px' }}
          >×</button>
        </div>

        {/* ── Upload bar ─────────────────────────────────────────────────────── */}
        <div style={S.uploadBar}>
          <input
            ref={fileInputRef}
            type="file"
            accept=".yaml,.yml"
            style={{ display: 'none' }}
            onChange={handleFileSelected}
          />

          {!pendingFile ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <button
                onClick={() => fileInputRef.current?.click()}
                style={{
                  padding: '6px 14px', borderRadius: 6,
                  background: '#162236', border: '1px solid #2a4060',
                  color: '#7cb4d4', fontSize: 12, cursor: 'pointer', fontWeight: 600,
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                }}
              >
                <span>↑</span> Загрузить шаблон (.yaml)
              </button>
              {uploadError && (
                <span style={{ color: '#e05252', fontSize: 11 }}>{uploadError}</span>
              )}
              <span style={{ marginLeft: 'auto', color: '#2d4060', fontSize: 10 }}>
                Формат: config.yaml — один ПАК в contour.paks[0]
              </span>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <span style={{ color: '#4a9a6a', fontSize: 11, fontWeight: 600 }}>✓ Файл валиден</span>
              <input
                value={pendingName}
                onChange={e => setPendingName(e.target.value)}
                placeholder="Название шаблона"
                autoFocus
                style={{
                  background: '#0a0e1c', border: '1px solid #2a4060',
                  borderRadius: 5, padding: '4px 10px',
                  color: '#c8d3e8', fontSize: 12, outline: 'none', width: 200,
                }}
              />
              <input
                value={pendingType}
                onChange={e => setPendingType(e.target.value)}
                list="pak-types-list"
                placeholder="Тип ПАК (SHD, DB, …)"
                style={{
                  background: '#0a0e1c', border: '1px solid #2a4060',
                  borderRadius: 5, padding: '4px 10px',
                  color: '#c8d3e8', fontSize: 12, outline: 'none', width: 170,
                }}
              />
              <datalist id="pak-types-list">
                {knownTypes.map(t => <option key={t} value={t} />)}
              </datalist>
              <button
                onClick={handleConfirmUpload}
                disabled={!pendingName.trim()}
                style={{
                  padding: '5px 14px', borderRadius: 6,
                  background: pendingName.trim() ? '#1a3a5a' : '#0f1f30',
                  border: '1px solid #2d5a8a',
                  color: pendingName.trim() ? '#7cb4d4' : '#3d5270',
                  fontSize: 12, cursor: pendingName.trim() ? 'pointer' : 'default', fontWeight: 600,
                }}
              >
                Добавить
              </button>
              <button
                onClick={handleCancelUpload}
                style={{
                  padding: '5px 14px', borderRadius: 6,
                  background: 'none', border: '1px solid #1e2d47',
                  color: '#5C6B7F', fontSize: 12, cursor: 'pointer',
                }}
              >
                Отмена
              </button>
            </div>
          )}
        </div>

        {/* ── Body ───────────────────────────────────────────────────────────── */}
        <div style={S.body}>

          {/* Left: template list */}
          <div style={S.leftPanel}>
            <div style={{
              padding: '8px 16px', color: '#3d5270', fontSize: 10,
              fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', flexShrink: 0,
            }}>
              Шаблоны ({localTemplates.length})
            </div>

            <div style={{ flex: 1, overflowY: 'auto' }}>
              {localTemplates.length === 0 && (
                <div style={{ padding: '32px 16px', color: '#2d4060', fontSize: 12, textAlign: 'center', lineHeight: 1.7 }}>
                  Шаблоны не загружены.<br />
                  <span style={{ color: '#3d5270' }}>Нажмите «Загрузить шаблон»</span>
                </div>
              )}

              {localTemplates.map(t => {
                const count = assignedCount(t.id);
                const isSelected = t.id === selectedId;
                const tColor = t.pakType ? typeColor(t.pakType) : '#3d5270';
                return (
                  <div
                    key={t.id}
                    onClick={() => setSelectedId(t.id)}
                    style={{
                      padding: '9px 14px', cursor: 'pointer',
                      background: isSelected ? '#1a2a40' : 'transparent',
                      borderLeft: `2px solid ${isSelected ? tColor : 'transparent'}`,
                      transition: 'background 0.12s',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                      {t.pakType && (
                        <span style={{
                          background: `${tColor}20`, border: `1px solid ${tColor}45`,
                          color: tColor, borderRadius: 3, padding: '0 5px',
                          fontSize: 9, fontWeight: 700, textTransform: 'uppercase',
                          letterSpacing: '0.04em', flexShrink: 0,
                        }}>
                          {t.pakType}
                        </span>
                      )}
                      <span style={{
                        color: isSelected ? '#c8d3e8' : '#8ba0bc',
                        fontSize: 12, fontWeight: 600,
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1,
                      }}>
                        {t.name}
                      </span>
                      <button
                        onClick={e => { e.stopPropagation(); handleDelete(t.id); }}
                        title="Удалить шаблон"
                        style={{
                          background: 'none', border: 'none', color: '#2d4060',
                          cursor: 'pointer', fontSize: 16, lineHeight: 1, padding: 0, flexShrink: 0,
                        }}
                      >×</button>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ color: count > 0 ? '#4a9a6a' : '#2d4060', fontSize: 10 }}>
                        {count > 0 ? `Назначен: ${count} ПАК` : 'Не назначен'}
                      </span>
                      {count === 0 && localTemplates.length > 0 && (
                        <button
                          onClick={e => { e.stopPropagation(); handleApplyToAll(t.id); }}
                          title="Применить ко всем незакреплённым ПАК"
                          style={{
                            background: 'none', border: 'none', color: '#3d5270',
                            fontSize: 10, cursor: 'pointer', padding: 0, textDecoration: 'underline',
                          }}
                        >
                          Применить ко всем
                        </button>
                      )}
                      <span style={{ color: '#2d4060', fontSize: 9, marginLeft: 'auto' }}>
                        {new Date(t.uploadedAt).toLocaleDateString('ru-RU')}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* YAML preview */}
            {selectedTemplate && (
              <div style={{ borderTop: '1px solid #1a2640', padding: '8px 14px', flexShrink: 0 }}>
                <div style={{
                  color: '#3d5270', fontSize: 10, fontWeight: 700,
                  textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4,
                }}>
                  YAML (preview)
                </div>
                <pre style={{
                  color: '#4a5f7a', fontSize: 9, fontFamily: 'monospace', lineHeight: 1.4,
                  maxHeight: 90, overflowY: 'auto', background: '#080c18', borderRadius: 4,
                  padding: '5px 7px', margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all',
                }}>
                  {selectedTemplate.yaml.slice(0, 500)}
                  {selectedTemplate.yaml.length > 500 ? '\n…' : ''}
                </pre>
              </div>
            )}
          </div>

          {/* Right: PAK assignment list */}
          <div style={S.rightPanel}>
            <div style={{
              padding: '8px 16px', borderBottom: '1px solid #1a2640',
              display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0,
            }}>
              <span style={{
                color: '#3d5270', fontSize: 10, fontWeight: 700,
                textTransform: 'uppercase', letterSpacing: '0.07em', flexShrink: 0,
              }}>
                Назначения ({totalAssigned}/{config.contour.paks.length})
              </span>
              <input
                value={pakSearch}
                onChange={e => setPakSearch(e.target.value)}
                placeholder="Поиск ПАК…"
                style={{
                  flex: 1, background: '#0a0e1c', border: '1px solid #1e2d47',
                  borderRadius: 5, padding: '4px 10px',
                  color: '#8ba0bc', fontSize: 12, outline: 'none',
                }}
              />
              {totalAssigned > 0 && (
                <button
                  onClick={handleClearAll}
                  style={{
                    background: 'none', border: 'none', color: '#5C6B7F',
                    fontSize: 11, cursor: 'pointer', flexShrink: 0, textDecoration: 'underline',
                  }}
                >
                  Сбросить все
                </button>
              )}
            </div>

            <div style={{ flex: 1, overflowY: 'auto' }}>
              {filteredPaks.map(pak => {
                const tplId = localAssignments[pak.id] ?? '';
                const tpl = localTemplates.find(t => t.id === tplId);
                const tColor = tpl?.pakType ? typeColor(tpl.pakType) : undefined;
                return (
                  <div key={pak.id} style={{
                    padding: '7px 16px', borderBottom: '1px solid #0d1526',
                    display: 'flex', alignItems: 'center', gap: 10,
                  }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span style={{
                        color: '#8ba0bc', fontSize: 12,
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block',
                      }}>
                        {pak.name}
                      </span>
                      {tpl && (
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 3, marginTop: 2,
                          background: `${tColor ?? '#4a7fa8'}18`,
                          border: `1px solid ${tColor ?? '#4a7fa8'}35`,
                          color: tColor ?? '#4a7fa8',
                          borderRadius: 3, padding: '0 5px',
                          fontSize: 9, fontWeight: 700,
                        }}>
                          {tpl.pakType ? `[${tpl.pakType}] ` : ''}{tpl.name}
                        </span>
                      )}
                    </div>

                    <select
                      value={tplId}
                      onChange={e => handleAssign(pak.id, e.target.value)}
                      style={{
                        background: '#0a0e1c',
                        border: `1px solid ${tpl ? (tColor ?? '#2d4a6a') : '#1e2d47'}`,
                        borderRadius: 5, padding: '4px 8px',
                        color: tpl ? (tColor ?? '#7cb4d4') : '#5C6B7F',
                        fontSize: 11, cursor: 'pointer', outline: 'none',
                        minWidth: 190, flexShrink: 0,
                      }}
                    >
                      <option value="">— не назначен —</option>
                      {localTemplates.map(t => (
                        <option key={t.id} value={t.id}>
                          {t.pakType ? `[${t.pakType}] ` : ''}{t.name}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Footer ─────────────────────────────────────────────────────────── */}
        <div style={S.footer}>
          <span style={{ color: '#2d4060', fontSize: 11 }}>
            {totalAssigned > 0
              ? `${totalAssigned} из ${config.contour.paks.length} ПАК используют шаблон`
              : 'Шаблоны не назначены — используется основной config.yaml'}
          </span>
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={onClose}
              style={{
                padding: '7px 18px', borderRadius: 6,
                background: 'none', border: '1px solid #1e2d47',
                color: '#5C6B7F', fontSize: 12, cursor: 'pointer',
              }}
            >
              Отмена
            </button>
            <button
              onClick={handleSave}
              style={{
                padding: '7px 20px', borderRadius: 6,
                background: '#1a3a5a', border: '1px solid #2d5a8a',
                color: '#7cb4d4', fontSize: 12, cursor: 'pointer', fontWeight: 600,
              }}
            >
              Применить
            </button>
          </div>
        </div>

      </div>
    </div>,
    document.body,
  );
}
