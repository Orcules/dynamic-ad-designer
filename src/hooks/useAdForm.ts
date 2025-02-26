
import { useState, useCallback } from 'react';
import { Logger } from '@/utils/logger';

interface Position {
  x: number;
  y: number;
}

// Define the form state interface
interface AdFormState {
  headline: string;
  description: string;
  ctaText: string;
  accentColor: string;
  overlayColor: string;
  overlayOpacity: number;
  textColor: string;
  ctaColor: string;
  descriptionColor: string;
  templateStyle: string;
  fontUrl: string;
  imageUrls: string[];
  currentImageIndex: number;
  headlinePosition: Position;
  descriptionPosition: Position;
  ctaPosition: Position;
  imagePosition: Position;
  showCtaArrow: boolean;
}

// Default form state
const DEFAULT_FORM_STATE: AdFormState = {
  headline: 'Your headline here',
  description: 'Your description here',
  ctaText: 'Learn More',
  accentColor: '#4A90E2',
  overlayColor: '#000000',
  overlayOpacity: 0.4,
  textColor: '#FFFFFF',
  ctaColor: '#4A90E2',
  descriptionColor: '#FFFFFF',
  templateStyle: 'classic',
  fontUrl: '',
  imageUrls: [],
  currentImageIndex: 0,
  headlinePosition: { x: 50, y: 30 },
  descriptionPosition: { x: 50, y: 50 },
  ctaPosition: { x: 50, y: 70 },
  imagePosition: { x: 50, y: 50 },
  showCtaArrow: true,
};

export const useAdForm = (initialState: Partial<AdFormState> = {}) => {
  // Merge default state with initial state
  const [formState, setFormState] = useState<AdFormState>({
    ...DEFAULT_FORM_STATE,
    ...initialState,
  });
  
  // Function to update a single form field
  const updateField = useCallback(
    <K extends keyof AdFormState>(field: K, value: AdFormState[K]) => {
      Logger.info(`Updating field ${String(field)} with value:`, value);
      setFormState(prev => ({ ...prev, [field]: value }));
    },
    []
  );
  
  // Handle image URLs change
  const handleImageUrlsChange = useCallback((urls: string[]) => {
    Logger.info('Updating image URLs:', urls);
    setFormState(prev => ({ ...prev, imageUrls: urls }));
  }, []);
  
  // Handle current image index change
  const handleCurrentImageIndexChange = useCallback((index: number) => {
    Logger.info('Updating current image index:', index);
    setFormState(prev => ({ ...prev, currentImageIndex: index }));
  }, []);
  
  // Update position for draggable elements
  const updatePosition = useCallback((element: string, position: Position) => {
    const positionKey = `${element}Position` as keyof AdFormState;
    Logger.info(`Updating position for ${element}:`, position);
    setFormState(prev => ({ 
      ...prev, 
      [positionKey]: position 
    }));
  }, []);
  
  return {
    formState,
    updateField,
    handleImageUrlsChange,
    handleCurrentImageIndexChange,
    updatePosition,
  };
};

export type { AdFormState, Position };
