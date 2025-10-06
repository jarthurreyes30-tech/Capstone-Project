import { useState } from "react";
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

// Mock data
const mockLogs = [
  { 
    id: "1", 
    admin: "admin@charityhub.com", 
    action: "Approved Charity", 
    target: "Hope Foundation", 
    timestamp: "2024-03-15 14:30:22",
    type: "approval"
  },
  { 
    id: "2", 
    admin: "admin@charityhub.com", 
    action: "Updated User", 
    target: "john@example.com", 
    timestamp: "2024-03-15 13:15:10",
    type: "update"
  },
  { 
    id: "3", 
    admin: "admin@charityhub.com", 
    action: "Rejected Charity", 
    target: "Care 4 Kids", 
    timestamp: "2024-03-15 11:45:33",
    type: "rejection"
  },
  { 
    id: "4", 
    admin: "admin@charityhub.com", 
    action: "Deactivated User", 
    target: "bob@example.com", 
    timestamp: "2024-03-14 16:20:55",
    type: "deactivation"
  },
  { 
    id: "5", 
    admin: "admin@charityhub.com", 
    action: "Updated Settings", 
    target: "Site Configuration", 
    timestamp: "2024-03-14 09:10:12",
    type: "settings"
  },
];

export default function AuditLogs() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAction, setFilterAction] = useState("all");

  const getActionBadge = (type: string) => {
    switch (type) {
      case "approval":
        return <Badge className="bg-green-600">Approval</Badge>;
      case "rejection":
        return <Badge variant="destructive">Rejection</Badge>;
      case "update":
        return <Badge variant="secondary">Update</Badge>;
      case "deactivation":
        return <Badge variant="outline">Deactivation</Badge>;
      case "settings":
        return <Badge className="bg-info">Settings</Badge>;
      default:
        return <Badge>{type}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Audit Logs</h1>
        <p className="text-muted-foreground">
          Track all administrative actions
        </p>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterAction} onValueChange={setFilterAction}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by action" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            <SelectItem value="approval">Approvals</SelectItem>
            <SelectItem value="rejection">Rejections</SelectItem>
            <SelectItem value="update">Updates</SelectItem>
            <SelectItem value="deactivation">Deactivations</SelectItem>
            <SelectItem value="settings">Settings</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Admin</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Target</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Timestamp</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockLogs.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="font-medium">{log.id}</TableCell>
                <TableCell>{log.admin}</TableCell>
                <TableCell>{log.action}</TableCell>
                <TableCell>{log.target}</TableCell>
                <TableCell>{getActionBadge(log.type)}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{log.timestamp}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
