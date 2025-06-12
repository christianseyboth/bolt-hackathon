import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function DashboardLoading() {
    return (
        <div className='space-y-6'>
            {/* Header Skeleton */}
            <div className='animate-pulse'>
                <div className='h-8 w-48 md:w-64 bg-neutral-700 rounded mb-2' />
                <div className='h-4 w-32 md:w-48 bg-neutral-800 rounded' />
            </div>

            {/* Grid Layout Skeleton - Responsive */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                {/* Card 1 */}
                <Card className='border-neutral-800 bg-neutral-900 animate-pulse'>
                    <CardHeader className='pb-3'>
                        <div className='h-5 w-32 bg-neutral-700 rounded mb-2' />
                        <div className='h-3 w-48 bg-neutral-800 rounded' />
                    </CardHeader>
                    <CardContent>
                        <div className='h-4 w-3/4 bg-neutral-700 rounded mb-4' />
                        <div className='h-2 w-full bg-neutral-800 rounded mb-2' />
                        <div className='h-32 w-full bg-neutral-800 rounded' />
                    </CardContent>
                </Card>

                {/* Card 2 */}
                <Card className='border-neutral-800 bg-neutral-900 animate-pulse'>
                    <CardHeader className='pb-3'>
                        <div className='h-5 w-36 bg-neutral-700 rounded mb-2' />
                        <div className='h-3 w-40 bg-neutral-800 rounded' />
                    </CardHeader>
                    <CardContent>
                        <div className='space-y-3'>
                            <div className='h-4 w-full bg-neutral-700 rounded' />
                            <div className='h-4 w-5/6 bg-neutral-700 rounded' />
                            <div className='h-4 w-4/5 bg-neutral-700 rounded' />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Three Column Grid Skeleton */}
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                {[...Array(3)].map((_, i) => (
                    <Card key={i} className='border-neutral-800 bg-neutral-900 animate-pulse'>
                        <CardHeader>
                            <div className='h-5 w-28 bg-neutral-700 rounded' />
                        </CardHeader>
                        <CardContent>
                            <div className='space-y-2'>
                                {[...Array(3)].map((_, j) => (
                                    <div key={j} className='flex justify-between items-center'>
                                        <div className='h-3 w-16 md:w-20 bg-neutral-700 rounded' />
                                        <div className='h-3 w-12 md:w-16 bg-neutral-800 rounded' />
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Table Skeleton */}
            <Card className='border-neutral-800 bg-neutral-900 animate-pulse'>
                <CardHeader>
                    <div className='h-5 w-32 bg-neutral-700 rounded' />
                </CardHeader>
                <CardContent>
                    {/* Mobile: Stack layout */}
                    <div className='md:hidden space-y-4'>
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className='p-3 bg-neutral-800/50 rounded'>
                                <div className='h-4 w-3/4 bg-neutral-700 rounded mb-2' />
                                <div className='h-3 w-1/2 bg-neutral-800 rounded mb-2' />
                                <div className='h-3 w-2/3 bg-neutral-800 rounded' />
                            </div>
                        ))}
                    </div>

                    {/* Desktop: Table layout */}
                    <div className='hidden md:block space-y-2'>
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className='flex space-x-4'>
                                <div className='h-4 w-24 bg-neutral-700 rounded' />
                                <div className='h-4 w-32 bg-neutral-700 rounded' />
                                <div className='h-4 w-48 bg-neutral-700 rounded' />
                                <div className='h-4 w-20 bg-neutral-700 rounded' />
                                <div className='h-4 w-16 bg-neutral-800 rounded' />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
