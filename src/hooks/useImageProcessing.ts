
import { useRef } from "react";
import { Logger } from "@/utils/logger";

export function useImageProcessing() {
  const processedIndexes = useRef<Set<number>>(new Set());

  const markIndexProcessed = (index: number) => {
    processedIndexes.current.add(index);
    Logger.info(`Marked index ${index} as processed. Total processed: ${processedIndexes.current.size}`);
  };

  const isIndexProcessed = (index: number): boolean => {
    return processedIndexes.current.has(index);
  };

  const resetProcessedIndexes = () => {
    processedIndexes.current = new Set();
    Logger.info("Reset processed indexes");
  };

  const getUnprocessedIndexes = (length: number): number[] => {
    return Array.from({ length }, (_, i) => i)
      .filter(i => !processedIndexes.current.has(i));
  };

  return {
    markIndexProcessed,
    isIndexProcessed,
    resetProcessedIndexes,
    getUnprocessedIndexes
  };
}
