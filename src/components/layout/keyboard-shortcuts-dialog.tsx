'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { useHotkeys } from '@/hooks/use-hotkeys';
import { useState } from 'react';

export default function KeyboardShortcutsDialog() {
    const [open, setOpen] = useState(false);
    
    useHotkeys([{
        keys: ['?'],
        callback: () => setOpen(o => !o),
        preventDefault: true,
    }], []);

    const shortcuts = [
        { keys: 'Ctrl + T', description: 'Add new transaction (Expense)' },
        { keys: 'Ctrl + I', description: 'Add new transaction (Income)' },
        { keys: 'Ctrl + S', description: 'Save the open transaction form' },
        { keys: 'Delete', description: 'Delete selected transaction(s)' },
        { keys: 'Esc', description: 'Close any open dialog or modal' },
        { keys: '?', description: 'Show this help dialog' },
    ];

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Keyboard Shortcuts</DialogTitle>
                    <DialogDescription>Boost your productivity with these shortcuts.</DialogDescription>
                </DialogHeader>
                <div className="mt-4 space-y-2">
                    {shortcuts.map(shortcut => (
                        <div key={shortcut.keys} className="flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">{shortcut.description}</p>
                            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                                {shortcut.keys}
                            </kbd>
                        </div>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
}
