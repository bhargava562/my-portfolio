"use client";

import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import Image from 'next/image';
import { FolderOpen, ChevronLeft } from 'lucide-react';
import { getCertifications } from '@/lib/actions';
import { buildSupabaseImageUrl } from '@/lib/image-utils';
import { useWindows } from '@/components/WindowManager';

// ─── Types ──────────────────────────────────────────────────

interface CertNode {
  id: string;
  title: string;
  issuing_organization: string;
  issue_date: string | null;
  credential_url: string | null;
  certificate_file_path: string | null;
  credential_tier: string | null;
  tier: string | null;
  platform: string | null;
  [key: string]: unknown;
}

interface OrgGroup {
  organization: string;
  certifications: CertNode[];
}

// ─── Sub-components ─────────────────────────────────────────

function CertViewerContent({ imageUrl, alt }: { imageUrl: string; alt: string }) {
  const [src, setSrc] = useState(imageUrl);
  const [failed, setFailed] = useState(false);

  return (
    <div className="w-full h-full bg-[#1E1E1E] flex flex-col items-center justify-center p-2 relative">
      <Image
        src={src}
        alt={alt}
        fill
        className="object-contain"
        priority
        onError={() => {
          if (!failed) {
            setFailed(true);
            setSrc('/linux-placeholder.webp');
          }
        }}
      />
      {failed && (
        <div className="absolute bottom-4 left-0 right-0 text-center">
            <p className="text-gray-500 text-xs bg-black/50 py-1 px-2 rounded-full inline-block">Failed to load certificate image</p>
        </div>
      )}
    </div>
  );
}

function CertFileIcon({ cert, onClick }: { cert: CertNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1.5 p-3 rounded-lg hover:bg-white/10 transition-colors cursor-pointer group w-full min-w-0"
    >
      <div className="w-12 h-12 relative flex-shrink-0">
        <Image
          src="/photos.webp"
          alt={cert.title}
          width={48}
          height={48}
          className="object-contain drop-shadow-md"
        />
      </div>
      <span className="text-xs text-center text-gray-300 group-hover:text-white transition-colors line-clamp-2 w-full break-words">
        {cert.title}
      </span>
    </button>
  );
}

function FolderIcon({ name, count, onClick }: { name: string; count: number; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1.5 p-3 rounded-lg hover:bg-white/10 transition-colors cursor-pointer group w-full min-w-0"
    >
      <div className="w-12 h-12 relative flex-shrink-0 flex items-center justify-center">
        <FolderOpen className="w-12 h-12 text-[#E95420] drop-shadow-md" />
        <span className="absolute bottom-0 right-0 bg-[#E95420] text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
          {count}
        </span>
      </div>
      <span className="text-xs text-center text-gray-300 group-hover:text-white transition-colors line-clamp-2 w-full break-words">
        {name}
      </span>
    </button>
  );
}

// ─── Main Component ─────────────────────────────────────────

export default function CertificationsContent() {
  const [certifications, setCertifications] = useState<CertNode[]>([]);
  const [openFolder, setOpenFolder] = useState<string | null>(null);
  const { openWindow } = useWindows();
  const lastOpenRef = useRef(0);

  useEffect(() => {
    getCertifications().then(c => setCertifications(c as unknown as CertNode[]));
  }, []);

  // Grouping algorithm: O(n) single-pass grouping by issuing_organization
  const grouped = useMemo<OrgGroup[]>(() => {
    const map = new Map<string, CertNode[]>();
    for (const cert of certifications) {
      const org = cert.issuing_organization || 'Unknown';
      const list = map.get(org);
      if (list) {
        list.push(cert);
      } else {
        map.set(org, [cert]);
      }
    }
    // Convert and sort alphabetically
    return Array.from(map, ([organization, certs]) => ({
      organization,
      certifications: certs,
    })).sort((a, b) => a.organization.localeCompare(b.organization));
  }, [certifications]);

  // Dispatch a unique window for a certificate image
  // Debounce guard: double-click fires onClick twice — only honour the first within 500ms
  const openCertificateViewer = useCallback((cert: CertNode) => {
    const now = Date.now();
    if (now - lastOpenRef.current < 500) return;
    lastOpenRef.current = now;

    const imageUrl = cert.certificate_file_path
      ? buildSupabaseImageUrl(cert.certificate_file_path, 1200)
      : '/photos.webp';

    openWindow({
      id: 'cert-viewer',
      title: cert.title,
      icon: '/photos.webp',
      type: 'file',
      content: <CertViewerContent imageUrl={imageUrl} alt={cert.title} />,
      allowMultiple: true,
    });
  }, [openWindow]);

  if (certifications.length === 0) {
    return <div className="p-8 text-white h-full bg-[#1E1E1E]">Loading certifications...</div>;
  }

  // Currently viewing inside a folder
  const activeFolder = openFolder
    ? grouped.find(g => g.organization === openFolder)
    : null;

  return (
    <div className="flex-1 h-full bg-[#1E1E1E] text-white flex flex-col overflow-hidden">
      {/* Header / Breadcrumb */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-[#3E3E3E] flex-shrink-0">
        {activeFolder ? (
          <>
            <button
              onClick={() => setOpenFolder(null)}
              className="flex items-center gap-1 text-sm text-gray-400 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>
            <span className="text-gray-500">/</span>
            <FolderOpen className="w-5 h-5 text-[#E95420]" />
            <span className="font-semibold">{activeFolder.organization}</span>
            <span className="text-xs text-gray-500 ml-1">({activeFolder.certifications.length} items)</span>
          </>
        ) : (
          <>
            <FolderOpen className="w-5 h-5 text-[#E95420]" />
            <span className="font-semibold">Certifications</span>
            <span className="text-xs text-gray-500 ml-1">({certifications.length} items)</span>
          </>
        )}
      </div>

      {/* Scrollable grid container with custom scrollbar */}
      <div className="flex-1 overflow-y-auto certifications-scrollbar p-6">
        {activeFolder ? (
          /* Folder inner view — show all certs inside this org */
          <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))' }}>
            {activeFolder.certifications.map(cert => (
              <CertFileIcon
                key={cert.id}
                cert={cert}
                onClick={() => openCertificateViewer(cert)}
              />
            ))}
          </div>
        ) : (
          /* Root view — folders for multi-cert orgs, files for single-cert orgs */
          <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))' }}>
            {grouped.map(group =>
              group.certifications.length > 1 ? (
                <FolderIcon
                  key={group.organization}
                  name={group.organization}
                  count={group.certifications.length}
                  onClick={() => setOpenFolder(group.organization)}
                />
              ) : (
                <CertFileIcon
                  key={group.certifications[0].id}
                  cert={group.certifications[0]}
                  onClick={() => openCertificateViewer(group.certifications[0])}
                />
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}
