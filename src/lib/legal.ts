/**
 * 처리방침·이용약관에 반복해서 나오는 사업자 정보.
 *
 * 두 문서에 같은 값을 따로 적어두면 한쪽만 고쳐져 어긋난다. 특히 연락처는
 * 법정 기재사항이라 어긋나면 그 자체가 위반이 될 수 있어 한 곳에서 관리한다.
 */
export const LEGAL = {
  serviceName: "문장서고",
  operatorName: "퀵비즈랩",
  businessNumber: "836-21-02585",
  cpoName: "예득경",
  cpoTitle: "대표",
  cpoPhone: "010-2349-9714",
  contactEmail: "qbizlab@gmail.com",
  effectiveDate: "2026년 8월 4일",
  lastRevisedDate: "2026년 8월 4일",
} as const;

/** 개인정보를 처리하는 해외 수탁자. 국외이전 고지(PIPA §28-8)의 근거가 된다. */
export const PROCESSORS = [
  {
    name: "Supabase, Inc.",
    task: "회원 인증, 데이터베이스 보관",
    items: "이메일, 비밀번호(암호화), 등록한 문장, 필사 기록, 기기 식별자",
    country: "미국",
  },
  {
    name: "Vercel, Inc.",
    task: "서비스 호스팅 및 운영",
    items: "서비스 이용 과정에서 전송되는 접속 정보",
    country: "미국",
  },
  {
    name: "Resend, Inc.",
    task: "로그인 인증 메일 발송",
    items: "이메일 주소",
    country: "미국",
  },
] as const;
