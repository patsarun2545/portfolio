"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Trash2, Mail, Eye, Clock, GripVertical } from "lucide-react";
import { format } from "date-fns";
import { getCSRFToken } from "@/lib/csrf-client";
import { useLocale } from "@/hooks/useLocale";
import { closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent, DndContext } from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy, SortableContext } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type Message = {
  id: number;
  name: string;
  email: string;
  subject?: string;
  message: string;
  isRead: boolean;
  createdAt: string;
};

function SortableMessage({ message, onView, onDelete, t }: { message: Message; onView: (message: Message) => void; onDelete: (id: number) => void; t: (key: string) => string }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: message.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <TableRow ref={setNodeRef} style={style} className={message.isRead ? "" : "bg-accent"}>
      <TableCell className="p-3">
        <button {...attributes} {...listeners} className="cursor-grab">
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </button>
      </TableCell>
      <TableCell className="p-3">
        <div>
          <div className="text-sm font-medium truncate max-w-[120px] sm:max-w-none">{message.name}</div>
          <div className="text-xs text-muted-foreground truncate max-w-[120px]">{message.email}</div>
        </div>
      </TableCell>
      <TableCell className="p-3 text-sm max-w-xs truncate hidden sm:table-cell">
        {message.subject || t("admin.messagesPage.noSubject")}
      </TableCell>
      <TableCell className="p-3 hidden md:table-cell">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          {format(new Date(message.createdAt), "MMM d, yyyy")}
        </div>
      </TableCell>
      <TableCell className="p-3">
        <Badge variant={message.isRead ? "secondary" : "default"} className="text-xs">
          {message.isRead ? t("admin.messagesPage.read") : t("admin.messagesPage.unread")}
        </Badge>
      </TableCell>
      <TableCell className="p-3">
        <div className="flex gap-1 justify-end">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onView(message)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onDelete(message.id)}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

export default function MessagesPage() {
  const { t } = useLocale();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<Message | null>(null);
  const [mounted, setMounted] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    setTimeout(() => setMounted(true), 0);
  }, []);

  const fetchMessages = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/messages");
      const data = await response.json();
      setMessages(data.items || data);
    } catch {
      toast.error(t("admin.messagesPage.failedToLoad"));
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchMessages();
  }, [fetchMessages]);

  const handleViewMessage = async (message: Message) => {
    setSelectedMessage(message);
    setIsDetailOpen(true);

    if (!message.isRead) {
      try {
        await fetch(`/api/admin/messages/${message.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "x-csrf-token": getCSRFToken(),
          },
          body: JSON.stringify({ isRead: true }),
        });
        fetchMessages();
      } catch {
        toast.error(t("admin.messagesPage.failedToMarkRead"));
      }
    }
  };

  const handleDelete = async (id: number) => {
    const message = messages.find(m => m.id === id);
    if (message) {
      setMessageToDelete(message);
      setDeleteDialogOpen(true);
    }
  };

  const confirmDelete = async () => {
    if (!messageToDelete) return;

    try {
      const response = await fetch(`/api/admin/messages/${messageToDelete.id}`, {
        method: "DELETE",
        headers: { "x-csrf-token": getCSRFToken() },
      });

      if (response.ok) {
        toast.success(t("admin.messagesPage.deleteSuccess"));
        fetchMessages();
        if (selectedMessage?.id === messageToDelete.id) {
          setSelectedMessage(null);
          setIsDetailOpen(false);
        }
      } else {
        toast.error(t("admin.messagesPage.deleteFailed"));
      }
    } catch {
      toast.error(t("admin.messagesPage.deleteFailed"));
    } finally {
      setDeleteDialogOpen(false);
      setMessageToDelete(null);
    }
  };

  const unreadCount = messages.filter((m) => !m.isRead).length;

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = messages.findIndex((message) => message.id === active.id);
      const newIndex = messages.findIndex((message) => message.id === over.id);
      const newMessages = arrayMove(messages, oldIndex, newIndex);
      setMessages(newMessages);

      // Update sortOrder
      const items = newMessages.map((message, index) => ({
        id: message.id,
        sortOrder: index,
      }));

      try {
        await fetch("/api/admin/messages/reorder", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-csrf-token": getCSRFToken(),
          },
          body: JSON.stringify({ items }),
        });
        toast.success(t("admin.messagesPage.reorderSuccess"));
      } catch {
        toast.error(t("admin.messagesPage.failedToReorder"));
        fetchMessages(); // Revert on error
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-border border-t-primary" />
          <p className="text-sm text-muted-foreground">{mounted ? t("admin.messagesPage.loading") : "Loading..."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t("admin.messagesPage.title")}</h1>
          <p className="text-muted-foreground text-sm sm:text-base mt-1">
            {t("admin.messagesPage.subtitle")}
            {unreadCount > 0 && (
              <Badge className="ml-2 text-xs" variant="default">
                {unreadCount} {t("admin.messagesPage.unread")}
              </Badge>
            )}
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={messages.map((m) => m.id)} strategy={verticalListSortingStrategy}>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10"></TableHead>
                      <TableHead className="whitespace-nowrap w-auto">{t("admin.messagesPage.from")}</TableHead>
                      <TableHead className="whitespace-nowrap w-auto hidden sm:table-cell">{t("admin.messagesPage.subject")}</TableHead>
                      <TableHead className="whitespace-nowrap w-auto hidden md:table-cell">{t("admin.messagesPage.date")}</TableHead>
                      <TableHead className="whitespace-nowrap w-16">{t("admin.messagesPage.status")}</TableHead>
                      <TableHead className="whitespace-nowrap w-auto text-right">{t("admin.messagesPage.actions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {messages.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          {t("admin.messagesPage.noMessages")}
                        </TableCell>
                      </TableRow>
                    ) : (
                      messages.map((message) => (
                        <SortableMessage
                          key={message.id}
                          message={message}
                          onView={handleViewMessage}
                          onDelete={handleDelete}
                          t={t}
                        />
                      ))
                    )}
                  </TableBody>
                </Table>
              </SortableContext>
            </DndContext>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Mail className="h-4 w-4 sm:h-5 sm:w-5" />
              {t("admin.messagesPage.messageDetails")}
            </DialogTitle>
            <DialogDescription className="text-sm">
              {t("admin.messagesPage.messageDetailsDesc")}
            </DialogDescription>
          </DialogHeader>
          {selectedMessage && (
            <div className="space-y-4 sm:space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                <div>
                  <p className="text-xs text-muted-foreground">{t("admin.messagesPage.from")}</p>
                  <p className="text-sm font-medium">{selectedMessage.name}</p>
                  <p className="text-xs text-muted-foreground">{selectedMessage.email}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t("admin.messagesPage.date")}</p>
                  <p className="text-sm font-medium">
                    {format(new Date(selectedMessage.createdAt), "PPP p")}
                  </p>
                </div>
              </div>

              {selectedMessage.subject && (
                <div>
                  <p className="text-xs text-muted-foreground">{t("admin.messagesPage.subject")}</p>
                  <p className="text-sm font-medium">{selectedMessage.subject}</p>
                </div>
              )}

              <div>
                <p className="text-xs text-muted-foreground">{t("contact.message")}</p>
                <div className="mt-2 p-3 sm:p-4 bg-muted rounded-lg whitespace-pre-wrap text-sm">
                  {selectedMessage.message}
                </div>
              </div>

              <div className="flex justify-end gap-2 sm:gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    const subject = encodeURIComponent(selectedMessage.subject || "");
                    const body = encodeURIComponent(selectedMessage.message);
                    window.open(
                      `https://mail.google.com/mail/?view=cm&fs=1&to=${selectedMessage.email}&su=${subject}&body=${body}`,
                      "_blank"
                    );
                  }}
                >
                  {t("admin.messagesPage.replyViaEmail")}
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    setMessageToDelete(selectedMessage);
                    setDeleteDialogOpen(true);
                  }}
                >
                  {t("admin.delete")}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t("admin.messagesPage.confirmDelete")}</DialogTitle>
            <DialogDescription>
              {t("admin.messagesPage.confirmDeleteDesc").replace("{name}", messageToDelete?.name || "")}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setMessageToDelete(null);
              }}
            >
              {t("admin.cancel")}
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              {t("admin.delete")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
