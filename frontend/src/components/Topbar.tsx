import { SignedOut, SignedIn, SignOutButton, UserButton } from '@clerk/clerk-react'
import { LayoutDashboardIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import SignInOAuthButton from './SignInOAuthButton.tsx'
import { useAuthStore } from '@/stores/useAuthStore.ts'
import { cn } from '@/lib/utils.ts'
import { buttonVariants } from './ui/button.tsx'
const Topbar = () => {
    const isAdmin = useAuthStore((state) => state.isAdmin);
    // console.log(isAdmin);

  return (
    <div className='flex items-center justify-between p-4 sticky top-0 bg-zinc-900/75 backdrop-blur-md z-10'>
        <div className='flex items-center'>
           <span className='font-bold text-white'>B</span>eat<span className='font-bold text-white'>B</span>uzz
        </div>
        <div className='flex items-center gap-4'>
            {isAdmin && (
                <Link to="/admin" className={cn(buttonVariants({ variant: "outline" }))}>
                    <LayoutDashboardIcon className='size-4 mr-2' />
                        Admin Dashboard
                </Link>
            )}

            <SignedIn>
                <SignOutButton />
            </SignedIn>

            <SignedOut>
                <SignInOAuthButton />
            </SignedOut>

            <UserButton />
        </div>
    </div>
  )
}

export default Topbar