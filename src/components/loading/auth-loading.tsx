import { Logo } from '@/components/logo';

export default function AuthLoading() {
    return (
        <div className='min-h-screen bg-black text-white flex items-center justify-center p-4'>
            <div className='w-full max-w-md space-y-8'>
                {/* Logo */}
                <div className='text-center animate-pulse'>
                    <div className='h-12 w-48 mx-auto bg-neutral-700 rounded-lg'></div>
                </div>

                {/* Form Card */}
                <div className='bg-neutral-900/50 backdrop-blur-sm border border-neutral-800 rounded-lg p-8 space-y-6'>
                    {/* Title */}
                    <div className='text-center animate-pulse'>
                        <div className='h-8 w-32 mx-auto bg-neutral-700 rounded-lg mb-2'></div>
                        <div className='h-4 w-48 mx-auto bg-neutral-800 rounded'></div>
                    </div>

                    {/* Form Fields */}
                    <div className='space-y-4 animate-pulse'>
                        <div className='space-y-2'>
                            <div className='h-4 w-16 bg-neutral-700 rounded'></div>
                            <div className='h-10 w-full bg-neutral-800 rounded-md'></div>
                        </div>
                        <div className='space-y-2'>
                            <div className='h-4 w-20 bg-neutral-700 rounded'></div>
                            <div className='h-10 w-full bg-neutral-800 rounded-md'></div>
                        </div>
                        <div className='space-y-2'>
                            <div className='h-4 w-28 bg-neutral-700 rounded'></div>
                            <div className='h-10 w-full bg-neutral-800 rounded-md'></div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className='animate-pulse'>
                        <div className='h-12 w-full bg-neutral-700 rounded-md'></div>
                    </div>

                    {/* Divider */}
                    <div className='relative animate-pulse'>
                        <div className='absolute inset-0 flex items-center'>
                            <div className='w-full border-t border-neutral-800'></div>
                        </div>
                        <div className='relative flex justify-center text-sm'>
                            <div className='h-4 w-8 bg-neutral-800 rounded'></div>
                        </div>
                    </div>

                    {/* Social Buttons */}
                    <div className='space-y-3 animate-pulse'>
                        <div className='h-12 w-full bg-neutral-800 rounded-md'></div>
                        <div className='h-12 w-full bg-neutral-800 rounded-md'></div>
                    </div>

                    {/* Bottom Link */}
                    <div className='text-center animate-pulse'>
                        <div className='h-4 w-40 mx-auto bg-neutral-800 rounded'></div>
                    </div>
                </div>

                {/* Footer Link */}
                <div className='text-center animate-pulse'>
                    <div className='h-4 w-32 mx-auto bg-neutral-800 rounded'></div>
                </div>
            </div>
        </div>
    );
}
