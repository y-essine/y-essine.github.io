import React from 'react';
import { Calendar, Briefcase, MapPin } from 'lucide-react';

interface WorkItemProps {
  title: string;
  company: string;
  period: string;
  location: string;
  description: string;
  isCurrent?: boolean;
}

export const WorkItem: React.FC<WorkItemProps> = ({
  title,
  company,
  period,
  location,
  description,
  isCurrent = false
}) => {
  return (
    <li className="border-b border-[#292929] pb-8 last:border-b-0">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div className="flex items-start gap-3">
            <h3 className="text-white text-base font-normal">{title}</h3>
            {isCurrent && (
              <span className="inline-flex items-center px-3 py-1 rounded text-xs font-normal bg-[#42342b] text-[#d0a58b] shadow-lg">
                Current
              </span>
            )}
          </div>
        </div>
        
        <div className="flex flex-wrap gap-4 text-sm text-[#919191]">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>{period}</span>
          </div>
          <div className="flex items-center gap-2">
            <Briefcase className="w-4 h-4" />
            <span>{company}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            <span>{location}</span>
          </div>
        </div>
        
        <p className="text-base text-[#919191] leading-relaxed">
          {description}
        </p>
      </div>
    </li>
  );
};
