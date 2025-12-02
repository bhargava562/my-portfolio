import { Folder, FileText } from 'lucide-react';

export default function HomeContent() {
  const items = [
    { name: 'Documents', type: 'folder', icon: Folder },
    { name: 'Pictures', type: 'folder', icon: Folder },
    { name: 'Downloads', type: 'folder', icon: Folder },
    { name: 'README.txt', type: 'file', icon: FileText },
  ];

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="w-48 bg-gray-800 border-r border-gray-700 p-4">
        <div className="text-white space-y-1">
          <div className="px-3 py-2 ubuntu-selection-bg rounded">Home</div>
          <div className="px-3 py-2 hover:bg-gray-700 rounded cursor-pointer">Desktop</div>
          <div className="px-3 py-2 hover:bg-gray-700 rounded cursor-pointer">Documents</div>
          <div className="px-3 py-2 hover:bg-gray-700 rounded cursor-pointer">Downloads</div>
          <div className="px-3 py-2 hover:bg-gray-700 rounded cursor-pointer">Pictures</div>
          <div className="border-t border-gray-700 my-2" />
          <div className="px-3 py-2 hover:bg-gray-700 rounded cursor-pointer">Trash</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Breadcrumb */}
        <div className="bg-gray-700 px-4 py-2 text-white text-sm border-b border-gray-600">
          Home
        </div>

        {/* File Grid */}
        <div className="flex-1 p-6 overflow-auto">
          <div className="grid grid-cols-4 gap-6">
            {items.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.name}
                  className="flex flex-col items-center gap-2 p-4 rounded hover:bg-gray-700 transition-colors"
                >
                  <Icon className={`w-16 h-16 ${item.type === 'folder' ? 'text-orange-500' : 'text-gray-300'}`} />
                  <span className="text-white text-sm text-center">{item.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
