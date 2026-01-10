import PDFDocument from "pdfkit";

const generateInvoice = (res, order) => {
  const doc = new PDFDocument({ margin: 50 });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=invoice-${order._id}.pdf`
  );

  doc.pipe(res);

  doc.fontSize(20).text("DESVISA INVOICE", { align: "center" });
  doc.moveDown();

  doc.fontSize(12).text(`Order ID: ${order._id}`);
  doc.text(`Date: ${new Date(order.createdAt).toDateString()}`);
  doc.text(`Customer: ${order.user.name}`);
  doc.text(`Email: ${order.user.email}`);
  doc.moveDown();

  doc.text("Items:");
  doc.moveDown(0.5);

  order.orderItems.forEach((item) => {
    doc.text(
      `${item.name} × ${item.quantity}  -  ₹${item.price * item.quantity}`
    );
  });

  doc.moveDown();
  doc.text(`Total Amount: ₹${order.totalPrice}`, { bold: true });
  doc.moveDown();

  doc.text("Thank you for shopping with Desvisa!", {
    align: "center",
  });

  doc.end();
};


export default generateInvoice;