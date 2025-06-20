export default function PageLoading() {
    return (
        <div className='min-h-screen bg-black text-white'>
            {/* Header Skeleton - matches navbar */}
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
                    <div className='lg:hidden animate-pulse'>
                        <div className='h-6 w-6 bg-neutral-700 rounded'></div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className='pt-24 px-4 max-w-4xl mx-auto'>
                {/* Page Header */}
                <div className='text-center py-16 space-y-6'>
                    <div className='animate-pulse space-y-4'>
                        <div className='h-12 lg:h-16 w-2/3 mx-auto bg-neutral-700 rounded-lg'></div>
                        <div className='h-6 w-4/5 mx-auto bg-neutral-800 rounded'></div>
                        <div className='h-6 w-3/4 mx-auto bg-neutral-800 rounded'></div>
                    </div>
                </div>

                {/* Content Sections */}
                <div className='space-y-16 pb-16'>
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className='animate-pulse'>
                            <div className='bg-neutral-900/30 backdrop-blur-sm border border-neutral-800 rounded-lg p-8 space-y-6'>
                                <div className='h-8 w-1/3 bg-neutral-700 rounded-lg'></div>
                                <div className='space-y-3'>
                                    <div className='h-4 w-full bg-neutral-800 rounded'></div>
                                    <div className='h-4 w-5/6 bg-neutral-800 rounded'></div>
                                    <div className='h-4 w-4/5 bg-neutral-800 rounded'></div>
                                    <div className='h-4 w-3/4 bg-neutral-800 rounded'></div>
                                </div>
                                {i === 1 && (
                                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mt-6'>
                                        <div className='h-32 bg-neutral-800 rounded-lg'></div>
                                        <div className='h-32 bg-neutral-800 rounded-lg'></div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* CTA Section */}
                <div className='py-16'>
                    <div className='bg-neutral-900/50 backdrop-blur-sm border border-neutral-800 rounded-xl p-8 text-center animate-pulse'>
                        <div className='space-y-4'>
                            <div className='h-8 w-1/2 mx-auto bg-neutral-700 rounded-lg'></div>
                            <div className='h-5 w-2/3 mx-auto bg-neutral-800 rounded'></div>
                            <div className='h-12 w-40 mx-auto bg-neutral-700 rounded-md mt-6'></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Skeleton */}
            <div className='border-t border-neutral-800 mt-8 pt-8 pb-4'>
                <div className='max-w-7xl mx-auto px-4 text-center animate-pulse'>
                    <div className='h-4 w-48 mx-auto bg-neutral-800 rounded'></div>
                </div>
            </div>
        </div>
    );
}
