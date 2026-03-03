"use client";

import { useEffect, useState } from 'react';
import { Award } from 'lucide-react';
import { getCertifications } from '@/lib/actions';

interface CertNode {
  id: number;
  title: string;
  issuing_organization: string;
  issue_date: string | null;
  credential_url: string | null;
  [key: string]: unknown;
}

export default function CertificationsContent() {
    const [certifications, setCertifications] = useState<CertNode[]>([]);

    useEffect(() => {
        getCertifications().then(setCertifications);
    }, []);

    const formatDate = (date: Date | null) => {
        if (!date) return '';
        return new Date(date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    };

    if (certifications.length === 0) {
        return <div className="p-8 text-white">Loading certifications...</div>;
    }

    return (
        <div className="flex-1 p-8 overflow-auto text-white bg-[#1E1E1E]">
            <h1 className="text-2xl font-bold mb-8">Certifications</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {certifications.map((cert) => (
                    <div key={cert.id} className="bg-[#2C2C2C] rounded-lg p-5 border border-[#3E3E3E] hover:border-orange-500/50 transition-colors">
                        <div className="flex items-start gap-3">
                            <Award className="w-5 h-5 text-orange-400 mt-0.5 flex-shrink-0" />
                            <div>
                                <h3 className="font-semibold mb-1">{cert.title}</h3>
                                <p className="text-sm text-gray-400">{cert.issuing_organization}</p>
                                <p className="text-xs text-gray-500 mt-1">{formatDate(cert.issue_date ? new Date(cert.issue_date) : null)}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
