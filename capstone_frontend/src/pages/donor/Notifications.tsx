import { useEffect, useState } from "react";
import { Bell, Check, CheckCheck, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { authService } from "@/services/auth";

interface NotificationItem {
  id: number;
  title?: string;
  message: string;
  type?: string; // e.g., donation_confirmed, new_post, reminder
  is_read: boolean;
  created_at: string;
}

export default function Notifications() {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const token = authService.getToken();
      if (!token) return;
      const res = await fetch(`${API_URL}/api/me/notifications`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }
      });
      if (!res.ok) throw new Error('Failed to load notifications');
      const payload = await res.json();
      const list: NotificationItem[] = payload.data ?? payload;
      setItems(list);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Unable to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      const token = authService.getToken();
      if (!token) return;
      const res = await fetch(`${API_URL}/api/notifications/${id}/read`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to mark as read');
      setItems((prev) => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Unable to mark as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = authService.getToken();
      if (!token) return;
      const res = await fetch(`${API_URL}/api/notifications/mark-all-read`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to mark all as read');
      setItems((prev) => prev.map(n => ({ ...n, is_read: true })));
      toast.success('All notifications marked as read');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Unable to mark all as read');
    }
  };

  const deleteNotification = async (id: number) => {
    try {
      const token = authService.getToken();
      if (!token) return;
      const res = await fetch(`${API_URL}/api/notifications/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to delete notification');
      setItems((prev) => prev.filter(n => n.id !== id));
      toast.success('Notification deleted');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Unable to delete notification');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Bell className="h-6 w-6" /> Notifications
        </h1>
        <p className="text-muted-foreground">Stay updated with confirmations and updates from charities you follow.</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Inbox</CardTitle>
              <CardDescription>Your latest notifications</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={fetchNotifications} disabled={loading}>
                Refresh
              </Button>
              <Button variant="default" size="sm" onClick={markAllAsRead} disabled={loading || items.every(n => n.is_read)}>
                <CheckCheck className="h-4 w-4 mr-2" /> Mark all as read
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-12 text-center text-muted-foreground">Loading notifications...</div>
          ) : items.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">No notifications yet.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((n) => (
                  <TableRow key={n.id} className={!n.is_read ? 'bg-primary/5' : ''}>
                    <TableCell>
                      {n.is_read ? (
                        <Badge variant="secondary">Read</Badge>
                      ) : (
                        <Badge>Unread</Badge>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{n.title || (n.type ? n.type.replace(/_/g, ' ') : 'Notification')}</TableCell>
                    <TableCell className="max-w-xl">
                      <p className="text-sm line-clamp-2">{n.message}</p>
                    </TableCell>
                    <TableCell>{new Date(n.created_at).toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {!n.is_read && (
                          <Button variant="ghost" size="icon" onClick={() => markAsRead(n.id)}>
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" onClick={() => deleteNotification(n.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
