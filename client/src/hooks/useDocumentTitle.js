import { useEffect } from 'react';
import { clientConfig } from '../config/clientConfig.js';

export default function useDocumentTitle(title) {
  useEffect(() => {
    const base = clientConfig.appName || 'ArchiveX';
    document.title = title ? `${title} · ${base}` : base;
  }, [title]);
}
