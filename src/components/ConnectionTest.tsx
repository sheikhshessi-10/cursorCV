import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Wifi, WifiOff, AlertTriangle } from 'lucide-react';

export const ConnectionTest = () => {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [networkStatus, setNetworkStatus] = useState<'online' | 'offline' | 'unknown'>('unknown');

  useEffect(() => {
    // Check initial network status
    setNetworkStatus(navigator.onLine ? 'online' : 'offline');

    // Listen for network changes
    const handleOnline = () => setNetworkStatus('online');
    const handleOffline = () => setNetworkStatus('offline');

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const testConnection = async () => {
    setTesting(true);
    setResults(null);

    try {
      console.log('🔍 Testing Supabase connection...');
      
      // Test 1: Basic network connectivity
      console.log('🌐 Testing basic network connectivity...');
      const networkTest = await fetch('https://httpbin.org/get');
      console.log('Network test result:', networkTest.status, networkTest.statusText);

      // Test 2: DNS resolution for new Supabase URL
      console.log('🔍 Testing DNS resolution for new Supabase...');
      const dnsTest = await fetch('https://vmwlbtiwgggnoccgmoiq.supabase.co/rest/v1/', {
        method: 'GET',
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtd2xidGl3Z2dnbm9jY2dtb2lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwODQ3NTAsImV4cCI6MjA3MTY2MDc1MH0.hTv5kM-dF_ipgXCqSXoz5tOJrh3X4w2XA7u64sn95Xc',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtd2xidGl3Z2dnbm9jY2dtb2lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwODQ3NTAsImV4cCI6MjA3MTY2MDc1MH0.hTv5kM-dF_ipgXCqSXoz5tOJrh3X4w2XA7u64sn95Xc'
        }
      });
      console.log('DNS test result:', dnsTest.status, dnsTest.statusText);

      // Test 3: Supabase auth connection
      console.log('🔐 Testing Supabase auth...');
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      console.log('Session test result:', { sessionData, sessionError });

      // Test 4: Simple query (this will fail until we create the tables)
      console.log('📊 Testing database query...');
      const { data: queryData, error: queryError } = await supabase
        .from('applications')
        .select('count')
        .limit(1);
      console.log('Query test result:', { queryData, queryError });

      const results = {
        network: { success: networkTest.ok, status: networkTest.status },
        dns: { success: dnsTest.ok, status: dnsTest.status },
        session: { success: !sessionError, error: sessionError },
        query: { success: !queryError, error: queryError }
      };

      setResults(results);

      // Check results
      const allTestsPassed = networkTest.ok && dnsTest.ok && !sessionError && !queryError;
      
      if (allTestsPassed) {
        toast.success('All connection tests passed!');
      } else {
        if (!networkTest.ok) {
          toast.error('Network connectivity issue detected');
        } else if (!dnsTest.ok) {
          toast.error('DNS resolution issue detected');
        } else if (sessionError) {
          toast.error('Supabase auth connection failed');
        } else if (queryError) {
          // Query error is expected until we create the tables
          toast.info('Connection working! Database tables need to be created.');
        }
      }

    } catch (error) {
      console.error('❌ Connection test failed:', error);
      setResults({ error: error.message });
      
      if (error.message.includes('fetch')) {
        toast.error('Network request failed - check your internet connection');
      } else if (error.message.includes('ERR_NAME_NOT_RESOLVED')) {
        toast.error('DNS resolution failed - check your network settings');
      } else {
        toast.error('Connection test failed with exception');
      }
    } finally {
      setTesting(false);
    }
  };

  const getNetworkIcon = () => {
    switch (networkStatus) {
      case 'online':
        return <Wifi className="h-4 w-4 text-green-600" />;
      case 'offline':
        return <WifiOff className="h-4 w-4 text-red-600" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getNetworkText = () => {
    switch (networkStatus) {
      case 'online':
        return 'Online';
      case 'offline':
        return 'Offline';
      default:
        return 'Unknown';
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>🔍 Connection Diagnostics</span>
          <div className={`flex items-center space-x-2 text-sm ${networkStatus === 'online' ? 'text-green-600' : networkStatus === 'offline' ? 'text-red-600' : 'text-yellow-600'}`}>
            {getNetworkIcon()}
            <span>{getNetworkText()}</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={testConnection} 
          disabled={testing || networkStatus === 'offline'}
          className="w-full"
        >
          {testing ? 'Testing...' : 'Run Diagnostics'}
        </Button>

        {networkStatus === 'offline' && (
          <div className="p-3 bg-red-100 border border-red-300 rounded-lg">
            <p className="text-sm text-red-800">
              <strong>⚠️ No Internet Connection</strong>
            </p>
            <p className="text-xs text-red-700 mt-1">
              Please check your internet connection and try again.
            </p>
          </div>
        )}

        {results && (
          <div className="space-y-2 text-sm">
            <h4 className="font-medium">Test Results:</h4>
            
            {results.network && (
              <div className={`p-2 rounded ${results.network.success ? 'bg-green-100' : 'bg-red-100'}`}>
                <strong>🌐 Network:</strong> {results.network.success ? '✅ Connected' : '❌ Failed'} (Status: {results.network.status})
              </div>
            )}

            {results.dns && (
              <div className={`p-2 rounded ${results.dns.success ? 'bg-green-100' : 'bg-red-100'}`}>
                <strong>🔍 DNS:</strong> {results.dns.success ? '✅ Resolved' : '❌ Failed'} (Status: {results.dns.status})
              </div>
            )}

            {results.session && (
              <div className={`p-2 rounded ${results.session.success ? 'bg-green-100' : 'bg-red-100'}`}>
                <strong>🔐 Auth:</strong> {results.session.success ? '✅ Connected' : '❌ Failed'}
                {results.session.error && <div className="text-red-600">{results.session.error.message}</div>}
              </div>
            )}

            {results.query && (
              <div className={`p-2 rounded ${results.query.success ? 'bg-green-100' : 'bg-red-100'}`}>
                <strong>📊 Database:</strong> {results.query.success ? '✅ Connected' : '❌ Failed'}
                {results.query.error && <div className="text-red-600">{results.query.error.message}</div>}
              </div>
            )}

            {results.error && (
              <div className="p-2 rounded bg-red-100 text-red-600">
                <strong>❌ Exception:</strong> {results.error}
              </div>
            )}
          </div>
        )}

        <div className="text-xs text-gray-500 space-y-1">
          <p>This will test:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Basic network connectivity</li>
            <li>DNS resolution for Supabase</li>
            <li>Supabase authentication</li>
            <li>Database query capability</li>
          </ul>
          <p className="mt-2 text-blue-600">
            <strong>Note:</strong> Database query will fail until you run the SQL setup script.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
