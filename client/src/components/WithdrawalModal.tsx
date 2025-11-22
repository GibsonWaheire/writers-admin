import { useState } from 'react';
import { Modal } from './ui/Modal';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { useWallet } from '../contexts/WalletContext';
import { useToast } from '../hooks/use-toast';

interface WithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PAYMENT_METHODS = [
  { value: 'mpesa', label: 'M-Pesa', description: 'Mobile Money Transfer' },
  { value: 'bank_transfer', label: 'Bank Transfer', description: 'Direct Bank Transfer' },
  { value: 'cash', label: 'Cash Pickup', description: 'Physical Cash Collection' }
];

export function WithdrawalModal({ isOpen, onClose }: WithdrawalModalProps) {
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [accountDetails, setAccountDetails] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { wallet, requestWithdrawal } = useWallet();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !paymentMethod) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields."
      });
      return;
    }

    const withdrawalAmount = parseFloat(amount);
    if (isNaN(withdrawalAmount) || withdrawalAmount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid withdrawal amount."
      });
      return;
    }

    if (withdrawalAmount > wallet.availableBalance) {
      toast({
        title: "Insufficient Balance",
        description: `You only have KES ${wallet.availableBalance.toLocaleString()} available.`
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      await requestWithdrawal(withdrawalAmount, paymentMethod);
      
      toast({
        title: "Withdrawal Requested",
        description: `Your withdrawal request for KES ${withdrawalAmount.toLocaleString()} has been submitted.`,
      });
      
      // Reset form and close modal
      setAmount('');
      setPaymentMethod('');
      setAccountDetails('');
      setNotes('');
      onClose();
    } catch (error) {
      toast({
        title: "Withdrawal Failed",
        description: error instanceof Error ? error.message : "Failed to process withdrawal request."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setAmount('');
      setPaymentMethod('');
      setAccountDetails('');
      setNotes('');
      onClose();
    }
  };

  const getPaymentMethodDescription = (method: string) => {
    return PAYMENT_METHODS.find(m => m.value === method)?.description || '';
  };

  const getAccountDetailsPlaceholder = (method: string) => {
    switch (method) {
      case 'mpesa':
        return 'Enter M-Pesa phone number (e.g., 254700000000)';
      case 'bank_transfer':
        return 'Enter bank account number and bank name';
      case 'cash':
        return 'Enter pickup location and contact person';
      default:
        return 'Enter account details';
    }
  };

  const getAccountDetailsLabel = (method: string) => {
    switch (method) {
      case 'mpesa':
        return 'M-Pesa Phone Number';
      case 'bank_transfer':
        return 'Bank Account Details';
      case 'cash':
        return 'Pickup Details';
      default:
        return 'Account Details';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Request Withdrawal" size="lg">
      <div className="w-full max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Available Balance */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="text-sm text-green-800 font-medium">Available Balance</div>
            <div className="text-3xl font-bold text-green-900">
              KES {wallet.availableBalance.toLocaleString()}
            </div>
          </div>

          {/* Amount */}
          <div className="space-y-3">
            <Label htmlFor="amount" className="text-base font-medium">Withdrawal Amount (KES)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0"
              max={wallet.availableBalance}
              step="0.01"
              required
              disabled={isSubmitting}
              className="h-12 text-lg"
            />
            <div className="text-sm text-gray-500">
              Maximum: KES {wallet.availableBalance.toLocaleString()}
            </div>
          </div>

          {/* Payment Method */}
          <div className="space-y-3 pt-8 pb-8">
            <Label htmlFor="paymentMethod" className="text-base font-medium">Payment Method</Label>
            <div className="relative">
              <Select value={paymentMethod} onValueChange={setPaymentMethod} disabled={isSubmitting}>
                <SelectTrigger className="w-full h-12 text-lg">
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent 
                  className="z-[99999] min-w-[300px] bg-white border border-gray-200 shadow-lg rounded-lg"
                  position="popper"
                  side="bottom"
                  align="start"
                  sideOffset={4}
                  avoidCollisions={true}
                  collisionPadding={20}
                >
                  {PAYMENT_METHODS.map((method) => (
                    <SelectItem key={method.value} value={method.value} className="py-3 hover:bg-gray-100 focus:bg-gray-100">
                      <div>
                        <div className="font-medium text-base">{method.label}</div>
                        <div className="text-sm text-gray-500">{method.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Account Details */}
          {paymentMethod && (
            <div className="space-y-3">
              <Label htmlFor="accountDetails" className="text-base font-medium">
                {getAccountDetailsLabel(paymentMethod)}
              </Label>
              <Input
                id="accountDetails"
                placeholder={getAccountDetailsPlaceholder(paymentMethod)}
                value={accountDetails}
                onChange={(e) => setAccountDetails(e.target.value)}
                required
                disabled={isSubmitting}
                className="h-12 text-lg"
              />
              <div className="text-sm text-gray-500">
                {getPaymentMethodDescription(paymentMethod)}
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="space-y-3">
            <Label htmlFor="notes" className="text-base font-medium">Additional Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Any special instructions or notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              disabled={isSubmitting}
              className="text-base"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 h-12 text-base"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !amount || !paymentMethod || !accountDetails}
              className="flex-1 h-12 text-base bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? 'Processing...' : 'Request Withdrawal'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
