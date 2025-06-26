
'use client';

import {
  ArrowRightLeft,
  ChevronDown,
  ChevronRight,
  LayoutGrid,
  Package,
  Settings,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Suspense, useState } from 'react';
import { Skeleton } from '../ui/skeleton';

const NavLink = ({
  href,
  children,
  icon,
  isActive,
}: {
  href: string;
  children: React.ReactNode;
  icon: React.ReactNode;
  isActive: boolean;
}) => (
  <Link
    href={href}
    className={cn(
      'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
      isActive && 'bg-muted text-primary'
    )}
  >
    {icon}
    {children}
  </Link>
);

const CollapsibleNavLink = ({
  title,
  icon,
  children,
  isActive,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  isActive: boolean;
}) => {
    const [isOpen, setIsOpen] = useState(isActive);
    return (
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger asChild>
            <div className='flex w-full items-center'>
                 <span
                    className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary w-full',
                    isActive && 'text-primary'
                    )}
                >
                    {icon}
                    {title}
                    <span className="ml-auto">
                        {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </span>
                </span>
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent className="pl-5 pt-1 space-y-1">
            {children}
          </CollapsibleContent>
        </Collapsible>
    )
};

function UserProfile() {
  const searchParams = useSearchParams();
  const name = searchParams.get('name');

  const capitalize = (s: string | null): string => {
    if (!s) return 'User';
    const words = s.split(' ');
    return words.map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
  }

  const getInitials = (s: string | null): string => {
    if (!s) return 'U';
    const nameParts = s.split(' ');
    if (nameParts.length > 1) {
      return nameParts[0].charAt(0).toUpperCase() + nameParts[nameParts.length - 1].charAt(0).toUpperCase();
    }
    return s.charAt(0).toUpperCase();
  }

  return (
    <div className="flex items-center gap-3">
        <Avatar className="h-9 w-9">
            <AvatarImage data-ai-hint="person" src={`https://placehold.co/100x100.png?text=${getInitials(name)}`} alt="User Avatar" />
            <AvatarFallback>{getInitials(name)}</AvatarFallback>
        </Avatar>
        <div>
            <p className="text-sm font-medium">{capitalize(name)}</p>
            <p className="text-xs text-muted-foreground">Admin</p>
        </div>
        <Button variant="ghost" size="icon" className="ml-auto">
            <ChevronDown className="h-4 w-4" />
        </Button>
    </div>
  )
}


export default function AppSidebar() {
  const pathname = usePathname();

  return (
    <div className="hidden border-r bg-card md:block w-64">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Package className="h-6 w-6 text-primary" />
            <span className="">Fobework</span>
          </Link>
        </div>
        <div className="flex-1">
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
            <p className="px-3 py-2 text-xs font-semibold text-muted-foreground/80">
              Main
            </p>
            <NavLink
              href="/dashboard"
              isActive={pathname === '/dashboard'}
              icon={<LayoutGrid className="h-4 w-4" />}
            >
              Overview
            </NavLink>
            <CollapsibleNavLink title="Workspaces" icon={<ArrowRightLeft className="h-4 w-4" />} isActive={false}>
                <NavLink href="#" isActive={false} icon={<span className="h-4 w-4" />}>Team</NavLink>
                <NavLink href="#" isActive={false} icon={<span className="h-4 w-4" />}>Investor</NavLink>
            </CollapsibleNavLink>


            <p className="px-3 mt-4 py-2 text-xs font-semibold text-muted-foreground/80">
              Others
            </p>
            <NavLink
              href="#"
              isActive={pathname.startsWith('/dashboard/settings')}
              icon={<Settings className="h-4 w-4" />}
            >
              Settings
            </NavLink>
          </nav>
        </div>
        <div className="mt-auto p-4 border-t">
            <Suspense fallback={<Skeleton className="h-10 w-full" />}>
              <UserProfile />
            </Suspense>
        </div>
      </div>
    </div>
  );
}
