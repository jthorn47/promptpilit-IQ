import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Phone, Mail, MapPin, Briefcase } from "lucide-react";

interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  status: "available" | "placed" | "interviewing" | "on-hold";
  skills: string[];
  experience: string;
  currentJob?: string;
}

const mockCandidates: Candidate[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    email: "sarah.johnson@email.com",
    phone: "(555) 123-4567",
    location: "Los Angeles, CA",
    status: "available",
    skills: ["Warehouse", "Forklift", "Inventory"],
    experience: "3 years",
    currentJob: "Warehouse Associate"
  },
  {
    id: "2",
    name: "Mike Rodriguez",
    email: "mike.r@email.com",
    phone: "(555) 987-6543",
    location: "San Diego, CA",
    status: "interviewing",
    skills: ["Manufacturing", "Quality Control", "Team Lead"],
    experience: "5 years"
  },
  {
    id: "3",
    name: "Lisa Chen",
    email: "lisa.chen@email.com",
    phone: "(555) 456-7890",
    location: "Orange County, CA",
    status: "placed",
    skills: ["Administrative", "Data Entry", "Customer Service"],
    experience: "2 years",
    currentJob: "Office Assistant"
  }
];

export default function CandidatesManager() {
  const [candidates] = useState<Candidate[]>(mockCandidates);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCandidates = candidates.filter(candidate =>
    candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800";
      case "placed":
        return "bg-blue-100 text-blue-800";
      case "interviewing":
        return "bg-yellow-100 text-yellow-800";
      case "on-hold":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Candidate Pipeline</h1>
          <p className="text-muted-foreground">
            Manage your talent pool and track candidate progress
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Candidate
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search candidates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredCandidates.map((candidate) => (
          <Card key={candidate.id} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{candidate.name}</CardTitle>
                  <CardDescription className="flex items-center mt-1">
                    <MapPin className="h-3 w-3 mr-1" />
                    {candidate.location}
                  </CardDescription>
                </div>
                <Badge className={getStatusColor(candidate.status)}>
                  {candidate.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center text-sm text-muted-foreground">
                <Mail className="h-3 w-3 mr-2" />
                {candidate.email}
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Phone className="h-3 w-3 mr-2" />
                {candidate.phone}
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Briefcase className="h-3 w-3 mr-2" />
                {candidate.experience} experience
              </div>
              <div className="flex flex-wrap gap-1">
                {candidate.skills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="text-xs">
                    {skill}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}