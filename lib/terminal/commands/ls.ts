/**
 * B Terminal — ls command
 * Dynamic section discovery from portfolio.json.
 * Supports sections, column extraction, column filtering, date ranges, and limits.
 */

import type { ParsedCommand, CommandResult, ITerminalEngine, TerminalContext } from '../types';

const DATE_FIELD_PATTERNS = ['date', 'start_date', 'end_date', 'issue_date', 'created_at', 'year'];

function isDateField(key: string): boolean {
  const lower = key.toLowerCase();
  return DATE_FIELD_PATTERNS.some(p => lower.includes(p));
}

function parseDateValue(val: unknown): Date | null {
  if (!val) return null;
  const d = new Date(String(val));
  return isNaN(d.getTime()) ? null : d;
}

async function fetchPortfolioData(): Promise<Record<string, unknown>> {
  const { getPortfolioData } = await import('@/lib/actions');
  return (await getPortfolioData()) as Record<string, unknown>;
}

// Fake filesystem shown when `ls` is called with no arguments
const FAKE_FS_LINES = [
  '',
  '  /home/bhargava/portfolio',
  '  ├── about.txt',
  '  ├── projects.sh',
  '  ├── experience.log',
  '  ├── applied_knowledge.md',
  '  ├── skills.json',
  '  ├── certifications/',
  '  ├── education/',
  '  ├── hackathons/',
  '  ├── awards/',
  '  ├── blogs/',
  '  └── contact.sh',
  '',
  '  Run  ls --<section>  to inspect a section.',
  '  Run  open <app>      to launch a window.',
  '',
];

export async function lsCommand(
  cmd: ParsedCommand,
  engine: ITerminalEngine,
  _ctx: TerminalContext,
): Promise<CommandResult> {
  const data = await fetchPortfolioData();
  const sections = Object.keys(data).filter(k => k !== 'profile' && Array.isArray(data[k]));

  // ls (no section, no date flag) → fake filesystem
  if (!cmd.section && !cmd.flags['date']) {
    return { output: FAKE_FS_LINES };
  }

  // ls --date
  if (cmd.flags['date']) {
    return handleDateFilter(data, sections, cmd, engine);
  }

  // ls --<section>
  const sectionName = cmd.section;
  if (!sectionName || !sections.includes(sectionName)) {
    return {
      output: [
        `ls: cannot access '${engine.escapeHtml(sectionName || '')}': No such section`,
        '',
        'Available sections:',
        ...sections.map(s => `  ${s}`),
      ],
    };
  }

  let items = (data[sectionName] as Record<string, unknown>[]) || [];

  if (cmd.columns.length > 0 && cmd.filter) {
    const filterCol = cmd.columns[0];
    items = items.filter(item => {
      const val = item[filterCol];
      if (Array.isArray(val)) return val.some(v => String(v).toLowerCase() === cmd.filter!.toLowerCase());
      return String(val || '').toLowerCase() === cmd.filter!.toLowerCase();
    });
  }

  if (cmd.limit && cmd.limit > 0) items = items.slice(0, cmd.limit);

  if (cmd.columns.length > 0) {
    if (cmd.columns.length === 1) {
      const colName = cmd.columns[0];
      const values = items.map(item => {
        const val = item[colName];
        if (val === undefined || val === null) return '(empty)';
        return Array.isArray(val) ? val.join(', ') : String(val);
      });
      return {
        output: [
          `${sectionName} → ${colName}:`,
          '',
          ...values.map((v, i) => `  ${(i + 1).toString().padStart(3)}. ${v}`),
          '',
          `Total: ${values.length} entries`,
        ],
      };
    }

    const lines: string[] = [`${sectionName} → ${cmd.columns.join(', ')}:`, ''];
    items.forEach((item, idx) => {
      lines.push(`  ─── ${(idx + 1).toString().padStart(2, '0')} ───`);
      for (const col of cmd.columns) {
        const val = item[col];
        const display = Array.isArray(val) ? val.join(', ') : (val != null ? String(val) : '(empty)');
        lines.push(`  ${col.padEnd(15)} ${display}`);
      }
      lines.push('');
    });
    lines.push(`Total: ${items.length} entries`);
    return { output: lines };
  }

  if (items.length === 0) return { output: [`No entries found in ${sectionName}.`] };

  const columns = Object.keys(items[0]).filter(k => k !== 'id' && k !== 'created_at' && !k.endsWith('_path'));
  const lines: string[] = [`${sectionName} (${items.length} entries):`, ''];

  items.forEach((item, idx) => {
    lines.push(`  ─── Entry ${idx + 1} ───`);
    for (const col of columns) {
      const val = item[col];
      if (val === undefined || val === null) continue;
      const display = Array.isArray(val) ? val.join(', ') : String(val);
      if (display.length > 0) lines.push(`  ${col.padEnd(25)} ${display}`);
    }
    lines.push('');
  });

  lines.push(`Total: ${items.length} entries`);
  return { output: lines };
}

function handleDateFilter(
  data: Record<string, unknown>,
  sections: string[],
  cmd: ParsedCommand,
  engine: ITerminalEngine,
): CommandResult {
  const startDate = cmd.startDate ? new Date(cmd.startDate) : null;
  const endDate = cmd.endDate ? new Date(cmd.endDate) : null;

  if (startDate && isNaN(startDate.getTime()))
    return { output: [`Invalid start date: ${engine.escapeHtml(cmd.startDate || '')}`] };
  if (endDate && isNaN(endDate.getTime()))
    return { output: [`Invalid end date: ${engine.escapeHtml(cmd.endDate || '')}`] };

  const results: string[] = ['Date filter results:', ''];

  for (const section of sections) {
    const items = data[section] as Record<string, unknown>[];
    if (!items?.length) continue;

    const dateFields = Object.keys(items[0]).filter(k => isDateField(k));
    if (!dateFields.length) continue;

    const matched = items.filter(item =>
      dateFields.some(field => {
        const d = parseDateValue(item[field]);
        if (!d) return false;
        if (startDate && d < startDate) return false;
        if (endDate && d > endDate) return false;
        return true;
      })
    );

    if (matched.length > 0) {
      results.push(`  ${section} (${matched.length} matches):`);
      matched.forEach(item => {
        const title = item.title || item.name || item.company || item.institution || 'Untitled';
        const dateVal = dateFields.map(f => item[f] ? String(item[f]).slice(0, 10) : '').filter(Boolean).join(' ~ ');
        results.push(`    • ${title}  [${dateVal}]`);
      });
      results.push('');
    }
  }

  if (results.length <= 2) results.push('  No entries found matching the date criteria.');
  return { output: results };
}
