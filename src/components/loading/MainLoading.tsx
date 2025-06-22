export default function MainLoading() {
    return (
        <div className='min-h-screen bg-black text-white'>
            {/* Header Skeleton */}
            <div className='fixed top-4 left-1/2 -translate-x-1/2 z-[100] w-[95%] max-w-7xl'>
                <div className='flex justify-between items-center w-full rounded-md px-2.5 py-1.5 bg-neutral-900/50 backdrop-blur-sm'>
                    <div className='animate-pulse'>
                        <div className='h-8 w-32 bg-neutral-700 rounded'></div>
                    </div>
                    <div className='hidden lg:flex space-x-6 animate-pulse'>
                        <div className='h-4 w-16 bg-neutral-700 rounded'></div>
                        <div className='h-4 w-16 bg-neutral-700 rounded'></div>
                        <div className='h-4 w-20 bg-neutral-700 rounded'></div>
                    </div>
                    <div className='hidden lg:flex space-x-3 animate-pulse'>
                        <div className='h-9 w-16 bg-neutral-700 rounded-md'></div>
                        <div className='h-9 w-20 bg-neutral-700 rounded-md'></div>
                    </div>
                    {/* Mobile menu button */}
                    <div className='lg:hidden animate-pulse'>
                        <div className='h-6 w-6 bg-neutral-700 rounded'></div>
                    </div>
                </div>
            </div>

            {/* Main Content Skeleton */}
            <div className='pt-24 px-4 max-w-7xl mx-auto'>
                {/* Hero Section Skeleton */}
                <div className='text-center py-16 lg:py-24 space-y-8'>
                    <div className='animate-pulse space-y-4'>
                        <div className='h-12 lg:h-16 w-3/4 mx-auto bg-neutral-700 rounded-lg'></div>
                        <div className='h-12 lg:h-16 w-2/3 mx-auto bg-neutral-700 rounded-lg'></div>
                    </div>
                    <div className='animate-pulse space-y-3'>
                        <div className='h-6 w-5/6 mx-auto bg-neutral-800 rounded'></div>
                        <div className='h-6 w-4/5 mx-auto bg-neutral-800 rounded'></div>
                        <div className='h-6 w-3/4 mx-auto bg-neutral-800 rounded'></div>
                    </div>
                    <div className='flex flex-col sm:flex-row gap-4 justify-center items-center animate-pulse'>
                        <div className='h-12 w-40 bg-neutral-700 rounded-md'></div>
                        <div className='h-12 w-32 bg-neutral-800 rounded-md'></div>
                    </div>
                </div>

                {/* Features Grid Skeleton */}
                <div className='py-16 lg:py-24'>
                    <div className='text-center mb-16 animate-pulse'>
                        <div className='h-8 w-48 mx-auto bg-neutral-700 rounded-lg mb-4'></div>
                        <div className='h-6 w-2/3 mx-auto bg-neutral-800 rounded'></div>
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className='animate-pulse'>
                                <div className='bg-neutral-900/50 backdrop-blur-sm border border-neutral-800 rounded-lg p-6 space-y-4'>
                                    <div className='h-12 w-12 bg-neutral-700 rounded-lg'></div>
                                    <div className='h-6 w-3/4 bg-neutral-700 rounded'></div>
                                    <div className='space-y-2'>
                                        <div className='h-4 w-full bg-neutral-800 rounded'></div>
                                        <div className='h-4 w-5/6 bg-neutral-800 rounded'></div>
                                        <div className='h-4 w-4/5 bg-neutral-800 rounded'></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* CTA Section Skeleton */}
                <div className='py-16 lg:py-24'>
                    <div className='bg-neutral-900/30 backdrop-blur-sm border border-neutral-800 rounded-2xl p-8 lg:p-16 text-center animate-pulse'>
                        <div className='space-y-6'>
                            <div className='h-10 w-2/3 mx-auto bg-neutral-700 rounded-lg'></div>
                            <div className='space-y-3'>
                                <div className='h-5 w-4/5 mx-auto bg-neutral-800 rounded'></div>
                                <div className='h-5 w-3/4 mx-auto bg-neutral-800 rounded'></div>
                            </div>
                            <div className='h-12 w-48 mx-auto bg-neutral-700 rounded-md'></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Skeleton */}
            <div className='border-t border-neutral-800 mt-16 pt-8 pb-4'>
                <div className='max-w-7xl mx-auto px-4'>
                    <div className='grid grid-cols-1 md:grid-cols-4 gap-8 animate-pulse'>
                        <div className='space-y-4'>
                            <div className='h-8 w-32 bg-neutral-700 rounded'></div>
                            <div className='space-y-2'>
                                <div className='h-4 w-24 bg-neutral-800 rounded'></div>
                                <div className='h-4 w-20 bg-neutral-800 rounded'></div>
                                <div className='h-4 w-28 bg-neutral-800 rounded'></div>
                            </div>
                        </div>
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className='space-y-4'>
                                <div className='h-5 w-20 bg-neutral-700 rounded'></div>
                                <div className='space-y-2'>
                                    <div className='h-4 w-16 bg-neutral-800 rounded'></div>
                                    <div className='h-4 w-20 bg-neutral-800 rounded'></div>
                                    <div className='h-4 w-18 bg-neutral-800 rounded'></div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className='border-t border-neutral-800 mt-8 pt-4 text-center'>
                        <div className='h-4 w-48 mx-auto bg-neutral-800 rounded'></div>
                    </div>
                </div>
            </div>
        </div>
    );
}
