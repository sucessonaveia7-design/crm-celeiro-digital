"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Wheat } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate login delay
    setTimeout(() => {
      setLoading(false);
      router.push("/dashboard");
    }, 1500);
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background Image */}
      <Image
        src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2832&auto=format&fit=crop"
        alt="Wheat field under blue sky"
        fill
        className="object-cover"
        priority
      />
      
      {/* Overlay to ensure text readability if needed, though image is bright */}
      {/* <div className="absolute inset-0 bg-black/10" /> */}

      {/* Centered Content */}
      <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
        
        {/* Main Card */}
        <div className="w-full max-w-md overflow-hidden rounded-xl bg-white/95 shadow-2xl backdrop-blur-sm">
          
          {/* Header Area */}
          <div className="flex flex-col items-center justify-center pt-8 pb-4">
            <div className="flex flex-col items-center gap-2">
              {/* Wheat Icon */}
                <div className="relative mb-4 transform hover:scale-105 transition-transform duration-500">
                  <div className="absolute inset-0 bg-yellow-500/20 blur-xl rounded-full" />
                  <Wheat className="relative h-20 w-20 text-[#fbbf24] drop-shadow-md" strokeWidth={1.5} />
                </div>
                
                {/* Title */}
                <div className="flex flex-col items-center leading-none select-none">
                  <h1 className="font-dancing text-7xl text-[#8AA3C6] tracking-wide drop-shadow-md">
                    Celeiro
                  </h1>
                  <h1 className="font-dancing text-7xl text-[#8AA3C6] tracking-wide -mt-4 ml-12 drop-shadow-md">
                    Digital
                  </h1>
                </div>

                <div className="mt-6 text-center max-w-xs">
                  <p className="text-sm font-medium text-gray-500 italic">
                    "Entregue o seu caminho ao Senhor; confie nele, e ele o fará."
                  </p>
                  <span className="text-xs text-gray-400 mt-1 block">- Salmos 37:5</span>
                </div>
            </div>
          </div>

          {/* Form Area */}
          <div className="px-8 pb-10">
            <form onSubmit={handleLogin} className="space-y-5">
              
              {/* Email */}
              <div className="space-y-1">
                <Input
                  id="email"
                  type="email"
                  placeholder="Email *"
                  className="h-12 rounded-md border-gray-200 bg-gray-50/50 px-4 text-base text-slate-900 placeholder:text-gray-400 focus-visible:ring-blue-300 focus-visible:border-blue-300"
                  required
                />
              </div>

              {/* Password */}
              <div className="space-y-1">
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Senha *"
                    className="h-12 rounded-md border-gray-200 bg-gray-50/50 px-4 text-base text-slate-900 placeholder:text-gray-400 focus-visible:ring-blue-300 focus-visible:border-blue-300 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {/* Forgot Password Link */}
                <div className="flex justify-end pt-1">
                  <Link
                    href="#"
                    className="text-xs font-semibold text-gray-600 hover:text-gray-900 hover:underline"
                  >
                    Esqueci minha senha!
                  </Link>
                </div>
              </div>

              {/* Login Button */}
              <Button
                className="w-full rounded-full bg-[#93C5FD] hover:bg-[#60A5FA] py-6 text-lg font-medium text-white shadow-sm transition-all mt-4"
                type="submit"
                disabled={loading}
              >
                {loading ? "Entrando..." : "Logar"}
              </Button>

              {/* Footer Links */}
              <div className="flex flex-col items-center justify-center text-xs text-gray-600 mt-6">
                <p>
                  Ainda não é cadastrado?{" "}
                  <Link
                    href="#"
                    className="font-bold text-black hover:underline"
                  >
                    Clique aqui para criar sua conta!
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
