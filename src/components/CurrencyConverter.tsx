import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ExchangeRates {
  [key: string]: number;
}

interface CurrencyData {
  code: string;
  name: string;
  symbol: string;
}

const popularCurrencies: CurrencyData[] = [
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥" },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$" },
  { code: "CHF", name: "Swiss Franc", symbol: "CHF" },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥" },
  { code: "PHP", name: "Philippine Peso", symbol: "₱" },
  { code: "INR", name: "Indian Rupee", symbol: "₹" },
  { code: "KRW", name: "South Korean Won", symbol: "₩" },
  { code: "SGD", name: "Singapore Dollar", symbol: "S$" },
  { code: "THB", name: "Thai Baht", symbol: "฿" },
  { code: "MXN", name: "Mexican Peso", symbol: "$" },
  { code: "BRL", name: "Brazilian Real", symbol: "R$" },
];

export function CurrencyConverter() {
  const [amount, setAmount] = useState<string>("1");
  const [fromCurrency, setFromCurrency] = useState<string>("USD");
  const [toCurrency, setToCurrency] = useState<string>("EUR");
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates>({});
  const [convertedAmount, setConvertedAmount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const { toast } = useToast();

  const fetchExchangeRates = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${fromCurrency}`);
      if (!response.ok) {
        throw new Error("Failed to fetch exchange rates");
      }
      const data = await response.json();
      setExchangeRates(data.rates);
      setLastUpdated(new Date().toLocaleTimeString());
      
      // Auto-convert if amount is valid
      const numAmount = parseFloat(amount);
      if (!isNaN(numAmount) && data.rates[toCurrency]) {
        setConvertedAmount(numAmount * data.rates[toCurrency]);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch exchange rates. Please check your internet connection.",
        variant: "destructive",
      });
      console.error("Error fetching exchange rates:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const swapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    if (convertedAmount && amount) {
      setAmount(convertedAmount.toString());
      setConvertedAmount(parseFloat(amount));
    }
  };

  useEffect(() => {
    fetchExchangeRates();
  }, [fromCurrency]);

  // Auto-convert when target currency changes
  useEffect(() => {
    const numAmount = parseFloat(amount);
    if (!isNaN(numAmount) && numAmount > 0 && exchangeRates[toCurrency]) {
      setConvertedAmount(numAmount * exchangeRates[toCurrency]);
    }
  }, [toCurrency, exchangeRates, amount]);

  const getFromCurrencyData = () => popularCurrencies.find(c => c.code === fromCurrency);
  const getToCurrencyData = () => popularCurrencies.find(c => c.code === toCurrency);

  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="shadow-elegant border-0 bg-card/90 backdrop-blur-sm">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Currency Converter
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Get real-time exchange rates
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* From Currency Section */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">From</label>
            <div className="flex space-x-2">
              <div className="flex-1">
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="text-lg font-semibold transition-smooth focus:ring-primary"
                  min="0"
                  step="any"
                />
              </div>
              <Select value={fromCurrency} onValueChange={setFromCurrency}>
                <SelectTrigger className="w-24 transition-smooth">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {popularCurrencies.map((currency) => (
                    <SelectItem key={currency.code} value={currency.code}>
                      {currency.code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {getFromCurrencyData() && (
              <p className="text-sm text-muted-foreground">
                {getFromCurrencyData()!.name}
              </p>
            )}
          </div>

          {/* Swap Button */}
          <div className="flex justify-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={swapCurrencies}
              className="rounded-full border border-border hover:bg-accent transition-smooth"
            >
              <ArrowUpDown className="h-4 w-4" />
            </Button>
          </div>

          {/* To Currency Section */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">To</label>
            <div className="flex space-x-2">
              <div className="flex-1">
                <div className="h-10 rounded-md border border-input bg-muted/50 px-3 py-2 flex items-center">
                  <span className="text-lg font-semibold text-foreground">
                    {convertedAmount !== null 
                      ? new Intl.NumberFormat('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 6
                        }).format(convertedAmount)
                      : "0.00"
                    }
                  </span>
                </div>
              </div>
              <Select value={toCurrency} onValueChange={setToCurrency}>
                <SelectTrigger className="w-24 transition-smooth">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {popularCurrencies.map((currency) => (
                    <SelectItem key={currency.code} value={currency.code}>
                      {currency.code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {getToCurrencyData() && (
              <p className="text-sm text-muted-foreground">
                {getToCurrencyData()!.name}
              </p>
            )}
          </div>

          {/* Exchange Rate Info */}
          {exchangeRates[toCurrency] && lastUpdated && (
            <div className="text-center space-y-2 pt-4 border-t border-border">
              <div className="flex items-center justify-center space-x-2">
                {isLoading && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
                <p className="text-sm text-muted-foreground">
                  1 {fromCurrency} = {exchangeRates[toCurrency].toFixed(6)} {toCurrency}
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                Last updated: {lastUpdated}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}