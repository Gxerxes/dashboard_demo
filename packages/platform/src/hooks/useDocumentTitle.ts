import { useEffect } from 'react';

export function useDocumentTitle(title: string, appName: string = 'HKEX Post Trade'): void {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = title ? `${title} | ${appName}` : appName;
    return () => {
      document.title = previousTitle;
    };
  }, [title, appName]);
}