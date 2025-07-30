import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const QuickTest = () => {
  const { user, signOut } = useAuth();
  
  const handleSignOut = async () => {
    await signOut();
  };
  
  return (
    <Card className="max-w-md mx-auto mt-20">
      <CardHeader>
        <CardTitle>Quick Test</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p>User: {user?.email || 'Not logged in'}</p>
          <Button onClick={handleSignOut} className="w-full">
            Sign Out
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickTest;