import { PortfolioForm } from "../portfolio-form";

export default function AdminPortfolioNewPage() {
  return (
    <div className="px-6 py-10">
      <PortfolioForm mode="create" />
    </div>
  );
}
