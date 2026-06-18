"use client";

import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import SignInBlock from "@/components/auth/sign-in-block";

export function LoginModal() {
  return (
    <Dialog>
      {/* 触发弹窗的按钮 */}
      <DialogTrigger asChild>
        <Button variant="default">Login</Button>
      </DialogTrigger>
      
      {/* 弹窗内容区域 */}
      <DialogContent 
        className="sm:max-w-md p-0 border-none bg-transparent shadow-none"
        aria-describedby="login-modal-description"
      >
        {/* 隐藏的 description 用于屏幕阅读器无障碍支持 */}
        <div id="login-modal-description" className="sr-only">
          Please enter your email and password to sign in to your account.
        </div>
        
        {/* 复用你写好的登录模块 */}
        <SignInBlock />
      </DialogContent>
    </Dialog>
  );
}