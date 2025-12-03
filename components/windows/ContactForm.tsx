"use client";

import React, { useState } from 'react';
import emailjs from '@emailjs/browser';
import { Send, X } from 'lucide-react';

export default function ContactForm() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });
    const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('sending');

        try {
            await emailjs.send(
                process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || '',
                process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || '',
                {
                    from_name: formData.name,
                    from_email: formData.email,
                    message: formData.message,
                },
                process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || ''
            );
            setStatus('success');
            setFormData({ name: '', email: '', message: '' });
        } catch (error) {
            console.error('EmailJS Error:', error);
            setStatus('error');
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#F9F9FB] font-sans">
            {/* Firefox-style Toolbar */}
            <div className="bg-[#F0F0F4] border-b border-[#E0E0E6] p-2 flex items-center gap-2">
                <div className="flex gap-1">
                    <div className="w-3 h-3 rounded-full bg-[#FF5F57] border border-[#E0443E]" />
                    <div className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123]" />
                    <div className="w-3 h-3 rounded-full bg-[#28C93F] border border-[#1AAB29]" />
                </div>
                <div className="flex-1 bg-white rounded-md border border-[#E0E0E6] h-7 flex items-center px-3 text-xs text-gray-500">
                    https://contact.me
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 p-8 flex items-center justify-center overflow-y-auto">
                <div className="w-full max-w-md bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Get in Touch</h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E95420] focus:border-transparent"
                                placeholder="Your Name"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                                type="email"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E95420] focus:border-transparent"
                                placeholder="your@email.com"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                            <textarea
                                required
                                rows={4}
                                value={formData.message}
                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E95420] focus:border-transparent"
                                placeholder="How can I help you?"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={status === 'sending'}
                            className="w-full bg-[#E95420] text-white py-2 px-4 rounded-md hover:bg-[#C73E0F] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {status === 'sending' ? (
                                'Sending...'
                            ) : (
                                <>
                                    <Send className="w-4 h-4" />
                                    Send Message
                                </>
                            )}
                        </button>

                        {status === 'success' && (
                            <div className="p-3 bg-green-50 text-green-700 rounded-md text-sm text-center">
                                Message sent successfully!
                            </div>
                        )}

                        {status === 'error' && (
                            <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm text-center">
                                Failed to send message. Please try again.
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
}
