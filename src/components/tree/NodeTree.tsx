import { useState } from 'react';
import { Box, Layers, FlaskConical, ChevronRight, ChevronDown, Plus, Trash2 } from 'lucide-react';
import clsx from 'clsx';
import type { ModuleNode, NodeType } from '../../types/imds';

const TYPE_ICON: Record<NodeType, typeof Box> = {
  component: Box,
  'semi-component': Layers,
  material: FlaskConical,
};

const TYPE_LABEL: Record<NodeType, string> = {
  component: 'Component',
  'semi-component': 'Semi-Component',
  material: 'Material',
};

function childTypeOptions(type: NodeType): NodeType[] {
  if (type === 'component') return ['semi-component', 'material'];
  if (type === 'semi-component') return ['semi-component', 'material'];
  return [];
}

interface RowProps {
  node: ModuleNode;
  depth: number;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAddChild: (parentId: string, type: NodeType) => void;
  onDelete: (id: string) => void;
  isRoot: boolean;
}

function TreeRow({ node, depth, selectedId, onSelect, onAddChild, onDelete, isRoot }: RowProps) {
  const [expanded, setExpanded] = useState(true);
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const Icon = TYPE_ICON[node.type];
  const hasChildren = node.children.length > 0;
  const addOptions = childTypeOptions(node.type);

  return (
    <div>
      <div
        className={clsx(
          'group flex items-center gap-1.5 px-2 py-1.5 rounded-md cursor-pointer text-sm',
          selectedId === node.id ? 'bg-brand-100 text-brand-900' : 'hover:bg-slate-100'
        )}
        style={{ paddingLeft: depth * 16 + 8 }}
        onClick={() => onSelect(node.id)}
      >
        <button
          className={clsx('shrink-0', !hasChildren && 'opacity-0')}
          onClick={(e) => {
            e.stopPropagation();
            setExpanded((v) => !v);
          }}
        >
          {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>
        <Icon size={15} className="shrink-0 text-brand-700" />
        <span className="truncate flex-1">{node.name || `Unnamed ${TYPE_LABEL[node.type]}`}</span>
        {!isRoot && <span className="text-xs text-slate-400 shrink-0">{node.percentOfParent.toFixed(1)}%</span>}

        <div className="relative shrink-0 opacity-0 group-hover:opacity-100 flex items-center gap-0.5">
          {addOptions.length > 0 && (
            <button
              title="Add child node"
              onClick={(e) => {
                e.stopPropagation();
                setAddMenuOpen((v) => !v);
              }}
              className="p-1 rounded hover:bg-brand-200"
            >
              <Plus size={14} />
            </button>
          )}
          {!isRoot && (
            <button
              title="Delete node"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(node.id);
              }}
              className="p-1 rounded hover:bg-red-200"
            >
              <Trash2 size={14} />
            </button>
          )}
          {addMenuOpen && (
            <div
              className="absolute right-0 top-7 z-10 bg-white border border-slate-200 rounded-md shadow-lg py-1 w-40"
              onClick={(e) => e.stopPropagation()}
            >
              {addOptions.map((type) => (
                <button
                  key={type}
                  className="block w-full text-left px-3 py-1.5 text-xs hover:bg-slate-100"
                  onClick={() => {
                    onAddChild(node.id, type);
                    setAddMenuOpen(false);
                  }}
                >
                  Add {TYPE_LABEL[type]}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      {expanded &&
        node.children.map((child) => (
          <TreeRow
            key={child.id}
            node={child}
            depth={depth + 1}
            selectedId={selectedId}
            onSelect={onSelect}
            onAddChild={onAddChild}
            onDelete={onDelete}
            isRoot={false}
          />
        ))}
    </div>
  );
}

export function NodeTree(props: Omit<RowProps, 'isRoot' | 'depth'>) {
  return (
    <div className="text-sm">
      <TreeRow {...props} depth={0} isRoot />
    </div>
  );
}
