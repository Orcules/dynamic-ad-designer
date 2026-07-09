import { toast } from "sonner";

export const validateAdSubmission = (platform: string, hasImages: boolean) => {
  if (!platform) {
    toast.error('Please select a platform');
    return false;
  }

  if (!hasImages) {
    toast.error('Please select at least one image');
    return false;
  }

  return true;
};