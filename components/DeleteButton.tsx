"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

interface Props { id: string }

export default function DeleteButton({ id }: Props) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm("Delete this assignment?")) return;
    setDeleting(true);
    await fetch(`/api/assignments/${id}`, { method: "DELETE" });
    router.push("/");
    router.refresh();
  }

  return (
    <button
      onClick={handleDelete}
      disabled={deleting}
      className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-red-500 transition-colors disabled:opacity-50"
    >
      <Trash2 size={15} />
      {deleting ? "Deleting…" : "Delete"}
    </button>
  );
}
