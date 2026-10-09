import React, { useState } from 'react';
import { Bill, BillType } from '../types';

interface BillPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  bills: Bill[];
  onPayBill: (billId: string, paymentMode: string) => Promise<any>;
}

export const BillPaymentModal: React.FC<BillPaymentModalProps> = ({
  isOpen,
  onClose,
  bills,
  onPayBill,
}) => {
  const [selectedBillType, setSelectedBillType] = useState<BillType>('Property Tax');
  const [searchConsumerNo, setSearchConsumerNo] = useState('');
  const [activeBill, setActiveBill] = useState<Bill | null>(
    bills.find((b) => b.type === 'Property Tax' && b.status === 'Unpaid') || bills[0] || null
  );
  const [paymentMode, setPaymentMode] = useState<string>('UPI (GPay / PhonePe)');
  const [isProcessing, setIsProcessing] = useState(false);
  const [receipt, setReceipt] = useState<any>(null);

  if (!isOpen) return null;

  const handleSelectType = (type: BillType) => {
    setSelectedBillType(type);
    const found = bills.find((b) => b.type === type && b.status === 'Unpaid');
    if (found) {
      setActiveBill(found);
      setSearchConsumerNo(found.consumerNumber);
    } else {
      const anyType = bills.find((b) => b.type === type);
      setActiveBill(anyType || null);
      if (anyType) setSearchConsumerNo(anyType.consumerNumber);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const found = bills.find(
      (b) => b.consumerNumber.toLowerCase() === searchConsumerNo.trim().toLowerCase()
    );
    if (found) {
      setActiveBill(found);
    } else {
      alert('No bill record found for the entered assessment / consumer number.');
    }
  };

  const handleProcessPayment = async () => {
    if (!activeBill) return;
    setIsProcessing(true);

    try {
      const res = await onPayBill(activeBill.id, paymentMode);
      setReceipt(res.receipt);
      setIsProcessing(false);
    } catch (err) {
      setIsProcessing(false);
      alert('Failed to process payment. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="bg-[#0B2144] text-white p-5 flex items-center justify-between border-b border-blue-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs">
              <i className="fa-solid fa-credit-card text-xl"></i>
            </div>
            <div>
              <h3 className="font-bold text-lg text-white font-poppins">
                CCMC Online Bill Payment Portal
              </h3>
              <p className="text-xs text-slate-300">
                Property Tax • Water Charges • Electricity
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* Modal Body */}
        {receipt ? (
          /* Receipt Success Screen */
          <div className="p-6 space-y-6">
            <div className="text-center py-4 bg-emerald-50 rounded-2xl border border-emerald-200">
              <div className="w-14 h-14 rounded-full bg-emerald-600 text-white mx-auto flex items-center justify-center text-2xl font-bold mb-2 shadow-md">
                <i className="fa-solid fa-check"></i>
              </div>
              <h3 className="text-xl font-bold text-emerald-950 font-poppins">
                Payment Successful!
              </h3>
              <p className="text-xs text-emerald-700">
                Transaction ID: <strong>{receipt.transactionId}</strong>
              </p>
            </div>

            {/* Official Digital Receipt Card */}
            <div className="bg-white border-2 border-slate-200 rounded-2xl p-5 shadow-xs text-xs space-y-3 font-poppins relative overflow-hidden">
              <div className="flex justify-between items-start border-b border-slate-200 pb-3">
                <div>
                  <div className="font-extrabold text-sm text-slate-900">
                    Coimbatore City Municipal Corporation
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Official e-Governance Tax & Revenue Receipt
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-bold text-blue-700">
                    {receipt.receiptNo}
                  </div>
                  <div className="text-[10px] text-slate-400">{receipt.paidAt}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-slate-700">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">
                    Taxpayer Name
                  </span>
                  <strong className="text-slate-900">{receipt.citizenName}</strong>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">
                    Assessment / Consumer No.
                  </span>
                  <strong className="text-blue-700 font-mono">
                    {receipt.consumerNumber}
                  </strong>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">
                    Bill Category
                  </span>
                  <strong className="text-slate-900">{receipt.type}</strong>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">
                    Payment Mode
                  </span>
                  <strong className="text-slate-900">{receipt.paymentMode}</strong>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl flex items-center justify-between border border-slate-200">
                <span className="font-bold text-slate-800 text-sm">
                  Total Amount Paid:
                </span>
                <span className="font-extrabold text-emerald-700 text-lg">
                  ₹{receipt.amountPaid.toLocaleString('en-IN')}
                </span>
              </div>

              {/* Stamp & Seal */}
              <div className="pt-2 flex items-center justify-between text-[10px] text-slate-500">
                <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                  <i className="fa-solid fa-stamp text-sm"></i> Digitally Verified CCMC Seal
                </div>
                <div>Computer Generated Receipt</div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  const printWin = window.open('', '_blank', 'width=750,height=900');
                  if (printWin) {
                    printWin.document.write(`
                      <!DOCTYPE html>
                      <html>
                      <head>
                        <title>CCMC Official e-Receipt - ${receipt.receiptNo}</title>
                        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;800&display=swap" rel="stylesheet">
                        <style>
                          body { font-family: 'Poppins', sans-serif; padding: 40px; color: #0f172a; max-width: 680px; margin: auto; }
                          .header { text-align: center; border-bottom: 2px solid #0284c7; padding-bottom: 15px; margin-bottom: 20px; }
                          .title { font-size: 20px; font-weight: 800; color: #0B2144; margin: 0; }
                          .subtitle { font-size: 11px; color: #0284c7; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; }
                          .receipt-box { border: 1px solid #cbd5e1; border-radius: 12px; padding: 20px; background: #f8fafc; margin-bottom: 20px; }
                          .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px dashed #e2e8f0; font-size: 13px; }
                          .label { color: #64748b; font-weight: 600; }
                          .value { font-weight: 700; color: #0f172a; }
                          .total-row { background: #0b2144; color: white; padding: 15px; border-radius: 10px; display: flex; justify-content: space-between; align-items: center; margin-top: 15px; }
                          .total-label { font-weight: 700; font-size: 14px; }
                          .total-amount { font-size: 22px; font-weight: 800; color: #38bdf8; }
                          .footer { text-align: center; font-size: 10px; color: #94a3b8; margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 15px; }
                          .stamp { color: #16a34a; font-weight: 700; display: inline-block; padding: 4px 10px; border: 2px solid #16a34a; border-radius: 6px; transform: rotate(-3deg); margin-top: 10px; }
                          @media print { .no-print { display: none; } }
                        </style>
                      </head>
                      <body>
                        <div class="header">
                          <h1 class="title">COIMBATORE CITY MUNICIPAL CORPORATION</h1>
                          <div class="subtitle">Government of Tamil Nadu • Revenue & Tax e-Services</div>
                          <div style="font-size:11px; color:#475569; margin-top:4px;">Town Hall, Big Bazaar Street, Coimbatore - 641001</div>
                        </div>

                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px; font-size:12px;">
                          <div><strong>Receipt No:</strong> <span style="font-family:monospace; color:#0284c7;">${receipt.receiptNo}</span></div>
                          <div><strong>Transaction Date:</strong> ${receipt.paidAt}</div>
                        </div>

                        <div class="receipt-box">
                          <div class="row">
                            <span class="label">Taxpayer Name:</span>
                            <span class="value">${receipt.citizenName}</span>
                          </div>
                          <div class="row">
                            <span class="label">Consumer / Assessment No:</span>
                            <span class="value" style="font-family:monospace;">${receipt.consumerNumber}</span>
                          </div>
                          <div class="row">
                            <span class="label">Bill Category:</span>
                            <span class="value">${receipt.type}</span>
                          </div>
                          <div class="row">
                            <span class="label">Payment Mode:</span>
                            <span class="value">${receipt.paymentMode}</span>
                          </div>
                          <div class="row">
                            <span class="label">Transaction Reference:</span>
                            <span class="value" style="font-family:monospace;">${receipt.transactionId}</span>
                          </div>

                          <div class="total-row">
                            <span class="total-label">NET AMOUNT PAID:</span>
                            <span class="total-amount">₹${receipt.amountPaid.toLocaleString('en-IN')}</span>
                          </div>
                        </div>

                        <div style="text-align:center;">
                          <div class="stamp">✓ DIGITALLY VERIFIED CCMC E-SEAL</div>
                        </div>

                        <div class="footer">
                          This is an official computer-generated municipal receipt issued by Coimbatore City Municipal Corporation. No physical signature required.<br>
                          Verification Reference: <strong>${receipt.receiptNo}</strong>
                        </div>

                        <div class="no-print" style="text-align:center; margin-top:20px;">
                          <button onclick="window.print()" style="padding:10px 24px; background:#0284c7; color:white; border:none; border-radius:8px; font-weight:bold; cursor:pointer;">🖨️ Print / Save as PDF</button>
                        </div>

                        <script>
                          setTimeout(() => { window.print(); }, 500);
                        </script>
                      </body>
                      </html>
                    `);
                    printWin.document.close();
                  }
                }}
                className="px-4 py-2 rounded-xl bg-[#0B2144] hover:bg-slate-900 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <i className="fa-solid fa-file-pdf text-amber-400"></i> Download / Print Official PDF Receipt
              </button>
              <button
                onClick={onClose}
                className="px-5 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* Payment Form Screen */
          <div className="p-6 space-y-5">
            {/* Bill Type Selector */}
            <div className="grid grid-cols-3 gap-2">
              {(['Property Tax', 'Water Bill', 'Electricity Bill'] as BillType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => handleSelectType(t)}
                  className={`p-3 rounded-xl text-xs font-bold border transition text-center ${
                    selectedBillType === t
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Consumer No. Search */}
            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                type="text"
                value={searchConsumerNo}
                onChange={(e) => setSearchConsumerNo(e.target.value)}
                placeholder="Enter Consumer / Assessment No. (e.g. CCMC-PT-984210)"
                className="flex-1 text-xs p-3 rounded-xl border border-slate-300 font-mono uppercase focus:ring-2 focus:ring-blue-600 outline-hidden"
              />
              <button
                type="submit"
                className="px-4 py-3 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition"
              >
                Fetch Bill
              </button>
            </form>

            {/* Bill Details Box */}
            {activeBill ? (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div>
                    <span className="font-extrabold text-sm text-slate-900">
                      {activeBill.type}
                    </span>
                    <p className="text-[11px] text-slate-500 font-mono">
                      {activeBill.consumerNumber}
                    </p>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                      activeBill.status === 'Paid'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {activeBill.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-slate-700">
                  <div>
                    <span className="text-slate-400">Citizen:</span>{' '}
                    <strong>{activeBill.citizenName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400">Period:</span>{' '}
                    <strong>{activeBill.period}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400">Due Date:</span>{' '}
                    <strong className="text-rose-600">{activeBill.dueDate}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400">Location:</span>{' '}
                    <strong>{activeBill.wardNo}</strong>
                  </div>
                </div>

                {/* Amount Summary */}
                <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="text-slate-500 text-[11px]">Total Net Amount Due:</div>
                    <div className="text-xs text-emerald-600 font-medium">
                      Includes 5% Early Bird Discount
                    </div>
                  </div>
                  <div className="text-xl font-extrabold text-slate-900 font-poppins">
                    ₹{activeBill.amount.toLocaleString('en-IN')}
                  </div>
                </div>

                {/* Payment Mode Selection */}
                {activeBill.status === 'Unpaid' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                      Select Online Payment Gateway
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        'UPI (GPay / PhonePe)',
                        'Credit / Debit Card',
                        'Net Banking (SBI / HDFC)',
                      ].map((mode) => (
                        <button
                          type="button"
                          key={mode}
                          onClick={() => setPaymentMode(mode)}
                          className={`p-2.5 rounded-xl text-[11px] font-bold border transition text-center ${
                            paymentMode === mode
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {mode}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-xs text-slate-500">
                No active bill selected. Please fetch consumer number.
              </div>
            )}

            {/* Bottom Actions */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition"
              >
                Cancel
              </button>

              {activeBill && activeBill.status === 'Unpaid' && (
                <button
                  type="button"
                  onClick={handleProcessPayment}
                  disabled={isProcessing}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition flex items-center gap-2"
                >
                  <i className="fa-solid fa-lock"></i>
                  {isProcessing ? 'Processing Payment...' : `Pay ₹${activeBill.amount} Now`}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
