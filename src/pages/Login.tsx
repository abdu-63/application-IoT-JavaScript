import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Lock, Mail, Wifi, ShieldCheck } from "lucide-react";
import { AuthService } from "@/services/auth.service";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await AuthService.login(email, password);
      toast.success("Connexion réussie");
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Erreur de connexion");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await AuthService.register(email, password);
      toast.success("Compte créé");
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center mb-4">
            <div className="p-4 rounded-2xl bg-primary/10 border-2 border-primary/20">
              <ShieldCheck className="w-12 h-12 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gradient">IoT Dashboard</h1>
          <p className="text-muted-foreground">Authentification JWT sécurisée</p>
        </div>

        <Card className="glass-card p-8">
          <Tabs defaultValue="login">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Connexion</TabsTrigger>
              <TabsTrigger value="register">Inscription</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email"><Mail className="w-4 h-4 inline mr-2" />Email</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password"><Lock className="w-4 h-4 inline mr-2" />Mot de passe</Label>
                  <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Connexion..." : "Se connecter"}
                </Button>
                <p className="text-xs text-muted-foreground text-center mt-4">
                  Test: admin@iot.com / admin123
                </p>
              </form>
            </TabsContent>
            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reg-email">Email</Label>
                  <Input id="reg-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-password">Mot de passe (min 6 car.)</Label>
                  <Input id="reg-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Création..." : "Créer un compte"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </Card>

        <div className="text-center text-sm text-muted-foreground">
          <p>© 2024 IoT Dashboard - Security by Design</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
