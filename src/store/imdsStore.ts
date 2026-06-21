import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CompanyProfile, Module, ModuleNode, ModuleStatus, NodeType, SubstanceEntry } from '../types/imds';
import { generateId, generateMdsId } from '../engine/idGenerator';

function mapNode(root: ModuleNode, nodeId: string, updater: (node: ModuleNode) => ModuleNode): ModuleNode {
  if (root.id === nodeId) return updater(root);
  return { ...root, children: root.children.map((c) => mapNode(c, nodeId, updater)) };
}

function removeNode(root: ModuleNode, nodeId: string): ModuleNode {
  return {
    ...root,
    children: root.children.filter((c) => c.id !== nodeId).map((c) => removeNode(c, nodeId)),
  };
}

function addChild(root: ModuleNode, parentId: string, child: ModuleNode): ModuleNode {
  if (root.id === parentId) return { ...root, children: [...root.children, child] };
  return { ...root, children: root.children.map((c) => addChild(c, parentId, child)) };
}

export function createEmptyNode(type: NodeType, name: string): ModuleNode {
  return {
    id: generateId('node'),
    type,
    name,
    percentOfParent: type === 'material' ? 100 : 0,
    children: [],
    substances: type === 'material' ? [] : undefined,
  };
}

interface ImdsState {
  modules: Module[];
  companyProfile: CompanyProfile;

  createModule: (input: {
    name: string;
    rootNode: ModuleNode;
    aiGenerated: boolean;
    sourceDescription?: string;
  }) => string;
  deleteModule: (moduleId: string) => void;
  duplicateModule: (moduleId: string) => void;
  updateModuleMeta: (moduleId: string, patch: Partial<Pick<Module, 'name' | 'status' | 'recipientName' | 'recipientImdsId' | 'companyName' | 'companyImdsId'>>) => void;
  setModuleStatus: (moduleId: string, status: ModuleStatus) => void;
  replaceRootNode: (moduleId: string, rootNode: ModuleNode, meta?: { aiGenerated?: boolean; sourceDescription?: string }) => void;

  addNode: (moduleId: string, parentNodeId: string, type: NodeType, name: string) => void;
  updateNode: (moduleId: string, nodeId: string, patch: Partial<ModuleNode>) => void;
  removeNodeById: (moduleId: string, nodeId: string) => void;

  addSubstance: (moduleId: string, nodeId: string, substance: SubstanceEntry) => void;
  updateSubstance: (moduleId: string, nodeId: string, substanceId: string, patch: Partial<SubstanceEntry>) => void;
  removeSubstance: (moduleId: string, nodeId: string, substanceId: string) => void;

  updateCompanyProfile: (patch: Partial<CompanyProfile>) => void;
}

function touch(module: Module): Module {
  return { ...module, updatedAt: new Date().toISOString() };
}

export const useImdsStore = create<ImdsState>()(
  persist(
    (set, get) => ({
      modules: [],
      companyProfile: {
        companyName: 'My Company GmbH',
        companyImdsId: 'IMDS-00000',
        defaultRecipientName: 'OEM Customer',
        defaultRecipientImdsId: 'IMDS-99999',
      },

      createModule: ({ name, rootNode, aiGenerated, sourceDescription }) => {
        const profile = get().companyProfile;
        const now = new Date().toISOString();
        const module: Module = {
          id: generateId('mod'),
          mdsId: generateMdsId(),
          name,
          version: 1,
          status: 'draft',
          companyName: profile.companyName,
          companyImdsId: profile.companyImdsId,
          recipientName: profile.defaultRecipientName,
          recipientImdsId: profile.defaultRecipientImdsId,
          createdAt: now,
          updatedAt: now,
          rootNode,
          aiGenerated,
          sourceDescription,
        };
        set((state) => ({ modules: [module, ...state.modules] }));
        return module.id;
      },

      deleteModule: (moduleId) => set((state) => ({ modules: state.modules.filter((m) => m.id !== moduleId) })),

      duplicateModule: (moduleId) =>
        set((state) => {
          const original = state.modules.find((m) => m.id === moduleId);
          if (!original) return state;
          const now = new Date().toISOString();
          const copy: Module = {
            ...original,
            id: generateId('mod'),
            mdsId: generateMdsId(),
            name: `${original.name} (Copy)`,
            version: 1,
            status: 'draft',
            createdAt: now,
            updatedAt: now,
          };
          return { modules: [copy, ...state.modules] };
        }),

      updateModuleMeta: (moduleId, patch) =>
        set((state) => ({
          modules: state.modules.map((m) => (m.id === moduleId ? touch({ ...m, ...patch }) : m)),
        })),

      setModuleStatus: (moduleId, status) =>
        set((state) => ({
          modules: state.modules.map((m) => (m.id === moduleId ? touch({ ...m, status }) : m)),
        })),

      replaceRootNode: (moduleId, rootNode, meta) =>
        set((state) => ({
          modules: state.modules.map((m) =>
            m.id === moduleId
              ? touch({
                  ...m,
                  rootNode,
                  aiGenerated: meta?.aiGenerated ?? m.aiGenerated,
                  sourceDescription: meta?.sourceDescription ?? m.sourceDescription,
                })
              : m
          ),
        })),

      addNode: (moduleId, parentNodeId, type, name) =>
        set((state) => ({
          modules: state.modules.map((m) =>
            m.id === moduleId ? touch({ ...m, rootNode: addChild(m.rootNode, parentNodeId, createEmptyNode(type, name)) }) : m
          ),
        })),

      updateNode: (moduleId, nodeId, patch) =>
        set((state) => ({
          modules: state.modules.map((m) =>
            m.id === moduleId
              ? touch({ ...m, rootNode: mapNode(m.rootNode, nodeId, (n) => ({ ...n, ...patch })) })
              : m
          ),
        })),

      removeNodeById: (moduleId, nodeId) =>
        set((state) => ({
          modules: state.modules.map((m) =>
            m.id === moduleId ? touch({ ...m, rootNode: removeNode(m.rootNode, nodeId) }) : m
          ),
        })),

      addSubstance: (moduleId, nodeId, substance) =>
        set((state) => ({
          modules: state.modules.map((m) =>
            m.id === moduleId
              ? touch({
                  ...m,
                  rootNode: mapNode(m.rootNode, nodeId, (n) => ({
                    ...n,
                    substances: [...(n.substances ?? []), substance],
                  })),
                })
              : m
          ),
        })),

      updateSubstance: (moduleId, nodeId, substanceId, patch) =>
        set((state) => ({
          modules: state.modules.map((m) =>
            m.id === moduleId
              ? touch({
                  ...m,
                  rootNode: mapNode(m.rootNode, nodeId, (n) => ({
                    ...n,
                    substances: (n.substances ?? []).map((s) => (s.id === substanceId ? { ...s, ...patch } : s)),
                  })),
                })
              : m
          ),
        })),

      removeSubstance: (moduleId, nodeId, substanceId) =>
        set((state) => ({
          modules: state.modules.map((m) =>
            m.id === moduleId
              ? touch({
                  ...m,
                  rootNode: mapNode(m.rootNode, nodeId, (n) => ({
                    ...n,
                    substances: (n.substances ?? []).filter((s) => s.id !== substanceId),
                  })),
                })
              : m
          ),
        })),

      updateCompanyProfile: (patch) => set((state) => ({ companyProfile: { ...state.companyProfile, ...patch } })),
    }),
    { name: 'imds-module-creator' }
  )
);
