"use client";

import { useEffect, useState, useMemo } from "react";
import { getPortfolioData } from "@/lib/actions";
import { GitCommit, Check } from "lucide-react";

interface SkillJunction {
  contribution_id: string;
  skill_id: string;
}

interface Skill {
  id: string;
  name: string;
}

interface Contribution {
  id?: string;
  project_or_org_name: string;
  description: string;
  impact_result: string | null;
  contribution_date: string;
  link_url?: string | null;
  skills?: SkillJunction[];
}

export default function ContributionsContent() {
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<string | null>(null);

  // O(1) lookup map for skill names
  const skillMap = useMemo(() => {
    return new Map(skills.map((s) => [s.id, s.name]));
  }, [skills]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getPortfolioData();

        if (!data) {
          setContributions([]);
          setSkills([]);
          return;
        }

        // Extract contributions and skills
        const contributionsData = (data.contributions || []) as Contribution[];
        const skillsData = (data.skills || []) as Skill[];

        // Sort contributions by date descending
        const sorted = [...contributionsData].sort((a, b) => {
          try {
            const dateA = new Date(a.contribution_date || "").getTime();
            const dateB = new Date(b.contribution_date || "").getTime();
            return dateB - dateA;
          } catch {
            return 0;
          }
        });

        setContributions(sorted);
        setSkills(skillsData);
      } catch (err) {
        console.error("[ContributionsContent] Error fetching data:", err);
        setError("Failed to load contributions");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-white text-[#24292f]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0969da] mx-auto mb-4"></div>
          <p>Loading contributions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-white text-red-600 p-8">
        <div className="text-center">
          <p className="text-lg font-semibold mb-2">Error</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (contributions.length === 0) {
    return (
      <div className="flex items-center justify-center h-full bg-white text-[#57606a] p-8">
        <div className="text-center">
          <GitCommit className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg">No contributions found</p>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const getYear = (dateString: string): string => {
    try {
      return new Date(dateString).getFullYear().toString();
    } catch {
      return "Unknown";
    }
  };

  const years = Array.from(
    new Set(contributions.map((c) => getYear(c.contribution_date)))
  ).sort((a, b) => Number(b) - Number(a));

  const filteredContributions = selectedYear
    ? contributions.filter(
        (c) => getYear(c.contribution_date) === selectedYear
      )
    : contributions;

  return (
    <div className="h-full overflow-y-auto bg-white @container">
      <style jsx>{`
        div::-webkit-scrollbar {
          width: 12px;
        }
        div::-webkit-scrollbar-track {
          background: #f6f8fa;
        }
        div::-webkit-scrollbar-thumb {
          background: #d0d7de;
          border-radius: 6px;
        }
        div::-webkit-scrollbar-thumb:hover {
          background: #afb8c1;
        }
      `}</style>

      <div className="flex flex-col @3xl:flex-row gap-3 @sm:gap-4 @md:gap-5 @lg:gap-6 p-2 @sm:p-3 @md:p-4 @lg:p-6 w-full">
        {/* Timeline Feed - Left Column */}
        <div className="flex-1 min-w-0">
          <div className="mb-4 @sm:mb-5 @md:mb-6 @lg:mb-8">
            <h1 className="text-lg @sm:text-xl @md:text-2xl @lg:text-3xl font-semibold text-[#24292f] mb-1 @sm:mb-2">
              Contribution activity
            </h1>
            <p className="text-[#57606a] text-[10px] @sm:text-xs @md:text-sm">
              {filteredContributions.length} contribution
              {filteredContributions.length !== 1 ? "s" : ""}
              {selectedYear ? ` in ${selectedYear}` : ""}
            </p>
          </div>

          {/* Timeline Container */}
          <div className="relative">
            {/* Vertical Timeline Line */}
            <div className="absolute left-3.5 @sm:left-4 @md:left-4.5 @lg:left-5 top-0 bottom-0 w-[2px] bg-[#d0d7de]"></div>

            {/* Timeline Items */}
            <div className="space-y-3 @sm:space-y-4 @md:space-y-5 @lg:space-y-6">
              {filteredContributions.map((contribution, idx) => (
                <div
                  key={
                    contribution.id
                      ? `${contribution.id}-${idx}`
                      : `contribution-${idx}`
                  }
                  className="relative pl-9 @sm:pl-10 @md:pl-11 @lg:pl-12"
                >
                  {/* Timeline Node */}
                  <div className="absolute left-0 top-1 w-8 @sm:w-9 @md:w-10 h-8 @sm:h-9 @md:h-10 bg-white border border-[#d0d7de] rounded-full flex items-center justify-center shadow-sm flex-shrink-0">
                    <GitCommit className="w-4 @sm:w-4.5 @md:w-5 h-4 @sm:h-4.5 @md:h-5 text-[#57606a]" />
                  </div>

                  {/* Content Card */}
                  <div className="border border-[#d0d7de] rounded-md p-2 @sm:p-3 @md:p-4 hover:border-[#0969da] transition-colors bg-white">
                    {/* Header */}
                    <div className="mb-2 @sm:mb-2.5 @md:mb-3">
                      <p className="text-[#57606a] text-xs @sm:text-sm @md:text-base mb-0.5 @sm:mb-1 break-words">
                        Contributed to{" "}
                        {contribution.link_url ? (
                          <a
                            href={contribution.link_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#0969da] font-semibold hover:underline break-words"
                          >
                            {contribution.project_or_org_name}
                          </a>
                        ) : (
                          <span className="text-[#0969da] font-semibold break-words">
                            {contribution.project_or_org_name}
                          </span>
                        )}
                      </p>
                      <p className="text-[9px] @sm:text-[10px] @md:text-xs text-[#57606a]">
                        {formatDate(contribution.contribution_date)}
                      </p>
                    </div>

                    {/* Description */}
                    <p className="text-[#24292f] text-xs @sm:text-sm @md:text-base mb-2 @sm:mb-2.5 @md:mb-3 leading-relaxed break-words">
                      {contribution.description}
                    </p>

                    {/* Impact Result */}
                    {contribution.impact_result && (
                      <div className="flex items-start gap-1.5 @sm:gap-2 mb-2 @sm:mb-2.5 @md:mb-3 text-xs @sm:text-sm @md:text-base">
                        <Check className="w-3.5 h-3.5 @sm:w-4 @sm:h-4 @md:w-5 @md:h-5 text-[#2da44e] flex-shrink-0 mt-0.5" />
                        <p className="text-[#2da44e] break-words">
                          {contribution.impact_result}
                        </p>
                      </div>
                    )}

                    {/* Skills */}
                    {contribution.skills && contribution.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1 @sm:gap-1.5 @md:gap-2">
                        {contribution.skills.map((junction) => {
                          if (!junction || !junction.skill_id) return null;
                          const skillName = skillMap.get(junction.skill_id);
                          if (!skillName) return null;
                          return (
                            <span
                              key={junction.skill_id}
                              className="inline-block px-1.5 @sm:px-2 @md:px-2.5 py-0.5 @sm:py-1 bg-[#f6f8fa] text-[#0969da] text-[9px] @sm:text-[10px] @md:text-xs rounded-full border border-[#d0d7de] font-medium whitespace-nowrap"
                            >
                              {skillName}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Year Filter - Right Column */}
        <div className="w-full @3xl:w-48 flex-shrink-0 order-first @3xl:order-last">
          <div className="@3xl:sticky @3xl:top-6">
            <h3 className="text-xs @sm:text-sm @md:text-base font-semibold text-[#24292f] mb-2 @sm:mb-2.5 @md:mb-3">
              Filter by year
            </h3>
            <div className="flex flex-wrap @3xl:flex-col gap-1.5 @sm:gap-2 @3xl:space-y-1">
              <button
                onClick={() => setSelectedYear(null)}
                className={`px-2 @sm:px-3 py-1.5 @sm:py-2 text-xs @sm:text-sm rounded-md transition-colors ${
                  selectedYear === null
                    ? "bg-[#0969da] text-white font-semibold"
                    : "text-[#0969da] hover:bg-[#f6f8fa]"
                }`}
              >
                All years
              </button>
              {years.map((year) => (
                <button
                  key={year}
                  onClick={() => setSelectedYear(year)}
                  className={`px-2 @sm:px-3 py-1.5 @sm:py-2 text-xs @sm:text-sm rounded-md transition-colors ${
                    selectedYear === year
                      ? "bg-[#0969da] text-white font-semibold"
                      : "text-[#0969da] hover:bg-[#f6f8fa]"
                  }`}
                >
                  {year}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
