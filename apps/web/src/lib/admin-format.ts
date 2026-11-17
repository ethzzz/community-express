const actionLabels: Record<string, string> = {
  approve: '通过帖子',
  reject: '拒绝帖子',
  'report:resolve': '处理举报',
  'report:reject': '驳回举报',
  ban: '封禁用户',
  unban: '解封用户',
};

export function actionLabel(action: string) {
  return actionLabels[action] ?? action;
}
