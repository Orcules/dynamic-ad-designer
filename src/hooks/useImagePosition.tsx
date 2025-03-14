
import React, { useRef, useState, useEffect } from 'react';
import { calculateCoverDimensions } from '@/utils/imageEffects';

interface Position {
  x: number;
  y: number;
}

/**
 * Hook to handle image positioning and styles
 */
export function useImagePosition(
  position: Position,
  fastMode: boolean = false
) {
  const [imageStyle, setImageStyle] = useState<React.CSSProperties>({});
  const [naturalSize, setNaturalSize] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const imageElementRef = useRef<HTMLImageElement | null>(null);
  const positionRef = useRef<Position>(position);
  const lastPositionRef = useRef<Position>(position);
  const initialLoadComplete = useRef(false);
  const styleUpdateTimeoutRef = useRef<number | null>(null);
  const isUnmounted = useRef(false);
  const renderCount = useRef(0);

  // Clean up resources when component unmounts
  useEffect(() => {
    return () => {
      isUnmounted.current = true;
      if (styleUpdateTimeoutRef.current) {
        window.clearTimeout(styleUpdateTimeoutRef.current);
      }
      
      // Clear image element references to help garbage collection
      imageElementRef.current = null;
      
      // Release memory by removing style references
      setImageStyle({});
      setNaturalSize({ width: 0, height: 0 });
    };
  }, []);

  // Track position changes and apply immediately
  useEffect(() => {
    positionRef.current = position;
    if (containerRef.current && !isUnmounted.current) {
      // Compare with last position to detect actual movements
      if (position.x !== lastPositionRef.current.x || position.y !== lastPositionRef.current.y) {
        lastPositionRef.current = {...position};
        
        // Clear any pending timeout
        if (styleUpdateTimeoutRef.current) {
          window.clearTimeout(styleUpdateTimeoutRef.current);
        }
        
        // Update immediately
        if (imageElementRef.current) {
          updateImageStyle(position);
        }
      }
    }
    
    return () => {
      if (styleUpdateTimeoutRef.current) {
        window.clearTimeout(styleUpdateTimeoutRef.current);
      }
    };
  }, [position]);

  // Update container size with ResizeObserver
  useEffect(() => {
    if (!containerRef.current) return;
    
    const updateContainerSize = () => {
      if (containerRef.current && !isUnmounted.current && imageElementRef.current) {
        updateImageStyle(positionRef.current);
      }
    };
    
    let resizeObserver: ResizeObserver;
    try {
      resizeObserver = new ResizeObserver(() => {
        // Debounce resize operations for better performance
        if (styleUpdateTimeoutRef.current) {
          window.clearTimeout(styleUpdateTimeoutRef.current);
        }
        
        styleUpdateTimeoutRef.current = window.setTimeout(() => {
          updateContainerSize();
        }, 200);
      });
      
      resizeObserver.observe(containerRef.current);
    } catch (err) {
      console.error("Error setting up ResizeObserver:", err);
    }
    
    return () => {
      try {
        if (resizeObserver && containerRef.current) {
          resizeObserver.unobserve(containerRef.current);
        }
        if (resizeObserver) {
          resizeObserver.disconnect();
        }
      } catch (err) {
        console.error("Error cleaning up ResizeObserver:", err);
      }
    };
  }, []);

  // Apply crop styling on image load
  const applyCropOnLoad = useCallback((img: HTMLImageElement) => {
    if (!containerRef.current || isUnmounted.current) return;
    
    try {
      // Limit updates if we're rendering too frequently
      renderCount.current += 1;
      if (renderCount.current > 10) {
        console.log('Too many render cycles in AdPreviewImage, limiting updates');
        setTimeout(() => { renderCount.current = 0; }, 1000);
        return;
      }
      
      imageElementRef.current = img;
      
      // Make sure we have accurate natural dimensions
      const imgWidth = img.naturalWidth || img.width; 
      const imgHeight = img.naturalHeight || img.height;
      
      // Only update state if dimensions are valid and have changed
      if (imgWidth > 0 && imgHeight > 0 && 
          (imgWidth !== naturalSize.width || imgHeight !== naturalSize.height)) {
        setNaturalSize({ width: imgWidth, height: imgHeight });
      }
      
      if (!initialLoadComplete.current) {
        initialLoadComplete.current = true;
        
        // If the position is (0,0), ensure the image is properly centered
        if (position.x === 0 && position.y === 0) {
          if (styleUpdateTimeoutRef.current) {
            window.clearTimeout(styleUpdateTimeoutRef.current);
          }
          styleUpdateTimeoutRef.current = window.setTimeout(() => {
            if (!isUnmounted.current) updateImageStyle(position);
          }, 50);
        }
      }
      
      updateImageStyle(position);
    } catch (err) {
      console.error("Error in applyCropOnLoad:", err);
    }
  }, [position, naturalSize]);

  // Helper function to update image style based on position
  const updateImageStyle = useCallback((pos: Position) => {
    if (!containerRef.current || !imageElementRef.current || isUnmounted.current) return;
    
    try {
      const containerRect = containerRef.current.getBoundingClientRect();
      
      // Get latest natural dimensions from the actual element
      const imgWidth = imageElementRef.current.naturalWidth || naturalSize.width;
      const imgHeight = imageElementRef.current.naturalHeight || naturalSize.height;
      
      if (imgWidth === 0 || imgHeight === 0) {
        console.warn('Image has zero dimensions, cannot calculate cover style');
        return;
      }
      
      // Default to centered position if pos is (0,0)
      const effectivePos = (pos.x === 0 && pos.y === 0) ? 
        { x: 0, y: 0 } : // This will ensure default centering behavior
        pos;
      
      // Calculate dimensions that ensure the image completely covers the container
      const coverDimensions = calculateCoverDimensions(
        imgWidth,
        imgHeight,
        containerRect.width,
        containerRect.height,
        effectivePos.x,
        effectivePos.y
      );
      
      // Apply the styles with fixed positioning 
      setImageStyle({
        width: `${coverDimensions.width}px`,
        height: `${coverDimensions.height}px`,
        position: 'absolute',
        left: `${coverDimensions.x}px`,
        top: `${coverDimensions.y}px`,
        transform: 'none',
        transition: fastMode ? 'none' : 'width 0.1s ease-out, height 0.1s ease-out, left 0.1s ease-out, top 0.1s ease-out',
        objectFit: 'cover',
        objectPosition: 'center',
        willChange: fastMode ? 'none' : 'left, top', // Reduce GPU load when in fast mode
        zIndex: 1,
      });
    } catch (err) {
      console.error("Error in updateImageStyle:", err);
    }
  }, [fastMode, naturalSize]);

  return {
    containerRef,
    imageStyle,
    applyCropOnLoad,
    isUnmounted
  };
}
