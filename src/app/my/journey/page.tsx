import { redirect } from "next/navigation";

/** /my/journey → /my 통합 페이지로 리다이렉트 */
export default function JourneyPage() {
  redirect("/my");
}
