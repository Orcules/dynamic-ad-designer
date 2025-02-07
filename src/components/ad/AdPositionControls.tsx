import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Label } from "../ui/label";
import { Input } from "../ui/input";

interface Position {
  x: number;
  y: number;
}

interface AdPositionControlsProps {
  headlinePosition: Position;
  descriptionPosition: Position;
  ctaPosition: Position;
  imagePosition: Position;
  onHeadlinePositionChange: (position: Position) => void;
  onDescriptionPositionChange: (position: Position) => void;
  onCtaPositionChange: (position: Position) => void;
  onImagePositionChange: (position: Position) => void;
}

export function AdPositionControls({
  headlinePosition,
  descriptionPosition,
  ctaPosition,
  imagePosition,
  onHeadlinePositionChange,
  onDescriptionPositionChange,
  onCtaPositionChange,
  onImagePositionChange,
}: AdPositionControlsProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Element Controls</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label>Background Image Position</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div>
                <Label htmlFor="image-x" className="text-xs">X</Label>
                <Input
                  id="image-x"
                  type="number"
                  value={imagePosition.x}
                  onChange={(e) => onImagePositionChange({ 
                    ...imagePosition, 
                    x: Number(e.target.value) 
                  })}
                />
              </div>
              <div>
                <Label htmlFor="image-y" className="text-xs">Y</Label>
                <Input
                  id="image-y"
                  type="number"
                  value={imagePosition.y}
                  onChange={(e) => onImagePositionChange({ 
                    ...imagePosition, 
                    y: Number(e.target.value) 
                  })}
                />
              </div>
            </div>
          </div>

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