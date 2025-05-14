import { ReactNode } from 'react';

interface DashboardCardProps {
  title: string;
  children: ReactNode;
  action?: ReactNode;
}

const DashboardCard = ({ title, children, action }: DashboardCardProps) => {
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <h3 className="text-lg leading-6 font-medium text-gray-900">{title}</h3>
        {action && <div>{action}</div>}
      </div>
      <div className="px-4 py-5 sm:p-6">{children}</div>
    </div>
  );
};

export default DashboardCard;