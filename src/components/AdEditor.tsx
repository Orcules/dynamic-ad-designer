import React, { useRef } from "react";
import { AdFormContainer } from "./AdFormContainer";
import { AdPreview } from "./AdPreview";
import { handleAdSubmission } from "./AdSubmissionHandler";
import { getDimensions } from "@/utils/adDimensions";
import { toast } from "sonner";
import { useAdImageHandler } from "./ad/AdImageHandler";

interface Template {
  id: string;
  title: string;
  dimensions: string;
  imageUrl: string;
  description: string;
}

interface AdEditorProps {
  template: Template;
  onAdGenerated: (adData: any) => void;
}

const AdEditor: React.FC<AdEditorProps> = ({ template, onAdGenerated }) => {
  const [adData, setAdData] = React.useState({
    name: "",
    headline: "",
    cta_text: "",
    font_url: "",
    platform: "facebook",
    template_style: "",
    accent_color: "#4A90E2",
    cta_color: "#4A90E2",
    overlay_color: "#000000"
  });
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [overlayOpacity, setOverlayOpacity] = React.useState(0.4);
  const previewRef = useRef<HTMLDivElement>(null);
  const processedImages = useRef(new Set<string>());

  const {
    selectedImages,
    imageUrls,
    currentPreviewIndex,
    handleImageChange,
    handleImageUrlsChange,
    handlePrevPreview,
    handleNextPreview
  } = useAdImageHandler({
    onImageChange: (urls) => {
      console.log("Images changed:", urls);
    },
    onCurrentIndexChange: (index) => {
      console.log("Current index changed:", index);
    }
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAdData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleOpacityChange = (value: number) => {
    setOverlayOpacity(value);
  };

  const handleFontChange = (value: string) => {
    setAdData((prev) => ({
      ...prev,
      font_url: value,
    }));
  };

  const handlePlatformChange = (value: string) => {
    setAdData((prev) => ({
      ...prev,
      platform: value,
    }));
  };

  const handleStyleChange = (value: string) => {
    setAdData((prev) => ({
      ...prev,
      template_style: value,
    }));
  };

  const handleColorChange = (value: string) => {
    setAdData((prev) => ({
      ...prev,
      accent_color: value,
    }));
  };

  const handleCtaColorChange = (value: string) => {
    setAdData((prev) => ({
      ...prev,
      cta_color: value,
    }));
  };

  const handleOverlayColorChange = (value: string) => {
    setAdData((prev) => ({
      ...prev,
      overlay_color: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!adData.platform) {
      toast.error('Please select a platform');
      return;
    }

    if (imageUrls.length === 0 && selectedImages.length === 0) {
      toast.error('Please select at least one image');
      return;
    }

    setIsGenerating(true);
    const toastId = toast.loading(`Generating ${imageUrls.length || selectedImages.length} ads...`);

    try {
      const dimensions = getDimensions(adData.platform);
      const enrichedAdData = { ...adData, ...dimensions };
      let successCount = 0;

      // Process uploaded files
      if (selectedImages.length > 0) {
        for (let i = 0; i < selectedImages.length; i++) {
          const imageFile = selectedImages[i];
          const imageId = `${imageFile.name}-${imageFile.size}`;
          
          // Skip if this image has already been processed
          if (processedImages.current.has(imageId)) {
            continue;
          }

          try {
            // Create a unique preview for each image
            if (previewRef.current) {
              const previewImage = document.createElement('img');
              previewImage.src = URL.createObjectURL(imageFile);
              await new Promise((resolve) => {
                previewImage.onload = resolve;
              });
              
              const existingImage = previewRef.current.querySelector('img');
              if (existingImage) {
                existingImage.src = previewImage.src;
              }

              // Wait for styles to be applied
              await new Promise(resolve => setTimeout(resolve, 100));
            }

            await handleAdSubmission({
              adData: {
                ...enrichedAdData,
                name: `${adData.name}-${i + 1}`
              },
              selectedImage: imageFile,
              previewRef,
              onSuccess: onAdGenerated,
              setIsGenerating,
            });
            
            processedImages.current.add(imageId);
            successCount++;
          } catch (error) {
            console.error(`Error processing image ${i + 1}:`, error);
            toast.error(`Error processing image ${i + 1}`);
          }
        }
      }

      // Process image URLs
      if (imageUrls.length > 0) {
        for (let i = 0; i < imageUrls.length; i++) {
          const imageUrl = imageUrls[i];
          
          // Skip if this URL has already been processed
          if (processedImages.current.has(imageUrl)) {
            continue;
          }

          try {
            // Create a unique preview for each URL
            if (previewRef.current) {
              const previewImage = document.createElement('img');
              previewImage.src = imageUrl;
              await new Promise((resolve) => {
                previewImage.onload = resolve;
              });
              
              const existingImage = previewRef.current.querySelector('img');
              if (existingImage) {
                existingImage.src = imageUrl;
              }

              // Wait for styles to be applied
              await new Promise(resolve => setTimeout(resolve, 100));
            }

            const response = await fetch(imageUrl);
            if (!response.ok) {
              throw new Error(`Failed to fetch image ${i + 1}`);
            }
            const blob = await response.blob();
            const file = new File([blob], `image_${i + 1}.jpg`, { type: 'image/jpeg' });
            
            await handleAdSubmission({
              adData: {
                ...enrichedAdData,
                name: `${adData.name}-${i + 1}`
              },
              selectedImage: file,
              previewRef,
              onSuccess: onAdGenerated,
              setIsGenerating,
            });
            
            processedImages.current.add(imageUrl);
            successCount++;
          } catch (error) {
            console.error(`Error processing URL ${i + 1}:`, error);
            toast.error(`Error processing URL ${i + 1}`);
          }
        }
      }

      toast.dismiss(toastId);
      if (successCount > 0) {
        toast.success(`Successfully generated ${successCount} ad${successCount > 1 ? 's' : ''}`);
        // Clear the processed images set after successful generation
        processedImages.current.clear();
      }
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      toast.error('Error generating ads');
    } finally {
      setIsGenerating(false);
      toast.dismiss(toastId);
    }
  };

  const { width, height } = getDimensions(adData.platform);

  return (
    <div className="flex flex-col gap-8">
      <AdFormContainer
        adData={adData}
        isGenerating={isGenerating}
        onInputChange={handleInputChange}
        onFontChange={handleFontChange}
        onPlatformChange={handlePlatformChange}
        onStyleChange={handleStyleChange}
        onColorChange={handleColorChange}
        onCtaColorChange={handleCtaColorChange}
        onOverlayColorChange={handleOverlayColorChange}
        onImageChange={handleImageChange}
        onImageUrlsChange={handleImageUrlsChange}
        onSubmit={handleSubmit}
        overlayOpacity={overlayOpacity}
        onOpacityChange={handleOpacityChange}
      />

      <div ref={previewRef} className="preview-container">
        <AdPreview
          imageUrl={imageUrls[currentPreviewIndex]}
          imageUrls={imageUrls}
          width={width}
          height={height}
          headline={adData.headline}
          ctaText={adData.cta_text}
          templateStyle={adData.template_style}
          accentColor={adData.accent_color}
          ctaColor={adData.cta_color}
          overlayColor={adData.overlay_color}
          fontUrl={adData.font_url}
          overlayOpacity={overlayOpacity}
          currentIndex={currentPreviewIndex}
          onPrevious={handlePrevPreview}
          onNext={handleNextPreview}
        />
      </div>
    </div>
  );
};

export default AdEditor;