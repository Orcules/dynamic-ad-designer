
import { useState, useRef } from "react";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { useAdSubmission } from "./useAdSubmission";
import { processImages } from "@/utils/adImageProcessing";
import { ImageGenerator } from "@/utils/ImageGenerator";
import { Logger } from "@/utils/logger";

interface Position {
  x: number;
  y: number;
}

interface UseAdGenerationProps {
  adData: any;
  onAdGenerated: (adData: any) => void;
  selectedImages?: File[];
  imageUrls?: string[];
  currentPreviewIndex?: number;
}

export function useAdGeneration({
  adData,
  onAdGenerated,
  selectedImages = [],
  imageUrls = [],
  currentPreviewIndex = 0
}: UseAdGenerationProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentProcessingIndex, setCurrentProcessingIndex] = useState(-1);
  const [processingStatus, setProcessingStatus] = useState("");
  const imageGeneratorRef = useRef<ImageGenerator | null>(null);
  const { handleSubmission } = useAdSubmission();

  const generateAds = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isGenerating) {
      toast.info("Already generating ads, please wait");
      return;
    }
    
    if (imageUrls.length === 0) {
      toast.error("No images selected");
      return;
    }
    
    try {
      setIsGenerating(true);
      setCurrentProcessingIndex(0);
      setProcessingStatus("Starting generation...");
      
      const positions = {
        headlinePosition: adData.headline_position || { x: 0, y: 0 },
        descriptionPosition: adData.description_position || { x: 0, y: 0 },
        ctaPosition: adData.cta_position || { x: 0, y: 0 },
        imagePosition: adData.image_position || { x: 0, y: 0 }
      };
      
      const allImages = [
        ...imageUrls.map((url): string => url),
        ...selectedImages.map((file): File => file)
      ];
      
      Logger.info(`Starting to process ${allImages.length} images`);
      
      // Delegate to image processing utility 
      await processImages(
        adData,
        allImages,
        { current: document.querySelector('.ad-content') } as React.RefObject<HTMLDivElement>,
        onAdGenerated,
        handleSubmission,
        setIsGenerating,
        positions
      );
      
    } catch (error) {
      Logger.error(`Error generating ads: ${error instanceof Error ? error.message : String(error)}`);
      toast.error(`Failed to generate ads: ${error instanceof Error ? error.message : String(error)}`);
      setIsGenerating(false);
    }
  };

  return {
    isGenerating,
    currentProcessingIndex,
    processingStatus,
    imageGeneratorRef,
    generateAds,
    selectedImages,
    imageUrls,
    currentPreviewIndex
  };
}
