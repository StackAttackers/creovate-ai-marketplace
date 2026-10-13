import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { useCampaigns } from '../../hooks/useCampaigns';
import { useAuth } from '../../hooks/useAuth';
import { saveInvitation } from '../../services/store/dataStore';
import { Send, CheckCircle2 } from 'lucide-react';

interface InviteCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  creatorId: string;
  creatorName: string;
}

export function InviteCreatorModal({
  isOpen,
  onClose,
  creatorId,
  creatorName,
}: InviteCreatorModalProps) {
  const { campaigns } = useCampaigns();
  const { user } = useAuth();
  const [selectedCampaignId, setSelectedCampaignId] = useState(
    campaigns[0]?.id || ''
  );
  const [message, setMessage] = useState('');
  const [offeredBudget, setOfferedBudget] = useState('75000');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newInvitation = {
      id: `inv-${Date.now()}`,
      campaignId: selectedCampaignId,
      campaignTitle: campaigns.find((c) => c.id === selectedCampaignId)?.title || 'Direct Project Engagement',
      brandId: user?.uid || 'brand-demo',
      brandName: user?.displayName || 'Brand Partner',
      creatorId,
      creatorName,
      message,
      offeredBudget: Number(offeredBudget),
      status: 'pending' as const,
      createdAt: new Date().toISOString(),
    };

    saveInvitation(newInvitation);
    setSent(true);
    setTimeout(() => {
      setSent(false);
      onClose();
    }, 1200);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Invite ${creatorName} to Project`}
      description="Send a collaboration invitation with campaign details and offered budget."
      maxWidth="md"
    >
      {sent ? (
        <div className="py-8 text-center space-y-3">
          <div className="inline-flex p-3 rounded-full bg-emerald-500/20 text-emerald-400">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h4 className="text-lg font-bold text-white">Invitation Sent!</h4>
          <p className="text-sm text-gray-400">
            {creatorName} has received your invitation notification.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Select Campaign"
            value={selectedCampaignId}
            onChange={(e) => setSelectedCampaignId(e.target.value)}
            options={
              campaigns.length > 0
                ? campaigns.map((c) => ({ value: c.id, label: c.title }))
                : [{ value: 'custom', label: 'Direct Project Engagement' }]
            }
          />

          <Input
            label="Offered Budget (₹ INR)"
            type="number"
            value={offeredBudget}
            onChange={(e) => setOfferedBudget(e.target.value)}
            required
          />

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
              Personalized Note
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              required
              className="w-full rounded-xl border border-white/10 bg-white/[0.04] p-3 text-sm text-white placeholder-gray-500 focus:border-violet-500/50 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
              placeholder={`Hi ${creatorName}, we love your portfolio and would like to collaborate on our upcoming project...`}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" leftIcon={<Send className="w-4 h-4" />}>
              Send Invitation
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
