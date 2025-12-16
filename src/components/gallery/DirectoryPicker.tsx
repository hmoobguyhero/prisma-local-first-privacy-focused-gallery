import React, { useState, useEffect } from 'react';
import { FolderSearch, ShieldCheck, XCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
interface DirectoryPickerProps {
  onSelectDirectory: () => void;
  hasCachedHandle: boolean;
  directoryName?: string | null;
}
function IFrameDetectionBanner() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (window.self !== window.top) {
      setShow(true);
    }
  }, []);
  if (!show) {
    return null;
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="fixed top-4 left-1/2 transform -translate-x-1/2 w-[calc(100%-2rem)] max-w-lg z-50"
    >
      <div className="bg-destructive/10 border border-destructive/30 rounded-xl shadow-lg p-4 backdrop-blur-sm">
        <div className="flex items-start gap-3">
          <XCircle className="h-5 w-5 flex-shrink-0 text-destructive mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-destructive-foreground mb-1">
              Directory Picker is Blocked in Previews
            </p>
            <p className="text-sm text-destructive-foreground/90 mb-3">
              For security, browsers block local folder access in iframes. For the full experience, open this page in a new tab or run the project locally.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(location.href, '_blank')}
              className="bg-background/50 hover:bg-background/70"
            >
              Open in New Tab
            </Button>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto h-7 w-7 -mt-1 -mr-1 text-destructive-foreground/80 hover:text-destructive-foreground"
            onClick={() => setShow(false)}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Dismiss</span>
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
export function DirectoryPicker({ onSelectDirectory, hasCachedHandle, directoryName }: DirectoryPickerProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-4">
      <IFrameDetectionBanner />
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