"use client"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
  } from "@/components/ui/sidebar"
  import Image from "next/image"
  import {Button} from  '@/components/ui/button'
  import {CreditCard,Book,Compass,PencilRuler,UserCircle2,LayoutDashboard} from 'lucide-react'
  import Link from 'next/link'
  import { usePathname } from "next/navigation"
  import AddNewCourseDialog from "./AddNewCourseDialog"

  const SideBarOptions=[
    {
      title:'Dashboard',
      icon:LayoutDashboard,
      path:'/workspace'
    },
    {
      title:'My Learning',
      icon:Book,
      path:'/workspace/my-learning'
    },
    {
      title:'Explore Courses',
      icon:Compass,
      path:'/workspace/explore'
    },
   
    {
      title:'Billing',
      icon:CreditCard,
      path:'/workspace/billing'
    },
    {
      title:'Profile',
      icon:UserCircle2,
      path:'/workspace/profile'
    },
  ]
  export function AppSidebar() {

    const path=usePathname();
    
    return (
      <Sidebar>
        <SidebarHeader className="flex items-center justify-center p-4 border-b">
            <Image src="/logo.svg" alt="logo" width={24} height={40} className="mx-auto" />
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup >
            <AddNewCourseDialog>
            <Button>Create New course</Button>
            </AddNewCourseDialog>
            
            </SidebarGroup >
          <SidebarGroup>
            <SidebarContent>
              <SidebarMenu>
                {
                  SideBarOptions.map((item,index)=>(
                    <SidebarMenuItem key={index}>
                      <SidebarMenuButton asChild className={'p-5'}>
                        <Link href={item.path} className={`text-[17px] ${(item.path === '/workspace' ? path === '/workspace' : path.startsWith(item.path)) && 'text-primary bg-blue-300'}`}>
                          <item.icon />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                )
                }
              </SidebarMenu>
            </SidebarContent>
            </SidebarGroup>
        </SidebarContent>
        <SidebarFooter />
      </Sidebar>
    )
  }