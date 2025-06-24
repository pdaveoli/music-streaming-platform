"use client";

import React, { useState, useEffect } from 'react'; // Added useEffect
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
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
} from 'lucide-react';
import { createClient } from "@/lib/supabase/client"; 
import { redirect } from 'next/navigation'; // Import redirect for navigation
import type { UserDetails } from '@/app/client-actions';
import { toast } from 'sonner';
import { DropdownMenuLabel } from '@radix-ui/react-dropdown-menu';

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


export default function AppSidebar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null); // State for user email
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const playerHeight = "84px"; 

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      // supabase.auth.getUser() returns a promise
      const { data: { user }, error } = await supabase.auth.getUser(); 
      if (error) {
        console.error("Error fetching user:", error.message);
        setUserEmail('Guest'); // Fallback or handle error appropriately
      } else if (user) {
        setUserEmail(user.email || 'Guest');
      } else {
        setUserEmail('Guest'); // No user found
      }

      // fetch user details if needed
      if (!user) {
        console.error("No user found, redirecting to login");
        redirect('/login'); // Redirect to login if no user is found
      }
      const { data: userDetails, error: detailsError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user?.id)
        .single();
      if (detailsError) {
        console.error("Error fetching user details:", detailsError);
        return;
      }
      if (userDetails) {
        setUserDetails(userDetails);
      }
      else {
        console.error("No user details found for user ID:", user?.id);
        toast.error("No user details found, please check your account settings.");
      }
    };

    fetchUser();
  }, []); // Empty dependency array ensures this runs once on mount


  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const SidebarContent = () => (
    <div className="flex flex-col flex-grow min-h-0"> 
      <div className="flex-grow p-4 overflow-y-auto min-h-0"> 
        <nav className="space-y-2">
          {mainNavigationItems.map((item) => (
            <Button
              key={item.label}
              variant="ghost"
              className="w-full justify-start text-base"
              asChild
            >
              <Link href={item.href} className="flex items-center space-x-3 px-3 py-2.5 rounded-md hover:bg-muted">
                <item.icon className="h-5 w-5 text-muted-foreground" />
                <span>{item.label}</span>
              </Link>
            </Button>
          ))}
        </nav>
      </div>

      <div className="p-4 border-t border-border shrink-0">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full justify-between text-sm" disabled={!userEmail}>
              {/* This div will contain the icon and the email text */}
              {/* Added min-w-0 to allow this flex item to shrink and enable truncation on its child */}
              <div className="flex items-center space-x-2 min-w-0"> 
                <UserIcon className="h-5 w-5" />
                {/* Apply truncation classes directly to the p tag */}
                <p className="whitespace-nowrap overflow-hidden text-ellipsis">
                  {userDetails?.name || userEmail || 'Guest'}
                </p>
              </div>
              <SettingsIcon className="h-4 w-4 opacity-70" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side="top"
            align="start"
            className="w-[calc(100%_-_2rem)] mx-4 mb-1 md:w-[calc(theme(space.64)_-_2rem)] md:mx-0 p-2"
          >
            <DropdownMenuLabel className='flex items-center space-x-2 pl-2 w-full overflow-hidden'>
              <UserIcon className="h-5 w-5 text-muted-foreground" />
              <span className='text-sm truncate'>{userEmail || "Guest"}</span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {userNavigationItems.map((item) => (
                 <DropdownMenuItem key={item.label} asChild>
                    <Link href={item.href} className="flex items-center space-x-2 w-full">
                        <item.icon className="h-4 w-4 text-muted-foreground" />
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
      <div className={`md:hidden fixed top-[${playerHeight}] left-0 z-50 p-2`}>
        <Button onClick={toggleMobileMenu} variant="ghost" size="icon" className="m-2">
          {isMobileMenuOpen ? <XIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
        </Button>
      </div>

      <aside
        className={`
          fixed left-0 top-[${playerHeight}] bottom-0 z-40 h-[calc(100vh_-_84px)]
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
