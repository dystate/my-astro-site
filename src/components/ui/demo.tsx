import { LoginModal } from "@/components/login-modal";

export default function DemoOne() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold">欢迎使用我们的应用</h1>
        <p className="text-muted-foreground">点击下方按钮体验登录弹窗</p>
        
        {/* 渲染弹窗组件 */}
        <LoginModal />
      </div>
    </div>
  );
}