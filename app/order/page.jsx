import { getSiteData } from "@/lib/site";
import OrderForm from "@/components/OrderForm";

export const metadata = { title: "order request", robots: { index: false, follow: false } };

export default async function OrderPage() {
  const data = await getSiteData();
  return <OrderForm settings={data.settings} />;
}
