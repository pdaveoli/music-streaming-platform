"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation'; // Import usePathname for active links
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import {
  HomeIcon,
  LibraryIcon,
  CompassIcon,
  SearchIcon,
  SettingsIcon,
  UserIcon,
  LogOutIcon,
  MenuIcon,
  XIcon,
  Music, // A nice icon for the logo
} from 'lucide-react';
import { createClient } from "@/lib/supabase/client"; 
import { redirect } from 'next/navigation';
import type { UserDetails } from '@/app/client-actions';
import { toast } from 'sonner';
import { cn } from '@/lib/utils'; // For cleaner class name logic

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

const mainNavigationItems: NavItem[] = [
  { href: '/home', label: 'Home', icon: HomeIcon },
  { href: '/library', label: 'Library', icon: LibraryIcon },
  { href: '/discover', label: 'Discover', icon: CompassIcon },
  { href: '/search', label: 'Search', icon: SearchIcon },
];

const userNavigationItems = [
    { href: '/account', label: 'Account Settings', icon: SettingsIcon },
    { href: '/logout', label: 'Log Out', icon: LogOutIcon },
];

/// <summary>
/// Sidebar component that displays navigation links and user profile.
/// It includes a responsive design for mobile and desktop views.
/// </summary>
/// <returns>A sidebar with navigation links and user profile dropdown.</returns>
export default function AppSidebar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const pathname = usePathname(); // Get current path for active styles

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      // supabase.auth.getUser() returns a promise
      const { data: { user }, error } = await supabase.auth.getUser(); 
      if (error) {
        console.error("Error fetching user:", error.message);
        setUserEmail('Guest');
      } else if (user) {
        setUserEmail(user.email || 'Guest');
      } else {
        setUserEmail('Guest');
      }

      if (!user) {
        console.error("No user found, redirecting to login");
        redirect('/login');
        return;
      }

      const { data: details, error: detailsError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (detailsError) {
        console.error("Error fetching user details:", detailsError);
        return;
      }

      if (details) {
        // If the user icon is a path, construct the full public URL for display
        if (details.userIcon && !details.userIcon.startsWith('http')) {
          const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(details.userIcon);
          details.userIcon = urlData.publicUrl;
        }
        setUserDetails(details);
      } else {
        console.error("No user details found for user ID:", user.id);
        toast.error("No user details found, please check your account settings.");
      }
    };

    fetchUser();
  }, []);


  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Top section: Logo and main navigation */}
      <div className="flex-grow">
        <div className="flex items-center justify-between h-20 px-4">
          <Link href="/home" className="flex items-center gap-2 text-2xl font-bold">
            <Music className="h-7 w-7 text-red-500" />
            <span>
              Free<span className="text-red-500">Stream</span>
            </span>
          </Link>
          <Button variant="ghost" size="icon" onClick={toggleMobileMenu} className="md:hidden">
            <XIcon className="h-6 w-6" />
          </Button>
        </div>
        <nav className="px-2 space-y-1">
          {mainNavigationItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Button
                key={item.label}
                variant="ghost"
                className={cn(
                  "w-full justify-start text-base h-12",
                  isActive 
                    ? "bg-primary/10 text-primary hover:bg-primary/20" 
                    : "hover:bg-muted/50"
                )}
                asChild
              >
                <Link href={item.href} className="flex items-center gap-3">
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              </Button>
            );
          })}
        </nav>
      </div>

      {/* Bottom section: User profile dropdown */}
      <div className="p-4 border-t border-border/50">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start items-center h-14 gap-3 text-left">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted flex-shrink-0">
                {userDetails?.userIcon ? (
                  <img src={userDetails.userIcon} alt="User Avatar" className="w-full h-full object-cover rounded-full" />
                ) : (
                  <UserIcon className="h-6 w-6 text-muted-foreground" />
                )}
              </div>
              <div className="flex-grow min-w-0">
                <p className="font-semibold truncate">
                  {userDetails?.name || 'Guest'}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {userEmail || '...'}
                </p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side="top"
            align="start"
            className="w-[var(--radix-dropdown-menu-trigger-width)] mb-1"
          >
            <DropdownMenuLabel className='flex items-center gap-2 p-2'>
              <UserIcon className="h-5 w-5 text-muted-foreground" />
              <span className='text-sm font-normal truncate'>{userEmail || "Guest"}</span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {userNavigationItems.map((item) => (
                 <DropdownMenuItem key={item.label} asChild>
                    <Link href={item.href} className="flex items-center gap-2 w-full">
                        <item.icon className="h-4 w-4" />
                        <span>{item.label}</span>
                    </Link>
                 </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );

  return (
    <>
      <div className={"md:hidden fixed top-0 left-0 z-50 p-2"}>
        <Button onClick={toggleMobileMenu} variant="ghost" size="icon" className="m-2">
          {isMobileMenuOpen ? <XIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
        </Button>
      </div>

      <aside
        className={`
          fixed left-0 top-0 bottom-0 z-40 h-screen
          bg-background
          border-r border-border 
          flex flex-col 
          transition-transform duration-300 ease-in-out
          md:translate-x-0 md:w-64 
          ${isMobileMenuOpen ? 'translate-x-0 w-full sm:w-3/4' : '-translate-x-full w-full sm:w-3/4'}
        `}
      >
        <SidebarContent />
      </aside>

      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/30 backdrop-blur-sm md:hidden"
          onClick={toggleMobileMenu}
        ></div>
      )}
    </>
  );
}
