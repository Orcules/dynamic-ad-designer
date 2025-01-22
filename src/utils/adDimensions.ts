export const getDimensions = (platform: string) => {
  switch (platform) {
    case "facebook":
      return { width: 1200, height: 628 };
    case "instagram":
      return { width: 1080, height: 1080 };
    case "linkedin":
      return { width: 1200, height: 627 };
    case "twitter":
      return { width: 1600, height: 900 };
    default:
      return { width: 1200, height: 628 };
  }
};