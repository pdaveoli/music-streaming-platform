import { JSX } from 'react';
import { ThemeSwitcher } from './theme-switcher';

/// <summerary>
/// Footer component that displays legal information and a theme switcher.
/// </summary>
/// <returns>A footer element with legal text and a theme switcher.</returns>
export default function Footer() : JSX.Element {
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