import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calculator, Zap, Share2, Settings, ArrowDown } from "lucide-react";
import { toast } from "sonner";

interface BillData {
  totalBillAmount: string;
  totalConsumption: string;
  neighborLastReading: string;
  neighborCurrentReading: string;
  neighborPhone: string;
}

const BillCalculator = () => {
  const [billData, setBillData] = useState<BillData>({
    totalBillAmount: "",
    totalConsumption: "",
    neighborLastReading: "",
    neighborCurrentReading: "",
    neighborPhone: "919036004030",
  });

  const [showPhoneEdit, setShowPhoneEdit] = useState(false);

  // Load saved data on component mount
  useEffect(() => {
    try {
      const savedData = localStorage.getItem('billCalculatorData');
      if (savedData) {
        setBillData(JSON.parse(savedData));
      }
    } catch (error) {
      console.error('Error loading saved data:', error);
    }
  }, []);

  // Save data whenever billData changes
  useEffect(() => {
    try {
      localStorage.setItem('billCalculatorData', JSON.stringify(billData));
    } catch (error) {
      console.error('Error saving data:', error);
    }
  }, [billData]);

  const handleInputChange = (field: keyof BillData, value: string) => {
    setBillData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const calculateBill = () => {
    const totalBill = parseFloat(billData.totalBillAmount);
    const totalUnits = parseFloat(billData.totalConsumption);
    const lastReading = parseFloat(billData.neighborLastReading);
    const currentReading = parseFloat(billData.neighborCurrentReading);

    if (isNaN(totalBill) || isNaN(totalUnits) || isNaN(lastReading) || isNaN(currentReading)) {
      return null;
    }

    const neighborConsumption = currentReading - lastReading;
    const neighborShare = (neighborConsumption / totalUnits) * totalBill;

    return {
      neighborConsumption,
      neighborShare: Math.round(neighborShare),
      totalUnits,
    };
  };

  const calculation = calculateBill();

  const generateWhatsAppLink = () => {
    if (!calculation) {
      toast.error("Please fill in all fields with valid numbers");
      return;
    }

    const message = `Please pay Rs.${calculation.neighborShare} as last month's electricity bill. Your consumption: ${calculation.neighborConsumption} units/${calculation.totalUnits} units`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${billData.neighborPhone}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
    toast.success("WhatsApp link opened!");
  };

  const copyCurrentToLast = () => {
    if (billData.neighborCurrentReading) {
      handleInputChange("neighborLastReading", billData.neighborCurrentReading);
      toast.success("Current reading copied to last reading!");
    } else {
      toast.error("Please enter current reading first");
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Zap className="h-8 w-8 text-electric" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-electric to-accent bg-clip-text text-transparent">
              Bill Splitter
            </h1>
          </div>
          <p className="text-muted-foreground">
            Calculate and share electricity bill with your neighbor
          </p>
        </div>

        {/* Main Calculator Card */}
        <Card className="shadow-lg border-electric-light/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-electric">
              <Calculator className="h-5 w-5" />
              Bill Calculator
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Bill Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="totalBill">Total Bill Amount (₹)</Label>
                <Input
                  id="totalBill"
                  type="number"
                  placeholder="e.g., 2500"
                  value={billData.totalBillAmount}
                  onChange={(e) => handleInputChange("totalBillAmount", e.target.value)}
                  className="focus:ring-electric focus:border-electric"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="totalConsumption">Total Consumption (Units)</Label>
                <Input
                  id="totalConsumption"
                  type="number"
                  placeholder="e.g., 350"
                  value={billData.totalConsumption}
                  onChange={(e) => handleInputChange("totalConsumption", e.target.value)}
                  className="focus:ring-electric focus:border-electric"
                />
              </div>
            </div>

            {/* Neighbor Meter Readings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
              <div className="space-y-2">
                <Label htmlFor="lastReading">Neighbor's Last Reading</Label>
                <Input
                  id="lastReading"
                  type="number"
                  placeholder="e.g., 1200"
                  value={billData.neighborLastReading}
                  onChange={(e) => handleInputChange("neighborLastReading", e.target.value)}
                  className="focus:ring-electric focus:border-electric"
                />
              </div>
              
              <div className="hidden md:flex justify-center pb-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyCurrentToLast}
                  className="border-electric text-electric hover:bg-electric hover:text-white"
                  disabled={!billData.neighborCurrentReading}
                >
                  <ArrowDown className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="currentReading">Neighbor's Current Reading</Label>
                <Input
                  id="currentReading"
                  type="number"
                  placeholder="e.g., 1380"
                  value={billData.neighborCurrentReading}
                  onChange={(e) => handleInputChange("neighborCurrentReading", e.target.value)}
                  className="focus:ring-electric focus:border-electric"
                />
              </div>
              
              {/* Mobile copy button */}
              <div className="md:hidden flex justify-center col-span-full">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyCurrentToLast}
                  className="border-electric text-electric hover:bg-electric hover:text-white"
                  disabled={!billData.neighborCurrentReading}
                >
                  <ArrowDown className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="phone">Neighbor's Phone Number</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPhoneEdit(!showPhoneEdit)}
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
              {showPhoneEdit ? (
                <Input
                  id="phone"
                  type="tel"
                  value={billData.neighborPhone}
                  onChange={(e) => handleInputChange("neighborPhone", e.target.value)}
                  className="focus:ring-electric focus:border-electric"
                />
              ) : (
                <div className="p-3 bg-muted rounded-md text-sm font-mono">
                  +{billData.neighborPhone}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Results Card */}
        {calculation && (
          <Card className="shadow-lg border-success-light/20 bg-success-light/5">
            <CardHeader>
              <CardTitle className="text-success">Calculation Results</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-card rounded-lg border">
                  <p className="text-sm text-muted-foreground">Neighbor's Consumption</p>
                  <p className="text-2xl font-bold text-electric">
                    {calculation.neighborConsumption}
                  </p>
                  <p className="text-xs text-muted-foreground">units</p>
                </div>
                
                <div className="text-center p-4 bg-card rounded-lg border">
                  <p className="text-sm text-muted-foreground">Neighbor's Share</p>
                  <p className="text-2xl font-bold text-success">
                    ₹{calculation.neighborShare}
                  </p>
                </div>
                
                <div className="text-center p-4 bg-card rounded-lg border">
                  <p className="text-sm text-muted-foreground">Your Share</p>
                  <p className="text-2xl font-bold text-foreground">
                    ₹{parseFloat(billData.totalBillAmount) - calculation.neighborShare}
                  </p>
                </div>
              </div>

              <Button
                onClick={generateWhatsAppLink}
                className="w-full bg-success hover:bg-success/90 text-success-foreground"
                size="lg"
              >
                <Share2 className="h-5 w-5 mr-2" />
                Send WhatsApp Message
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default BillCalculator;