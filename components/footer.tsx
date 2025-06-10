import { ThemeSwitcher } from './theme-switcher';

export default function Footer() {
    return (
        <footer className="bg-gray-800 text-white py-4">
        <div className="container mx-auto text-center">
            <p className="text-sm">
            &copy; {new Date().getFullYear()} Oliver Dave. All rights reserved.
            </p>
            <p className="text-xs mt-2">
            Built with ❤️ using Next.js and Supabase
            </p>
        </div>
        <ThemeSwitcher />
        </footer>
    );
}