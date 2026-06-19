"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardFooter,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react"; // 确保引入了图标

// 💡 【核心修改】：在这里硬编码你的两个专属账号
const VALID_ACCOUNTS = [
  { email: "dan@woaidan.com", password: "dan520520" },
  { email: "ding@woaidan.com", password: "ding025025" }
];

interface SignInFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface FormErrors {
  email?: string;
  password?: string;
  rememberMe?: string;
  general?: string;
}

const SignInBlock = () => {
  const [formData, setFormData] = useState<SignInFormData>({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // 基础格式校验
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    field: keyof SignInFormData,
    value: string | boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    setTimeout(() => {
      // 💡 【核心修改】：验证账号和密码是否匹配
      const matchedAccount = VALID_ACCOUNTS.find(
        (acc) => acc.email === formData.email && acc.password === formData.password
      );

      if (!matchedAccount) {
        // 如果找不到匹配的账号密码，抛出错误并停止登录
        setErrors({ general: "账号或密码错误，请重试。" });
        setIsLoading(false);
        return;
      }

      if (formData.rememberMe) {
        localStorage.setItem("rememberMe", "true");
      }

      // 验证通过，写入 Cookie (你可以把邮箱存在 cookie 里以便后续区分是谁登录的)
      document.cookie = `user_session=${matchedAccount.email}; path=/; max-age=86400`;

      // 刷新页面进入朋友圈
      window.location.reload();
    }, 800); // 稍微加一点延迟，让按钮有个 "Loading" 的动画效果
  };

  return (
    <Card className="w-full max-w-sm mx-auto flex flex-col gap-6 shadow-lg bg-transparent border-white/10">
      <CardHeader className="text-center pb-0">
        <CardTitle
          className="text-[28px] leading-none tracking-[-0.02em] text-white"
          style={{ fontFamily: "'Open Sans', sans-serif", fontWeight: 800 }}
        >
          WOADAN
        </CardTitle>
      </CardHeader>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <CardContent className="flex flex-col gap-4">
          {errors.general && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {errors.general}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="dan@woaidan.com"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              disabled={isLoading}
            />
            {errors.email && (
              <p className="text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              {/* 移除了 Forgot password 链接，因为只有两个硬编码账号 */}
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                disabled={isLoading}
              />
            </div>
            {errors.password && (
              <p className="text-sm text-red-600">{errors.password}</p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <Checkbox
              id="rememberMe"
              checked={formData.rememberMe}
              onCheckedChange={(checked) =>
                handleInputChange("rememberMe", checked === true)
              }
            />
            <Label htmlFor="rememberMe" className="ml-2 text-sm cursor-pointer">
              记住我
            </Label>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-4">
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? "验证中..." : "登录"}
          </Button>
          
          {/* 💡 移除了 Sign Up 注册入口 */}
        </CardFooter>
      </form>
    </Card>
  );
};

export default SignInBlock;