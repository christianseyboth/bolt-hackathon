import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function SecurityAnalysisLoading() {
    return (
        <div className='space-y-6 flex-col'>
            {/* Team Usage Card Skeleton */}
            <Card className='border-neutral-800 bg-neutral-900 animate-pulse'>
                <CardHeader className='pb-3'>
                    <CardTitle className='text-lg'>Loading</CardTitle>
                    <CardDescription>Security Analytics Data…</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className='h-4 w-1/2 bg-neutral-700 rounded my-4' />
                    <div className='h-2 w-full bg-neutral-800 rounded' />
                </CardContent>
            </Card>
            {/* Dashboard Table Skeleton */}
            <Card className='border-neutral-800 bg-neutral-900 animate-pulse'>
                <CardHeader>
                    <CardTitle className='text-lg'>Security Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className='space-y-2'>
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className='flex space-x-4'>
                                <div className='h-4 w-24 bg-neutral-700 rounded' />
                                <div className='h-4 w-16 bg-neutral-700 rounded' />
                                <div className='h-4 w-32 bg-neutral-700 rounded' />
                                <div className='h-4 w-20 bg-neutral-700 rounded' />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
