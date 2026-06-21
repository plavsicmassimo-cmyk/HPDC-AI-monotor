import type { Module, ModuleNode } from '../types/imds';

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function nodeToXml(node: ModuleNode, indent: string): string {
  const lines: string[] = [];
  const tag = node.type === 'component' ? 'Component' : node.type === 'semi-component' ? 'SemiComponent' : 'Material';
  lines.push(
    `${indent}<${tag} id="${escapeXml(node.id)}" name="${escapeXml(node.name)}" percentOfParent="${node.percentOfParent}"${
      node.massGrams !== undefined ? ` massGrams="${node.massGrams}"` : ''
    }>`
  );
  if (node.substances && node.substances.length > 0) {
    lines.push(`${indent}  <Substances>`);
    for (const s of node.substances) {
      lines.push(
        `${indent}    <Substance casNumber="${escapeXml(s.casNumber)}" name="${escapeXml(s.name)}" massPercent="${s.massPercent}" svhc="${s.svhc}" rohsRestricted="${s.rohsRestricted}"${
          s.gadslClass ? ` gadslClass="${s.gadslClass}"` : ''
        } />`
      );
    }
    lines.push(`${indent}  </Substances>`);
  }
  for (const child of node.children) {
    lines.push(nodeToXml(child, `${indent}  `));
  }
  lines.push(`${indent}</${tag}>`);
  return lines.join('\n');
}

/**
 * Exports a simplified, IMDS-inspired MDS XML representation of the module.
 * This is NOT the official IMDS MDS-XML interchange schema (that schema is
 * proprietary to the IMDS system operated by HUK-Verband) — it mirrors the
 * same Component/Material/Substance node hierarchy and CAS-based substance
 * declarations so it can be reviewed, archived, or mapped into the official
 * IMDS web entry / batch-input tooling.
 */
export function moduleToXml(module: Module): string {
  const lines: string[] = [];
  lines.push('<?xml version="1.0" encoding="UTF-8"?>');
  lines.push(
    `<MaterialDataSheet mdsId="${escapeXml(module.mdsId)}" version="${module.version}" status="${module.status}">`
  );
  lines.push(`  <Header>`);
  lines.push(`    <Name>${escapeXml(module.name)}</Name>`);
  lines.push(`    <Company imdsId="${escapeXml(module.companyImdsId)}">${escapeXml(module.companyName)}</Company>`);
  lines.push(`    <Recipient imdsId="${escapeXml(module.recipientImdsId)}">${escapeXml(module.recipientName)}</Recipient>`);
  lines.push(`    <CreatedAt>${escapeXml(module.createdAt)}</CreatedAt>`);
  lines.push(`    <UpdatedAt>${escapeXml(module.updatedAt)}</UpdatedAt>`);
  lines.push(`    <AiGenerated>${module.aiGenerated}</AiGenerated>`);
  lines.push(`  </Header>`);
  lines.push(nodeToXml(module.rootNode, '  '));
  lines.push('</MaterialDataSheet>');
  return lines.join('\n');
}

export function downloadTextFile(filename: string, content: string, mime = 'text/plain') {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
