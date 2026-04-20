import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';

// Constants for adaptive polling
const BASE_INTERVAL = 2000;      // 2 seconds
const MAX_INTERVAL = 60000;      // 60 seconds
const BACKOFF_MULTIPLIER = 2;    // Double the interval
const EMPTY_THRESHOLD = 3;       // Increase interval after 3 empty responses

/**
 * useAdaptivePolling - Intelligently polls an endpoint, adjusting frequency based on data receipt and tab visibility.
 * 
 * @param {string} url - The URL to poll
 * @param {function} onDataArrival - Callback function to handle arrived data
 * @param {boolean} enabled - Whether polling is currently active
 * @param {string} timestampQueryParam - the key for the timestamp query param (e.g. 'since')
 */
export default function useAdaptivePolling(url, onDataArrival, enabled = true, timestampQueryParam = 'since') {
  const [lastCheck, setLastCheck] = useState(new Date().toISOString());
  const intervalRef = useRef(null);
  const consecutiveEmptyRef = useRef(0);
  const currentIntervalMsRef = useRef(BASE_INTERVAL);
  const isVisibleRef = useRef(document.visibilityState === 'visible');
  const fetchingRef = useRef(false);

  // Expose a method to immediately reset polling to fast mode (e.g. when user sends a message)
  const resetPolling = useCallback(() => {
    consecutiveEmptyRef.current = 0;
    currentIntervalMsRef.current = BASE_INTERVAL;
    scheduleNextPoll();
  }, []);

  const executePoll = useCallback(async () => {
    // If not enabled, not visible, or already fetching, skip
    if (!enabled || !isVisibleRef.current || fetchingRef.current) {
        scheduleNextPoll();
        return;
    }

    fetchingRef.current = true;
    const requestTimestamp = new Date().toISOString();

    try {
      // Append query param if needed
      const separator = url.includes('?') ? '&' : '?';
      const pollUrl = timestampQueryParam 
        ? `${url}${separator}${timestampQueryParam}=${encodeURIComponent(lastCheck)}`
        : url;

      const { data } = await axios.get(pollUrl);
      
      const hasNewData = Array.isArray(data) ? data.length > 0 : !!data; // Simple heuristic

      if (hasNewData) {
        // Reset backoff since we got data
        consecutiveEmptyRef.current = 0;
        currentIntervalMsRef.current = BASE_INTERVAL;
        onDataArrival(data);
      } else {
        // Increment empty counter
        consecutiveEmptyRef.current += 1;
        if (consecutiveEmptyRef.current >= EMPTY_THRESHOLD) {
          // Double the interval up to MAX_INTERVAL
          currentIntervalMsRef.current = Math.min(
            currentIntervalMsRef.current * BACKOFF_MULTIPLIER, 
            MAX_INTERVAL
          );
        }
      }

      // Update timestamp for next poll
      setLastCheck(requestTimestamp);

    } catch (error) {
      // Graceful error handling (429 Too Many Requests, 500, etc)
      // We quietly backoff massively to avoid spamming a struggling server
      currentIntervalMsRef.current = MAX_INTERVAL;
    } finally {
      fetchingRef.current = false;
      scheduleNextPoll(); // Schedule the next tick
    }
  }, [url, enabled, lastCheck, onDataArrival, timestampQueryParam]);

  const scheduleNextPoll = useCallback(() => {
    if (intervalRef.current) {
      clearTimeout(intervalRef.current);
    }
    if (enabled && isVisibleRef.current) {
      intervalRef.current = setTimeout(executePoll, currentIntervalMsRef.current);
    }
  }, [enabled, executePoll]);

  // Handle Visibility API
  useEffect(() => {
    const handleVisibilityChange = () => {
      isVisibleRef.current = document.visibilityState === 'visible';
      if (isVisibleRef.current) {
        // Tab became visible again, immediately switch back to fast polling
        resetPolling();
      } else {
        // Tab went hidden, clear current fast timer
        if (intervalRef.current) {
          clearTimeout(intervalRef.current);
        }
      }
    };

    const handleFocus = () => {
       if (!isVisibleRef.current) {
         isVisibleRef.current = true;
         resetPolling();
       }
    };

    const handleBlur = () => {
       // Optional: treat blur similar to hidden
       isVisibleRef.current = false;
       if (intervalRef.current) {
        clearTimeout(intervalRef.current);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, [resetPolling]);

  // Master controller effect
  useEffect(() => {
    if (enabled) {
      scheduleNextPoll();
    }
    return () => {
      // Cleanup guaranteed
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, scheduleNextPoll]);

  return { resetPolling };
}
