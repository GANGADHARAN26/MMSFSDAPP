import { ReactNode, useState } from 'react';
import Link from 'next/link';

interface AssetActionButtonProps {
  icon: ReactNode;
  label: string;
  href: string;
  disabled?: boolean;
  tooltip?: string;
}

const AssetActionButton = ({ icon, label, href, disabled = false, tooltip = '' }: AssetActionButtonProps) => {
  const [showTooltip, setShowTooltip] = useState(false);

  if (disabled) {
    return (
      <div className="relative">
        <button
          className="btn btn-secondary opacity-50 cursor-not-allowed"
          disabled
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          {icon}
          {label}
        </button>
        {tooltip && showTooltip && (
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900 text-white text-xs rounded shadow-lg whitespace-nowrap">
            {tooltip}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
          </div>
        )}
      </div>
    );
  }

  return (
    <Link href={href} className="btn btn-primary">
      {icon}
      {label}
    </Link>
  );
};

export default AssetActionButton;