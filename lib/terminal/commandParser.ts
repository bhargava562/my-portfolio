/**
 * B Terminal — Structured Command Parser
 * Parses raw input into a typed ParsedCommand for O(1) handler dispatch.
 */

export interface ParsedCommand {
  command: string;
  section: string | null;
  column: string | null;
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
 */
export function parseCommand(input: string): ParsedCommand {
  const trimmed = input.trim();
  if (!trimmed) {
    return emptyParsed(trimmed);
  }

  // Tokenize respecting quoted values (single quotes around values)
  const tokens = tokenize(trimmed);
  const command = tokens[0].toLowerCase();
  const rest = tokens.slice(1);

  let section: string | null = null;
  let column: string | null = null;
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
      if (!isNaN(n) && n > 0) {
        limit = n;
      }
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

    // --section flag (first one wins as section, rest go to flags)
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
        // $column (no filter)
        column = inner;
      } else {
        const key = inner.slice(0, colonIdx);
        let value = inner.slice(colonIdx + 1);
        // Strip surrounding single quotes
        if (value.startsWith("'") && value.endsWith("'")) {
          value = value.slice(1, -1);
        }
        // For ls: first $ is column:filter. For msg: accumulate as flags
        if (command === 'msg') {
          flags[key] = value;
        } else {
          column = key;
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
    column,
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
    column: null,
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
 * Tokenize input, respecting single-quoted values attached to $key:'...'
 */
function tokenize(input: string): string[] {
  const tokens: string[] = [];
  let current = '';
  let inQuote = false;

  for (let i = 0; i < input.length; i++) {
    const ch = input[i];

    if (ch === "'" && !inQuote) {
      inQuote = true;
      current += ch;
      continue;
    }

    if (ch === "'" && inQuote) {
      inQuote = false;
      current += ch;
      continue;
    }

    if (ch === ' ' && !inQuote) {
      if (current) {
        tokens.push(current);
        current = '';
      }
      continue;
    }

    current += ch;
  }

  if (current) {
    tokens.push(current);
  }

  return tokens;
}
