import { useState } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/src/components/ui/alert-dialog";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Trash2 } from "lucide-react";

interface DeleteJobDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobTitle: string;
  onConfirm: () => Promise<void>;
}

const DeleteJobDialog = ({ open, onOpenChange, jobTitle, onConfirm }: DeleteJobDialogProps) => {
  const [typed, setTyped] = useState("");
  const [deleting, setDeleting] = useState(false);
  const matches = typed.trim().toLowerCase() === jobTitle.trim().toLowerCase();

  const handleConfirm = async () => {
    if (!matches) return;
    setDeleting(true);
    try {
      await onConfirm();
    } finally {
      setDeleting(false);
      setTyped("");
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) setTyped(""); }}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="h-5 w-5" />
            Delete Job
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-3 pt-2">
            <span className="block">
              This will permanently delete <strong className="text-foreground">"{jobTitle}"</strong> along with all its candidates and screening results. This action cannot be undone.
            </span>
            <span className="block text-sm">
              To confirm, type the job title below:
            </span>
            <Input
              placeholder={jobTitle}
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              className="mt-1"
              autoFocus
            />
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
          <Button
            variant="destructive"
            disabled={!matches || deleting}
            onClick={handleConfirm}
          >
            {deleting ? "Deleting…" : "Delete Job"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteJobDialog;
