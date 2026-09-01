import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatDate } from './dateUtils';
import { toast } from 'react-hot-toast';

export const generateBillPDF = (saleData, storeProfile = {}) => {
  try {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Header - Store Info
    doc.setFontSize(22);
    doc.setTextColor(40, 40, 40);
    doc.text(storeProfile.store_name || "MamootilMedicals", 14, 22);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(storeProfile.address || "Medical Store Street", 14, 30);
    doc.text(`${storeProfile.city || "City"}, ${storeProfile.state || "State"} - ${storeProfile.pincode || ""}`, 14, 35);
    doc.text(`Phone: ${storeProfile.phone || "N/A"}`, 14, 40);
    doc.text(`Email: ${storeProfile.email || "N/A"}`, 14, 45);

    // Invoice Title
    doc.setFontSize(18);
    doc.setTextColor(0, 0, 0);
    doc.text("INVOICE", pageWidth - 25, 22, { align: "right" });
    
    // Metadata
    doc.setFontSize(10);
    doc.text(`Bill No: #INV-${saleData.id}`, pageWidth - 25, 32, { align: "right" });
    doc.text(`Date: ${formatDate(saleData.created_at)}`, pageWidth - 25, 37, { align: "right" });

    // Items Table
    const tableColumn = ["S.No", "Medicine Name", "Batch", "Qty", "Price", "Tax Amt", "Subtotal"];
    const tableRows = [];

    let totalTaxAmount = 0;

    if (saleData.items && Array.isArray(saleData.items)) {
      saleData.items.forEach((item, index) => {
        const qty = parseInt(item.quantity);
        const price = parseFloat(item.price_at_sale);
        const subtotal = parseFloat(item.subtotal);
        
        // Tax Amount = Subtotal - (Base Price * Qty)
        const itemTaxAmt = subtotal - (price * qty);
        totalTaxAmount += itemTaxAmt;

        const itemData = [
          index + 1,
          item.product_name || "N/A",
          item.batchno || "N/A",
          qty,
          `Rs.${price.toFixed(2)}`,
          `Rs.${itemTaxAmt.toFixed(2)}`, 
          `Rs.${subtotal.toFixed(2)}`
        ];
        tableRows.push(itemData);
      });
    }

    autoTable(doc, {
      startY: 55,
      head: [tableColumn],
      body: tableRows,
      theme: 'grid',
      headStyles: { fillColor: [46, 125, 50], textColor: [255, 255, 255] },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      styles: { fontSize: 9, cellPadding: 3 },
    });

    // Summary
    const finalY = (doc.lastAutoTable?.finalY || 55) + 10;
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`Total Tax: Rs.${totalTaxAmount.toFixed(2)}`, pageWidth - 25, finalY, { align: "right" });
    
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text(`Grand Total: Rs.${parseFloat(saleData.total_amount).toFixed(2)}`, pageWidth - 25, finalY + 7, { align: "right" });
    
    // Footer
    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text("Terms: This is a system-generated invoice.", 14, finalY + 25);
    doc.text("Thank you for choosing us!", pageWidth / 2, finalY + 40, { align: "center" });

    // Open in a new tab
    const pdfBlob = doc.output('bloburl');
    window.open(pdfBlob, '_blank');
  } catch (error) {
    console.error("PDF Generation Error:", error);
    toast.error("Format error: Could not open PDF preview.");
  }
};
