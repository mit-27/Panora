'use client'

import { useState, useEffect } from 'react';
import { MainNav } from './../Nav/main-nav';
import { SmallNav } from './../Nav/main-nav-sm';
import { UserNav } from './../Nav/user-nav';
import TeamSwitcher from './../shared/team-switcher';
import Link from 'next/link'
import { useRouter } from 'next/navigation';
import config from '@/lib/config';
import { useStytchUser } from '@stytch/nextjs';
import { cn } from "@/lib/utils";
import useProfile from '@/hooks/useProfile';
import useProfileStore from '@/state/profileStore';
import useProjectStore from '@/state/projectStore';
import useProjectsByUser from '@/hooks/useProjectsByUser';
import useProjectsStore, { Project } from '@/state/projectsStore';
import { ThemeToggle } from '@/components/Nav/theme-toggle';

const useDeviceSize = () => {

  const [width, setWidth] = useState(0)
  const [height, setHeight] = useState(0)

  const handleWindowResize = () => {
    setWidth(window.innerWidth);
    setHeight(window.innerHeight);
  }

  useEffect(() => {
    // component is mounted and window is available
    handleWindowResize();
    window.addEventListener('resize', handleWindowResize);
    // unsubscribe from the event on component unmount
    return () => window.removeEventListener('resize', handleWindowResize);
  }, []);

  return [width, height]

}

export const RootLayout = ({children}:{children:React.ReactNode}) => {
  const [width, height] = useDeviceSize();
  const router = useRouter();
  const base = process.env.NEXT_PUBLIC_WEBAPP_DOMAIN;

  const { user } = useStytchUser();
  const { data, isLoading, isError, error } = useProfile(user?.user_id!);

  if (isLoading) {
    console.log("loading profiles");
  }
  if (isError) {
    console.log('Profiles fetch error: ' + error);
  }

  const { setProfile } = useProfileStore();
  const { setIdProject } = useProjectStore();
  const { setProjects } = useProjectsStore();

  useEffect(() => {
    if (data) {
      // Set profile
      setProfile({
        id_user: data.id_user,
        email: data.email!,
        first_name: data.first_name,
        last_name: data.last_name,
      });

      // Fetch and set projects
      const fetchProjects = async () => {
        const response = await fetch(`${config.API_URL}/projects/${data.id_user}`);
        const projectsData = await response.json();
        console.log("PROJECTS FETCHED ARE => " + JSON.stringify(projectsData));
        if (projectsData.length > 0) {
          setIdProject(projectsData[0]?.id_project);
        }
        setProjects(projectsData as Project[]);
      };

      fetchProjects();
    }
  }, [data, setProfile, setIdProject, setProjects]); // Updated dependencies

  const handlePageChange = (page: string) => {
    if (page) {
      router.push(`${base}/${page}`);
    } else {
      console.error(`Page ${page} is undefined`);
    }
  };


  return (
    <>
    <div className="fixed top-0 left-0 right-0 supports-backdrop-blur:bg-background/60 border-b bg-background/95 backdrop-blur z-20">
      <nav className="h-14 flex items-center justify-between px-4">
        <div className="hidden lg:block">
          <Link href='/'>
            <img src="/logo.png" className='w-14' />
          </Link>
        </div>
        <div className={cn("block lg:!hidden")}>
          <SmallNav onLinkClick={handlePageChange} />
        </div>

        <div className="flex items-center gap-2">
          <UserNav />
          <ThemeToggle />
        </div>
      </nav>
    </div>
    <div className="flex h-screen overflow-hidden">
      <nav
        className={cn(`relative hidden h-screen border-r pt-16 lg:block w-72`)}
      >
        <div className="space-y-4 py-4">
          <div className="px-3 py-2">
            <div className="space-y-1">
              
              <TeamSwitcher className='w-40 ml-3' />
              <MainNav onLinkClick={handlePageChange} className=''/>
            </div>
          </div>
        </div>
      </nav>

      <main className="w-full pt-16">{children}</main>

    </div>
    </>
    // <div>
    //   {width < lgBreakpoint ? (
    //     <SmallNav onLinkClick={handlePageChange} />
    //   ) : (
    //     <div className='items-center hidden lg:flex lg:flex-col border-r fixed left-0 bg-opacity-90 backdrop-filter backdrop-blur-lg w-[200px] h-screen'>
    //       <div className='flex lg:flex-col items-center py-4 space-y-4'>
    //         <div className='flex flex-row justify-between items-center w-full px-6'>
    //           <Link href='/'>
    //             <img src="/logo.png" className='w-14' />
    //           </Link>
    //         </div>
    //         <TeamSwitcher className='w-40 ml-3' />
    //         <MainNav
    //           className='flex lg:flex-col mx-auto w-[200px] space-y-0'
    //           onLinkClick={handlePageChange}
    //         />
    //         {
    //           config.DISTRIBUTION === "managed" && 
    //           (
    //             <div className='ml-auto flex lg:flex-col items-center space-x-4 w-full'>
    //               <UserNav />
    //             </div>
    //           )
    //         }
    //       </div>
    //     </div>
    //   )}
    //   <div className='flex-1 space-y-4 pt-6 px-10 lg:ml-[200px]'>
    //     {/*<Outlet />*/}
    //   </div>
    // </div>
  );
};
