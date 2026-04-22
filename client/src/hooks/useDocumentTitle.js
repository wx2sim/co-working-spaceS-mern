import { useEffect } from 'react';

/**
 * useDocumentTitle - Custom hook to update the browser tab title.
 * @param {string} title - The title to display in the tab.
 * @param {boolean} prevailOnUnmount - Whether the title should stay after unmounting.
 */
export default function useDocumentTitle(title, prevailOnUnmount = false) {
  useEffect(() => {
    const originalTitle = document.title;
    document.title = title;

    return () => {
      if (!prevailOnUnmount) {
        document.title = originalTitle;
      }
    };
  }, [title, prevailOnUnmount]);
}
