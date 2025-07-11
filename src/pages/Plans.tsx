import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SubscriptionPlans } from '@/components/SubscriptionPlans';
import { PricingBuilder } from '@/components/PricingBuilder';

export default function Plans() {
  return (
    <div className="page-container">
      <div className="content-wrapper">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Subscription Plans</h1>
            <p className="text-muted-foreground mt-2">
              Choose from our standard plans or build a custom solution that fits your needs.
            </p>
          </div>

          <Tabs defaultValue="standard" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="standard">Standard Plans</TabsTrigger>
              <TabsTrigger value="custom">Custom Plan Builder</TabsTrigger>
            </TabsList>
            
            <TabsContent value="standard" className="mt-6">
              <SubscriptionPlans />
            </TabsContent>
            
            <TabsContent value="custom" className="mt-6">
              <PricingBuilder />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}