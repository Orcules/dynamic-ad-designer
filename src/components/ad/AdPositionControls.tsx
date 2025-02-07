import React from 'react';
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

interface Position {
  x: number;
  y: number;
}

interface AdPositionControlsProps {
  headlinePosition: Position;
  descriptionPosition: Position;
  ctaPosition: Position;
  onHeadlinePositionChange: (position: Position) => void;
  onDescriptionPositionChange: (position: Position) => void;
  onCtaPositionChange: (position: Position) => void;
  descriptionColor: string;
  onDescriptionColorChange: (color: string) => void;
}

export function AdPositionControls({
  headlinePosition,
  descriptionPosition,
  ctaPosition,
  onHeadlinePositionChange,
  onDescriptionPositionChange,
  onCtaPositionChange,
  descriptionColor,
  onDescriptionColorChange,
}: AdPositionControlsProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Element Controls</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label>Headline Position</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div>
                <Label htmlFor="headline-x" className="text-xs">X</Label>
                <Input
                  id="headline-x"
                  type="number"
                  value={headlinePosition.x}
                  onChange={(e) => onHeadlinePositionChange({ 
                    ...headlinePosition, 
                    x: Number(e.target.value) 
                  })}
                />
              </div>
              <div>
                <Label htmlFor="headline-y" className="text-xs">Y</Label>
                <Input
                  id="headline-y"
                  type="number"
                  value={headlinePosition.y}
                  onChange={(e) => onHeadlinePositionChange({ 
                    ...headlinePosition, 
                    y: Number(e.target.value) 
                  })}
                />
              </div>
            </div>
          </div>

          <div>
            <Label>Description Position</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div>
                <Label htmlFor="description-x" className="text-xs">X</Label>
                <Input
                  id="description-x"
                  type="number"
                  value={descriptionPosition.x}
                  onChange={(e) => onDescriptionPositionChange({ 
                    ...descriptionPosition, 
                    x: Number(e.target.value) 
                  })}
                />
              </div>
              <div>
                <Label htmlFor="description-y" className="text-xs">Y</Label>
                <Input
                  id="description-y"
                  type="number"
                  value={descriptionPosition.y}
                  onChange={(e) => onDescriptionPositionChange({ 
                    ...descriptionPosition, 
                    y: Number(e.target.value) 
                  })}
                />
              </div>
            </div>
            <div className="mt-2">
              <Label htmlFor="description-color">Description Color</Label>
              <div className="flex gap-4 mt-1">
                <Input
                  type="color"
                  id="description_color"
                  value={descriptionColor}
                  onChange={(e) => onDescriptionColorChange(e.target.value)}
                  className="w-16 h-10 p-1"
                />
                <Input
                  type="text"
                  value={descriptionColor}
                  onChange={(e) => onDescriptionColorChange(e.target.value)}
                  placeholder="#333333"
                  className="flex-1"
                />
              </div>
            </div>
          </div>

          <div>
            <Label>CTA Position</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div>
                <Label htmlFor="cta-x" className="text-xs">X</Label>
                <Input
                  id="cta-x"
                  type="number"
                  value={ctaPosition.x}
                  onChange={(e) => onCtaPositionChange({ 
                    ...ctaPosition, 
                    x: Number(e.target.value) 
                  })}
                />
              </div>
              <div>
                <Label htmlFor="cta-y" className="text-xs">Y</Label>
                <Input
                  id="cta-y"
                  type="number"
                  value={ctaPosition.y}
                  onChange={(e) => onCtaPositionChange({ 
                    ...ctaPosition, 
                    y: Number(e.target.value) 
                  })}
                />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}