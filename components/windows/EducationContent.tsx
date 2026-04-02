"use client";

import { useEffect, useState } from "react";
import { getPortfolioData } from "@/lib/actions";
import { GraduationCap } from "lucide-react";

interface EducationData {
  id?: string | number;
  institution_name?: string;
  degree?: string;
  field_of_study?: string;
  start_year?: number | null;
  end_year?: number | null;
  grade?: string | null;
  description?: string | null;
}

// Google Classroom-inspired header gradients
const CLASSROOM_GRADIENTS = [
  "bg-gradient-to-r from-blue-600 to-blue-400",
  "bg-gradient-to-r from-emerald-600 to-emerald-400",
  "bg-gradient-to-r from-purple-600 to-purple-400",
  "bg-gradient-to-r from-orange-500 to-amber-400",
];

export default function EducationContent() {
  const [education, setEducation] = useState<EducationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEducation = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getPortfolioData();

        if (!data || !data.education) {
          setEducation([]);
          return;
        }

        setEducation(data.education as EducationData[]);
      } catch (err) {
        console.error("[EducationContent] Error fetching data:", err);
        setError("Failed to load education data");
      } finally {
        setLoading(false);
      }
    };

    fetchEducation();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-[#f1f3f4] text-[#3c4043]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a73e8] mx-auto mb-4"></div>
          <p>Loading education...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-[#f1f3f4] text-red-600 p-8">
        <div className="text-center">
          <p className="text-lg font-semibold mb-2">Error</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (education.length === 0) {
    return (
      <div className="flex items-center justify-center h-full bg-[#f1f3f4] text-[#5f6368] p-8">
        <div className="text-center">
          <GraduationCap className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg">No education records found</p>
        </div>
      </div>
    );
  }

  const formatYearRange = (startYear?: number | null, endYear?: number | null): string => {
    const start = startYear || "N/A";
    const end = endYear || "Present";
    return `${start} - ${end}`;
  };

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-br from-[#f8f9fa] to-[#e8eaed]">
      <div className="p-4 sm:p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-semibold text-[#3c4043] mb-2">
            Education
          </h1>
          <p className="text-[#5f6368] text-sm">
            {education.length} {education.length === 1 ? "record" : "records"}
          </p>
        </div>

        {/* Grid of Education Cards */}
        <div className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-6">
          {education.map((edu, index) => {
            const gradientClass = CLASSROOM_GRADIENTS[index % CLASSROOM_GRADIENTS.length];
            
            return (
              <div
                key={edu.id || `edu-${index}`}
                className="transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-white rounded-xl overflow-hidden border border-gray-200/60 flex flex-col"
              >
                {/* Colored Header Banner */}
                <div
                  className={`relative h-28 px-4 pt-4 pb-2 flex flex-col justify-between ${gradientClass}`}
                >
                  {/* Institution Name */}
                  <h3 className="text-xl font-semibold text-white truncate drop-shadow-sm">
                    {edu.institution_name || "Unknown Institution"}
                  </h3>

                  {/* Degree & Field */}
                  <p className="text-sm font-medium text-white/90 mt-1 truncate">
                    {edu.degree || "Degree"}
                    {edu.field_of_study && ` in ${edu.field_of_study}`}
                  </p>

                  {/* Avatar Overlay */}
                  <div className="absolute -bottom-6 right-4 w-12 h-12 bg-white rounded-full border-4 border-white flex items-center justify-center shadow-md">
                    <GraduationCap className="w-6 h-6 text-[#5f6368]" />
                  </div>
                </div>

                {/* White Body Section */}
                <div className="px-4 pt-8 pb-4 flex-1 flex flex-col">
                  {/* Year Range */}
                  <p className="text-xs font-semibold tracking-wider text-gray-500 uppercase mb-2">
                    {formatYearRange(edu.start_year, edu.end_year)}
                  </p>

                  {/* Description */}
                  {edu.description && (
                    <p className="text-sm text-gray-600 leading-relaxed mt-2 line-clamp-3 break-words">
                      {edu.description}
                    </p>
                  )}
                </div>

                {/* Footer with Grade */}
                {edu.grade && (
                  <div className="px-4 py-3 border-t border-gray-200">
                    <p className="text-sm font-bold text-gray-800">
                      Grade: <span className="text-[#1a73e8]">{edu.grade}</span>
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
