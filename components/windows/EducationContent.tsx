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
    // Container query context
    <div className="h-full overflow-y-auto bg-gradient-to-br from-[#f8f9fa] to-[#e8eaed] @container">
      <div className="p-2 @sm:p-3 @md:p-4 @lg:p-6 w-full">
        {/* Header */}
        <div className="mb-3 @sm:mb-4 @md:mb-6 @lg:mb-8">
          <h1 className="text-lg @sm:text-xl @md:text-2xl @lg:text-3xl font-semibold text-[#3c4043] mb-1 @sm:mb-2">
            Education
          </h1>
          <p className="text-[#5f6368] text-[10px] @sm:text-xs @md:text-sm">
            {education.length} {education.length === 1 ? "record" : "records"}
          </p>
        </div>

        {/* Grid of Education Cards — Container query responsive: 1 col → 2 cols (@3xl/768px) → 3 cols (@4xl) */}
        <div className="grid grid-cols-1 @3xl:grid-cols-2 @4xl:grid-cols-3 gap-3 @sm:gap-4 @md:gap-5 @lg:gap-6 w-full">
          {education.map((edu, index) => {
            const gradientClass = CLASSROOM_GRADIENTS[index % CLASSROOM_GRADIENTS.length];

            return (
              <div
                key={edu.id || `edu-${index}`}
                className="transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-white rounded-xl overflow-hidden border border-gray-200/60 flex flex-col h-full min-w-0"
              >
                {/* Colored Header Banner */}
                <div
                  className={`relative h-20 @sm:h-24 @md:h-28 px-3 @sm:px-4 pt-2 @sm:pt-3 @md:pt-4 pb-1.5 @sm:pb-2 flex flex-col justify-between ${gradientClass} min-w-0`}
                >
                  {/* Institution Name */}
                  <h3 className="text-sm @sm:text-lg @md:text-xl font-semibold text-white truncate drop-shadow-sm min-w-0 overflow-hidden text-ellipsis">
                    {edu.institution_name || "Unknown Institution"}
                  </h3>

                  {/* Degree & Field */}
                  <p className="text-[10px] @sm:text-xs @md:text-sm font-medium text-white/90 mt-0.5 @sm:mt-1 truncate min-w-0 overflow-hidden text-ellipsis">
                    {edu.degree || "Degree"}
                    {edu.field_of_study && ` in ${edu.field_of_study}`}
                  </p>

                  {/* Avatar Overlay */}
                  <div className="absolute -bottom-4 @sm:-bottom-5 @md:-bottom-6 right-2 @sm:right-3 @md:right-4 w-8 @sm:w-10 @md:w-12 h-8 @sm:h-10 @md:h-12 bg-white rounded-full border-3 @sm:border-4 border-white flex items-center justify-center shadow-md flex-shrink-0">
                    <GraduationCap className="w-4 h-4 @sm:w-5 @sm:h-5 @md:w-6 @md:h-6 text-[#5f6368]" />
                  </div>
                </div>

                {/* White Body Section */}
                <div className="px-3 @sm:px-4 pt-5 @sm:pt-6 @md:pt-8 pb-2 @sm:pb-3 @md:pb-4 flex-1 flex flex-col min-w-0">
                  {/* Year Range */}
                  <p className="text-[8px] @sm:text-[9px] @md:text-xs font-semibold tracking-wider text-gray-500 uppercase mb-1.5 @sm:mb-2 min-w-0">
                    {formatYearRange(edu.start_year, edu.end_year)}
                  </p>

                  {/* Description */}
                  {edu.description && (
                    <p className="text-[10px] @sm:text-xs @md:text-sm text-gray-600 leading-relaxed mt-1 @sm:mt-2 line-clamp-3 break-words min-w-0">
                      {edu.description}
                    </p>
                  )}
                </div>

                {/* Footer with Grade */}
                {edu.grade && (
                  <div className="px-3 @sm:px-4 py-2 @sm:py-3 border-t border-gray-200 min-w-0">
                    <p className="text-[10px] @sm:text-xs @md:text-sm font-bold text-gray-800 min-w-0 truncate">
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