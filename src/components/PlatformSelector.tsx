
import React from "react";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

const platforms = [
  { id: "facebook", name: "Facebook", dimensions: "1200 x 628" },
  { id: "taboola", name: "Taboola", dimensions: "1200 x 628" },
  { id: "google", name: "Google", dimensions: "1200 x 628" },
  { id: "instagram", name: "Instagram", dimensions: "1080 x 1080" },
  { id: "instagram-story", name: "Instagram Story", dimensions: "1080 x 1350" },
];

interface PlatformSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function PlatformSelector({ value, onChange }: PlatformSelectorProps) {
  // Simple function to handle platform selection
  const handleSelect = (platformId: string) => {
    if (platformId !== value) {
      onChange(platformId);
    }
  };
  
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Platform</label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {platforms.map((platform) => (
          <Button
            key={platform.id}
            type="button"
            variant={platform.id === value ? "default" : "outline"}
            className="flex justify-between items-center w-full"
            onClick={() => handleSelect(platform.id)}
          >
            <span className="truncate mr-2">
              {platform.name} ({platform.dimensions})
            </span>
            {platform.id === value && <Check className="h-4 w-4" />}
          </Button>
        ))}
      </div>
    </div>
  );
}
