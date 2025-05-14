import { ReactNode } from 'react';

interface DashboardTableProps {
  headers: string[];
  data: (string | ReactNode)[][];
  icon?: ReactNode;
  emptyMessage?: string;
}

const DashboardTable = ({ headers, data, icon, emptyMessage = 'No data available' }: DashboardTableProps) => {
  return (
    <div className="overflow-x-auto">
      {data.length > 0 ? (
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {headers.map((header, index) => (
                <th
                  key={index}
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="py-12 text-center">
          {icon && <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100">{icon}</div>}
          <h3 className="mt-2 text-sm font-medium text-gray-900">{emptyMessage}</h3>
        </div>
      )}
    </div>
  );
};

export default DashboardTable;