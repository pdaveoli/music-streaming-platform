import { ThemeSwitcher } from './theme-switcher';

export default function Footer() {
    return (
        <footer className="py-4 backdrop-blur-md dark:bg-black bg-gray-200 dark:text-gray-300 text-gray-700">
            <div className="container mx-auto text-center">
                <p>For legal reasons, this site is for educational purposes only.</p>
                <p className="text-sm mt-2">© 2025 Oliver Dave. All rights reserved.</p>
                <div className="mt-4 flex flex-row items-center justify-center">
                    <ThemeSwitcher />
                    <p className="text-sm">Switch Theme</p>
                </div>
            </div>
        </footer>
    );
}