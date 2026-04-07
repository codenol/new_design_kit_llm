import { useState, useMemo } from 'react';
import { parseConfig } from './utils/yamlParser';
import { useHealthCalculator } from './hooks/useHealthCalculator';
import { Sidebar } from './components/Sidebar';
import { BreadcrumbBar } from './components/BreadcrumbBar';
import { PAKSection } from './components/PAKSection';
import { FilterBar } from './components/FilterBar';
import { TemplateDialog } from './components/TemplateDialog';
import { loadTemplates, saveTemplates, loadAssignments, saveAssignments } from './utils/templateStore';
import { applyTemplatesToConfig } from './utils/applyTemplates';
import type { PakTemplate, PakAssignments } from './types/templates';
import type { Status } from './types';
import { colors, typography, layout } from './styles/tokens';
import configYaml from './data/config.yaml?raw';

const baseConfig = parseConfig(configYaml);

export default function App() {
  const [templates, setTemplates] = useState<PakTemplate[]>(() => loadTemplates());
  const [assignments, setAssignments] = useState<PakAssignments>(() => loadAssignments());
  const [isTemplateOpen, setIsTemplateOpen] = useState(false);

  const effectiveConfig = useMemo(
    () => applyTemplatesToConfig(baseConfig, assignments, templates),
    [templates, assignments],
  );

  const { health } = useHealthCalculator(effectiveConfig);
  const [activeStatuses, setActiveStatuses] = useState<Status[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleStatus = (s: Status) =>
    setActiveStatuses(prev =>
      prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s],
    );

  const handleSaveTemplates = (newTemplates: PakTemplate[], newAssignments: PakAssignments) => {
    setTemplates(newTemplates);
    setAssignments(newAssignments);
    saveTemplates(newTemplates);
    saveAssignments(newAssignments);
  };

  const visiblePaks = health.paks
    .filter(p => activeStatuses.length === 0 || activeStatuses.includes(p.status))
    .filter(p => !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
        background: colors.bg.sidebar,
      }}
    >
      {/* Sidebar */}
      <Sidebar />

      {/* Content column */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          background: colors.bg.content,
          minWidth: 0,
        }}
      >
        <BreadcrumbBar />

        <FilterBar
          paks={health.paks}
          activeStatuses={activeStatuses}
          onToggleStatus={toggleStatus}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onOpenTemplates={() => setIsTemplateOpen(true)}
        />

        <main
          style={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            padding: `${layout.contentPadV}px ${layout.contentPadH}px`,
          }}
        >
          {visiblePaks.length > 0 ? (
            visiblePaks.map(pak => <PAKSection key={pak.id} pak={pak} />)
          ) : (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '80px 0',
                color: colors.text.ghost,
              }}
            >
              <div style={{ fontSize: typography.size.hero, marginBottom: 12 }}>○</div>
              <div style={{ fontSize: typography.size.lg, color: colors.text.dim }}>
                Нет ПАК с таким статусом
              </div>
              <button
                onClick={() => { setActiveStatuses([]); setSearchQuery(''); }}
                style={{
                  marginTop: 12,
                  color: colors.text.label,
                  background: 'none',
                  border: 'none',
                  fontSize: typography.size.base,
                  cursor: 'pointer',
                  textDecoration: 'underline',
                }}
              >
                Показать все
              </button>
            </div>
          )}
        </main>
      </div>

      {isTemplateOpen && (
        <TemplateDialog
          config={baseConfig}
          templates={templates}
          assignments={assignments}
          onSave={handleSaveTemplates}
          onClose={() => setIsTemplateOpen(false)}
        />
      )}
    </div>
  );
}
