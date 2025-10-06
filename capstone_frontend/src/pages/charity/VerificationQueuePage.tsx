import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  listVerificationTasks,
  updateVerificationTask,
  addTaskComment,
} from "@/services/apiCharity";
import type { VerificationTask } from "@/types/charity";
import { MessageSquare, User, Calendar, AlertCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";

/**
 * Verification Queue / Tasks Page
 * Kanban-style or list view of verification tasks
 */
const VerificationQueuePage = () => {
  const [tasks, setTasks] = useState<VerificationTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedTask, setSelectedTask] = useState<VerificationTask | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    loadTasks();
  }, [page, statusFilter]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const response = await listVerificationTasks({
        page,
        pageSize: 20,
        status: statusFilter || undefined,
        sortBy: "createdAt",
        sortOrder: "desc",
      });
      setTasks(response.data);
      setTotalPages(response.pagination.totalPages);
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to load tasks",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (taskId: string, assignedTo: string) => {
    try {
      await updateVerificationTask(taskId, { assignedTo });
      toast({ title: "Success", description: "Task assigned" });
      loadTasks();
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Assignment failed",
        variant: "destructive",
      });
    }
  };

  const handleStatusChange = async (taskId: string, status: VerificationTask["status"]) => {
    try {
      await updateVerificationTask(taskId, { status });
      toast({ title: "Success", description: "Status updated" });
      loadTasks();
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Update failed",
        variant: "destructive",
      });
    }
  };

  const handleAddComment = async () => {
    if (!selectedTask || !newComment.trim()) {
      toast({
        title: "Error",
        description: "Please enter a comment",
        variant: "destructive",
      });
      return;
    }
    try {
      const updated = await addTaskComment(selectedTask.id, newComment);
      setSelectedTask(updated);
      setNewComment("");
      toast({ title: "Success", description: "Comment added" });
      loadTasks();
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to add comment",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: VerificationTask["status"]) => {
    const variants: Record<VerificationTask["status"], string> = {
      pending: "bg-warning/10 text-warning",
      in_progress: "bg-accent/10 text-accent-foreground",
      completed: "bg-success/10 text-success",
      blocked: "bg-destructive/10 text-destructive",
    };
    return (
      <Badge variant="outline" className={variants[status]}>
        {status.replace("_", " ")}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: VerificationTask["priority"]) => {
    const variants: Record<VerificationTask["priority"], string> = {
      low: "bg-muted text-muted-foreground",
      medium: "bg-accent/10 text-accent-foreground",
      high: "bg-destructive/10 text-destructive",
    };
    return (
      <Badge variant="outline" className={variants[priority]}>
        {priority}
      </Badge>
    );
  };

  if (loading && tasks.length === 0) {
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
          <div className="flex items-center justify-between">
            <CardTitle>Verification Queue</CardTitle>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="blocked">Blocked</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="space-y-md">
          {/* Task Cards */}
          <div className="grid gap-md md:grid-cols-2 lg:grid-cols-3">
            {tasks.length === 0 ? (
              <div className="col-span-full text-center py-2xl">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-md" />
                <p className="text-muted-foreground">No verification tasks</p>
              </div>
            ) : (
              tasks.map((task) => (
                <Card
                  key={task.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => {
                    setSelectedTask(task);
                    setDetailDialogOpen(true);
                  }}
                >
                  <CardHeader className="pb-sm">
                    <div className="flex items-start justify-between gap-sm">
                      <div className="flex-1">
                        <CardTitle className="text-base mb-xs">{task.title}</CardTitle>
                        <p className="text-xs text-muted-foreground">
                          {task.charityName}
                        </p>
                      </div>
                      {getPriorityBadge(task.priority)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-sm">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Status:</span>
                      {getStatusBadge(task.status)}
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Document:</span>
                      <span className="font-medium capitalize">{task.documentType}</span>
                    </div>
                    {task.assignedToName && (
                      <div className="flex items-center gap-xs text-xs">
                        <User className="h-3 w-3 text-muted-foreground" />
                        <span>{task.assignedToName}</span>
                      </div>
                    )}
                    {task.dueDate && (
                      <div className="flex items-center gap-xs text-xs">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                      </div>
                    )}
                    {task.comments.length > 0 && (
                      <div className="flex items-center gap-xs text-xs text-muted-foreground">
                        <MessageSquare className="h-3 w-3" />
                        <span>{task.comments.length} comments</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between pt-md">
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

      {/* Task Detail Dialog */}
      {selectedTask && (
        <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedTask.title}</DialogTitle>
              <DialogDescription>{selectedTask.charityName}</DialogDescription>
            </DialogHeader>
            <div className="space-y-md py-md">
              {/* Task Info */}
              <div className="grid grid-cols-2 gap-md text-sm">
                <div>
                  <p className="text-muted-foreground">Status:</p>
                  {getStatusBadge(selectedTask.status)}
                </div>
                <div>
                  <p className="text-muted-foreground">Priority:</p>
                  {getPriorityBadge(selectedTask.priority)}
                </div>
                <div>
                  <p className="text-muted-foreground">Document Type:</p>
                  <p className="font-medium capitalize">{selectedTask.documentType}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Created:</p>
                  <p className="font-medium">
                    {new Date(selectedTask.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-md">
                <div>
                  <Label htmlFor="assign-to">Assign To</Label>
                  <Select
                    value={selectedTask.assignedTo || ""}
                    onValueChange={(value) =>
                      handleAssign(selectedTask.id, value)
                    }
                  >
                    <SelectTrigger id="assign-to" className="mt-sm">
                      <SelectValue placeholder="Unassigned" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin1">Admin User 1</SelectItem>
                      <SelectItem value="admin2">Admin User 2</SelectItem>
                      <SelectItem value="reviewer1">Reviewer 1</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="change-status">Change Status</Label>
                  <Select
                    value={selectedTask.status}
                    onValueChange={(value) =>
                      handleStatusChange(
                        selectedTask.id,
                        value as VerificationTask["status"]
                      )
                    }
                  >
                    <SelectTrigger id="change-status" className="mt-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="blocked">Blocked</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Comments */}
              <div className="space-y-sm">
                <h3 className="font-medium">Internal Comments</h3>
                <div className="space-y-md max-h-48 overflow-y-auto">
                  {selectedTask.comments.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-md">
                      No comments yet
                    </p>
                  ) : (
                    selectedTask.comments.map((comment) => (
                      <div
                        key={comment.id}
                        className="border-l-2 border-border pl-md space-y-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">
                            {comment.userName}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(comment.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {comment.comment}
                        </p>
                      </div>
                    ))
                  )}
                </div>
                <div className="space-y-sm">
                  <Label htmlFor="new-comment">Add Comment</Label>
                  <Textarea
                    id="new-comment"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add an internal note..."
                    className="mt-sm"
                  />
                  <Button size="sm" onClick={handleAddComment}>
                    Add Comment
                  </Button>
                </div>
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

export default VerificationQueuePage;
