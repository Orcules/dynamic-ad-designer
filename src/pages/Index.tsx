import { useState } from "react";
import { AdTemplateCard } from "@/components/AdTemplateCard";
import { AdEditor } from "@/components/AdEditor";

const templates = [
  {
    id: "facebook",
    title: "Facebook Ad",
    dimensions: "1200 x 628 px",
  },
  {
    id: "taboola",
    title: "Taboola Ad",
    dimensions: "1000 x 600 px",
  },
  {
    id: "google",
    title: "Google Display Ad",
    dimensions: "300 x 250 px",
  },
  {
    id: "story",
    title: "Story Ad",
    dimensions: "1080 x 1920 px",
  },
];

const Index = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<typeof templates[0] | null>(null);

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">Ad Creator</h1>
          <p className="text-muted-foreground">Create beautiful ads for multiple platforms</p>
        </div>

        {!selectedTemplate ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {templates.map((template) => (
              <AdTemplateCard
                key={template.id}
                title={template.title}
                dimensions={template.dimensions}
                onClick={() => setSelectedTemplate(template)}
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <AdEditor template={selectedTemplate} />
            <div className="bg-card rounded-lg p-6 animate-fade-in">
              <h3 className="text-xl font-bold mb-4">Preview</h3>
              <div
                className="w-full bg-muted rounded-lg"
                style={{ aspectRatio: selectedTemplate.id === "story" ? "9/16" : "16/9" }}
              >
                {/* Preview will be implemented here */}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;