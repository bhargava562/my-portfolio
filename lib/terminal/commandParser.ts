/**
 * B Terminal — Structured Command Parser
 * Parses raw input into a typed ParsedCommand for O(1) handler dispatch.
 */

export interface ParsedCommand {
  command: string;
  section: string | null;
  columns: string[];
  filter: string | null;
  limit: number | null;
  startDate: string | null;
  endDate: string | null;
  flags: Record<string, string>;
  rawArgs: string[];
  raw: string;
}

/**
 * Parses a raw terminal input string into a structured ParsedCommand.
 *
 * Supported syntax:
 *   command
 *   command --section
 *   command --section $column
 *   command --section $column:value
 *   command --date --start:YYYY-MM-DD --end:YYYY-MM-DD
 *   command --section --limit N
 *   command --flag $key:'value with spaces'
 *   echo "Hello World"          ← double-quoted args
 *   ./projects.sh               ← normalized to: open projects
 */
export function parseCommand(input: string): ParsedCommand {
  // Collapse multiple spaces, then trim
  const trimmed = input.replace(/\s+/g, ' ').trim();

  if (!trimmed) {
    return emptyParsed(trimmed);
  }

  // Normalize ./foo.sh  →  open foo  (strip extension)
  const scriptAlias = trimmed.match(/^\.\/([a-zA-Z0-9_-]+)(?:\.[a-z]+)?$/);
  if (scriptAlias) {
    const appName = scriptAlias[1].toLowerCase();
    return {
      command: 'open',
      section: null,
      columns: [],
      filter: null,
      limit: null,
      startDate: null,
      endDate: null,
      flags: {},
      rawArgs: [appName],
      raw: trimmed,
    };
  }

  const tokens = tokenize(trimmed);
  const command = tokens[0].toLowerCase();
  const rest = tokens.slice(1);

  let section: string | null = null;
  const columns: string[] = [];
  let filter: string | null = null;
  let limit: number | null = null;
  let startDate: string | null = null;
  let endDate: string | null = null;
  const flags: Record<string, string> = {};
  const rawArgs: string[] = [];

  for (let i = 0; i < rest.length; i++) {
    const token = rest[i];

    // --limit N
    if (token === '--limit' && i + 1 < rest.length) {
      const n = parseInt(rest[i + 1], 10);
      if (!isNaN(n) && n > 0) limit = n;
      i++;
      continue;
    }

    // --start:DATE
    if (token.startsWith('--start:')) {
      startDate = token.slice(8);
      continue;
    }

    // --end:DATE
    if (token.startsWith('--end:')) {
      endDate = token.slice(6);
      continue;
    }

    // --flag
    if (token.startsWith('--')) {
      const flagName = token.slice(2);
      if (flagName === 'date') {
        flags['date'] = 'true';
      } else if (flagName === 'user') {
        flags['user'] = 'true';
      } else if (!section) {
        section = flagName;
      } else {
        flags[flagName] = 'true';
      }
      continue;
    }

    // $column or $column:value or $key:'value'
    if (token.startsWith('$')) {
      const inner = token.slice(1);
      const colonIdx = inner.indexOf(':');
      if (colonIdx === -1) {
        columns.push(inner);
      } else {
        const key = inner.slice(0, colonIdx);
        let value = inner.slice(colonIdx + 1);
        if ((value.startsWith("'") && value.endsWith("'")) ||
            (value.startsWith('"') && value.endsWith('"'))) {
          value = value.slice(1, -1);
        }
        if (command === 'msg') {
          flags[key] = value;
        } else {
          columns.push(key);
          filter = value;
        }
      }
      continue;
    }

    rawArgs.push(token);
  }

  return {
    command,
    section,
    columns,
    filter,
    limit,
    startDate,
    endDate,
    flags,
    rawArgs,
    raw: trimmed,
  };
}

function emptyParsed(raw: string): ParsedCommand {
  return {
    command: '',
    section: null,
    columns: [],
    filter: null,
    limit: null,
    startDate: null,
    endDate: null,
    flags: {},
    rawArgs: [],
    raw,
  };
}

/**
 * Tokenize input respecting both single-quoted and double-quoted values.
 * Quoted strings are emitted as a single token with quotes stripped.
 */
function tokenize(input: string): string[] {
  const tokens: string[] = [];
  let current = '';
  let quoteChar: '"' | "'" | null = null;

  for (let i = 0; i < input.length; i++) {
    const ch = input[i];

    // Opening quote (only when not already inside a quote)
    if ((ch === '"' || ch === "'") && quoteChar === null) {
      quoteChar = ch;
      // Keep the quote character so $key:'value' parsing still works
      current += ch;
      continue;
    }

    // Closing quote
    if (ch === quoteChar) {
      quoteChar = null;
      current += ch;
      continue;
    }

    // Space outside quotes → token boundary
    if (ch === ' ' && quoteChar === null) {
      if (current) {
        tokens.push(current);
        current = '';
      }
      continue;
    }

    current += ch;
  }

  if (current) tokens.push(current);
  return tokens;
}