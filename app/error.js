"use client"

export default function Error() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="max-w-lg p-8 bg-white rounded-lg shadow-lg">
                <h1 className="text-3xl font-bold text-red-600 mb-4">Something went wrong!</h1>
                <p className="text-gray-800">We apologize, but an error has occurred.</p>
                <p className="text-gray-800">Please try again later or contact support.</p>
            </div>
        </div>
    );
}
