import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Text } from "@/components/ui/text";

interface DeleteProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productName: string;
  onConfirm: () => void;
}

export function DeleteProductDialog({
  open,
  onOpenChange,
  productName,
  onConfirm,
}: DeleteProductDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="rounded-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle>
            <Text className="font-heading text-lg text-neutral-900">Delete Product?</Text>
          </AlertDialogTitle>
          <AlertDialogDescription>
            <Text className="text-[13px] text-neutral-500 font-primary">
              This will permanently remove {productName} and all its variants. This action
              cannot be undone.
            </Text>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel className="flex-1 h-11 rounded-xl">
            <Text className="text-[13px] font-heading">Cancel</Text>
          </AlertDialogCancel>
          <AlertDialogAction onPress={onConfirm} className="flex-1 h-11 rounded-xl bg-red-600">
            <Text className="text-[13px] font-heading text-white">Delete Product</Text>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}