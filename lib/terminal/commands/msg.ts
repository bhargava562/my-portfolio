/**
 * B Terminal — msg command
 * EmailJS integration with interactive + direct modes.
 * Reuses the same env vars as ContactForm.tsx.
 */

/* eslint-disable @typescript-eslint/no-unused-vars */

import type { ParsedCommand, CommandResult, InteractivePrompt, ITerminalEngine } from '../types';

async function sendEmail(name: string, email: string, message: string): Promise<string[]> {
  const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
  const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
  const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

  // Simulate success if no EmailJS keys
  if (!serviceId || !templateId || !publicKey) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return [
      '',
      'Sending message...',
      '✓ Message sent successfully (demo mode)',
      `  From: ${name} <${email}>`,
      `  Message: ${message}`,
      '',
    ];
  }

  try {
    const emailjs = (await import('@emailjs/browser')).default;
    await emailjs.send(
      serviceId, templateId,
      { from_name: name, from_email: email, message },
      publicKey
    );
    return [
      '',
      'Sending message...',
      '✓ Message sent successfully!',
      '',
    ];
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return [
      '',
      'Sending message...',
      `✖ Failed to send message: ${errorMsg}`,
      'Please use the contact form instead.',
      '',
    ];
  }
}

export async function msgCommand(cmd: ParsedCommand, _engine: ITerminalEngine): Promise<CommandResult> {
  if (!cmd.flags['user']) {
    return {
      output: [
        'Usage:',
        "  msg --user                          Interactive mode",
        "  msg --user $email:'...' $name:'...' $message:'...'  Direct mode",
      ],
    };
  }

  // Direct mode: all params provided as flags
  const email = cmd.flags['email'];
  const name = cmd.flags['name'];
  const message = cmd.flags['message'];

  if (email && name && message) {
    // Validate email
    if (!/\S+@\S+\.\S+/.test(email)) {
      return {
        output: ['✖ Invalid email address: ' + email],
      };
    }

    const result = await sendEmail(name, email, message);
    return { output: result };
  }

  // Interactive mode
  const interactiveMode: InteractivePrompt = {
    prompts: [
      'Enter your name:',
      'Enter your email:',
      'Enter your message:',
    ],
    currentIndex: 0,
    answers: {},
    onComplete: async (answers: Record<string, string>) => {
      const n = answers['name'] || '';
      const e = answers['email'] || '';
      const m = answers['message'] || '';

      if (!n.trim()) return ['✖ Name cannot be empty.'];
      if (!e.trim() || !/\S+@\S+\.\S+/.test(e)) return ['✖ Invalid email address.'];
      if (!m.trim()) return ['✖ Message cannot be empty.'];

      return sendEmail(n, e, m);
    },
  };

  return {
    output: [],
    interactiveMode,
  };
}
