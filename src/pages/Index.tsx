import { CurrencyConverter } from "@/components/CurrencyConverter";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Currency Exchange
          </h1>
          <p className="text-muted-foreground">
            Convert currencies with live exchange rates
          </p>
        </div>
        <CurrencyConverter />
      </div>
    </div>
  );
};

export default Index;
