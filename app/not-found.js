export default function NotFound() {
    return (
        <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center">
            <div className="max-w-lg bg-white shadow-md rounded-md p-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-4">404 - Page Not Found!</h1>
                <p className="text-gray-800">Sorry, the page you are looking for could not be found.</p>
                <p className="text-gray-800">Please check the URL or go back to the homepage.</p>
            </div>
        </div>
    );
}
