// app/dashboard/team/loading.tsx
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';

export default function TeamLoading() {
    return (
        <div className='space-y-6'>
            {/* Team Usage Card Skeleton */}
            <Card className='border-neutral-800 bg-neutral-900 animate-pulse'>
                <CardHeader className='pb-3'>
                    <CardTitle className='text-lg'>Team Usage</CardTitle>
                    <CardDescription>Loading team data…</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className='h-4 w-1/2 bg-neutral-700 rounded my-4' />
                    <div className='h-2 w-full bg-neutral-800 rounded' />
                </CardContent>
            </Card>
            {/* Team Members Table Skeleton */}
            <Card className='border-neutral-800 bg-neutral-900 animate-pulse'>
                <CardHeader>
                    <CardTitle className='text-lg'>Team Members</CardTitle>
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
