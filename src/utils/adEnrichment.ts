import { getDimensions } from "./adDimensions";

export const enrichAdData = (adData: any, index?: number) => {
  const dimensions = getDimensions(adData.platform);
  const enrichedData = { 
    ...adData, 
    ...dimensions 
  };
  
  if (typeof index === 'number') {
    enrichedData.name = `${adData.name}-${index + 1}`;
  }
  
  return enrichedData;
};