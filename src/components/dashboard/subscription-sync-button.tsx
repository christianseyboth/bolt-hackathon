'use client';

interface SubscriptionSyncButtonProps {
    accountId: string;
}

export function SubscriptionSyncButton({ accountId }: SubscriptionSyncButtonProps) {
    const handleSync = async () => {
        try {
            const response = await fetch('/api/debug/sync-subscription', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ accountId })
            });
            const data = await response.json();
            if (data.success) {
                alert('✅ Sync successful! Refresh the page to see updates.');
                window.location.reload();
            } else {
                alert(`❌ Sync failed: ${data.error}`);
            }
        } catch (error) {
            alert(`❌ Error: ${error}`);
        }
    };

    const handleTest = async () => {
        try {
            const response = await fetch('/api/debug/test-sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ accountId })
            });
            const data = await response.json();
            console.log('🧪 Test result:', data);
            if (data.success) {
                alert('✅ Test passed! All connections working.');
            } else {
                alert(`❌ Test failed: ${data.error}`);
            }
        } catch (error) {
            console.error('Test error:', error);
            alert(`❌ Test error: ${error}`);
        }
    };

    const handleSimpleTest = async () => {
        try {
            const response = await fetch('/api/debug/simple-test', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ accountId })
            });
            const data = await response.json();
            console.log('🔍 Simple test result:', data);
            if (data.success) {
                alert(`✅ Simple test passed!\n\nAccount: ${data.account.email}\nSubscriptions: ${data.subscriptions.length}\n\nCheck console for details.`);
            } else {
                alert(`❌ Simple test failed: ${data.error}\n\nDetails: ${data.message}`);
            }
        } catch (error) {
            console.error('Simple test error:', error);
            alert(`❌ Simple test error: ${error}`);
        }
    };

    const handleSubscriptionDetails = async () => {
        try {
            const response = await fetch('/api/debug/subscription-details', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ accountId })
            });
            const data = await response.json();
            console.log('📋 Subscription details:', data);
            if (data.success) {
                const methods = data.methods;
                alert(`📋 Subscription Details:\n\nList method timestamps: ${methods.list.current_period_start} (${methods.list.type_start})\nRetrieve method timestamps: ${methods.retrieve.current_period_start} (${methods.retrieve.type_start})\nExpanded method timestamps: ${methods.expanded.current_period_start} (${methods.expanded.type_start})\n\nCheck console for full details.`);
            } else {
                alert(`❌ Details test failed: ${data.error}`);
            }
        } catch (error) {
            console.error('Details test error:', error);
            alert(`❌ Details test error: ${error}`);
        }
    };

    const handleCheckSchema = async () => {
        try {
            const response = await fetch('/api/debug/check-schema', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ accountId })
            });
            const data = await response.json();
            console.log('🗄️ Schema check result:', data);
            if (data.success) {
                const columnNames = data.columns.map((col: any) => col.column_name).join(', ');
                alert(`🗄️ Subscriptions Table Schema:\n\nColumns: ${columnNames}\n\nExisting records: ${data.existing_subscriptions?.length || 0}\n\nCheck console for full details.`);
            } else {
                alert(`❌ Schema check failed: ${data.error}`);
            }
        } catch (error) {
            console.error('Schema check error:', error);
            alert(`❌ Schema check error: ${error}`);
        }
    };

    return (
        <div className='mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg'>
            <h3 className='font-medium text-blue-400 mb-2'>Debug: Manual Sync</h3>
            <p className='text-sm text-neutral-400 mb-3'>
                If your subscription isn't showing correctly, use these tools to debug and sync data from Stripe.
            </p>
            <div className='space-x-2 space-y-2'>
                <div>
                    <button
                        onClick={handleTest}
                        className='px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700'
                    >
                        Test Connection
                    </button>
                    <button
                        onClick={handleSimpleTest}
                        className='px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm ml-2'
                    >
                        Simple Test
                    </button>
                    <button
                        onClick={handleCheckSchema}
                        className='px-3 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 text-sm ml-2'
                    >
                        Check Schema
                    </button>
                </div>
                <div>
                    <button
                        onClick={handleSubscriptionDetails}
                        className='px-3 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 text-sm'
                    >
                        Subscription Details
                    </button>
                    <button
                        onClick={handleSync}
                        className='px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 ml-2'
                    >
                        Sync Subscription
                    </button>
                </div>
            </div>
        </div>
    );
}
