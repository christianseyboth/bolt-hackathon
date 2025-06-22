import { Card, CardContent, CardHeader } from '@/components/ui/Card';

export default function EmailsLoading() {
    return (
        <div className='space-y-4'>
            {/* Header Skeleton */}
            <div className='animate-pulse'>
                <div className='h-8 w-48 md:w-64 bg-neutral-700 rounded mb-2' />
                <div className='h-4 w-32 md:w-48 bg-neutral-800 rounded' />
            </div>

            {/* Filter Card Skeleton */}
            <Card className='border-neutral-800 bg-neutral-900 animate-pulse'>
                <CardHeader className='space-y-4 pb-4'>
                    <div className='h-6 w-32 bg-neutral-700 rounded' />

                    {/* Filter Bar Skeleton */}
                    <div className='flex flex-col gap-4'>
                        {/* Search Bar */}
                        <div className='h-9 w-full md:max-w-sm bg-neutral-800 rounded' />

                        {/* Filter Buttons */}
                        <div className='flex flex-col sm:flex-row gap-2'>
                            <div className='hidden sm:flex items-center'>
                                <div className='h-8 w-16 bg-neutral-800 rounded' />
                            </div>
                            <div className='flex flex-wrap gap-2'>
                                <div className='h-8 w-20 bg-neutral-800 rounded' />
                                <div className='h-8 w-16 sm:w-24 bg-neutral-800 rounded' />
                                <div className='h-8 w-16 sm:w-20 bg-neutral-800 rounded' />
                            </div>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            {/* Table Card Skeleton */}
            <Card className='border-neutral-800 bg-neutral-900 animate-pulse'>
                <CardContent className='p-0'>
                    <div className='overflow-x-auto'>
                        <div className='min-w-[800px] rounded-md border border-neutral-800'>
                            {/* Table Header */}
                            <div className='bg-neutral-800/50 px-4 py-2'>
                                <div className='grid grid-cols-14 gap-4'>
                                    <div className='h-3 w-16 bg-neutral-700 rounded' />
                                    <div className='h-3 w-12 bg-neutral-700 rounded col-span-2' />
                                    <div className='h-3 w-16 bg-neutral-700 rounded col-span-2' />
                                    <div className='h-3 w-20 bg-neutral-700 rounded col-span-4' />
                                    <div className='h-3 w-16 bg-neutral-700 rounded col-span-2' />
                                    <div className='h-3 w-20 bg-neutral-700 rounded col-span-2' />
                                </div>
                            </div>

                            {/* Email List Items */}
                            <div className='divide-y divide-neutral-800'>
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className='px-4 py-3'>
                                        <div className='grid grid-cols-14 gap-4 items-center'>
                                            <div className='h-5 w-16 bg-neutral-700 rounded' />
                                            <div className='h-4 w-full bg-neutral-700 rounded col-span-2' />
                                            <div className='h-4 w-full bg-neutral-800 rounded col-span-2' />
                                            <div className='h-4 w-full bg-neutral-800 rounded col-span-4' />
                                            <div className='h-3 w-16 bg-neutral-800 rounded col-span-2' />
                                            <div className='h-5 w-12 bg-neutral-700 rounded col-span-2' />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Pagination Skeleton */}
            <Card className='border-neutral-800 bg-neutral-900 animate-pulse'>
                <CardContent>
                    <div className='flex flex-col sm:flex-row justify-between items-center gap-4'>
                        <div className='h-4 w-32 sm:w-48 bg-neutral-800 rounded' />
                        <div className='flex space-x-2'>
                            <div className='h-8 w-16 bg-neutral-800 rounded' />
                            <div className='h-8 w-16 bg-neutral-800 rounded' />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
