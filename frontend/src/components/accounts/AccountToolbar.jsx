import { Download, FileSpreadsheet, Plus } from "lucide-react";

export default function AccountToolbar({
  fileInputRef,
  onImport,
  onExport,
  onAddCustomers,
}) {
  return (
    <div className="mb-6 flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Accounts</h1>
        <p className="mt-2 text-sm text-gray-600">
          Manage customer accounts and account status.
        </p>
      </div>
      <div className="flex gap-3">
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls"
          onChange={onImport}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:border-gray-500 hover:text-gray-900"
        >
          <FileSpreadsheet className="h-4 w-4" />
          Import Excel
        </button>
        <button
          type="button"
          onClick={onExport}
          className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:border-gray-500 hover:text-gray-900"
        >
          <Download className="h-4 w-4" />
          Export Excel
        </button>
        <button
          type="button"
          onClick={onAddCustomers}
          className="inline-flex items-center gap-2 rounded-md bg-black px-5 py-2 text-sm text-white hover:bg-gray-800"
        >
          <Plus className="h-4 w-4" />
          Add customers
        </button>
      </div>
    </div>
  );
}
