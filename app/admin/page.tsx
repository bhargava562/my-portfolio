"use client";

import { useEffect, useState } from 'react';
import { getProfile, getSocialLinks, updateProfile, updateSocialLink, deleteSocialLink } from '@/lib/actions';
import { Save, Plus, Trash2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface ProfileData {
  id: number;
  name: string;
  title: string;
  bio: string;
  email: string;
  phone: string;
  location: string | null;
  avatarUrl: string | null;
  resumeUrl: string | null;
}

interface SocialLinkData {
  id?: number;
  platformName: string;
  url: string;
  iconKey: string;
}

export default function AdminPage() {
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [socialLinks, setSocialLinks] = useState<SocialLinkData[]>([]);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const [profileData, socialData] = await Promise.all([
            getProfile(),
            getSocialLinks(),
        ]);
        setProfile(profileData);
        setSocialLinks(socialData || []);
    };

    const handleProfileChange = (field: keyof ProfileData, value: string) => {
        setProfile((prev) => prev ? ({ ...prev, [field]: value } as ProfileData) : null);
    };

    const handleSocialChange = (index: number, field: keyof SocialLinkData, value: string) => {
        setSocialLinks(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: value } as SocialLinkData;
            return updated;
        });
    };

    const addSocialLink = () => {
        setSocialLinks(prev => [...prev, { platformName: '', url: '', iconKey: '' }]);
    };

    const removeSocialLink = async (index: number) => {
        const link = socialLinks[index];
        if (link.id) {
            await deleteSocialLink(Number(link.id));
        }
        setSocialLinks(prev => prev.filter((_, i) => i !== index));
    };

    const handleSave = async () => {
        if (!profile) return;
        setSaving(true);
        setMessage(null);

        try {
            // Save profile
            await updateProfile({
                id: profile.id,
                name: profile.name,
                title: profile.title,
                bio: profile.bio,
                email: profile.email,
                phone: profile.phone,
                location: profile.location || '',
                avatarUrl: profile.avatarUrl || '',
                resumeUrl: profile.resumeUrl || '',
            });

            // Save social links
            for (const link of socialLinks) {
                if (link.platformName && link.url) {
                    await updateSocialLink({
                        id: link.id,
                        platformName: link.platformName,
                        url: link.url,
                        iconKey: link.iconKey || link.platformName.toLowerCase(),
                    });
                }
            }

            setMessage({ type: 'success', text: 'Profile saved successfully!' });
            await loadData(); // Reload to get updated IDs
        } catch (error) {
            console.error('Save error:', error);
            setMessage({ type: 'error', text: 'Failed to save profile. Please try again.' });
        } finally {
            setSaving(false);
        }
    };

    if (!profile) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-white text-xl">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            {/* Header */}
            <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="text-gray-400 hover:text-white transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <h1 className="text-xl font-bold">Admin - Profile Editor</h1>
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-500/50 rounded-lg transition-colors"
                    >
                        <Save className="w-4 h-4" />
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-4xl mx-auto px-6 py-8">
                {/* Message */}
                {message && (
                    <div className={`mb-6 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                        {message.text}
                    </div>
                )}

                {/* Profile Section */}
                <section className="bg-gray-800 rounded-lg p-6 mb-6">
                    <h2 className="text-lg font-semibold mb-4 pb-2 border-b border-gray-700">Basic Information</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Full Name</label>
                            <input
                                type="text"
                                value={profile.name || ''}
                                onChange={(e) => handleProfileChange('name', e.target.value)}
                                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Title / Headline</label>
                            <input
                                type="text"
                                value={profile.title || ''}
                                onChange={(e) => handleProfileChange('title', e.target.value)}
                                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Email</label>
                            <input
                                type="email"
                                value={profile.email || ''}
                                onChange={(e) => handleProfileChange('resumeUrl' as keyof ProfileData, e.target.value)}
                                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Phone</label>
                            <input
                                type="tel"
                                value={profile.phone || ''}
                                onChange={(e) => handleProfileChange('phone', e.target.value)}
                                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Location</label>
                            <input
                                type="text"
                                value={profile.location || ''}
                                onChange={(e) => handleProfileChange('location', e.target.value)}
                                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                placeholder="e.g., Greater Chennai Area"
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Avatar URL</label>
                            <input
                                type="url"
                                value={profile.avatarUrl || ''}
                                onChange={(e) => handleProfileChange('avatarUrl', e.target.value)}
                                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                placeholder="https://example.com/avatar.jpg"
                            />
                        </div>
                    </div>

                    <div className="mt-4">
                        <label className="block text-sm text-gray-400 mb-1">Bio / About</label>
                        <textarea
                            value={profile.bio || ''}
                            onChange={(e) => handleProfileChange('bio', e.target.value)}
                            rows={5}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                            placeholder="Tell about yourself..."
                        />
                    </div>
                </section>

                {/* Social Links Section */}
                <section className="bg-gray-800 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-700">
                        <h2 className="text-lg font-semibold">Social Links</h2>
                        <button
                            onClick={addSocialLink}
                            className="flex items-center gap-1 text-sm text-orange-400 hover:text-orange-300 transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Add Link
                        </button>
                    </div>

                    <div className="space-y-4">
                        {socialLinks.map((link, index) => (
                            <div key={index} className="flex items-center gap-3">
                                <input
                                    type="text"
                                    value={link.platformName || ''}
                                    onChange={(e) => handleSocialChange(index, 'platformName' as keyof SocialLinkData, e.target.value)}
                                    className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    placeholder="Platform (e.g., LinkedIn)"
                                />
                                <input
                                    type="url"
                                    value={link.url || ''}
                                    onChange={(e) => handleSocialChange(index, 'url' as keyof SocialLinkData, e.target.value)}
                                    className="flex-[2] px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    placeholder="URL (e.g., https://linkedin.com/in/username)"
                                />
                                <input
                                    type="text"
                                    value={link.iconKey || ''}
                                    onChange={(e) => handleSocialChange(index, 'iconKey' as keyof SocialLinkData, e.target.value)}
                                    className="w-24 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    placeholder="Icon"
                                />
                                <button
                                    onClick={() => removeSocialLink(index)}
                                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}

                        {socialLinks.length === 0 && (
                            <p className="text-gray-500 text-center py-4">No social links added. Click &quot;Add Link&quot; to add one.</p>
                        )}
                    </div>
                </section>
            </main>
        </div>
    );
}
