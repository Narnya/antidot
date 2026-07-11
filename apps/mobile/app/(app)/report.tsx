// (app) → report. Report a subject (?type=activity|circle|user|message&id=...).
import { useLocalSearchParams } from 'expo-router';

import type { ReportSubjectType } from '../../src/features/activities';
import { ReportScreen } from '../../src/features/activities/screens/ReportScreen';

const VALID: ReportSubjectType[] = ['user', 'activity', 'circle', 'message'];

export default function Report() {
  const { type, id } = useLocalSearchParams<{ type: string; id: string }>();
  const subjectType: ReportSubjectType = VALID.includes(type as ReportSubjectType)
    ? (type as ReportSubjectType)
    : 'activity';
  return <ReportScreen subjectType={subjectType} subjectId={id ?? ''} />;
}
