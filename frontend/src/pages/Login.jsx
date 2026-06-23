import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Warehouse, LogIn } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

import api from "../lib/axios";

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");


  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    try {
      // 1. ส่งข้อมูลไปหา Django
      const response = await api.post('/api/token/', {
        username,
        password
      });

      // 2. ถ้าสำเร็จ เก็บ Token
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      localStorage.setItem('username', username);

      // 3. พาไปหน้า Dashboard
      navigate("/");

    } catch (error) {
      console.error("Login failed:", error);
      // 4. ถ้าผิดพลาด
      setErrorMessage("User ID หรือ Password ไม่ถูกต้อง");
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative p-4">

      <div className="w-full max-w-md animate-in fade-in zoom-in duration-500">
        <div className="flex justify-center mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary shadow-lg">
            <Warehouse className="h-6 w-6 text-primary-foreground" />
          </div>
        </div>

        <Card className="border-border/50 shadow-2xl backdrop-blur-sm bg-card/95">
          <CardHeader className="space-y-2 text-center">
            <CardTitle className="text-3xl font-bold tracking-tight">WarehouseOS</CardTitle>
            <CardDescription className="text-muted-foreground">
              Enter your ID and password to access the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {errorMessage && (
                <div className="p-3 text-sm text-red-500 bg-red-100/10 border border-red-500/50 rounded-md text-center">
                  {errorMessage}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-medium">User ID</Label>
                <Input
                  id="username"
                  placeholder="Enter your ID"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)} // 👈 ใช้ setUsername
                  className="bg-background/50 h-11"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-background/50 h-11"
                  required
                />
              </div>
              <Button type="submit" className="w-full h-11 text-base font-semibold mt-6 gap-2">
                <LogIn className="w-4 h-4" />
                Sign In
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center border-t border-border/50 pt-4 pb-4">
            <p className="text-xs text-muted-foreground">
              Secure access required for warehouse operations
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}