import { getSiteData } from "@/lib/site";
import HomeView from "@/components/HomeView";

export default async function HomePage() {
  const data = await getSiteData();
  return <HomeView data={data} />;
}
