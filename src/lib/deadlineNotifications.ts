import { prisma } from '../server/db';
import { notifyLegalStakeholders } from '../server/notify/store';

export class DeadlineNotifier {
  async checkUpcomingDeadlines() {
    const upcomingCases = await prisma.legalCase.findMany({
      where: {
        deadline: {
          lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 أيام
          gte: new Date()
        }
      },
      include: {
        client: true,
        assignedTo: true,
        lawFirm: true
      }
    });

    for (const legalCase of upcomingCases) {
      await this.sendNotifications(legalCase);
    }
  }

  private async sendNotifications(legalCase: any) {
    // إرسال إشعارات للعميل والمحامي
    const userIds = [];
    if (legalCase.clientId) userIds.push(legalCase.clientId);
    if (legalCase.assignedToId) userIds.push(legalCase.assignedToId);

    // use notifyLegalStakeholders helper from server notify/store
    await notifyLegalStakeholders(legalCase, 'LEGAL_DEADLINE', `الموعد النهائي: ${legalCase.deadline?.toLocaleDateString()}`);
  }
}
