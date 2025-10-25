"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export interface ReusableDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  showCloseButton?: boolean;
  className?: string;

  // Optional action buttons
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void;
  confirmVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  isLoading?: boolean;
  disableConfirm?: boolean;
}

export function ReusableDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  showCloseButton = true,
  className,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
  confirmVariant = "default",
  isLoading = false,
  disableConfirm = false,
}: ReusableDialogProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  // Use controlled or uncontrolled state
  const isOpen = open !== undefined ? open : internalOpen;
  const setIsOpen = onOpenChange || setInternalOpen;

  const handleConfirm = async () => {
    if (!onConfirm) return;

    try {
      setLoading(true);
      await onConfirm();
      setIsOpen(false);
    } catch (error) {
      console.error("Dialog confirm error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    setIsOpen(false);
  };

  const isButtonLoading = isLoading || loading;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent showCloseButton={showCloseButton} className={className}>
        {(title || description) && (
          <DialogHeader>
            {title && <DialogTitle>{title}</DialogTitle>}
            {description && <DialogDescription>{description}</DialogDescription>}
          </DialogHeader>
        )}

        <div className="py-4">{children}</div>

        {(footer || confirmText || cancelText) && (
          <DialogFooter>
            {footer ? (
              footer
            ) : (
              <>
                {cancelText && (
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isButtonLoading}
                  >
                    {cancelText}
                  </Button>
                )}
                {confirmText && (
                  <Button
                    variant={confirmVariant}
                    onClick={handleConfirm}
                    disabled={isButtonLoading || disableConfirm}
                  >
                    {isButtonLoading ? "Loading..." : confirmText}
                  </Button>
                )}
              </>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
