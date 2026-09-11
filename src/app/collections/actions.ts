"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type CollectionState = { error: string | null };

export async function createCollection(
  _prev: CollectionState,
  formData: FormData,
): Promise<CollectionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "로그인이 필요해요." };

  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || null;
  const isPublic = formData.get("isPublic") === "on";

  if (!title || title.length > 50) {
    return { error: "컬렉션 이름은 1~50자로 입력해주세요." };
  }
  if (description && description.length > 200) {
    return { error: "설명은 200자까지 쓸 수 있어요." };
  }

  const { data, error } = await supabase
    .from("collections")
    .insert({
      user_id: user.id,
      title,
      description,
      is_public: isPublic,
    })
    .select("id")
    .single();

  if (error) {
    return { error: "컬렉션 생성에 실패했어요." };
  }

  revalidatePath("/my");
  redirect(`/collections/${data.id}`);
}

export async function addToCollection(
  collectionId: string,
  sentenceId: string,
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  // 소유권 검증
  const { data: collection } = await supabase
    .from("collections")
    .select("id")
    .eq("id", collectionId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!collection) return;

  const { error } = await supabase
    .from("collection_items")
    .insert({ collection_id: collectionId, sentence_id: sentenceId });

  if (error && error.code !== "23505") {
    console.error("[addToCollection] failed:", error.message);
  }

  revalidatePath(`/collections/${collectionId}`);
}

export async function removeFromCollection(
  collectionId: string,
  sentenceId: string,
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  // 소유권 검증
  const { data: collection } = await supabase
    .from("collections")
    .select("id")
    .eq("id", collectionId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!collection) return;

  const { error } = await supabase
    .from("collection_items")
    .delete()
    .eq("collection_id", collectionId)
    .eq("sentence_id", sentenceId);

  if (error) {
    console.error("[removeFromCollection] failed:", error.message);
  }

  revalidatePath(`/collections/${collectionId}`);
}

export async function getMyCollections(): Promise<
  { id: string; title: string }[]
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("collections")
    .select("id, title")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return data ?? [];
}

export async function deleteCollection(collectionId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("collections")
    .delete()
    .eq("id", collectionId)
    .eq("user_id", user.id);

  revalidatePath("/my");
  redirect("/my");
}
