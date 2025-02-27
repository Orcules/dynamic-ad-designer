
import React, { useState } from 'react';
import { useAdSubmission } from '@/hooks/useAdSubmission';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Logger } from '@/utils/logger';
import { supabase } from '@/integrations/supabase/client';

const TestUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  
  const { handleSubmission, isSubmitting } = useAdSubmission();
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setErrorMessage(null);
    }
  };
  
  const checkBucketStatus = async () => {
    setLoading(true);
    addLog('Checking bucket status...');
    
    try {
      // בדיקת רשימת באקטים
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      
      if (bucketsError) {
        addLog(`Error listing buckets: ${bucketsError.message}`);
        setErrorMessage(`Error listing buckets: ${bucketsError.message}`);
      } else {
        addLog(`Found ${buckets.length} buckets:`);
        buckets.forEach(bucket => addLog(`- ${bucket.name} (public: ${bucket.public})`));
        
        const adImagesBucket = buckets.find(b => b.name === 'ad-images');
        if (adImagesBucket) {
          addLog('✅ ad-images bucket exists');
          
          // בדיקת תכולת הבאקט
          try {
            const { data: files, error: listError } = await supabase.storage
              .from('ad-images')
              .list();
              
            if (listError) {
              addLog(`❌ Error listing files: ${listError.message}`);
            } else {
              addLog(`Found ${files.length} files in bucket`);
            }
          } catch (e) {
            addLog(`❌ Exception listing files: ${e instanceof Error ? e.message : String(e)}`);
          }
        } else {
          addLog('❌ ad-images bucket does not exist');
        }
      }
    } catch (error) {
      addLog(`❌ Exception: ${error instanceof Error ? error.message : String(error)}`);
      setErrorMessage(`Exception: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };
  
  const createBucket = async () => {
    setLoading(true);
    addLog('Creating ad-images bucket...');
    
    try {
      const { error } = await supabase.storage.createBucket('ad-images', { 
        public: true 
      });
      
      if (error) {
        addLog(`❌ Error creating bucket: ${error.message}`);
        setErrorMessage(`Error creating bucket: ${error.message}`);
      } else {
        addLog('✅ Bucket created successfully');
        toast.success('Storage bucket created!');
      }
    } catch (error) {
      addLog(`❌ Exception: ${error instanceof Error ? error.message : String(error)}`);
      setErrorMessage(`Exception: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };
  
  const callCreatePolicyFunction = async () => {
    setLoading(true);
    addLog('Calling create_storage_policy Edge Function...');
    
    try {
      const { data, error } = await supabase.functions.invoke('create_storage_policy');
      
      if (error) {
        addLog(`❌ Error calling function: ${error.message}`);
        setErrorMessage(`Error calling function: ${error.message}`);
      } else {
        addLog(`✅ Function response: ${JSON.stringify(data)}`);
        toast.success('Storage policy created!');
      }
    } catch (error) {
      addLog(`❌ Exception: ${error instanceof Error ? error.message : String(error)}`);
      setErrorMessage(`Exception: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };
  
  const handleUpload = async () => {
    if (!file) {
      setErrorMessage('Please select a file first');
      return;
    }
    
    setLoading(true);
    setErrorMessage(null);
    setUploadedUrl(null);
    addLog(`Uploading file: ${file.name} (${file.size} bytes, ${file.type})`);
    
    try {
      const url = await handleSubmission(file);
      setUploadedUrl(url);
      addLog(`✅ Upload successful: ${url}`);
      toast.success('File uploaded successfully!');
    } catch (error) {
      addLog(`❌ Upload failed: ${error instanceof Error ? error.message : String(error)}`);
      setErrorMessage(`Upload failed: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };
  
  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toISOString().split('T')[1].split('.')[0]} - ${message}`]);
    Logger.info(message);
  };
  
  const clearLogs = () => {
    setLogs([]);
  };
  
  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">Storage Upload Test</h1>
      
      <div className="bg-card p-4 rounded-lg shadow-sm mb-6">
        <h2 className="text-xl font-semibold mb-4">Storage Bucket Management</h2>
        <div className="flex flex-wrap gap-2 mb-4">
          <Button onClick={checkBucketStatus} disabled={loading}>
            Check Bucket Status
          </Button>
          <Button onClick={createBucket} disabled={loading} variant="outline">
            Create Bucket
          </Button>
          <Button onClick={callCreatePolicyFunction} disabled={loading} variant="outline">
            Create Storage Policy
          </Button>
        </div>
      </div>
      
      <div className="bg-card p-4 rounded-lg shadow-sm mb-6">
        <h2 className="text-xl font-semibold mb-4">File Upload Test</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Select Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full bg-background p-2 rounded border border-input"
          />
        </div>
        
        {file && (
          <div className="mb-4">
            <p>Selected: {file.name} ({Math.round(file.size / 1024)} KB)</p>
          </div>
        )}
        
        <Button onClick={handleUpload} disabled={!file || loading || isSubmitting}>
          {loading || isSubmitting ? 'Uploading...' : 'Upload File'}
        </Button>
        
        {errorMessage && (
          <div className="mt-4 p-3 bg-destructive/10 border border-destructive rounded text-destructive">
            {errorMessage}
          </div>
        )}
        
        {uploadedUrl && (
          <div className="mt-4">
            <p className="mb-2 font-semibold">Uploaded Successfully:</p>
            <div className="bg-background p-2 rounded border border-input break-all">
              <a href={uploadedUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                {uploadedUrl}
              </a>
            </div>
            <div className="mt-4">
              <p className="mb-2 font-semibold">Preview:</p>
              <img src={uploadedUrl} alt="Uploaded" className="max-w-full h-auto max-h-60 object-contain border rounded" />
            </div>
          </div>
        )}
      </div>
      
      <div className="bg-card p-4 rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Logs</h2>
          <Button onClick={clearLogs} variant="outline" size="sm">Clear</Button>
        </div>
        <div className="bg-background p-3 rounded border border-input h-60 overflow-y-auto font-mono text-xs">
          {logs.length === 0 ? (
            <p className="text-muted-foreground">No logs yet. Actions will be logged here.</p>
          ) : (
            logs.map((log, idx) => (
              <div key={idx} className="py-1 border-b border-input last:border-0">
                {log}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TestUpload;
