import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { listAuditLogs } from "@/services/apiCharity";
import type { AuditLogEntry } from "@/types/charity";
import { ChevronDown, ChevronRight, Search, Eye } from "lucide-react";
import { toast } from "@/hooks/use-toast";

/**
 * Audit Logs Page
 * Paginated list of audit events with filters and expandable details
 */
const AuditLogsPage = () => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    userId: "",
    action: "",
    entityType: "",
    startDate: "",
    endDate: "",
  });
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);

  useEffect(() => {
    loadLogs();
  }, [page]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const response = await listAuditLogs({
        page,
        pageSize: 50,
        ...filters,
        sortBy: "timestamp",
        sortOrder: "desc",
      });
      setLogs(response.data);
      setTotalPages(response.pagination.totalPages);
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to load logs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = () => {
    setPage(1);
    loadLogs();
  };

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const getEntityBadge = (entityType: string) => {
    const variants: Record<string, string> = {
      donation: "bg-success/10 text-success",
      campaign: "bg-primary/10 text-primary",
      document: "bg-accent/10 text-accent-foreground",
      user: "bg-warning/10 text-warning",
    };
    return (
      <Badge variant="outline" className={variants[entityType] || ""}>
        {entityType}
      </Badge>
    );
  };

  if (loading && logs.length === 0) {
    return (
      <div className="p-lg">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-lg space-y-lg">
      <Card>
        <CardHeader>
          <CardTitle>Audit Logs</CardTitle>
        </CardHeader>
        <CardContent className="space-y-md">
          {/* Filters */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-md">
            <div>
              <Label htmlFor="filter-user">User ID</Label>
              <Input
                id="filter-user"
                value={filters.userId}
                onChange={(e) =>
                  setFilters({ ...filters, userId: e.target.value })
                }
                placeholder="Filter by user..."
                className="mt-sm"
              />
            </div>
            <div>
              <Label htmlFor="filter-action">Action</Label>
              <Input
                id="filter-action"
                value={filters.action}
                onChange={(e) =>
                  setFilters({ ...filters, action: e.target.value })
                }
                placeholder="e.g., create, update..."
                className="mt-sm"
              />
            </div>
            <div>
              <Label htmlFor="filter-entity">Entity Type</Label>
              <Select
                value={filters.entityType}
                onValueChange={(value) =>
                  setFilters({ ...filters, entityType: value })
                }
              >
                <SelectTrigger id="filter-entity" className="mt-sm">
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All types</SelectItem>
                  <SelectItem value="donation">Donation</SelectItem>
                  <SelectItem value="campaign">Campaign</SelectItem>
                  <SelectItem value="document">Document</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="filter-start">Start Date</Label>
              <Input
                id="filter-start"
                type="date"
                value={filters.startDate}
                onChange={(e) =>
                  setFilters({ ...filters, startDate: e.target.value })
                }
                className="mt-sm"
              />
            </div>
            <div>
              <Label htmlFor="filter-end">End Date</Label>
              <Input
                id="filter-end"
                type="date"
                value={filters.endDate}
                onChange={(e) =>
                  setFilters({ ...filters, endDate: e.target.value })
                }
                className="mt-sm"
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleFilter} className="w-full">
                <Search className="h-4 w-4 mr-xs" />
                Filter
              </Button>
            </div>
          </div>

          {/* Table */}
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8"></TableHead>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead>Entity ID</TableHead>
                  <TableHead className="text-right">Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-lg">
                      <p className="text-muted-foreground">No audit logs found</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log) => (
                    <>
                      <TableRow key={log.id} className="cursor-pointer hover:bg-muted/30">
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleExpand(log.id)}
                          >
                            {expandedIds.has(log.id) ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </Button>
                        </TableCell>
                        <TableCell className="text-sm">
                          {new Date(log.timestamp).toLocaleString()}
                        </TableCell>
                        <TableCell className="font-medium">{log.userName}</TableCell>
                        <TableCell className="capitalize">{log.action}</TableCell>
                        <TableCell>{getEntityBadge(log.entityType)}</TableCell>
                        <TableCell className="font-mono text-xs">
                          {log.entityId.slice(0, 8)}...
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedLog(log);
                              setDetailDialogOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                      {expandedIds.has(log.id) && (
                        <TableRow>
                          <TableCell colSpan={7} className="bg-muted/20">
                            <div className="py-sm px-md space-y-xs text-sm">
                              {log.ipAddress && (
                                <p>
                                  <span className="text-muted-foreground">IP:</span>{" "}
                                  {log.ipAddress}
                                </p>
                              )}
                              <p>
                                <span className="text-muted-foreground">Details:</span>
                              </p>
                              <pre className="text-xs bg-muted p-sm rounded overflow-auto">
                                {JSON.stringify(log.details, null, 2)}
                              </pre>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-sm">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      {selectedLog && (
        <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Audit Log Details</DialogTitle>
              <DialogDescription>
                {new Date(selectedLog.timestamp).toLocaleString()}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-md py-md">
              <div className="grid grid-cols-2 gap-md text-sm">
                <div>
                  <p className="text-muted-foreground">User:</p>
                  <p className="font-medium">{selectedLog.userName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Action:</p>
                  <p className="font-medium capitalize">{selectedLog.action}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Entity:</p>
                  {getEntityBadge(selectedLog.entityType)}
                </div>
                <div>
                  <p className="text-muted-foreground">Entity ID:</p>
                  <code className="text-xs font-mono">{selectedLog.entityId}</code>
                </div>
                {selectedLog.ipAddress && (
                  <div>
                    <p className="text-muted-foreground">IP Address:</p>
                    <p className="font-medium">{selectedLog.ipAddress}</p>
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-sm">Event Details:</p>
                <pre className="text-xs bg-muted p-md rounded overflow-auto max-h-96">
                  {JSON.stringify(selectedLog.details, null, 2)}
                </pre>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDetailDialogOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default AuditLogsPage;
