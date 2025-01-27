import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { useUser } from "@/hooks/use-user";
import { Loader2 } from "lucide-react";
import { VscGithub, VscTerminalCmd, VscCode } from "react-icons/vsc";

export default function Dashboard() {
  const { user, logout } = useUser();

  const { data: status, isLoading } = useQuery({
    queryKey: ['/api/monitor/status'],
    enabled: !!user
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const getServiceIcon = (service: string) => {
    switch (service) {
      case 'working-copy':
        return <VscGithub className="h-6 w-6" />;
      case 'shellfish':
        return <VscTerminalCmd className="h-6 w-6" />;
      case 'textastic':
        return <VscCode className="h-6 w-6" />;
      default:
        return null;
    }
  };

  // Add default services if none exist
  const services = status?.status?.length ? status.status : [
    { service: 'working-copy', health: 'pending', lastCheck: new Date().toISOString(), isActive: false },
    { service: 'shellfish', health: 'pending', lastCheck: new Date().toISOString(), isActive: false },
    { service: 'textastic', health: 'pending', lastCheck: new Date().toISOString(), isActive: false }
  ];

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Welcome, {user?.username}</h1>
          <p className="text-muted-foreground mt-2">Monitor and manage your service connections</p>
        </div>
        <Button variant="outline" onClick={() => logout()}>
          Logout
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {services.map((service) => (
          <Card key={service.service} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xl font-semibold capitalize flex items-center gap-2">
                {getServiceIcon(service.service)}
                {service.service.split('-').join(' ')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    service.health === 'healthy' ? 'bg-green-100 text-green-800' :
                    service.health === 'degraded' ? 'bg-yellow-100 text-yellow-800' :
                    service.health === 'pending' ? 'bg-blue-100 text-blue-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {service.health}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Active</span>
                  <span className={service.isActive ? 'text-green-600' : 'text-red-600'}>
                    {service.isActive ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Last Check</span>
                  <span className="text-sm">
                    {new Date(service.lastCheck).toLocaleString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}