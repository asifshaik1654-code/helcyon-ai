import React, { useState } from 'react';
import Papa from 'papaparse';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { formatCurrency } from '../../utils/formatters';
import { Transaction, TransactionType, PaymentMethod, ExpenseCategory } from '../../types';
import { Upload, Download, CheckCircle, AlertCircle, FileText } from 'lucide-react';

interface CSVImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (importedCount: number) => void;
}

interface ParsedRow {
  Date: string;
  Title: string;
  Amount: string | number;
  Type?: string;
  Category?: string;
  PaymentMethod?: string;
  Description?: string;
}

interface ValidatedRow {
  date: string;
  title: string;
  amount: number;
  type: TransactionType;
  category: string;
  paymentMethod: PaymentMethod;
  description: string;
  isDuplicate?: boolean;
  isValid: boolean;
  error?: string;
}

export const CSVImportModal: React.FC<CSVImportModalProps> = ({
  isOpen,
  onClose,
  onImportSuccess,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [previewRows, setPreviewRows] = useState<ValidatedRow[]>([]);
  const [parsingError, setParsingError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDownloadTemplate = () => {
    const csvContent =
      'Date,Title,Amount,Type,Category,PaymentMethod,Description\n' +
      '2026-11-01,Tech Company Salary,85000,income,Salary,Bank Transfer,Payroll deposit\n' +
      '2026-11-02,Apartment Rent,22000,expense,Housing,Net Banking,Monthly apartment rent\n' +
      '2026-11-03,Groceries & Supplies,3450,expense,Groceries,UPI,Weekly food supplies\n';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'helcyon_transactions_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);
    setParsingError(null);

    Papa.parse<ParsedRow>(uploadedFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          setParsingError('Failed to parse CSV file: ' + results.errors[0].message);
          return;
        }

        const validated: ValidatedRow[] = results.data.map((row, idx) => {
          const rawAmount = typeof row.Amount === 'string' ? parseFloat(row.Amount.replace(/[^0-9.-]/g, '')) : row.Amount;
          const isValidAmount = !isNaN(rawAmount) && rawAmount > 0;
          const rawType = (row.Type || 'expense').toLowerCase();
          const type: TransactionType = rawType.includes('inc') ? 'income' : 'expense';

          return {
            date: row.Date || new Date().toISOString().split('T')[0],
            title: row.Title || `Transaction #${idx + 1}`,
            amount: isValidAmount ? rawAmount : 0,
            type,
            category: row.Category || (type === 'income' ? 'Salary' : 'Other'),
            paymentMethod: (row.PaymentMethod as PaymentMethod) || 'UPI',
            description: row.Description || '',
            isValid: isValidAmount && !!row.Title,
            error: !isValidAmount ? 'Invalid amount' : !row.Title ? 'Title missing' : undefined,
          };
        });

        setPreviewRows(validated);
      },
      error: (err) => {
        setParsingError('File read error: ' + err.message);
      },
    });
  };

  const validCount = previewRows.filter((r) => r.isValid).length;
  const invalidCount = previewRows.filter((r) => !r.isValid).length;

  const handleConfirmImport = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onImportSuccess(validCount);
      onClose();
    }, 600);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Import Bank Transactions via CSV"
      description="Upload transaction exports from your bank or budgeting app. Review data before saving."
      maxWidth="2xl"
    >
      <div className="space-y-4">
        {/* Download Template Banner */}
        <div className="flex items-center justify-between p-3.5 bg-[#0A0E17] border border-slate-800 rounded-xl text-xs">
          <div className="flex items-center gap-2.5">
            <FileText className="w-4 h-4 text-emerald-400" />
            <span className="text-slate-300">Need the correct column structure?</span>
          </div>
          <button
            type="button"
            onClick={handleDownloadTemplate}
            className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-semibold transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download CSV Template</span>
          </button>
        </div>

        {/* Drag and Drop / File Input */}
        <label className="border-2 border-dashed border-slate-700 hover:border-emerald-500/60 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors bg-[#0A0E17]/40">
          <Upload className="w-8 h-8 text-slate-400 mb-2" />
          <span className="text-xs font-semibold text-slate-200">
            {file ? file.name : 'Click to select or drag and drop a .csv file'}
          </span>
          <span className="text-[11px] text-slate-500 mt-1">UTF-8 CSV up to 5MB</span>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>

        {parsingError && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-2 text-xs text-rose-300">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{parsingError}</span>
          </div>
        )}

        {/* Preview Table */}
        {previewRows.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-200">
                Preview ({previewRows.length} rows found)
              </span>
              <div className="flex items-center gap-2">
                <Badge variant="emerald" size="sm">
                  {validCount} Ready
                </Badge>
                {invalidCount > 0 && (
                  <Badge variant="rose" size="sm">
                    {invalidCount} Invalid
                  </Badge>
                )}
              </div>
            </div>

            <div className="max-h-56 overflow-y-auto border border-slate-800 rounded-xl bg-[#0A0E17]">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/80 sticky top-0 border-b border-slate-800 text-[11px] text-slate-400">
                  <tr>
                    <th className="p-2.5">Date</th>
                    <th className="p-2.5">Title</th>
                    <th className="p-2.5">Category</th>
                    <th className="p-2.5 text-right">Amount</th>
                    <th className="p-2.5 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {previewRows.slice(0, 10).map((row, i) => (
                    <tr key={i} className="hover:bg-slate-800/30">
                      <td className="p-2.5 text-slate-400 font-mono text-[11px]">{row.date}</td>
                      <td className="p-2.5 text-slate-200 font-medium truncate max-w-[150px]">
                        {row.title}
                      </td>
                      <td className="p-2.5">
                        <Badge variant="slate" size="sm">
                          {row.category}
                        </Badge>
                      </td>
                      <td
                        className={`p-2.5 text-right font-mono font-medium ${
                          row.type === 'income' ? 'text-emerald-400' : 'text-slate-200'
                        }`}
                      >
                        {formatCurrency(row.amount)}
                      </td>
                      <td className="p-2.5 text-center">
                        {row.isValid ? (
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-400 mx-auto" />
                        ) : (
                          <AlertCircle className="w-3.5 h-3.5 text-rose-400 mx-auto" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {previewRows.length > 10 && (
              <p className="text-[11px] text-slate-500 text-center">
                Showing first 10 rows of {previewRows.length} total transactions.
              </p>
            )}
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>

          <Button
            type="button"
            variant="primary"
            disabled={validCount === 0 || isProcessing}
            isLoading={isProcessing}
            onClick={handleConfirmImport}
          >
            Confirm & Import {validCount} Transactions
          </Button>
        </div>
      </div>
    </Modal>
  );
};
