interface AssetStatusBadgeProps {
  available: number;
  total: number;
}

const AssetStatusBadge = ({ available, total }: AssetStatusBadgeProps) => {
  // Calculate the percentage of available assets
  const percentage = total > 0 ? (available / total) * 100 : 0;

  // Determine the badge color based on the percentage
  let badgeClass = '';
  let statusText = '';

  if (percentage === 0) {
    badgeClass = 'bg-red-100 text-red-800';
    statusText = 'Depleted';
  } else if (percentage < 25) {
    badgeClass = 'bg-red-100 text-red-800';
    statusText = 'Critical';
  } else if (percentage < 50) {
    badgeClass = 'bg-yellow-100 text-yellow-800';
    statusText = 'Low';
  } else if (percentage < 75) {
    badgeClass = 'bg-blue-100 text-blue-800';
    statusText = 'Adequate';
  } else {
    badgeClass = 'bg-green-100 text-green-800';
    statusText = 'Sufficient';
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badgeClass}`}>
      {statusText}
    </span>
  );
};

export default AssetStatusBadge;