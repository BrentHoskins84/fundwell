'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface CopyLinkButtonProps {
  url: string;
  code: string;
}

export function CopyLinkButton({ url, code }: CopyLinkButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      // TODO: Replace with proper error handling
      console.error('Failed to copy:', error);
    }
  }

  return (
    <Button variant="orange" size="sm" onClick={handleCopy}>
      {copied ? (
        <>
          <Check className="mr-2 h-4 w-4" />
          Copied!
        </>
      ) : (
        <>
          <Copy className="mr-2 h-4 w-4" />
          Share ({code})
        </>
      )}
    </Button>
  );
}

