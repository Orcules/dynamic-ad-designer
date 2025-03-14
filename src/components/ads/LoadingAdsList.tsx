
import React from 'react';

export const LoadingAdsList: React.FC = () => {
  return (
    <div className="animate-pulse flex flex-col gap-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-24 bg-muted rounded-lg"></div>
      ))}
    </div>
  );
};
