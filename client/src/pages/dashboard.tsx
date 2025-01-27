import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { useUser } from "@/hooks/use-user";
import { Loader2 } from "lucide-react";

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

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Welcome, {user?.username}</h1>
        <Button variant="outline" onClick={() => logout()}>
          Logout
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {status?.status.map((service: any) => (
          <Card key={service.service}>
            <CardHeader>
              <CardTitle className="capitalize">{service.service}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className={
                    service.health === 'healthy' ? 'text-green-500' :
                    service.health === 'degraded' ? 'text-yellow-500' :
                    'text-red-500'
                  }>
                    {service.health}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Active:</span>
                  <span>{service.isActive ? 'Yes' : 'No'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Last Check:</span>
                  <span>{new Date(service.lastCheck).toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
