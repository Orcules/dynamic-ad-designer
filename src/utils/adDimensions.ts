
export const getDimensions = (platform: string) => {
  switch (platform) {
    case "facebook":
      return { width: 1200, height: 628 };
    case "instagram":
      return { width: 1080, height: 1080 };
    case "instagram-story":
      return { width: 1080, height: 1350 };
    case "linkedin":
      return { width: 1200, height: 627 };
    case "twitter":
      return { width: 1600, height: 900 };
    default:
      return { width: 1200, height: 628 };
  }
};

// New helper function to calculate aspect ratio
export const getAspectRatio = (platform: string): number => {
  const { width, height } = getDimensions(platform);
  return width / height;
};

// New helper function to check if dimensions match a platform
export const getPlatformFromDimensions = (width: number, height: number): string | null => {
  const ratio = width / height;
  
  // Check with some tolerance for rounding errors
  const isClose = (a: number, b: number, tolerance = 0.01) => Math.abs(a - b) < tolerance;
  
  if (isClose(ratio, 1200/628)) return "facebook";
  if (isClose(ratio, 1)) return "instagram";
  if (isClose(ratio, 1080/1350)) return "instagram-story";
  if (isClose(ratio, 1200/627)) return "linkedin";
  if (isClose(ratio, 16/9)) return "twitter";
  
  return null;
};
