
import React, { useState, useEffect } from 'react';
import { useAdSubmission } from '@/hooks/useAdSubmission';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Logger } from '@/utils/logger';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BucketDetails } from '@/utils/types';

const TestUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [anonKey, setAnonKey] = useState<string | null>(null);
  const [bucketDetails, setBucketDetails] = useState<BucketDetails | null>(null);
  
  const {
    handleSubmission,
    isSubmitting, 
    lastError,
    bucketStatus,
    checkBucketStatus,
    createBucket
  } = useAdSubmission();

  // בדיקות מצב בטעינה
  useEffect(() => {
    addLog('Initializing diagnostic page...');
    
    // 1. בדיקת משתמש אנונימי
    const checkAnon = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          addLog(`Session found: ${session.user.id}`);
          setUserId(session.user.id);
        } else {
          addLog('No active session, using anonymous access');
          setUserId('anonymous');
        }
        
        // 2. בדיקת מפתח API - fix for protected property
        // Instead of accessing supabaseKey directly, we'll extract it from the auth header
        const authHeader = supabase.auth.headers();
        if (authHeader && authHeader.Authorization) {
          const apiKey = authHeader.Authorization.split(' ')[1];
          if (apiKey) {
            const shortKey = apiKey.substring(0, 5);
            setAnonKey(`${shortKey}...`);
            addLog(`API Key detected (starts with: ${shortKey}...)`);
          }
        }
      } catch (error) {
        addLog(`Error checking session: ${error instanceof Error ? error.message : String(error)}`);
      }
    };
    
    checkAnon();
    checkBucketStatus();
  }, []);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setErrorMessage(null);
      addLog(`File selected: ${selectedFile.name} (${Math.round(selectedFile.size / 1024)} KB, ${selectedFile.type})`);
    }
  };
  
  const checkBucketDetails = async () => {
    setLoading(true);
    addLog('Checking bucket details...');
    
    try {
      // בדיקת רשימת באקטים
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      
      if (bucketsError) {
        addLog(`Error listing buckets: ${bucketsError.message}`);
        setErrorMessage(`Error listing buckets: ${bucketsError.message}`);
        setBucketDetails({ count: 0, buckets: [], error: bucketsError.message });
      } else {
        addLog(`Found ${buckets.length} buckets:`);
        
        // מידע מפורט על כל הבאקטים
        const details: BucketDetails = {
          count: buckets.length,
          buckets: buckets.map(b => ({
            name: b.name,
            public: b.public,
            created_at: b.created_at
          }))
        };
        
        setBucketDetails(details);
        
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
              details.fileCount = files.length;
              
              // נוסיף כמה קבצים לדוגמה
              if (files.length > 0) {
                details.sampleFiles = files.slice(0, 3).map(f => ({
                  name: f.name,
                  size: f.metadata?.size || 'unknown',
                  created_at: f.created_at
                }));
              }
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
  
  const createBucketWithDetails = async () => {
    setLoading(true);
    addLog('Creating ad-images bucket with detailed logging...');
    
    try {
      // 1. ניסיון ישיר ליצירת הבאקט
      addLog('Attempt 1: Using supabase.storage.createBucket() directly');
      const { error: directError } = await supabase.storage.createBucket('ad-images', { 
        public: true,
        fileSizeLimit: 10485760 // 10MB
      });
      
      if (directError) {
        addLog(`❌ Direct creation failed: ${directError.message}`);
        
        // 2. ניסיון ליצירה באמצעות הפונקציה שלנו
        addLog('Attempt 2: Using our enhanced createBucket()');
        const success = await createBucket();
        
        if (success) {
          addLog('✅ Enhanced bucket creation succeeded');
          toast.success('Storage bucket created!');
        } else {
          addLog('❌ Enhanced bucket creation also failed');
          
          // 3. ניסיון ליצירה דרך Edge Function
          addLog('Attempt 3: Using Edge Function');
          const { error: funcError } = await supabase.functions.invoke('create_storage_policy', {
            body: { bucket_name: 'ad-images' }
          });
          
          if (funcError) {
            addLog(`❌ Edge Function failed: ${funcError.message}`);
            setErrorMessage(`All bucket creation attempts failed. Last error: ${funcError.message}`);
          } else {
            addLog('✅ Edge Function executed, checking if bucket exists now');
            const exists = await checkBucketStatus();
            
            if (exists) {
              addLog('✅ Bucket now exists after Edge Function call');
              toast.success('Storage bucket created via Edge Function!');
            } else {
              addLog('❌ Bucket still does not exist after Edge Function call');
              setErrorMessage('All creation attempts failed. The bucket still does not exist.');
            }
          }
        }
      } else {
        addLog('✅ Direct bucket creation succeeded');
        toast.success('Storage bucket created directly!');
        await checkBucketStatus();
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      addLog(`❌ Exception in bucket creation: ${errorMsg}`);
      setErrorMessage(`Exception in bucket creation: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };
  
  const callEdgeFunction = async () => {
    setLoading(true);
    addLog('Calling create_storage_policy Edge Function with detailed parameters...');
    
    try {
      const { data, error } = await supabase.functions.invoke('create_storage_policy', {
        body: { 
          bucket_name: 'ad-images',
          detailed: true
        }
      });
      
      if (error) {
        addLog(`❌ Error calling function: ${error.message}`);
        setErrorMessage(`Error calling function: ${error.message}`);
      } else {
        addLog(`✅ Function response: ${JSON.stringify(data)}`);
        toast.success('Edge Function executed successfully!');
        
        // בדיקה אם הבאקט קיים אחרי הפעלת הפונקציה
        setTimeout(async () => {
          const exists = await checkBucketStatus();
          if (exists) {
            addLog('✅ Bucket exists after Edge Function call');
          } else {
            addLog('⚠️ Bucket still does not exist after Edge Function call');
          }
        }, 1000);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      addLog(`❌ Exception: ${errorMsg}`);
      setErrorMessage(`Exception calling Edge Function: ${errorMsg}`);
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
    addLog(`Starting upload process for file: ${file.name} (${file.size} bytes, ${file.type})`);
    
    try {
      // בדיקת מצב הבאקט לפני העלאה
      const bucketExists = await checkBucketStatus();
      addLog(`Bucket status before upload: ${bucketExists ? 'exists' : 'not found'}`);
      
      if (!bucketExists) {
        addLog('Bucket does not exist, creating it before upload...');
        const created = await createBucket();
        addLog(`Bucket creation result: ${created ? 'success' : 'failed'}`);
      }
      
      // ניסיון העלאה
      addLog('Uploading file...');
      const url = await handleSubmission(file);
      
      if (url) {
        setUploadedUrl(url);
        addLog(`✅ Upload successful: ${url}`);
        toast.success('File uploaded successfully!');
        
        // בדיקה אם ה-URL נגיש
        try {
          addLog('Verifying URL accessibility...');
          const response = await fetch(url, { method: 'HEAD' });
          if (response.ok) {
            addLog('✅ URL is accessible');
          } else {
            addLog(`⚠️ URL returned status ${response.status}`);
          }
        } catch (fetchError) {
          addLog(`⚠️ URL verification failed: ${fetchError instanceof Error ? fetchError.message : String(fetchError)}`);
        }
      } else {
        addLog('❌ Upload failed or returned null URL');
        setErrorMessage('Upload failed: No URL returned');
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      addLog(`❌ Upload exception: ${errorMsg}`);
      setErrorMessage(`Upload failed: ${errorMsg}`);
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
  
  // Helper לקבלת צבע בדג' סטטוס
  const getBucketStatusColor = () => {
    switch (bucketStatus) {
      case 'exists': return 'bg-green-500';
      case 'not_exists': return 'bg-yellow-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };
  
  const getBucketStatusIcon = () => {
    switch (bucketStatus) {
      case 'exists': return <CheckCircle className="h-4 w-4 mr-1" />;
      case 'not_exists': return <XCircle className="h-4 w-4 mr-1" />;
      case 'error': return <AlertCircle className="h-4 w-4 mr-1" />;
      default: return null;
    }
  };
  
  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="flex items-center gap-2 mb-6">
        <Link to="/" className="text-primary hover:text-primary/80">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold">Storage Upload Diagnostics</h1>
      </div>
      
      <div className="grid gap-6 mb-6">
        {/* סטטוס מערכת */}
        <div className="bg-card p-4 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">System Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-medium">User:</span>
                <Badge variant="outline">{userId || 'Checking...'}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">API Key:</span>
                <Badge variant="outline">{anonKey || 'Unknown'}</Badge>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-medium">Bucket Status:</span>
                <div className="flex items-center">
                  {getBucketStatusIcon()}
                  <Badge className={getBucketStatusColor()}>
                    {bucketStatus.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
              {lastError && (
                <div className="text-sm text-red-500">
                  Last error: {lastError}
                </div>
              )}
            </div>
          </div>
        </div>
      
        {/* ניהול bucket */}
        <div className="bg-card p-4 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Storage Bucket Management</h2>
          <div className="flex flex-wrap gap-2 mb-4">
            <Button onClick={checkBucketDetails} disabled={loading} variant="outline">
              Check Bucket Details
            </Button>
            <Button onClick={createBucketWithDetails} disabled={loading} variant="outline">
              Create Bucket
            </Button>
            <Button onClick={callEdgeFunction} disabled={loading} variant="outline">
              Call Edge Function
            </Button>
          </div>
          
          {bucketDetails && (
            <div className="mt-4 p-3 bg-accent/10 rounded border">
              <h3 className="font-medium mb-2">Bucket Details:</h3>
              <pre className="text-xs overflow-x-auto p-2 bg-background rounded">
                {JSON.stringify(bucketDetails, null, 2)}
              </pre>
            </div>
          )}
        </div>
        
        {/* טופס העלאה */}
        <div className="bg-card p-4 rounded-lg shadow-sm">
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
          
          <Button 
            onClick={handleUpload} 
            disabled={!file || loading || isSubmitting}
            className="w-full"
          >
            {loading || isSubmitting ? 'Uploading...' : 'Upload File'}
          </Button>
          
          {errorMessage && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
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
      </div>
      
      {/* לוגים */}
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
