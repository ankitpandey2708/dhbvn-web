import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function generateOutagePDF({
    columns,
    data,
    title = 'Faridabad Power Outage Information',
}: {
    columns: { header: string }[] | string[];
    data: any[];
    title?: string;
}) {
    try {
        console.log('Generating PDF with data:', { columns, data, title });

        const headers = Array.isArray(columns)
            ? columns.map((col: any) => (typeof col === 'string' ? col : col.header))
            : [];
        const tableData = data.map((row: any) =>
            Array.isArray(row) ? row : Object.values(row)
        );

        console.log('Processed data for PDF:', { headers, tableData });

        const doc = new jsPDF();
        doc.setFontSize(16);
        doc.text(title, 14, 15);
        doc.setFontSize(10);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 22);
        autoTable(doc, {
            head: [headers],
            body: tableData,
            startY: 30,
            theme: 'grid',
            headStyles: {
                fillColor: [41, 128, 185],
                textColor: 255,
                fontStyle: 'bold',
            },
            styles: {
                fontSize: 8,
                cellPadding: 2,
            },
            columnStyles: {
                0: { cellWidth: 40 },
                1: { cellWidth: 30 },
                2: { cellWidth: 40 },
                3: { cellWidth: 40 },
                4: { cellWidth: 40 },
            },
        });

        console.log('PDF generated successfully, saving...');
        doc.save('power-outage-report.pdf');
        console.log('PDF saved successfully');
    } catch (error) {
        console.error('Error generating PDF:', error);
        alert('Failed to generate PDF. Please try again.');
    }
}
