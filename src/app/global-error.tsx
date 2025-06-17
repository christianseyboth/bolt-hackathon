'use client';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <html>
            <body>
                <div className='flex min-h-screen flex-col items-center justify-center'>
                    <h2 className='text-2xl font-bold mb-4'>Something went wrong globally!</h2>
                    <p className='text-gray-600 mb-4'>{error.message}</p>
                    <button onClick={() => reset()}>Try again</button>
                </div>
            </body>
        </html>
    );
}
