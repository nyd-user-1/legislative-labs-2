import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Trash2, Plus } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { useToast } from '@/hooks/use-toast';

interface PricingFeature {
  id: string;
  name: string;
  included: boolean;
}

interface CustomPlan {
  name: string;
  monthlyPrice: number;
  annualPrice: number;
  features: PricingFeature[];
  isCustom: boolean;
}

const defaultFeatures: PricingFeature[] = [
  { id: '1', name: 'Legislative Research Access', included: true },
  { id: '2', name: 'Bill Tracking', included: true },
  { id: '3', name: 'Committee Information', included: true },
  { id: '4', name: 'Member Directory', included: true },
  { id: '5', name: 'Advanced Analytics', included: false },
  { id: '6', name: 'Custom Reports', included: false },
  { id: '7', name: 'API Access', included: false },
  { id: '8', name: 'Priority Support', included: false },
];

export function PricingBuilder() {
  const { createCheckout } = useSubscription();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const [customPlan, setCustomPlan] = useState<CustomPlan>({
    name: 'Custom Plan',
    monthlyPrice: 19,
    annualPrice: 190,
    features: [...defaultFeatures],
    isCustom: true,
  });

  const [newFeatureName, setNewFeatureName] = useState('');

  const handleFeatureToggle = (featureId: string) => {
    setCustomPlan(prev => ({
      ...prev,
      features: prev.features.map(feature =>
        feature.id === featureId 
          ? { ...feature, included: !feature.included }
          : feature
      )
    }));
  };

  const handleAddFeature = () => {
    if (!newFeatureName.trim()) return;
    
    const newFeature: PricingFeature = {
      id: Date.now().toString(),
      name: newFeatureName.trim(),
      included: true,
    };
    
    setCustomPlan(prev => ({
      ...prev,
      features: [...prev.features, newFeature]
    }));
    
    setNewFeatureName('');
  };

  const handleRemoveFeature = (featureId: string) => {
    setCustomPlan(prev => ({
      ...prev,
      features: prev.features.filter(feature => feature.id !== featureId)
    }));
  };

  const handlePriceChange = (field: 'monthlyPrice' | 'annualPrice', value: string) => {
    const numValue = parseFloat(value) || 0;
    setCustomPlan(prev => ({
      ...prev,
      [field]: numValue
    }));
  };

  const calculateMonthlySavings = () => {
    const annualMonthly = customPlan.annualPrice / 12;
    const savings = customPlan.monthlyPrice - annualMonthly;
    return savings > 0 ? savings.toFixed(2) : '0.00';
  };

  const handleSubscribe = async (isAnnual: boolean) => {
    try {
      setIsLoading(true);
      // For now, we'll use a placeholder tier - in a real implementation, 
      // you'd create a custom Stripe price for the custom plan
      await createCheckout('professional', isAnnual ? 'annually' : 'monthly');
      toast({
        title: 'Redirecting to checkout',
        description: 'You will be redirected to complete your custom plan purchase.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create checkout session. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const includedFeatures = customPlan.features.filter(f => f.included);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Build Your Custom Plan</h2>
        <p className="text-muted-foreground">
          Create a pricing plan tailored to your specific needs and requirements.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Plan Builder */}
        <Card>
          <CardHeader>
            <CardTitle>Plan Configuration</CardTitle>
            <CardDescription>
              Customize your plan name, pricing, and features
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Plan Name */}
            <div className="space-y-2">
              <Label htmlFor="plan-name">Plan Name</Label>
              <Input
                id="plan-name"
                value={customPlan.name}
                onChange={(e) => setCustomPlan(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter plan name"
              />
            </div>

            {/* Pricing */}
            <div className="space-y-4">
              <h4 className="font-medium">Pricing</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="monthly-price">Monthly Price ($)</Label>
                  <Input
                    id="monthly-price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={customPlan.monthlyPrice}
                    onChange={(e) => handlePriceChange('monthlyPrice', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="annual-price">Annual Price ($)</Label>
                  <Input
                    id="annual-price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={customPlan.annualPrice}
                    onChange={(e) => handlePriceChange('annualPrice', e.target.value)}
                  />
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                Annual savings: ${calculateMonthlySavings()}/month
              </div>
            </div>

            {/* Features */}
            <div className="space-y-4">
              <h4 className="font-medium">Features</h4>
              
              {/* Add New Feature */}
              <div className="flex gap-2">
                <Input
                  placeholder="Add new feature"
                  value={newFeatureName}
                  onChange={(e) => setNewFeatureName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddFeature()}
                />
                <Button onClick={handleAddFeature} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {/* Feature List */}
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {customPlan.features.map((feature) => (
                  <div
                    key={feature.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <Switch
                        checked={feature.included}
                        onCheckedChange={() => handleFeatureToggle(feature.id)}
                      />
                      <span className={!feature.included ? 'text-muted-foreground' : ''}>
                        {feature.name}
                      </span>
                    </div>
                    {!defaultFeatures.some(df => df.id === feature.id) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveFeature(feature.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Plan Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              {customPlan.name}
              <Badge variant="secondary">Custom</Badge>
            </CardTitle>
            <CardDescription>
              Preview of your custom pricing plan
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Pricing Display */}
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold">
                ${customPlan.monthlyPrice}
                <span className="text-base font-normal text-muted-foreground">/month</span>
              </div>
              <div className="text-sm text-muted-foreground">
                or ${customPlan.annualPrice}/year (save ${calculateMonthlySavings()}/month)
              </div>
            </div>

            <Separator />

            {/* Features List */}
            <div className="space-y-3">
              <h4 className="font-medium">Included Features ({includedFeatures.length})</h4>
              <div className="space-y-2">
                {includedFeatures.map((feature) => (
                  <div key={feature.id} className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full" />
                    <span className="text-sm">{feature.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button 
                className="w-full" 
                onClick={() => handleSubscribe(false)}
                disabled={isLoading}
              >
                Subscribe Monthly - ${customPlan.monthlyPrice}/month
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => handleSubscribe(true)}
                disabled={isLoading}
              >
                Subscribe Annually - ${customPlan.annualPrice}/year
              </Button>
            </div>

            <div className="text-xs text-muted-foreground text-center">
              Custom plans are processed as Professional tier subscriptions. 
              Contact support to implement your specific feature set.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}