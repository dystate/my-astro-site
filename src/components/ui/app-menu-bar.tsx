"use client";

import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from "@/components/ui/menubar";
import {
  House, 
  Folder,
  Calendar,
  LibraryBig, 
  Bell,
} from "lucide-react";

export default function AppMenuBar() {
  return (
    // 移除白色背景和边框，改为透明底色，增大间距，并引入 VT323 像素字体风格
    <Menubar className="border-none bg-transparent shadow-none h-auto p-0 gap-6 sm:gap-10 justify-center font-['VT323']">
      
      {/* 首页 */}
      <MenubarMenu>
        <MenubarTrigger className="bg-transparent hover:bg-transparent text-slate-700 hover:text-blue-600 transition-colors cursor-pointer text-xl sm:text-2xl flex items-center gap-2">
          <House className="w-5 h-5" strokeWidth={2} />
          <span className="hidden sm:inline">Home</span>
        </MenubarTrigger>
      </MenubarMenu>

      {/* 项目 */}
      <MenubarMenu>
        <MenubarTrigger className="bg-transparent hover:bg-transparent text-slate-700 hover:text-blue-600 transition-colors cursor-pointer text-xl sm:text-2xl flex items-center gap-2">
          <Folder className="w-5 h-5" strokeWidth={2} />
          <span className="hidden sm:inline">Projects</span>
        </MenubarTrigger>
        {/* 下拉菜单强制使用无衬线字体，保证中文小字的可读性 */}
        <MenubarContent className="font-sans">
          <MenubarItem>全部项目</MenubarItem>
          <MenubarItem>新建项目</MenubarItem>
          <MenubarItem>归档项目</MenubarItem>
        </MenubarContent>
      </MenubarMenu>

      {/* 日历 */}
      <MenubarMenu>
        <MenubarTrigger className="bg-transparent hover:bg-transparent text-slate-700 hover:text-blue-600 transition-colors cursor-pointer text-xl sm:text-2xl flex items-center gap-2">
          <Calendar className="w-5 h-5" strokeWidth={2} />
          <span className="hidden sm:inline">Calendar</span>
        </MenubarTrigger>
      </MenubarMenu>

      {/* 库 */}
      <MenubarMenu>
        <MenubarTrigger className="bg-transparent hover:bg-transparent text-slate-700 hover:text-blue-600 transition-colors cursor-pointer text-xl sm:text-2xl flex items-center gap-2">
          <LibraryBig className="w-5 h-5" strokeWidth={2} />
          <span className="hidden sm:inline">Library</span>
        </MenubarTrigger>
        <MenubarContent className="font-sans">
          <MenubarItem>Handbook</MenubarItem>
          <MenubarItem>Books</MenubarItem>
          <MenubarItem>Movies</MenubarItem>
        </MenubarContent>
      </MenubarMenu>

      {/* 通知 */}
      <MenubarMenu>
        <MenubarTrigger className="bg-transparent hover:bg-transparent text-slate-700 hover:text-blue-600 transition-colors cursor-pointer text-xl sm:text-2xl flex items-center gap-2">
          <Bell className="w-5 h-5" strokeWidth={2} />
          <span className="hidden sm:inline">Notifications</span>
        </MenubarTrigger>
      </MenubarMenu>

    </Menubar>
  );
}