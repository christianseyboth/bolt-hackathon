'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function DebugSubscriptionTest() {
    const [accountId, setAccountId] = useState('');
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const testSubscriptionUpdate = async () => {
        if (!accountId) {
            alert('Please enter an account ID');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('/api/debug/test-subscription-update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ accountId }),
            });

            const data = await response.json();
            setResult(data);
        } catch (error) {
            setResult({
                error: 'Request failed',
                details: error instanceof Error ? error.message : 'Unknown error',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='container mx-auto p-8'>
            <Card>
                <CardHeader>
                    <CardTitle>Debug Subscription Update</CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                    <div>
                        <Label htmlFor='accountId'>Account ID</Label>
                        <Input
                            id='accountId'
                            value={accountId}
                            onChange={(e) => setAccountId(e.target.value)}
                            placeholder='Enter account ID to test'
                        />
                    </div>

                    <Button onClick={testSubscriptionUpdate} disabled={loading}>
                        {loading ? 'Testing...' : 'Test Subscription Update'}
                    </Button>

                    {result && (
                        <div className='mt-4'>
                            <h3 className='font-semibold mb-2'>Result:</h3>
                            <pre className='bg-gray-100 p-4 rounded text-sm overflow-auto'>
                                {JSON.stringify(result, null, 2)}
                            </pre>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
