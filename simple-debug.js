// Simple debug script - paste this in browser console
const simpleDebug = async () => {
    const accountId = 'eec54f6a-aaf6-4ac8-9c77-d7c113914cf2';

    console.log('🚀 SIMPLE DEBUG: Testing sync directly...');

    try {
        // Test the sync API directly
        console.log('🔄 Testing sync API...');

        const syncResponse = await fetch('/api/stripe/sync-subscription-status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ accountId }),
        });

        const syncResult = await syncResponse.json();

        console.log('📊 Sync Response Status:', syncResponse.status);
        console.log('📊 Sync Result:', syncResult);

        if (!syncResponse.ok) {
            console.error('❌ SYNC FAILED:', syncResult);

            // Let's try the debug sync for more details
            console.log('🔧 Trying debug sync for more info...');

            const debugResponse = await fetch('/api/debug/sync-subscription', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ accountId }),
            });

            const debugResult = await debugResponse.json();

            console.log('🔧 Debug Response Status:', debugResponse.status);
            console.log('🔧 Debug Result:', debugResult);
        } else {
            console.log('✅ SYNC SUCCEEDED!');
            console.log('🎉 Your subscription should now be updated');
        }
    } catch (error) {
        console.error('❌ Error during debug:', error);
    }
};

console.log('🚀 Simple debug loaded. Run: simpleDebug()');
simpleDebug();
