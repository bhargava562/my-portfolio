import { FolderPlus, Clipboard, MousePointer, Image, Settings } from 'lucide-react';
import { motion } from 'motion/react';

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
}

export default function ContextMenu({ x, y, onClose }: ContextMenuProps) {
  const menuItems = [
    { icon: FolderPlus, label: 'New Folder', action: () => console.log('New Folder') },
    { icon: Clipboard, label: 'Paste', action: () => console.log('Paste') },
    { icon: MousePointer, label: 'Select All', action: () => console.log('Select All') },
    { divider: true },
    { icon: Image, label: 'Change Background', action: () => console.log('Change Background') },
    { icon: Settings, label: 'Settings', action: () => console.log('Settings') },
  ];

  return (
    <>
      <div className="fixed inset-0 z-50" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.1 }}
        className="fixed z-50 ubuntu-window-bg rounded-lg shadow-2xl py-2 min-w-[200px] text-white"
        style={{ left: x, top: y }}
      >
        {menuItems.map((item, index) => {
          if (item.divider) {
            return <div key={index} className="border-t border-gray-600 my-1" />;
          }

          const Icon = item.icon!;
          return (
            <button
              key={index}
              onClick={() => {
                item.action!();
                onClose();
              }}
              className="w-full flex items-center gap-3 px-4 py-2 hover:ubuntu-orange-bg transition-colors"
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </motion.div>
    </>
  );
}
