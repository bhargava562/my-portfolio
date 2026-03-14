"use client";

import React, { useState, useRef } from 'react';
import { Send, AlertCircle, X } from 'lucide-react';

const RATE_LIMIT_MS = 30_000; // 30 seconds between submissions

export default function ContactForm() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });
    const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
    const [validationError, setValidationError] = useState<string | null>(null);
    const lastSubmitRef = useRef<number>(0);

    const validateEmail = (email: string) => {
        return /\S+@\S+\.\S+/.test(email);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!formData.name.trim()) {
            setValidationError("Please enter your name.");
            return;
        }
        if (!formData.email.trim()) {
            setValidationError("Please enter your email.");
            return;
        }
        if (!validateEmail(formData.email)) {
            setValidationError("Please enter a valid email address.");
            return;
        }
        if (!formData.message.trim()) {
            setValidationError("Please enter a message.");
            return;
        }

        // Rate limiting
        const now = Date.now();
        if (now - lastSubmitRef.current < RATE_LIMIT_MS) {
            const remainingSec = Math.ceil((RATE_LIMIT_MS - (now - lastSubmitRef.current)) / 1000);
            setValidationError(`Please wait ${remainingSec} seconds before sending another message.`);
            return;
        }

        setValidationError(null);
        setStatus('sending');
        lastSubmitRef.current = now;

        try {
            const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
            const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
            const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

            // Mock success timeout if no keys exist allowing demo functionality
            if (!serviceId || !templateId || !publicKey) {
                console.log("No EmailJS keys found. Simulating successful form submission for Demo:");
                console.log(formData);
                await new Promise(resolve => setTimeout(resolve, 1500));
                setStatus('success');
                setFormData({ name: '', email: '', message: '' });
                return;
            }

            // Dynamic import — only loads emailjs (~15KB) when actually sending
            const emailjs = (await import('@emailjs/browser')).default;

            await emailjs.send(
                serviceId,
                templateId,
                {
                    from_name: formData.name,
                    from_email: formData.email,
                    message: formData.message,
                },
                publicKey
            );
            setStatus('success');
            setFormData({ name: '', email: '', message: '' });
        } catch (error) {
            console.error('EmailJS Error:', error);
            setStatus('error');
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#F9F9FB] font-sans relative">
            {/* Firefox-style Toolbar */}
            <div className="bg-[#F0F0F4] border-b border-[#E0E0E6] p-2 flex items-center gap-2 shrink-0">
                <div className="flex gap-1">
                    <div className="w-3 h-3 rounded-full bg-[#FF5F57] border border-[#E0443E]" />
                    <div className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123]" />
                    <div className="w-3 h-3 rounded-full bg-[#28C93F] border border-[#1AAB29]" />
                </div>
                <div className="flex-1 bg-white rounded-md border border-[#E0E0E6] h-7 flex items-center px-3 text-xs text-gray-500">
                    https://contact.me
                </div>
            </div>

            {/* Validation Popup */}
            {validationError && (
                <div className="absolute top-14 left-1/2 -translate-x-1/2 w-11/12 max-w-sm bg-white rounded-lg shadow-lg border border-red-200 p-4 z-50 flex items-start gap-3 animate-in fade-in slide-in-from-top-4 duration-200">
                    <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <h3 className="text-sm font-semibold text-gray-900">Validation Error</h3>
                        <p className="text-sm text-gray-600 mt-1">{validationError}</p>
                    </div>
                    <button
                        onClick={() => setValidationError(null)}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Content */}
            <div className="flex-1 p-4 sm:p-8 overflow-y-auto">
                <div className="w-full max-w-md mx-auto my-auto min-h-full flex flex-col justify-center">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">Get in Touch</h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    maxLength={100}
                                    onChange={(e) => {
                                        setFormData({ ...formData, name: e.target.value });
                                        if (validationError) setValidationError(null);
                                    }}
                                    className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E95420] focus:border-transparent placeholder-gray-400"
                                    placeholder="Your Name"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    maxLength={254}
                                    onChange={(e) => {
                                        setFormData({ ...formData, email: e.target.value });
                                        if (validationError) setValidationError(null);
                                    }}
                                    className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E95420] focus:border-transparent placeholder-gray-400"
                                    placeholder="your@email.com"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                                <textarea
                                    rows={4}
                                    name="message"
                                    value={formData.message}
                                    maxLength={2000}
                                    onChange={(e) => {
                                        setFormData({ ...formData, message: e.target.value });
                                        if (validationError) setValidationError(null);
                                    }}
                                    className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E95420] focus:border-transparent placeholder-gray-400 resize-y"
                                    placeholder="How can I help you?"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={status === 'sending'}
                                className="w-full bg-[#E95420] text-white py-2 px-4 rounded-md hover:bg-[#C73E0F] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
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
                                <div className="p-3 bg-green-50 text-green-700 border border-green-200 rounded-md text-sm text-center">
                                    Message sent successfully!
                                </div>
                            )}

                            {status === 'error' && (
                                <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-md text-sm text-center">
                                    Failed to send message. Please try again.
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
