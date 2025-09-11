// src/services/paymentService.ts
class PaymentService {
  // دفع تأمين المزايدة
  async payBidDeposit(auctionId: string, amount: number): Promise<Payment> {
    const user = await authService.getCurrentUser();
    
    // التحقق من رصيد المستخدم
    if (user.balance < amount) {
      throw new Error('الرصيد غير كافٍ لدفع التأمين');
    }

    // خصم المبلغ من رصيد المستخدم
    const payment = await this.createPayment({
      userId: user.id,
      auctionId,
      type: 'deposit',
      amount,
      method: 'wallet',
      status: 'pending'
    });

    try {
      // عملية الدفع
      await this.processPayment(payment.id);
      
      // تحديث رصيد المستخدم
      await userService.updateBalance(user.id, -amount);
      
      // تفعيل قدرة المستخدم على المزايدة
      await auctionService.allowBidding(auctionId, user.id);
      
      return { ...payment, status: 'completed' };
    } catch (error) {
      await this.updatePaymentStatus(payment.id, 'failed');
      throw new Error('فشل في عملية الدفع');
    }
  }

  // استرداد التأمين في حال عدم الفوز
  async refundDeposit(bidId: string): Promise<void> {
    const bid = await bidService.getBid(bidId);
    const payment = await this.getBidDepositPayment(bidId);

    if (payment && payment.status === 'completed') {
      // استرداد المبلغ للمستخدم
      await userService.updateBalance(bid.userId, payment.amount);
      await this.updatePaymentStatus(payment.id, 'refunded');
    }
  }

  // دفع قيمة الفوز النهائية
  async payFinalAmount(auctionId: string): Promise<Payment> {
    const auction = await auctionService.getAuction(auctionId);
    const user = await authService.getCurrentUser();

    if (auction.winnerId !== user.id) {
      throw new Error('أنت لم تفز بهذا المزاد');
    }

    const finalAmount = auction.currentBid - auction.depositAmount;

    if (user.balance < finalAmount) {
      throw new Error('الرصيد غير كافٍ لدفع المبلغ النهائي');
    }

    const payment = await this.createPayment({
      userId: user.id,
      auctionId,
      type: 'final',
      amount: finalAmount,
      method: 'wallet',
      status: 'pending'
    });

    try {
      await this.processPayment(payment.id);
      await userService.updateBalance(user.id, -finalAmount);
      
      // تحويل المبلغ للبائع (بعد خصم العمولة)
      const commission = this.calculateCommission(finalAmount);
      const sellerAmount = finalAmount - commission;
      
      await userService.updateBalance(auction.sellerId, sellerAmount);
      await this.recordCommission(auctionId, commission);
      
      return { ...payment, status: 'completed' };
    } catch (error) {
      await this.updatePaymentStatus(payment.id, 'failed');
      throw new Error('فشل في عملية الدفع النهائي');
    }
  }
}