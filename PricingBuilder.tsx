"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
import {
  CheckIcon,
  PlusIcon,
  MinusIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react";
import { Badge } from "./ui/badge";
import { cn } from "../lib/utils";

// Base plans from screenshots
const basePlans = [
  {
    name: "Free",
    basePrice: 0,
    description: "Perfect for getting started",
    includedUsers: 1,
    includedStorage: 5,
    includedProjects: 3,
    features: [
      "View public bills and legislation",
      "Basic search functionality",
      "Read-only access to committee information",
      "Limited chat sessions (5 per month)",
    ],
    isCurrent: true,
  },
  {
    name: "Student",
    basePrice: 19,
    description: "Designed for students and academics",
    includedUsers: 1,
    includedStorage: 10,
    includedProjects: 10,
    features: [
      "All Free features",
      "Unlimited chat sessions",
      "Legislative draft creation (up to 5)",
      "Basic analysis tools",
      "Email support",
      "Student verification required",
    ],
  },
  {
    name: "Staffer",
    basePrice: 99,
    description: "Built for legislative staff",
    includedUsers: 3,
    includedStorage: 50,
    includedProjects: 25,
    features: [
      "All Student features",
      "Unlimited legislative drafts",
      "Co-authoring capabilities",
      "Advanced bill tracking",
      "Committee agenda access",
      "Priority email support",
    ],
    popular: true,
  },
  {
    name: "Researcher",
    basePrice: 149,
    description: "Advanced tools for researchers",
    includedUsers: 5,
    includedStorage: 100,
    includedProjects: 50,
    features: [
      "All Staffer features",
      "Advanced analytics dashboard",
      "Historical data access",
      "Export capabilities (PDF, CSV)",
      "API access (limited)",
      "Research templates",
    ],
  },
  {
    name: "Professional",
    basePrice: 299,
    description: "For professional advocates and consultants",
    includedUsers: 10,
    includedStorage: 200,
    includedProjects: 100,
    features: [
      "All Researcher features",
      "Full API access",
      "Custom integrations",
      "White-label options",
      "Priority support",
      "Advanced collaboration tools",
    ],
  },
  {
    name: "Enterprise",
    basePrice: 499,
    description: "Comprehensive solution for organizations",
    includedUsers: 25,
    includedStorage: 500,
    includedProjects: 250,
    features: [
      "All Professional features",
      "Multi-user management",
      "Custom workflows",
      "Dedicated account manager",
      "SLA guarantee",
      "Custom training sessions",
    ],
  },
  {
    name: "Government",
    basePrice: 2499,
    description: "Specialized for government entities",
    includedUsers: 100,
    includedStorage: 1000,
    includedProjects: 500,
    features: [
      "All Enterprise features",
      "Government-grade security",
      "Compliance reporting",
      "Custom government workflows",
      "On-premise deployment options",
      "Government verification required",
    ],
  },
];

// Add-ons
const addOns = [
  {
    id: "additional-users",
    name: "Additional Users",
    description: "Add more users to your plan",
    pricePerUnit: 15,
    unit: "user",
  },
  {
    id: "additional-storage",
    name: "Additional Storage",
    description: "Add more storage to your plan",
    pricePerUnit: 8,
    unit: "100GB",
  },
  {
    id: "premium-support",
    name: "Premium Support",
    description:
      "Get faster response times and dedicated support",
    price: 79,
  },
  {
    id: "custom-training",
    name: "Custom Training",
    description: "Personalized training sessions for your team",
    price: 299,
  },
];

export default function PricingBuilder() {
  const [selectedPlan, setSelectedPlan] = useState(
    basePlans[2],
  ); // Default to Staffer
  const [additionalUsers, setAdditionalUsers] = useState(0);
  const [additionalStorage, setAdditionalStorage] = useState(0);
  const [selectedAddOns, setSelectedAddOns] = useState<
    string[]
  >([]);
  const [billingPeriod, setBillingPeriod] = useState<
    "monthly" | "annually"
  >("monthly");

  // Calculate total price
  const calculateTotalPrice = () => {
    let total = selectedPlan.basePrice;

    // Add cost for additional users
    total += additionalUsers * 15;

    // Add cost for additional storage
    total += additionalStorage * 8;

    // Add cost for selected add-ons
    selectedAddOns.forEach((id) => {
      const addOn = addOns.find((a) => a.id === id);
      if (addOn && addOn.price) {
        total += addOn.price;
      }
    });

    // Apply annual discount
    if (billingPeriod === "annually") {
      total = total * 12 * 0.8; // 20% discount
    }

    return total;
  };

  // Toggle add-on selection
  const toggleAddOn = (id: string) => {
    setSelectedAddOns((prev) =>
      prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id],
    );
  };

  // Format price with commas
  const formatPrice = (price: number) => {
    return price.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  return (
    <section className="w-full py-12 md:py-24 lg:py-32">
      <div className="container mx-auto px-4 md:px-6 2xl:max-w-[1400px]">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Build Your Perfect Plan
            </h2>
            <p className="text-muted-foreground mx-auto max-w-[700px] md:text-xl/relaxed">
              Customize your plan to fit your exact needs. Only
              pay for what you use.
            </p>
          </div>
        </div>

        <div className="mx-auto mt-12 max-w-7xl">
          <Tabs
            defaultValue="monthly"
            className="w-full"
            onValueChange={(value) =>
              setBillingPeriod(value as "monthly" | "annually")
            }
          >
            <div className="flex justify-center">
              <TabsList className="mb-8">
                <TabsTrigger value="monthly">
                  Monthly
                </TabsTrigger>
                <TabsTrigger value="annually">
                  Annually (Save 20%)
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
              <div className="space-y-8">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium">
                      1. Choose your base plan
                    </h3>
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                      <ChevronLeftIcon className="h-4 w-4" />
                      <span>Scroll to see all plans</span>
                      <ChevronRightIcon className="h-4 w-4" />
                    </div>
                  </div>

                  {/* Horizontal scrolling cards with proper top padding for badges */}
                  <div className="relative -mx-6 px-6">
                    <div className="flex gap-4 overflow-x-auto pt-8 pb-6 scrollbar-hide px-6">
                      {basePlans.map((plan) => (
                        <Card
                          key={plan.name}
                          className={cn(
                            "min-w-[280px] flex-shrink-0 cursor-pointer transition-all hover:shadow-md relative",
                            selectedPlan.name === plan.name &&
                              "ring-2 ring-primary bg-primary/5",
                            plan.popular &&
                              "ring-2 ring-primary",
                          )}
                          onClick={() => setSelectedPlan(plan)}
                        >
                          <CardHeader className="pb-6 relative">
                            {plan.popular && (
                              <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground z-10">
                                Most Popular
                              </Badge>
                            )}
                            {plan.isCurrent && (
                              <Badge
                                variant="secondary"
                                className="absolute -top-2 left-1/2 transform -translate-x-1/2 z-10"
                              >
                                Current
                              </Badge>
                            )}
                            <CardTitle className="text-2xl">
                              {plan.name}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-6">
                            <div>
                              <div className="text-4xl font-bold">
                                {formatPrice(plan.basePrice)}
                                <span className="text-lg font-normal text-muted-foreground">
                                  /
                                  {billingPeriod === "monthly"
                                    ? "mo"
                                    : "yr"}
                                </span>
                              </div>
                              <p className="text-muted-foreground mt-2">
                                {plan.description}
                              </p>
                            </div>

                            <div className="space-y-3">
                              <div className="flex justify-between">
                                <span>Users</span>
                                <span className="font-medium">
                                  {plan.includedUsers}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>Storage</span>
                                <span className="font-medium">
                                  {plan.includedStorage}GB
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>Projects</span>
                                <span className="font-medium">
                                  {plan.includedProjects}
                                </span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    {/* Enhanced scroll indicators with better positioning */}
                    <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-background to-transparent pointer-events-none" />
                    <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-background to-transparent pointer-events-none" />
                  </div>

                  {/* Scroll dots indicator */}
                  <div className="flex justify-center mt-4 gap-2">
                    {basePlans.map((_, index) => (
                      <div
                        key={index}
                        className={cn(
                          "h-2 w-2 rounded-full transition-colors",
                          index < 3 ? "bg-primary" : "bg-muted",
                        )}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="mb-4 text-lg font-medium">
                    2. Customize your plan
                  </h3>
                  <Card className="p-0">
                    <CardContent className="space-y-6 py-6">
                      <div>
                        <div className="mb-2 flex items-center justify-between">
                          <Label>Additional Users</Label>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() =>
                                setAdditionalUsers(
                                  Math.max(
                                    0,
                                    additionalUsers - 1,
                                  ),
                                )
                              }
                              disabled={additionalUsers === 0}
                            >
                              <MinusIcon className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center">
                              {additionalUsers}
                            </span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() =>
                                setAdditionalUsers(
                                  additionalUsers + 1,
                                )
                              }
                            >
                              <PlusIcon className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <div className="text-muted-foreground text-xs">
                          ${addOns[0].pricePerUnit} per
                          additional user per month
                        </div>
                      </div>

                      <div>
                        <div className="mb-2 flex items-center justify-between">
                          <Label>Additional Storage</Label>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() =>
                                setAdditionalStorage(
                                  Math.max(
                                    0,
                                    additionalStorage - 1,
                                  ),
                                )
                              }
                              disabled={additionalStorage === 0}
                            >
                              <MinusIcon className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center">
                              {additionalStorage}
                            </span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() =>
                                setAdditionalStorage(
                                  additionalStorage + 1,
                                )
                              }
                            >
                              <PlusIcon className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <div className="text-muted-foreground text-xs">
                          ${addOns[1].pricePerUnit} per
                          additional {addOns[1].unit} per month
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <h3 className="mb-4 text-lg font-medium">
                    3. Select add-ons
                  </h3>
                  <Card className="p-0">
                    <CardContent className="space-y-4 py-6">
                      {addOns.slice(2).map((addOn) => (
                        <div
                          key={addOn.id}
                          className="flex items-start space-x-3"
                        >
                          <Checkbox
                            id={addOn.id}
                            checked={selectedAddOns.includes(
                              addOn.id,
                            )}
                            onCheckedChange={() =>
                              toggleAddOn(addOn.id)
                            }
                          />
                          <div className="flex-1">
                            <Label
                              htmlFor={addOn.id}
                              className="cursor-pointer text-sm font-medium"
                            >
                              {addOn.name} - ${addOn.price}
                              /month
                            </Label>
                            <p className="text-muted-foreground text-xs">
                              {addOn.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div className="space-y-8">
                <div className="sticky top-4">
                  <h3 className="mb-4 text-lg font-medium">
                    Your Custom Plan
                  </h3>
                  <Card>
                    <CardHeader>
                      <CardTitle>
                        {selectedPlan.name} Plan
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Base Plan</span>
                          <span>
                            {formatPrice(
                              selectedPlan.basePrice,
                            )}
                          </span>
                        </div>
                        {additionalUsers > 0 && (
                          <div className="flex justify-between">
                            <span>
                              Additional Users (
                              {additionalUsers})
                            </span>
                            <span>
                              {formatPrice(
                                additionalUsers * 15,
                              )}
                            </span>
                          </div>
                        )}
                        {additionalStorage > 0 && (
                          <div className="flex justify-between">
                            <span>
                              Additional Storage (
                              {additionalStorage * 100}GB)
                            </span>
                            <span>
                              {formatPrice(
                                additionalStorage * 8,
                              )}
                            </span>
                          </div>
                        )}
                        {selectedAddOns.map((id) => {
                          const addOn = addOns.find(
                            (a) => a.id === id,
                          );
                          if (addOn && addOn.price) {
                            return (
                              <div
                                key={id}
                                className="flex justify-between"
                              >
                                <span>{addOn.name}</span>
                                <span>
                                  {formatPrice(addOn.price)}
                                </span>
                              </div>
                            );
                          }
                          return null;
                        })}
                      </div>

                      <div className="border-t pt-4">
                        <div className="flex justify-between font-medium">
                          <span>
                            Total{" "}
                            {billingPeriod === "annually" &&
                              "(per year)"}
                          </span>
                          <span>
                            {formatPrice(calculateTotalPrice())}
                          </span>
                        </div>
                        {billingPeriod === "annually" && (
                          <div className="text-muted-foreground mt-1 text-right text-xs">
                            Includes 20% annual discount
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-medium">
                          Included Features:
                        </h4>
                        <ul className="space-y-1 text-sm">
                          {selectedPlan.features.map(
                            (feature) => (
                              <li
                                key={feature}
                                className="flex items-start"
                              >
                                <CheckIcon className="text-primary mr-2 h-4 w-4 mt-0.5 flex-shrink-0" />
                                <span>{feature}</span>
                              </li>
                            ),
                          )}
                          {additionalUsers > 0 && (
                            <li className="flex items-center">
                              <CheckIcon className="text-primary mr-2 h-4 w-4" />
                              <span>
                                {selectedPlan.includedUsers +
                                  additionalUsers}{" "}
                                total users
                              </span>
                            </li>
                          )}
                          {additionalStorage > 0 && (
                            <li className="flex items-center">
                              <CheckIcon className="text-primary mr-2 h-4 w-4" />
                              <span>
                                {selectedPlan.includedStorage +
                                  additionalStorage * 100}
                                GB total storage
                              </span>
                            </li>
                          )}
                          {selectedAddOns.map((id) => {
                            const addOn = addOns.find(
                              (a) => a.id === id,
                            );
                            if (addOn) {
                              return (
                                <li
                                  key={id}
                                  className="flex items-center"
                                >
                                  <CheckIcon className="text-primary mr-2 h-4 w-4" />
                                  <span>{addOn.name}</span>
                                </li>
                              );
                            }
                            return null;
                          })}
                        </ul>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button
                        className="w-full"
                        onClick={() =>
                          alert(
                            "Get Started clicked! In a real app, this would redirect to signup.",
                          )
                        }
                      >
                        {selectedPlan.name === "Free"
                          ? "Get Started"
                          : "Upgrade"}
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              </div>
            </div>
          </Tabs>
        </div>

        <div className="bg-muted/30 mx-auto mt-16 max-w-3xl rounded-lg border p-8 text-center">
          <h3 className="text-xl font-medium">
            Need a more customized solution?
          </h3>
          <p className="text-muted-foreground mt-2">
            Contact our sales team for a personalized quote
            tailored to your specific requirements.
          </p>
          <Button
            className="mt-6"
            variant="outline"
            onClick={() =>
              alert(
                "Contact Sales clicked! In a real app, this would open a contact form.",
              )
            }
          >
            Contact Sales
          </Button>
        </div>
      </div>
    </section>
  );
}