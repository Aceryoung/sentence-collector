import type { Metadata } from "next";
import Link from "next/link";
import { LEGAL } from "@/lib/legal";
import { Article, LegalPage, List, P } from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "저작권 안내",
};

export default function CopyrightPage() {
  return (
    <LegalPage title="저작권 안내" effectiveDate={LEGAL.effectiveDate}>
      <Article heading="글적의 인용 원칙">
        <P>
          글적은 이용자가 책, 영화, 노래 등에서 마음에 닿은 문장을 짧게
          인용하고 출처와 함께 기록하는 문장 아카이브 서비스입니다.
        </P>
        <P>
          글적에 등록되는 모든 문장은 「저작권법」 제28조(공표된 저작물의
          인용)에 따른 <strong>정당한 인용의 범위</strong> 안에서 이루어지는
          것을 원칙으로 하며, 다음 기준을 지키고 있습니다.
        </P>
        <List
          items={[
            "원문의 1~2문장만 짧게 인용합니다.",
            "저자명과 작품명(출처)을 반드시 표기합니다.",
            "이용자의 감상, 감정 태그 등 독자적 기여가 함께 기록됩니다.",
            "원저작물의 시장을 대체하지 않으며, 오히려 원작에 대한 관심을 높이는 것을 목표로 합니다.",
          ]}
        />
      </Article>

      <Article heading="저작권법 제28조 (공표된 저작물의 인용)">
        <P>
          공표된 저작물은 보도·비평·교육·연구 등을 위하여는 정당한 범위
          안에서 공정한 관행에 합치되게 이를 인용할 수 있습니다. 글적에서의
          문장 인용은 개인의 감상·비평·큐레이션 목적에 해당하며, 짧은 인용과
          출처 표기를 통해 공정한 관행을 준수합니다.
        </P>
      </Article>

      <Article heading="이용자의 책임">
        <P>
          문장을 등록하는 이용자는 다음 사항을 준수해야 합니다.
        </P>
        <List
          items={[
            "원저작자와 출처(작품명)를 정확히 기재해야 합니다.",
            "짧은 인용(1~2문장)의 범위를 넘어서는 등록을 해서는 안 됩니다.",
            "시(詩)의 전문, 노래 가사 전문 등 짧은 저작물 전체를 옮기는 것은 인용의 범위를 넘을 수 있으므로 주의해야 합니다.",
            "타인의 창작물을 자신의 것처럼 등록해서는 안 됩니다.",
          ]}
        />
        <P>
          등록된 문장에 대한 모든 법적 책임은 등록한 이용자 본인에게 있습니다.
          자세한 내용은{" "}
          <Link href="/terms" className="underline underline-offset-4">
            이용약관
          </Link>
          {" "}제6조를 참고해 주세요.
        </P>
      </Article>

      <Article heading="저작권자를 위한 안내">
        <P>
          글적은 저작권자의 권리를 존중합니다. 등록된 문장이 저작권을
          침해한다고 판단되시는 경우, 아래 연락처로 알려주시면{" "}
          <strong>접수일로부터 24시간 이내</strong>에 해당 문장의 노출을 우선
          차단(블라인드 처리)한 뒤 사실관계를 확인합니다.
        </P>
        <List
          items={[
            <>이메일 {LEGAL.contactEmail}</>,
            "신고 시 포함해 주실 사항: 침해가 의심되는 문장의 URL 또는 내용, 원저작물의 제목과 저작권자 정보, 연락처",
          ]}
        />
        <P>
          처리 결과는 신고인과 해당 문장을 등록한 이용자 모두에게 안내됩니다.
        </P>
      </Article>

      <Article heading="공식 SNS 계정의 인용 원칙">
        <P>
          글적 공식 인스타그램(@geuljeok_official) 등 SNS 계정에서도 동일한
          인용 원칙을 적용합니다. 모든 게시물에 저자명과 출처를 표기하며,
          저작권 관련 문의는 DM 또는 위 이메일로 받고 있습니다.
        </P>
      </Article>
    </LegalPage>
  );
}
