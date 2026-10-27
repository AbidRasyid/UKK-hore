import CustomerRow from "./accountRow";

export default function CustomerTable({ loading, customers, onDelete }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full rounded-lg border border-gray-200 bg-white">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">No</th>
            <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Name</th>
            <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Account number</th>
            <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Student ID</th>
            <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Class</th>
            <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Status</th>
            <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                Loading...
              </td>
            </tr>
          ) : customers.length > 0 ? (
            customers.map((customer, index) => (
              <CustomerRow
                key={customer.id}
                customer={customer}
                index={index}
                onDelete={onDelete}
              />
            ))
          ) : (
            <tr>
              <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                No customer accounts found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
