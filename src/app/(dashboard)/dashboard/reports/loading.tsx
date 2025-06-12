import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function ReportsLoading() {
    return (
        <div className='space-y-6'>
            {/* Header Skeleton */}
            <div className='animate-pulse'>
                <div className='h-8 w-48 md:w-64 bg-neutral-700 rounded mb-2' />
                <div className='h-4 w-64 md:w-96 bg-neutral-800 rounded' />
            </div>

            {/* Quick Reports & Custom Report Builder Grid Skeleton */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                {/* Quick Reports Card Skeleton */}
                <Card className='border-neutral-800 bg-neutral-900 animate-pulse'>
                    <CardHeader className='pb-4'>
                        <div className='flex items-center gap-2 mb-2'>
                            <div className='h-5 w-5 bg-neutral-700 rounded' />
                            <div className='h-5 w-28 bg-neutral-700 rounded' />
                        </div>
                        <div className='h-3 w-48 bg-neutral-800 rounded' />
                    </CardHeader>
                    <CardContent className='space-y-4'>
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className='flex items-center justify-between p-4 bg-neutral-800/30 rounded-lg border border-neutral-700'>
                                <div className='flex items-start gap-3 flex-1'>
                                    <div className='p-2 bg-neutral-700 rounded-lg'>
                                        <div className='h-5 w-5 bg-neutral-600 rounded' />
                                    </div>
                                    <div className='flex-1 min-w-0'>
                                        <div className='flex items-center gap-2 mb-1'>
                                            <div className='h-4 w-32 bg-neutral-700 rounded' />
                                            <div className='h-4 w-16 bg-neutral-800 rounded-full' />
                                        </div>
                                        <div className='h-3 w-48 bg-neutral-800 rounded mb-2' />
                                        <div className='flex items-center gap-3'>
                                            <div className='h-3 w-16 bg-neutral-800 rounded' />
                                            <div className='h-3 w-12 bg-neutral-800 rounded' />
                                        </div>
                                    </div>
                                </div>
                                <div className='h-8 w-10 bg-neutral-700 rounded ml-4' />
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Custom Report Builder Card Skeleton */}
                <Card className='border-neutral-800 bg-neutral-900 animate-pulse'>
                    <CardHeader className='pb-4'>
                        <div className='flex items-center gap-2 mb-2'>
                            <div className='h-5 w-5 bg-neutral-700 rounded' />
                            <div className='h-5 w-40 bg-neutral-700 rounded' />
                        </div>
                        <div className='h-3 w-56 bg-neutral-800 rounded' />
                    </CardHeader>
                    <CardContent className='space-y-6'>
                        {/* Date Range Section */}
                        <div className='space-y-2'>
                            <div className='h-4 w-20 bg-neutral-700 rounded' />
                            <div className='h-9 w-full bg-neutral-800 rounded' />
                        </div>

                        {/* Format Section */}
                        <div className='space-y-2'>
                            <div className='h-4 w-24 bg-neutral-700 rounded' />
                            <div className='h-9 w-full bg-neutral-800 rounded' />
                        </div>

                        {/* Sections */}
                        <div className='space-y-3'>
                            <div className='h-4 w-28 bg-neutral-700 rounded' />
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className='flex items-center justify-between'>
                                    <div className='space-y-1'>
                                        <div className='h-3 w-32 bg-neutral-700 rounded' />
                                        <div className='h-2 w-48 bg-neutral-800 rounded' />
                                    </div>
                                    <div className='h-5 w-9 bg-neutral-700 rounded-full' />
                                </div>
                            ))}
                        </div>

                        {/* Generate Button */}
                        <div className='h-9 w-full bg-neutral-700 rounded' />
                    </CardContent>
                </Card>
            </div>

            {/* Report History & Scheduled Reports Grid Skeleton */}
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                {/* Report History Card Skeleton */}
                <Card className='border-neutral-800 bg-neutral-900 animate-pulse'>
                    <CardHeader className='pb-4'>
                        <div className='flex items-center gap-2 mb-2'>
                            <div className='h-5 w-5 bg-neutral-700 rounded' />
                            <div className='h-5 w-28 bg-neutral-700 rounded' />
                        </div>
                        <div className='h-3 w-52 bg-neutral-800 rounded mb-4' />

                        {/* Search Bar Skeleton */}
                        <div className='relative'>
                            <div className='h-9 w-full bg-neutral-800 rounded' />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className='space-y-3'>
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className='flex items-center justify-between p-4 bg-neutral-800/30 rounded-lg border border-neutral-700'>
                                    <div className='flex items-start gap-3 flex-1'>
                                        <div className='p-2 bg-neutral-700 rounded-lg'>
                                            <div className='h-4 w-4 bg-neutral-600 rounded' />
                                        </div>
                                        <div className='flex-1 min-w-0'>
                                            <div className='flex items-center gap-2 mb-1'>
                                                <div className='h-4 w-40 bg-neutral-700 rounded' />
                                                <div className='h-4 w-16 bg-neutral-800 rounded-full' />
                                            </div>
                                            <div className='flex items-center gap-3 mb-2'>
                                                <div className='h-3 w-20 bg-neutral-800 rounded' />
                                                <div className='h-3 w-12 bg-neutral-800 rounded' />
                                                <div className='h-3 w-16 bg-neutral-800 rounded' />
                                            </div>
                                            <div className='h-3 w-48 bg-neutral-800 rounded' />
                                        </div>
                                    </div>
                                    <div className='flex items-center gap-2 ml-4'>
                                        <div className='h-8 w-10 bg-neutral-700 rounded' />
                                        <div className='h-8 w-10 bg-neutral-700 rounded' />
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination Skeleton */}
                        <div className='flex items-center justify-between mt-6 pt-4 border-t border-neutral-800'>
                            <div className='h-3 w-32 bg-neutral-800 rounded' />
                            <div className='flex items-center gap-2'>
                                <div className='h-8 w-8 bg-neutral-800 rounded' />
                                <div className='h-8 w-8 bg-neutral-700 rounded' />
                                <div className='h-8 w-8 bg-neutral-800 rounded' />
                                <div className='h-8 w-8 bg-neutral-800 rounded' />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Scheduled Reports Card Skeleton */}
                <Card className='border-neutral-800 bg-neutral-900 animate-pulse'>
                    <CardHeader className='pb-4'>
                        <div className='flex items-center justify-between mb-2'>
                            <div>
                                <div className='flex items-center gap-2 mb-2'>
                                    <div className='h-5 w-5 bg-neutral-700 rounded' />
                                    <div className='h-5 w-32 bg-neutral-700 rounded' />
                                </div>
                                <div className='h-3 w-48 bg-neutral-800 rounded' />
                            </div>
                            <div className='h-8 w-24 bg-neutral-700 rounded' />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className='space-y-4'>
                            {[...Array(2)].map((_, i) => (
                                <div key={i} className='flex items-center justify-between p-4 bg-neutral-800/30 rounded-lg border border-neutral-700'>
                                    <div className='flex-1'>
                                        <div className='flex items-center gap-2 mb-2'>
                                            <div className='h-4 w-36 bg-neutral-700 rounded' />
                                            <div className='h-4 w-16 bg-neutral-800 rounded-full' />
                                        </div>
                                        <div className='space-y-1'>
                                            <div className='h-3 w-24 bg-neutral-800 rounded' />
                                            <div className='h-3 w-32 bg-neutral-800 rounded' />
                                            <div className='h-3 w-28 bg-neutral-800 rounded' />
                                        </div>
                                    </div>
                                    <div className='flex items-center gap-2 ml-4'>
                                        <div className='h-5 w-9 bg-neutral-700 rounded-full' />
                                        <div className='h-8 w-8 bg-neutral-700 rounded' />
                                        <div className='h-8 w-8 bg-neutral-700 rounded' />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
