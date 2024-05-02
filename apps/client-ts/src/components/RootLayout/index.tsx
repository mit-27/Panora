'use client'

import { useEffect } from 'react';
import { MainNav } from '@/components/Nav/main-nav';
import { SmallNav } from '@/components/Nav/main-nav-sm';
import { UserNav } from '@/components/Nav/user-nav';
import TeamSwitcher from '@/components/shared/team-switcher';
import Link from 'next/link'
import { useRouter } from 'next/navigation';
import { cn } from "@/lib/utils";
import useProfileStore from '@/state/profileStore';
import useProjectStore from '@/state/projectStore';
import { ThemeToggle } from '@/components/Nav/theme-toggle';
import useProjects from '@/hooks/useProjects';
import useRefreshAccessTokenMutation from '@/hooks/mutations/useRefreshAccessTokenMutation';

export const RootLayout = ({children}:{children:React.ReactNode}) => {
  const router = useRouter()
  const base = process.env.NEXT_PUBLIC_WEBAPP_DOMAIN;
  const {data : projectsData} = useProjects();
  const { idProject, setIdProject } = useProjectStore();
  const {mutate : refreshAccessToken} = useRefreshAccessTokenMutation()

  useEffect(() => {
    if(projectsData)
      {
        console.log("Projects : ",projectsData);
        if(idProject==="" && projectsData.length>0)
          {
            console.log("Project Id setting : ",projectsData[0]?.id_project)
            setIdProject(projectsData[0]?.id_project);
          }
      }
  },[idProject, projectsData, refreshAccessToken, setIdProject])
  
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
              Panora.
                {/* <img src="/logo.png" className='w-14' /> */}
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
                  <div className="space-y-3">
                    <TeamSwitcher className='w-40 ml-3' projects={projectsData? projectsData : []}/>
                    <MainNav onLinkClick={handlePageChange} className=''/>
                  </div>
                </div>
              </div>
            </nav>

            <main className="w-full pt-16 overflow-y-scroll">{children}</main>

        </div>
     </>

  )
  
};