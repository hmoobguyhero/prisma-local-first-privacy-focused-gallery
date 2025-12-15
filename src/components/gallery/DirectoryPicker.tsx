import React from 'react';
import { FolderSearch, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
interface DirectoryPickerProps {
  onSelectDirectory: () => void;
  hasCachedHandle: boolean;
  directoryName?: string | null;
}
export function DirectoryPicker({ onSelectDirectory, hasCachedHandle, directoryName }: DirectoryPickerProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        <div className="flex justify-center">
          <div className="p-6 bg-primary/5 rounded-full">
            <FolderSearch className="w-16 h-16 text-primary" />
          </div>
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Prisma Gallery
        </h1>
        <p className="max-w-md mx-auto text-lg text-muted-foreground">
          A stunning, private, local-first photo gallery. Your photos stay on your device.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            size="lg"
            onClick={onSelectDirectory}
            className="w-full sm:w-auto text-lg px-8 py-6 shadow-lg hover:shadow-primary/50 transition-shadow duration-300"
          >
            {hasCachedHandle && directoryName ? `Open '${directoryName}'` : 'Select Photo Library'}
          </Button>
        </div>
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <ShieldCheck className="w-4 h-4 text-green-500" />
          <span>Zero-upload. 100% private.</span>
        </div>
      </motion.div>
    </div>
  );
}