import { IOrder } from "../models/order.model";

interface OrderPlacedTemplateProps {
  userName: string;
  order: IOrder;
}

export const orderPlacedTemplate = ({
  userName,
  order,
}: OrderPlacedTemplateProps): string => {
  return `
    <div style="font-family: Arial, sans-serif">
      <h2>Hi ${userName}, 🎉</h2>

      <p>Your order has been placed successfully.</p>

      <h3>Order Details</h3>
      <ul>
        ${order.items
          .map(
            (item) =>
              `<li>${item.title} × ${item.quantity} — Rs ${item.price}</li>`
          )
          .join("")}
      </ul>

      <p><b>Total:</b> Rs ${order.totalAmount}</p>

      <hr />
      <p>Thank you for shopping with us!</p>
    </div>
  `;
};
