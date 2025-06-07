import Link from 'next/link';

export default function HomePage() {
    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <h1 className="text-4xl font-bold mb-4">Welcome to the Music App</h1>
            <p className="text-lg text-gray-600">Your one-stop destination for all your music needs.</p>
            <Link href="/discover" className="text-blue-500 hover:underline mt-4">Discover Albums</Link>

        </div>
    );
}